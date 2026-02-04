
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { GameData, CareerScreen, MatchResult, Player, Format, PromotionRecord, Team, LiveMatchState, NewsArticle } from '../types';
import { TEAMS, INITIAL_SPONSORSHIPS, INITIAL_NEWS } from '../data';
import { Icons } from './Icons';
import { getPlayerById, generateLeagueSchedule, negotiateSponsorships, generateMatchNews, generatePreMatchNews } from '../utils';
import { useSimulation } from '../hooks/useSimulation';

// Components
import Dashboard from './Dashboard';
import Schedule from './Schedule';
import News from './News';
import Lineups from './Lineups';
import Editor from './Editor';
import Standings from './Standings';
import Stats from './Stats';
import Settings from './Settings';
import PlayerProfile from './PlayerProfile';
import MatchResultScreen from './MatchResultScreen';
import ForwardResultsScreen from './ForwardResultsScreen';
import AwardsAndRecordsScreen from './AwardsRecordsScreen';
import EndOfFormatScreen from './EndOfFormatScreen';
import Transfers from './Transfers';
import ComparisonScreen from './ComparisonScreen';
import LiveMatchScreen from './LiveMatchScreen';
import Assistant from './Assistant';
import SponsorRoom from './SponsorRoom';
import AuctionRoom from './AuctionRoom';
import PlayerDatabase from './PlayerDatabase';

interface CareerHubProps {
    gameData: GameData;
    setGameData: React.Dispatch<React.SetStateAction<GameData | null>>;
    onResetGame: () => void;
    theme: 'light' | 'dark';
    setTheme: (theme: 'light' | 'dark') => void;
    saveGame: () => void;
    loadGame: () => void;
    showFeedback: (message: string, type?: 'success' | 'error') => void;
}

const BottomNavBar = ({ activeScreen, setScreen }: { activeScreen: CareerScreen, setScreen: (screen: CareerScreen) => void }) => {
    const navItems = [
        { name: 'HOME', screen: 'DASHBOARD' as CareerScreen, icon: Icons.Home },
        { name: 'STANDINGS', screen: 'LEAGUES' as CareerScreen, icon: Icons.Podium },
        { name: 'ASSISTANT', screen: 'ASSISTANT' as CareerScreen, icon: Icons.Bot },
        { name: 'STATS', screen: 'STATS' as CareerScreen, icon: Icons.ChartPie },
        { name: 'SETTINGS', screen: 'SETTINGS' as CareerScreen, icon: Icons.Settings },
    ];
    return (
        <nav className="bg-gray-100/80 dark:bg-[#101F1F] border-t border-gray-300/50 dark:border-gray-700/50 flex justify-around items-center h-[90px] pb-4 backdrop-blur-sm">
            {navItems.map(item => (
                <button
                    key={item.name}
                    onClick={() => setScreen(item.screen)}
                    className={`flex flex-col items-center justify-center space-y-1 w-1/5 pt-2 transition-colors duration-200 ${activeScreen === item.screen ? 'text-teal-500' : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'}`}
                >
                    <item.icon />
                    <span className="text-[10px] font-bold tracking-wider">{item.name}</span>
                </button>
            ))}
        </nav>
    );
};

