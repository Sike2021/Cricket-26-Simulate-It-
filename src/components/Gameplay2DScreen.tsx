
import React, { useEffect, useRef, useState, useCallback } from 'react';
import { Match, GameData, MatchResult, Team, Player, Inning, BattingPerformance, BowlingPerformance } from '../types';
import { getPlayerById, formatOvers } from '../utils';

interface Gameplay2DScreenProps {
    match: Match;
    gameData: GameData;
    onMatchComplete: (result: MatchResult) => void;
    onExit: () => void;
}

// --- Constants ---
const FIELD_WIDTH = 600;
const FIELD_HEIGHT = 650;
const CENTER_X = FIELD_WIDTH / 2;
const CENTER_Y = FIELD_HEIGHT / 2;
const PITCH_START_Y = 220;
const PITCH_END_Y = 460;
const BOUNDARY_RADIUS = 290;
const BALL_RADIUS = 3;
const FIELDER_RADIUS = 8;

type BallState = 'dead' | 'runup' | 'bowling' | 'hit' | 'fielding' | 'boundary' | 'wicket';
type Aggression = 'Defensive' | 'Balanced' | 'Attacking';

interface Fielder {
    id: string;
    x: number;
    y: number;
    role: 'keeper' | 'bowler' | 'fielder';
    speed: number;
    name: string;
}

