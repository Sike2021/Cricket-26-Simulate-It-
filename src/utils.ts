
import React from 'react';
import { Format, Player, PlayerRole, Team, Match, PlayerStats, Sponsorship, MatchResult, NewsArticle, GameData } from './types';
import { BRANDS, SPONSOR_THRESHOLDS, generateSingleFormatInitialStats, TV_CHANNELS } from './data';

export const PITCH_MODIFIERS = {
  "Balanced Sporting Pitch": { [Format.T20]: { runRate: 3.85, wicketChance: 1.20 }, [Format.ODI]: { runRate: 2.45, wicketChance: 1.15 }, [Format.FIRST_CLASS]: { runRate: 1.0, wicketChance: 1.0 }, [Format.DEVELOPMENT_T20]: { runRate: 3.85, wicketChance: 1.20 }, [Format.DEVELOPMENT_ODI]: { runRate: 2.45, wicketChance: 1.15 }, [Format.DEVELOPMENT_FIRST_CLASS]: { runRate: 1.0, wicketChance: 1.0 }, [Format.RISE_T20]: { runRate: 3.85, wicketChance: 1.20 }, [Format.RISE_ODI]: { runRate: 2.45, wicketChance: 1.15 }, [Format.RISE_FIRST_CLASS]: { runRate: 1.0, wicketChance: 1.0 }, paceBonus: 0, spinBonus: 0, chasePenalty: 1.0, deterioration: 0.02, unpredictability: 0 },
  "Dusty Spinner’s Haven": { [Format.T20]: { runRate: 3.10, wicketChance: 1.40 }, [Format.ODI]: { runRate: 2.10, wicketChance: 1.25 }, [Format.FIRST_CLASS]: { runRate: 0.9, wicketChance: 1.15 }, [Format.DEVELOPMENT_T20]: { runRate: 3.10, wicketChance: 1.40 }, [Format.DEVELOPMENT_ODI]: { runRate: 2.10, wicketChance: 1.25 }, [Format.DEVELOPMENT_FIRST_CLASS]: { runRate: 0.9, wicketChance: 1.15 }, [Format.RISE_T20]: { runRate: 3.10, wicketChance: 1.40 }, [Format.RISE_ODI]: { runRate: 2.10, wicketChance: 1.25 }, [Format.RISE_FIRST_CLASS]: { runRate: 0.9, wicketChance: 1.15 }, paceBonus: -0.05, spinBonus: 0.15, chasePenalty: 0.95, deterioration: 0.1, unpredictability: 0.005 },
  "Green Top": { [Format.T20]: { runRate: 3.30, wicketChance: 1.45 }, [Format.ODI]: { runRate: 2.20, wicketChance: 1.30 }, [Format.FIRST_CLASS]: { runRate: 0.85, wicketChance: 1.2 }, [Format.DEVELOPMENT_T20]: { runRate: 3.30, wicketChance: 1.45 }, [Format.DEVELOPMENT_ODI]: { runRate: 2.20, wicketChance: 1.30 }, [Format.DEVELOPMENT_FIRST_CLASS]: { runRate: 0.85, wicketChance: 1.2 }, [Format.RISE_T20]: { runRate: 3.30, wicketChance: 1.45 }, [Format.RISE_ODI]: { runRate: 2.20, wicketChance: 1.30 }, [Format.RISE_FIRST_CLASS]: { runRate: 0.85, wicketChance: 1.2 }, paceBonus: 0.15, spinBonus: -0.05, chasePenalty: 1.0, deterioration: 0.05, unpredictability: 0 },
  "Batting Paradise": { [Format.T20]: { runRate: 4.40, wicketChance: 1.0 }, [Format.ODI]: { runRate: 2.85, wicketChance: 1.0 }, [Format.FIRST_CLASS]: { runRate: 1.2, wicketChance: 0.85 }, [Format.DEVELOPMENT_T20]: { runRate: 4.40, wicketChance: 1.0 }, [Format.DEVELOPMENT_ODI]: { runRate: 2.85, wicketChance: 1.0 }, [Format.DEVELOPMENT_FIRST_CLASS]: { runRate: 1.2, wicketChance: 0.85 }, [Format.RISE_T20]: { runRate: 4.40, wicketChance: 1.0 }, [Format.RISE_ODI]: { runRate: 2.85, wicketChance: 1.0 }, [Format.RISE_FIRST_CLASS]: { runRate: 1.2, wicketChance: 0.85 }, paceBonus: 0, spinBonus: 0, chasePenalty: 1.0, deterioration: 0, unpredictability: 0 },
  "Dead Slow Track": { [Format.T20]: { runRate: 2.75, wicketChance: 1.30 }, [Format.ODI]: { runRate: 2.0, wicketChance: 1.20 }, [Format.FIRST_CLASS]: { runRate: 0.8, wicketChance: 1.1 }, [Format.DEVELOPMENT_T20]: { runRate: 2.75, wicketChance: 1.30 }, [Format.DEVELOPMENT_ODI]: { runRate: 2.0, wicketChance: 1.20 }, [Format.DEVELOPMENT_FIRST_CLASS]: { runRate: 0.8, wicketChance: 1.1 }, [Format.RISE_T20]: { runRate: 2.75, wicketChance: 1.30 }, [Format.RISE_ODI]: { runRate: 2.0, wicketChance: 1.20 }, [Format.RISE_FIRST_CLASS]: { runRate: 0.8, wicketChance: 1.1 }, paceBonus: -0.05, spinBonus: 0.1, chasePenalty: 1.0, deterioration: 0.05, unpredictability: 0 },
  "Cracked Worn Surface": { [Format.T20]: { runRate: 3.30, wicketChance: 1.40 }, [Format.ODI]: { runRate: 2.20, wicketChance: 1.30 }, [Format.FIRST_CLASS]: { runRate: 0.75, wicketChance: 1.25 }, [Format.DEVELOPMENT_T20]: { runRate: 3.30, wicketChance: 1.40 }, [Format.DEVELOPMENT_ODI]: { runRate: 2.20, wicketChance: 1.30 }, [Format.DEVELOPMENT_FIRST_CLASS]: { runRate: 0.75, wicketChance: 1.25 }, [Format.RISE_T20]: { runRate: 3.30, wicketChance: 1.40 }, [Format.RISE_ODI]: { runRate: 2.20, wicketChance: 1.30 }, [Format.RISE_FIRST_CLASS]: { runRate: 0.75, wicketChance: 1.25 }, paceBonus: 0.05, spinBonus: 0.1, chasePenalty: 0.98, deterioration: 0.15, unpredictability: 0.015 },
};

