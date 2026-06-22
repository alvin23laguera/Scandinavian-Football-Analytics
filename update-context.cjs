const fs = require('fs');
let code = fs.readFileSync('src/context/MatchDataContext.jsx', 'utf8');

const startStr = '// --- Global Stats Cache (IndexedDB) ---';
const endStr = '}, [loadedMatches]);';

const startIdx = code.indexOf(startStr);
// Find the first closing of useEffect after cancelled = true
const cancelledIdx = code.indexOf('cancelled = true;');
const endIdx = code.indexOf(endStr, cancelledIdx) + endStr.length;

if (startIdx !== -1 && endIdx !== -1 && endIdx > startIdx) {
    const fetchCode = `const applyPayload = (payload) => {
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
    }, [loadedMatches]);`;

    code = code.substring(0, startIdx) + fetchCode + code.substring(endIdx);
    fs.writeFileSync('src/context/MatchDataContext.jsx', code);
    console.log('Successfully updated MatchDataContext.jsx');
} else {
    console.log('Could not find indices', startIdx, endIdx);
}
