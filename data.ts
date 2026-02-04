
import { Player, PlayerRole, TeamData, Ground, Match, PlayerStats, NewsArticle, Format, Sponsorship } from './types';

export const MAX_SQUAD_SIZE = 22;
export const MIN_SQUAD_SIZE = 15;
export const MAX_FOREIGN_PLAYERS = 3;

export const BRANDS = [
    { name: "Sike's", color: "text-yellow-500", style: "font-extrabold tracking-tight font-display", logo: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2l2.4 7.2h7.6l-6 4.8 2.4 7.2-6-4.8-6 4.8 2.4-7.2-6-4.8h7.6z" /></svg>' },
    { name: "Signify", color: "text-cyan-400", style: "font-sans tracking-widest uppercase", logo: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" /></svg>' },
    { name: "Malik", color: "text-red-600", style: "font-serif italic font-bold", logo: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M14.06 9.02l.92.92L3.92 21h16.16V23H3a2 2 0 0 1-2-2V5c0-1.1.9-2 2-2h1V9.02zM12 3a2 2 0 0 1 2 2v4h-4V5a2 2 0 0 1 2-2z"/></svg>' },
    { name: "G.S", color: "text-green-500", style: "font-mono font-bold", logo: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4z" /></svg>' }
];

export const TV_CHANNELS = [
    { id: 'tv-prime', name: 'PrimeCast Ultra', logo: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><rect x="2" y="4" width="20" height="16" rx="2" /><circle cx="12" cy="12" r="4" fill="white" fill-opacity="0.3"/><path d="M10 9l5 3-5 3V9z" fill="white"/></svg>', color: 'text-purple-500', minPopularity: 40, tier: 'Premium' },
    { id: 'tv-roar', name: 'Roar Sports', logo: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2l3 6h6l-5 4 2 6-6-4-6 4 2-6-5-4h6z"/></svg>', color: 'text-red-600', minPopularity: 55, tier: 'Premium' },
    { id: 'tv-now', name: 'CricketNow HD', logo: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M4 6h16v12H4z"/><path d="M8 10h8v4H8z" fill="white"/></svg>', color: 'text-blue-500', minPopularity: 30, tier: 'Standard' },
    { id: 'tv-sig', name: 'Signify TV', logo: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M2 12h20M2 12l10-9 10 9M2 12l10 9 10-9" stroke="currentColor" stroke-width="2" fill="none"/><circle cx="12" cy="12" r="3" fill="currentColor"/></svg>', color: 'text-cyan-400', minPopularity: 50, tier: 'Premium' },
];

export const TOURNAMENT_LOGOS = [
    { id: 'cup-1', name: 'Classic Cup', svg: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M5 2h14a1 1 0 0 1 1 1v4a3 3 0 0 1-3 3h-1v2h2a1 1 0 0 1 1 1v3a1 1 0 0 1-1 1h-3v3h2a1 1 0 0 1 1 1v1H6v-1a1 1 0 0 1 1-1h2v-3H6a1 1 0 0 1-1-1v-3a1 1 0 0 1 1-1h2v-2H7a3 3 0 0 1-3-3V3a1 1 0 0 1 1-1z"/></svg>' },
    { id: 'shield-1', name: 'Grand Shield', svg: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm0 10.99h7c-.53 4.12-3.28 7.79-7 8.94V12H5V6.3l7-3.11v8.8z"/></svg>' },
];

export const SPONSOR_THRESHOLDS = {
    [Format.T20]: { "Sike's": 40, "Signify": 35, "Malik": 30, "G.S": 25 },
    [Format.ODI]: { "Sike's": 45, "Signify": 40, "Malik": 30, "G.S": 25 },
    [Format.FIRST_CLASS]: { "Sike's": 40, "Signify": 35, "Malik": 30, "G.S": 25 },
    [Format.DEVELOPMENT_T20]: { "Sike's": 40, "Signify": 35, "Malik": 30, "G.S": 25 },
    [Format.DEVELOPMENT_ODI]: { "Sike's": 45, "Signify": 40, "Malik": 30, "G.S": 25 },
    [Format.DEVELOPMENT_FIRST_CLASS]: { "Sike's": 40, "Signify": 35, "Malik": 30, "G.S": 25 },
    [Format.RISE_T20]: { "Sike's": 40, "Signify": 35, "Malik": 30, "G.S": 25 },
    [Format.RISE_ODI]: { "Sike's": 45, "Signify": 40, "Malik": 30, "G.S": 25 },
    [Format.RISE_FIRST_CLASS]: { "Sike's": 40, "Signify": 35, "Malik": 30, "G.S": 25 },
};

export const INITIAL_SPONSORSHIPS: Record<Format, Sponsorship> = {
    [Format.T20]: { sponsorName: "Sike's", tournamentName: "Super Smash 26", logoColor: "text-yellow-500", tournamentLogo: TOURNAMENT_LOGOS[0].svg, tvChannel: "CricketNow HD", tvLogo: "" },
    [Format.ODI]: { sponsorName: "Signify", tournamentName: "Pro Cup 26", logoColor: "text-cyan-400", tournamentLogo: TOURNAMENT_LOGOS[0].svg, tvChannel: "Signify TV", tvLogo: "" },
    [Format.FIRST_CLASS]: { sponsorName: "Malik", tournamentName: "Shield 26", logoColor: "text-red-600", tournamentLogo: TOURNAMENT_LOGOS[1].svg, tvChannel: "PrimeCast Ultra", tvLogo: "" },
    [Format.DEVELOPMENT_T20]: { sponsorName: "G.S", tournamentName: "Future Stars T20", logoColor: "text-green-500", tournamentLogo: TOURNAMENT_LOGOS[0].svg, tvChannel: "CricketNow HD", tvLogo: "" },
    [Format.DEVELOPMENT_ODI]: { sponsorName: "Sike's", tournamentName: "Emerging Cup", logoColor: "text-yellow-500", tournamentLogo: TOURNAMENT_LOGOS[0].svg, tvChannel: "CricketNow HD", tvLogo: "" },
    [Format.DEVELOPMENT_FIRST_CLASS]: { sponsorName: "Signify", tournamentName: "Youth Shield", logoColor: "text-cyan-400", tournamentLogo: TOURNAMENT_LOGOS[1].svg, tvChannel: "Signify TV", tvLogo: "" },
    [Format.RISE_T20]: { sponsorName: "Malik", tournamentName: "Challenger T20", logoColor: "text-red-600", tournamentLogo: TOURNAMENT_LOGOS[0].svg, tvChannel: "CricketNow HD", tvLogo: "" },
    [Format.RISE_ODI]: { sponsorName: "G.S", tournamentName: "Rising Stars Cup", logoColor: "text-green-500", tournamentLogo: TOURNAMENT_LOGOS[0].svg, tvChannel: "CricketNow HD", tvLogo: "" },
    [Format.RISE_FIRST_CLASS]: { sponsorName: "Sike's", tournamentName: "Foundation Shield", logoColor: "text-yellow-500", tournamentLogo: TOURNAMENT_LOGOS[1].svg, tvChannel: "CricketNow HD", tvLogo: "" }
};

export const TEAMS: TeamData[] = [
  { id: 'team1', name: 'Kings', homeGround: 'KCG', logo: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><path d="M50 5 L95 25 L95 75 L50 95 L5 75 L5 25 Z" fill="#FBBF24" stroke="#B45309" stroke-width="4"/><path d="M50 30 l-15 40 l30 0 l-15 -40" fill="#FFFFFF"/><circle cx="50" cy="22" r="6" fill="#FFFFFF"/></svg>', isDevelopmentTeam: false },
  { id: 'team2', name: 'Stars', homeGround: 'SG', logo: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><circle cx="50" cy="50" r="45" fill="#10B981" stroke="#065F46" stroke-width="4"/><path d="M50 20 L58 40 L80 40 L62 55 L68 75 L50 62 L32 75 L38 55 L20 40 L42 40 Z" fill="#FFFFFF"/></svg>', isDevelopmentTeam: false },
  { id: 'team3', name: 'Sixers', homeGround: 'TG', logo: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><rect x="10" y="10" width="80" height="80" rx="20" fill="#EC4899" stroke="#831843" stroke-width="4"/><text x="50" y="65" font-family="Arial" font-size="50" font-weight="bold" fill="#FFFFFF" text-anchor="middle">6</text></svg>', isDevelopmentTeam: false },
  { id: 'team4', name: 'Gladiators', homeGround: 'LWG', logo: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><path d="M20 20 H80 L80 60 Q50 95 20 60 Z" fill="#8B5CF6" stroke="#4C1D95" stroke-width="4"/></svg>', isDevelopmentTeam: false },
  { id: 'team5', name: 'Eagles', homeGround: 'MCG', logo: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><circle cx="50" cy="50" r="45" fill="#3B82F6" stroke="#1E3A8A" stroke-width="4"/></svg>', isDevelopmentTeam: false },
  { id: 'team6', name: 'Hawks', homeGround: 'HGG', logo: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><path d="M50 5 L95 25 L95 75 L50 95 L5 75 L5 25 Z" fill="#F97316" stroke="#7C2D12" stroke-width="4"/></svg>', isDevelopmentTeam: false },
  { id: 'devteam1', name: 'Titans', homeGround: 'KNFG', logo: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><rect x="10" y="10" width="80" height="80" fill="#60A5FA"/><text x="50" y="60" font-family="Arial" font-size="40" text-anchor="middle" fill="#1E3A8A">T</text></svg>', isDevelopmentTeam: true },
];

export const GROUNDS: Ground[] = [
  { name: "Keenjhur Cricket Ground", code: "KCG", pitch: "Balanced Sporting Pitch", dimensions: "70m / 68m", weather: "Sunny", boundarySize: "Medium", outfieldSpeed: "Fast", capacity: 25000 },
  { name: "School Ground", code: "SG", pitch: "Dusty Spinner’s Haven", dimensions: "62m / 60m", weather: "Dry", boundarySize: "Small", outfieldSpeed: "Slow", capacity: 5000 },
  { name: "Transformer Ground", code: "TG", pitch: "Green Top", dimensions: "75m / 72m", weather: "Overcast", boundarySize: "Large", outfieldSpeed: "Medium", capacity: 12000 },
  { name: "Lake Way Ground", code: "LWG", pitch: "Batting Paradise", dimensions: "65m / 65m", weather: "Sunny", boundarySize: "Small", outfieldSpeed: "Lightning", capacity: 18000 },
  { name: "Home Gate Ground", code: "HGG", pitch: "Dead Slow Track", dimensions: "68m / 68m", weather: "Humid", boundarySize: "Medium", outfieldSpeed: "Slow", capacity: 8000 },
  { name: "Mosque Cricket Ground", code: "MCG", pitch: "Cracked Worn Surface", dimensions: "72m / 70m", weather: "Dry", boundarySize: "Large", outfieldSpeed: "Medium", capacity: 15000 },
];

export const PITCH_TYPES = [ "Balanced Sporting Pitch", "Dusty Spinner’s Haven", "Green Top", "Batting Paradise", "Dead Slow Track", "Cracked Worn Surface" ];

export const generateSingleFormatInitialStats = (): PlayerStats => ({
    matches: 0, runs: 0, highestScore: 0, average: 0, strikeRate: 0, ballsFaced: 0, dismissals: 0,
    hundreds: 0, fifties: 0, thirties: 0, fours: 0, sixes: 0, fastestFifty: 0, fastestHundred: 0,
    wickets: 0, economy: 0, bestBowling: '-', bestBowlingWickets: 0, bestBowlingRuns: 0,
    bowlingAverage: 0, ballsBowled: 0, runsConceded: 0, threeWicketHauls: 0, fiveWicketHauls: 0,
    catches: 0, runOuts: 0, manOfTheMatchAwards: 0,
});

export const generateInitialStats = (): { [key in Format]: PlayerStats } => {
    const stats: any = {};
    Object.values(Format).forEach(f => stats[f] = generateSingleFormatInitialStats());
    return stats;
};

// --- RAW PLAYER DATA (2026 EDITION) ---
const playersRaw: any[] = [
  // Kings
  { id: 'f-kin-1', name: 'A. Haddin', nationality: 'Australia', role: PlayerRole.ALL_ROUNDER, battingSkill: 76, secondarySkill: 72, style: 'A', isOpener: false, isForeign: true },
  { id: 'f-kin-2', name: 'S. Warner', nationality: 'Australia', role: PlayerRole.BATSMAN, battingSkill: 92, secondarySkill: 10, style: 'A', isOpener: true, isForeign: true },
  { id: 'f-kin-3', name: 'N. Colin', nationality: 'New Zealand', role: PlayerRole.ALL_ROUNDER, battingSkill: 74, secondarySkill: 70, style: 'N', isOpener: false, isForeign: true },
  { id: 'l-kin-1', name: 'M. Imran', nationality: 'Local', role: PlayerRole.WICKET_KEEPER, battingSkill: 65, secondarySkill: 5, style: 'N', isOpener: false, isForeign: false },
  { id: 'l-kin-2', name: 'I. Javed', nationality: 'Local', role: PlayerRole.WICKET_KEEPER, battingSkill: 68, secondarySkill: 5, style: 'N', isOpener: true, isForeign: false },
  { id: 'l-kin-3', name: 'Nasir', nationality: 'Local', role: PlayerRole.BATSMAN, battingSkill: 72, secondarySkill: 5, style: 'N', isOpener: true, isForeign: false },
  { id: 'l-kin-4', name: 'Husnain', nationality: 'Local', role: PlayerRole.BATSMAN, battingSkill: 74, secondarySkill: 5, style: 'N', isOpener: false, isForeign: false },
  { id: 'l-kin-5', name: 'Jahid', nationality: 'Local', role: PlayerRole.BATSMAN, battingSkill: 71, secondarySkill: 5, style: 'N', isOpener: false, isForeign: false },
  { id: 'l-kin-6', name: 'M. Musa', nationality: 'Local', role: PlayerRole.BATSMAN, battingSkill: 69, secondarySkill: 15, style: 'A', isOpener: true, isForeign: false },
  { id: 'l-kin-7', name: 'Amir', nationality: 'Local', role: PlayerRole.ALL_ROUNDER, battingSkill: 65, secondarySkill: 88, style: 'N', isOpener: false, isForeign: false },
  { id: 'l-kin-8', name: 'Mansoor', nationality: 'Local', role: PlayerRole.ALL_ROUNDER, battingSkill: 62, secondarySkill: 65, style: 'N', isOpener: false, isForeign: false },
  { id: 'l-kin-9', name: 'Zia', nationality: 'Local', role: PlayerRole.FAST_BOWLER, battingSkill: 15, secondarySkill: 82, style: 'D', isOpener: false, isForeign: false },
  { id: 'l-kin-10', name: 'Rizwan', nationality: 'Local', role: PlayerRole.FAST_BOWLER, battingSkill: 12, secondarySkill: 84, style: 'D', isOpener: false, isForeign: false },
  { id: 'l-kin-11', name: 'Naseem', nationality: 'Local', role: PlayerRole.FAST_BOWLER, battingSkill: 10, secondarySkill: 92, style: 'D', isOpener: false, isForeign: false },
  { id: 'l-kin-12', name: 'Farhan (BL)', nationality: 'Local', role: PlayerRole.FAST_BOWLER, battingSkill: 14, secondarySkill: 81, style: 'D', isOpener: false, isForeign: false },
  { id: 'l-kin-13', name: 'Rahat', nationality: 'Local', role: PlayerRole.SPIN_BOWLER, battingSkill: 20, secondarySkill: 85, style: 'N', isOpener: false, isForeign: false },
  { id: 'l-kin-14', name: 'Mehrab', nationality: 'Local', role: PlayerRole.SPIN_BOWLER, battingSkill: 18, secondarySkill: 83, style: 'N', isOpener: false, isForeign: false },
  { id: 'l-kin-15', name: 'S. Hasan', nationality: 'Local', role: PlayerRole.BATSMAN, battingSkill: 68, secondarySkill: 5, style: 'N', isOpener: false, isForeign: false },

  // Stars
  { id: 'f-sta-1', name: 'Sprike', nationality: 'England', role: PlayerRole.WICKET_KEEPER, battingSkill: 88, secondarySkill: 5, style: 'A', isOpener: true, isForeign: true },
  { id: 'f-sta-2', name: 'C. Dhanushka', nationality: 'Sri Lanka', role: PlayerRole.ALL_ROUNDER, battingSkill: 70, secondarySkill: 75, style: 'D', isOpener: false, isForeign: true },
  { id: 'f-sta-3', name: 'Jordan', nationality: 'England', role: PlayerRole.FAST_BOWLER, battingSkill: 25, secondarySkill: 86, style: 'N', isOpener: false, isForeign: true },
  { id: 'l-sta-1', name: 'S. Khan', nationality: 'Local', role: PlayerRole.WICKET_KEEPER, battingSkill: 74, secondarySkill: 5, style: 'N', isOpener: true, isForeign: false },
  { id: 'l-sta-2', name: 'Haseebullah', nationality: 'Local', role: PlayerRole.WICKET_KEEPER, battingSkill: 72, secondarySkill: 5, style: 'N', isOpener: true, isForeign: false },
  { id: 'l-sta-3', name: 'Haider', nationality: 'Local', role: PlayerRole.BATSMAN, battingSkill: 81, secondarySkill: 5, style: 'N', isOpener: true, isForeign: false },
  { id: 'l-sta-4', name: 'Aslam', nationality: 'Local', role: PlayerRole.BATSMAN, battingSkill: 78, secondarySkill: 5, style: 'D', isOpener: false, isForeign: false },
  { id: 'l-sta-5', name: 'Shoaib Khan', nationality: 'Local', role: PlayerRole.BATSMAN, battingSkill: 76, secondarySkill: 5, style: 'D', isOpener: false, isForeign: false },
  { id: 'l-sta-6', name: 'A. Jamal', nationality: 'Local', role: PlayerRole.BATSMAN, battingSkill: 84, secondarySkill: 40, style: 'A', isOpener: false, isForeign: false },
  { id: 'l-sta-7', name: 'Taimoor', nationality: 'Local', role: PlayerRole.ALL_ROUNDER, battingSkill: 65, secondarySkill: 68, style: 'N', isOpener: false, isForeign: false },
  { id: 'l-sta-8', name: 'Aftab', nationality: 'Local', role: PlayerRole.ALL_ROUNDER, battingSkill: 60, secondarySkill: 72, style: 'N', isOpener: false, isForeign: false },
  { id: 'l-sta-9', name: 'Azam', nationality: 'Local', role: PlayerRole.FAST_BOWLER, battingSkill: 15, secondarySkill: 85, style: 'D', isOpener: false, isForeign: false },
  { id: 'l-sta-10', name: 'Sohail', nationality: 'Local', role: PlayerRole.FAST_BOWLER, battingSkill: 22, secondarySkill: 82, style: 'D', isOpener: false, isForeign: false },
  { id: 'l-sta-11', name: 'Aramzad', nationality: 'Local', role: PlayerRole.FAST_BOWLER, battingSkill: 18, secondarySkill: 89, style: 'D', isOpener: false, isForeign: false },
  { id: 'l-sta-12', name: 'Anwar', nationality: 'Local', role: PlayerRole.SPIN_BOWLER, battingSkill: 20, secondarySkill: 84, style: 'N', isOpener: false, isForeign: false },
  { id: 'l-sta-13', name: 'Adnan', nationality: 'Local', role: PlayerRole.SPIN_BOWLER, battingSkill: 15, secondarySkill: 80, style: 'N', isOpener: false, isForeign: false },
  { id: 'l-sta-14', name: 'Sadiq', nationality: 'Local', role: PlayerRole.BATSMAN, battingSkill: 65, secondarySkill: 5, style: 'N', isOpener: false, isForeign: false },
  { id: 'l-sta-15', name: 'Ashfaq', nationality: 'Local', role: PlayerRole.BATSMAN, battingSkill: 63, secondarySkill: 5, style: 'N', isOpener: false, isForeign: false },

  // Sixers
  { id: 'f-six-1', name: 'Lance', nationality: 'South Africa', role: PlayerRole.BATSMAN, battingSkill: 86, secondarySkill: 5, style: 'N', isOpener: true, isForeign: true },
  { id: 'f-six-2', name: 'A. Chadwick', nationality: 'West Indies', role: PlayerRole.WICKET_KEEPER, battingSkill: 82, secondarySkill: 5, style: 'A', isOpener: true, isForeign: true },
  { id: 'f-six-3', name: 'James', nationality: 'England', role: PlayerRole.ALL_ROUNDER, battingSkill: 75, secondarySkill: 78, style: 'A', isOpener: false, isForeign: true },
  { id: 'l-six-1', name: 'Ali', nationality: 'Local', role: PlayerRole.WICKET_KEEPER, battingSkill: 70, secondarySkill: 5, style: 'D', isOpener: false, isForeign: false },
  { id: 'l-six-2', name: 'R. Saad', nationality: 'Local', role: PlayerRole.WICKET_KEEPER, battingSkill: 65, secondarySkill: 5, style: 'N', isOpener: false, isForeign: false },
  { id: 'l-six-3', name: 'Atiq Ali', nationality: 'Local', role: PlayerRole.WICKET_KEEPER, battingSkill: 62, secondarySkill: 5, style: 'N', isOpener: true, isForeign: false },
  { id: 'l-six-4', name: 'Abid', nationality: 'Local', role: PlayerRole.BATSMAN, battingSkill: 85, secondarySkill: 5, style: 'N', isOpener: true, isForeign: false },
  { id: 'l-six-5', name: 'Hamid Hasan', nationality: 'Local', role: PlayerRole.BATSMAN, battingSkill: 74, secondarySkill: 5, style: 'N', isOpener: false, isForeign: false },
  { id: 'l-six-6', name: 'Zakir', nationality: 'Local', role: PlayerRole.BATSMAN, battingSkill: 72, secondarySkill: 5, style: 'N', isOpener: false, isForeign: false },
  { id: 'l-six-7', name: 'Faisal Hasan', nationality: 'Local', role: PlayerRole.BATSMAN, battingSkill: 80, secondarySkill: 5, style: 'N', isOpener: false, isForeign: false },
  { id: 'l-six-8', name: 'Khalid', nationality: 'Local', role: PlayerRole.ALL_ROUNDER, battingSkill: 66, secondarySkill: 68, style: 'N', isOpener: false, isForeign: false },
  { id: 'l-six-9', name: 'Najaf', nationality: 'Local', role: PlayerRole.ALL_ROUNDER, battingSkill: 62, secondarySkill: 65, style: 'N', isOpener: false, isForeign: false },
  { id: 'l-six-10', name: 'Ilyas', nationality: 'Local', role: PlayerRole.FAST_BOWLER, battingSkill: 15, secondarySkill: 86, style: 'D', isOpener: false, isForeign: false },
  { id: 'l-six-11', name: 'Waheed', nationality: 'Local', role: PlayerRole.FAST_BOWLER, battingSkill: 12, secondarySkill: 82, style: 'D', isOpener: false, isForeign: false },
  { id: 'l-six-12', name: 'Salman', nationality: 'Local', role: PlayerRole.FAST_BOWLER, battingSkill: 18, secondarySkill: 84, style: 'D', isOpener: false, isForeign: false },
  { id: 'l-six-13', name: 'N. Samad', nationality: 'Local', role: PlayerRole.SPIN_BOWLER, battingSkill: 20, secondarySkill: 85, style: 'N', isOpener: false, isForeign: false },
  { id: 'l-six-14', name: 'Asim', nationality: 'Local', role: PlayerRole.SPIN_BOWLER, battingSkill: 16, secondarySkill: 81, style: 'N', isOpener: false, isForeign: false },
  { id: 'l-six-15', name: 'Sohail Ahmed', nationality: 'Local', role: PlayerRole.FAST_BOWLER, battingSkill: 10, secondarySkill: 83, style: 'D', isOpener: false, isForeign: false },

  // Gladiators
  { id: 'f-gla-1', name: 'Langer', nationality: 'Australia', role: PlayerRole.FAST_BOWLER, battingSkill: 30, secondarySkill: 88, style: 'D', isOpener: false, isForeign: true },
  { id: 'f-gla-2', name: 'Sriwardna', nationality: 'Sri Lanka', role: PlayerRole.BATSMAN, battingSkill: 85, secondarySkill: 5, style: 'D', isOpener: false, isForeign: true },
  { id: 'f-gla-3', name: 'D. Quentin', nationality: 'England', role: PlayerRole.BATSMAN, battingSkill: 82, secondarySkill: 5, style: 'N', isOpener: false, isForeign: true },
  { id: 'l-gla-1', name: 'A. Sajjad', nationality: 'Local', role: PlayerRole.WICKET_KEEPER, battingSkill: 65, secondarySkill: 5, style: 'N', isOpener: false, isForeign: false },
  { id: 'l-gla-2', name: 'Shahid Latif', nationality: 'Local', role: PlayerRole.WICKET_KEEPER, battingSkill: 62, secondarySkill: 5, style: 'N', isOpener: false, isForeign: false },
  { id: 'l-gla-3', name: 'Yasir', nationality: 'Local', role: PlayerRole.BATSMAN, battingSkill: 74, secondarySkill: 5, style: 'N', isOpener: true, isForeign: false },
  { id: 'l-gla-4', name: 'Nauman', nationality: 'Local', role: PlayerRole.BATSMAN, battingSkill: 76, secondarySkill: 5, style: 'N', isOpener: false, isForeign: false },
  { id: 'l-gla-5', name: 'Aziz', nationality: 'Local', role: PlayerRole.BATSMAN, battingSkill: 71, secondarySkill: 5, style: 'N', isOpener: false, isForeign: false },
  { id: 'l-gla-6', name: 'M. Shahzain', nationality: 'Local', role: PlayerRole.BATSMAN, battingSkill: 78, secondarySkill: 5, style: 'N', isOpener: false, isForeign: false },
  { id: 'l-gla-7', name: 'Saeed', nationality: 'Local', role: PlayerRole.ALL_ROUNDER, battingSkill: 68, secondarySkill: 65, style: 'N', isOpener: false, isForeign: false },
  { id: 'l-gla-8', name: 'Jahangir', nationality: 'Local', role: PlayerRole.ALL_ROUNDER, battingSkill: 65, secondarySkill: 62, style: 'N', isOpener: false, isForeign: false },
  { id: 'l-gla-9', name: 'Waleed', nationality: 'Local', role: PlayerRole.FAST_BOWLER, battingSkill: 15, secondarySkill: 84, style: 'D', isOpener: false, isForeign: false },
  { id: 'l-gla-10', name: 'Ahsan', nationality: 'Local', role: PlayerRole.FAST_BOWLER, battingSkill: 12, secondarySkill: 81, style: 'D', isOpener: false, isForeign: false },
  { id: 'l-gla-11', name: 'Arif', nationality: 'Local', role: PlayerRole.FAST_BOWLER, battingSkill: 14, secondarySkill: 80, style: 'D', isOpener: false, isForeign: false },
  { id: 'l-gla-12', name: 'Sameen (BL)', nationality: 'Local', role: PlayerRole.FAST_BOWLER, battingSkill: 11, secondarySkill: 85, style: 'D', isOpener: false, isForeign: false },
  { id: 'l-gla-13', name: 'Bilal', nationality: 'Local', role: PlayerRole.SPIN_BOWLER, battingSkill: 20, secondarySkill: 82, style: 'N', isOpener: false, isForeign: false },
  { id: 'l-gla-14', name: 'Amjad', nationality: 'Local', role: PlayerRole.SPIN_BOWLER, battingSkill: 18, secondarySkill: 80, style: 'N', isOpener: false, isForeign: false },
  { id: 'l-gla-15', name: 'Aslam Sattar', nationality: 'Local', role: PlayerRole.WICKET_KEEPER, battingSkill: 60, secondarySkill: 5, style: 'N', isOpener: false, isForeign: false },

  // Eagles
  { id: 'f-eag-1', name: 'Parsh', nationality: 'Australia', role: PlayerRole.WICKET_KEEPER, battingSkill: 84, secondarySkill: 5, style: 'N', isOpener: true, isForeign: true },
  { id: 'f-eag-2', name: 'Waller', nationality: 'New Zealand', role: PlayerRole.FAST_BOWLER, battingSkill: 35, secondarySkill: 87, style: 'N', isOpener: false, isForeign: true },
  { id: 'f-eag-3', name: 'Aram', nationality: 'South Africa', role: PlayerRole.ALL_ROUNDER, battingSkill: 72, secondarySkill: 76, style: 'D', isOpener: false, isForeign: true },
  { id: 'l-eag-1', name: 'Zulqarnain', nationality: 'Local', role: PlayerRole.WICKET_KEEPER, battingSkill: 74, secondarySkill: 5, style: 'N', isOpener: true, isForeign: false },
  { id: 'l-eag-2', name: 'Yaqoob', nationality: 'Local', role: PlayerRole.WICKET_KEEPER, battingSkill: 71, secondarySkill: 5, style: 'N', isOpener: false, isForeign: false },
  { id: 'l-eag-3', name: 'Asad', nationality: 'Local', role: PlayerRole.BATSMAN, battingSkill: 79, secondarySkill: 5, style: 'N', isOpener: true, isForeign: false },
  { id: 'l-eag-4', name: 'Siraj', nationality: 'Local', role: PlayerRole.BATSMAN, battingSkill: 76, secondarySkill: 5, style: 'D', isOpener: true, isForeign: false },
  { id: 'l-eag-5', name: 'Fakhrudin', nationality: 'Local', role: PlayerRole.BATSMAN, battingSkill: 74, secondarySkill: 5, style: 'D', isOpener: false, isForeign: false },
  { id: 'l-eag-6', name: 'Azhar', nationality: 'Local', role: PlayerRole.BATSMAN, battingSkill: 71, secondarySkill: 5, style: 'A', isOpener: false, isForeign: false },
  { id: 'l-eag-7', name: 'Aaqib Raza', nationality: 'Local', role: PlayerRole.ALL_ROUNDER, battingSkill: 70, secondarySkill: 72, style: 'A', isOpener: false, isForeign: false },
  { id: 'l-eag-8', name: 'Nawaz', nationality: 'Local', role: PlayerRole.ALL_ROUNDER, battingSkill: 65, secondarySkill: 68, style: 'A', isOpener: false, isForeign: false },
  { id: 'l-eag-9', name: 'Atif Maqbool', nationality: 'Local', role: PlayerRole.FAST_BOWLER, battingSkill: 15, secondarySkill: 86, style: 'N', isOpener: false, isForeign: false },
  { id: 'l-eag-10', name: 'Naeem', nationality: 'Local', role: PlayerRole.FAST_BOWLER, battingSkill: 12, secondarySkill: 82, style: 'N', isOpener: false, isForeign: false },
  { id: 'l-eag-11', name: 'Zohaib', nationality: 'Local', role: PlayerRole.FAST_BOWLER, battingSkill: 18, secondarySkill: 84, style: 'N', isOpener: false, isForeign: false },
  { id: 'l-eag-12', name: 'Muzafar (BL)', nationality: 'Local', role: PlayerRole.FAST_BOWLER, battingSkill: 14, secondarySkill: 81, style: 'N', isOpener: false, isForeign: false },
  { id: 'l-eag-13', name: 'Arshad', nationality: 'Local', role: PlayerRole.SPIN_BOWLER, battingSkill: 20, secondarySkill: 85, style: 'N', isOpener: false, isForeign: false },
  { id: 'l-eag-14', name: 'Rehan', nationality: 'Local', role: PlayerRole.SPIN_BOWLER, battingSkill: 16, secondarySkill: 81, style: 'N', isOpener: false, isForeign: false },
  { id: 'l-eag-15', name: 'S. Hasan', nationality: 'Local', role: PlayerRole.BATSMAN, battingSkill: 62, secondarySkill: 5, style: 'N', isOpener: false, isForeign: false },

  // Hawks
  { id: 'f-haw-1', name: 'M.G. Glaxen', nationality: 'Australia', role: PlayerRole.ALL_ROUNDER, battingSkill: 82, secondarySkill: 80, style: 'A', isOpener: true, isForeign: true },
  { id: 'f-haw-2', name: 'Addams', nationality: 'New Zealand', role: PlayerRole.ALL_ROUNDER, battingSkill: 76, secondarySkill: 72, style: 'N', isOpener: false, isForeign: true },
  { id: 'f-haw-3', name: 'Mausechate', nationality: 'Australia', role: PlayerRole.BATSMAN, battingSkill: 80, secondarySkill: 10, style: 'A', isOpener: false, isForeign: true },
  { id: 'l-haw-1', name: 'M. Amin', nationality: 'Local', role: PlayerRole.WICKET_KEEPER, battingSkill: 78, secondarySkill: 5, style: 'NA', isOpener: true, isForeign: false },
  { id: 'l-haw-2', name: 'Zahid', nationality: 'Local', role: PlayerRole.WICKET_KEEPER, battingSkill: 74, secondarySkill: 5, style: 'N', isOpener: true, isForeign: false },
  { id: 'l-haw-3', name: 'Uddin Ali', nationality: 'Local', role: PlayerRole.WICKET_KEEPER, battingSkill: 65, secondarySkill: 5, style: 'N', isOpener: false, isForeign: false },
  { id: 'l-haw-4', name: 'Altaf', nationality: 'Local', role: PlayerRole.BATSMAN, battingSkill: 72, secondarySkill: 5, style: 'N', isOpener: false, isForeign: false },
  { id: 'l-haw-5', name: 'Qasim', nationality: 'Local', role: PlayerRole.BATSMAN, battingSkill: 70, secondarySkill: 5, style: 'N', isOpener: false, isForeign: false },
  { id: 'l-haw-6', name: 'A. Usman', nationality: 'Local', role: PlayerRole.BATSMAN, battingSkill: 68, secondarySkill: 5, style: 'N', isOpener: false, isForeign: false },
  { id: 'l-haw-7', name: 'Abass', nationality: 'Local', role: PlayerRole.BATSMAN, battingSkill: 75, secondarySkill: 5, style: 'A', isOpener: false, isForeign: false },
  { id: 'l-haw-8', name: 'Sike', nationality: 'Local', role: PlayerRole.ALL_ROUNDER, battingSkill: 88, secondarySkill: 85, style: 'NA', isOpener: true, isForeign: false },
  { id: 'l-haw-9', name: 'Wahab', nationality: 'Local', role: PlayerRole.ALL_ROUNDER, battingSkill: 65, secondarySkill: 68, style: 'N', isOpener: false, isForeign: false },
  { id: 'l-haw-10', name: 'M. Tahir', nationality: 'Local', role: PlayerRole.ALL_ROUNDER, battingSkill: 60, secondarySkill: 72, style: 'A', isOpener: false, isForeign: false },
  { id: 'l-haw-11', name: 'Faraz Khan', nationality: 'Local', role: PlayerRole.FAST_BOWLER, battingSkill: 15, secondarySkill: 86, style: 'N', isOpener: false, isForeign: false },
  { id: 'l-haw-12', name: 'Farhan', nationality: 'Local', role: PlayerRole.FAST_BOWLER, battingSkill: 18, secondarySkill: 82, style: 'N', isOpener: false, isForeign: false },
  { id: 'l-haw-13', name: 'Iqrar', nationality: 'Local', role: PlayerRole.FAST_BOWLER, battingSkill: 12, secondarySkill: 90, style: 'D', isOpener: false, isForeign: false },
  { id: 'l-haw-14', name: 'Riaz', nationality: 'Local', role: PlayerRole.SPIN_BOWLER, battingSkill: 20, secondarySkill: 85, style: 'N', isOpener: false, isForeign: false },
  { id: 'l-haw-15', name: 'M. Amjad', nationality: 'Local', role: PlayerRole.SPIN_BOWLER, battingSkill: 16, secondarySkill: 81, style: 'N', isOpener: false, isForeign: false },

  // Other Reserves
  { id: 'f-res-1', name: 'Wade', nationality: 'Australia', role: PlayerRole.FAST_BOWLER, battingSkill: 25, secondarySkill: 84, style: 'D', isOpener: false, isForeign: true },
  { id: 'f-res-2', name: 'Lin', nationality: 'Australia', role: PlayerRole.FAST_BOWLER, battingSkill: 34, secondarySkill: 68, style: 'N', isOpener: false, isForeign: true },
  { id: 'f-res-3', name: 'Wilton', nationality: 'Australia', role: PlayerRole.ALL_ROUNDER, battingSkill: 72, secondarySkill: 64, style: 'N', isOpener: false, isForeign: true },
  { id: 'f-res-4', name: 'B. Rington', nationality: 'New Zealand', role: PlayerRole.ALL_ROUNDER, battingSkill: 45, secondarySkill: 56, style: 'N', isOpener: false, isForeign: true },
  
  // Local Free Agents (Extensive List)
  { id: 'fa-1', name: 'Ahsan Qureshi', nationality: 'Local', role: PlayerRole.BATSMAN, battingSkill: 68, secondarySkill: 20, style: 'D', isOpener: true, isForeign: false },
  { id: 'fa-2', name: 'Zeeshan Malik', nationality: 'Local', role: PlayerRole.BATSMAN, battingSkill: 65, secondarySkill: 15, style: 'N', isOpener: true, isForeign: false },
  { id: 'fa-3', name: 'Imran Latif', nationality: 'Local', role: PlayerRole.BATSMAN, battingSkill: 62, secondarySkill: 10, style: 'A', isOpener: true, isForeign: false },
  { id: 'fa-4', name: 'Adnan Sheikh', nationality: 'Local', role: PlayerRole.BATSMAN, battingSkill: 67, secondarySkill: 25, style: 'N', isOpener: true, isForeign: false },
  { id: 'fa-5', name: 'Sajid Farooq', nationality: 'Local', role: PlayerRole.BATSMAN, battingSkill: 69, secondarySkill: 22, style: 'D', isOpener: true, isForeign: false },
  { id: 'fa-6', name: 'Rashid Nawaz', nationality: 'Local', role: PlayerRole.BATSMAN, battingSkill: 63, secondarySkill: 18, style: 'N', isOpener: false, isForeign: false },
  { id: 'fa-7', name: 'Kamran Siddiqui', nationality: 'Local', role: PlayerRole.BATSMAN, battingSkill: 64, secondarySkill: 28, style: 'D', isOpener: false, isForeign: false },
  { id: 'fa-8', name: 'Noman Ali', nationality: 'Local', role: PlayerRole.BATSMAN, battingSkill: 61, secondarySkill: 20, style: 'A', isOpener: false, isForeign: false },
  { id: 'fa-9', name: 'Shahid Hussain', nationality: 'Local', role: PlayerRole.BATSMAN, battingSkill: 66, secondarySkill: 30, style: 'N', isOpener: false, isForeign: false },
  { id: 'fa-10', name: 'Aqib Jatoi', nationality: 'Local', role: PlayerRole.BATSMAN, battingSkill: 62, secondarySkill: 15, style: 'A', isOpener: false, isForeign: false },
  { id: 'fa-11', name: 'Bilal Ahmed', nationality: 'Local', role: PlayerRole.BATSMAN, battingSkill: 60, secondarySkill: 18, style: 'D', isOpener: false, isForeign: false },
  { id: 'fa-12', name: 'Tariq Hanif', nationality: 'Local', role: PlayerRole.BATSMAN, battingSkill: 65, secondarySkill: 27, style: 'N', isOpener: false, isForeign: false },
  { id: 'fa-13', name: 'Fahad Rafiq', nationality: 'Local', role: PlayerRole.BATSMAN, battingSkill: 67, secondarySkill: 21, style: 'N', isOpener: false, isForeign: false },
  { id: 'fa-14', name: 'Owais Bashir', nationality: 'Local', role: PlayerRole.BATSMAN, battingSkill: 64, secondarySkill: 24, style: 'A', isOpener: false, isForeign: false },
  { id: 'fa-15', name: 'Mehmood Aslam', nationality: 'Local', role: PlayerRole.BATSMAN, battingSkill: 63, secondarySkill: 29, style: 'D', isOpener: false, isForeign: false },
  { id: 'fa-16', name: 'Hamza Iqbal', nationality: 'Local', role: PlayerRole.WICKET_KEEPER, battingSkill: 68, secondarySkill: 5, style: 'A', isOpener: false, isForeign: false },
  { id: 'fa-17', name: 'Usman Akhtar', nationality: 'Local', role: PlayerRole.WICKET_KEEPER, battingSkill: 66, secondarySkill: 8, style: 'N', isOpener: false, isForeign: false },
  { id: 'fa-18', name: 'Ali Raza', nationality: 'Local', role: PlayerRole.WICKET_KEEPER, battingSkill: 62, secondarySkill: 12, style: 'D', isOpener: false, isForeign: false },
  { id: 'fa-19', name: 'Yasir Shahid', nationality: 'Local', role: PlayerRole.WICKET_KEEPER, battingSkill: 65, secondarySkill: 10, style: 'A', isOpener: false, isForeign: false },
  { id: 'fa-20', name: 'Kashif Nawaz', nationality: 'Local', role: PlayerRole.WICKET_KEEPER, battingSkill: 64, secondarySkill: 6, style: 'N', isOpener: false, isForeign: false },
  { id: 'fa-21', name: 'Mubashir Khan', nationality: 'Local', role: PlayerRole.ALL_ROUNDER, battingSkill: 68, secondarySkill: 66, style: 'N', isOpener: false, isForeign: false },
  { id: 'fa-22', name: 'Naveed Anwar', nationality: 'Local', role: PlayerRole.ALL_ROUNDER, battingSkill: 62, secondarySkill: 63, style: 'D', isOpener: false, isForeign: false },
  { id: 'fa-23', name: 'Haris Siddiqui', nationality: 'Local', role: PlayerRole.ALL_ROUNDER, battingSkill: 64, secondarySkill: 65, style: 'A', isOpener: false, isForeign: false },
  { id: 'fa-24', name: 'Farhan Ali', nationality: 'Local', role: PlayerRole.ALL_ROUNDER, battingSkill: 63, secondarySkill: 62, style: 'N', isOpener: false, isForeign: false },
  { id: 'fa-25', name: 'Umer Shahzad', nationality: 'Local', role: PlayerRole.ALL_ROUNDER, battingSkill: 67, secondarySkill: 64, style: 'N', isOpener: false, isForeign: false },
  { id: 'fa-26', name: 'Adeel Farooq', nationality: 'Local', role: PlayerRole.ALL_ROUNDER, battingSkill: 65, secondarySkill: 68, style: 'D', isOpener: false, isForeign: false },
  { id: 'fa-27', name: 'Saad Hussain', nationality: 'Local', role: PlayerRole.ALL_ROUNDER, battingSkill: 66, secondarySkill: 63, style: 'A', isOpener: false, isForeign: false },
  { id: 'fa-28', name: 'Rizwan Khalid', nationality: 'Local', role: PlayerRole.ALL_ROUNDER, battingSkill: 60, secondarySkill: 61, style: 'D', isOpener: false, isForeign: false },
  { id: 'fa-29', name: 'Shahbaz Ahmed', nationality: 'Local', role: PlayerRole.ALL_ROUNDER, battingSkill: 62, secondarySkill: 67, style: 'N', isOpener: false, isForeign: false },
  { id: 'fa-30', name: 'Junaid Hanif', nationality: 'Local', role: PlayerRole.ALL_ROUNDER, battingSkill: 69, secondarySkill: 65, style: 'A', isOpener: false, isForeign: false },
  { id: 'fa-31', name: 'Imtiaz Baloch', nationality: 'Local', role: PlayerRole.SPIN_BOWLER, battingSkill: 58, secondarySkill: 68, style: 'N', isOpener: false, isForeign: false },
  { id: 'fa-32', name: 'Salman Rafiq', nationality: 'Local', role: PlayerRole.SPIN_BOWLER, battingSkill: 61, secondarySkill: 66, style: 'D', isOpener: false, isForeign: false },
  { id: 'fa-33', name: 'Mohsin Ali', nationality: 'Local', role: PlayerRole.SPIN_BOWLER, battingSkill: 64, secondarySkill: 63, style: 'A', isOpener: false, isForeign: false },
  { id: 'fa-34', name: 'Younis Qadir', nationality: 'Local', role: PlayerRole.SPIN_BOWLER, battingSkill: 59, secondarySkill: 67, style: 'N', isOpener: false, isForeign: false },
  { id: 'fa-35', name: 'Faisal Mehmood', nationality: 'Local', role: PlayerRole.SPIN_BOWLER, battingSkill: 62, secondarySkill: 64, style: 'D', isOpener: false, isForeign: false },
  { id: 'fa-36', name: 'Asad Niazi', nationality: 'Local', role: PlayerRole.SPIN_BOWLER, battingSkill: 60, secondarySkill: 62, style: 'N', isOpener: false, isForeign: false },
  { id: 'fa-37', name: 'Nadeem Arif', nationality: 'Local', role: PlayerRole.SPIN_BOWLER, battingSkill: 61, secondarySkill: 68, style: 'A', isOpener: false, isForeign: false },
  { id: 'fa-38', name: 'Tauseef Hussain', nationality: 'Local', role: PlayerRole.SPIN_BOWLER, battingSkill: 63, secondarySkill: 66, style: 'D', isOpener: false, isForeign: false },
  { id: 'fa-39', name: 'Amir Javed', nationality: 'Local', role: PlayerRole.SPIN_BOWLER, battingSkill: 62, secondarySkill: 65, style: 'N', isOpener: false, isForeign: false },
  { id: 'fa-40', name: 'Hassan Zia', nationality: 'Local', role: PlayerRole.SPIN_BOWLER, battingSkill: 59, secondarySkill: 63, style: 'A', isOpener: false, isForeign: false },
  { id: 'fa-41', name: 'Zubair Khan', nationality: 'Local', role: PlayerRole.FAST_BOWLER, battingSkill: 35, secondarySkill: 68, style: 'N', isOpener: false, isForeign: false },
  { id: 'fa-42', name: 'Rashid Mehmood', nationality: 'Local', role: PlayerRole.FAST_BOWLER, battingSkill: 42, secondarySkill: 66, style: 'N', isOpener: false, isForeign: false },
  { id: 'fa-43', name: 'Fahim Gul', nationality: 'Local', role: PlayerRole.FAST_BOWLER, battingSkill: 33, secondarySkill: 65, style: 'N', isOpener: false, isForeign: false },
  { id: 'fa-44', name: 'Waseem Shah', nationality: 'Local', role: PlayerRole.FAST_BOWLER, battingSkill: 40, secondarySkill: 67, style: 'N', isOpener: false, isForeign: false },
  { id: 'fa-45', name: 'Jahangir Ali', nationality: 'Local', role: PlayerRole.FAST_BOWLER, battingSkill: 36, secondarySkill: 64, style: 'N', isOpener: false, isForeign: false },
  { id: 'fa-46', name: 'Hammad Rafiq', nationality: 'Local', role: PlayerRole.FAST_BOWLER, battingSkill: 39, secondarySkill: 63, style: 'N', isOpener: false, isForeign: false },
  { id: 'fa-47', name: 'Zohaib Malik', nationality: 'Local', role: PlayerRole.FAST_BOWLER, battingSkill: 32, secondarySkill: 62, style: 'N', isOpener: false, isForeign: false },
  { id: 'fa-48', name: 'Noman Shah', nationality: 'Local', role: PlayerRole.FAST_BOWLER, battingSkill: 34, secondarySkill: 68, style: 'N', isOpener: false, isForeign: false },
  { id: 'fa-49', name: 'Irfan Qureshi', nationality: 'Local', role: PlayerRole.FAST_BOWLER, battingSkill: 37, secondarySkill: 65, style: 'N', isOpener: false, isForeign: false },
  { id: 'fa-50', name: 'Adil Nawaz', nationality: 'Local', role: PlayerRole.FAST_BOWLER, battingSkill: 41, secondarySkill: 63, style: 'N', isOpener: false, isForeign: false },
  { id: 'fa-51', name: 'Rauf Ahmed', nationality: 'Local', role: PlayerRole.FAST_BOWLER, battingSkill: 36, secondarySkill: 61, style: 'N', isOpener: false, isForeign: false },
  { id: 'fa-52', name: 'Mansoor Iqbal', nationality: 'Local', role: PlayerRole.FAST_BOWLER, battingSkill: 38, secondarySkill: 62, style: 'N', isOpener: false, isForeign: false },
  { id: 'fa-53', name: 'Asif Hanif', nationality: 'Local', role: PlayerRole.FAST_BOWLER, battingSkill: 42, secondarySkill: 64, style: 'N', isOpener: false, isForeign: false },
  { id: 'fa-54', name: 'Qasim Ali', nationality: 'Local', role: PlayerRole.FAST_BOWLER, battingSkill: 35, secondarySkill: 67, style: 'N', isOpener: false, isForeign: false },
  { id: 'fa-55', name: 'Tanveer Hussain', nationality: 'Local', role: PlayerRole.FAST_BOWLER, battingSkill: 39, secondarySkill: 60, style: 'N', isOpener: false, isForeign: false },
];

export const PLAYERS: Player[] = playersRaw.map(p => ({
    ...p,
    stats: generateInitialStats()
}));

export const PRE_BUILT_SQUADS: Record<string, string[]> = {
  'team1': ['f-kin-1', 'f-kin-2', 'f-kin-3', 'l-kin-1', 'l-kin-2', 'l-kin-3', 'l-kin-4', 'l-kin-5', 'l-kin-6', 'l-kin-7', 'l-kin-8', 'l-kin-9', 'l-kin-10', 'l-kin-11', 'l-kin-12', 'l-kin-13', 'l-kin-14', 'l-kin-15'],
  'team2': ['f-sta-1', 'f-sta-2', 'f-sta-3', 'l-sta-1', 'l-sta-2', 'l-sta-3', 'l-sta-4', 'l-sta-5', 'l-sta-6', 'l-sta-7', 'l-sta-8', 'l-sta-9', 'l-sta-10', 'l-sta-11', 'l-sta-12', 'l-sta-13', 'l-sta-14', 'l-sta-15'],
  'team3': ['f-six-1', 'f-six-2', 'f-six-3', 'l-six-1', 'l-six-2', 'l-six-3', 'l-six-4', 'l-six-5', 'l-six-6', 'l-six-7', 'l-six-8', 'l-six-9', 'l-six-10', 'l-six-11', 'l-six-12', 'l-six-13', 'l-six-14', 'l-six-15'],
  'team4': ['f-gla-1', 'f-gla-2', 'f-gla-3', 'l-gla-1', 'l-gla-2', 'l-gla-3', 'l-gla-4', 'l-gla-5', 'l-gla-6', 'l-gla-7', 'l-gla-8', 'l-gla-9', 'l-gla-10', 'l-gla-11', 'l-gla-12', 'l-gla-13', 'l-gla-14', 'l-gla-15'],
  'team5': ['f-eag-1', 'f-eag-2', 'f-eag-3', 'l-eag-1', 'l-eag-2', 'l-eag-3', 'l-eag-4', 'l-eag-5', 'l-eag-6', 'l-eag-7', 'l-eag-8', 'l-eag-9', 'l-eag-10', 'l-eag-11', 'l-eag-12', 'l-eag-13', 'l-eag-14', 'l-eag-15'],
  'team6': ['f-haw-1', 'f-haw-2', 'f-haw-3', 'l-haw-1', 'l-haw-2', 'l-haw-3', 'l-haw-4', 'l-haw-5', 'l-haw-6', 'l-haw-7', 'l-haw-8', 'l-haw-9', 'l-haw-10', 'l-haw-11', 'l-haw-12', 'l-haw-13', 'l-haw-14', 'l-haw-15'],
};

export const INITIAL_NEWS: NewsArticle[] = [
    { id: 'n1', headline: "Season 26 Auction Concluded!", date: "28 Jun 2025", excerpt: "Teams have finalized their 18-man core squads.", content: "The hammer has fallen. Franchises have spent big to secure a mix of local grit and foreign flair. Minimum 15 player rule was strictly enforced.", type: 'league' },
    { id: 'n2', headline: "Triple Format Challenge 26", date: "29 Jun 2025", excerpt: "Teams brace for T20, One-Day, and Shield formats.", content: "Consistency will be key. The season opens with T20, followed by One-Day, and concluding with the multi-day Shield.", type: 'league' },
    { id: 'n3', headline: "Global Stars Arrive", date: "30 Jun 2025", excerpt: "Haddin, Warner, Sprike and others touch down.", content: "The foreign contingent has arrived. With only 3 foreign slots per team, the pressure is on the international stars to perform.", type: 'league' },
];

export const NEWS_ARTICLES = INITIAL_NEWS;
