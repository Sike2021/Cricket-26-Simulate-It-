import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Player, Team, GameData, PlayerRole, Format } from '../types';
import { getRoleColor, getRoleFullName, aggregateStats } from '../utils';
import { Icons } from './Icons';

interface AuctionRoomProps {
    gameData: GameData;
    onAuctionComplete: (updatedTeams: Team[]) => void;
}

const STARTING_PURSE = 50.0;
const MAX_FOREIGN_LIMIT = 2;

// Targeted Balanced Squad Ratios
const TARGET_OPENERS = 4;
const TARGET_BATTERS = 7; // specialists total
const TARGET_KEEPERS = 1;
const TARGET_ALL_ROUNDERS = 3;
const TARGET_SPINNERS = 3;
const TARGET_FAST = 5;

// Helper to shuffle array
const shuffle = <T,>(array: T[]): T[] => {
    const newArr = [...array];
    for (let i = newArr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [newArr[i], newArr[j]] = [newArr[j], newArr[i]];
    }
    return newArr;
};

const AuctionRoom: React.FC<AuctionRoomProps> = ({ gameData, onAuctionComplete }) => {
    const mainTeamIds = useMemo(() => 
        gameData.allTeamsData.filter(td => !td.isDevelopmentTeam).map(td => td.id), 
    [gameData.allTeamsData]);

    const [teams, setTeams] = useState<Team[]>(() => 
        gameData.teams.map(t => ({ ...t, squad: t.squad || [], purse: t.purse || STARTING_PURSE }))
    );

    const [activeOverlay, setActiveOverlay] = useState<'none' | 'franchises' | 'pool'>('none');

    // Sorted Pool with deep randomness for auto-auction
    const sortedPool = useMemo(() => {
        const retainedPlayerIds = new Set(teams.flatMap(t => t.squad.map(p => p.id)));
        return gameData.allPlayers
            .filter(pl => !retainedPlayerIds.has(pl.id))
            .sort((a, b) => {
                // Base sorting on skill but with high variance for "randomness"
                const skillA = Math.max(a.battingSkill, a.secondarySkill);
                const skillB = Math.max(b.battingSkill, b.secondarySkill);
                const jitter = (Math.random() * 20) - 10;
                return (skillB + jitter) - (skillA + jitter);
            });
    }, [gameData.allPlayers, teams]);

    const [currentPlayerIdx, setCurrentPlayerIdx] = useState(0);
    const [currentBid, setCurrentBid] = useState(0);
    const [highestBidderId, setHighestBidderId] = useState<string | null>(null);
    const [isAuctioning, setIsAuctioning] = useState(false);
    const [biddingLog, setBiddingLog] = useState<string[]>([]);
    const [auctionFinished, setAuctionFinished] = useState(false);

    const currentPlayer = sortedPool[currentPlayerIdx] || null;
    const userTeam = teams.find(t => t.id === gameData.userTeamId);

    const getBasePrice = (player: Player) => {
        const attr = Math.max(player.battingSkill, player.secondarySkill);
        if (attr > 70) return 2.0;
        if (attr >= 61) return 1.0; 
        if (attr >= 51) return 0.6;
        return 0.25;
    };

    const startNextPlayer = useCallback(() => {
        if (auctionFinished) return;

        if (currentPlayerIdx >= sortedPool.length) {
            setAuctionFinished(true);
            return;
        }

        const player = sortedPool[currentPlayerIdx];
        if (!player) {
            setCurrentPlayerIdx(prev => prev + 1);
            return;
        }

        const bp = getBasePrice(player);
        setCurrentBid(bp);
        setHighestBidderId(null);
        setIsAuctioning(true);
        setBiddingLog(prev => [`Lot #${currentPlayerIdx + 1}: ${player.name} (${getRoleFullName(player.role)}) up for ${bp.toFixed(2)} Cr`, ...prev.slice(0, 5)]);
    }, [currentPlayerIdx, sortedPool, auctionFinished]);

    const handleUserBid = (multiplier: number = 1) => {
        if (!userTeam || !isAuctioning || !currentPlayer) return;
        
        if (currentPlayer.isForeign && userTeam.squad.filter(p => p.isForeign).length >= MAX_FOREIGN_LIMIT) {
            setBiddingLog(prev => [`Foreign limit reached!`, ...prev.slice(0, 5)]);
            return;
        }

        const increment = 0.1 * multiplier;
        const nextBid = Number((currentBid + increment).toFixed(2));
        if (userTeam.purse < nextBid) return;
        
        setCurrentBid(nextBid);
        setHighestBidderId(userTeam.id);
        setBiddingLog(prev => [`${userTeam.name} bids ${nextBid.toFixed(2)} Cr! (+${increment.toFixed(1)})`, ...prev.slice(0, 5)]);
    };

    const skipPlayer = () => {
        if (!currentPlayer || !isAuctioning) return;
        setIsAuctioning(false);

        const eligibleTeams = teams.filter(t => 
            mainTeamIds.includes(t.id) &&
            t.id !== gameData.userTeamId &&
            t.purse >= (getBasePrice(currentPlayer) + 0.2) &&
            t.squad.length < 22 &&
            (!currentPlayer.isForeign || t.squad.filter(p => p.isForeign).length < MAX_FOREIGN_LIMIT)
        );

        if (eligibleTeams.length > 0) {
            const winner = eligibleTeams[Math.floor(Math.random() * eligibleTeams.length)];
            const finalPrice = Number((getBasePrice(currentPlayer) + (Math.random() * 0.4)).toFixed(2));
            setTeams(prev => prev.map(t => {
                if (t.id === winner.id) {
                    return { ...t, purse: Number((t.purse - finalPrice).toFixed(2)), squad: [...t.squad, currentPlayer] };
                }
                return t;
            }));
            setBiddingLog(prev => [`Sold to ${winner.name} for ${finalPrice.toFixed(2)} Cr`, ...prev]);
        } else {
            setBiddingLog(prev => [`Unsold: ${currentPlayer.name}`, ...prev]);
        }
        
        setTimeout(() => setCurrentPlayerIdx(prev => prev + 1), 200);
    };

    const autoAuctionRemaining = () => {
        setIsAuctioning(false);
        setAuctionFinished(true);
    };

    useEffect(() => {
        if (!isAuctioning || !currentPlayer || auctionFinished) return;

        const timer = setTimeout(() => {
            const eligibleTeams = teams.filter(t => 
                mainTeamIds.includes(t.id) &&
                t.id !== highestBidderId && 
                t.purse >= (currentBid + 0.1) &&
                t.squad.length < 22 &&
                (!currentPlayer.isForeign || t.squad.filter(p => p.isForeign).length < MAX_FOREIGN_LIMIT)
            );

            if (eligibleTeams.length > 0) {
                const rating = Math.max(currentPlayer.battingSkill, currentPlayer.secondarySkill);
                
                const biddingTeam = eligibleTeams.find(t => {
                    if (t.id === gameData.userTeamId) return false;
                    // Highly variable valuation for AI team personality
                    const personalityJitter = 0.5 + (Math.random() * 1.0); 
                    const valuation = (rating / 80) * 15.0 * personalityJitter; 
                    return (currentBid + 0.1) <= valuation;
                });

                if (biddingTeam) {
                    const nextBid = Number((currentBid + 0.1).toFixed(2));
                    setCurrentBid(nextBid);
                    setHighestBidderId(biddingTeam.id);
                    setBiddingLog(prev => [`${biddingTeam.name} bids ${nextBid.toFixed(2)} Cr!`, ...prev.slice(0, 5)]);
                } else if (highestBidderId) {
                    sellPlayer();
                } else {
                    unsoldPlayer();
                }
            } else if (highestBidderId) {
                sellPlayer();
            } else {
                unsoldPlayer();
            }
        }, 500 + Math.random() * 500);

        return () => clearTimeout(timer);
    }, [isAuctioning, currentBid, highestBidderId, currentPlayer, gameData.userTeamId, mainTeamIds, teams]);

    const sellPlayer = () => {
        setIsAuctioning(false);
        const winner = teams.find(t => t.id === highestBidderId);
        if (winner && currentPlayer) {
            setTeams(prev => prev.map(t => {
                if (t.id === winner.id) {
                    return {
                        ...t,
                        purse: Number((t.purse - currentBid).toFixed(2)),
                        squad: [...t.squad, currentPlayer]
                    };
                }
                return t;
            }));
            setBiddingLog(prev => [`SOLD! ${currentPlayer.name} to ${winner.name}`, ...prev]);
        }
        setTimeout(() => setCurrentPlayerIdx(prev => prev + 1), 600);
    };

    const unsoldPlayer = () => {
        setIsAuctioning(false);
        setBiddingLog(prev => [`UNSOLD: ${currentPlayer.name}`, ...prev]);
        setTimeout(() => setCurrentPlayerIdx(prev => prev + 1), 600);
    };

    useEffect(() => {
        if (!isAuctioning && !auctionFinished) {
            startNextPlayer();
        }
    }, [currentPlayerIdx, sortedPool, isAuctioning, auctionFinished, startNextPlayer]);

    const finishAuction = () => {
        const soldPlayerIds = new Set(teams.flatMap(t => t.squad.map(p => p.id)));
        const unauctioned = gameData.allPlayers.filter(p => !soldPlayerIds.has(p.id));
        // Shuffle the pool for true randomness in AI squads
        let pool = shuffle([...unauctioned]);

        const finalTeams = teams.map(team => {
            const isDev = gameData.allTeamsData.find(td => td.id === team.id)?.isDevelopmentTeam;
            const targetTotalSize = isDev ? 14 : 20;
            
            let squad = [...team.squad];
            let purse = team.purse;

            const fillNeeded = (role: PlayerRole, count: number, foreignOk: boolean = true) => {
                let existing = squad.filter(p => p.role === role).length;
                while (existing < count && pool.length > 0) {
                    const choices = pool.filter(p => p.role === role && (foreignOk || !p.isForeign)).slice(0, 5);
                    if (choices.length > 0) {
                        const p = choices[Math.floor(Math.random() * choices.length)];
                        const poolIdx = pool.findIndex(pl => pl.id === p.id);
                        pool.splice(poolIdx, 1);
                        squad.push(p);
                        existing++;
                        if (!isDev) purse = Math.max(0, purse - 0.2);
                    } else break;
                }
            };

            if (squad.length < targetTotalSize) {
                fillNeeded(PlayerRole.WICKET_KEEPER, TARGET_KEEPERS);
                fillNeeded(PlayerRole.ALL_ROUNDER, TARGET_ALL_ROUNDERS);
                fillNeeded(PlayerRole.SPIN_BOWLER, 2);
                fillNeeded(PlayerRole.FAST_BOWLER, 3);
            }

            // Final fill to squad size
            while (squad.length < targetTotalSize && pool.length > 0) {
                const choices = pool.slice(0, 10);
                const p = choices[Math.floor(Math.random() * choices.length)];
                const poolIdx = pool.findIndex(pl => pl.id === p.id);
                pool.splice(poolIdx, 1);
                squad.push(p);
                if (!isDev) purse = Math.max(0, purse - 0.2);
            }

            return { ...team, squad, purse };
        });

        onAuctionComplete(finalTeams);
    };

    return (
        <div className="h-full flex flex-col bg-[#020617] text-white font-sans overflow-hidden relative">
            {activeOverlay === 'franchises' && (
                <div className="absolute inset-0 z-50 bg-slate-950 flex flex-col p-4 animate-in slide-in-from-bottom duration-300">
                    <div className="flex justify-between items-center mb-4 border-b border-slate-800 pb-4">
                        <h2 className="text-xl font-black italic tracking-tighter uppercase">ROSTERS</h2>
                        <button onClick={() => setActiveOverlay('none')} className="bg-slate-800 p-2 rounded-full"><Icons.X /></button>
                    </div>
                    <div className="flex-1 overflow-y-auto space-y-6">
                        {teams.map(team => {
                            const td = gameData.allTeamsData.find(d => d.id === team.id);
                            const isDev = td?.isDevelopmentTeam;
                            return (
                                <div key={team.id} className={`p-4 rounded-2xl border ${team.id === gameData.userTeamId ? 'bg-slate-900 border-teal-500 shadow-lg' : 'bg-slate-900/40 border-slate-800'}`}>
                                    <div className="flex justify-between mb-3 border-b border-white/5 pb-2">
                                        <div>
                                            <h4 className="font-black uppercase tracking-tighter text-sm">{team.name} {isDev ? '(Dev)' : ''}</h4>
                                            <p className="text-[10px] text-zinc-500">{team.squad.length} / {isDev ? 14 : 22} signed</p>
                                        </div>
                                        <span className="text-sm font-black text-teal-400">{team.purse.toFixed(2)} Cr</span>
                                    </div>
                                    <div className="grid grid-cols-2 gap-x-4 gap-y-1">
                                        {team.squad.slice(0, 6).map(p => (
                                            <div key={p.id} className="flex justify-between text-[10px]">
                                                <span className="truncate max-w-[80px]">{p.name}</span>
                                                <span className={`${getRoleColor(p.role)} font-bold`}>{p.role}</span>
                                            </div>
                                        ))}
                                        {team.squad.length > 6 && <p className="text-[10px] text-zinc-600 col-span-2">+{team.squad.length - 6} more...</p>}
                                        {team.squad.length === 0 && <p className="text-[10px] text-zinc-600 italic col-span-2">No signings yet...</p>}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}

            <div className="bg-[#0f172a] p-4 pt-10 border-b border-slate-800 flex flex-col gap-2 shadow-2xl z-10">
                <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                        <div className="bg-yellow-500 text-black px-2 py-0.5 rounded font-black text-xs skew-x-[-12deg]">LIVE AUCTION</div>
                        <h1 className="text-sm font-black text-slate-300 tracking-tight uppercase">Session 1</h1>
                    </div>
                    <div className="text-right">
                        <span className="text-xl font-black text-teal-400">{userTeam?.purse?.toFixed(2) || '0.00'} Cr</span>
                        <p className="text-[9px] text-slate-500 font-bold uppercase tracking-widest leading-none">Your Purse</p>
                    </div>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4 flex flex-col">
                {!auctionFinished ? (
                    <>
                        {currentPlayer ? (
                            <div className="bg-slate-900/80 rounded-[2rem] border border-slate-800 shadow-2xl p-6 relative flex flex-col">
                                <div className="flex justify-between items-start mb-6">
                                    <div className={`px-2 py-0.5 rounded text-[10px] font-black uppercase ${getRoleColor(currentPlayer.role)} bg-opacity-20 border border-current`}>
                                        {getRoleFullName(currentPlayer.role)} {currentPlayer.isForeign ? '✈️' : ''}
                                    </div>
                                    <div className="text-[10px] text-slate-600 font-bold uppercase">Pool Rank #{currentPlayerIdx + 1}</div>
                                </div>

                                <div className="text-center mb-8">
                                    <h2 className="text-4xl font-black italic uppercase tracking-tighter break-words leading-none mb-4">
                                        {currentPlayer.name}
                                    </h2>
                                    <div className="flex justify-center gap-6">
                                        <div className="text-center">
                                            <div className="text-[10px] text-slate-500 font-bold uppercase">Batting</div>
                                            <div className="text-2xl font-black text-blue-400">{currentPlayer.battingSkill}</div>
                                        </div>
                                        <div className="text-center">
                                            <div className="text-[10px] text-slate-500 font-bold uppercase">Bowling</div>
                                            <div className="text-2xl font-black text-red-400">{currentPlayer.secondarySkill}</div>
                                        </div>
                                    </div>
                                </div>

                                <div className="bg-black/40 rounded-2xl p-4 mb-8 text-center border border-white/5">
                                    <span className="text-[10px] text-slate-500 uppercase font-black tracking-widest block mb-2">CURRENT BID</span>
                                    <div className="text-6xl font-black text-yellow-400 tabular-nums tracking-tighter">
                                        {currentBid.toFixed(2)} <span className="text-2xl ml-[-10px]">Cr</span>
                                    </div>
                                    <div className="mt-1 text-xs font-bold text-slate-400 uppercase tracking-widest truncate">
                                        {highestBidderId ? `Leading: ${teams.find(t => t.id === highestBidderId)?.name}` : 'Awaiting Bids'}
                                    </div>
                                </div>

                                <div className="flex flex-col gap-3">
                                    <button 
                                        onClick={() => handleUserBid(1)}
                                        disabled={!isAuctioning || (highestBidderId === userTeam?.id) || (userTeam?.purse || 0) < (currentBid + 0.1)}
                                        className={`w-full py-5 rounded-2xl font-black text-2xl italic uppercase tracking-tighter shadow-2xl transition-all transform active:scale-95 ${
                                            highestBidderId === userTeam?.id 
                                            ? 'bg-emerald-900/40 border-2 border-emerald-500 text-emerald-400' 
                                            : 'bg-teal-500 hover:bg-teal-400 text-black'
                                        } disabled:opacity-20`}
                                    >
                                        Place Bid ({(currentBid + 0.1).toFixed(2)})
                                    </button>
                                    
                                    <div className="grid grid-cols-2 gap-3 mt-1">
                                        <button onClick={skipPlayer} className="bg-slate-900/60 hover:bg-slate-700 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest border border-white/5">Pass / Skip</button>
                                        <button onClick={autoAuctionRemaining} className="bg-red-950/40 hover:bg-red-900/60 border border-red-900/50 py-4 rounded-2xl text-[10px] font-black text-red-300 uppercase tracking-widest">Random Auto-Draft</button>
                                    </div>
                                </div>
                            </div>
                        ) : null}

                        <div className="mt-auto pt-6 flex flex-col gap-4">
                            <button onClick={() => setActiveOverlay('franchises')} className="w-full bg-slate-800 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2">
                                <Icons.Podium /> All Team Rosters
                            </button>
                            
                            <div className="bg-black p-4 rounded-2xl h-28 overflow-y-auto border border-white/5 font-mono text-[10px]">
                                <div className="text-slate-600 mb-2 border-b border-white/10 pb-1 uppercase tracking-widest">Live Feed</div>
                                {biddingLog.map((log, i) => (
                                    <div key={i} className={`mb-1 ${i === 0 ? 'text-teal-400 font-bold' : 'text-slate-500'}`}>
                                        {log}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </>
                ) : (
                    <div className="flex-1 flex flex-col items-center justify-center text-center px-4">
                        <div className="text-8xl mb-8">🏏</div>
                        <h2 className="text-4xl font-black italic tracking-tighter leading-none mb-4 uppercase text-teal-400">DRAFT FINALIZED</h2>
                        <p className="text-slate-400 mb-12 text-sm px-6">Every squad is now filled. Your development teams have been capped at 14 players. Match 1 is ready.</p>
                        <button onClick={finishAuction} className="w-full bg-teal-500 py-6 rounded-[2rem] text-xl font-black italic tracking-tighter uppercase shadow-[0_0_40px_rgba(20,184,166,0.3)] hover:bg-teal-400 transition-colors">
                            Enter Career
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AuctionRoom;