export const COMMENTARY_TEMPLATES = {
    '0': ["Defended solidly back to the bowler.", "No run, straight to the fielder.", "Beaten! Lovely delivery.", "Leaves it alone outside off.", "Solid defense, respects the good ball."],
    '1': ["Pushed into the gap for a single.", "Quick single taken.", "Worked away to square leg for one.", "Edged but safe, they take a run.", "Tapped to mid-on for a sharp single."],
    '2': ["Driven through covers, they'll come back for two.", "Good running, two runs added.", "Flicked away, easy couple.", "Punched off the back foot for a brace."],
    '3': ["Great placement! They push hard for three.", "Stopped just inside the boundary, three runs saved.", "Timed well, but the outfield is slow. Three runs."],
    '4': ["FOUR! Glorious shot through the covers!", "Smashed down the ground for FOUR!", "Edged and four! Lucky boundary.", "FOUR! Pulled away with power.", "Beautiful drive, races to the fence for FOUR!"],
    '6': ["SIX! That's huge! Out of the ground!", "SIX! Clean strike over long-on!", "Maximum! He's picked the length early.", "Top edge... and it flies for SIX!", "Launched into the stands! massive hit!"],
    'W': ["OUT! Clean bowled! What a delivery!", "Caught! Straight to the fielder.", "LBW! That looked plumb.", "Run out! Mix up in the middle!", "Edged and taken! The keeper makes no mistake."],
    'Wd': ["Wide ball, too far outside off.", "Drifting down leg, called wide.", "Wayward delivery, signaled wide."],
    'Nb': ["No ball! Overstepping.", "No ball for height, free hit coming up."],
};

