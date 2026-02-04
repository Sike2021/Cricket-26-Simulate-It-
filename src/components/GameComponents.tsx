
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { GameData, Team, CareerScreen, MatchResult, Player, Format, BattingStyle, ScoreLimits, Ground, NewsArticle, PlayerRole, PlayerStats, Inning, Strategy } from '../types';
import { 
    TEAMS, PLAYERS, PRE_BUILT_SQUADS, BRANDS, SPONSOR_THRESHOLDS, TOURNAMENT_LOGOS, INITIAL_SPONSORSHIPS, TV_CHANNELS, PITCH_TYPES, generateInitialStats,
    MAX_FOREIGN_PLAYERS, MIN_SQUAD_SIZE, MAX_SQUAD_SIZE 
} from '../data';
import { 
    getRoleColor, getRoleFullName, aggregateStats, generateAutoXI, getBatterTier, BATTING_PROFILES, getBattingStyleLabel, BATTING_STYLE_OPTIONS, calculatePopularityPoints, generateLeagueSchedule 
} from '../utils';

// --- ICONS ---
export const Icon = ({ children, className = "h-6 w-6" }: { children?: React.ReactNode, className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        {children}
    </svg>
);

export const Icons = {
  PlayMatch: () => <Icon className="h-7 w-7"><path strokeLinecap="round" strokeLinejoin="round" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /><path strokeLinecap="round" strokeLinejoin="round" d="M15.91 11.672a.375.375 0 010 .656l-5.603 3.113a.375.375 0 01-.557-.328V8.887c0-.286.307-.466.557-.327l5.603 3.112z" /></Icon>,
  Editor: () => <Icon className="h-7 w-7"><path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L6.832 19.82a4.5 4.5 0 01-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 011.13-1.897L16.863 4.487zm0 0L19.5 7.125" /></Icon>,
  Leagues: () => <Icon className="h-7 w-7"><path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0h18M12 14.25h.008v.008H12v-.008z" /></Icon>,
  News: () => <Icon className="h-7 w-7"><path strokeLinecap="round" strokeLinejoin="round" d="M12 7.5h1.5m-1.5 3h1.5m-7.5 3h7.5m-7.5 3h7.5m3-9h3.375c.621 0 1.125.504 1.125 1.125V18a2.25 2.25 0 01-2.25 2.25M16.5 7.5V18a2.25 2.25 0 002.25 2.25M16.5 7.5V4.875c0-.621-.504-1.125-1.125-1.125H4.125C3.504 3.75 3 4.254 3 4.875V18a2.25 2.25 0 002.25 2.25h13.5M6 7.5h3v3H6v-3z" /></Icon>,
  Lineups: () => <Icon className="h-7 w-7"><path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25H12" /></Icon>,
  Home: () => <Icon><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12l8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h7.5" /></Icon>,
  Settings: () => <Icon><path strokeLinecap="round" strokeLinejoin="round" d="M10.343 3.94c.09-.542.56-1.007 1.11-1.227l.128-.054a2.25 2.25 0 012.864 2.864l-.054.128c-.22.55-.685 1.02-1.227 1.11l-.442.166a2.25 2.25 0 00-1.942 1.942l-.166.442c-.09.542-.56 1.007-1.11 1.227l-.128.054a2.25 2.25 0 01-2.864-2.864l.054-.128c.22-.55.685-1.02 1.227-1.11l.442-.166a2.25 2.25 0 001.942-1.942l.166-.442zM12 15.75a3.75 3.75 0 100-7.5 3.75 3.75 0 000 7.5z" /></Icon>,
  Trophy: () => <Icon><path strokeLinecap="round" strokeLinejoin="round" d="M16.5 18.75h-9a9.75 9.75 0 1011.64-8.094l-1.11-4.22a1.5 1.5 0 00-1.423-1.034H9.395a1.5 1.5 0 00-1.423 1.034l-1.11 4.22A9.75 9.75 0 007.5 18.75z" /></Icon>,
  Podium: () => <Icon><path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" /></Icon>,
  ChartPie: () => <Icon><path strokeLinecap="round" strokeLinejoin="round" d="M10.5 6a7.5 7.5 0 107.5 7.5h-7.5V6z" /><path strokeLinecap="round" strokeLinejoin="round" d="M13.5 10.5H21A7.5 7.5 0 0013.5 3v7.5z" /></Icon>,
  DragHandle: () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 fill-current text-gray-500" viewBox="0 0 20 20"><path d="M7 3a1 1 0 11-2 0 1 1 0 012 0zm5 0a1 1 0 11-2 0 1 1 0 012 0zM7 8a1 1 0 11-2 0 1 1 0 012 0zm5 0a1 1 0 11-2 0 1 1 0 012 0zm-5 5a1 1 0 11-2 0 1 1 0 012 0zm5 0a1 1 0 11-2 0 1 1 0 012 0z" /></svg>,
  Info: () => <Icon className="h-4 w-4 inline-block ml-1 text-gray-500"><path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></Icon>,
  PlusCircle: () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
  Transfers: () => <Icon className="h-7 w-7"><path strokeLinecap="round" strokeLinejoin="round" d="M7.5 21L3 16.5m0 0L7.5 12M3 16.5h13.5m0-13.5L21 7.5m0 0L16.5 12M21 7.5H7.5" /></Icon>,
  Compare: () => <Icon className="h-7 w-7"><path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.992 0l3.181 3.183a8.25 8.25 0 0011.667 0l3.181-3.183m-4.992-1.218v4.992m0 0h-4.992m4.992 0l-3.181-3.183a8.25 8.25 0 00-11.667 0l-3.181 3.183" /></Icon>,
  RemoveCircle: () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
  TrendingUp: () => <Icon className="h-6 w-6"><path strokeLinecap="round" strokeLinejoin="round" d="M13.5 10.5L21 3m0 0h-7.5m7.5 0v7.5M3 12h18M3 12L7.5 7.5M3 12L7.5 16.5"/></Icon>,
  TrendingDown: () => <Icon className="h-6 w-6"><path strokeLinecap="round" strokeLinejoin="round" d="M13.5 13.5L21 21m0 0h-7.5m7.5 0v-7.5M3 12h18M3 12L7.5 7.5M3 12L7.5 16.5"/></Icon>,
  Customize: () => <Icon className="h-7 w-7"><path strokeLinecap="round" strokeLinejoin="round" d="M9.53 16.122a3 3 0 00-5.78 1.128 2.25 2.25 0 01-2.4 2.245 4.5 4.5 0 008.4-2.245c0-.399-.077-.78-.22-1.128zm0 0a15.998 15.998 0 003.388-1.62m-5.043-.025a15.994 15.994 0 011.622-3.395m3.42 3.42a15.995 15.995 0 004.764-4.648l3.876-5.814a1.151 1.151 0 00-1.597-1.597L14.146 6.32a15.996 15.996 0 00-4.649 4.763m3.42 3.42a6.776 6.776 0 00-3.42-3.42" /></Icon>,
  Play: ({ className }: { className?: string }) => <Icon className={className || "h-6 w-6"}><polygon points="5 3 19 12 5 21 5 3" fill="currentColor"/></Icon>,
  RefreshCw: ({ className }: { className?: string }) => <Icon className={className || "h-6 w-6"}><path strokeLinecap="round" strokeLinejoin="round" d="M23 4v6h-6M1 20v-6h6"/><path strokeLinecap="round" strokeLinejoin="round" d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/></Icon>,
  X: ({ className }: { className?: string }) => <Icon className={className || "h-6 w-6"}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></Icon>,
  Check: ({ className }: { className?: string }) => <Icon className={className || "h-6 w-6"}><path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" /></Icon>,
  User: ({ className }: { className?: string }) => <Icon className={className || "h-6 w-6"}><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" /></Icon>,
};

// --- MAIN MENU ---
export const MainMenu: React.FC<{ onStartNewGame: () => void; onResumeGame: () => void; hasSaveData: boolean; }> = ({ onStartNewGame, onResumeGame, hasSaveData }) => (
    <div className="h-full flex flex-col items-center justify-center p-8 bg-cover bg-center" style={{ backgroundImage: "linear-gradient(rgba(255, 255, 255, 0.7), rgba(255, 255, 255, 1)), url('https://images.unsplash.com/photo-1595435942477-f5439483405a?q=80&w=2070&auto=format&fit=crop')" }}>
        <div className="h-full w-full absolute top-0 left-0 bg-gradient-to-b dark:from-black/70 dark:to-[#2C3531] from-gray-100/70 to-gray-50"></div>
        <div className="relative z-10 text-center">
            <h2 className="text-xl font-bold text-yellow-600 dark:text-yellow-400">Sike's</h2>
            <h1 className="text-5xl font-extrabold text-gray-900 dark:text-white mb-2 tracking-tight">CRICKET MANAGER</h1>
            <h2 className="text-5xl font-extrabold text-teal-600 dark:text-teal-400 mb-12">25</h2>
            <div className="space-y-4">
                {hasSaveData && (
                    <button onClick={onResumeGame} className="bg-teal-500 hover:bg-teal-600 text-white font-bold py-3 px-10 text-xl rounded-lg shadow-lg transform hover:scale-105 transition-transform duration-300 w-full">Resume Game</button>
                )}
                <button onClick={onStartNewGame} className="bg-gray-800 hover:bg-black dark:bg-gray-200 dark:hover:bg-white text-white dark:text-gray-900 font-bold py-3 px-10 text-xl rounded-lg shadow-lg transform hover:scale-105 transition-transform duration-300 w-full">{hasSaveData ? "Start New Game" : "Start Career"}</button>
            </div>
        </div>
    </div>
);

// --- TEAM SELECTION ---
export const TeamSelection: React.FC<{ onTeamSelected: (teamId: string) => void; theme: 'light' | 'dark'; }> = ({ onTeamSelected, theme }) => {
    const mainTeams = TEAMS.filter(t => !t.isDevelopmentTeam);
    const devTeams = TEAMS.filter(t => t.isDevelopmentTeam);
    const getTeamStats = useMemo(() => (teamId: string) => {
        const squadIds = PRE_BUILT_SQUADS[teamId] || [];
        if (squadIds.length === 0) return { bat: 0, bowl: 0 };
        const squadPlayers = squadIds.map(id => PLAYERS.find(pl => pl.id === id)).filter(Boolean) as typeof PLAYERS;
        const topBatters = [...squadPlayers].sort((a, b) => b.battingSkill - a.battingSkill).slice(0, 7);
        const avgBat = topBatters.reduce((sum, p) => sum + p.battingSkill, 0) / Math.max(1, topBatters.length);
        const topBowlers = [...squadPlayers].sort((a, b) => b.secondarySkill - a.secondarySkill).slice(0, 5);
        const avgBowl = topBowlers.reduce((sum, p) => sum + p.secondarySkill, 0) / Math.max(1, topBowlers.length);
        return { bat: Math.round(avgBat), bowl: Math.round(avgBowl) };
    }, []);
    const renderTeamCard = (team: typeof TEAMS[0]) => {
        const stats = getTeamStats(team.id);
        return (
            <div key={team.id} onClick={() => onTeamSelected(team.id)} className="bg-white dark:bg-[#343E3A]/90 p-4 rounded-xl text-center cursor-pointer border border-gray-200 dark:border-gray-700 hover:border-teal-500 dark:hover:border-teal-400 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group relative overflow-hidden">
                <div className="w-24 h-24 mx-auto mb-4 transform group-hover:scale-110 transition-transform duration-300 drop-shadow-md" dangerouslySetInnerHTML={{ __html: team.logo }}></div>
                <h3 className="text-xl font-extrabold text-gray-900 dark:text-white mb-4 tracking-tight">{team.name}</h3>
                <div className="grid grid-cols-2 gap-3">
                    <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-2 border border-blue-100 dark:border-blue-800/50"><div className="text-[10px] uppercase text-blue-600 dark:text-blue-300 font-bold mb-1 tracking-wide">Batting</div><div className="text-xl font-black text-blue-800 dark:text-blue-400">{stats.bat}</div></div>
                    <div className="bg-emerald-50 dark:bg-emerald-900/20 rounded-lg p-2 border border-emerald-100 dark:border-emerald-800/50"><div className="text-[10px] uppercase text-emerald-600 dark:text-emerald-300 font-bold mb-1 tracking-wide">Bowling</div><div className="text-xl font-black text-emerald-800 dark:text-emerald-400">{stats.bowl}</div></div>
                </div>
            </div>
        );
    };
    return (
        <div className="p-6 h-full overflow-y-auto scrollbar-hide">
            <div className="text-center mb-8 pt-2"><h2 className="text-3xl font-black text-gray-900 dark:text-white tracking-tight">Select Team</h2><p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Choose your franchise</p></div>
            <div className="mb-8"><div className="flex items-center gap-4 mb-4"><div className="h-px bg-gray-300 dark:bg-gray-700 flex-grow"></div><h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest">Premier League</h3><div className="h-px bg-gray-300 dark:bg-gray-700 flex-grow"></div></div><div className="grid grid-cols-2 gap-4">{mainTeams.map(renderTeamCard)}</div></div>
            <div className="mb-8"><div className="flex items-center gap-4 mb-4"><div className="h-px bg-gray-300 dark:bg-gray-700 flex-grow"></div><h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest">Development League</h3><div className="h-px bg-gray-300 dark:bg-gray-700 flex-grow"></div></div><div className="grid grid-cols-2 gap-4">{devTeams.map(renderTeamCard)}</div></div>
        </div>
    );
};
