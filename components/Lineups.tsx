import React, { useState, useEffect, useMemo } from 'react';
import { GameData, Team, Format, Player } from '../types';
import { Icons } from './Icons';
import { getRoleColor, generateAutoXI } from '../utils';

interface LineupsProps {
    gameData: GameData;
    userTeam: Team | null;
    handleUpdatePlayingXI: (teamId: string, format: Format, newXI: string[]) => void;
    handleUpdateCaptain: (teamId: string, format: Format, playerId: string) => void;
    showFeedback: (message: string, type?: 'success' | 'error') => void;
}

const Lineups: React.FC<LineupsProps> = ({ gameData, userTeam, handleUpdatePlayingXI, handleUpdateCaptain, showFeedback }) => {
    // Hooks must be at the top level
    const [selectedTeamId, setSelectedTeamId] = useState(userTeam?.id || '');
    const selectedTeam = useMemo(() => gameData.teams.find(t => t.id === selectedTeamId), [gameData.teams, selectedTeamId]);
    
    const [category, setCategory] = useState<'T20' | 'List A' | 'First Class'>('T20');
    const [selectedFormat, setSelectedFormat] = useState<Format>(gameData.currentFormat);

    const [playingXI, setPlayingXI] = useState<Player[]>([]);
    const [bench, setBench] = useState<Player[]>([]);
    const [playerToSwap, setPlayerToSwap] = useState<Player | null>(null);

    // Sync selectedTeamId if userTeam changes
    useEffect(() => {
        if (userTeam && !selectedTeamId) {
            setSelectedTeamId(userTeam.id);
        }
    }, [userTeam, selectedTeamId]);

    // Helper to get formats for a category
    const getFormatsForCategory = (cat: 'T20' | 'List A' | 'First Class') => {
        switch(cat) {
            case 'T20': return [Format.T20, Format.DEVELOPMENT_T20, Format.RISE_T20];
            case 'List A': return [Format.ODI, Format.DEVELOPMENT_ODI, Format.RISE_ODI];
            case 'First Class': return [Format.FIRST_CLASS, Format.DEVELOPMENT_FIRST_CLASS, Format.RISE_FIRST_CLASS];
        }
    };

    // Auto-switch selected format when category changes
    useEffect(() => {
        const formats = getFormatsForCategory(category);
        if (!formats.includes(selectedFormat)) {
            setSelectedFormat(formats[0]);
        }
    }, [category, selectedFormat]);

    const isDomesticOnlyFormat = [Format.ODI, Format.FIRST_CLASS, Format.DEVELOPMENT_ODI, Format.DEVELOPMENT_FIRST_CLASS, Format.RISE_ODI, Format.RISE_FIRST_CLASS].includes(selectedFormat);

    useEffect(() => {
        if (!selectedTeam) return;
        const teamData = gameData.teams.find(t => t.id === selectedTeam.id);
        if (!teamData) return;

        const xiIds = gameData.playingXIs[teamData.id]?.[selectedFormat] || [];
        let xiPlayers: Player[] = [];

        if (xiIds.length === 11) {
             const foundPlayers = xiIds.map(id => teamData.squad.find(p => p.id === id)).filter(Boolean) as Player[];
             if (foundPlayers.length === 11) {
                xiPlayers = foundPlayers;
             } else {
                xiPlayers = generateAutoXI(teamData.squad, selectedFormat);
                handleUpdatePlayingXI(teamData.id, selectedFormat, xiPlayers.map(p => p.id));
             }
        } else {
            xiPlayers = generateAutoXI(teamData.squad, selectedFormat);
            handleUpdatePlayingXI(teamData.id, selectedFormat, xiPlayers.map(p => p.id));
        }
        
        setPlayingXI(xiPlayers);
        const xiIdSet = new Set(xiPlayers.map(p => p.id));
        setBench(teamData.squad.filter(p => !xiIdSet.has(p.id)));
    }, [selectedTeam, selectedFormat, gameData, handleUpdatePlayingXI]);

    useEffect(() => {
        setPlayerToSwap(null);
    }, [selectedTeam, selectedFormat]);

    if (!userTeam || !selectedTeam) {
        return (
            <div className="p-8 h-full flex flex-col items-center justify-center text-center">
                <div className="w-12 h-12 border-4 border-teal-500 border-t-transparent rounded-full animate-spin mb-4"></div>
                <p className="text-gray-500">Loading squad data...</p>
            </div>
        );
    }

    const captainId = selectedTeam.captains[selectedFormat] || '';

    const setCaptain = (playerId: string) => {
        if (playerToSwap) {
            showFeedback("Finish the current player swap first.", "error");
            return;
        }
        const player = playingXI.find(p => p.id === playerId);
        if (isDomesticOnlyFormat && player?.isForeign) {
            showFeedback("Foreign players cannot be captain in ODI & First-Class formats.", "error");
            return;
        }
        handleUpdateCaptain(selectedTeam.id, selectedFormat, playerId);
    };

    const selectPlayerForSwap = (player: Player) => {
        if (player.id === captainId) {
            showFeedback("Cannot swap the captain. Please assign a new captain first.", "error");
            return;
        }
        if (playerToSwap && playerToSwap.id === player.id) {
            setPlayerToSwap(null);
        } else {
            setPlayerToSwap(player);
        }
    };

    const completeSwap = (playerFromBench: Player) => {
        if (!playerToSwap) return;
        if (isDomesticOnlyFormat && playerFromBench.isForeign) {
            showFeedback("Foreign players are not allowed in this format.", "error");
            return;
        }
        
        const newXI = playingXI.map(p => p.id === playerToSwap.id ? playerFromBench : p);
        const newBench = bench.filter(p => p.id !== playerFromBench.id);
        newBench.push(playerToSwap);
        newBench.sort((a, b) => a.name.localeCompare(b.name));

        setPlayingXI(newXI);
        setBench(newBench);
        handleUpdatePlayingXI(selectedTeam.id, selectedFormat, newXI.map(p => p.id));
        setPlayerToSwap(null);
        showFeedback("Players swapped successfully!", "success");
    };

    const renderPlayerList = (players: Player[], isXI: boolean) => (
        <ul className="space-y-1">
            {players.map(player => (
                <li key={player.id} className={`flex items-center p-2 rounded-md transition-colors ${playerToSwap?.id === player.id ? 'bg-teal-200 dark:bg-teal-800' : 'bg-gray-100 dark:bg-gray-900/50'}`}>
                    <span className={`font-bold w-8 text-sm ${getRoleColor(player.role)}`}>{player.role}</span>
                    <span className="flex-grow">{player.name} {player.isForeign ? '(F)' : ''} {player.id === captainId ? '(C)' : ''}</span>
                    <span className="font-semibold mr-2">{player.battingSkill}</span>
                    <span className="font-semibold text-gray-500 mr-4">{player.secondarySkill}</span>
                    {isXI && player.id !== captainId && (
                        <button onClick={() => setCaptain(player.id)} className="text-xs bg-yellow-500 text-white px-1 rounded mr-1">C</button>
                    )}
                    {isXI ? (
                         <button onClick={() => selectPlayerForSwap(player)}><Icons.RemoveCircle /></button>
                    ) : (
                        <button onClick={() => completeSwap(player)} disabled={!playerToSwap || (isDomesticOnlyFormat && player.isForeign)} className="disabled:opacity-30">
                            <Icons.PlusCircle />
                        </button>
                    )}
                </li>
            ))}
        </ul>
    );

    return (
        <div className="p-2 h-[calc(100vh-90px)] flex flex-col">
            <h2 className="text-xl font-bold text-center mb-2">Manage Lineups</h2>
            <div className="mb-2">
                <select 
                    value={selectedTeamId} 
                    onChange={(e) => setSelectedTeamId(e.target.value)}
                    className="w-full p-2 rounded-md bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600"
                >
                    {gameData.teams.map(team => <option key={team.id} value={team.id}>{team.name}</option>)}
                </select>
            </div>
            
             {/* Category Tabs */}
             <div className="flex justify-center border-b border-gray-300 dark:border-gray-700 mb-2">
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
            <div className="mb-2">
                <select
                    value={selectedFormat}
                    onChange={(e) => setSelectedFormat(e.target.value as Format)}
                    className="w-full p-2 rounded-md bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 text-sm"
                >
                    {getFormatsForCategory(category).map(f => (
                        <option key={f} value={f}>{f}</option>
                    ))}
                </select>
            </div>

            {isDomesticOnlyFormat && (
                <div className="bg-yellow-100 dark:bg-yellow-900/50 text-yellow-800 dark:text-yellow-300 p-2 rounded-md text-sm text-center my-2">
                    Only domestic players are allowed in ODI and First-Class formats.
                </div>
            )}
            <div className="flex-grow overflow-y-auto">
                <h3 className="font-bold my-2">Playing XI ({playingXI.length} / 11)</h3>
                {renderPlayerList(playingXI, true)}
                <h3 className="font-bold my-2">Bench</h3>
                {renderPlayerList(bench, false)}
            </div>
        </div>
    );
};

export default Lineups;