const CareerHub: React.FC<CareerHubProps> = ({ gameData, setGameData, onResetGame, theme, setTheme, saveGame, loadGame, showFeedback }) => {
    const [screen, setScreen] = useState<CareerScreen>('DASHBOARD');
    const [selectedPlayer, setSelectedPlayer] = useState<Player | null>(null);
    const [playerProfileFormat, setPlayerProfileFormat] = useState<Format>(gameData.currentFormat);
    const [selectedMatchResult, setSelectedMatchResult] = useState<MatchResult | null>(null);
    const [forwardSimResults, setForwardSimResults] = useState<MatchResult[]>([]);

    const { runSimulationForCurrentFormat, updateStatsFromMatch } = useSimulation(gameData, setGameData);

    useEffect(() => {
        if (gameData && (!gameData.sponsorships || !gameData.popularity || !gameData.news)) {
             setGameData(prev => {
                 if (!prev) return null;
                 return {
                     ...prev,
                     popularity: prev.popularity ?? 50,
                     sponsorships: prev.sponsorships ?? INITIAL_SPONSORSHIPS,
                     news: prev.news ?? INITIAL_NEWS
                 };
             });
        }
    }, [gameData, setGameData]);

    const userTeam = useMemo(() => {
        return gameData.teams.find(t => t.id === gameData.userTeamId) || gameData.teams[0];
    }, [gameData]);

    useEffect(() => {
        const schedule = gameData.schedule[gameData.currentFormat];
        const currentMatchIndex = gameData.currentMatchIndex[gameData.currentFormat];

        if (currentMatchIndex >= schedule.length) {
            const awardExists = gameData.awardsHistory.some(a => a.season === gameData.currentSeason && a.format === gameData.currentFormat);
            
            if (!awardExists) {
                const formatStats = new Map();
                gameData.teams.forEach(team => team.squad.forEach(player => {
                    const p = getPlayerById(player.id, gameData.allPlayers);
                    if (p) {
                       formatStats.set(p.id, { runs: p.stats[gameData.currentFormat].runs, wickets: p.stats[gameData.currentFormat].wickets, teamName: team.name, playerName: p.name })
                    }
                }));

                const sortedBatters = [...formatStats.entries()].sort((a, b) => b[1].runs - a[1].runs);
                const sortedBowlers = [...formatStats.entries()].sort((a, b) => b[1].wickets - a[1].wickets);

                const finalMatchNumber = schedule[schedule.length-1].matchNumber;
                const lastMatchResult = gameData.matchResults[gameData.currentFormat].find(r => r.matchNumber === finalMatchNumber);
                const winnerTeam = gameData.teams.find(t => t.id === lastMatchResult?.winnerId);

                const newAward = { 
                    season: gameData.currentSeason, 
                    format: gameData.currentFormat, 
                    winnerTeamId: winnerTeam?.id || '', 
                    winnerTeamName: winnerTeam?.name || 'N/A', 
                    bestBatter: { playerId: sortedBatters[0]?.[0] || '', playerName: sortedBatters[0]?.[1].playerName || 'N/A', teamName: sortedBatters[0]?.[1].teamName || 'N/A', runs: sortedBatters[0]?.[1].runs || 0 }, 
                    bestBowler: { playerId: sortedBowlers[0]?.[0] || '', playerName: sortedBowlers[0]?.[1].playerName || 'N/A', teamName: sortedBowlers[0]?.[1].teamName || 'N/A', wickets: sortedBowlers[0]?.[1].wickets || 0 } 
                };

                setGameData(prev => prev ? { ...prev, awardsHistory: [...prev.awardsHistory, newAward] } : null);
                setScreen('END_OF_FORMAT');
            }
        }
    }, [gameData.currentMatchIndex, gameData.currentFormat, gameData.currentSeason, gameData.awardsHistory, gameData.teams, gameData.allPlayers, gameData.matchResults, gameData.schedule, setGameData]);

    const handleUpdatePlayer = (updatedPlayer: Player) => {
        setGameData(prevData => {
            if (!prevData) return null;
            const newAllPlayers = prevData.allPlayers.map(p => p.id === updatedPlayer.id ? updatedPlayer : p);
            const newTeams = prevData.teams.map(team => ({
                ...team,
                squad: team.squad.map(squadPlayer => newAllPlayers.find(p => p.id === squadPlayer.id) || squadPlayer)
            }));
            return { ...prevData, allPlayers: newAllPlayers, teams: newTeams };
        });
    };

    const handleCreatePlayer = (newPlayer: Player) => {
        setGameData(prevData => {
            if (!prevData) return null;
            return { ...prevData, allPlayers: [...prevData.allPlayers, newPlayer] };
        });
    };

    const handleUpdateGround = (code: string, newPitch: string) => setGameData(prev => prev ? { ...prev, grounds: prev.grounds.map(g => g.code === code ? { ...g, pitch: newPitch } : g) } : null);
    
    const handleUpdateScoreLimits = (groundCode: string, format: Format, field: any, value: any, inning: number) => {
        setGameData(prev => {
            if (!prev) return null;
            const numValue = parseInt(value, 10);
            const newLimits: any = JSON.parse(JSON.stringify(prev.scoreLimits || {}));
            if (!newLimits[groundCode]) newLimits[groundCode] = {};
            if (!newLimits[groundCode][format]) newLimits[groundCode][format] = {};
            if (!newLimits[groundCode][format][inning]) newLimits[groundCode][format][inning] = {};
            
            if (value === '' || isNaN(numValue) || numValue <= 0) {
                delete newLimits[groundCode][format][inning][field];
            } else {
                newLimits[groundCode][format][inning][field] = numValue;
            }
            
            return { ...prev, scoreLimits: newLimits };
        });
    };

    const handleUpdateCaptain = (teamId: string, format: Format, playerId: string) => {
        setGameData(prevData => {
            if (!prevData) return null;
            return {
                ...prevData,
                teams: prevData.teams.map(t => {
                    if (t.id === teamId) {
                        return { ...t, captains: { ...t.captains, [format]: playerId } };
                    }
                    return t;
                })
            };
        });
        showFeedback("Captain updated!");
    };

    const handleUpdatePlayingXI = (teamId: string, format: Format, newXI: string[]) => {
        setGameData(prevData => {
            if (!prevData) return null;
            const teamXIs = prevData.playingXIs[teamId] || {};
            return {
                ...prevData,
                playingXIs: {
                    ...prevData.playingXIs,
                    [teamId]: {
                        ...teamXIs,
                        [format]: newXI
                    }
                }
            };
        });
    };

    const simulateBackgroundMatches = (currentData: GameData): GameData => {
        let updatedData = JSON.parse(JSON.stringify(currentData)) as GameData;
        Object.values(Format).forEach(f => {
            if (f === updatedData.currentFormat) return; 

            const schedule = updatedData.schedule[f];
            let mIdx = updatedData.currentMatchIndex[f];
            
            for (let i = 0; i < 8; i++) {
                if (mIdx < schedule.length) {
                    let match = JSON.parse(JSON.stringify(schedule[mIdx]));
                    
                    if (match.group !== 'Round-Robin') {
                        const standings = updatedData.standings[f];
                        const getTeamName = (pos: number) => standings[pos - 1]?.teamName;
                        const resolvePlaceholder = (placeholder: string) => {
                            if (['1st', '2nd', '3rd', '4th'].includes(placeholder)) return getTeamName(parseInt(placeholder[0]));
                            if (placeholder.startsWith('SF')) {
                                const sfRes = updatedData.matchResults[f].find(r => r.matchNumber === placeholder.split(' ')[0]);
                                return updatedData.teams.find(t => t.id === sfRes?.winnerId)?.name || 'TBD';
                            }
                            return placeholder;
                        };
                        match.teamA = resolvePlaceholder(match.teamA) || 'TBD';
                        match.teamB = resolvePlaceholder(match.teamB) || 'TBD';
                        if (match.teamA === 'TBD' || match.teamB === 'TBD') break;
                    }

                    const result = runSimulationForCurrentFormat(match, updatedData);
                    updatedData = updateStatsFromMatch(result, f, updatedData);
                    updatedData.currentMatchIndex[f]++;
                    mIdx++;
                }
            }
        });
        return updatedData;
    };

    const handleForwardDay = () => {
        if (!userTeam) return;
        let currentData = { ...gameData };
        let matchIndex = currentData.currentMatchIndex[currentData.currentFormat];
        let schedule = currentData.schedule[currentData.currentFormat];
        const results: MatchResult[] = [];
        const newNewsItems: NewsArticle[] = [];

        currentData = simulateBackgroundMatches(currentData);

        for(let i=0; i<5; i++) {
            if (matchIndex + i < schedule.length) {
                const m = schedule[matchIndex+i];
                if (m.teamA === userTeam.name || m.teamB === userTeam.name) {
                    const preNews = generatePreMatchNews(m, currentData);
                    newNewsItems.push(preNews);
                    break;
                }
            }
        }

        let simulatedCount = 0;
        const maxSimulations = 8;

        while (matchIndex < schedule.length && simulatedCount < maxSimulations) {
            let matchToSim = JSON.parse(JSON.stringify(schedule[matchIndex]));
            
            if (matchToSim.group !== 'Round-Robin') {
                const standings = currentData.standings[currentData.currentFormat];
                const getTeamName = (pos: number) => standings[pos - 1]?.teamName;
                const resolvePlaceholder = (placeholder: string) => {
                    if (['1st', '2nd', '3rd', '4th'].includes(placeholder)) {
                        const pos = parseInt(placeholder[0]);
                        return getTeamName(pos);
                    }
                    if (placeholder.startsWith('SF')) {
                        const sfMatchNumber = placeholder.split(' ')[0];
                        const sfResult = currentData.matchResults[currentData.currentFormat].find(r => r.matchNumber === sfMatchNumber);
                        const winner = currentData.teams.find(t => t.id === sfResult?.winnerId);
                        return winner?.name || null;
                    }
                    return placeholder;
                };
                matchToSim.teamA = resolvePlaceholder(matchToSim.teamA) || 'TBD';
                matchToSim.teamB = resolvePlaceholder(matchToSim.teamB) || 'TBD';
                
                if (matchToSim.teamA === 'TBD' || matchToSim.teamB === 'TBD') break; 
            }

            const isUserTeamMatch = matchToSim.teamA === userTeam.name || matchToSim.teamB === userTeam.name;
            if (isUserTeamMatch) break;

            const result = runSimulationForCurrentFormat(matchToSim, currentData);
            currentData = updateStatsFromMatch(result, currentData.currentFormat, currentData);
            currentData.currentMatchIndex[currentData.currentFormat]++; 
            results.push(result);
            simulatedCount++;
            
            if (matchToSim.group !== 'Round-Robin' || Math.random() < 0.3) {
                const sponsorship = currentData.sponsorships?.[currentData.currentFormat] || INITIAL_SPONSORSHIPS[currentData.currentFormat];
                newNewsItems.push(generateMatchNews(result, currentData.currentFormat, sponsorship));
            }
            
            matchIndex++;
        }

        if (newNewsItems.length > 0) currentData.news = [...newNewsItems, ...currentData.news].slice(0, 50);

        if (results.length > 0) {
            setForwardSimResults(results);
            setGameData(currentData); 
            setScreen('FORWARD_RESULTS');
        } else {
             if (matchIndex < schedule.length) {
                 if (newNewsItems.length > 0) {
                     setGameData(prev => prev ? { ...prev, news: [...newNewsItems, ...prev.news] } : null);
                 }
                 showFeedback("Match 1 or upcoming user match is next.", "success");
             } else {
                 showFeedback("Tournament matches completed.", "success");
             }
        }
    };

    const handlePlayMatch = () => {
        if (!userTeam) return;
        
        const schedule = gameData.schedule[gameData.currentFormat];
        const currentMatchIndex = gameData.currentMatchIndex[gameData.currentFormat];
        if (currentMatchIndex >= schedule.length) return;

        let matchToSim = JSON.parse(JSON.stringify(schedule[currentMatchIndex]));

        if (matchToSim.group !== 'Round-Robin') {
             const standings = gameData.standings[gameData.currentFormat];
             const getTeamName = (pos: number) => standings[pos - 1]?.teamName;
             const resolvePlaceholder = (placeholder: string) => {
                if (['1st', '2nd', '3rd', '4th'].includes(placeholder)) return getTeamName(parseInt(placeholder[0]));
                if (placeholder.startsWith('SF')) {
                    const sfMatchNumber = placeholder.split(' ')[0];
                    const sfResult = gameData.matchResults[gameData.currentFormat].find(r => r.matchNumber === sfMatchNumber);
                    return gameData.teams.find(t => t.id === sfResult?.winnerId)?.name || null;
                }
                return placeholder;
            };
            matchToSim.teamA = resolvePlaceholder(matchToSim.teamA) || 'TBD';
            matchToSim.teamB = resolvePlaceholder(matchToSim.teamB) || 'TBD';
        }

        if (matchToSim.teamA === 'TBD' || matchToSim.teamB === 'TBD') {
            showFeedback("Waiting for league stage to conclude.", "error");
            return;
        }

        const isUserTeamMatch = matchToSim.teamA === userTeam.name || matchToSim.teamB === userTeam.name;

        if (isUserTeamMatch) {
             setScreen('LIVE_MATCH');
        } else {
             const result = runSimulationForCurrentFormat(matchToSim, gameData);
             const updatedData = updateStatsFromMatch(result, gameData.currentFormat, gameData);
             updatedData.currentMatchIndex[gameData.currentFormat]++;
             const sponsorship = updatedData.sponsorships?.[updatedData.currentFormat] || INITIAL_SPONSORSHIPS[updatedData.currentFormat];
             const newsItem = generateMatchNews(result, updatedData.currentFormat, sponsorship);
             updatedData.news = [newsItem, ...updatedData.news].slice(0, 50);
             setGameData(updatedData);
             setSelectedMatchResult(result);
             setScreen('MATCH_RESULT');
        }
    };

    const handleLiveMatchComplete = (result: MatchResult) => {
        const updatedData = updateStatsFromMatch(result, gameData.currentFormat, gameData);
        updatedData.currentMatchIndex[gameData.currentFormat]++;
        updatedData.activeMatch = null; 
        const sponsorship = updatedData.sponsorships?.[updatedData.currentFormat] || INITIAL_SPONSORSHIPS[updatedData.currentFormat];
        const newsItem = generateMatchNews(result, updatedData.currentFormat, sponsorship);
        updatedData.news = [newsItem, ...updatedData.news].slice(0, 50);
        setGameData(updatedData);
        setSelectedMatchResult(result);
        setScreen('MATCH_RESULT');
    };

    const handleLiveMatchExit = (stateToSave?: LiveMatchState) => {
        if (stateToSave) {
            setGameData(prev => prev ? { ...prev, activeMatch: stateToSave } : null);
            showFeedback("Match progress saved.", "success");
        } else setGameData(prev => prev ? { ...prev, activeMatch: null } : null);
        setScreen('DASHBOARD');
    }

    const handleFormatChange = useCallback((newFormat: Format) => {
        setGameData(prev => prev ? ({ ...prev, currentFormat: newFormat }) : null);
        setScreen('DASHBOARD');
    }, [setGameData]);

    const handleEndOfSeason = useCallback((retainedPlayers: Player[]) => {
        setGameData((prevData: GameData | null) => {
            if (!prevData) return null;
            
            const retentionCost = retainedPlayers.length * 1.0; 

            const mainLeagueTeams = prevData.teams.filter(t => !prevData.allTeamsData.find(td => td.id === t.id)?.isDevelopmentTeam);
            const mainTeamStats = mainLeagueTeams.map(team => {
                const totalPoints = (prevData.standings[Format.T20].find(s => s.teamId === team.id)?.points || 0) +
                                   (prevData.standings[Format.ODI].find(s => s.teamId === team.id)?.points || 0) +
                                   (prevData.standings[Format.FIRST_CLASS].find(s => s.teamId === team.id)?.points || 0);
                return { team, totalPoints };
            });
            const relegatedTeams = mainTeamStats.sort((a, b) => a.totalPoints - b.totalPoints).slice(0, 2).map(i => i.team);

            const devTeams = prevData.teams.filter(t => prevData.allTeamsData.find(td => td.id === t.id)?.isDevelopmentTeam);
            const getDevPoints = (id: string) => (prevData.standings[Format.DEVELOPMENT_T20].find(s => s.teamId === id)?.points || 0) + (prevData.standings[Format.DEVELOPMENT_ODI].find(s => s.teamId === id)?.points || 0);
            const promotedTeams = devTeams.sort((a,b) => getDevPoints(b.id) - getDevPoints(a.id)).slice(0, 2);

            const newAllTeamsData = prevData.allTeamsData.map(t => {
                if (relegatedTeams.find(rt => rt.id === t.id)) return { ...t, isDevelopmentTeam: true };
                if (promotedTeams.find(pt => pt.id === t.id)) return { ...t, isDevelopmentTeam: false };
                return t;
            });

            const newTeams = prevData.teams.map(t => {
                if (t.id === prevData.userTeamId) return { ...t, squad: retainedPlayers, purse: 50.0 - retentionCost };
                const aiRetainCount = 2 + Math.floor(Math.random() * 3);
                const aiRetained = t.squad.sort((a,b) => (b.battingSkill + b.secondarySkill) - (a.battingSkill + a.secondarySkill)).slice(0, aiRetainCount);
                const aiCost = aiRetained.length * 1.0;
                return { ...t, squad: aiRetained, purse: 50.0 - aiCost };
            });

            const finalMainTeams = newTeams.filter(t => !newAllTeamsData.find(td => td.id === t.id)?.isDevelopmentTeam);
            const finalDevTeams = newTeams.filter(t => newAllTeamsData.find(td => td.id === t.id)?.isDevelopmentTeam);
            const initialStandings = (teams: Team[]) => teams.map(team => ({ teamId: team.id, teamName: team.name, played: 0, won: 0, lost: 0, drawn: 0, points: 0, netRunRate: 0, runsFor: 0, runsAgainst: 0 }));

            const seasonNews: NewsArticle = { 
                id: `s${prevData.currentSeason}-end`, 
                headline: `Season ${prevData.currentSeason+1} Draft Room Open!`, 
                date: new Date().toLocaleDateString(), 
                excerpt: "Teams reveal retained players.", 
                content: "Windows for retention have closed. Teams are heading to the auction floor with updated budgets.", 
                type: 'league' as const
            };

            return {
                ...prevData,
                allTeamsData: newAllTeamsData,
                currentSeason: prevData.currentSeason + 1,
                currentFormat: Format.T20,
                currentMatchIndex: Object.values(Format).reduce((acc, f) => ({ ...acc, [f]: 0 }), {} as Record<Format, number>),
                matchResults: Object.values(Format).reduce((acc, f) => ({ ...acc, [f]: [] }), {} as Record<Format, MatchResult[]>),
                standings: { [Format.T20]: initialStandings(finalMainTeams), [Format.ODI]: initialStandings(finalMainTeams), [Format.FIRST_CLASS]: initialStandings(finalMainTeams), [Format.DEVELOPMENT_T20]: initialStandings(finalDevTeams), [Format.DEVELOPMENT_ODI]: initialStandings(finalDevTeams), [Format.DEVELOPMENT_FIRST_CLASS]: initialStandings(finalDevTeams), [Format.RISE_T20]: initialStandings(finalDevTeams), [Format.RISE_ODI]: initialStandings(finalDevTeams), [Format.RISE_FIRST_CLASS]: initialStandings(finalDevTeams) },
                schedule: { 
                    [Format.T20]: generateLeagueSchedule(finalMainTeams, Format.T20, true), 
                    [Format.ODI]: generateLeagueSchedule(finalMainTeams, Format.ODI, true), 
                    [Format.FIRST_CLASS]: generateLeagueSchedule(finalMainTeams, Format.FIRST_CLASS, true), 
                    [Format.DEVELOPMENT_T20]: generateLeagueSchedule(finalDevTeams, Format.DEVELOPMENT_T20, true), 
                    [Format.DEVELOPMENT_ODI]: generateLeagueSchedule(finalDevTeams, Format.DEVELOPMENT_ODI, true), 
                    [Format.DEVELOPMENT_FIRST_CLASS]: generateLeagueSchedule(finalDevTeams, Format.DEVELOPMENT_FIRST_CLASS, true), 
                    [Format.RISE_T20]: generateLeagueSchedule(finalDevTeams, Format.RISE_T20, true), 
                    [Format.RISE_ODI]: generateLeagueSchedule(finalDevTeams, Format.RISE_ODI, true), 
                    [Format.RISE_FIRST_CLASS]: generateLeagueSchedule(finalDevTeams, Format.RISE_FIRST_CLASS, true) 
                },
                teams: newTeams,
                news: [seasonNews, ...prevData.news].slice(0, 50)
            };
        });
        setScreen('AUCTION_ROOM');
    }, [setGameData]);

    const renderScreen = () => {
        const commonProps = { gameData, userTeam, setGameData, setScreen, showFeedback };
        switch(screen) {
            case 'DASHBOARD': return <Dashboard {...commonProps} handlePlayMatch={handlePlayMatch} handleForwardDay={handleForwardDay} />;
            case 'LEAGUES': return <Standings gameData={gameData} />; 
            case 'SCHEDULE': return <Schedule gameData={gameData} userTeam={userTeam} viewMatchResult={result => { setSelectedMatchResult(result); setScreen('MATCH_RESULT'); }} />;
            case 'LINEUPS': return <Lineups {...commonProps} handleUpdatePlayingXI={handleUpdatePlayingXI} handleUpdateCaptain={handleUpdateCaptain} />;
            case 'EDITOR': return <Editor {...commonProps} handleUpdatePlayer={handleUpdatePlayer} handleCreatePlayer={handleCreatePlayer} handleUpdateGround={handleUpdateGround} handleUpdateScoreLimits={handleUpdateScoreLimits} />;
            case 'PLAYER_DATABASE': return <PlayerDatabase gameData={gameData} onAddPlayer={() => setScreen('EDITOR')} onViewPlayer={(p) => { setSelectedPlayer(p); setScreen('PLAYER_PROFILE'); }} />;
            case 'NEWS': return <News news={gameData.news} />;
            case 'STATS': return <Stats gameData={gameData} viewPlayerProfile={(p, f) => { setSelectedPlayer(p); setPlayerProfileFormat(f); setScreen('PLAYER_PROFILE'); }} />;
            case 'SETTINGS': return <Settings onResetGame={onResetGame} theme={theme} setTheme={setTheme} saveGame={saveGame} loadGame={loadGame} />;
            case 'PLAYER_PROFILE': return <PlayerProfile player={selectedPlayer} onBack={() => setScreen('STATS')} initialFormat={playerProfileFormat} />;
            case 'MATCH_RESULT': return <MatchResultScreen result={selectedMatchResult} onBack={() => setScreen('DASHBOARD')} userTeamId={gameData.userTeamId} />;
            case 'FORWARD_RESULTS': return <ForwardResultsScreen results={forwardSimResults} onBack={() => setScreen('DASHBOARD')} userTeamId={gameData.userTeamId} />;
            case 'AWARDS_RECORDS': return <AwardsAndRecordsScreen gameData={gameData} />;
            case 'END_OF_FORMAT': return <EndOfFormatScreen gameData={gameData} handleFormatChange={handleFormatChange} handleEndSeason={handleEndOfSeason} />;
            case 'TRANSFERS': return <Transfers {...commonProps} />;
            case 'COMPARISON': return <ComparisonScreen gameData={gameData} />;
            case 'ASSISTANT': return <Assistant gameData={gameData} />;
            case 'SPONSOR_ROOM': return <SponsorRoom gameData={gameData} setGameData={setGameData} />;
            case 'AUCTION_ROOM': return <AuctionRoom gameData={gameData} onAuctionComplete={(teams) => { 
                setGameData(prev => prev ? { ...prev, teams } : null);
                setScreen('DASHBOARD');
            }} />;
            case 'LIVE_MATCH': {
                const schedule = gameData.schedule[gameData.currentFormat];
                const currentMatchIndex = gameData.currentMatchIndex[gameData.currentFormat];
                const match = schedule[currentMatchIndex];
                let resolvedMatch = match ? JSON.parse(JSON.stringify(match)) : null;
                if (resolvedMatch) {
                    const resolvePlaceholder = (placeholder: string) => {
                        if (['1st', '2nd', '3rd', '4th'].includes(placeholder)) {
                            const pos = parseInt(placeholder[0]);
                            return gameData.standings[gameData.currentFormat][pos-1]?.teamName || 'TBD';
                        }
                        if (placeholder.startsWith('SF')) {
                            const sfResult = gameData.matchResults[gameData.currentFormat].find(r => r.matchNumber === placeholder.split(' ')[0]);
                            return gameData.teams.find(t => t.id === sfResult?.winnerId)?.name || 'TBD';
                        }
                        return placeholder;
                    };
                    resolvedMatch.teamA = resolvePlaceholder(resolvedMatch.teamA);
                    resolvedMatch.teamB = resolvePlaceholder(resolvedMatch.teamB);
                }
                return resolvedMatch ? (
                    <LiveMatchScreen match={resolvedMatch} gameData={gameData} onMatchComplete={handleLiveMatchComplete} onExit={handleLiveMatchExit} /> 
                ) : <div className="p-4 text-center"><p>Tournament finished.</p><button onClick={() => setScreen('DASHBOARD')} className="mt-4 bg-teal-500 text-white px-4 py-2 rounded">Back</button></div>;
            }
            default: return <div>Coming Soon</div>
        }
    }

    return (
        <div className="flex flex-col h-full">
            <main className="flex-grow overflow-y-auto">{renderScreen()}</main>
            <BottomNavBar activeScreen={screen} setScreen={setScreen} />
        </div>
    );
};

export default CareerHub;
