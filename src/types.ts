
export enum Format {
    T20 = 'Premier T20 League',
    ODI = 'Premier One-Day Cup',
    FIRST_CLASS = 'Premier First-Class Shield',
    DEVELOPMENT_T20 = 'Development T20 Cup',
    DEVELOPMENT_ODI = 'Development List-A Cup',
    DEVELOPMENT_FIRST_CLASS = 'Development First-Class Cup',
    RISE_T20 = 'Rise T20 Cup',
    RISE_ODI = 'Rise List-A Cup',
    RISE_FIRST_CLASS = 'Rise First-Class Cup'
}

export enum PlayerRole {
  BATSMAN = 'BT',
  WICKET_KEEPER = 'WK',
  ALL_ROUNDER = 'AR',
  SPIN_BOWLER = 'SB',
  FAST_BOWLER = 'BL',
}

export type BattingStyle = 'A' | 'D' | 'N' | 'NA';

export type Strategy = 'defensive' | 'balanced' | 'attacking';

export interface PlayerStats {
  matches: number;
  runs: number;
  highestScore: number;
  average: number;
  strikeRate: number;
  ballsFaced: number;
  dismissals: number;
  hundreds: number;
  fifties: number;
  thirties: number;
  fours: number;
  sixes: number;
  fastestFifty: number;
  fastestHundred: number;
  wickets: number;
  economy: number;
  bestBowling: string;
  bestBowlingWickets: number;
  bestBowlingRuns: number;
  bowlingAverage: number;
  ballsBowled: number;
  runsConceded: number;
  threeWicketHauls: number;
  fiveWicketHauls: number;
  catches: number;
  runOuts: number;
  manOfTheMatchAwards: number;
}

export interface Player {
  id: string;
  name: string;
  nationality: string;
  role: PlayerRole;
  battingSkill: number;
  secondarySkill: number;
  style: BattingStyle;
  isOpener: boolean;
  isForeign: boolean;
  teamName?: string;
  customProfiles?: {
    [key in Format]?: { avg: number; sr: number };
  };
  stats: Record<Format, PlayerStats>;
}

export interface Team {
  id: string;
  name: string;
  squad: Player[];
  captains: {
    [key in Format]?: string;
  };
}

export interface Ground {
  name: string;
  code: string;
  pitch: string;
  dimensions?: string;
  weather?: 'Sunny' | 'Overcast' | 'Rainy' | 'Humid' | 'Dry';
  boundarySize?: 'Small' | 'Medium' | 'Large';
  outfieldSpeed?: 'Fast' | 'Medium' | 'Slow' | 'Lightning';
  capacity?: number;
}

export interface TeamData {
  id: string;
  name: string;
  homeGround: string;
  logo: string;
  isDevelopmentTeam?: boolean;
}

export interface Match {
    matchNumber: number | string;
    teamA: string; // Team Name
    teamAId?: string; // Added for safer reference
    vs: string;
    teamB: string; // Team Name
    teamBId?: string; // Added for safer reference
    date: string;
    group: 'Round-Robin' | 'Semi-Finals' | 'Final';
}

export interface NewsArticle {
    id: string;
    headline: string;
    date: string;
    excerpt: string;
    content: string;
    type?: 'match' | 'transfer' | 'league' | 'squad';
}

export interface Standing {
    teamId: string;
    teamName: string;
    played: number;
    won: number;
    lost: number;
    drawn: number;
    points: number;
    netRunRate: number;
    runsFor?: number;
    runsAgainst?: number;
}

export type AppState = 'MAIN_MENU' | 'TEAM_SELECTION' | 'CAREER_HUB';

export type CareerScreen = 'DASHBOARD' | 'LEAGUES' | 'LINEUPS' | 'EDITOR' | 'NEWS' | 'STATS' | 'SETTINGS' | 'PLAYER_PROFILE' | 'MATCH_RESULT' | 'FORWARD_RESULTS' | 'AWARDS_RECORDS' | 'TRANSFERS' | 'END_OF_FORMAT' | 'COMPARISON' | 'SELECT_PLAYER_FOR_COMPARISON_SLOT_1' | 'SELECT_PLAYER_FOR_COMPARISON_SLOT_2' | 'SCHEDULE' | 'LIVE_MATCH' | 'ASSISTANT' | 'SPONSOR_ROOM' | 'CUSTOMIZATION';

export interface BattingPerformance {
    playerId: string;
    playerName: string;
    runs: number;
    balls: number;
    fours: number;
    sixes: number;
    isOut: boolean;
    dismissalText: string;
    dismissal: {
        type: 'not out' | 'bowled' | 'caught';
        bowlerId: string;
        fielderId?: string;
    }
    ballsToFifty?: number;
    ballsToHundred?: number;
}