export const getCommentary = (runs: number, isOut: boolean, batterName: string, bowlerName: string, extraType?: string) => {
    if (isOut) {
        const templates = COMMENTARY_TEMPLATES['W'];
        return templates[Math.floor(Math.random() * templates.length)].replace('The keeper', 'The keeper').replace('fielder', 'fielder');
    }
    if (extraType === 'Wd') return COMMENTARY_TEMPLATES['Wd'][Math.floor(Math.random() * COMMENTARY_TEMPLATES['Wd'].length)];
    if (extraType === 'Nb') return COMMENTARY_TEMPLATES['Nb'][Math.floor(Math.random() * COMMENTARY_TEMPLATES['Nb'].length)];

    const key = runs > 6 ? '6' : runs.toString() as keyof typeof COMMENTARY_TEMPLATES;
    const templates = COMMENTARY_TEMPLATES[key] || COMMENTARY_TEMPLATES['0'];
    return templates[Math.floor(Math.random() * templates.length)];
};

export const getRoleColor = (role: PlayerRole) => {
  switch (role) {
    case PlayerRole.BATSMAN: return 'text-blue-500 dark:text-blue-400';
    case PlayerRole.WICKET_KEEPER: return 'text-green-600 dark:text-green-400';
    case PlayerRole.ALL_ROUNDER: return 'text-yellow-600 dark:text-yellow-400';
    case PlayerRole.SPIN_BOWLER: return 'text-purple-600 dark:text-purple-400';
    case PlayerRole.FAST_BOWLER: return 'text-red-600 dark:text-red-400';
    default: return 'text-gray-500 dark:text-gray-400';
  }
};

export const getRoleFullName = (role: PlayerRole) => {
    switch (role) {
        case PlayerRole.BATSMAN: return 'Batsman';
        case PlayerRole.WICKET_KEEPER: return 'Wicket-Keeper';
        case PlayerRole.ALL_ROUNDER: return 'All-Rounder';
        case PlayerRole.SPIN_BOWLER: return 'Spin Bowler';
        case PlayerRole.FAST_BOWLER: return 'Bowler';
        default: return 'Player';
    }
};

export const getBattingStyleLabel = (style: string) => {
    switch (style) {
        case 'A': return 'Aggressive';
        case 'D': return 'Defensive';
        case 'N': return 'Balanced';
        case 'NA': return 'N/A';
        default: return style;
    }
};

export const BATTING_STYLE_OPTIONS = ['A', 'D', 'N', 'NA'];

export const formatOvers = (balls: number) => {
    const overs = Math.floor(balls / 6);
    const remainingBalls = balls % 6;
    return `${overs}.${remainingBalls}`;
}

export const getPlayerById = (id: string, allPlayers: Player[]) => {
    const player = allPlayers.find(p => p.id === id);
    if (!player) {
      return { id: 'unknown', name: 'Unknown Player', role: PlayerRole.BATSMAN, battingSkill: 30, secondarySkill: 30, style: 'N' } as any as Player;
    }
    return player;
};

