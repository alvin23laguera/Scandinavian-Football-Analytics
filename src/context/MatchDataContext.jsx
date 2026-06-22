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

    // --- Global Stats Cache (IndexedDB) ---
    const CACHE_DB_NAME = 'footballAnalyticsCache';
    const CACHE_DB_VERSION = 1;
    const CACHE_STORE_NAME = 'globalStats';

    const openCacheDB = () => new Promise((resolve, reject) => {
        const request = indexedDB.open(CACHE_DB_NAME, CACHE_DB_VERSION);
        request.onupgradeneeded = () => {
            const db = request.result;
            if (!db.objectStoreNames.contains(CACHE_STORE_NAME)) {
                db.createObjectStore(CACHE_STORE_NAME, { keyPath: 'id' });
            }
        };
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
    });

    const getCachedStats = async (fingerprint) => {
        try {
            const db = await openCacheDB();
            return new Promise((resolve) => {
                const tx = db.transaction(CACHE_STORE_NAME, 'readonly');
                const store = tx.objectStore(CACHE_STORE_NAME);
                const req = store.get('leagueStats');
                req.onsuccess = () => {
                    const result = req.result;
                    if (result && result.fingerprint === fingerprint) {
                        console.log('[Cache] ✅ Hit — loading precomputed stats instantly');
                        resolve(result.payload);
                    } else {
                        console.log('[Cache] ❌ Miss — fingerprint changed, recomputing...');
                        resolve(null);
                    }
                };
                req.onerror = () => resolve(null);
            });
        } catch { return null; }
    };

    const saveCachedStats = async (fingerprint, payload) => {
        try {
            const db = await openCacheDB();
            const tx = db.transaction(CACHE_STORE_NAME, 'readwrite');
            const store = tx.objectStore(CACHE_STORE_NAME);
            store.put({ id: 'leagueStats', fingerprint, payload, savedAt: Date.now() });
            console.log('[Cache] 💾 Saved computed stats for future loads');
        } catch (err) {
            console.warn('[Cache] Could not save:', err);
        }
    };

    const applyPayload = (payload) => {
        console.log("APPLYING PAYLOAD:", payload);
        console.log("TRANSITION STATS IN PAYLOAD:", payload.globalLeagueTransitionStats);
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

    // Global Stats Computation via Web Worker (with IndexedDB cache)
    useEffect(() => {
        let cancelled = false;
        if (!loadedMatches || loadedMatches.length === 0) return;

        (async () => {
            // Create a fingerprint from match IDs + count so cache invalidates when new matches are uploaded
            // Bump this version whenever the computation logic changes to auto-invalidate old cache
            const CACHE_VERSION = 25;
            const fingerprint = `v${CACHE_VERSION}::` + loadedMatches
                .map(m => m.id)
                .sort()
                .join(',') + `::${loadedMatches.length}`;

            // Check indexedDB cache first
            const cachedPayload = await getCachedStats(fingerprint);
            if (cachedPayload && !cancelled) {
                applyPayload(cachedPayload);
                return;
            }

            const worker = new Worker(new URL('../workers/globalStatsWorker.js', import.meta.url), { type: 'module' });
            
            worker.onmessage = async (e) => {
                if (cancelled) {
                    worker.terminate();
                    return;
                }
                
                if (e.data.type === 'GLOBAL_STATS_SUCCESS') {
                    const payload = e.data.payload;
                    if (payload) {
                        applyPayload(payload);
                        // Save to cache for next time
                        await saveCachedStats(fingerprint, payload);
                    }
                    worker.terminate();
                } else if (e.data.type === 'GLOBAL_STATS_ERROR') {
                    console.error("Global Stats Worker Error:", e.data.error);
                    worker.terminate();
                }
            };

            worker.postMessage({
                type: 'COMPUTE_GLOBAL_STATS',
                loadedMatches
            });

            // Cleanup on unmount
            return () => { worker.terminate(); };
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
