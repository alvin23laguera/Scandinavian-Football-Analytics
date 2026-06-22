import { getMatchEvents } from '../utils/db';
import { 
    calculateLeagueAttackMetrics, 
    calculateLeagueDefenceMetrics, 
    calculateLeagueTransitionMetrics, 
    calculateLeagueChanceCreationStats, 
    extractPossessionStyle,
    extractBuildUpFromOpta,
    extractFinalThirdEntries,
    extractBallRecoveriesFromOpta,
    calculateLeagueBdpStatsWorker,
    calculateLeagueDefensiveHeightWorker,
    calculateLeagueSetPieceTable,
    calculateLeagueTopPerformers,
    calculateLeagueStandingsFromEvents
} from '../utils/dataMapper';

self.onmessage = async (e) => {
    if (e.data.type === 'COMPUTE_GLOBAL_STATS') {
        try {
            const { loadedMatches } = e.data;
            const leagueMatches = loadedMatches.filter(m => m.competition === 'Eliteserien');
            
            if (leagueMatches.length === 0) {
                self.postMessage({ type: 'GLOBAL_STATS_SUCCESS', payload: null });
                return;
            }

            // 1. Fetch all match events concurrently
            // To prevent overwhelming the backend, we fetch in chunks
            const fetchMatchData = async (m) => {
                const evts = await getMatchEvents(m.id);
                if (!evts) return [];

                const fallbackIds = [...new Set(evts.map(ev => ev.contestantId).filter(Boolean))];
                const homeId = m.homeContestantId || fallbackIds[0];
                const awayId = m.awayContestantId || fallbackIds[1];

                for (let i = 0; i < evts.length; i++) {
                    const ev = evts[i];
                    ev.matchId = m.id;
                    ev.homeTeam = m.homeTeam;
                    ev.awayTeam = m.awayTeam;
                    
                    let resolvedTeamName = ev.teamName || 'Unknown';
                    if (ev.contestantId) {
                        if (ev.contestantId === homeId) resolvedTeamName = m.homeTeam;
                        else if (ev.contestantId === awayId) resolvedTeamName = m.awayTeam;
                    }
                    ev.teamName = resolvedTeamName;
                }
                return evts;
            };

            const allEvtsArrays = [];
            const chunkSize = 5;
            for (let i = 0; i < leagueMatches.length; i += chunkSize) {
                const chunk = leagueMatches.slice(i, i + chunkSize);
                const results = await Promise.all(chunk.map(m => fetchMatchData(m)));
                allEvtsArrays.push(...results);
            }
            
            // Flatten the arrays
            const allEvts = [];
            for (const evts of allEvtsArrays) {
                for (const ev of evts) {
                    allEvts.push(ev);
                }
            }

            // 2. Compute the stats using dataMapper
            const normalizeTeamNameMatcher = (a, b) => {
                const normA = a ? a.toLowerCase().replace(/ fk| bk| il| if| sk| fotball/gi, '').trim() : '';
                const normB = b ? b.toLowerCase().replace(/ fk| bk| il| if| sk| fotball/gi, '').trim() : '';
                return normA === normB || normA.includes(normB) || normB.includes(normA);
            };

            const isTeamMatchLocal = (a, b) => {
                if (b === 'Eliteserien' || b === 'League') return true;
                return normalizeTeamNameMatcher(a, b);
            };

            const attackStats = calculateLeagueAttackMetrics(allEvts, loadedMatches, normalizeTeamNameMatcher);
            const defenceStats = calculateLeagueDefenceMetrics(allEvts, loadedMatches, normalizeTeamNameMatcher);
            const transitionStats = calculateLeagueTransitionMetrics(allEvts, loadedMatches, normalizeTeamNameMatcher);
            const chancesStats = calculateLeagueChanceCreationStats(allEvts, loadedMatches, isTeamMatchLocal);
            const possessionStyle = extractPossessionStyle(allEvts);
            const buildUpStats = extractBuildUpFromOpta(allEvts, ['Eliteserien'], isTeamMatchLocal);
            const finalThirdStats = extractFinalThirdEntries(allEvts, ['Eliteserien'], isTeamMatchLocal);
            const recoveriesStats = extractBallRecoveriesFromOpta(allEvts, ['Eliteserien'], isTeamMatchLocal);
            
            // New sync versions that use the already-fetched allEvts
            const bdpLeagueStats = calculateLeagueBdpStatsWorker(allEvts, loadedMatches, isTeamMatchLocal);
            const leagueDefensiveHeight = calculateLeagueDefensiveHeightWorker(allEvts, loadedMatches, isTeamMatchLocal);
            const setPieceTable = calculateLeagueSetPieceTable(allEvts, loadedMatches, isTeamMatchLocal);
            const topPerformers = calculateLeagueTopPerformers(allEvts);
            const realStandings = calculateLeagueStandingsFromEvents(allEvts, loadedMatches);

            // 3. Return the processed aggregate data
            self.postMessage({
                type: 'GLOBAL_STATS_SUCCESS',
                payload: {
                    globalLeagueAttackStats: attackStats,
                    globalLeagueDefenceStats: defenceStats,
                    globalLeagueTransitionStats: transitionStats,
                    globalLeagueChanceCreation: chancesStats.created,
                    globalLeagueChancesConceded: chancesStats.conceded,
                    globalPossessionStyle: possessionStyle,
                    globalLeagueBuildUp: buildUpStats,
                    globalLeagueFinalThird: finalThirdStats,
                    globalLeagueRecoveries: recoveriesStats,
                    globalBdpLeagueStats: bdpLeagueStats,
                    globalLeagueDefensiveHeight: leagueDefensiveHeight,
                    globalLeagueSetPieceTable: setPieceTable,
                    globalTopPerformers: topPerformers,
                    globalLeagueStandings: realStandings
                }
            });

        } catch (error) {
            console.error("Worker error:", error);
            self.postMessage({ type: 'GLOBAL_STATS_ERROR', error: error.message });
        }
    }
};
