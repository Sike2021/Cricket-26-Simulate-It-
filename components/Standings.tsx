
import React, { useState, useEffect } from 'react';
import { GameData, Format } from '../types';

interface StandingsProps {
    gameData: GameData;
}

const Standings: React.FC<StandingsProps> = ({ gameData }) => {
    const [category, setCategory] = useState<'T20' | 'List A' | 'First Class'>('T20');
    const [selectedFormat, setSelectedFormat] = useState<Format>(gameData.currentFormat);
    const [view, setView] = useState<'standings' | 'fixtures'>('standings');

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

    const standings = gameData.standings[selectedFormat];
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
        <div className="p-4 h-[calc(100vh-90px)] overflow-y-auto">
            <h2 className="text-2xl font-bold text-center mb-4">Leagues</h2>
            
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

             {/* View Toggle */}
             <div className="flex justify-center mb-4">
                <button onClick={() => setView('standings')} className={`px-4 py-1 rounded-l-md border border-teal-500 ${view === 'standings' ? 'bg-teal-500 text-white' : 'text-teal-500'}`}>Standings</button>
                <button onClick={() => setView('fixtures')} className={`px-4 py-1 rounded-r-md border border-teal-500 ${view === 'fixtures' ? 'bg-teal-500 text-white' : 'text-teal-500'}`}>Fixtures</button>
            </div>

            {view === 'standings' ? (
                <table className="w-full text-left text-sm">
                    <thead>
                        <tr className="border-b dark:border-gray-700">
                            <th className="p-2">Team</th>
                            <th className="p-2 text-center">P</th>
                            <th className="p-2 text-center">W</th>
                            <th className="p-2 text-center">L</th>
                            {(selectedFormat.includes('First-Class')) && <th className="p-2 text-center">D</th>}
                            <th className="p-2 text-center">Pts</th>
                            <th className="p-2 text-center">NRR</th>
                        </tr>
                    </thead>
                    <tbody>
                        {standings.map((s, index) => (
                            <tr key={s.teamId} className={`border-b dark:border-gray-700/50 ${index < 4 ? 'bg-teal-500/10' : ''}`}>
                                <td className="p-2 font-semibold">{s.teamName}</td>
                                <td className="p-2 text-center">{s.played}</td>
                                <td className="p-2 text-center">{s.won}</td>
                                <td className="p-2 text-center">{s.lost}</td>
                                {(selectedFormat.includes('First-Class')) && <td className="p-2 text-center">{s.drawn}</td>}
                                <td className="p-2 text-center font-bold">{s.points}</td>
                                <td className="p-2 text-center">{s.netRunRate > 0 ? `+${s.netRunRate.toFixed(2)}` : s.netRunRate.toFixed(2)}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            ) : (
                <div className="space-y-3">
                    {schedule.map((match, index) => {
                        const resolved = resolveMatch(match);
                        const result = gameData.matchResults[selectedFormat].find(r => r.matchNumber === match.matchNumber);
                        
                        return (
                            <div key={index} 
                                className={`p-3 rounded-lg shadow-md ${result ? 'bg-white dark:bg-gray-800/50' : 'bg-gray-200 dark:bg-gray-700/40'}`}
                            >
                                <div className="flex justify-between items-center text-sm mb-1 text-gray-500 dark:text-gray-400">
                                    <span>Match {match.matchNumber}</span>
                                    <span>{match.date}</span>
                                </div>
                                <div className="text-center font-semibold">
                                    <span>{resolved.teamA}</span>
                                    <span className="mx-2 text-xs text-gray-500">vs</span>
                                    <span>{resolved.teamB}</span>
                                </div>
                                {result && (
                                    <div className="text-center text-xs mt-1 text-blue-600 dark:text-blue-400 font-medium">
                                        {result.summary}
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
};

export default Standings;