export const generateAutoXI = (squad: Player[], format: Format) => {
    let targetOpeners = 2;
    let targetKeepers = 1;
    let targetBatsmen = 0;
    let targetAllRounders = 0;
    let targetBowlers = 0;
    
    const isT20 = [Format.T20, Format.DEVELOPMENT_T20, Format.RISE_T20].includes(format);
    const isFC = [Format.FIRST_CLASS, Format.DEVELOPMENT_FIRST_CLASS, Format.RISE_FIRST_CLASS].includes(format);
    
    if (isT20) {
        targetBatsmen = 2;
        targetAllRounders = 3;
        targetBowlers = 3;
    } else if (isFC) {
        targetBatsmen = 4;
        targetAllRounders = 1;
        targetBowlers = 4;
    } else {
        targetBatsmen = 3;
        targetAllRounders = 2;
        targetBowlers = 3;
    }

    const selectedPlayerIds = new Set<string>();
    const xi: Player[] = [];
    
    const isDomesticOnlyFormat = [Format.ODI, Format.FIRST_CLASS, Format.DEVELOPMENT_ODI, Format.DEVELOPMENT_FIRST_CLASS, Format.RISE_ODI, Format.RISE_FIRST_CLASS].includes(format);
    const availableSquad = isDomesticOnlyFormat
        ? squad.filter(p => !p.isForeign)
        : squad;
    
    if (availableSquad.length < 11) {
         const allAvailablePlayers = [...squad].sort((a,b) => (b.battingSkill + b.secondarySkill) - (a.battingSkill + a.secondarySkill));
         return allAvailablePlayers.slice(0, 11);
    }

    const addPlayersFromList = (list: Player[], count: number) => {
        let added = 0;
        for (const player of list) {
            if (added < count && !selectedPlayerIds.has(player.id)) {
                xi.push(player);
                selectedPlayerIds.add(player.id);
                added++;
            }
        }
    };
    const openersPool = availableSquad
        .filter(p => p.isOpener)
        .sort((a, b) => b.battingSkill - a.battingSkill);
    addPlayersFromList(openersPool, targetOpeners);
    const keepersPool = availableSquad
        .filter(p => p.role === PlayerRole.WICKET_KEEPER)
        .sort((a, b) => (b.battingSkill + b.secondarySkill) - (a.battingSkill + a.battingSkill)); 
    addPlayersFromList(keepersPool, targetKeepers);
    const batsmenPool = availableSquad
        .filter(p => p.role === PlayerRole.BATSMAN)
        .sort((a, b) => b.battingSkill - a.battingSkill);
    addPlayersFromList(batsmenPool, targetBatsmen);
    const arPool = availableSquad
        .filter(p => p.role === PlayerRole.ALL_ROUNDER)
        .sort((a, b) => (b.battingSkill + b.secondarySkill) - (a.battingSkill + a.secondarySkill));
    addPlayersFromList(arPool, targetAllRounders);
    const bowlersPool = availableSquad
        .filter(p => [PlayerRole.FAST_BOWLER, PlayerRole.SPIN_BOWLER].includes(p.role))
        .sort((a, b) => b.secondarySkill - a.secondarySkill);
    addPlayersFromList(bowlersPool, targetBowlers);
    if (xi.length < 11) {
        const remainingPlayers = availableSquad
            .filter(p => !selectedPlayerIds.has(p.id))
            .sort((a,b) => (b.battingSkill + b.secondarySkill) - (a.battingSkill + a.secondarySkill));
        addPlayersFromList(remainingPlayers, 11 - xi.length);
    }
    return xi.slice(0, 11);
};

export const getBatterTier = (battingSkill: number) => {
    if (battingSkill >= 80) return 'tier1';
    if (battingSkill >= 65) return 'tier2';
    if (battingSkill >= 50) return 'tier3';
    if (battingSkill >= 30) return 'tier4';
    return 'tier5';
};

const T20_PROFILES = {
    tier1: { NA: { avg: 40, sr: 135 }, N: { avg: 40, sr: 125 }, D: { avg: 30, sr: 110 }, A: { avg: 25, sr: 155 } },
    tier2: { NA: { avg: 32, sr: 125 }, N: { avg: 32, sr: 115 }, D: { avg: 25, sr: 100 }, A: { avg: 22, sr: 140 } },
    tier3: { NA: { avg: 25, sr: 115 }, N: { avg: 25, sr: 105 }, D: { avg: 20, sr: 95 }, A: { avg: 18, sr: 125 } },
    tier4: { NA: { avg: 18, sr: 100 }, N: { avg: 18, sr: 90 }, D: { avg: 15, sr: 85 }, A: { avg: 15, sr: 110 } },
    tier5: { NA: { avg: 12, sr: 85 }, N: { avg: 12, sr: 80 }, D: { avg: 10, sr: 70 }, A: { avg: 10, sr: 95 } },
};
const ODI_PROFILES = {
    tier1: { NA: { avg: 45, sr: 95 }, N: { avg: 45, sr: 90 }, D: { avg: 40, sr: 80 }, A: { avg: 35, sr: 105 } },
    tier2: { NA: { avg: 38, sr: 90 }, N: { avg: 38, sr: 85 }, D: { avg: 32, sr: 75 }, A: { avg: 28, sr: 100 } },
    tier3: { NA: { avg: 30, sr: 85 }, N: { avg: 30, sr: 80 }, D: { avg: 25, sr: 70 }, A: { avg: 22, sr: 90 } },
    tier4: { NA: { avg: 22, sr: 75 }, N: { avg: 22, sr: 70 }, D: { avg: 18, sr: 65 }, A: { avg: 16, sr: 85 } },
    tier5: { NA: { avg: 15, sr: 70 }, N: { avg: 15, sr: 65 }, D: { avg: 12, sr: 60 }, A: { avg: 12, sr: 75 } },
};
const FC_PROFILES = {
    tier1: { NA: { avg: 45, sr: 55 }, N: { avg: 45, sr: 50 }, D: { avg: 48, sr: 45 }, A: { avg: 40, sr: 65 } },
    tier2: { NA: { avg: 38, sr: 50 }, N: { avg: 38, sr: 45 }, D: { avg: 40, sr: 40 }, A: { avg: 32, sr: 60 } },
    tier3: { NA: { avg: 30, sr: 45 }, N: { avg: 30, sr: 40 }, D: { avg: 32, sr: 38 }, A: { avg: 25, sr: 55 } },
    tier4: { NA: { avg: 22, sr: 40 }, N: { avg: 22, sr: 38 }, D: { avg: 25, sr: 35 }, A: { avg: 18, sr: 48 } },
    tier5: { NA: { avg: 15, sr: 35 }, N: { avg: 15, sr: 32 }, D: { avg: 18, sr: 30 }, A: { avg: 12, sr: 40 } },
};

