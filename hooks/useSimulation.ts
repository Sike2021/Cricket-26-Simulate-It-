import React, { useCallback } from 'react';
import { GameData, Format, PlayerRole, MatchResult, Inning, BattingPerformance, BowlingPerformance, Team, Match, Player } from '../types';
import { PITCH_MODIFIERS, formatOvers, getPlayerById, generateAutoXI, getBatterTier, BATTING_PROFILES, calculatePopularityPoints } from '../utils';
import { generateSingleFormatInitialStats } from '../data';

export const useSimulation = (gameData: GameData, setGameData: React.Dispatch<React.SetStateAction<GameData | null>>) => {
    const simulateInning = useCallback((battingTeam: Team, bowlingTeam: Team, format: Format, target: number | null, pitch: string, groundCode: string, inningNumber: number, allPlayers: Player[]): Inning => {
        const pitchMods = PITCH_MODIFIERS[pitch as keyof typeof PITCH_MODIFIERS] || PITCH_MODIFIERS["Balanced Sporting Pitch"];
        const formatMods = pitchMods[format];
        let score = 0, wickets = 0, balls = 0, extras = 0;
        
        // Determine max balls based on format - STRICTOR LIMITS
        const isT20 = format.includes('T20');
        const isODI = format.includes('One-Day') || format.includes('List-A');
        const maxBalls = (isT20 ? 20 : isODI ? 50 : 90) * 6;
        
        let limits: any = null;
        const groundLimits = gameData.scoreLimits?.[groundCode];
        if (groundLimits) {
            const formatLimits = groundLimits[format];
            if (formatLimits) {
                limits = formatLimits[inningNumber];
            }
        }
        const maxWicketsForInning = (limits?.maxWickets && limits.maxWickets > 0 && limits.maxWickets <= 10) ? limits.maxWickets : 10;

        const battingLineup: BattingPerformance[] = battingTeam.squad.map(p => { 
            const d = getPlayerById(p.id, allPlayers); 
            return { 
                playerId: d.id, 
                playerName: d.name, 
                runs: 0, 
                balls: 0, 
                fours: 0, 
                sixes: 0, 
                isOut: false, 
                dismissalText: 'not out', 
                dismissal: { type: 'not out', bowlerId: '' }, 
                ballsToFifty: 0, 
                ballsToHundred: 0 
            }; 
        });
        
        const bowlingLineup = bowlingTeam.squad.filter(p => [PlayerRole.FAST_BOWLER, PlayerRole.SPIN_BOWLER, PlayerRole.ALL_ROUNDER].includes(getPlayerById(p.id, allPlayers).role)).map(p => { const d = getPlayerById(p.id, allPlayers); return { playerId: d.id, playerName: d.name, overs: '0.0', maidens: 0, runsConceded: 0, wickets: 0, ballsBowled: 0 } });
        if (bowlingLineup.length === 0) { const p = getPlayerById(bowlingTeam.squad[0].id, allPlayers); bowlingLineup.push({ playerId: p.id, playerName: p.name, overs: '0.0', maidens: 0, runsConceded: 0, wickets: 0, ballsBowled: 0 }); }

        let onStrikeBatterIndex = 0, offStrikeBatterIndex = 1, bowlerIndex = 0, runsThisOver = 0;

        while (balls < maxBalls && wickets < maxWicketsForInning) {
            if (target && score > target) break;
            if (limits?.maxRuns && limits.maxRuns > 0 && score >= limits.maxRuns) break;

            const onStrikeBatter = battingLineup[onStrikeBatterIndex];
            if (!onStrikeBatter) break; 
            const onStrikeBatterDetails = getPlayerById(onStrikeBatter.playerId, allPlayers);
            const currentBowler = bowlingLineup[bowlerIndex];
            const bowlerDetails = getPlayerById(currentBowler.playerId, allPlayers);

            let batterProfile;
            const customProfile = onStrikeBatterDetails.customProfiles?.[format];
            if (customProfile && customProfile.avg > 0 && customProfile.sr > 0) {
                batterProfile = customProfile;
            } else {
                const batterTier = getBatterTier(onStrikeBatterDetails.battingSkill);
                const batterStyle = onStrikeBatterDetails.style;
                // @ts-ignore
                batterProfile = BATTING_PROFILES[format][batterTier][batterStyle] || BATTING_PROFILES[format][batterTier]['N'];
            }

            const expectedRunsPerBall = (batterProfile.sr / 100) * (target !== null ? pitchMods.chasePenalty : 1);
            const baseWicketProb = batterProfile.avg > 0 ? expectedRunsPerBall / batterProfile.avg : 0.05;
            
            let wicketProbability = baseWicketProb 
                + ((bowlerDetails.secondarySkill - onStrikeBatterDetails.battingSkill) / 500) 
                + (bowlerDetails.role === PlayerRole.FAST_BOWLER ? pitchMods.paceBonus / 2 : 0) 
                + (bowlerDetails.role === PlayerRole.SPIN_BOWLER ? pitchMods.spinBonus / 2 : 0);
            
            wicketProbability *= formatMods.wicketChance;
            wicketProbability = Math.max(0.005, Math.min(0.5, wicketProbability));

            balls++;
            onStrikeBatter.balls++;
            currentBowler.ballsBowled++;

            if (Math.random() < wicketProbability) {
                wickets++;
                onStrikeBatter.isOut = true;
                onStrikeBatter.dismissal = { type: 'bowled', bowlerId: currentBowler.playerId };
                onStrikeBatter.dismissalText = `b ${currentBowler.playerName}`;
                currentBowler.wickets++;
                onStrikeBatterIndex = Math.max(onStrikeBatterIndex, offStrikeBatterIndex) + 1;
            } else {
                let runsScored = 0;
                let p_dot = 0.45, p_1 = 0.38, p_2 = 0.08, p_3 = 0.02, p_4 = 0.06, p_6 = 0.01;
                
                switch (onStrikeBatterDetails.style) {
                    case 'A': p_dot = 0.30; p_1 = 0.25; p_2 = 0.10; p_3 = 0.05; p_4 = 0.20; p_6 = 0.10; break;
                    case 'D': p_dot = 0.55; p_1 = 0.35; p_2 = 0.05; p_3 = 0.02; p_4 = 0.03; p_6 = 0.00; break;
                }

                const baseERPB = (p_1 * 1) + (p_2 * 2) + (p_3 * 3) + (p_4 * 4) + (p_6 * 6);
                const targetScoringERPB = expectedRunsPerBall / (1 - wicketProbability);
                const scalingFactor = baseERPB > 0 ? targetScoringERPB / baseERPB : 1;

                let p_4_scaled = p_4 * scalingFactor;
                let p_6_scaled = p_6 * scalingFactor;
                let p_2_scaled = p_2 * Math.sqrt(scalingFactor);
                let p_3_scaled = p_3 * Math.sqrt(scalingFactor);
                
                const p_scoring_new_sum = p_1 + p_2_scaled + p_3_scaled + p_4_scaled + p_6_scaled;
                let p_dot_scaled = 1 - p_scoring_new_sum;
                
                if (p_dot_scaled < 0) { p_1 += p_dot_scaled; p_dot_scaled = 0; if (p_1 < 0) p_1 = 0; }

                const totalProb = p_dot_scaled + p_1 + p_2_scaled + p_3_scaled + p_4_scaled + p_6_scaled;
                const scoringRandom = Math.random() * totalProb;
                
                const c_dot = p_dot_scaled;
                const c_1 = c_dot + p_1;
                const c_2 = c_1 + p_2_scaled;
                const c_3 = c_2 + p_3_scaled;
                const c_4 = c_3 + p_4_scaled;

                if (scoringRandom < c_dot) runsScored = 0;
                else if (scoringRandom < c_1) runsScored = 1;
                else if (scoringRandom < c_2) runsScored = 2;
                else if (scoringRandom < c_3) runsScored = 3;
                else if (scoringRandom < c_4) runsScored = 4;
                else runsScored = 6;

                const oldRuns = onStrikeBatter.runs;
                onStrikeBatter.runs += runsScored;

                if (oldRuns < 50 && onStrikeBatter.runs >= 50 && !onStrikeBatter.ballsToFifty) { onStrikeBatter.ballsToFifty = onStrikeBatter.balls; }
                if (oldRuns < 100 && onStrikeBatter.runs >= 100 && !onStrikeBatter.ballsToHundred) { onStrikeBatter.ballsToHundred = onStrikeBatter.balls; }

                score += runsScored;
                currentBowler.runsConceded += runsScored;
                runsThisOver += runsScored;
                if (runsScored === 4) onStrikeBatter.fours++;
                if (runsScored === 6) onStrikeBatter.sixes++;
                
                if (runsScored % 2 !== 0) { [onStrikeBatterIndex, offStrikeBatterIndex] = [offStrikeBatterIndex, onStrikeBatterIndex]; }
            }

            if (balls % 6 === 0) {
                if (runsThisOver === 0) currentBowler.maidens++;
                runsThisOver = 0;
                [onStrikeBatterIndex, offStrikeBatterIndex] = [offStrikeBatterIndex, onStrikeBatterIndex];
                
                const maxOversPerBowler = isT20 ? 4 : isODI ? 10 : Infinity;
                const originalBowlerIndex = bowlerIndex;
                let potentialNextBowlerIndex = (bowlerIndex + 1) % bowlingLineup.length;
                
                while (bowlingLineup[potentialNextBowlerIndex].ballsBowled >= maxOversPerBowler * 6) {
                    potentialNextBowlerIndex = (potentialNextBowlerIndex + 1) % bowlingLineup.length;
                    if (potentialNextBowlerIndex === originalBowlerIndex) {
                        potentialNextBowlerIndex = (originalBowlerIndex + 1) % bowlingLineup.length;
                        break;
                    }
                }
                bowlerIndex = potentialNextBowlerIndex;
            }
        }

        return { 
            teamId: battingTeam.id, 
            teamName: battingTeam.name, 
            score, 
            wickets, 
            overs: formatOvers(balls), 
            extras, 
            batting: battingLineup.slice(0, Math.min(battingLineup.length, wickets + 2)), 
            bowling: bowlingLineup.map(b => ({...b, overs: formatOvers(b.ballsBowled)})) 
        };
    }, [gameData.scoreLimits]);

    const runLimitedOversMatchSimulation = useCallback((match: Match, teamAPlayers: Player[], teamBPlayers: Player[], gameData: GameData): MatchResult => {
        const allPlayersInMatch = [...teamAPlayers, ...teamBPlayers]; 
        const teamAData = gameData.teams.find(t => t.name === match.teamA); 
        const teamBData = gameData.teams.find(t => t.name === match.teamB);
        if(!teamAData || !teamBData) throw new Error(`Could not find team data for match: ${match.teamA} vs ${match.teamB}`);
        
        const teamA = { ...teamAData, squad: teamAPlayers }; 
        const teamB = { ...teamBData, squad: teamBPlayers };

        const homeGround = gameData.grounds.find(g => g.code === gameData.allTeamsData.find(t => t.name === match.teamA)?.homeGround); 
        const pitch = homeGround?.pitch || "Balanced Sporting Pitch";
        const groundCode = homeGround?.code || "KCG";

        const firstInning = simulateInning(teamA, teamB, gameData.currentFormat, null, pitch, groundCode, 1, allPlayersInMatch);
        const secondInning = simulateInning(teamB, teamA, gameData.currentFormat, firstInning.score, pitch, groundCode, 2, allPlayersInMatch);

        let winnerId: string | null = null, loserId: string | null = null, summary = '';

        if (secondInning.score > firstInning.score) {
            winnerId = teamB.id; loserId = teamA.id; summary = `${teamB.name} won by ${10 - secondInning.wickets} wickets.`;
        } else if (firstInning.score > secondInning.score) {
            winnerId = teamA.id; loserId = teamB.id; summary = `${teamA.name} won by ${firstInning.score - secondInning.score} runs.`;
        } else { 
            if (match.group !== 'Round-Robin') {
                const teamAIndex = gameData.standings[gameData.currentFormat].findIndex(s => s.teamId === teamA.id);
                const teamBIndex = gameData.standings[gameData.currentFormat].findIndex(s => s.teamId === teamB.id);
                if (teamAIndex < teamBIndex) {
                    winnerId = teamA.id; loserId = teamB.id; summary = `Match Tied (${teamA.name} won on higher league position)`;
                } else {
                    winnerId = teamB.id; loserId = teamA.id; summary = `Match Tied (${teamB.name} won on higher league position)`;
                }
            } else {
                summary = "Match Tied."; winnerId = null; loserId = null;
            }
        }

        let motm = { playerId: '', playerName: '', teamId: '', summary: '' }, bestScore = -1;
        for (const p of firstInning.batting) { const s = p.runs + (p.runs >= 50 ? 25 : 0) + (p.runs >= 100 ? 50 : 0); if (s > bestScore) { bestScore = s; motm = { playerId: p.playerId, playerName: p.playerName, teamId: teamA.id, summary: `${p.runs}(${p.balls})` }; } }
        for (const p of secondInning.batting) { const s = p.runs * 1.2 + (p.runs >= 50 ? 30 : 0) + (p.runs >= 100 ? 60 : 0); if (s > bestScore) { bestScore = s; motm = { playerId: p.playerId, playerName: p.playerName, teamId: teamB.id, summary: `${p.runs}(${p.balls})` }; } }
        for (const p of firstInning.bowling) { const s = p.wickets * 25 + (p.wickets >= 3 ? 25 : 0) + (p.wickets >= 5 ? 50 : 0) - p.runsConceded * 0.5; if (s > bestScore) { bestScore = s; motm = { playerId: p.playerId, playerName: p.playerName, teamId: teamB.id, summary: `${p.wickets}/${p.runsConceded}` }; } }
        for (const p of secondInning.bowling) { const s = p.wickets * 20 + (p.wickets >= 3 ? 20 : 0) + (p.wickets >= 5 ? 40 : 0) - p.runsConceded * 0.5; if (s > bestScore) { bestScore = s; motm = { playerId: p.playerId, playerName: p.playerName, teamId: teamA.id, summary: `${p.wickets}/${p.runsConceded}` }; } }

        return { matchNumber: match.matchNumber, winnerId, loserId, summary, firstInning, secondInning, manOfTheMatch: motm };
    }, [simulateInning]);

    const runFirstClassMatchSimulation = useCallback((match: Match, teamAPlayers: Player[], teamBPlayers: Player[], gameData: GameData): MatchResult => {
        const allPlayersInMatch = [...teamAPlayers, ...teamBPlayers]; 
        const teamAData = gameData.teams.find(t => t.name === match.teamA); 
        const teamBData = gameData.teams.find(t => t.name === match.teamB);
        if(!teamAData || !teamBData) throw new Error(`Could not find team data for match: ${match.teamA} vs ${match.teamB}`);
        
        const teamA = { ...teamAData, squad: teamAPlayers }; 
        const teamB = { ...teamBData, squad: teamBPlayers };

        const homeGround = gameData.grounds.find(g => g.code === gameData.allTeamsData.find(t => t.name === match.teamA)?.homeGround); 
        const pitch = homeGround?.pitch || "Balanced Sporting Pitch";
        const groundCode = homeGround?.code || "KCG";

        // First-Class Simulation: Multi-innings
        const firstInning = simulateInning(teamA, teamB, gameData.currentFormat, null, pitch, groundCode, 1, allPlayersInMatch);
        const secondInning = simulateInning(teamB, teamA, gameData.currentFormat, null, pitch, groundCode, 2, allPlayersInMatch);
        const thirdInning = simulateInning(teamA, teamB, gameData.currentFormat, null, pitch, groundCode, 3, allPlayersInMatch);
        const fourthInning = simulateInning(teamB, teamA, gameData.currentFormat, (firstInning.score + thirdInning.score - secondInning.score), pitch, groundCode, 4, allPlayersInMatch);

        let winnerId: string | null = null, loserId: string | null = null, isDraw = false, summary = '';
        const target = firstInning.score + thirdInning.score - secondInning.score + 1;
        
        if (fourthInning.score >= target) {
            winnerId = teamB.id; loserId = teamA.id; summary = `${teamB.name} won by ${10 - fourthInning.wickets} wickets.`;
        } else if (fourthInning.wickets >= 10) {
            winnerId = teamA.id; loserId = teamB.id; summary = `${teamA.name} won by ${target - 1 - fourthInning.score} runs.`;
        } else {
            isDraw = true; summary = 'Match Drawn.'; winnerId = null; loserId = null;
        }

        let motm = { playerId: '', playerName: '', teamId: '', summary: '' }, bestScore = -1;
        [firstInning, secondInning, thirdInning, fourthInning].forEach((inning, idx) => { 
            const btid = idx % 2 === 0 ? teamA.id : teamB.id; 
            const f_tid = idx % 2 === 0 ? teamB.id : teamA.id; 
            if (inning) {
                 for (const p of inning.batting) { const s = p.runs * 1.5 + (p.runs >= 50 ? 50 : 0) + (p.runs >= 100 ? 100 : 0); if (s > bestScore) { bestScore = s; motm = { playerId: p.playerId, playerName: p.playerName, teamId: btid, summary: `${p.runs}(${p.balls})` }; } } 
                 for (const p of inning.bowling) { const s = p.wickets * 30 + (p.wickets >= 3 ? 30 : 0) + (p.wickets >= 5 ? 75 : 0) - p.runsConceded * 0.5; if (s > bestScore) { bestScore = s; motm = { playerId: p.playerId, playerName: p.playerName, teamId: f_tid, summary: `${p.wickets}/${p.runsConceded}` }; } } 
            }
        });

        return { matchNumber: match.matchNumber, winnerId, loserId, isDraw, summary, firstInning, secondInning, thirdInning, fourthInning, manOfTheMatch: motm };
    }, [simulateInning]);

    const runSimulationForCurrentFormat = useCallback((match: Match, gameData: GameData) => {
        const teamAData = gameData.teams.find(t => t.name === match.teamA); 
        const teamBData = gameData.teams.find(t => t.name === match.teamB);
        if (!teamAData || !teamBData) throw new Error(`Team data not found for match: ${match.teamA} vs ${match.teamB}`);

        const getPlayingXI = (team: Team) => {
            const customXI = gameData.playingXIs[team.id]?.[gameData.currentFormat];
            if (customXI && customXI.length === 11) {
                const xiPlayers = customXI.map(id => team.squad.find(p => p.id === id)).filter(Boolean) as Player[];
                if (xiPlayers.length === 11) return xiPlayers;
            }
            return generateAutoXI(team.squad, gameData.currentFormat);
        };

        const teamAPlayers = getPlayingXI(teamAData); 
        const teamBPlayers = getPlayingXI(teamBData);

        return (gameData.currentFormat.includes('First-Class')) 
            ? runFirstClassMatchSimulation(match, teamAPlayers, teamBPlayers, gameData) 
            : runLimitedOversMatchSimulation(match, teamAPlayers, teamBPlayers, gameData);
    }, [runLimitedOversMatchSimulation, runFirstClassMatchSimulation]);

    const updateStatsFromMatch = useCallback((result: MatchResult, format: Format, gameData: GameData): GameData => {
        const newGameData = JSON.parse(JSON.stringify(gameData)) as GameData;
        const allInnings = [result.firstInning, result.secondInning, result.thirdInning, result.fourthInning].filter(Boolean) as Inning[];

        for (const inning of allInnings) {
            for (const batPerf of inning.batting) { 
                const player = newGameData.allPlayers.find(p => p.id === batPerf.playerId); 
                if (!player) continue; 
                if (!player.stats[format]) player.stats[format] = generateSingleFormatInitialStats();
                const stats = player.stats[format]; 
                stats.matches += (inning === result.firstInning || inning === result.secondInning ? 1 : 0); 
                stats.runs += batPerf.runs; 
                stats.ballsFaced += batPerf.balls; 
                if (batPerf.isOut) stats.dismissals++; 
                if (batPerf.runs > stats.highestScore) stats.highestScore = batPerf.runs; 
                if (batPerf.runs >= 100) stats.hundreds++; 
                else if (batPerf.runs >= 50) stats.fifties++; 
                stats.fours += batPerf.fours; 
                stats.sixes += batPerf.sixes; 
                stats.average = stats.dismissals > 0 ? stats.runs / stats.dismissals : stats.runs; 
                stats.strikeRate = stats.ballsFaced > 0 ? (stats.runs / stats.ballsFaced) * 100 : 0; 
            }

            for (const bowlPerf of inning.bowling) { 
                const player = newGameData.allPlayers.find(p => p.id === bowlPerf.playerId); 
                if (!player) continue; 
                if (!player.stats[format]) player.stats[format] = generateSingleFormatInitialStats();
                const stats = player.stats[format]; 
                stats.wickets += bowlPerf.wickets; 
                stats.runsConceded += bowlPerf.runsConceded; 
                stats.ballsBowled += bowlPerf.ballsBowled;
                stats.bowlingAverage = stats.wickets > 0 ? stats.runsConceded / stats.wickets : stats.runsConceded; 
                stats.economy = stats.ballsBowled > 0 ? (stats.runsConceded / stats.ballsBowled) * 6 : 0; 
                if (bowlPerf.wickets > stats.bestBowlingWickets || (bowlPerf.wickets === stats.bestBowlingWickets && bowlPerf.runsConceded < stats.bestBowlingRuns)) { 
                    stats.bestBowlingWickets = bowlPerf.wickets; 
                    stats.bestBowlingRuns = bowlPerf.runsConceded; 
                    stats.bestBowling = `${bowlPerf.wickets}/${bowlPerf.runsConceded}`; 
                } 
                if (bowlPerf.wickets >= 5) stats.fiveWicketHauls++; 
                else if (bowlPerf.wickets >= 3) stats.threeWicketHauls++; 
            }
        }

        const motmPlayer = newGameData.allPlayers.find(p => p.id === result.manOfTheMatch.playerId); 
        if (motmPlayer) { 
             if (!motmPlayer.stats[format]) motmPlayer.stats[format] = generateSingleFormatInitialStats();
            motmPlayer.stats[format].manOfTheMatchAwards++; 
        }

        newGameData.standings[format].forEach(s => {
            if (s.teamId === result.firstInning.teamId) {
                s.played++;
                if (result.winnerId === s.teamId) s.won++, s.points += format.includes('First-Class') ? 4 : 2;
                else if (!result.winnerId) s.points += 1; // Tie/Draw
                else s.lost++;
            } else if (s.teamId === result.secondInning?.teamId) {
                s.played++;
                if (result.winnerId === s.teamId) s.won++, s.points += format.includes('First-Class') ? 4 : 2;
                else if (!result.winnerId) s.points += 1; // Tie/Draw
                else s.lost++;
            }
        });

        newGameData.standings[format].sort((a, b) => b.points - a.points || b.netRunRate - a.netRunRate); 
        newGameData.matchResults[format].push(result); 
        return newGameData;
    }, []);

    return { runSimulationForCurrentFormat, updateStatsFromMatch };
}