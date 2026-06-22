import React, { createContext, useState, useEffect, useContext, useRef } from 'react';
import { getAllMatchesMeta, saveMatch, getMatchEvents, deleteMatch, getSeasonPPDA } from '../utils/db';
import { calculateLeagueAttackMetrics, calculateLeagueDefenceMetrics, calculateLeagueTransitionMetrics, extractBuildUpFromOpta, extractFinalThirdEntries, calculateLeagueChanceCreationStats, extractPossessionStyle, extractBallRecoveriesFromOpta } from '../utils/dataMapper';
import { matches as mockMatches, leagueStandings as mockStandings } from '../data/mockData';

const MatchDataContext = createContext();

export const useMatchData = () => useContext(MatchDataContext);

export const MatchDataProvider = ({ children }) => {
    const [loadedMatches, setLoadedMatches] = useState([]);
    const [derivedMatches, setDerivedMatches] = useState(mockMatches);
    const [derivedStandings, setDerivedStandings] = useState(mockStandings);
    const [globalLeagueStandings, setGlobalLeagueStandings] = useState(null);
    const [seasonPPDA, setSeasonPPDA] = useState([]);
    const [globalLeagueAttackStats, setGlobalLeagueAttackStats] = useState(null);
    const [globalLeagueDefenceStats, setGlobalLeagueDefenceStats] = useState(null);
    const [globalLeagueTransitionStats, setGlobalLeagueTransitionStats] = useState(null);
    const [globalLeagueBuildUp, setGlobalLeagueBuildUp] = useState(null);
    const [globalLeagueFinalThird, setGlobalLeagueFinalThird] = useState(null);
    const [globalLeagueChanceCreation, setGlobalLeagueChanceCreation] = useState(null);
    const [globalLeagueChancesConceded, setGlobalLeagueChancesConceded] = useState(null);
    const [globalPossessionStyle, setGlobalPossessionStyle] = useState(null);
    const [globalLeagueRecoveries, setGlobalLeagueRecoveries] = useState(null);
    const [globalLeaguePlayerRecoveryStats, setGlobalLeaguePlayerRecoveryStats] = useState(null);
    const [globalBdpLeagueStats, setGlobalBdpLeagueStats] = useState(null);
    const [globalLeagueDefensiveHeight, setGlobalLeagueDefensiveHeight] = useState(null);
    const [globalLeagueSetPieceTable, setGlobalLeagueSetPieceTable] = useState(null);
    const [globalTopPerformers, setGlobalTopPerformers] = useState(null);

    const refreshMatches = async () => {
        try {
            const [matches, ppda] = await Promise.all([
                getAllMatchesMeta(),
                getSeasonPPDA()
            ]);
            setLoadedMatches(matches);
            setSeasonPPDA(ppda);
        } catch (error) {
            console.error("Failed to load match metadata or PPDA from DB", error);
        }
    };

    useEffect(() => {
        refreshMatches();
    }, []);

    useEffect(() => {
        let newMatches = [...mockMatches];
        let newStandings = JSON.parse(JSON.stringify(mockStandings));

        const teamAliases = {
            'Hamarkameratene': 'HamKam',
            'Aalesunds FK': 'Aalesund',
            'FK Bodø/Glimt': 'Bodø/Glimt',
            'Rosenborg BK': 'Rosenborg',
            'Lillestrøm SK': 'Lillestrøm',
            'Vålerenga IF': 'Vålerenga',
            'Sandefjord Fotball': 'Sandefjord',
            'Viking FK': 'Viking',
            'Kristiansund BK': 'Kristiansund',
            'Molde FK': 'Molde',
            'IK Start': 'Start',
            'Fredrikstad FK': 'Fredrikstad',
            'KFUM Oslo': 'KFUM',
            'Tromsø IL': 'Tromsø',
            'Brann': 'Brann',
            'Sarpsborg 08': 'Sarpsborg 08'
        };

        const getAlias = (name) => teamAliases[name] || name;

        if (loadedMatches.length > 0) {
            newStandings.forEach(team => {
                team.p = 0; team.w = 0; team.d = 0; team.l = 0;
                team.gf = 0; team.ga = 0; team.gd = 0; team.pts = 0;
            });
        }

        loadedMatches.forEach(lm => {
            if (lm.homeScore !== undefined && lm.awayScore !== undefined && lm.homeScore !== '' && lm.awayScore !== '') {
                const hScore = parseInt(lm.homeScore);
                const aScore = parseInt(lm.awayScore);
                
                const matchIndex = newMatches.findIndex(m => getAlias(m.homeTeam) === getAlias(lm.homeTeam) && getAlias(m.awayTeam) === getAlias(lm.awayTeam) && m.competition === lm.competition);
                
                if (matchIndex !== -1) {
                    newMatches[matchIndex] = {
                        ...newMatches[matchIndex],
                        score: `${hScore}-${aScore}`,
                        status: 'Full Time'
                    };
                } else {
                    newMatches.push({
                        ...lm,
                        score: `${hScore}-${aScore}`,
                        status: 'Full Time'
                    });
                }

                if (lm.competition === 'Eliteserien') {
                    let homeTeamStats = newStandings.find(t => t.team === getAlias(lm.homeTeam));
                    if (!homeTeamStats) {
                        homeTeamStats = { team: getAlias(lm.homeTeam), p: 0, w: 0, d: 0, l: 0, gf: 0, ga: 0, gd: 0, pts: 0 };
                        newStandings.push(homeTeamStats);
                    }
                    
                    let awayTeamStats = newStandings.find(t => t.team === getAlias(lm.awayTeam));
                    if (!awayTeamStats) {
                        awayTeamStats = { team: getAlias(lm.awayTeam), p: 0, w: 0, d: 0, l: 0, gf: 0, ga: 0, gd: 0, pts: 0 };
                        newStandings.push(awayTeamStats);
                    }
                    
                    if (homeTeamStats && awayTeamStats) {
                        homeTeamStats.p += 1;
                        awayTeamStats.p += 1;
                        homeTeamStats.gf += hScore;
                        homeTeamStats.ga += aScore;
                        awayTeamStats.gf += aScore;
                        awayTeamStats.ga += hScore;
                        homeTeamStats.gd += (hScore - aScore);
                        awayTeamStats.gd += (aScore - hScore);
                        
                        if (hScore > aScore) {
                            homeTeamStats.w += 1;
                            homeTeamStats.pts += 3;
                            awayTeamStats.l += 1;
                        } else if (hScore < aScore) {
                            awayTeamStats.w += 1;
                            awayTeamStats.pts += 3;
                            homeTeamStats.l += 1;
                        } else {
                            homeTeamStats.d += 1;
                            awayTeamStats.d += 1;
                            homeTeamStats.pts += 1;
                            awayTeamStats.pts += 1;
                        }
                    }
                }
            }
        });

        newStandings.sort((a, b) => {
            if (b.pts !== a.pts) return b.pts - a.pts;
            return b.gd - a.gd;
        });
        
        newStandings.forEach((t, i) => t.pos = i + 1);

        setDerivedMatches(newMatches);
        setDerivedStandings(newStandings);
    }, [loadedMatches]);

    const saveNewMatch = async (matchData) => {
        await saveMatch(matchData);
        await refreshMatches();
    };

    const eventsCache = useRef({});

    const fetchMatchEvents = async (id) => {
        if (eventsCache.current[id]) {
            return eventsCache.current[id];
        }
        const events = await getMatchEvents(id);
        eventsCache.current[id] = events;
        return events;
    };

    const deleteStoredMatch = async (id) => {
        await deleteMatch(id);
        await refreshMatches();
    };

    const applyPayload = (payload) => {
        setGlobalLeagueAttackStats(payload.globalLeagueAttackStats);
        setGlobalLeagueDefenceStats(payload.globalLeagueDefenceStats);
        setGlobalLeagueTransitionStats(payload.globalLeagueTransitionStats);
        setGlobalLeagueBuildUp(payload.globalLeagueBuildUp);
        setGlobalLeagueFinalThird(payload.globalLeagueFinalThird);
        setGlobalLeagueChanceCreation(payload.globalLeagueChanceCreation);
        setGlobalLeagueChancesConceded(payload.globalLeagueChancesConceded);
        setGlobalPossessionStyle(payload.globalPossessionStyle);
        setGlobalLeagueRecoveries(payload.globalLeagueRecoveries);
        setGlobalLeaguePlayerRecoveryStats(payload.globalLeaguePlayerRecoveryStats);
        setGlobalBdpLeagueStats(payload.globalBdpLeagueStats);
        setGlobalLeagueDefensiveHeight(payload.globalLeagueDefensiveHeight);
        setGlobalLeagueSetPieceTable(payload.globalLeagueSetPieceTable);
        setGlobalTopPerformers(payload.globalTopPerformers);
        setGlobalLeagueStandings(payload.globalLeagueStandings);
    };

    // Fetch precomputed global stats from the server
    useEffect(() => {
        let cancelled = false;
        if (!loadedMatches || loadedMatches.length === 0) return;

        (async () => {
            try {
                // Determine API URL (handle local dev vs production)
                // In production, Vite proxy is gone, so we fetch directly from /api/stats/global
                // The backend serves both frontend and API from same domain
                const isProduction = import.meta.env.PROD;
                const apiUrl = isProduction ? '/api/stats/global' : 'http://localhost:3001/api/stats/global';
                
                const res = await fetch(apiUrl);
                if (!res.ok) throw new Error('Failed to fetch global stats');
                const payload = await res.json();
                
                if (!cancelled && payload) {
                    applyPayload(payload);
                }
            } catch (err) {
                console.error("Error fetching global stats from server:", err);
            }
        })();

        return () => { cancelled = true; };
    }, [loadedMatches]);

    return (
        <MatchDataContext.Provider value={{ 
            loadedMatches, derivedMatches, derivedStandings, seasonPPDA, 
            globalLeagueAttackStats, globalLeagueDefenceStats, globalLeagueTransitionStats, 
            globalLeagueBuildUp, globalLeagueFinalThird, globalLeagueChanceCreation, globalLeagueChancesConceded, globalPossessionStyle, globalLeagueRecoveries, globalBdpLeagueStats, globalLeagueDefensiveHeight, globalLeagueSetPieceTable, globalTopPerformers, globalLeagueStandings,
            saveNewMatch, fetchMatchEvents, refreshMatches, deleteStoredMatch 
        }}>
            {children}
        </MatchDataContext.Provider>
    );
};
