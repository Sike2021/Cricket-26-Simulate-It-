
import React, { useEffect, useRef, useState, useMemo } from 'react';
import { Match, GameData, MatchResult, Strategy, LiveMatchState, Player, Ground } from '../types';
import { useLiveMatch } from '../hooks/useLiveMatch';
import { Icons } from './Icons';
import { TV_CHANNELS, INITIAL_SPONSORSHIPS, TOURNAMENT_LOGOS } from '../data';
import { getPlayerById } from '../utils';

interface LiveMatchScreenProps {
    match: Match;
    gameData: GameData;
    onMatchComplete: (result: MatchResult) => void;
    onExit: (stateToSave?: LiveMatchState) => void;
    savedState?: LiveMatchState | null;
}

const StrategyToggle = ({ label, value, onChange }: { label: string, value: Strategy, onChange: (s: Strategy) => void }) => (
    <div className="flex flex-col items-center bg-slate-800 rounded p-1 flex-1">
        <span className="text-[9px] text-slate-400 uppercase mb-1">{label}</span>
        <div className="flex bg-slate-900 rounded p-0.5 w-full justify-center">
            {(['defensive', 'balanced', 'attacking'] as Strategy[]).map(s => (
                <button
                    key={s}
                    onClick={() => onChange(s)}
                    className={`px-2 py-1 text-[9px] uppercase font-bold rounded transition-colors flex-1 ${value === s 
                        ? s === 'attacking' ? 'bg-red-600 text-white' : s === 'defensive' ? 'bg-blue-600 text-white' : 'bg-yellow-600 text-white' 
                        : 'text-slate-500 hover:bg-slate-700'}`}
                >
                    {s.slice(0,3)}
                </button>
            ))}
        </div>
    </div>
);

const AutoArrivalNotification = ({ playerName, onOverride, secondsLeft }: { playerName: string, onOverride: () => void, secondsLeft: number }) => (
    <div className="absolute bottom-24 left-1/2 -translate-x-1/2 z-30 bg-slate-900/90 border border-teal-500/50 rounded-lg shadow-2xl p-4 flex items-center gap-4 animate-slide-up min-w-[300px]">
        <div className="flex-shrink-0 w-10 h-10 rounded-full bg-teal-900 flex items-center justify-center text-teal-400 animate-pulse">
            <Icons.User className="w-6 h-6" />
        </div>
        <div className="flex-grow">
            <p className="text-[10px] text-teal-400 uppercase font-bold">Next Batter Arriving</p>
            <p className="text-white font-bold text-lg">{playerName}</p>
        </div>
        <div className="flex flex-col items-end gap-1">
            <span className="text-xs font-mono text-slate-400">{secondsLeft}s</span>
            <div className="text-[9px] text-gray-500 uppercase">Click to skip</div>
        </div>
    </div>
);

