
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { GameData, CareerScreen, MatchResult, Player, Format, PromotionRecord, Team, LiveMatchState } from '../types';
import { TEAMS, INITIAL_SPONSORSHIPS, INITIAL_NEWS } from '../data';
import { Icons } from './GameComponents';
import { getPlayerById, generateLeagueSchedule, negotiateSponsorships, generateMatchNews, generatePreMatchNews } from '../utils';
import { useSimulation } from '../hooks/useSimulation';

// Import screens
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
import { Gameplay2DScreen } from './Gameplay2DScreen';
import SponsorRoom from './SponsorRoom';
import CustomizationHub from './CustomizationHub';

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
        { name: 'STATS', screen: 'STATS' as CareerScreen, icon: Icons.ChartPie },
        { name: 'SETTINGS', screen: 'SETTINGS' as CareerScreen, icon: Icons.Settings },
        { name: 'CUSTOMIZE', screen: 'CUSTOMIZATION' as CareerScreen, icon: Icons.Customize },
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

    // BACKWARDS COMPATIBILITY CHECK
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
        const team = gameData.teams.find(t => t.id === gameData.userTeamId);
        if (!team) {
            console.error("Critical Error: User team not found with ID:", gameData.userTeamId, ". Falling back to the first team.");
            return gameData.teams[0] || null;
        }
        return team;
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

    const handleUpdateGround = (code: string, updates: any) => {
        setGameData(prev => {
            if (!prev) return null;
            return {
                ...prev,
                grounds: prev.grounds.map(g => g.code === code ? { ...g, ...updates } : g)
            };
        });
    };
    
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
            
            if (Object.keys(newLimits[groundCode][format][inning]).length === 0) delete newLimits[groundCode][format][inning];
            if (Object.keys(newLimits[groundCode][format]).length === 0) delete newLimits[groundCode][format];
            if (Object.keys(newLimits[groundCode]).length === 0) delete newLimits[groundCode][format];

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

     const handleForwardDay = () => {
        if (!userTeam) return;
        let currentData = { ...gameData };
        let matchIndex = currentData.currentMatchIndex[currentData.currentFormat];
        let schedule = currentData.schedule[currentData.currentFormat];
        const results: MatchResult[] = [];
        const newNewsItems = [];

        let simulatedCount = 0;
        const maxSimulations = 5;

        // Pre-Match Analysis for upcoming user match if within sim range
        for(let i=0; i<5; i++) {
            if (matchIndex + i < schedule.length) {
                const m = schedule[matchIndex+i];
                if (m.teamA === userTeam.name || m.teamB === userTeam.name) {
                    // Found user match coming up
                    const preNews = generatePreMatchNews(m, currentData);
                    newNewsItems.push(preNews);
                    break;
                }
            }
        }

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
            if (isUserTeamMatch) {
                break; 
            }

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

        if (newNewsItems.length > 0) {
            currentData.news = [...newNewsItems, ...currentData.news].slice(0, 50);
        }

        if (results.length > 0) {
            setForwardSimResults(results);
            setGameData(currentData); 
            setScreen('FORWARD_RESULTS');
        } else {
             if (matchIndex < schedule.length) {
                 if (newNewsItems.length > 0) {
                     setGameData(prev => prev ? { ...prev, news: [...newNewsItems, ...prev.news] } : null);
                 }
                 showFeedback("Your match is next or waiting for opponent!", "success");
             }
        }
    };

    const handlePlayMatch = () => {
        if (!userTeam) return;
        
        if (gameData.activeMatch) {
            setScreen('LIVE_MATCH');
            return;
        }

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
            showFeedback("Cannot play match, opponent not yet decided.", "error");
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

    const handleLiveMatchExit = () => {
        setGameData(prev => prev ? { ...prev, activeMatch: null } : null);
        setScreen('DASHBOARD');
    }

    const handleFormatChange = useCallback((newFormat: Format) => {
        setGameData(prev => prev ? ({
            ...prev,
            currentFormat: newFormat,
        }) : null);
        setScreen('DASHBOARD');
    }, [setGameData]);

    const handleEndOfSeason = useCallback(() => {
        setGameData(prevData => {
            if (!prevData) return null;

            const mainLeagueTeams = prevData.teams.filter(t => !prevData.allTeamsData.find(td => td.id === t.id)?.isDevelopmentTeam);
            const mainTeamStats = mainLeagueTeams.map(team => {
                const pointsT20 = prevData.standings[Format.T20].find(s => s.teamId === team.id)?.points || 0;
                const pointsODI = prevData.standings[Format.ODI].find(s => s.teamId === team.id)?.points || 0;
                const pointsFC = prevData.standings[Format.FIRST_CLASS].find(s => s.teamId === team.id)?.points || 0;
                const totalPoints = pointsT20 + pointsODI + pointsFC;
                return { team, totalPoints };
            });
            const relegatedTeams = mainTeamStats.sort((a, b) => a.totalPoints - b.totalPoints).slice(0, 3).map(i => i.team);

            const devTeams = prevData.teams.filter(t => prevData.allTeamsData.find(td => td.id === t.id)?.isDevelopmentTeam);
            const getCombinedPoints = (tId: string, f1: Format, f2: Format) => {
                const p1 = prevData.standings[f1].find(s => s.teamId === tId)?.points || 0;
                const p2 = prevData.standings[f2].find(s => s.teamId === tId)?.points || 0;
                return p1 + p2;
            };

            const t20Scores = devTeams.map(t => ({ team: t, score: getCombinedPoints(t.id, Format.DEVELOPMENT_T20, Format.RISE_T20) })).sort((a,b) => b.score - a.score);
            const odiScores = devTeams.map(t => ({ team: t, score: getCombinedPoints(t.id, Format.DEVELOPMENT_ODI, Format.RISE_ODI) })).sort((a,b) => b.score - a.score);
            const fcScores = devTeams.map(t => ({ team: t, score: getCombinedPoints(t.id, Format.DEVELOPMENT_FIRST_CLASS, Format.RISE_FIRST_CLASS) })).sort((a,b) => b.score - a.score);

            const promotedTeams: Team[] = [];
            promotedTeams.push(t20Scores[0].team);
            let odiCandidateIndex = 0;
            while (promotedTeams.find(t => t.id === odiScores[odiCandidateIndex].team.id)) {
                odiCandidateIndex++;
                if (odiCandidateIndex >= odiScores.length) break;
            }
            if (odiCandidateIndex < odiScores.length) promotedTeams.push(odiScores[odiCandidateIndex].team);
            let fcCandidateIndex = 0;
            while (promotedTeams.find(t => t.id === fcScores[fcCandidateIndex].team.id)) {
                fcCandidateIndex++;
                if (fcCandidateIndex >= fcScores.length) break;
            }
            if (fcCandidateIndex < fcScores.length) promotedTeams.push(fcScores[fcCandidateIndex].team);

            const newPromotionHistory: PromotionRecord[] = [];
            relegatedTeams.forEach((rTeam, idx) => {
                if (promotedTeams[idx]) {
                     newPromotionHistory.push({
                        season: prevData.currentSeason,
                        promotedTeamId: promotedTeams[idx].id,
                        promotedTeamName: promotedTeams[idx].name,
                        relegatedTeamId: rTeam.id,
                        relegatedTeamName: rTeam.name
                     });
                }
            });

            const newAllTeamsData = prevData.allTeamsData.map(t => {
                if (relegatedTeams.find(rt => rt.id === t.id)) return { ...t, isDevelopmentTeam: true };
                if (promotedTeams.find(pt => pt.id === t.id)) return { ...t, isDevelopmentTeam: false };
                return t;
            });

            const newTeams = [...prevData.teams]; 
            const newMainTeams = newTeams.filter(t => !newAllTeamsData.find(td => td.id === t.id)?.isDevelopmentTeam);
            const newDevTeams = newTeams.filter(t => newAllTeamsData.find(td => td.id === t.id)?.isDevelopmentTeam);

            const newSchedules = {
                [Format.T20]: generateLeagueSchedule(newMainTeams, Format.T20),
                [Format.ODI]: generateLeagueSchedule(newMainTeams, Format.ODI),
                [Format.FIRST_CLASS]: generateLeagueSchedule(newMainTeams, Format.FIRST_CLASS),
                [Format.DEVELOPMENT_T20]: generateLeagueSchedule(newDevTeams, Format.DEVELOPMENT_T20),
                [Format.DEVELOPMENT_ODI]: generateLeagueSchedule(newDevTeams, Format.DEVELOPMENT_ODI),
                [Format.DEVELOPMENT_FIRST_CLASS]: generateLeagueSchedule(newDevTeams, Format.DEVELOPMENT_FIRST_CLASS),
                [Format.RISE_T20]: generateLeagueSchedule(newDevTeams, Format.RISE_T20),
                [Format.RISE_ODI]: generateLeagueSchedule(newDevTeams, Format.RISE_ODI),
                [Format.RISE_FIRST_CLASS]: generateLeagueSchedule(newDevTeams, Format.RISE_FIRST_CLASS),
            };

            const initialStandings = (teams: Team[]) => teams.map(team => ({ teamId: team.id, teamName: team.name, played: 0, won: 0, lost: 0, drawn: 0, points: 0, netRunRate: 0, runsFor: 0, runsAgainst: 0 }));
            
            const newStandings = {
                [Format.T20]: initialStandings(newMainTeams),
                [Format.ODI]: initialStandings(newMainTeams),
                [Format.FIRST_CLASS]: initialStandings(newMainTeams),
                [Format.DEVELOPMENT_T20]: initialStandings(newDevTeams),
                [Format.DEVELOPMENT_ODI]: initialStandings(newDevTeams),
                [Format.DEVELOPMENT_FIRST_CLASS]: initialStandings(newDevTeams),
                [Format.RISE_T20]: initialStandings(newDevTeams),
                [Format.RISE_ODI]: initialStandings(newDevTeams),
                [Format.RISE_FIRST_CLASS]: initialStandings(newDevTeams),
            };
            
            const newMatchResults = Object.values(Format).reduce((acc, format) => {
                acc[format] = [];
                return acc;
            }, {} as any);

            const newCurrentMatchIndices = Object.values(Format).reduce((acc, format) => {
                acc[format] = 0;
                return acc;
            }, {} as any);

            const newSponsorships = negotiateSponsorships(prevData.popularity || 50);
            
            const seasonNews: any = {
                id: `season-news-${Date.now()}`,
                headline: `Season ${prevData.currentSeason + 1} Begins!`,
                date: new Date().toLocaleDateString(),
                excerpt: "New sponsorships announced as the league enters a new era.",
                content: `The new season is here. New sponsors have taken over key tournaments. 
                Promoted teams: ${newPromotionHistory.map(p => p.promotedTeamName).join(', ')}. 
                Relegated teams: ${newPromotionHistory.map(p => p.relegatedTeamName).join(', ')}.`,
                type: 'league'
            };

            return {
                ...prevData,
                allTeamsData: newAllTeamsData,
                currentSeason: prevData.currentSeason + 1,
                currentFormat: Format.T20,
                currentMatchIndex: newCurrentMatchIndices,
                matchResults: newMatchResults,
                standings: newStandings,
                schedule: newSchedules,
                promotionHistory: [...prevData.promotionHistory, ...newPromotionHistory],
                sponsorships: newSponsorships,
                news: [seasonNews, ...prevData.news].slice(0, 50),
            };
        });
        setScreen('DASHBOARD');
    }, [setGameData]);

    const viewPlayerProfile = (player: Player, format: Format) => {
        setSelectedPlayer(player);
        setPlayerProfileFormat(format);
        setScreen('PLAYER_PROFILE');
    };

    const viewMatchResult = (result: MatchResult) => {
        setSelectedMatchResult(result);
        setScreen('MATCH_RESULT');
    }

    const renderScreen = () => {
        const commonProps = { gameData, userTeam, setGameData, setScreen, showFeedback };
        
        switch(screen) {
            case 'DASHBOARD': return <Dashboard {...commonProps} handlePlayMatch={handlePlayMatch} handleForwardDay={handleForwardDay} />;
            case 'LEAGUES': return <Standings gameData={gameData} />; 
            case 'SCHEDULE': return <Schedule gameData={gameData} userTeam={userTeam} viewMatchResult={viewMatchResult} />;
            case 'LINEUPS': return <Lineups {...commonProps} handleUpdatePlayingXI={handleUpdatePlayingXI} handleUpdateCaptain={handleUpdateCaptain} />;
            case 'EDITOR': return <Editor {...commonProps} handleUpdatePlayer={handleUpdatePlayer} handleCreatePlayer={handleCreatePlayer} handleUpdateGround={handleUpdateGround} handleUpdateScoreLimits={handleUpdateScoreLimits} />;
            case 'NEWS': return <News news={gameData.news} />;
            case 'STATS': return <Stats gameData={gameData} viewPlayerProfile={viewPlayerProfile} />;
            case 'SETTINGS': return <Settings onResetGame={onResetGame} theme={theme} setTheme={setTheme} saveGame={saveGame} loadGame={loadGame} />;
            case 'PLAYER_PROFILE': return <PlayerProfile player={selectedPlayer} onBack={() => setScreen('STATS')} initialFormat={playerProfileFormat} />;
            case 'MATCH_RESULT': return <MatchResultScreen result={selectedMatchResult} onBack={() => setScreen('DASHBOARD')} userTeamId={gameData.userTeamId} />;
            case 'FORWARD_RESULTS': return <ForwardResultsScreen results={forwardSimResults} onBack={() => setScreen('DASHBOARD')} userTeamId={gameData.userTeamId} />;
            case 'AWARDS_RECORDS': return <AwardsAndRecordsScreen gameData={gameData} />;
            case 'END_OF_FORMAT': return <EndOfFormatScreen gameData={gameData} handleFormatChange={handleFormatChange} handleEndSeason={handleEndOfSeason} />;
            case 'TRANSFERS': return <Transfers {...commonProps} />;
            case 'COMPARISON': return <ComparisonScreen gameData={gameData} />;
            case 'SPONSOR_ROOM': return <SponsorRoom gameData={gameData} setGameData={setGameData} />;
            case 'CUSTOMIZATION': return <CustomizationHub gameData={gameData} setGameData={setGameData} />;
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
                             const team = gameData.teams.find(t => t.id === sfResult?.winnerId);
                             return team?.name || 'TBD';
                        }
                        return placeholder;
                    };
                    resolvedMatch.teamA = resolvePlaceholder(resolvedMatch.teamA);
                    resolvedMatch.teamB = resolvePlaceholder(resolvedMatch.teamB);
                }

                return resolvedMatch ? (
                    <Gameplay2DScreen 
                        match={resolvedMatch} 
                        gameData={gameData} 
                        onMatchComplete={handleLiveMatchComplete} 
                        onExit={handleLiveMatchExit} 
                    /> 
                ) : (
                    <div className="p-4 text-center">
                        <p>Match data invalid or tournament finished.</p>
                        <button onClick={() => setScreen('DASHBOARD')} className="mt-4 bg-teal-500 text-white px-4 py-2 rounded">Back to Dashboard</button>
                    </div>
                );
            }
            default: return <div>Coming Soon</div>
        }
    }

    return (
        <div className="flex flex-col h-full">
            <main className="flex-grow overflow-y-auto">
                {renderScreen()}
            </main>
            <BottomNavBar activeScreen={screen} setScreen={setScreen} />
        </div>
    );
};

export default CareerHub;