export const BATTING_PROFILES = {
  [Format.T20]: T20_PROFILES,
  [Format.ODI]: ODI_PROFILES,
  [Format.FIRST_CLASS]: FC_PROFILES,
  [Format.DEVELOPMENT_T20]: T20_PROFILES,
  [Format.DEVELOPMENT_ODI]: ODI_PROFILES,
  [Format.DEVELOPMENT_FIRST_CLASS]: FC_PROFILES,
  [Format.RISE_T20]: T20_PROFILES,
  [Format.RISE_ODI]: ODI_PROFILES,
  [Format.RISE_FIRST_CLASS]: FC_PROFILES,
};

export const LoadingSpinner = () => (
    React.createElement("div", { className: "flex justify-center items-center h-full w-full" },
        React.createElement("div", { className: "animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-teal-500 dark:border-teal-400" })
    )
);

export const aggregateStats = (player: Player, formats: Format[]): PlayerStats => {
    const total = generateSingleFormatInitialStats();
    formats.forEach(f => {
        const s = player.stats[f];
        if (s) {
            total.matches += s.matches;
            total.runs += s.runs;
            total.ballsFaced += s.ballsFaced;
            total.dismissals += s.dismissals;
            if (s.highestScore > total.highestScore) total.highestScore = s.highestScore;
            total.hundreds += s.hundreds;
            total.fifties += s.fifties;
            total.thirties += s.thirties;
            total.fours += s.fours;
            total.sixes += s.sixes;
            if (s.fastestFifty > 0 && (total.fastestFifty === 0 || s.fastestFifty < total.fastestFifty)) total.fastestFifty = s.fastestFifty;
            if (s.fastestHundred > 0 && (total.fastestHundred === 0 || s.fastestHundred < total.fastestHundred)) total.fastestHundred = s.fastestHundred;
            
            total.wickets += s.wickets;
            total.ballsBowled += s.ballsBowled;
            total.runsConceded += s.runsConceded;
            total.threeWicketHauls += s.threeWicketHauls;
            total.fiveWicketHauls += s.fiveWicketHauls;
            total.catches += s.catches;
            total.runOuts += s.runOuts;
            total.manOfTheMatchAwards += s.manOfTheMatchAwards;

            // Best bowling comparison
            if (s.bestBowlingWickets > total.bestBowlingWickets || (s.bestBowlingWickets === total.bestBowlingWickets && s.bestBowlingRuns < total.bestBowlingRuns)) {
                total.bestBowlingWickets = s.bestBowlingWickets;
                total.bestBowlingRuns = s.bestBowlingRuns;
                total.bestBowling = s.bestBowling;
            }
        }
    });

    total.average = total.dismissals > 0 ? total.runs / total.dismissals : total.runs;
    total.strikeRate = total.ballsFaced > 0 ? (total.runs / total.ballsFaced) * 100 : 0;
    total.bowlingAverage = total.wickets > 0 ? total.runsConceded / total.wickets : 0; 
    total.economy = total.ballsBowled > 0 ? (total.runsConceded / total.ballsBowled) * 6 : 0;

    return total;
};

