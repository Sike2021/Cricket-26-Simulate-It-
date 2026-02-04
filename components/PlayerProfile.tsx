
import React, { useState, useMemo } from 'react';
import { Player, Format } from '../types';
import { getRoleColor, getRoleFullName, aggregateStats } from '../utils';

interface PlayerProfileProps {
    player: Player | null;
    onBack: () => void;
    initialFormat: Format;
}

const PlayerProfile: React.FC<PlayerProfileProps> = ({ player, onBack, initialFormat }) => {
    const [selectedFormat, setSelectedFormat] = useState<Format | 'Summary'>(initialFormat);
    
    const summaryStats = useMemo(() => {
        if (!player) return null;
        
        const t20Formats = [Format.T20, Format.DEVELOPMENT_T20, Format.RISE_T20];
        const listAFormats = [Format.ODI, Format.DEVELOPMENT_ODI, Format.RISE_ODI];
        const fcFormats = [Format.FIRST_CLASS, Format.DEVELOPMENT_FIRST_CLASS, Format.RISE_FIRST_CLASS];
        
        const t20 = aggregateStats(player, t20Formats);
        const listA = aggregateStats(player, listAFormats);
        const fc = aggregateStats(player, fcFormats);
        const overall = aggregateStats(player, [...t20Formats, ...listAFormats, ...fcFormats]);

        return { t20, listA, fc, overall };
    }, [player]);

    if (!player || !summaryStats) return <div>Player not found. <button onClick={onBack}>Back</button></div>;
    
    const stats = selectedFormat === 'Summary' ? summaryStats.overall : player.stats[selectedFormat];
    
    return (
        <div className="p-4 h-[calc(100vh-90px)] overflow-y-auto">
            <button onClick={onBack} className="mb-2 text-sm text-teal-500">&larr; Back to Stats</button>
            <div className="text-center mb-4">
                <h2 className="text-3xl font-bold">{player.name}</h2>
                <p className={`${getRoleColor(player.role)} font-semibold`}>{getRoleFullName(player.role)}</p>
                {player.teamName && <p className="text-sm text-gray-500">{player.teamName}</p>}
            </div>

            {/* Career Summary Table */}
            <div className="mb-6 overflow-x-auto">
                <h3 className="font-bold text-lg mb-2 text-center">Career Summary</h3>
                <table className="w-full text-xs text-center">
                    <thead>
                        <tr className="bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300">
                            <th className="p-1 text-left">Format</th>
                            <th className="p-1">M</th>
                            <th className="p-1">Runs</th>
                            <th className="p-1">Avg</th>
                            <th className="p-1">SR</th>
                            <th className="p-1">Wkts</th>
                            <th className="p-1">Avg</th>
                            <th className="p-1">Econ</th>
                        </tr>
                    </thead>
                    <tbody>
                         <tr className="border-b border-gray-100 dark:border-gray-700/50">
                            <td className="p-1 text-left font-semibold">First Class</td>
                            <td className="p-1">{summaryStats.fc.matches}</td>
                            <td className="p-1 font-bold">{summaryStats.fc.runs}</td>
                            <td className="p-1">{summaryStats.fc.average.toFixed(2)}</td>
                            <td className="p-1">{summaryStats.fc.strikeRate.toFixed(1)}</td>
                            <td className="p-1 font-bold">{summaryStats.fc.wickets}</td>
                            <td className="p-1">{summaryStats.fc.bowlingAverage.toFixed(2)}</td>
                            <td className="p-1">{summaryStats.fc.economy.toFixed(2)}</td>
                        </tr>
                        <tr className="border-b border-gray-100 dark:border-gray-700/50">
                            <td className="p-1 text-left font-semibold">List A</td>
                            <td className="p-1">{summaryStats.listA.matches}</td>
                            <td className="p-1 font-bold">{summaryStats.listA.runs}</td>
                            <td className="p-1">{summaryStats.listA.average.toFixed(2)}</td>
                            <td className="p-1">{summaryStats.listA.strikeRate.toFixed(1)}</td>
                            <td className="p-1 font-bold">{summaryStats.listA.wickets}</td>
                            <td className="p-1">{summaryStats.listA.bowlingAverage.toFixed(2)}</td>
                            <td className="p-1">{summaryStats.listA.economy.toFixed(2)}</td>
                        </tr>
                         <tr className="border-b border-gray-100 dark:border-gray-700/50">
                            <td className="p-1 text-left font-semibold">T20s</td>
                            <td className="p-1">{summaryStats.t20.matches}</td>
                            <td className="p-1 font-bold">{summaryStats.t20.runs}</td>
                            <td className="p-1">{summaryStats.t20.average.toFixed(2)}</td>
                            <td className="p-1">{summaryStats.t20.strikeRate.toFixed(1)}</td>
                            <td className="p-1 font-bold">{summaryStats.t20.wickets}</td>
                            <td className="p-1">{summaryStats.t20.bowlingAverage.toFixed(2)}</td>
                            <td className="p-1">{summaryStats.t20.economy.toFixed(2)}</td>
                        </tr>
                        <tr className="bg-teal-50 dark:bg-teal-900/20 font-bold">
                            <td className="p-1 text-left">Overall</td>
                            <td className="p-1">{summaryStats.overall.matches}</td>
                            <td className="p-1">{summaryStats.overall.runs}</td>
                            <td className="p-1">{summaryStats.overall.average.toFixed(2)}</td>
                            <td className="p-1">{summaryStats.overall.strikeRate.toFixed(1)}</td>
                            <td className="p-1">{summaryStats.overall.wickets}</td>
                            <td className="p-1">{summaryStats.overall.bowlingAverage.toFixed(2)}</td>
                            <td className="p-1">{summaryStats.overall.economy.toFixed(2)}</td>
                        </tr>
                    </tbody>
                </table>
            </div>

            <div className="flex justify-center overflow-x-auto border-b border-gray-300 dark:border-gray-700 mb-2 pb-2">
                 {Object.values(Format).map(format => (
                    <button key={format} onClick={() => setSelectedFormat(format)} className={`px-3 py-1 text-xs whitespace-nowrap font-semibold ${selectedFormat === format ? 'border-b-2 border-teal-500 text-teal-500' : 'text-gray-500'}`}>{format}</button>
                ))}
            </div>
            
            {selectedFormat !== 'Summary' && (
            <div className="bg-gray-100 dark:bg-gray-800/50 p-4 rounded-lg">
                <h3 className="font-bold text-lg mb-2 text-center">{selectedFormat} Details</h3>
                <div className="grid grid-cols-3 gap-2 text-center">
                    <div><p className="font-bold text-xl">{stats.matches}</p><p className="text-xs text-gray-500">Matches</p></div>
                    <div><p className="font-bold text-xl">{stats.runs}</p><p className="text-xs text-gray-500">Runs</p></div>
                    <div><p className="font-bold text-xl">{stats.highestScore}</p><p className="text-xs text-gray-500">Highest</p></div>
                    <div><p className="font-bold text-xl">{stats.average.toFixed(2)}</p><p className="text-xs text-gray-500">Average</p></div>
                    <div><p className="font-bold text-xl">{stats.strikeRate.toFixed(2)}</p><p className="text-xs text-gray-500">Strike Rate</p></div>
                    <div><p className="font-bold text-xl">{stats.fifties}</p><p className="text-xs text-gray-500">50s</p></div>
                    <div><p className="font-bold text-xl">{stats.hundreds}</p><p className="text-xs text-gray-500">100s</p></div>
                    <div><p className="font-bold text-xl">{stats.fours}</p><p className="text-xs text-gray-500">Fours</p></div>
                    <div><p className="font-bold text-xl">{stats.sixes}</p><p className="text-xs text-gray-500">Sixes</p></div>
                </div>
                <h3 className="font-bold text-lg mt-4 mb-2 text-center">Bowling Stats</h3>
                <div className="grid grid-cols-3 gap-2 text-center">
                    <div><p className="font-bold text-xl">{stats.wickets}</p><p className="text-xs text-gray-500">Wickets</p></div>
                    <div><p className="font-bold text-xl">{stats.bowlingAverage.toFixed(2)}</p><p className="text-xs text-gray-500">Average</p></div>
                    <div><p className="font-bold text-xl">{stats.economy.toFixed(2)}</p><p className="text-xs text-gray-500">Economy</p></div>
                    <div><p className="font-bold text-xl">{stats.bestBowling}</p><p className="text-xs text-gray-500">Best</p></div>
                    <div><p className="font-bold text-xl">{stats.threeWicketHauls}</p><p className="text-xs text-gray-500">3-fers</p></div>
                    <div><p className="font-bold text-xl">{stats.fiveWicketHauls}</p><p className="text-xs text-gray-500">5-fers</p></div>
                </div>
                 <h3 className="font-bold text-lg mt-4 mb-2 text-center">Milestones</h3>
                <div className="grid grid-cols-2 gap-2 text-center">
                    <div><p className="font-bold text-xl">{stats.fastestFifty > 0 ? `${stats.fastestFifty}` : '-'}</p><p className="text-xs text-gray-500">Fastest 50 (balls)</p></div>
                    <div><p className="font-bold text-xl">{stats.fastestHundred > 0 ? `${stats.fastestHundred}` : '-'}</p><p className="text-xs text-gray-500">Fastest 100 (balls)</p></div>
                </div>
            </div>
            )}
        </div>
    )
}

export default PlayerProfile;
