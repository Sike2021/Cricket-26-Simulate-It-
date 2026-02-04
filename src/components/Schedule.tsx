
import React, { useState, useEffect } from 'react';
import { GameData, Team, MatchResult, Format } from '../types';

interface ScheduleProps {
    gameData: GameData;
    userTeam: Team | null;
    viewMatchResult: (result: MatchResult) => void;
}

const Schedule: React.FC<ScheduleProps> = ({ gameData, userTeam, viewMatchResult }) => {
    const [category, setCategory] = useState<'T20' | 'List A' | 'First Class'>('T20');
    const [selectedFormat, setSelectedFormat] = useState<Format>(gameData.currentFormat);

    const getFormatsForCategory = (cat: 'T20' | 'List A' | 'First Class') => {
        switch(cat) {
            case 'T20': return [Format.T20, Format.DEVELOPMENT_T20, Format.RISE_T20];
            case 'List A': return [Format.ODI, Format.DEVELOPMENT_ODI, Format.RISE_ODI];
            case 'First Class': return [Format.FIRST_CLASS, Format.DEVELOPMENT_FIRST_CLASS, Format.RISE_FIRST_CLASS];
        }
    };

    useEffect(() => {
        const formats = getFormatsForCategory(category);
        if (!formats.includes(selectedFormat)) {
            setSelectedFormat(formats[0]);
        }
    }, [category]);

    const schedule = gameData.schedule[selectedFormat];

    const resolveMatch = (match: any) => {
        let resolvedMatch = { ...match };
        if (resolvedMatch.group !== 'Round-Robin') {
            const standings = gameData.standings[selectedFormat];
            const getTeamName = (pos: number) => standings.length >= pos ? standings[pos - 1]?.teamName : `TBD`;
            const resolvePlaceholder = (placeholder: string) => {
                if (['1st', '2nd', '3rd', '4th'].includes(placeholder)) {
                    return getTeamName(parseInt(placeholder[0], 10));
                }
                if (placeholder.startsWith('SF')) {
                    const sfMatchNumber = placeholder.split(' ')[0];
                    const sfResult = gameData.matchResults[selectedFormat].find(r => r.matchNumber === sfMatchNumber);
                    if (sfResult?.winnerId) {
                        return gameData.teams.find(t => t.id === sfResult.winnerId)?.name || 'TBD';
                    }
                    return `Winner of ${sfMatchNumber}`;
                }
                return placeholder;
            };
            resolvedMatch.teamA = resolvePlaceholder(resolvedMatch.teamA);
            resolvedMatch.teamB = resolvePlaceholder(resolvedMatch.teamB);
        }
        return resolvedMatch;
    };

    return (
        <div className="p-4">
            <h2 className="text-2xl font-bold text-center mb-4">Schedule</h2>
            
             {/* Category Tabs */}
             <div className="flex justify-center border-b border-gray-300 dark:border-gray-700 mb-4">
                {['T20', 'List A', 'First Class'].map((cat) => (
                    <button 
                        key={cat} 
                        onClick={() => setCategory(cat as any)} 
                        className={`px-4 py-2 text-sm font-semibold ${category === cat ? 'border-b-2 border-teal-500 text-teal-500' : 'text-gray-500'}`}
                    >
                        {cat}
                    </button>
                ))}
            </div>
            
            {/* Tournament Dropdown */}
            <div className="mb-4">
                <select
                    value={selectedFormat}
                    onChange={(e) => setSelectedFormat(e.target.value as Format)}
                    className="w-full p-2 rounded-md bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 text-sm font-medium"
                >
                    {getFormatsForCategory(category).map(f => (
                        <option key={f} value={f}>{f}</option>
                    ))}
                </select>
            </div>

            <div className="space-y-3 h-[calc(100vh-250px)] overflow-y-auto">
                {schedule.map((match, index) => {
                    const resolved = resolveMatch(match);
                    const result = gameData.matchResults[selectedFormat].find(r => r.matchNumber === match.matchNumber);
                    const isUserMatch = userTeam && (resolved.teamA === userTeam.name || resolved.teamB === userTeam.name);
                    const isNextMatch = selectedFormat === gameData.currentFormat && index === gameData.currentMatchIndex[selectedFormat];
                    
                    const logoA = gameData.allTeamsData.find(t => t.name === resolved.teamA)?.logo || '';
                    const logoB = gameData.allTeamsData.find(t => t.name === resolved.teamB)?.logo || '';

                    return (
                        <div key={index} 
                            className={`p-3 rounded-lg shadow-md ${result ? 'bg-white dark:bg-gray-800/50' : 'bg-gray-200 dark:bg-gray-700/40'} ${isNextMatch ? 'border-2 border-teal-500' : ''}`}
                        >
                            <div className="flex justify-between items-center text-sm mb-1 text-gray-500 dark:text-gray-400">
                                <span>Match {match.matchNumber}</span>
                                <span>{match.date}</span>
                            </div>
                            <div className="flex items-center justify-center gap-3 font-semibold text-lg">
                                <div className="flex items-center gap-1">
                                    {logoA && <div className="w-5 h-5" dangerouslySetInnerHTML={{__html: logoA}}></div>}
                                    <span className={isUserMatch && resolved.teamA === userTeam?.name ? 'text-teal-500 dark:text-teal-400' : ''}>{resolved.teamA}</span>
                                </div>
                                <span className="text-xs text-gray-500">vs</span>
                                <div className="flex items-center gap-1">
                                    {logoB && <div className="w-5 h-5" dangerouslySetInnerHTML={{__html: logoB}}></div>}
                                    <span className={isUserMatch && resolved.teamB === userTeam?.name ? 'text-teal-500 dark:text-teal-400' : ''}>{resolved.teamB}</span>
                                </div>
                            </div>
                            {result && (
                                <div className="text-center text-sm mt-2">
                                    <p className="font-medium text-blue-600 dark:text-blue-400">{result.summary}</p>
                                    <button 
                                        onClick={() => viewMatchResult(result)}
                                        className="mt-2 bg-gray-500/20 dark:bg-gray-700/50 text-gray-700 dark:text-gray-300 px-3 py-1 text-xs font-semibold rounded-md hover:bg-gray-500/30 dark:hover:bg-gray-700/80 transition"
                                    >
                                        View Scorecard
                                    </button>
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default Schedule;