export const calculatePopularityPoints = (result: MatchResult, format: Format, userTeamId: string): number => {
    let points = 0;
    const userInnings = [result.firstInning, result.secondInning, result.thirdInning, result.fourthInning].filter(i => i?.teamId === userTeamId);
    const oppInnings = [result.firstInning, result.secondInning, result.thirdInning, result.fourthInning].filter(i => i && i.teamId !== userTeamId);

    if (format.includes('T20')) {
        userInnings.forEach(ing => { if (ing && ing.score >= 200) points += 1; });
        oppInnings.forEach(ing => { if (ing && ing.wickets === 10) points += 1; });
        userInnings.forEach(ing => { if (ing) { ing.batting.forEach(b => { if (b.runs >= 100) points += 1; }); } });
        oppInnings.forEach(ing => { if (ing) { ing.bowling.forEach(b => { if (b.wickets >= 5) points += 1; }); } });
    } else if (format.includes('One-Day') || format.includes('List-A')) {
        userInnings.forEach(ing => { if (ing && ing.score >= 300) points += 1; });
        userInnings.forEach(ing => { if (ing) { ing.batting.forEach(b => { if (b.runs >= 100) points += 1; }); } });
        oppInnings.forEach(ing => { if (ing) { ing.bowling.forEach(b => { if (b.wickets >= 5) points += 1; }); } });
    } else {
        userInnings.forEach(ing => { if (ing && ing.score >= 300) points += 1; });
        userInnings.forEach(ing => { if (ing) { ing.batting.forEach(b => { if (b.runs >= 200) points += 1; }); } });
        const bowlerWickets: Record<string, number> = {};
        oppInnings.forEach(ing => { if (ing) { ing.bowling.forEach(b => { bowlerWickets[b.playerId] = (bowlerWickets[b.playerId] || 0) + b.wickets; }); } });
        Object.values(bowlerWickets).forEach(w => { if (w >= 10) points += 1; });
    }
    return points;
};

export const generateMatchNews = (result: MatchResult, format: string, sponsorship: Sponsorship): NewsArticle => {
    const sponsorName = sponsorship ? sponsorship.sponsorName : 'Premier League';
    const tournamentName = sponsorship ? sponsorship.tournamentName : 'Tournament';
    return {
        id: `news-${Date.now()}-${Math.random()}`,
        headline: `${result.winnerId ? 'Victory' : 'Draw'} in ${sponsorName} ${tournamentName}`,
        date: new Date().toLocaleDateString(),
        excerpt: result.summary,
        content: `
            <p><strong>${sponsorName} ${tournamentName} Update:</strong></p>
            <p>${result.summary}</p>
            <p><strong>Man of the Match:</strong> ${result.manOfTheMatch.playerName} (${result.manOfTheMatch.summary})</p>
            <p>The ${format} continues to heat up as teams battle for the prestigious ${sponsorName} title.</p>
        `,
        type: 'match'
    };
};