export const Gameplay2DScreen: React.FC<Gameplay2DScreenProps> = ({ match, gameData, onMatchComplete, onExit }) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [allPlayers, setAllPlayers] = useState<Player[]>([]);
    
    // --- Match State ---
    const [innings, setInnings] = useState<Inning[]>([]);
    const [currentInningIndex, setCurrentInningIndex] = useState(0);
    const [battingTeam, setBattingTeam] = useState<Team | null>(null);
    const [bowlingTeam, setBowlingTeam] = useState<Team | null>(null);
    const [target, setTarget] = useState<number | null>(null);
    
    // --- Gameplay State ---
    const [strikerId, setStrikerId] = useState<string>('');
    const [nonStrikerId, setNonStrikerId] = useState<string>('');
    const [bowlerId, setBowlerId] = useState<string>('');
    const [aggression, setAggression] = useState<Aggression>('Balanced');
    const [commentary, setCommentary] = useState<string[]>(["Match starting..."]);
    const [modalType, setModalType] = useState<'batter' | 'bowler' | 'openers' | null>(null);
    const [gameOver, setGameOver] = useState(false);
    
    // --- Selection State ---
    const [selectedModalId, setSelectedModalId] = useState('');
    const [selectedModalId2, setSelectedModalId2] = useState('');

    // --- Physics Ref (Mutable for Animation Loop) ---
    const physics = useRef({
        ball: { x: CENTER_X, y: PITCH_START_Y, z: 0, vx: 0, vy: 0, vz: 0, state: 'dead' as BallState, bounces: 0 },
        bowlerPos: { x: CENTER_X, y: PITCH_START_Y - 30 },
        batterPos: { x: CENTER_X, y: PITCH_END_Y }, // Striker pos
        fielders: [] as Fielder[],
        draggedFielder: null as number | null, // Index of dragged fielder
    });

    // --- Initialization ---
    useEffect(() => {
        const tA = gameData.teams.find(t => t.name === match.teamA);
        const tB = gameData.teams.find(t => t.name === match.teamB);
        if (!tA || !tB) return;

        const getXI = (t: Team) => {
            const xiIds = gameData.playingXIs[t.id]?.[gameData.currentFormat];
            if (xiIds && xiIds.length === 11) return xiIds.map(id => t.squad.find(p => p.id === id)).filter(Boolean) as Player[];
            return t.squad.slice(0, 11); 
        };

        const pA = getXI(tA);
        const pB = getXI(tB);
        const allP = [...pA, ...pB];
        setAllPlayers(allP);

        // Helper to create inning object
        const createInning = (team: Team, opp: Team, pList: Player[]): Inning => ({
            teamId: team.id, teamName: team.name,
            score: 0, wickets: 0, overs: '0.0', extras: 0,
            batting: pList.map(p => ({ 
                playerId: p.id, playerName: p.name, runs: 0, balls: 0, fours: 0, sixes: 0, isOut: false, dismissalText: 'not out', dismissal: { type: 'not out', bowlerId: '' } 
            })),
            bowling: getXI(opp).map(p => ({ 
                playerId: p.id, playerName: p.name, overs: '0.0', maidens: 0, runsConceded: 0, wickets: 0, ballsBowled: 0 
            }))
        });

        setInnings([ createInning(tA, tB, pA), createInning(tB, tA, pB) ]);
        setBattingTeam(tA);
        setBowlingTeam(tB);
        setModalType('openers');

    }, []);

    // --- Helper: Update Score ---
    const updateScore = useCallback((runs: number, wkt: number, balls: number = 1, extraType?: string) => {
        setInnings(prev => {
            const newInnings = [...prev];
            const inn = newInnings[currentInningIndex];
            inn.score += runs + (extraType ? 1 : 0); // Add extras if any
            inn.wickets += wkt;
            if (extraType) inn.extras++;

            // Player Stats
            const batter = inn.batting.find(p => p.playerId === strikerId);
            const bowler = inn.bowling.find(p => p.playerId === bowlerId);

            if (batter) {
                batter.runs += runs;
                batter.balls += balls; 
                if (runs === 4) batter.fours++;
                if (runs === 6) batter.sixes++;
                if (wkt) {
                    batter.isOut = true;
                    batter.dismissalText = "Out";
                }
            }

            if (bowler) {
                bowler.runsConceded += runs + (extraType ? 1 : 0);
                bowler.ballsBowled += balls;
                bowler.wickets += wkt;
                const totalBalls = bowler.ballsBowled;
                bowler.overs = formatOvers(totalBalls);
            }

            // Team Overs
            const innBalls = inn.bowling.reduce((acc, b) => acc + b.ballsBowled, 0);
            inn.overs = formatOvers(innBalls);

            return newInnings;
        });

        // Rotation
        if (runs % 2 !== 0) {
            setStrikerId(prev => { setNonStrikerId(prev); return nonStrikerId; });
        }
    }, [currentInningIndex, strikerId, bowlerId, nonStrikerId]);

    // --- Helper: Check Match Events ---
    useEffect(() => {
        if (innings.length === 0) return;
        const inn = innings[currentInningIndex];
        const totalBalls = inn.bowling.reduce((acc, b) => acc + b.ballsBowled, 0);
        const maxOvers = gameData.currentFormat.includes('T20') ? 20 : 50;

        // Check Target
        if (target && inn.score > target) {
            endMatch(true);
            return;
        }

        // Check All Out
        if (inn.wickets >= 10) {
            if (currentInningIndex === 0) switchInning();
            else endMatch(false); // All out in chase
            return;
        }

        // Check Overs
        if (Math.floor(totalBalls / 6) >= maxOvers) {
            if (currentInningIndex === 0) switchInning();
            else endMatch(false); // Overs done in chase
            return;
        }

        // End of Over Logic
        if (totalBalls > 0 && totalBalls % 6 === 0 && physics.current.ball.state === 'dead' && !modalType && !gameOver) {
            // Swap strike
            setStrikerId(prev => { setNonStrikerId(prev); return nonStrikerId; });
            
            // User bowling -> Select next bowler
            if (bowlingTeam?.id === gameData.userTeamId) {
                setModalType('bowler');
            } else {
                // AI Bowler rotate
                const nextBowler = inn.bowling.find(b => b.playerId !== bowlerId && b.ballsBowled < (maxOvers/5)*6);
                if (nextBowler) {
                    setBowlerId(nextBowler.playerId);
                    setCommentary(p => [`${nextBowler.playerName} to bowl.`, ...p]);
                }
            }
        }

    }, [innings, currentInningIndex, target, physics.current.ball.state]); // Watch innings changes

    const switchInning = () => {
        setTarget(innings[0].score);
        setCurrentInningIndex(1);
        setBattingTeam(bowlingTeam);
        setBowlingTeam(battingTeam);
        setModalType('openers');
        setCommentary(p => ["Innings Break.", ...p]);
    };

    const initFielders = (fieldingTeamId: string) => {
        // Basic ring field
        const fielders: Fielder[] = [];
        // Keeper
        fielders.push({ id: 'wk', x: CENTER_X, y: PITCH_END_Y + 40, role: 'keeper', speed: 0.8, name: 'WK' });
        // Bowler
        fielders.push({ id: 'bwl', x: CENTER_X, y: PITCH_START_Y - 20, role: 'bowler', speed: 1.0, name: 'BWL' });
        
        // 7 others
        for(let i=0; i<7; i++) {
            const angle = (i * (360/7)) * (Math.PI/180);
            fielders.push({
                id: `f${i}`,
                x: CENTER_X + Math.cos(angle) * 180,
                y: CENTER_Y + Math.sin(angle) * 180,
                role: 'fielder',
                speed: 0.9 + Math.random()*0.2,
                name: `F${i+1}`
            });
        }
        physics.current.fielders = fielders;
    };

    const endMatch = (chaseWon: boolean) => {
        setGameOver(true);
        const inn1 = innings[0];
        const inn2 = innings[1];
        let winnerId: string | null = null;
        let summary = "";

        if (currentInningIndex === 1 && (chaseWon || inn2.score > inn1.score)) {
            winnerId = inn2.teamId;
            summary = `${inn2.teamName} won by ${10 - inn2.wickets} wickets`;
        } else {
            winnerId = inn1.teamId;
            summary = `${inn1.teamName} won by ${inn1.score - inn2.score} runs`;
        }

        onMatchComplete({
            matchNumber: match.matchNumber,
            summary,
            winnerId,
            loserId: winnerId === inn1.teamId ? inn2.teamId : inn1.teamId,
            firstInning: inn1,
            secondInning: inn2,
            manOfTheMatch: { playerId: '', playerName: 'TBD', teamId: '', summary: '' }
        });
    };

    // --- Physics Loop ---
    const processBall = () => {
        const p = physics.current;
        if (p.ball.state === 'dead') return;

        // 1. Runup
        if (p.ball.state === 'runup') {
            p.bowlerPos.y += 3;
            if (p.bowlerPos.y >= PITCH_START_Y) {
                p.ball.state = 'bowling';
                p.ball.x = p.bowlerPos.x;
                p.ball.y = p.bowlerPos.y;
                p.ball.vx = (Math.random() - 0.5) * 2; // Slight swing
                p.ball.vy = 8; // Pace
            }
        }
        // 2. Bowling
        else if (p.ball.state === 'bowling') {
            p.ball.x += p.ball.vx;
            p.ball.y += p.ball.vy;
            
            if (p.ball.y >= PITCH_END_Y - 5) {
                determineShotOutcome();
            }
        }
        // 3. Hit
        else if (p.ball.state === 'hit') {
            p.ball.x += p.ball.vx;
            p.ball.y += p.ball.vy;
            
            // Friction 0.98 per prompt
            if (p.ball.z <= 0) {
                p.ball.vx *= 0.98;
                p.ball.vy *= 0.98;
            } else {
                p.ball.vx *= 0.99; 
                p.ball.vy *= 0.99;
            }

            // Gravity
            if (p.ball.z > 0 || p.ball.vz > 0) {
                p.ball.z += p.ball.vz;
                p.ball.vz -= 0.3; // Gravity
                if (p.ball.z < 0) {
                    p.ball.z = 0;
                    p.ball.vz = -p.ball.vz * 0.5; // Bounce damping
                    p.ball.bounces++;
                }
            }

            // Boundary Check
            const distFromCenter = Math.sqrt(Math.pow(p.ball.x - CENTER_X, 2) + Math.pow(p.ball.y - CENTER_Y, 2));
            if (distFromCenter >= BOUNDARY_RADIUS) {
                p.ball.state = 'boundary';
                const isSix = p.ball.bounces === 0;
                setCommentary(prev => [isSix ? "SIX! Huge hit!" : "FOUR! Races away!", ...prev]);
                updateScore(isSix ? 6 : 4, 0);
                resetBall();
                return;
            }

            // Fielding AI
            let intercepted = false;
            // Sort fielders by distance
            const sortedFielders = p.fielders.map(f => ({
                ...f,
                dist: Math.sqrt(Math.pow(f.x - p.ball.x, 2) + Math.pow(f.y - p.ball.y, 2))
            })).sort((a, b) => a.dist - b.dist);

            // Move closest 2
            sortedFielders.slice(0, 2).forEach(f => {
                const originalFielder = p.fielders.find(of => of.id === f.id);
                if (!originalFielder) return;

                const dx = p.ball.x - originalFielder.x;
                const dy = p.ball.y - originalFielder.y;
                const angle = Math.atan2(dy, dx);
                
                // Move fielder
                originalFielder.x += Math.cos(angle) * (originalFielder.speed * 3);
                originalFielder.y += Math.sin(angle) * (originalFielder.speed * 3);

                // Interception
                if (f.dist < FIELDER_RADIUS + BALL_RADIUS + 5) {
                    // Catch
                    if (p.ball.z > 5 && p.ball.bounces === 0) {
                        p.ball.state = 'wicket';
                        intercepted = true;
                        setCommentary(prev => ["OUT! Caught!", ...prev]);
                        // Check who's batting to show modal
                        if (battingTeam?.id === gameData.userTeamId) {
                            setTimeout(() => setModalType('batter'), 1500);
                        } else {
                            setTimeout(() => autoSelectBatter(), 1500);
                        }
                        updateScore(0, 1);
                        resetBall();
                    } 
                    // Stop
                    else if (p.ball.z < 10) {
                        p.ball.vx = 0;
                        p.ball.vy = 0;
                        p.ball.state = 'fielding';
                        intercepted = true;
                        // Calculate runs based on distance from stumps
                        const distFromPitch = Math.abs(p.ball.y - PITCH_END_Y);
                        const runs = distFromPitch > 200 ? 3 : distFromPitch > 100 ? 2 : distFromPitch > 30 ? 1 : 0;
                        setCommentary(prev => [runs > 0 ? `${runs} runs taken.` : "Dot ball.", ...prev]);
                        updateScore(runs, 0);
                        resetBall();
                    }
                }
            });
            
            // Ball stops naturally
            if (!intercepted && Math.abs(p.ball.vx) < 0.1 && Math.abs(p.ball.vy) < 0.1) {
                p.ball.state = 'fielding';
                const distFromPitch = Math.abs(p.ball.y - PITCH_END_Y);
                const runs = distFromPitch > 120 ? 2 : distFromPitch > 40 ? 1 : 0;
                setCommentary(prev => [runs > 0 ? `${runs} runs.` : "No run.", ...prev]);
                updateScore(runs, 0);
                resetBall();
            }
        }
    };

    const determineShotOutcome = () => {
        const p = physics.current;
        const batter = getPlayerById(strikerId, allPlayers);
        const bowler = getPlayerById(bowlerId, allPlayers);
        const pitch = gameData.grounds.find(g => g.code === (gameData.allTeamsData.find(t => t.name === match.teamA)?.homeGround || 'KCG'))?.pitch || "";

        let batSkill = batter.battingSkill;
        let bowlSkill = bowler.secondarySkill;

        // Modifiers
        if (aggression === 'Attacking') batSkill *= 1.2;
        if (aggression === 'Defensive') batSkill *= 0.8;
        
        if (pitch.includes('Green') && bowler.role === 'BL') bowlSkill += 15;
        if (pitch.includes('Dusty') && bowler.role === 'SB') bowlSkill += 15;
        if (pitch.includes('Batting')) batSkill += 10;

        const diff = batSkill - bowlSkill + (Math.random() * 40 - 20);
        
        p.ball.state = 'hit';
        p.ball.bounces = 0;

        if (diff < -30 && Math.random() < 0.3) {
            // Bowled / LBW
            p.ball.vx = (Math.random() - 0.5) * 2;
            p.ball.vy = 2;
            p.ball.state = 'wicket'; // Immediate stop
            setCommentary(prev => ["BOWLED HIM!", ...prev]);
            updateScore(0, 1);
            if (battingTeam?.id === gameData.userTeamId) setTimeout(() => setModalType('batter'), 1500);
            else setTimeout(() => autoSelectBatter(), 1500);
            resetBall();
            return;
        }

        // Shot Vector
        let power = 2 + Math.random() * 5;
        let lift = 0;
        
        if (aggression === 'Attacking') { power += 5; lift += Math.random() * 10; }
        if (diff > 20) power += 3;

        // Angle: 0 to PI (downwards mostly)
        const angle = Math.random() * Math.PI * 2;
        
        p.ball.vx = Math.cos(angle) * power;
        p.ball.vy = Math.sin(angle) * power;
        p.ball.vz = lift;
    };

    const resetBall = () => {
        setTimeout(() => {
            if (!gameOver) {
                physics.current.ball = { x: CENTER_X, y: PITCH_START_Y, z: 0, vx: 0, vy: 0, vz: 0, state: 'dead', bounces: 0 };
                physics.current.bowlerPos = { x: CENTER_X, y: PITCH_START_Y - 30 };
                // Trigger runup
                setTimeout(() => {
                    if (physics.current.ball.state === 'dead') physics.current.ball.state = 'runup';
                }, 500);
            }
        }, 2000);
    };

    // --- Drag and Drop Fielders ---
    const handleMouseDown = (e: React.MouseEvent) => {
        if (bowlingTeam?.id !== gameData.userTeamId) return; // Only user can move fielders
        
        const rect = canvasRef.current?.getBoundingClientRect();
        if (!rect) return;
        const x = (e.clientX - rect.left) * (FIELD_WIDTH / rect.width);
        const y = (e.clientY - rect.top) * (FIELD_HEIGHT / rect.height);

        const clickedFielderIndex = physics.current.fielders.findIndex(f => Math.sqrt(Math.pow(f.x - x, 2) + Math.pow(f.y - y, 2)) < FIELDER_RADIUS * 2);
        
        if (clickedFielderIndex !== -1) {
            physics.current.draggedFielder = clickedFielderIndex;
        }
    };

    const handleMouseMove = (e: React.MouseEvent) => {
        if (physics.current.draggedFielder === null) return;
        
        const rect = canvasRef.current?.getBoundingClientRect();
        if (!rect) return;
        const x = (e.clientX - rect.left) * (FIELD_WIDTH / rect.width);
        const y = (e.clientY - rect.top) * (FIELD_HEIGHT / rect.height);

        // Update pos
        const f = physics.current.fielders[physics.current.draggedFielder];
        f.x = x;
        f.y = y;
    };

    const handleMouseUp = () => {
        physics.current.draggedFielder = null;
    };

    // --- Render Loop ---
    useEffect(() => {
        let frameId: number;
        const ctx = canvasRef.current?.getContext('2d');

        const loop = () => {
            processBall();
            if (ctx) draw(ctx);
            frameId = requestAnimationFrame(loop);
        };
        loop();
        return () => cancelAnimationFrame(frameId);
    }, []);

    const draw = (ctx: CanvasRenderingContext2D) => {
        // Grass
        ctx.fillStyle = "#387333";
        ctx.fillRect(0, 0, FIELD_WIDTH, FIELD_HEIGHT);
        
        // 30 Yard Circle
        ctx.strokeStyle = "rgba(255,255,255,0.3)";
        ctx.beginPath(); ctx.arc(CENTER_X, CENTER_Y, 150, 0, Math.PI*2); ctx.stroke();

        // Boundary
        ctx.strokeStyle = "white";
        ctx.lineWidth = 3;
        ctx.beginPath(); ctx.arc(CENTER_X, CENTER_Y, BOUNDARY_RADIUS, 0, Math.PI*2); ctx.stroke();

        // Pitch
        ctx.fillStyle = "#d9cba0";
        ctx.fillRect(CENTER_X - 15, PITCH_START_Y, 30, PITCH_END_Y - PITCH_START_Y);

        // Creases
        ctx.strokeStyle = "white"; ctx.lineWidth = 1;
        ctx.beginPath(); ctx.moveTo(CENTER_X - 20, PITCH_START_Y); ctx.lineTo(CENTER_X + 20, PITCH_START_Y); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(CENTER_X - 20, PITCH_END_Y); ctx.lineTo(CENTER_X + 20, PITCH_END_Y); ctx.stroke();

        // Fielders
        physics.current.fielders.forEach((f, i) => {
            ctx.fillStyle = i === physics.current.draggedFielder ? "lime" : bowlingTeam?.id === gameData.userTeamId ? "yellow" : "orange";
            ctx.beginPath(); ctx.arc(f.x, f.y, FIELDER_RADIUS, 0, Math.PI*2); ctx.fill();
            // Name
            ctx.fillStyle = "black"; ctx.font = "8px Arial"; ctx.fillText(f.name, f.x - 5, f.y - 8);
        });

        // Ball Shadow
        const b = physics.current.ball;
        if (b.state !== 'dead') {
            ctx.fillStyle = "rgba(0,0,0,0.4)";
            ctx.beginPath(); ctx.arc(b.x, b.y, BALL_RADIUS + (b.z/3), 0, Math.PI*2); ctx.fill();
            
            // Ball
            ctx.fillStyle = "white";
            ctx.beginPath(); ctx.arc(b.x, b.y - b.z, BALL_RADIUS, 0, Math.PI*2); ctx.fill();
        }

        // Bowler / Batter Sprites (Circles)
        ctx.fillStyle = "red";
        ctx.beginPath(); ctx.arc(physics.current.bowlerPos.x, physics.current.bowlerPos.y, FIELDER_RADIUS, 0, Math.PI*2); ctx.fill();
        ctx.fillStyle = "blue";
        ctx.beginPath(); ctx.arc(CENTER_X, PITCH_END_Y + 5, FIELDER_RADIUS, 0, Math.PI*2); ctx.fill(); // Striker
    };

    // --- Helper: Modal Actions ---
    const confirmOpeners = () => {
        if (selectedModalId && selectedModalId2) {
            setStrikerId(selectedModalId);
            setNonStrikerId(selectedModalId2);
            setModalType(null);
            initFielders(bowlingTeam!.id); // Init fielders for bowling team
            resetBall();
        }
    };

    const autoSelectBatter = () => {
        const inn = innings[currentInningIndex];
        const next = inn.batting.find(b => !b.isOut && b.playerId !== strikerId && b.playerId !== nonStrikerId);
        if (next) setStrikerId(next.playerId);
    };

    const fastSimulateInnings = () => {
        let safety = 0;
        const inn = innings[currentInningIndex];
        const maxOvers = gameData.currentFormat.includes('T20') ? 20 : 50;
        
        while (inn.wickets < 10 && safety++ < 350) {
            const totalBalls = inn.bowling.reduce((a,b)=>a+b.ballsBowled,0);
            if (Math.floor(totalBalls/6) >= maxOvers) break;
            if (target && inn.score > target) break;

            const outcome = Math.random();
            let runs = 0; let wkt = 0;
            if (outcome < 0.05) wkt = 1;
            else if (outcome < 0.4) runs = 0;
            else if (outcome < 0.7) runs = 1;
            else if (outcome < 0.85) runs = 4;
            else if (outcome < 0.9) runs = 6;
            else runs = 2;

            updateScore(runs, wkt, 1);
        }
    };

    return (
        <div className="flex flex-col h-full bg-gray-900 text-white">
            {/* Scoreboard */}
            <div className="p-3 bg-gray-800 border-b border-gray-700 flex justify-between items-center shadow-lg z-10">
                <div className="flex gap-2 items-center">
                    <div className="w-8 h-8 bg-white rounded p-1" dangerouslySetInnerHTML={{__html: gameData.allTeamsData.find(t => t.id === battingTeam?.id)?.logo || ''}}></div>
                    <div>
                        <div className="text-[10px] text-gray-400 uppercase tracking-widest mb-1">{innings[currentInningIndex]?.teamName}</div>
                        <div className="text-2xl font-bold text-white leading-none">
                            {innings[currentInningIndex]?.score}/{innings[currentInningIndex]?.wickets} <span className="text-sm text-teal-400 font-mono ml-1">({innings[currentInningIndex]?.overs})</span>
                        </div>
                    </div>
                </div>
                <div className="text-right">
                    <div className="text-[10px] text-gray-400 uppercase tracking-widest mb-1">Target: {target ? target + 1 : '-'}</div>
                    <div className="text-sm text-yellow-400 font-semibold">{getPlayerById(strikerId, allPlayers).name}*</div>
                    <div className="text-xs text-gray-500">{getPlayerById(bowlerId, allPlayers).name} ⚾</div>
                </div>
            </div>

            {/* Field View */}
            <div className="flex-1 relative overflow-hidden bg-[#2e5a27] flex justify-center">
                <canvas 
                    ref={canvasRef} 
                    width={FIELD_WIDTH} 
                    height={FIELD_HEIGHT} 
                    className="h-full w-auto object-contain cursor-pointer touch-none"
                    onMouseDown={handleMouseDown}
                    onMouseMove={handleMouseMove}
                    onMouseUp={handleMouseUp}
                    onTouchStart={(e) => handleMouseDown(e.touches[0] as any)}
                    onTouchMove={(e) => handleMouseMove(e.touches[0] as any)}
                    onTouchEnd={handleMouseUp}
                />
                
                {/* Commentary Toast */}
                <div className="absolute bottom-4 left-4 right-4 bg-black/70 p-2 rounded-lg backdrop-blur-sm pointer-events-none transition-all">
                    <p className="text-sm text-white font-medium text-center">{commentary[0]}</p>
                </div>
            </div>

            {/* Controls */}
            <div className="p-3 bg-gray-800 border-t border-gray-700">
                {battingTeam?.id === gameData.userTeamId ? (
                    <div className="flex gap-2 mb-3">
                        <span className="text-xs text-gray-400 self-center mr-2">Aggression:</span>
                        {(['Defensive', 'Balanced', 'Attacking'] as Aggression[]).map(agg => (
                            <button key={agg} onClick={() => setAggression(agg)} className={`flex-1 py-2 text-xs font-bold rounded transition-colors ${aggression === agg ? 'bg-teal-500 text-white' : 'bg-gray-700 text-gray-300'}`}>{agg}</button>
                        ))}
                    </div>
                ) : (
                    <div className="text-center text-xs text-gray-400 mb-2">You are Bowling. Drag fielders to adjust positions.</div>
                )}
                
                <div className="flex gap-3">
                    <button onClick={fastSimulateInnings} className="flex-1 bg-purple-600 hover:bg-purple-500 py-3 rounded font-bold text-sm shadow-lg">Sim Innings</button>
                    {physics.current.ball.state === 'dead' && !gameOver && !modalType && (
                        <button onClick={resetBall} className="flex-[2] bg-green-600 hover:bg-green-500 py-3 rounded font-bold text-sm shadow-lg animate-pulse">
                            {battingTeam?.id === gameData.userTeamId ? "READY" : "BOWL"}
                        </button>
                    )}
                    <button onClick={onExit} className="flex-1 bg-red-600 hover:bg-red-500 py-3 rounded font-bold text-sm shadow-lg">Exit</button>
                </div>
            </div>

            {/* Modals */}
            {modalType === 'openers' && innings[currentInningIndex] && (
                <div className="absolute inset-0 bg-black/90 z-50 flex flex-col items-center justify-center p-6">
                    <h3 className="text-xl font-bold mb-4">Select Openers</h3>
                    <select className="w-full p-3 mb-3 bg-gray-800 rounded border border-gray-600" value={selectedModalId} onChange={e => setSelectedModalId(e.target.value)}>
                        <option value="">Striker</option>
                        {innings[currentInningIndex].batting.filter(p => !p.isOut).map(p => <option key={p.playerId} value={p.playerId}>{p.playerName}</option>)}
                    </select>
                    <select className="w-full p-3 mb-6 bg-gray-800 rounded border border-gray-600" value={selectedModalId2} onChange={e => setSelectedModalId2(e.target.value)}>
                        <option value="">Non-Striker</option>
                        {innings[currentInningIndex].batting.filter(p => !p.isOut && p.playerId !== selectedModalId).map(p => <option key={p.playerId} value={p.playerId}>{p.playerName}</option>)}
                    </select>
                    <button disabled={!selectedModalId || !selectedModalId2} onClick={confirmOpeners} className="w-full bg-teal-500 py-3 rounded font-bold disabled:opacity-50">Start Innings</button>
                </div>
            )}

            {modalType === 'batter' && innings[currentInningIndex] && (
                <div className="absolute inset-0 bg-black/90 z-50 flex flex-col items-center justify-center p-6">
                    <h3 className="text-xl font-bold mb-4">Next Batter</h3>
                    <select className="w-full p-3 mb-6 bg-gray-800 rounded border border-gray-600" value={selectedModalId} onChange={e => setSelectedModalId(e.target.value)}>
                        <option value="">Select Player</option>
                        {innings[currentInningIndex].batting.filter(p => !p.isOut && p.playerId !== strikerId && p.playerId !== nonStrikerId).map(p => <option key={p.playerId} value={p.playerId}>{p.playerName}</option>)}
                    </select>
                    <button disabled={!selectedModalId} onClick={() => { setStrikerId(selectedModalId); setModalType(null); resetBall(); }} className="w-full bg-teal-500 py-3 rounded font-bold disabled:opacity-50">Confirm</button>
                </div>
            )}
            
            {modalType === 'bowler' && innings[currentInningIndex] && (
                <div className="absolute inset-0 bg-black/90 z-50 flex flex-col items-center justify-center p-6">
                    <h3 className="text-xl font-bold mb-4">Next Bowler</h3>
                    <select className="w-full p-3 mb-6 bg-gray-800 rounded border border-gray-600" value={selectedModalId} onChange={e => setSelectedModalId(e.target.value)}>
                        <option value="">Select Bowler</option>
                        {innings[currentInningIndex].bowling.filter(p => p.playerId !== bowlerId).map(p => <option key={p.playerId} value={p.playerId}>{p.playerName} ({p.overs})</option>)}
                    </select>
                    <button disabled={!selectedModalId} onClick={() => { setBowlerId(selectedModalId); setModalType(null); resetBall(); }} className="w-full bg-teal-500 py-3 rounded font-bold disabled:opacity-50">Confirm</button>
                </div>
            )}
        </div>
    );
};
