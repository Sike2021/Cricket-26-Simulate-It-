
import React from 'react';
import { GameData, Team, CareerScreen } from '../types';
import { Icons } from './Icons';
import { SPONSOR_THRESHOLDS, TOURNAMENT_LOGOS } from '../data';

interface DashboardProps {
    gameData: GameData;
    userTeam: Team | null;
    setScreen: (screen: CareerScreen) => void;
    handlePlayMatch: () => void;
    handleForwardDay: () => void;
}

const Dashboard: React.FC<DashboardProps> = ({ gameData, userTeam, setScreen, handlePlayMatch, handleForwardDay }) => {
    const currentSchedule = gameData.schedule[gameData.currentFormat];
    const matchIndex = gameData.currentMatchIndex[gameData.currentFormat];
    const sponsorship = gameData.sponsorships?.[gameData.currentFormat];
    const popularity = gameData.popularity || 0;
    const currentThresholds = SPONSOR_THRESHOLDS[gameData.currentFormat] || {};

    if (matchIndex >= currentSchedule.length) {
        return (
            <div className="p-4 text-center h-full flex items-center justify-center">
                <p>Tournament finished, calculating results...</p>
            </div>
        );
    }

    let nextMatch = { ...currentSchedule[matchIndex] };
    if (nextMatch.group !== 'Round-Robin') {
        const standings = gameData.standings[gameData.currentFormat];
        const getTeamName = (pos: number) => standings.length >= pos ? standings[pos - 1]?.teamName : `TBD ${pos}`;
        const resolvePlaceholder = (placeholder: string) => {
            if (['1st', '2nd', '3rd', '4th'].includes(placeholder)) {
                return getTeamName(parseInt(placeholder[0], 10));
            }
            if (placeholder.startsWith('SF')) {
                const sfMatchNumber = placeholder.split(' ')[0];
                const sfResult = gameData.matchResults[gameData.currentFormat].find(r => r.matchNumber === sfMatchNumber);
                if (sfResult?.winnerId) {
                    return gameData.teams.find(t => t.id === sfResult.winnerId)?.name || 'TBD';
                }
                return `Winner of ${sfMatchNumber}`;
            }
            return placeholder;
        };
        nextMatch.teamA = resolvePlaceholder(nextMatch.teamA);
        nextMatch.teamB = resolvePlaceholder(nextMatch.teamB);
    }

    const isUserMatch = userTeam ? (nextMatch.teamA === userTeam.name || nextMatch.teamB === userTeam.name) : false;
    const homeGround = gameData.grounds.find(g => g.code === gameData.allTeamsData.find(t => t.name === nextMatch.teamA)?.homeGround);

    const renderTournamentLogo = () => {
        if (sponsorship?.tournamentLogo) {
            return <div className={`w-8 h-8 mx-auto mb-1 ${sponsorship.logoColor}`} dangerouslySetInnerHTML={{__html: sponsorship.tournamentLogo}}></div>;
        }
        return <div className="w-8 h-8 mx-auto mb-1 text-slate-300" dangerouslySetInnerHTML={{__html: TOURNAMENT_LOGOS[0].svg}}></div>;
    };

    return (
        <div className="p-4 space-y-4">
            <header className="text-center pb-2 border-b-2 border-gray-200 dark:border-gray-700">
                <p className="text-xs font-bold text-gray-500 dark:text-gray-400 tracking-widest mb-1">SEASON {gameData.currentSeason}</p>
                {renderTournamentLogo()}
                {sponsorship ? (
                     <h1 className={`text-2xl md:text-3xl mt-1 ${sponsorship.logoColor || 'text-teal-500'} drop-shadow-sm ${sponsorship.sponsorName === "Sike's" ? 'font-extrabold tracking-tight font-display' : sponsorship.sponsorName === "Signify" ? 'font-sans tracking-widest uppercase font-bold' : sponsorship.sponsorName === "Malik" ? 'font-serif italic font-bold' : 'font-mono font-bold'}`}>
                        {sponsorship.sponsorName} <span className="text-gray-800 dark:text-white font-light italic">{sponsorship.tournamentName}</span>
                    </h1>
                ) : (
                    <h1 className="text-2xl font-bold mt-1">{gameData.currentFormat}</h1>
                )}
                <p className="text-sm font-medium text-gray-600 dark:text-gray-300 mt-1">Manager: {userTeam?.name}</p>
            </header>

            <div className="bg-white dark:bg-gray-800/50 rounded-lg p-4 shadow-md border-t-4 border-teal-500">
                <h3 className="font-bold text-lg mb-2 text-center text-teal-600 dark:text-teal-400 uppercase tracking-wide">Next Match</h3>
                <div className="text-center">
                    <p className="font-extrabold text-xl md:text-2xl">{nextMatch.teamA} <span className="text-gray-400 text-lg font-light">vs</span> {nextMatch.teamB}</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{homeGround?.name || 'Neutral Venue'}</p>
                    <p className="text-xs font-mono text-gray-400">{nextMatch.date}</p>
                </div>
                {isUserMatch ? (
                    <button onClick={handlePlayMatch} className="mt-4 w-full bg-teal-500 hover:bg-teal-600 text-white font-bold py-3 px-4 rounded-lg shadow-lg flex items-center justify-center space-x-2 transition-transform transform active:scale-95">
                        <Icons.PlayMatch />
                        <span>PLAY MATCH</span>
                    </button>
                ) : (
                    <button onClick={handleForwardDay} className="mt-4 w-full bg-gray-700 hover:bg-gray-800 text-white font-bold py-3 px-4 rounded-lg shadow-lg flex items-center justify-center space-x-2 transition-transform transform active:scale-95">
                        <Icons.PlayMatch />
                        <span>SIMULATE DAY</span>
                    </button>
                )}
            </div>
            
             {/* Sponsorship & Points Board - Read Only */}
            <div className="bg-gradient-to-br from-gray-900 to-gray-800 text-white rounded-lg p-4 shadow-md border border-gray-700 overflow-hidden group">
                <div className="flex justify-between items-center mb-2">
                    <h3 className="font-bold text-sm uppercase text-gray-300">Sponsorship Board</h3>
                    <div className="bg-yellow-500 text-black font-bold px-2 py-1 rounded text-xs">
                        {popularity} Points
                    </div>
                </div>
                
                <div className="space-y-2">
                    <div className="flex justify-between items-center text-xs">
                         <span className={`${sponsorship?.sponsorName === "Sike's" ? 'text-yellow-400 font-extrabold' : 'text-gray-500'}`}>Sike's</span>
                         <span className="text-gray-400">{popularity}/{currentThresholds["Sike's"] || 40}</span>
                    </div>
                    <div className="w-full bg-gray-700 rounded-full h-1.5 mb-1">
                        <div className="bg-yellow-400 h-1.5 rounded-full" style={{ width: `${Math.min(100, (popularity / (currentThresholds["Sike's"] || 40)) * 100)}%` }}></div>
                    </div>

                     <div className="flex justify-between items-center text-xs">
                         <span className={`${sponsorship?.sponsorName === "Signify" ? 'text-cyan-400 font-bold uppercase' : 'text-gray-500'}`}>Signify</span>
                         <span className="text-gray-400">{popularity}/{currentThresholds["Signify"] || 35}</span>
                    </div>
                     <div className="w-full bg-gray-700 rounded-full h-1.5 mb-1">
                        <div className="bg-cyan-400 h-1.5 rounded-full" style={{ width: `${Math.min(100, (popularity / (currentThresholds["Signify"] || 35)) * 100)}%` }}></div>
                    </div>
                    
                     <div className="flex justify-between items-center text-xs">
                         <span className={`${sponsorship?.sponsorName === "Malik" ? 'text-red-500 font-serif italic font-bold' : 'text-gray-500'}`}>Malik</span>
                         <span className="text-gray-400">{popularity}/{currentThresholds["Malik"] || 30}</span>
                    </div>
                     <div className="w-full bg-gray-700 rounded-full h-1.5 mb-1">
                        <div className="bg-red-500 h-1.5 rounded-full" style={{ width: `${Math.min(100, (popularity / (currentThresholds["Malik"] || 30)) * 100)}%` }}></div>
                    </div>

                     <div className="flex justify-between items-center text-xs">
                         <span className={`${sponsorship?.sponsorName === "G.S" ? 'text-green-500 font-mono font-bold' : 'text-gray-500'}`}>G.S</span>
                         <span className="text-gray-400">{popularity}/{currentThresholds["G.S"] || 25}</span>
                    </div>
                     <div className="w-full bg-gray-700 rounded-full h-1.5">
                        <div className="bg-green-500 h-1.5 rounded-full" style={{ width: `${Math.min(100, (popularity / (currentThresholds["G.S"] || 25)) * 100)}%` }}></div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
                 <button onClick={() => setScreen('LEAGUES')} className="bg-white dark:bg-gray-800/50 p-3 rounded-lg shadow-md flex flex-col items-center justify-center space-y-2 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors text-center group">
                    <div className="group-hover:scale-110 transition-transform"><Icons.Leagues /></div>
                    <span className="font-semibold text-xs">Leagues</span>
                </button>
                 <button onClick={() => setScreen('NEWS')} className="bg-white dark:bg-gray-800/50 p-3 rounded-lg shadow-md flex flex-col items-center justify-center space-y-2 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors text-center group">
                    <div className="group-hover:scale-110 transition-transform"><Icons.News /></div>
                    <span className="font-semibold text-xs">News</span>
                </button>
                 <button onClick={() => setScreen('LINEUPS')} className="bg-white dark:bg-gray-800/50 p-3 rounded-lg shadow-md flex flex-col items-center justify-center space-y-2 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors text-center group">
                    <div className="group-hover:scale-110 transition-transform"><Icons.Lineups /></div>
                    <span className="font-semibold text-xs">Lineups</span>
                </button>
                 <button onClick={() => setScreen('EDITOR')} className="bg-white dark:bg-gray-800/50 p-3 rounded-lg shadow-md flex flex-col items-center justify-center space-y-2 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors text-center group">
                    <div className="group-hover:scale-110 transition-transform"><Icons.Editor /></div>
                    <span className="font-semibold text-xs">Editor</span>
                </button>
                <button onClick={() => setScreen('TRANSFERS')} className="bg-white dark:bg-gray-800/50 p-3 rounded-lg shadow-md flex flex-col items-center justify-center space-y-2 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors text-center group">
                    <div className="group-hover:scale-110 transition-transform"><Icons.Transfers /></div>
                    <span className="font-semibold text-xs">Transfers</span>
                </button>
                <button onClick={() => setScreen('COMPARISON')} className="bg-white dark:bg-gray-800/50 p-3 rounded-lg shadow-md flex flex-col items-center justify-center space-y-2 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors text-center group">
                    <div className="group-hover:scale-110 transition-transform"><Icons.Compare /></div>
                    <span className="font-semibold text-xs">Compare</span>
                </button>
            </div>
        </div>
    );
};

export default Dashboard;