export const generateLeagueSchedule = (teams: Team[], format: Format): Match[] => {
    const matches: Match[] = [];
    const roundRobinMatches: Match[] = [];
    const teamCount = teams.length;

    if (teamCount === 0) return [];

    const getDate = (roundNum: number) => `Match Day ${roundNum}`;

    // Implementation of Circle Method for Round Robin
    const workingIndices = teams.map((_, i) => i);
    if (teamCount % 2 !== 0) workingIndices.push(-1); // -1 indicates Bye
    const N = workingIndices.length;
    
    const allRoundsMatches: Match[][] = [];

    // Generate First Leg Rounds (N-1 rounds)
    for (let round = 0; round < N - 1; round++) {
        const roundMatches: Match[] = [];
        for (let i = 0; i < N / 2; i++) {
            const idx1 = workingIndices[i];
            const idx2 = workingIndices[N - 1 - i];
            if (idx1 !== -1 && idx2 !== -1) {
                roundMatches.push({
                    matchNumber: 0, // To be assigned later
                    teamA: teams[idx1].name,
                    teamAId: teams[idx1].id,
                    vs: 'vs',
                    teamB: teams[idx2].name,
                    teamBId: teams[idx2].id,
                    date: getDate(round + 1),
                    group: 'Round-Robin'
                });
            }
        }
        allRoundsMatches.push(roundMatches);
        
        // Rotate indices: Keep index 0 fixed, rotate the rest clockwise
        const last = workingIndices.pop()!;
        workingIndices.splice(1, 0, last);
    }
    
    // Add Leg 1 matches
    allRoundsMatches.forEach(round => roundRobinMatches.push(...round));
    
    // Add Leg 2 matches (Reverse fixtures, date offset)
    const leg1RoundCount = N - 1;
    allRoundsMatches.forEach((round, rIdx) => {
        const leg2Round = round.map(m => ({
            ...m,
            teamA: m.teamB,
            teamAId: m.teamBId,
            teamB: m.teamA,
            teamBId: m.teamAId,
            date: getDate(leg1RoundCount + rIdx + 1)
        }));
        roundRobinMatches.push(...leg2Round);
    });
    
    // Assign sequential match numbers
    roundRobinMatches.forEach((m, i) => m.matchNumber = i + 1);
    matches.push(...roundRobinMatches);

    // Semi-Finals and Final
    const lastLeagueDay = (N - 1) * 2;
    matches.push({
        matchNumber: 'SF1',
        teamA: '1st',
        vs: 'vs',
        teamB: '4th',
        date: getDate(lastLeagueDay + 2), // Day off after league
        group: 'Semi-Finals'
    });
    matches.push({
        matchNumber: 'SF2',
        teamA: '2nd',
        vs: 'vs',
        teamB: '3rd',
        date: getDate(lastLeagueDay + 3),
        group: 'Semi-Finals'
    });
    matches.push({
        matchNumber: 'Final',
        teamA: 'SF1 W',
        vs: 'vs',
        teamB: 'SF2 W',
        date: getDate(lastLeagueDay + 5), // Day off after semis
        group: 'Final'
    });

    return matches;
};

export const negotiateSponsorships = (popularity: number): Record<Format, Sponsorship> => {
    const TOURNAMENT_SUFFIXES = ['Super League', 'Cup', 'Trophy', 'Championship', 'Bash', 'Shield', 'Showdown'];
    
    const getRandomSuffix = () => TOURNAMENT_SUFFIXES[Math.floor(Math.random() * TOURNAMENT_SUFFIXES.length)];
    
    const newSponsorships: Partial<Record<Format, Sponsorship>> = {};
    
    Object.values(Format).forEach(format => {
        let bestBrand = BRANDS[3]; // Default to lowest tier (G.S - assuming index 3 is lowest requirement)
        const thresholds = SPONSOR_THRESHOLDS[format];
        
        // Find best eligible brand
        if (popularity >= thresholds["Sike's"]) bestBrand = BRANDS.find(b => b.name === "Sike's") || bestBrand;
        else if (popularity >= thresholds["Signify"]) bestBrand = BRANDS.find(b => b.name === "Signify") || bestBrand;
        else if (popularity >= thresholds["Malik"]) bestBrand = BRANDS.find(b => b.name === "Malik") || bestBrand;
        else if (popularity >= thresholds["G.S"]) bestBrand = BRANDS.find(b => b.name === "G.S") || bestBrand;

        // Format-specific naming logic
        let suffix = getRandomSuffix();
        if (format.includes("T20")) suffix = Math.random() > 0.5 ? "Super League" : "Blast";
        if (format.includes("First-Class")) suffix = "Shield";
        if (format.includes("One-Day") || format.includes("List-A")) suffix = "Cup";

        newSponsorships[format] = {
            sponsorName: bestBrand.name,
            tournamentName: `${suffix}`,
            logoColor: bestBrand.color
        };
    });

    return newSponsorships as Record<Format, Sponsorship>;
};

