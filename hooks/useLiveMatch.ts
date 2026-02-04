
import { useState, useEffect, useCallback, useRef } from 'react';
import { GameData, Match, Player, Format, Team, Inning, MatchResult, PlayerRole, BattingPerformance, BowlingPerformance, Strategy, LiveMatchState } from '../types';
import { PITCH_MODIFIERS, formatOvers, getPlayerById, generateAutoXI, getBatterTier, BATTING_PROFILES, getCommentary } from '../utils';

export const useLiveMatch = (
    match: Match,
    gameData: GameData,
    onMatchComplete: (result: MatchResult) => void,
    initialState?: LiveMatchState | null
) => {
    const [state, setState] = useState<LiveMatchState | null>(initialState || null);
    const matchIdRef = useRef<string | number | null>(initialState ? initialState.match.matchNumber : null);
    const autoPlayRef = useRef<any>(null); 
    const [allPlayers, setAllPlayers] = useState<Player[]>([]);
    const [groundPitch, setGroundPitch] = useState("Balanced Sporting Pitch");
    const [groundCode, setGroundCode] = useState("KCG");

    // Initialization
    useEffect(() => {
        if (state) {
             // Restore players context if resuming
             const teamAData = gameData.teams.find(t => t.id === state.match.teamAId) || gameData.teams.find(t => t.name === state.match.teamA);
             const teamBData = gameData.teams.find(t => t.id === state.match.teamBId) || gameData.teams.find(t => t.name === state.match.teamB);
             
             if (teamAData && teamBData) {
                 const allP = [...teamAData.squad, ...teamBData.squad];
                 // Hydrate full player objects
                 const hydratedPlayers = allP.map(p => gameData.allPlayers.find(gp => gp.id === p.id) || p);
                 setAllPlayers(hydratedPlayers);
             }
             return;
        }

        if (matchIdRef.current === match.matchNumber) return;

        const teamAData = gameData.teams.find(t => t.name === match.teamA);
        const teamBData = gameData.teams.find(t => t.name === match.teamB);
        
        if (!teamAData || !teamBData) {
            console.error("Teams not found for live match:", match.teamA, match.teamB);
            return;
        }

        const getPlayingXI = (team: Team) => {
            const customXI = gameData.playingXIs?.[team.id]?.[gameData.currentFormat];
            if (customXI && customXI.length === 11) {
                const xiPlayers = customXI.map(id => team.squad.find(p => p.id === id)).filter(Boolean) as Player[];
                if (xiPlayers.length === 11) return xiPlayers;
            }
            return generateAutoXI(team.squad, gameData.currentFormat);
        };

        const teamAPlayers = getPlayingXI(teamAData);
        const teamBPlayers = getPlayingXI(teamBData);
        const matchPlayers = [...teamAPlayers, ...teamBPlayers];
        setAllPlayers(matchPlayers);

        const homeGround = gameData.grounds.find(g => g.code === gameData.allTeamsData.find(t => t.name === match.teamA)?.homeGround);
        setGroundPitch(homeGround?.pitch || "Balanced Sporting Pitch");
        setGroundCode(homeGround?.code || "KCG");

        const initInning = (team: Team, opponent: Team): Inning => {
            const battingLineup: BattingPerformance[] = team.squad.map(p => {
                const d = getPlayerById(p.id, matchPlayers);
                return { playerId: d.id, playerName: d.name, runs: 0, balls: 0, fours: 0, sixes: 0, isOut: false, dismissalText: 'not out', dismissal: { type: 'not out', bowlerId: '' } };
            });
            
            const bowlingLineup: BowlingPerformance[] = opponent.squad
                .filter(p => [PlayerRole.FAST_BOWLER, PlayerRole.SPIN_BOWLER, PlayerRole.ALL_ROUNDER].includes(getPlayerById(p.id, matchPlayers).role))
                .map(p => {
                     const d = getPlayerById(p.id, matchPlayers);
                     return { playerId: d.id, playerName: d.name, overs: '0.0', maidens: 0, runsConceded: 0, wickets: 0, ballsBowled: 0 };
                });

            if (bowlingLineup.length === 0) {
                 const p = getPlayerById(opponent.squad[0].id, matchPlayers);
                 bowlingLineup.push({ playerId: p.id, playerName: p.name, overs: '0.0', maidens: 0, runsConceded: 0, wickets: 0, ballsBowled: 0 });
            }

            return {
                teamId: team.id,
                teamName: team.name,
                score: 0,
                wickets: 0,
                overs: '0.0',
                batting: battingLineup,
                bowling: bowlingLineup,
                extras: 0
            };
        };

        const teamA = { ...teamAData, squad: teamAPlayers };
        const teamB = { ...teamBData, squad: teamBPlayers };
        
        const firstInning = initInning(teamA, teamB);
        const secondInning = initInning(teamB, teamA);
        
        matchIdRef.current = match.matchNumber;
        
        setState({
            status: 'toss',
            match: { ...match, teamAId: teamA.id, teamBId: teamB.id }, // Ensure IDs are set
            currentInningIndex: 0,
            innings: [firstInning, secondInning],
            target: null,
            currentBatters: { strikerId: teamAPlayers[0].id, nonStrikerId: teamAPlayers[1].id },
            currentBowlerId: secondInning.bowling[0].playerId, 
            recentBalls: [],
            commentary: ["Welcome to the live coverage!", "The players are walking out to the middle."],
            battingTeam: teamA,
            bowlingTeam: teamB,
            requiredRunRate: 0,
            currentPartnership: { runs: 0, balls: 0 },
            fallOfWickets: [],
            waitingFor: 'openers',
            strategies: { batting: 'balanced', bowling: 'balanced' },
            autoPlayType: null,
            tossWinnerId: null,
            tossDecision: null,
        });

    }, [match.matchNumber, match.teamA, match.teamB, gameData, state]);

    const startMatch = (winnerId: string, decision: 'bat' | 'bowl') => {
        setState(prev => {
            if (!prev) return null;
            // Determine who bats first
            let battingTeam, bowlingTeam;
            const teamA = prev.battingTeam.id === prev.match.teamAId ? prev.battingTeam : prev.bowlingTeam;
            const teamB = prev.battingTeam.id === prev.match.teamBId ? prev.battingTeam : prev.bowlingTeam;

            if (winnerId === teamA.id) {
                battingTeam = decision === 'bat' ? teamA : teamB;
                bowlingTeam = decision === 'bat' ? teamB : teamA;
            } else {
                battingTeam = decision === 'bat' ? teamB : teamA;
                bowlingTeam = decision === 'bat' ? teamA : teamB;
            }

            // Re-initialize innings with correct order
            const initInning = (team: Team, opponent: Team): Inning => {
                const battingLineup: BattingPerformance[] = team.squad.map(p => {
                    const d = getPlayerById(p.id, allPlayers);
                    return { playerId: d.id, playerName: d.name, runs: 0, balls: 0, fours: 0, sixes: 0, isOut: false, dismissalText: 'not out', dismissal: { type: 'not out', bowlerId: '' } };
                });
                
                const bowlingLineup: BowlingPerformance[] = opponent.squad
                    .filter(p => [PlayerRole.FAST_BOWLER, PlayerRole.SPIN_BOWLER, PlayerRole.ALL_ROUNDER].includes(getPlayerById(p.id, allPlayers).role))
                    .map(p => {
                         const d = getPlayerById(p.id, allPlayers);
                         return { playerId: d.id, playerName: d.name, overs: '0.0', maidens: 0, runsConceded: 0, wickets: 0, ballsBowled: 0 };
                    });

                if (bowlingLineup.length === 0) {
                     const p = getPlayerById(opponent.squad[0].id, allPlayers);
                     bowlingLineup.push({ playerId: p.id, playerName: p.name, overs: '0.0', maidens: 0, runsConceded: 0, wickets: 0, ballsBowled: 0 });
                }

                return {
                    teamId: team.id,
                    teamName: team.name,
                    score: 0,
                    wickets: 0,
                    overs: '0.0',
                    batting: battingLineup,
                    bowling: bowlingLineup,
                    extras: 0
                };
            };

            const firstInning = initInning(battingTeam, bowlingTeam);
            const secondInning = initInning(bowlingTeam, battingTeam);

            // Auto-select initial batters and bowler for AI
            let openers = { strikerId: firstInning.batting[0].playerId, nonStrikerId: firstInning.batting[1].playerId };
            let bowlerId = firstInning.bowling[0].playerId;
            let waitingFor: LiveMatchState['waitingFor'] = null;
            
            const isUserBatting = battingTeam.id === gameData.userTeamId;
            if (isUserBatting) {
                waitingFor = 'openers';
            } else {
                // AI starts: Defaults already set above
                if (bowlingTeam.id === gameData.userTeamId) {
                    waitingFor = 'bowler';
                }
            }

            return {
                ...prev,
                status: 'ready',
                tossWinnerId: winnerId,
                tossDecision: decision,
                battingTeam,
                bowlingTeam,
                innings: [firstInning, secondInning],
                currentInningIndex: 0,
                currentBatters: openers,
                currentBowlerId: bowlerId,
                waitingFor: waitingFor,
                autoPlayType: null, 
                commentary: [
                    `Match Started!`,
                    `${winnerId === teamA.id ? teamA.name : teamB.name} won the toss and elected to ${decision}.`,
                    ...prev.commentary
                ]
            };
        });
    };

    const stopAutoPlay = () => {
        if (autoPlayRef.current) {
            clearInterval(autoPlayRef.current);
            autoPlayRef.current = null;
        }
    };

    const playBall = useCallback(() => {
        setState(prevState => {
            if (!prevState || prevState.status === 'completed') {
                 stopAutoPlay();
                 return prevState;
            }
            
            if (prevState.waitingFor) {
                // If in match simulation mode, force selection
                if (prevState.autoPlayType === 'match') {
                    // Fallthrough to auto-select logic below...
                } else {
                    stopAutoPlay();
                    return prevState;
                }
            }
            
            const newState = JSON.parse(JSON.stringify(prevState)) as LiveMatchState;
            const { currentInningIndex, innings, battingTeam, bowlingTeam, currentBatters, currentBowlerId, target, strategies } = newState;
            const currentInning = innings[currentInningIndex];
            
            const pitchMods = PITCH_MODIFIERS[groundPitch as keyof typeof PITCH_MODIFIERS] || PITCH_MODIFIERS["Balanced Sporting Pitch"];
            const formatMods = pitchMods[gameData.currentFormat];
            
            let striker = currentInning.batting.find(b => b.playerId === currentBatters.strikerId);
            let bowler = currentInning.bowling.find(b => b.playerId === currentBowlerId);
            
            // --- EMERGENCY AUTO-SELECT FOR MATCH SIMULATION ---
            if (newState.autoPlayType === 'match') {
                if (!striker) {
                    // Pick next available batter
                    const nextB = currentInning.batting.find(b => !b.isOut && b.playerId !== currentBatters.nonStrikerId);
                    if (nextB) {
                        newState.currentBatters.strikerId = nextB.playerId;
                        striker = nextB;
                        newState.waitingFor = null;
                    }
                }
                if (!bowler) {
                    // Pick next available bowler
                    const nextBowler = currentInning.bowling.find(b => b.ballsBowled < (gameData.currentFormat.includes('T20') ? 24 : 60));
                    if (nextBowler) {
                        newState.currentBowlerId = nextBowler.playerId;
                        bowler = nextBowler;
                        newState.waitingFor = null;
                    }
                }
            }

            if (!striker || !bowler) {
                 stopAutoPlay();
                 return newState;
            }

            const strikerDetails = getPlayerById(currentBatters.strikerId, allPlayers);
            const bowlerDetails = getPlayerById(currentBowlerId, allPlayers);

            // AI Strategy
            const isUserBatting = battingTeam.id === gameData.userTeamId;
            if (!isUserBatting) {
                const runsNeeded = target ? target - currentInning.score : 0;
                const ballsLeft = (gameData.currentFormat.includes('T20') ? 120 : 300) - (currentInning.bowling.reduce((a,b)=>a+b.ballsBowled,0));
                if (target && (runsNeeded / (ballsLeft/6)) > 8) strategies.batting = 'attacking';
                else if (target && (runsNeeded / (ballsLeft/6)) < 4) strategies.batting = 'defensive';
                else strategies.batting = Math.random() > 0.7 ? 'attacking' : 'balanced';
            }
            
            if (battingTeam.id !== gameData.userTeamId && bowlingTeam.id === gameData.userTeamId) {
                 const recentWickets = newState.fallOfWickets.filter(w => w.score > currentInning.score - 20).length;
                 if (recentWickets > 0) strategies.bowling = 'attacking';
                 else if ((currentInning.score / (parseFloat(currentInning.overs)||1)) > 10) strategies.bowling = 'defensive';
                 else strategies.bowling = 'balanced';
            }

            let strategyRunMod = 1.0;
            let strategyWicketMod = 1.0;

            if (strategies.batting === 'attacking') { strategyRunMod *= 1.4; strategyWicketMod *= 1.5; }
            else if (strategies.batting === 'defensive') { strategyRunMod *= 0.7; strategyWicketMod *= 0.6; }

            if (strategies.bowling === 'attacking') { strategyWicketMod *= 1.2; strategyRunMod *= 1.3; } 
            else if (strategies.bowling === 'defensive') { strategyWicketMod *= 0.8; strategyRunMod *= 0.8; }

            const batterProfile = getPlayerById(striker.playerId, allPlayers).customProfiles?.[gameData.currentFormat] || BATTING_PROFILES[gameData.currentFormat][getBatterTier(strikerDetails.battingSkill)][strikerDetails.style] || BATTING_PROFILES[gameData.currentFormat]['tier3']['N'];
            
            const expectedRunsPerBall = (batterProfile.sr / 100) * (target !== null ? pitchMods.chasePenalty : 1) * strategyRunMod;
            const baseWicketProb = (batterProfile.avg > 0 ? expectedRunsPerBall / batterProfile.avg : 0.05) * strategyWicketMod;
            let wicketProbability = baseWicketProb * formatMods.wicketChance;
            wicketProbability = Math.max(0.005, Math.min(0.5, wicketProbability));

            let runs = 0;
            let isOut = false;
            let ballLabel = "";
            let commentary = "";

            if (Math.random() < wicketProbability) {
                isOut = true;
                ballLabel = "W";
                commentary = getCommentary(0, true, strikerDetails.name, bowlerDetails.name);
            } else {
                const rand = Math.random();
                let p_dot=0.4, p_1=0.35, p_2=0.1, p_3=0.03, p_4=0.08, p_6=0.04;
                
                if (strategies.batting === 'attacking') { p_dot=0.3; p_4=0.15; p_6=0.1; }
                if (strategies.batting === 'defensive') { p_dot=0.6; p_4=0.04; p_6=0.01; }

                const totalP = p_dot+p_1+p_2+p_3+p_4+p_6;
                const normalizedRand = rand * totalP;

                if (normalizedRand < p_dot) runs = 0;
                else if (normalizedRand < p_dot+p_1) runs = 1;
                else if (normalizedRand < p_dot+p_1+p_2) runs = 2;
                else if (normalizedRand < p_dot+p_1+p_2+p_3) runs = 3;
                else if (normalizedRand < p_dot+p_1+p_2+p_3+p_4) runs = 4;
                else runs = 6;
                
                ballLabel = runs.toString();
                commentary = getCommentary(runs, false, strikerDetails.name, bowlerDetails.name);
            }

            currentInning.score += runs;
            bowler.runsConceded += runs;
            bowler.ballsBowled++;
            striker.runs += runs;
            striker.balls++;
            newState.currentPartnership.runs += runs;
            newState.currentPartnership.balls++;

            if (runs === 4) striker.fours++;
            if (runs === 6) striker.sixes++;

            if (isOut) {
                currentInning.wickets++;
                bowler.wickets++;
                striker.isOut = true;
                striker.dismissalText = `b ${bowlerDetails.name}`;
                
                newState.fallOfWickets.push({
                    score: currentInning.score,
                    wicket: currentInning.wickets,
                    over: formatOvers(bowler.ballsBowled + (parseInt(currentInning.overs.split('.')[0]) * 6)),
                    player: strikerDetails.name
                });

                if (currentInning.wickets < 10) {
                     const isUserBattingNow = battingTeam.id === gameData.userTeamId;
                     if (isUserBattingNow && newState.autoPlayType !== 'inning' && newState.autoPlayType !== 'match') {
                         newState.waitingFor = 'batter'; 
                         stopAutoPlay();
                     } else {
                         // Auto Select Batter
                         const nextBatter = currentInning.batting.find(b => !b.isOut && b.playerId !== currentBatters.strikerId && b.playerId !== currentBatters.nonStrikerId);
                         if (nextBatter) {
                             newState.currentBatters.strikerId = nextBatter.playerId;
                             newState.commentary.unshift(`${nextBatter.playerName} comes to the crease.`);
                         }
                     }
                }
            } else {
                if (runs % 2 !== 0) {
                    const temp = currentBatters.strikerId;
                    currentBatters.strikerId = currentBatters.nonStrikerId;
                    currentBatters.nonStrikerId = temp;
                }
            }

            newState.recentBalls = [ballLabel, ...newState.recentBalls].slice(0, 12);
            newState.commentary = [commentary, ...newState.commentary].slice(0, 50);

            const totalBalls = innings[currentInningIndex].bowling.reduce((acc, b) => acc + b.ballsBowled, 0);
            currentInning.overs = formatOvers(totalBalls);
            bowler.overs = formatOvers(bowler.ballsBowled);

            const maxOvers = (gameData.currentFormat.includes('T20')) ? 20 : (gameData.currentFormat.includes('ODI') || gameData.currentFormat.includes('List')) ? 50 : 90;
            const maxBalls = maxOvers * 6;

            // End of Over Logic
            if (totalBalls % 6 === 0 && totalBalls < maxBalls) { 
                if (!isOut) {
                    const temp = currentBatters.strikerId;
                    currentBatters.strikerId = currentBatters.nonStrikerId;
                    currentBatters.nonStrikerId = temp;
                }
                
                newState.commentary.unshift(`End of over ${totalBalls/6}. ${battingTeam.name} are ${currentInning.score}/${currentInning.wickets}.`);
                
                if (currentInning.wickets < 10) {
                     const isUserBowlingNow = bowlingTeam.id === gameData.userTeamId;
                     if (isUserBowlingNow && newState.autoPlayType !== 'inning' && newState.autoPlayType !== 'match') {
                         newState.waitingFor = 'bowler';
                         stopAutoPlay(); 
                     } else {
                         // Auto Select Bowler
                         const overLimit = (gameData.currentFormat.includes('T20') ? 4 : 10);
                         const validBowlers = currentInning.bowling.filter(b => b.playerId !== currentBowlerId && b.ballsBowled < overLimit * 6);
                         
                         let nextBowler = validBowlers.sort((a,b) => {
                             const pa = getPlayerById(a.playerId, allPlayers);
                             const pb = getPlayerById(b.playerId, allPlayers);
                             return pb.secondarySkill - pa.secondarySkill;
                         })[0];

                         if (!nextBowler) {
                             nextBowler = currentInning.bowling.find(b => b.playerId !== currentBowlerId) || currentInning.bowling[0];
                         }

                         if (nextBowler) {
                            newState.currentBowlerId = nextBowler.playerId;
                            newState.commentary.unshift(`${nextBowler.playerName} will bowl the next over.`);
                         }
                     }
                }
            } else if (totalBalls % 6 === 0 && isOut && currentInning.wickets < 10) {
                // Double Event: Wicket on Last Ball
                const isUserBowlingNow = bowlingTeam.id === gameData.userTeamId;
                if (isUserBowlingNow && newState.autoPlayType !== 'inning' && newState.autoPlayType !== 'match') {
                     if (!newState.waitingFor) {
                         newState.waitingFor = 'bowler';
                         stopAutoPlay();
                     }
                } else {
                     // Auto Select Bowler
                     const overLimit = (gameData.currentFormat.includes('T20') ? 4 : 10);
                     const validBowlers = currentInning.bowling.filter(b => b.playerId !== currentBowlerId && b.ballsBowled < overLimit * 6);
                     const nextBowler = validBowlers[0] || currentInning.bowling.find(b => b.playerId !== currentBowlerId);
                     if (nextBowler) newState.currentBowlerId = nextBowler.playerId;
                }
            }

            let matchEnded = false;
            let resultText = "";

            if (currentInning.wickets >= 10 || totalBalls >= maxBalls || (target !== null && currentInning.score > target)) {
                newState.waitingFor = null;
                if (newState.autoPlayType !== 'match') stopAutoPlay();
                
                if (currentInningIndex === 0) {
                    newState.currentInningIndex = 1;
                    newState.target = currentInning.score;
                    newState.status = 'inprogress';
                    newState.battingTeam = bowlingTeam;
                    newState.bowlingTeam = battingTeam;
                    
                    const inn2Batters = innings[1].batting.slice(0, 2);
                    const inn2Bowler = innings[1].bowling[0];
                    
                    newState.currentBatters = { strikerId: inn2Batters[0]?.playerId || '', nonStrikerId: inn2Batters[1]?.playerId || '' };
                    newState.currentBowlerId = inn2Bowler?.playerId || '';
                    
                    newState.recentBalls = [];
                    newState.currentPartnership = { runs: 0, balls: 0 };
                    newState.commentary.unshift(`Innings Break! Target is ${currentInning.score + 1}.`);
                    
                    if (bowlingTeam.id === gameData.userTeamId && newState.autoPlayType !== 'inning' && newState.autoPlayType !== 'match') {
                        newState.waitingFor = 'openers';
                    } else {
                         newState.commentary.unshift(`Auto-selected openers.`);
                         if (battingTeam.id === gameData.userTeamId && newState.autoPlayType !== 'inning' && newState.autoPlayType !== 'match') {
                             newState.waitingFor = 'bowler';
                         }
                    }
                } else {
                    newState.status = 'completed';
                    matchEnded = true;
                    if (currentInning.score > target!) {
                        resultText = `${battingTeam.name} won by ${10 - currentInning.wickets} wickets`;
                    } else if (currentInning.score === target!) {
                        resultText = "Match Tied";
                    } else {
                        resultText = `${bowlingTeam.name} won by ${target! - currentInning.score} runs`;
                    }
                }
            }

            if (matchEnded) {
                stopAutoPlay(); // Ensure stopped
                const result: MatchResult = {
                    matchNumber: match.matchNumber,
                    summary: resultText,
                    firstInning: innings[0],
                    secondInning: innings[1],
                    winnerId: currentInning.score > target! ? battingTeam.id : bowlingTeam.id,
                    loserId: currentInning.score > target! ? bowlingTeam.id : battingTeam.id,
                    manOfTheMatch: { playerId: '', playerName: 'TBD', teamId: '', summary: '' },
                    tossWinnerId: newState.tossWinnerId || undefined,
                    tossDecision: newState.tossDecision || undefined
                };
                let bestPerf = -1;
                [innings[0], innings[1]].forEach(inn => {
                    inn.batting.forEach(b => { if (b.runs > bestPerf) { bestPerf = b.runs; result.manOfTheMatch = { playerId: b.playerId, playerName: b.playerName, teamId: inn.teamId, summary: `${b.runs} runs` } } });
                });
                
                setTimeout(() => onMatchComplete(result), 2000);
            }

            return newState;
        });
    }, [state, allPlayers, gameData, groundPitch, onMatchComplete]);

    const playOver = () => {
        let balls = 0;
        if (autoPlayRef.current) clearInterval(autoPlayRef.current);
        
        setState(prev => prev ? { ...prev, autoPlayType: 'regular' } : null);

        autoPlayRef.current = setInterval(() => {
            playBall();
            balls++;
            if (balls >= 6) {
                if (autoPlayRef.current) clearInterval(autoPlayRef.current);
                autoPlayRef.current = null;
                setState(prev => prev ? { ...prev, autoPlayType: null } : null);
            }
        }, 100);
    };

    const autoSimulate = () => {
        if (autoPlayRef.current) return;
        setState(prev => prev ? { ...prev, autoPlayType: 'regular' } : null);
        autoPlayRef.current = setInterval(() => {
            playBall();
        }, 50);
    };
    
    const simulateInning = () => {
         if (autoPlayRef.current) clearInterval(autoPlayRef.current);
         setState(prev => prev ? { ...prev, autoPlayType: 'inning' } : null);
         autoPlayRef.current = setInterval(() => {
            playBall();
        }, 10); 
    };

    const simulateMatch = () => {
        if (autoPlayRef.current) clearInterval(autoPlayRef.current);
        setState(prev => prev ? { ...prev, autoPlayType: 'match' } : null);
        autoPlayRef.current = setInterval(() => {
           playBall();
       }, 5); 
   };
    
    useEffect(() => {
        return () => {
            if (autoPlayRef.current) clearInterval(autoPlayRef.current);
        };
    }, []);

    const setBattingStrategy = (s: Strategy) => setState(prev => prev ? { ...prev, strategies: { ...prev.strategies, batting: s } } : null);
    const setBowlingStrategy = (s: Strategy) => setState(prev => prev ? { ...prev, strategies: { ...prev.strategies, bowling: s } } : null);

    const selectOpeners = (strikerId: string, nonStrikerId: string) => {
        setState(prev => {
            if (!prev) return null;
            
            return {
                ...prev,
                currentBatters: { strikerId, nonStrikerId },
                currentPartnership: { runs: 0, balls: 0 },
                waitingFor: null,
            };
        });
    };

    const selectNextBatter = (batterId: string) => {
        setState(prev => {
            if (!prev) return null;
            const currentInning = prev.innings[prev.currentInningIndex];
            const strikerOut = currentInning.batting.find(b => b.playerId === prev.currentBatters.strikerId)?.isOut;
            
            const newBatters = { ...prev.currentBatters };
            if (strikerOut) newBatters.strikerId = batterId;
            else newBatters.nonStrikerId = batterId;

            const totalBalls = currentInning.bowling.reduce((acc, b) => acc + b.ballsBowled, 0);
            let nextWaitingFor: LiveMatchState['waitingFor'] = null;
            let nextBowlerId = prev.currentBowlerId;
            
            if (totalBalls % 6 === 0 && totalBalls > 0) {
                 if (prev.bowlingTeam.id === gameData.userTeamId && prev.autoPlayType !== 'inning' && prev.autoPlayType !== 'match') {
                      nextWaitingFor = 'bowler';
                 } else {
                      const overLimit = (gameData.currentFormat.includes('T20') ? 4 : 10);
                      const validBowlers = currentInning.bowling.filter(b => b.playerId !== prev.currentBowlerId && b.ballsBowled < overLimit * 6);
                      
                      let nextBowler = validBowlers.sort((a,b) => {
                           const pa = getPlayerById(a.playerId, allPlayers);
                           const pb = getPlayerById(b.playerId, allPlayers);
                           return pb.secondarySkill - pa.secondarySkill;
                      })[0] || currentInning.bowling.find(b => b.playerId !== prev.currentBowlerId);
                      
                      if (nextBowler) nextBowlerId = nextBowler.playerId;
                 }
            }

            return {
                ...prev,
                currentBatters: newBatters, 
                currentBowlerId: nextBowlerId,
                currentPartnership: { runs: 0, balls: 0 },
                waitingFor: nextWaitingFor,
                commentary: [`${getPlayerById(batterId, allPlayers).name} is the new batter.`, ...prev.commentary]
            };
        });
    };

    const selectNextBowler = (bowlerId: string) => {
        setState(prev => {
            if (!prev) return null;
            return {
                ...prev,
                currentBowlerId: bowlerId,
                waitingFor: null,
                commentary: [`${getPlayerById(bowlerId, allPlayers).name} comes into the attack.`, ...prev.commentary]
            };
        });
    };

    return {
        state,
        playBall,
        playOver,
        autoSimulate,
        simulateInning,
        simulateMatch,
        setBattingStrategy,
        setBowlingStrategy,
        selectOpeners,
        selectNextBatter,
        selectNextBowler,
        startMatch
    };
};
