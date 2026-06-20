import express from 'express';
import cors from 'cors';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

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
app.get('/fotmob-images/*', async (req, res) => {
    try {
        const imagePath = req.params[0];
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
app.get('/sportsdb-images/*', async (req, res) => {
    try {
        const imagePath = req.params[0];
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
        res.status(201).json({ success: true, id: matchData.id });
    } catch (error) {
        console.error('Error saving match:', error);
        res.status(500).json({ error: 'Failed to save match' });
    }
});

// DELETE /api/matches/:id - Deletes a match
app.delete('/api/matches/:id', (req, res) => {
    try {
        const filePath = getFilePath(req.params.id);
        if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
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
    app.get('*', (req, res) => {
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