export const generatePreMatchNews = (match: Match, gameData: GameData): NewsArticle => {
    const teamAData = gameData.teams.find(t => t.name === match.teamA);
    const teamBData = gameData.teams.find(t => t.name === match.teamB);
    const ground = gameData.grounds.find(g => g.code === gameData.allTeamsData.find(t => t.name === match.teamA)?.homeGround);
    
    const headline = `Preview: ${match.teamA} vs ${match.teamB}`;
    const excerpt = `All eyes on ${ground?.name || 'the stadium'} as two giants collide.`;
    
    const content = `
        <p><strong>Match Preview</strong></p>
        <p>The stage is set at ${ground?.name} for a thrilling encounter between ${match.teamA} and ${match.teamB}.</p>
        <p><strong>Pitch Report:</strong> The ${ground?.pitch || 'pitch'} is expected to favor ${ground?.pitch.includes('Spinner') ? 'spinners' : ground?.pitch.includes('Batting') ? 'batsmen' : 'seamers'}. Captains will likely look to ${ground?.pitch.includes('Batting') ? 'chase' : 'bat first'}.</p>
        <p><strong>Key Players:</strong> Keep an eye on the top order of ${match.teamA} and the bowling attack of ${match.teamB}.</p>
    `;

    return {
        id: `news-pre-${Date.now()}`,
        headline,
        date: new Date().toLocaleDateString(),
        excerpt,
        content,
        type: 'match'
    };
};

export interface PlayerRanking {
    player: Player;
    points: number;
    teamName: string;
}

export const calculatePlayerRankings = (players: Player[], format: Format, teams: Team[]): { batters: PlayerRanking[], bowlers: PlayerRanking[], allRounders: PlayerRanking[] } => {
    const scoredPlayers = players.map(p => {
        const s = p.stats[format];
        if (!s || s.matches === 0) return null;
        const teamName = teams.find(t => t.squad.some(sp => sp.id === p.id))?.name || 'Free Agent';

        // Batting Points
        // 1 point per run
        // 10 pts for Not Out (approximated by avg > runs/matches slightly or manually if tracked, but let's use Average weight)
        // Average * 1.5
        // Strike Rate * 0.5 (T20 weight higher?)
        // 50 pts for 100, 20 pts for 50
        const batPts = (s.runs * 1.0) + (s.average * 2) + (s.strikeRate * 0.5) + (s.hundreds * 50) + (s.fifties * 20) + (s.sixes * 2);

        // Bowling Points
        // 25 pts per wicket
        // Economy Bonus: (10 - Econ) * 10 (if positive). Economy is crucial.
        // Average Bonus: (30 - Avg) * 5 (if positive)
        // 50 pts for 5-fer
        const economyBonus = s.economy > 0 ? Math.max(0, (9 - s.economy) * 20) : 0;
        const avgBonus = s.bowlingAverage > 0 ? Math.max(0, (35 - s.bowlingAverage) * 5) : 0;
        const bowlPts = (s.wickets * 25) + economyBonus + avgBonus + (s.fiveWicketHauls * 50) + (s.threeWicketHauls * 10);

        // All Rounder
        // Simple sum, maybe weighted?
        const arPts = (batPts * 0.6) + (bowlPts * 1.0); // Bowling is harder to get high points raw, so balance it.

        return {
            player: p,
            teamName,
            batPts: Math.round(batPts),
            bowlPts: Math.round(bowlPts),
            arPts: Math.round(arPts)
        };
    }).filter(Boolean) as { player: Player, teamName: string, batPts: number, bowlPts: number, arPts: number }[];

    const batters = [...scoredPlayers].sort((a, b) => b.batPts - a.batPts).map(p => ({ player: p.player, points: p.batPts, teamName: p.teamName }));
    const bowlers = [...scoredPlayers].sort((a, b) => b.bowlPts - a.bowlPts).map(p => ({ player: p.player, points: p.bowlPts, teamName: p.teamName }));
    const allRounders = [...scoredPlayers].filter(p => p.batPts > 50 && p.bowlPts > 50).sort((a, b) => b.arPts - a.arPts).map(p => ({ player: p.player, points: p.arPts, teamName: p.teamName }));

    return { batters, bowlers, allRounders };
};