export interface BowlingPerformance {
    playerId: string;
    playerName: string;
    overs: string;
    maidens: number;
    runsConceded: number;
    wickets: number;
    ballsBowled: number;
}

export interface Inning {
    teamId: string;
    teamName: string;
    score: number;
    wickets: number;
    overs: string;
    batting: BattingPerformance[];
    bowling: BowlingPerformance[];
    extras: number;
    // Fix: Added recentBalls to Inning interface
    recentBalls?: string[];
}

export interface MatchResult {
    matchNumber: number | string;
    winnerId: string | null;
    loserId: string | null;
    isDraw?: boolean;
    summary: string;
    firstInning: Inning;
    secondInning: Inning;
    thirdInning?: Inning;
    fourthInning?: Inning;
    manOfTheMatch: {
        playerId: string;
        playerName: string;
        teamId: string;
        summary: string;
    }
    tossWinnerId?: string;
    tossDecision?: 'bat' | 'bowl';
}

export interface Award {
    season: number;
    format: Format;
    winnerTeamId: string;
    winnerTeamName: string;
    bestBatter: { playerId: string, playerName: string, teamName: string, runs: number };
    bestBowler: { playerId: string, playerName: string, teamName: string, wickets: number };
}

export interface ScoreLimits {
  maxRuns?: number;
  maxWickets?: number;
}

export type InningLimits = {
  [key: number]: ScoreLimits;
};

export interface BatterVsBowlerRecord {
    batterId: string;
    batterName: string;
    bowlerId: string;
    bowlerName: string;
    runs: number;
    balls: number;
    dismissals: number;
}

export interface TeamVsTeamRecord {
    teamAId: string;
    teamBId: string;
    teamAName: string;
    teamBName: string;
    matches: number;
    teamAWins: number;
}

export interface PlayerVsTeamRecord {
    playerId: string;
    playerName: string;
    playerRole: PlayerRole;
    vsTeamId: string;
    vsTeamName: string;
    runs: number;
    balls: number;
    dismissals: number;
    wickets: number;
    runsConceded: number;
    ballsBowled: number;
}

export interface PromotionRecord {
    season: number;
    promotedTeamId: string;
    promotedTeamName: string;
    relegatedTeamId: string;
    relegatedTeamName: string;
}

export interface Sponsorship {
    sponsorName: string;
    tournamentName: string;
    logoColor: string;
    tournamentLogo?: string;
    tvChannel?: string;
    tvLogo?: string;
}

export interface Brand {
    name: string;
    color: string;
    style: string;
    logo: string;
}

export interface TVChannel {
    id: string;
    name: string;
    logo: string;
    color: string;
    minPopularity: number;
    tier: 'Premium' | 'Standard' | 'Budget';
}

export interface GameData {
  userTeamId: string;
  teams: Team[];
  grounds: Ground[];
  allTeamsData: TeamData[];
  allPlayers: Player[];
  schedule: Record<Format, Match[]>;
  currentMatchIndex: Record<Format, number>;
  standings: Record<Format, Standing[]>;
  matchResults: Record<Format, MatchResult[]>;
  playingXIs: Record<string, Partial<Record<Format, string[]>>>;
  currentSeason: number;
  currentFormat: Format;
  awardsHistory: Award[];
  scoreLimits?: Record<string, Partial<Record<Format, InningLimits>>>;
  records: {
    batterVsBowler: BatterVsBowlerRecord[];
    teamVsTeam: TeamVsTeamRecord[];
    playerVsTeam: PlayerVsTeamRecord[];
  };
  promotionHistory: PromotionRecord[];
  popularity: number;
  sponsorships: Record<Format, Sponsorship>;
  news: NewsArticle[];
  activeMatch: LiveMatchState | null;
  availableBrands?: Brand[];
  availableTVChannels?: TVChannel[];
}

export interface LiveMatchState {
    status: 'toss' | 'ready' | 'inprogress' | 'inning_break' | 'completed';
    match: Match;
    currentInningIndex: number;
    innings: Inning[];
    target: number | null;
    currentBatters: { strikerId: string; nonStrikerId: string };
    currentBowlerId: string;
    recentBalls: string[];
    commentary: string[];
    battingTeam: Team;
    bowlingTeam: Team;
    requiredRunRate: number;
    currentPartnership: { runs: number, balls: number };
    fallOfWickets: { score: number, wicket: number, over: string, player: string }[];
    waitingFor: 'openers' | 'batter' | 'bowler' | 'batter_arrival' | 'bowler_change' | null;
    strategies: {
        batting: Strategy;
        bowling: Strategy;
    };
    autoPlayType: 'regular' | 'inning' | 'match' | null;
    tossWinnerId: string | null;
    tossDecision: 'bat' | 'bowl' | null;
}

export interface Message {
    id: string;
    text: string;
    sender: 'user' | 'model' | 'bot';
    timestamp?: Date;
}