const LiveMatchScreen: React.FC<LiveMatchScreenProps> = ({ match, gameData, onMatchComplete, onExit, savedState }) => {
    const { state, playBall, playOver, autoSimulate, simulateInning, simulateMatch, setBattingStrategy, setBowlingStrategy, selectOpeners, selectNextBatter, selectNextBowler, startMatch } = useLiveMatch(match, gameData, onMatchComplete, savedState);
    const commentaryRef = useRef<HTMLDivElement>(null);
    const [lastBallSpeed, setLastBallSpeed] = useState<string>("-");
    
    // Match Centre State
    const [showMatchCentre, setShowMatchCentre] = useState(false);
    const [activeTab, setActiveTab] = useState<'scorecard' | 'commentary' | 'analysis'>('scorecard');
    
    const [selectedOpener1, setSelectedOpener1] = useState('');
    const [selectedOpener2, setSelectedOpener2] = useState('');
    const [selectedBatter, setSelectedBatter] = useState('');
    const [selectedBowler, setSelectedBowler] = useState('');
    const [tossState, setTossState] = useState<'coin' | 'result'>('coin');

    // Auto Arrival State
    const [autoArrivalSeconds, setAutoArrivalSeconds] = useState<number | null>(null);
    const autoArrivalTimerRef = useRef<any>(null);
    const [nextAutoPlayerId, setNextAutoPlayerId] = useState<string | null>(null);

    const sponsorship = gameData.sponsorships?.[gameData.currentFormat];
    const tvChannelData = TV_CHANNELS.find(t => t.name === sponsorship?.tvChannel);
    const tvLogo = sponsorship?.tvLogo;
    const tvColor = tvChannelData?.color || 'text-white';

    // Auto-select / Pre-fill logic AND Auto-Arrival
    useEffect(() => {
        if (!state) return;
        
        // Clear previous timer if state changes away from waiting
        if (!state.waitingFor) {
            if (autoArrivalTimerRef.current) {
                clearInterval(autoArrivalTimerRef.current);
                autoArrivalTimerRef.current = null;
            }
            setAutoArrivalSeconds(null);
            setNextAutoPlayerId(null);
            return;
        }

        // Helper to find next player
        const getNextPlayer = () => {
            const currentInning = state.innings[state.currentInningIndex];
            if (state.waitingFor === 'batter') {
                return currentInning.batting.find(b => !b.isOut && b.playerId !== state.currentBatters.strikerId && b.playerId !== state.currentBatters.nonStrikerId);
            } else if (state.waitingFor === 'bowler') {
                const overLimit = gameData.currentFormat.includes('T20') ? 4 : 10;
                const validBowlers = currentInning.bowling.filter(b => b.playerId !== state.currentBowlerId && b.ballsBowled < overLimit * 6);
                // Simple rotation logic for auto
                return validBowlers[0];
            }
            return null;
        };

        if (state.waitingFor === 'openers') {
             const currentInning = state.innings[state.currentInningIndex];
             const available = currentInning.batting.filter(b => !b.isOut);
             if (available.length >= 2) {
                 setSelectedOpener1(available[0].playerId);
                 setSelectedOpener2(available[1].playerId);
             }
        } else if (state.waitingFor === 'batter' || state.waitingFor === 'bowler') {
            const nextP = getNextPlayer();
            
            if (nextP) {
                // Pre-fill selection
                if (state.waitingFor === 'batter') setSelectedBatter(nextP.playerId);
                if (state.waitingFor === 'bowler') setSelectedBowler(nextP.playerId);
                setNextAutoPlayerId(nextP.playerId);

                // Start Auto-Arrival Countdown
                if (!autoArrivalTimerRef.current) {
                    setAutoArrivalSeconds(5);
                    autoArrivalTimerRef.current = setInterval(() => {
                        setAutoArrivalSeconds(prev => {
                            if (prev === 1) {
                                clearInterval(autoArrivalTimerRef.current);
                                autoArrivalTimerRef.current = null;
                                // Trigger Action
                                if (state.waitingFor === 'batter') selectNextBatter(nextP.playerId);
                                if (state.waitingFor === 'bowler') selectNextBowler(nextP.playerId);
                                return 0;
                            }
                            return (prev || 0) - 1;
                        });
                    }, 1000);
                }
            }
        }
    }, [state?.waitingFor, state?.currentInningIndex, state?.innings, state?.currentBatters, state?.currentBowlerId, gameData.currentFormat]);

    const handleOverrideAuto = () => {
        if (autoArrivalTimerRef.current) {
            clearInterval(autoArrivalTimerRef.current);
            autoArrivalTimerRef.current = null;
        }
        setAutoArrivalSeconds(null);
        setNextAutoPlayerId(null);
        
        // Immediate execution if click happens
        if (nextAutoPlayerId) {
             if (state?.waitingFor === 'batter') selectNextBatter(nextAutoPlayerId);
             if (state?.waitingFor === 'bowler') selectNextBowler(nextAutoPlayerId);
        }
    };

    useEffect(() => {
        if (activeTab === 'commentary' && commentaryRef.current) {
            commentaryRef.current.scrollTop = 0;
        }
    }, [state?.commentary, activeTab]);

    useEffect(() => {
        if (state?.recentBalls.length) {
            const baseSpeed = 130;
            const variation = Math.floor(Math.random() * 25) - 10;
            setLastBallSpeed(`${baseSpeed + variation} km/h`);
        }
    }, [state?.innings[state.currentInningIndex].overs]);

    // --- PREDICTIONS & STATS CALCULATIONS ---
    const predictions = useMemo(() => {
        if (!state) return null;
        const { innings, currentInningIndex, target, battingTeam, bowlingTeam, currentBatters } = state;
        const currentInning = innings[currentInningIndex];
        const maxOvers = gameData.currentFormat.includes('T20') ? 20 : 50;
        const ballsBowled = Math.floor(parseFloat(currentInning.overs)) * 6 + (parseFloat(currentInning.overs) % 1 * 10);
        const ballsRemaining = (maxOvers * 6) - ballsBowled;
        const currentRunRate = ballsBowled > 0 ? (currentInning.score / ballsBowled) * 6 : 6;
        
        // Win Probability
        let winProb = 50;
        if (target) {
            const runsNeeded = target - currentInning.score + 1;
            const reqRate = ballsRemaining > 0 ? (runsNeeded / ballsRemaining) * 6 : 99;
            
            if (runsNeeded <= 0) winProb = 100;
            else if (ballsRemaining <= 0) winProb = 0;
            else {
                // Simple logistic-like heuristic
                const rateDiff = currentRunRate - reqRate;
                const wicketsFactor = (10 - currentInning.wickets) * 5;
                winProb = 50 + (rateDiff * 10) + (wicketsFactor - 25); // Base 50, adjust by rate and wickets
                if (currentInning.wickets >= 9) winProb -= 30;
            }
        } else {
            // Batting first
            const projScore = currentInning.score + (currentRunRate * (ballsRemaining/6));
            const parScore = maxOvers === 20 ? 160 : 280;
            winProb = 50 + ((projScore - parScore) / 2);
        }
        winProb = Math.max(0, Math.min(100, winProb));

        // Projected Scores
        const projCurrent = Math.round(currentInning.score + (currentRunRate * (ballsRemaining/6)));
        const proj6 = Math.round(currentInning.score + (6 * (ballsRemaining/6)));
        const proj8 = Math.round(currentInning.score + (8 * (ballsRemaining/6)));
        const proj10 = Math.round(currentInning.score + (10 * (ballsRemaining/6)));

        // Player Prediction
        const striker = currentInning.batting.find(b => b.playerId === currentBatters.strikerId);
        let playerProj = 0;
        if (striker) {
            // Assume they face 40% of remaining balls if top order, less if tail
            const expectedBalls = ballsRemaining * 0.4; 
            const currentSR = striker.balls > 0 ? (striker.runs / striker.balls) : 0.8; // Default 80 SR
            playerProj = Math.round(striker.runs + (expectedBalls * currentSR));
        }

        return {
            winProb: Math.round(winProb),
            projCurrent,
            proj6,
            proj8,
            proj10,
            playerProj
        };
    }, [state, gameData.currentFormat]);


    if (!state) return <div className="h-full flex items-center justify-center bg-slate-900 text-white">Loading Match...</div>;

    const { battingTeam, bowlingTeam, innings, currentInningIndex, currentBatters, currentBowlerId, recentBalls, commentary, target, waitingFor, strategies } = state;
    
    const isUserBatting = battingTeam?.id === gameData.userTeamId;
    const isUserBowling = bowlingTeam?.id === gameData.userTeamId;

    const handleExit = () => {
        // If match not finished, save state
        if (state.status !== 'completed') {
            onExit(state);
        } else {
            onExit();
        }
    };

    const currentInning = innings[currentInningIndex];
    const striker = currentInning.batting.find(b => b.playerId === currentBatters.strikerId);
    const nonStriker = currentInning.batting.find(b => b.playerId === currentBatters.nonStrikerId);
    const bowler = currentInning.bowling.find(b => b.playerId === currentBowlerId);

    const runRate = parseFloat(currentInning.overs) > 0 ? (currentInning.score / parseFloat(currentInning.overs)).toFixed(2) : "0.00";
    let reqRate = "N/A";
    let runsNeeded = 0;
    let ballsRemaining = 0;
    
    if (target) {
        runsNeeded = target - currentInning.score + 1;
        const totalBalls = (gameData.currentFormat.includes('T20') ? 20 : 50) * 6;
        const ballsBowled = Math.floor(parseFloat(currentInning.overs)) * 6 + (parseFloat(currentInning.overs) % 1 * 10);
        ballsRemaining = totalBalls - ballsBowled;
        if (ballsRemaining > 0) {
             reqRate = (runsNeeded / (ballsRemaining/6)).toFixed(2);
        }
    }

    const fielders = [
        { x: 160, y: 80 }, { x: 240, y: 80 }, { x: 100, y: 160 }, { x: 300, y: 160 },
        { x: 120, y: 280 }, { x: 280, y: 280 }, { x: 200, y: 340 }, { x: 60, y: 200 }, { x: 340, y: 200 }
    ];

    const lastBall = recentBalls.length > 0 ? recentBalls[0] : null;
    const isWicket = lastBall === 'W';
    const isBoundary = lastBall === '4' || lastBall === '6';

    // --- Selection Modals ---
    const renderSelectionModal = (title: string, options: any[], onSelect: (id: any) => void, onConfirm: () => void, selectedValue: string, setValue: (v: string) => void, extraSelect?: any) => {
        // If auto-arrival is active, don't show modal yet
        if (autoArrivalSeconds !== null) return null;

        if (state.autoPlayType === 'inning' || state.autoPlayType === 'match') return <div className="absolute inset-0 bg-black/50 z-50 flex items-center justify-center text-white font-bold animate-pulse">Simulating...</div>;
        return (
            <div className="absolute inset-0 bg-black/90 z-[100] flex flex-col items-center justify-center p-6">
                <h3 className="text-xl font-bold mb-4 text-white text-center">{title}</h3>
                <div className="w-full max-w-sm space-y-4 bg-slate-800 p-4 rounded-lg shadow-xl">
                    {extraSelect}
                    <select className="w-full p-2 bg-slate-900 text-white rounded border border-slate-600" value={selectedValue} onChange={e => setValue(e.target.value)}>
                        <option value="">Select Player</option>
                        {options.map(p => <option key={p.playerId} value={p.playerId}>{p.playerName} {p.overs ? `(${p.overs})` : ''}</option>)}
                    </select>
                    <button 
                        disabled={!selectedValue || (extraSelect && !selectedOpener1)} // Hacky check for openers
                        onClick={onConfirm}
                        className="w-full bg-teal-500 hover:bg-teal-600 text-white font-bold py-3 rounded disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        Confirm
                    </button>
                </div>
            </div>
        );
    };

    // --- Match Centre Overlay ---
    const renderMatchCentre = () => (
        <div className="absolute inset-0 bg-slate-900/95 z-40 flex flex-col p-4 animate-fade-in">
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-teal-400">Match Centre</h2>
                <button onClick={() => setShowMatchCentre(false)} className="p-2 bg-slate-800 rounded-full"><Icons.X className="h-5 w-5" /></button>
            </div>
            
            <div className="flex bg-slate-800 rounded-lg p-1 mb-4">
                {['scorecard', 'commentary', 'analysis'].map(tab => (
                    <button
                        key={tab}
                        onClick={() => setActiveTab(tab as any)}
                        className={`flex-1 py-2 text-xs font-bold uppercase rounded-md ${activeTab === tab ? 'bg-slate-700 text-white shadow' : 'text-slate-400 hover:text-white'}`}
                    >
                        {tab}
                    </button>
                ))}
            </div>

            <div className="flex-1 overflow-y-auto pr-1">
                {activeTab === 'scorecard' && (
                    <div className="space-y-4">
                        <div className="bg-slate-800 rounded-lg p-3">
                            <h3 className="text-sm font-bold text-yellow-400 mb-2 border-b border-slate-700 pb-1">Batting</h3>
                            <table className="w-full text-xs">
                                <thead><tr className="text-slate-500 text-left"><th className="pb-1">Batter</th><th className="text-right pb-1">R</th><th className="text-right pb-1">B</th><th className="text-right pb-1">4s</th><th className="text-right pb-1">6s</th><th className="text-right pb-1">SR</th></tr></thead>
                                <tbody>
                                    {currentInning.batting.map(b => (
                                        <tr key={b.playerId} className={`border-b border-slate-700/50 ${b.isOut ? 'text-slate-500' : 'text-white'}`}>
                                            <td className="py-1.5 font-medium">
                                                {b.playerName} {b.playerId === currentBatters.strikerId ? '*' : ''}
                                                <div className="text-[9px] text-slate-500 font-normal">{b.dismissalText}</div>
                                            </td>
                                            <td className="text-right font-bold">{b.runs}</td>
                                            <td className="text-right">{b.balls}</td>
                                            <td className="text-right">{b.fours}</td>
                                            <td className="text-right">{b.sixes}</td>
                                            <td className="text-right">{b.balls > 0 ? Math.round((b.runs/b.balls)*100) : 0}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                        <div className="bg-slate-800 rounded-lg p-3">
                            <h3 className="text-sm font-bold text-blue-400 mb-2 border-b border-slate-700 pb-1">Bowling</h3>
                            <table className="w-full text-xs">
                                <thead><tr className="text-slate-500 text-left"><th className="pb-1">Bowler</th><th className="text-right pb-1">O</th><th className="text-right pb-1">M</th><th className="text-right pb-1">R</th><th className="text-right pb-1">W</th><th className="text-right pb-1">Econ</th></tr></thead>
                                <tbody>
                                    {currentInning.bowling.filter(b => parseFloat(b.overs) > 0 || b.playerId === currentBowlerId).map(b => (
                                        <tr key={b.playerId} className="border-b border-slate-700/50 text-white">
                                            <td className="py-1.5 font-medium">{b.playerName} {b.playerId === currentBowlerId ? '🥎' : ''}</td>
                                            <td className="text-right">{b.overs}</td>
                                            <td className="text-right">{b.maidens}</td>
                                            <td className="text-right">{b.runsConceded}</td>
                                            <td className="text-right font-bold text-yellow-400">{b.wickets}</td>
                                            <td className="text-right">{b.ballsBowled > 0 ? ((b.runsConceded/b.ballsBowled)*6).toFixed(1) : '0.0'}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {activeTab === 'commentary' && (
                    <div className="space-y-2" ref={commentaryRef}>
                        {commentary.map((line, i) => (
                            <div key={i} className="bg-slate-800 p-2 rounded text-xs font-mono text-slate-300 border-l-2 border-teal-500">
                                {line}
                            </div>
                        ))}
                    </div>
                )}

                {activeTab === 'analysis' && predictions && (
                    <div className="space-y-4">
                        <div className="bg-slate-800 rounded-lg p-4">
                            <h3 className="text-sm font-bold text-white mb-3">Win Probability</h3>
                            <div className="h-4 bg-slate-700 rounded-full overflow-hidden relative">
                                <div className="h-full bg-teal-500 transition-all duration-1000" style={{ width: `${battingTeam.id === gameData.userTeamId ? predictions.winProb : 100 - predictions.winProb}%` }}></div>
                            </div>
                            <div className="flex justify-between text-xs mt-1 font-bold">
                                <span className="text-teal-400">{gameData.userTeamId === battingTeam.id ? battingTeam.name : bowlingTeam.name} {battingTeam.id === gameData.userTeamId ? predictions.winProb : 100 - predictions.winProb}%</span>
                                <span className="text-slate-400">{gameData.userTeamId !== battingTeam.id ? battingTeam.name : bowlingTeam.name} {battingTeam.id !== gameData.userTeamId ? predictions.winProb : 100 - predictions.winProb}%</span>
                            </div>
                        </div>

                        <div className="bg-slate-800 rounded-lg p-4">
                            <h3 className="text-sm font-bold text-white mb-3">Projected Score</h3>
                            <div className="grid grid-cols-2 gap-3 text-center">
                                <div className="bg-slate-700/50 p-2 rounded">
                                    <div className="text-[10px] text-slate-400 uppercase">Current Rate</div>
                                    <div className="text-xl font-bold text-white">{predictions.projCurrent}</div>
                                </div>
                                <div className="bg-slate-700/50 p-2 rounded">
                                    <div className="text-[10px] text-slate-400 uppercase">At 8 RPO</div>
                                    <div className="text-xl font-bold text-white">{predictions.proj8}</div>
                                </div>
                                <div className="bg-slate-700/50 p-2 rounded">
                                    <div className="text-[10px] text-slate-400 uppercase">At 10 RPO</div>
                                    <div className="text-xl font-bold text-white">{predictions.proj10}</div>
                                </div>
                                 <div className="bg-slate-700/50 p-2 rounded border border-yellow-600/30">
                                    <div className="text-[10px] text-yellow-400 uppercase">Safe Score</div>
                                    <div className="text-xl font-bold text-yellow-400">{gameData.currentFormat.includes('T20') ? 175 : 285}</div>
                                </div>
                            </div>
                        </div>

                        <div className="bg-slate-800 rounded-lg p-4">
                            <h3 className="text-sm font-bold text-white mb-2">Player Prediction</h3>
                            <div className="flex justify-between items-center">
                                <span className="text-sm text-slate-300">{striker?.playerName} to score</span>
                                <span className="text-xl font-bold text-teal-400">{predictions.playerProj}</span>
                            </div>
                            <p className="text-[10px] text-slate-500 mt-1">Based on current strike rate and match situation.</p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );

    return (
        <div className="h-full flex flex-col bg-slate-900 text-white font-sans overflow-hidden relative">
            <style>{`
                @keyframes ball-path {
                    0% { cy: 175; cx: 205; opacity: 0; }
                    20% { opacity: 1; }
                    100% { cy: 220; cx: 200; }
                }
                @keyframes bat-swing {
                    0% { transform: rotate(0deg); }
                    50% { transform: rotate(-45deg); }
                    100% { transform: rotate(0deg); }
                }
                .animate-ball { animation: ball-path 0.5s ease-in forwards; }
                .animate-bat { animation: bat-swing 0.3s ease-out; transform-origin: top center; }
                @keyframes slide-up { from { transform: translate(-50%, 100%); opacity: 0; } to { transform: translate(-50%, 0); opacity: 1; } }
                .animate-slide-up { animation: slide-up 0.5s ease-out forwards; }
            `}</style>

            {/* Broadcaster Overlay */}
            {tvLogo && (
                <div className="absolute top-14 right-2 z-20 flex flex-col items-end pointer-events-none animate-fade-in">
                    <div className={`w-16 h-12 opacity-80 flex items-center justify-end ${tvColor}`} dangerouslySetInnerHTML={{ __html: tvLogo }} />
                    <div className="bg-red-600 text-white text-[8px] font-bold px-1 rounded flex items-center gap-1">
                        <span className="w-1 h-1 bg-white rounded-full animate-pulse"></span> LIVE
                    </div>
                </div>
            )}

            {/* Clickable Area for Auto-Dismiss (Only visible when timer is active) */}
            {autoArrivalSeconds !== null && (
                <div 
                    className="absolute inset-0 z-25 cursor-pointer" 
                    onClick={handleOverrideAuto}
                    title="Click anywhere to skip timer"
                ></div>
            )}

            {/* Auto Arrival Notification */}
            {autoArrivalSeconds !== null && nextAutoPlayerId && (
                <div className="absolute bottom-24 left-1/2 -translate-x-1/2 z-30 pointer-events-none"> 
                    {/* Wrapper to position centered, content inside */}
                    <AutoArrivalNotification 
                        playerName={getPlayerById(nextAutoPlayerId, gameData.allPlayers).name} 
                        onOverride={handleOverrideAuto} 
                        secondsLeft={autoArrivalSeconds} 
                    />
                </div>
            )}

            {waitingFor === 'openers' && renderSelectionModal("Select Opening Pair", currentInning.batting.filter(p => !p.isOut && p.playerId !== selectedOpener1), (id) => setSelectedOpener2(id), () => { selectOpeners(selectedOpener1, selectedOpener2); setSelectedOpener1(''); setSelectedOpener2(''); }, selectedOpener2, setSelectedOpener2, (
                <div>
                    <label className="text-sm text-gray-300 block mb-1">Striker</label>
                    <select className="w-full p-2 bg-slate-900 text-white rounded border border-slate-600" value={selectedOpener1} onChange={e => setSelectedOpener1(e.target.value)}>
                        <option value="">Select Player</option>
                        {currentInning.batting.filter(p => !p.isOut).map(p => <option key={p.playerId} value={p.playerId}>{p.playerName}</option>)}
                    </select>
                </div>
            ))}
            {waitingFor === 'batter' && renderSelectionModal("Select Next Batter", currentInning.batting.filter(p => !p.isOut && p.playerId !== currentBatters.nonStrikerId && p.playerId !== currentBatters.strikerId), (id) => setSelectedBatter(id), () => { selectNextBatter(selectedBatter); setSelectedBatter(''); }, selectedBatter, setSelectedBatter)}
            {waitingFor === 'bowler' && renderSelectionModal("Select Next Bowler", currentInning.bowling.filter(p => p.playerId !== currentBowlerId), (id) => setSelectedBowler(id), () => { selectNextBowler(selectedBowler); setSelectedBowler(''); }, selectedBowler, setSelectedBowler)}

            {showMatchCentre && renderMatchCentre()}

            {/* TOP BAR */}
            <div className="bg-gradient-to-r from-slate-800 to-slate-900 p-2 flex justify-between items-center shadow-lg z-20 border-b border-slate-700 flex-shrink-0 relative">
                 <div className="flex flex-col max-w-[40%]">
                     <span className="text-[10px] text-slate-400 uppercase tracking-wider font-bold truncate">{gameData.currentFormat}</span>
                     <div className="flex items-center gap-2">
                         <div className="flex items-center gap-1">
                             <div className="w-4 h-4" dangerouslySetInnerHTML={{__html: gameData.allTeamsData.find(t => t.name === match.teamA)?.logo || ''}}></div>
                             <span className="text-xs font-bold text-white truncate">{match.teamA}</span>
                         </div>
                         <span className="text-xs text-slate-500">vs</span>
                         <div className="flex items-center gap-1">
                             <div className="w-4 h-4" dangerouslySetInnerHTML={{__html: gameData.allTeamsData.find(t => t.name === match.teamB)?.logo || ''}}></div>
                             <span className="text-xs font-bold text-white truncate">{match.teamB}</span>
                         </div>
                     </div>
                 </div>
                 <div className="flex items-center gap-3">
                     <button onClick={handleExit} className="text-xs text-red-400 border border-red-900 bg-red-900/20 px-2 py-1 rounded hover:bg-red-900/40">
                        {state.status === 'completed' ? 'Exit' : 'Save & Exit'}
                     </button>
                     <div className="text-right">
                         <div className="text-[10px] text-slate-400 uppercase">Over</div>
                         <div className="text-sm font-mono font-bold text-cyan-400">{currentInning.overs}</div>
                     </div>
                     <div className="h-8 w-8 rounded-full bg-slate-700 flex items-center justify-center border border-slate-600 flex-shrink-0">
                         <span className="text-[10px] font-bold">{target ? '2nd' : '1st'}</span>
                     </div>
                 </div>
                 
                 {/* Win Probability Bar - HUD */}
                 <div className="absolute bottom-0 left-0 w-full h-1 flex">
                    <div className="h-full bg-yellow-500 transition-all duration-500" style={{ width: `${battingTeam.id === gameData.userTeamId ? predictions?.winProb : 100 - (predictions?.winProb||50)}%` }} />
                    <div className="h-full bg-blue-600 transition-all duration-500 flex-1" />
                 </div>
            </div>

            {/* MAIN FIELD */}
            <div className="flex-1 relative bg-[#2d5a27] overflow-hidden shadow-inner flex flex-col items-center justify-center min-h-0">
                <div className="absolute inset-0 bg-[radial-gradient(circle,rgba(255,255,255,0.05)_1px,transparent_1px)] bg-[length:20px_20px] opacity-20 pointer-events-none"></div>
                
                {/* Top Left Stats */}
                <div className="absolute top-4 left-4 z-10 bg-black/60 backdrop-blur-sm border-l-4 border-yellow-500 p-2 rounded-r-lg shadow-lg min-w-[120px]">
                    <div className="flex items-center gap-2 mb-1">
                        <div className="w-4 h-4" dangerouslySetInnerHTML={{__html: gameData.allTeamsData.find(t => t.id === battingTeam.id)?.logo || ''}}></div>
                        <div className="text-[10px] text-yellow-400 font-bold uppercase">{battingTeam.name}</div>
                    </div>
                    <div className="text-2xl font-extrabold text-white leading-none mb-1">{currentInning.score}/{currentInning.wickets}</div>
                    <div className="text-[9px] text-gray-300 flex justify-between gap-2">
                        <span>CRR: {runRate}</span>
                        {target && <span>RRR: {reqRate}</span>}
                    </div>
                </div>

                {/* Top Right Stats */}
                <div className="absolute top-16 right-4 z-10 bg-black/60 backdrop-blur-sm border-r-4 border-blue-500 p-2 rounded-l-lg shadow-lg min-w-[120px] text-right">
                     <div className="flex items-center justify-end gap-2 mb-1">
                        <div className="text-[10px] text-blue-400 font-bold uppercase">{bowlingTeam.name}</div>
                        <div className="w-4 h-4" dangerouslySetInnerHTML={{__html: gameData.allTeamsData.find(t => t.id === bowlingTeam.id)?.logo || ''}}></div>
                     </div>
                     {target ? (
                         <>
                            <div className="text-lg font-bold text-white leading-none mb-1">{runsNeeded} <span className="text-xs font-normal text-gray-300">off</span> {ballsRemaining}</div>
                            <div className="text-[9px] text-gray-300">Target: {target + 1}</div>
                         </>
                     ) : (
                         <>
                            <div className="text-lg font-bold text-white leading-none mb-1">{predictions?.projCurrent || '-'}</div>
                            <div className="text-[9px] text-gray-300">Projected Score</div>
                         </>
                     )}
                </div>

                {/* Field SVG */}
                <div className="w-full h-full flex items-center justify-center p-2">
                    <svg viewBox="0 0 400 400" className="h-full w-full max-h-[60vh] max-w-md drop-shadow-2xl" preserveAspectRatio="xMidYMid meet">
                        <defs>
                            <pattern id="grass" x="0" y="0" width="10" height="10" patternUnits="userSpaceOnUse">
                                <rect width="10" height="10" fill="#35682d" />
                                <circle cx="1" cy="1" r="1" fill="#3e7a35" />
                            </pattern>
                        </defs>
                        <circle cx="200" cy="200" r="190" fill="url(#grass)" stroke="#ffffff" strokeWidth="2" strokeOpacity="0.8" />
                        <circle cx="200" cy="200" r="80" fill="none" stroke="#ffffff" strokeWidth="1" strokeOpacity="0.6" strokeDasharray="4,4" />
                        <rect x="196" y="170" width="8" height="60" fill="#d2b48c" stroke="#bfa07a" strokeWidth="0.5" />
                        <line x1="194" y1="178" x2="206" y2="178" stroke="white" strokeWidth="0.5" />
                        <line x1="194" y1="222" x2="206" y2="222" stroke="white" strokeWidth="0.5" />
                        <circle cx="200" cy="177" r="1" fill="black" />
                        <circle cx="200" cy="223" r="1" fill="black" />
                        
                        <g transform="translate(200, 165)">
                             <circle r="3" fill="#ef4444" stroke="white" strokeWidth="1" />
                             <text y="-4" textAnchor="middle" fill="white" fontSize="6" fontWeight="bold">{bowler?.playerName.split(' ').pop()?.substring(0,1)}</text>
                        </g>
                        
                         <g transform="translate(200, 225)">
                             <circle r="3" fill="#eab308" stroke="white" strokeWidth="1" />
                             <rect x="2" y="-1" width="2" height="8" fill="#854d0e" className={lastBall ? "animate-bat" : ""} transform="rotate(15)" />
                        </g>
                        
                        <g transform="translate(190, 178)">
                             <circle r="3" fill="#eab308" stroke="white" strokeWidth="1" opacity="0.8" />
                        </g>
                        
                        <g transform="translate(200, 235)">
                             <circle r="2" fill="black" stroke="white" strokeWidth="0.5" />
                        </g>

                        {fielders.map((pos, i) => (
                            <circle key={i} cx={pos.x} cy={pos.y} r="3" fill="#ef4444" stroke="white" strokeWidth="0.5" opacity="0.9" />
                        ))}
                        
                        {lastBall && (
                            <circle cx="200" cy="175" r="1.5" fill="white" className="animate-ball" />
                        )}
                    </svg>
                </div>

                {/* Ball Result Overlay */}
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 pointer-events-none z-20">
                    {lastBall && (
                        <div className={`
                            flex items-center justify-center rounded-full h-20 w-20 
                            ${isWicket ? 'bg-red-600' : isBoundary ? 'bg-purple-600' : 'bg-slate-800/80'}
                            border-4 border-white shadow-2xl animate-bounce
                        `}>
                            <span className="text-3xl font-black text-white">{lastBall === 'W' ? 'OUT' : lastBall}</span>
                        </div>
                    )}
                </div>
                
                <div className="absolute bottom-2 right-2 z-10">
                    <button onClick={() => setShowMatchCentre(true)} className="bg-slate-800/90 text-xs font-bold text-white px-4 py-2 rounded-full border border-slate-600 shadow-lg flex items-center gap-2 animate-pulse">
                        <Icons.ChartPie /> Match Centre
                    </button>
                </div>
            </div>

            {/* BOTTOM INFO BAR */}
            <div className="bg-slate-800 border-t border-slate-700 p-1 flex-shrink-0">
                <div className="flex items-stretch bg-slate-900/50 rounded overflow-hidden text-xs">
                    
                    {/* Bowler Stats */}
                    <div className="flex-1 p-2 border-r border-slate-700">
                        <div className="text-[9px] text-slate-500 uppercase font-bold">Bowling</div>
                        <div className="font-bold text-white truncate">{bowler?.playerName}</div>
                        <div className="text-slate-400 font-mono">{bowler?.wickets}-{bowler?.runsConceded} <span className="text-[9px]">({bowler?.overs})</span></div>
                    </div>

                    {/* Batters Stats - Enhanced */}
                    <div className="flex-[2] flex">
                        <div className={`flex-1 p-2 border-r border-slate-700/50 ${striker?.playerId === currentBatters.strikerId ? 'bg-yellow-900/20' : ''}`}>
                            <div className="text-[9px] text-yellow-500/70 uppercase font-bold flex justify-between">
                                <span>Striker</span>
                                {striker?.playerId === currentBatters.strikerId && <span>★</span>}
                            </div>
                            <div className="font-bold text-yellow-400 truncate">{striker?.playerName}</div>
                            <div className="text-slate-300 font-mono">{striker?.runs} <span className="text-[9px] text-slate-500">({striker?.balls})</span></div>
                        </div>
                        <div className={`flex-1 p-2 border-r border-slate-700 ${nonStriker?.playerId === currentBatters.strikerId ? 'bg-yellow-900/20' : ''}`}>
                            <div className="text-[9px] text-slate-500 uppercase font-bold flex justify-between">
                                <span>Non-Striker</span>
                                {nonStriker?.playerId === currentBatters.strikerId && <span className="text-yellow-500">★</span>}
                            </div>
                            <div className="font-bold text-white truncate">{nonStriker?.playerName}</div>
                            <div className="text-slate-400 font-mono">{nonStriker?.runs} <span className="text-[9px] text-slate-600">({nonStriker?.balls})</span></div>
                        </div>
                    </div>

                    {/* Last Ball */}
                    <div className="flex-1 p-2 text-right">
                        <div className="text-[9px] text-slate-500 uppercase font-bold">Last Ball</div>
                        <div className="text-slate-400 font-mono text-[10px] mb-0.5">{lastBallSpeed}</div>
                        <div className={`font-black text-lg leading-none ${isWicket ? 'text-red-500' : isBoundary ? 'text-purple-400' : 'text-white'}`}>
                            {lastBall || '-'}
                        </div>
                    </div>
                </div>
            </div>

            {/* CONTROL PANEL */}
            <div className="bg-slate-900 p-3 pb-6 flex-shrink-0">
                 <div className="flex gap-2 mb-3">
                    {isUserBatting && (
                        <StrategyToggle label="Batting Tactics" value={strategies.batting} onChange={setBattingStrategy} />
                    )}
                    {isUserBowling && (
                        <StrategyToggle label="Bowling Tactics" value={strategies.bowling} onChange={setBowlingStrategy} />
                    )}
                 </div>

                <div className="flex items-center gap-2 mb-4 overflow-x-auto py-1 scrollbar-hide">
                     <span className="text-[10px] font-bold text-slate-500 uppercase flex-shrink-0">Over:</span>
                     {recentBalls.slice(0, 8).map((b, i) => (
                         <div key={i} className={`
                            h-6 w-6 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0
                            ${b === 'W' ? 'bg-red-600 text-white' : b === '6' ? 'bg-purple-600 text-white' : b === '4' ? 'bg-green-600 text-white' : 'bg-slate-700 text-slate-300'}
                         `}>
                             {b}
                         </div>
                     ))}
                </div>

                <div className="flex gap-2">
                    {state.status === 'completed' ? (
                        <button onClick={handleExit} className="flex-1 bg-red-600 hover:bg-red-700 text-white font-bold py-3 rounded-lg shadow-lg transition-transform active:scale-95 uppercase tracking-wider">
                            End Match
                        </button>
                    ) : (
                        <>
                            <button onClick={playBall} className={`flex-1 ${isUserBatting ? 'bg-blue-600 hover:bg-blue-500' : 'bg-emerald-600 hover:bg-emerald-500'} text-white font-bold py-3 rounded-lg shadow-lg transition-transform active:scale-95 flex items-center justify-center gap-2`}>
                                <Icons.Play className="h-5 w-5" />
                                <span className="hidden sm:inline">{isUserBatting ? 'PLAY' : 'BOWL'}</span>
                            </button>
                            <button onClick={playOver} className="flex-1 bg-slate-600 hover:bg-slate-500 text-white font-bold py-3 rounded-lg shadow-lg transition-transform active:scale-95 flex items-center justify-center gap-2">
                                <span className="text-lg">⏭</span>
                                <span className="hidden sm:inline">OVER</span>
                            </button>
                            <button onClick={simulateInning} className="flex-1 bg-purple-600 hover:bg-purple-500 text-white font-bold py-3 rounded-lg shadow-lg transition-transform active:scale-95 flex items-center justify-center gap-2">
                                <span className="hidden sm:inline">INNING</span>
                                <span className="sm:hidden">INN</span>
                            </button>
                            <button onClick={simulateMatch} className="flex-1 bg-orange-600 hover:bg-orange-500 text-white font-bold py-3 rounded-lg shadow-lg transition-transform active:scale-95 flex items-center justify-center gap-2">
                                <Icons.RefreshCw className="h-5 w-5" />
                                <span className="hidden sm:inline">END</span>
                            </button>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

export default LiveMatchScreen;
