import express from 'express';
import cors from 'cors';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
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
} from '../src/utils/dataMapper.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3001;
const DATA_DIR = path.join(__dirname, 'data');

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
}

// Middleware
app.use(cors());
// Increase payload limit for large Opta JSON files
app.use(express.json({ limit: '50mb' }));

// --- Image Proxy Routes (replaces Vite dev server proxies in production) ---

// Proxy for FotMob images
app.use('/fotmob-images', async (req, res) => {
    try {
        const imagePath = req.path.replace(/^\//, '');
        const imageUrl = `https://images.fotmob.com/${imagePath}`;
        const response = await fetch(imageUrl);
        if (!response.ok) {
            return res.status(response.status).send('Image not found');
        }
        // Forward content-type header
        const contentType = response.headers.get('content-type');
        if (contentType) res.setHeader('Content-Type', contentType);
        // Forward cache headers
        res.setHeader('Cache-Control', 'public, max-age=86400');
        const buffer = Buffer.from(await response.arrayBuffer());
        res.send(buffer);
    } catch (error) {
        console.error('FotMob image proxy error:', error.message);
        res.status(500).send('Proxy error');
    }
});

// Proxy for TheSportsDB images
app.use('/sportsdb-images', async (req, res) => {
    try {
        const imagePath = req.path.replace(/^\//, '');
        const imageUrl = `https://r2.thesportsdb.com/${imagePath}`;
        const response = await fetch(imageUrl);
        if (!response.ok) {
            return res.status(response.status).send('Image not found');
        }
        const contentType = response.headers.get('content-type');
        if (contentType) res.setHeader('Content-Type', contentType);
        res.setHeader('Cache-Control', 'public, max-age=86400');
        const buffer = Buffer.from(await response.arrayBuffer());
        res.send(buffer);
    } catch (error) {
        console.error('SportsDB image proxy error:', error.message);
        res.status(500).send('Proxy error');
    }
});

// --- API Endpoints ---

// Helper to get file path
const getFilePath = (id) => path.join(DATA_DIR, `${id}.json`);

let globalStatsCache = null;

// GET /api/stats/global - Precomputes and caches global league statistics
app.get('/api/stats/global', (req, res) => {
    if (globalStatsCache) {
        return res.json(globalStatsCache);
    }

    try {
        const files = fs.readdirSync(DATA_DIR).filter(file => file.endsWith('.json'));
        const loadedMatches = [];
        const allEvts = [];

        files.forEach(file => {
            const content = fs.readFileSync(path.join(DATA_DIR, file), 'utf-8');
            const matchData = JSON.parse(content);
            const meta = { ...matchData };
            delete meta.events;
            loadedMatches.push(meta);

            if (meta.competition !== 'Eliteserien') return;

            const evts = matchData.events || [];
            const fallbackIds = [...new Set(evts.map(ev => ev.contestantId).filter(Boolean))];
            const homeId = meta.homeContestantId || fallbackIds[0];
            const awayId = meta.awayContestantId || fallbackIds[1];

            for (let i = 0; i < evts.length; i++) {
                const ev = evts[i];
                ev.matchId = meta.id;
                ev.homeTeam = meta.homeTeam;
                ev.awayTeam = meta.awayTeam;
                
                let resolvedTeamName = ev.teamName || 'Unknown';
                if (ev.contestantId) {
                    if (ev.contestantId === homeId) resolvedTeamName = meta.homeTeam;
                    else if (ev.contestantId === awayId) resolvedTeamName = meta.awayTeam;
                }
                ev.teamName = resolvedTeamName;
                allEvts.push(ev);
            }
        });

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
        
        const bdpLeagueStats = calculateLeagueBdpStatsWorker(allEvts, loadedMatches, isTeamMatchLocal);
        const leagueDefensiveHeight = calculateLeagueDefensiveHeightWorker(allEvts, loadedMatches, isTeamMatchLocal);
        const setPieceTable = calculateLeagueSetPieceTable(allEvts, loadedMatches, isTeamMatchLocal);
        const topPerformers = calculateLeagueTopPerformers(allEvts);
        const realStandings = calculateLeagueStandingsFromEvents(allEvts, loadedMatches);

        globalStatsCache = {
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
        };

        res.json(globalStatsCache);
    } catch (error) {
        console.error('Error computing global stats:', error);
        res.status(500).json({ error: 'Failed to compute global stats' });
    }
});

// GET /api/matches - Returns only the metadata for all matches
app.get('/api/matches', (req, res) => {
    try {
        const files = fs.readdirSync(DATA_DIR).filter(file => file.endsWith('.json'));
        const matchesMeta = files.map(file => {
            const content = fs.readFileSync(path.join(DATA_DIR, file), 'utf-8');
            const matchData = JSON.parse(content);
            // Strip the heavy events array
            const { events, ...meta } = matchData;
            return meta;
        });
        
        // Sort by dateSaved descending
        matchesMeta.sort((a, b) => new Date(b.dateSaved).getTime() - new Date(a.dateSaved).getTime());
        res.json(matchesMeta);
    } catch (error) {
        console.error('Error reading matches:', error);
        res.status(500).json({ error: 'Failed to read matches' });
    }
});

// GET /api/stats/ppda - Calculates PPDA across all matches for all teams
app.get('/api/stats/ppda', (req, res) => {
    try {
        const files = fs.readdirSync(DATA_DIR).filter(file => file.endsWith('.json'));
        const teamStats = {}; // { [teamName]: { passesAllowed: 0, defensiveActions: 0 } }

        files.forEach(file => {
            const content = fs.readFileSync(path.join(DATA_DIR, file), 'utf-8');
            const matchData = JSON.parse(content);
            const meta = matchData;
            
            // Map contestantId to team name
            const homeId = meta.homeContestantId;
            const awayId = meta.awayContestantId;
            const homeTeam = meta.homeTeam;
            const awayTeam = meta.awayTeam;

            if (!teamStats[homeTeam]) teamStats[homeTeam] = { passesAllowed: 0, defensiveActions: 0 };
            if (!teamStats[awayTeam]) teamStats[awayTeam] = { passesAllowed: 0, defensiveActions: 0 };

            if (!matchData.events) return;

            matchData.events.forEach(e => {
                const teamName = (e.contestantId === homeId) ? homeTeam : 
                                 (e.contestantId === awayId) ? awayTeam : e.teamName;
                if (!teamName || (teamName !== homeTeam && teamName !== awayTeam)) return;
                
                const opponent = (teamName === homeTeam) ? awayTeam : homeTeam;

                // Defensive actions by 'teamName' in their attacking half (x >= 40)
                // types: 7 (tackle), 8 (interception), 49 (ball recovery), 4 (foul)
                if (e.x >= 40) {
                    const isTackle = e.typeId === 7;
                    const isInterception = e.typeId === 8;
                    const isRecovery = e.typeId === 49;
                    const isFoul = e.typeId === 4;
                    if (isTackle || isInterception || isRecovery || isFoul) {
                        teamStats[teamName].defensiveActions += 1;
                    }
                }
                
                // Passes by 'teamName' in their own half (x <= 60) -> counts as pass allowed for 'opponent'
                if (e.typeId === 1 && e.outcome === 1 && e.x <= 60) {
                    teamStats[opponent].passesAllowed += 1;
                }
            });
        });

        // Compute PPDA and format array
        const leaguePPDA = Object.keys(teamStats).map(teamName => {
            const stats = teamStats[teamName];
            const ppda = stats.defensiveActions > 0 ? (stats.passesAllowed / stats.defensiveActions) : 0;
            return { teamName, ppda, passesAllowed: stats.passesAllowed, defensiveActions: stats.defensiveActions };
        }).filter(t => t.ppda > 0);

        // Sort ascending (lower PPDA is better)
        leaguePPDA.sort((a, b) => a.ppda - b.ppda);

        // Assign ranks
        leaguePPDA.forEach((team, index) => {
            team.rank = index + 1;
        });

        res.json(leaguePPDA);
    } catch (error) {
        console.error('Error computing PPDA:', error);
        res.status(500).json({ error: 'Failed to compute PPDA' });
    }
});

// GET /api/matches/:id - Returns the events array for a specific match
app.get('/api/matches/:id', (req, res) => {
    try {
        const filePath = getFilePath(req.params.id);
        if (!fs.existsSync(filePath)) {
            return res.status(404).json({ error: 'Match not found' });
        }
        
        const content = fs.readFileSync(filePath, 'utf-8');
        const matchData = JSON.parse(content);
        res.json(matchData.events);
    } catch (error) {
        console.error('Error reading match events:', error);
        res.status(500).json({ error: 'Failed to read match events' });
    }
});

// POST /api/matches - Saves a new match
app.post('/api/matches', (req, res) => {
    // Block uploads in production
    if (process.env.RENDER) {
        return res.status(403).json({ error: 'Read-only mode: Uploads are disabled on the live site.' });
    }
    
    try {
        const matchData = req.body;
        if (!matchData.id) {
            return res.status(400).json({ error: 'Match ID is required' });
        }

        matchData.dateSaved = new Date().toISOString();
        const filePath = getFilePath(matchData.id);
        
        let finalData = matchData;
        if (fs.existsSync(filePath)) {
            const existingContent = fs.readFileSync(filePath, 'utf-8');
            const existingData = JSON.parse(existingContent);
            // Merge to preserve 'events' if the incoming update only contains metadata
            finalData = { ...existingData, ...matchData };
        }
        
        fs.writeFileSync(filePath, JSON.stringify(finalData, null, 2), 'utf-8');
        globalStatsCache = null; // Invalidate cache
        res.status(201).json({ success: true, id: matchData.id });
    } catch (error) {
        console.error('Error saving match:', error);
        res.status(500).json({ error: 'Failed to save match' });
    }
});

// DELETE /api/matches/:id - Deletes a match
app.delete('/api/matches/:id', (req, res) => {
    // Block deletions in production
    if (process.env.RENDER) {
        return res.status(403).json({ error: 'Read-only mode: Deletions are disabled on the live site.' });
    }

    try {
        const filePath = getFilePath(req.params.id);
        if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
            globalStatsCache = null; // Invalidate cache
            res.json({ success: true });
        } else {
            res.status(404).json({ error: 'Match not found' });
        }
    } catch (error) {
        console.error('Error deleting match:', error);
        res.status(500).json({ error: 'Failed to delete match' });
    }
});

// --- Serve Frontend Static Files (Production) ---
const distPath = path.join(__dirname, '..', 'dist');
if (fs.existsSync(distPath)) {
    app.use(express.static(distPath));
    // Serve index.html for all non-API routes (SPA fallback)
    app.get(/(.*)/, (req, res) => {
        res.sendFile(path.join(distPath, 'index.html'));
    });
}

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
    console.log(`Match data directory: ${DATA_DIR}`);
    if (fs.existsSync(distPath)) {
        console.log(`Serving frontend from: ${distPath}`);
    }
});
