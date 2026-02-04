import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { GameData, Format, Player, Team } from '../types';
import { Icons } from './Icons';
import { getRoleFullName } from '../utils';

interface EndOfFormatScreenProps {
    gameData: GameData;
    handleFormatChange: (newFormat: Format) => void;
    handleEndSeason: (retainedPlayers: Player[]) => void;
}

const EndOfFormatScreen: React.FC<EndOfFormatScreenProps> = ({ gameData, handleFormatChange, handleEndSeason }) => {
    const [view, setView] = useState<'awards' | 'retention'>('awards');
    const [retainedIds, setRetainedIds] = useState<Set<string>>(new Set());
    const userTeam = useMemo(() => gameData.teams.find(t => t.id === gameData.userTeamId), [gameData]);
    
    const lastAward = gameData.awardsHistory[gameData.awardsHistory.length-1];
    
    const formatsOrder = [
        Format.T20, Format.ODI, Format.FIRST_CLASS,
        Format.DEVELOPMENT_T20, Format.DEVELOPMENT_ODI, Format.DEVELOPMENT_FIRST_CLASS,
        Format.RISE_T20, Format.RISE_ODI, Format.RISE_FIRST_CLASS
    ];

    const currentIdx = formatsOrder.indexOf(gameData.currentFormat);
    const nextFormat = currentIdx !== -1 && currentIdx < formatsOrder.length - 1 ? formatsOrder[currentIdx + 1] : null;

    const toggleRetention = (id: string) => {
        setRetainedIds(prev => {
            const next = new Set(prev);
            if (next.has(id)) next.delete(id);
            else if (next.size < 5) next.add(id);
            return next;
        });
    };

    const finalizeSeason = () => {
        const retainedPlayers = userTeam?.squad.filter(p => retainedIds.has(p.id)) || [];
        handleEndSeason(retainedPlayers);
    };

    if (view === 'retention') {
        return (
            <div className="p-6 h-full flex flex-col bg-slate-950 text-white overflow-hidden">
                <h2 className="text-3xl font-black italic tracking-tighter uppercase mb-2">Retention Room</h2>
                <p className="text-slate-400 text-xs mb-6 uppercase tracking-widest">Select up to 5 players to keep for next season. Each costs a 1 Cr premium from your auction budget.</p>
                
                <div className="flex-1 overflow-y-auto space-y-2 mb-6 pr-1">
                    {userTeam?.squad.map(p => (
                        <div 
                            key={p.id} 
                            onClick={() => toggleRetention(p.id)}
                            className={`p-4 rounded-2xl border-2 transition-all cursor-pointer ${retainedIds.has(p.id) ? 'bg-teal-500/20 border-teal-500 shadow-[0_0_15px_rgba(20,184,166,0.3)]' : 'bg-slate-900 border-slate-800'}`}
                        >
                            <div className="flex justify-between items-center">
                                <div>
                                    <p className="font-bold text-lg">{p.name} {p.isForeign ? '✈️' : ''}</p>
                                    <p className="text-[10px] text-slate-500 uppercase font-black">{getRoleFullName(p.role)}</p>
                                </div>
                                <div className="text-right">
                                    <div className={`text-xl font-black ${retainedIds.has(p.id) ? 'text-teal-400' : 'text-slate-500'}`}>
                                        {retainedIds.has(p.id) ? 'RETAINED' : 'RELEASE'}
                                    </div>
                                    <div className="text-[9px] text-slate-600 font-bold">Base Cost: 1.0 Cr</div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="bg-slate-900 p-4 rounded-2xl mb-4 border border-slate-800">
                    <div className="flex justify-between items-center">
                        <span className="text-xs font-bold uppercase text-slate-400 tracking-tighter">Slots Used</span>
                        <span className="text-xl font-black text-teal-400 italic">{retainedIds.size}/5</span>
                    </div>
                </div>

                <button 
                    onClick={finalizeSeason}
                    className="w-full bg-teal-500 py-6 rounded-3xl text-xl font-black italic uppercase tracking-tighter shadow-2xl hover:bg-teal-400 transition-all active:scale-95"
                >
                    Finalize & Open Auction
                </button>
            </div>
        );
    }

    return (
        <div className="p-4 text-center flex flex-col justify-between h-full bg-slate-900 overflow-y-auto">
            <div>
                <h2 className="text-3xl font-bold mb-2 text-white">{lastAward?.format} Complete!</h2>
                <div className="my-4 bg-yellow-400/20 border-2 border-yellow-500 rounded-2xl p-6">
                    <p className="text-lg font-semibold text-yellow-300">Champions</p>
                    <p className="text-4xl font-black italic uppercase tracking-tighter text-white">{lastAward?.winnerTeamName}</p>
                </div>
                 <div className="grid grid-cols-2 gap-4">
                    <div className="bg-blue-400/10 border-2 border-blue-500/30 rounded-2xl p-4">
                        <p className="font-bold text-blue-400 text-xs uppercase mb-1">Best Batter</p>
                        <p className="font-bold text-white truncate">{lastAward?.bestBatter.playerName}</p>
                        <p className="text-2xl font-black text-white">{lastAward?.bestBatter.runs}</p>
                    </div>
                    <div className="bg-red-400/10 border-2 border-red-500/30 rounded-2xl p-4">
                         <p className="font-bold text-red-400 text-xs uppercase mb-1">Best Bowler</p>
                        <p className="font-bold text-white truncate">{lastAward?.bestBowler.playerName}</p>
                        <p className="text-2xl font-black text-white">{lastAward?.bestBowler.wickets}</p>
                    </div>
                </div>
            </div>
            <div className="mt-6 space-y-4">
                {nextFormat ? (
                    <button onClick={() => handleFormatChange(nextFormat)} className="w-full bg-teal-500 hover:bg-teal-600 text-white font-bold py-5 px-10 text-xl rounded-2xl shadow-lg uppercase italic tracking-tighter">
                        Proceed to {nextFormat}
                    </button>
                ) : (
                    <button onClick={() => setView('retention')} className="w-full bg-teal-500 hover:bg-teal-600 text-white font-bold py-5 px-10 text-xl rounded-2xl shadow-lg uppercase italic tracking-tighter">
                        End Season & Retain Players
                    </button>
                )}
            </div>
        </div>
    )
}

export default EndOfFormatScreen;