const getQualifiers = (e) => Array.isArray(e?.qualifier) ? e.qualifier : e?.qualifier ? [e.qualifier] : [];

/**
 * Utility to map raw Opta F24 events to specific formats needed by Visualization Components.
 */

/**
 * Extracts shots from an array of Opta events and maps them to the format
 * expected by the ShotMap component: { id, x, y, player, result, minute }
 * 
 * Opta typeIds for shots:
 * 13: Miss
 * 14: Post
 * 15: Saved
 * 16: Goal
 */
export const extractShotsFromOpta = (events, selectedTeams = [], isTeamMatchFn = null) => {
    if (!events || !Array.isArray(events)) return [];

    const SHOT_TYPES = [13, 14, 15, 16];

    // First filter for only shot events
    let shots = events.filter(e => SHOT_TYPES.includes(e.typeId));

    // If we have selected teams and a match function, filter the shots
    if (selectedTeams.length > 0 && isTeamMatchFn) {
        shots = shots.filter(e => selectedTeams.some(t => isTeamMatchFn(e.teamName, t)));
    }

    return shots.map(e => {
            let result = 'offTarget';
            if (e.typeId === 16) {
                result = 'goal';
            } else if (e.typeId === 15) {
                result = 'onTarget';
            }

            let x = parseFloat(e.x) || 0;
            let y = parseFloat(e.y) || 0;

            // If comparing two teams, flip the coordinates for the second team
            // so they shoot at the left side of the pitch
            if (selectedTeams.length === 2 && isTeamMatchFn) {
                if (isTeamMatchFn(e.teamName, selectedTeams[1])) {
                    x = 100 - x;
                    y = 100 - y;
                }
            }

            return {
                id: e.id || Math.random().toString(),
                x: x,
                y: y,
                player: e.playerName || `Player ${e.playerId || 'Unknown'}`,
                team: e.teamName || 'Unknown',
                result: result,
                minute: e.timeMin || 0
            };
        });
};

/**
 * Extracts build-up distribution passes from an array of Opta events.
 *
 * Included event types:
 *  - Goal Kicks     : typeId 61, origin within either penalty area (x ≤ 16.5 or x ≥ 83.5)
 *  - Free Kicks     : typeId 1 + qualifier 5, origin within either penalty area
 *  - GK Passes      : typeId 1 + qualifier 72, origin within either penalty area
 *
 * The penalty-area position check (x ≤ 16.5 or x ≥ 83.5 in 0–100 space)
 * naturally excludes midfield clearances / free kicks taken further upfield.
 */
export const extractBuildUpFromOpta = (events, selectedTeams = [], isTeamMatchFn = null) => {
    if (!events || !Array.isArray(events)) return [];

    const FREE_KICK_Q = 5;
    const GK_PASS_Q   = 72;
    const GOAL_KICK_Q = 124;
    const THROW_IN_Q  = 107;

    // 1. Identify Goalkeepers per team for this specific match.
    // We count GK-specific actions to find the primary keeper(s).
    const playerGKStats = {};
    events.forEach(e => {
        if (!e.playerId || !e.teamName) return;
        const qualIds = getQualifiers(e).map(q => q.qualifierId) || [];
        
        let score = 0;
        if (e.typeId === 10 || e.typeId === 11 || e.typeId === 41) score = 10; // High weight for Saves/Claims
        else if (qualIds.includes(GK_PASS_Q)) score = 5;                        // Medium weight for GK Passes
        else if (qualIds.includes(GOAL_KICK_Q)) score = 5;                     // Medium weight for Goal Kicks

        if (score > 0) {
            const key = `${e.teamName}|${e.playerId}`;
            playerGKStats[key] = (playerGKStats[key] || 0) + score;
        }
    });

    // For each team, identify the player(s) with the most GK "points"
    const teamKeepers = {};
    Object.entries(playerGKStats).forEach(([key, score]) => {
        const [teamName, playerId] = key.split('|');
        if (!teamKeepers[teamName] || teamKeepers[teamName].score < score) {
            teamKeepers[teamName] = { playerId, score };
        }
    });

    const goalkeeperIds = new Set(Object.values(teamKeepers).map(k => k.playerId));

    // Penalty area boundary in Opta 0-100 coordinate space
    const BOX_EDGE = 16.5;
    const inEitherBox = (x) => x <= BOX_EDGE || x >= (100 - BOX_EDGE);

    let buildUpEvents = events.filter(e => {
        const x = parseFloat(e.x) || 0;
        const qualIds = getQualifiers(e).map(q => q.qualifierId);

        // Never include throw-ins
        if (qualIds.includes(THROW_IN_Q)) return false;

        // Goal Kicks (Qualifier 124) — Strictly for Goalkeepers
        if (qualIds.includes(GOAL_KICK_Q)) {
            return goalkeeperIds.has(e.playerId);
        }

        // GK Passes (Qualifier 72) — Strictly for Goalkeepers
        if (qualIds.includes(GK_PASS_Q)) {
            return goalkeeperIds.has(e.playerId);
        }

        // Free Kicks from own box — Any player (as requested)
        if (qualIds.includes(FREE_KICK_Q) && inEitherBox(x)) {
            return true;
        }

        return false;
    });

    // Filter by selected team
    if (selectedTeams.length > 0 && isTeamMatchFn) {
        buildUpEvents = buildUpEvents.filter(e =>
            selectedTeams.some(t => isTeamMatchFn(e.teamName, t))
        );
    }

    return buildUpEvents.map((e, i) => {
        const startX = parseFloat(e.x) || 0;
        const startY = parseFloat(e.y) || 0;

        const qualIds = getQualifiers(e).map(q => q.qualifierId);
        
        // Extract destination coordinates from qualifiers 140 (x) and 141 (y)
        const endXQual = getQualifiers(e).find(q => q.qualifierId === 140);
        const endYQual = getQualifiers(e).find(q => q.qualifierId === 141);

        let destX = endXQual ? parseFloat(endXQual.value) : startX;
        let destY = endYQual ? parseFloat(endYQual.value) : startY;

        // Normalization: The user wants the team to always attack Left -> Right.
        const startedAtRight = startX > 50;
        
        const finalX = startedAtRight ? (100 - destX) : destX;
        const finalY = startedAtRight ? (100 - destY) : destY;

        let type = 'goalKick';
        if (qualIds.includes(FREE_KICK_Q)) type = 'freekick';
        else if (qualIds.includes(GK_PASS_Q))  type = 'gkPass';

        // Identify receiver if pass was completed
        let receiver = null;
        if (e.outcome === 1) {
            // Find the index of this event in the original list
            const idx = events.findIndex(ev => ev === e);
            if (idx !== -1) {
                // Find next event for the same team
                const nextEvent = events.slice(idx + 1).find(next => next.contestantId === e.contestantId);
                if (nextEvent && nextEvent.playerName && nextEvent.playerName !== e.playerName) {
                    receiver = nextEvent.playerName;
                }
            }
        }

        return {
            id: e.id || Math.random().toString(),
            x: finalX,
            y: finalY,
            player: e.playerName || 'Unknown',
            team: e.teamName || 'Unknown',
            completed: e.outcome === 1,
            minute: e.timeMin || 0,
            type,
            receiver,
        };
    });
};

/**
 * Extracts corner kicks from an array of Opta events.
 * 
 * Corner kicks are identified as Passes (typeId 1) with Qualifier 6.
 * Coordinates are normalized for a consistent left-to-right attacking perspective.
 */
export const extractCornersFromOpta = (events, selectedTeams = [], isTeamMatchFn = null) => {
    if (!events || !Array.isArray(events)) return [];

    const CORNER_QUALIFIER = 6;

    let corners = events.filter(e => {
        const qualIds = getQualifiers(e).map(q => q.qualifierId);
        return qualIds.includes(CORNER_QUALIFIER);
    });

    if (selectedTeams.length > 0 && isTeamMatchFn) {
        corners = corners.filter(e =>
            selectedTeams.some(t => isTeamMatchFn(e.teamName, t))
        );
    }

    return corners.map(e => {
        const startX = parseFloat(e.x) || 0;
        
        // Destination coordinates from qualifiers 140 (x) and 141 (y)
        const endXQual = getQualifiers(e).find(q => q.qualifierId === 140);
        const endYQual = getQualifiers(e).find(q => q.qualifierId === 141);

        // If no destination coords, use start coords (unlikely for corners, but safe)
        let destX = endXQual ? parseFloat(endXQual.value) : startX;
        let destY = endYQual ? parseFloat(endYQual.value) : (parseFloat(e.y) || 0);

        // Opta coordinates are normalized (0-100). 
        // For corners, startX is usually ~100 (opponent's goal line).
        // finalX: distance from goal line (0 = goal line, 16.5 = penalty box edge)
        // finalY: horizontal position (0 = left touchline, 100 = right touchline)
        const finalX = Math.abs(100 - destX); 
        const finalY = destY;

        return {
            id: e.id || Math.random().toString(),
            x: finalX,
            y: finalY,
            player: e.playerName || 'Unknown',
            team: e.teamName || 'Unknown',
            minute: e.timeMin || 0,
            outcome: e.outcome === 1 ? 'completed' : 'failed'
        };
    });
};

export const extractCornerDeliveriesFromOpta = (events, selectedTeams = [], isTeamMatchFn = null) => {
    if (!events || !Array.isArray(events)) return [];

    const CORNER_QUALIFIER = 6;

    let corners = events.filter(e => {
        const qualIds = getQualifiers(e).map(q => q.qualifierId);
        return qualIds.includes(CORNER_QUALIFIER);
    });

    if (selectedTeams.length > 0 && isTeamMatchFn) {
        corners = corners.filter(e =>
            selectedTeams.some(t => isTeamMatchFn(e.teamName, t))
        );
    }

    return corners.map(e => {
        const startX = parseFloat(e.x) || 0; // Usually ~100 or ~0
        const startY = parseFloat(e.y) || 0; // Usually ~100 or ~0
        
        const endXQual = getQualifiers(e).find(q => q.qualifierId === 140);
        const endYQual = getQualifiers(e).find(q => q.qualifierId === 141);

        let destX = endXQual ? parseFloat(endXQual.value) : startX;
        let destY = endYQual ? parseFloat(endYQual.value) : startY;
        
        const qualIds = getQualifiers(e).map(q => q.qualifierId);
        
        let swing = 'straight';
        if (qualIds.includes(153)) swing = 'in';
        else if (qualIds.includes(154)) swing = 'out';
        else if (qualIds.includes(155)) swing = 'straight';
        else {
            const isLeftFoot = qualIds.includes(16) || qualIds.includes(72);
            const isRightFoot = qualIds.includes(15);
            
            if (startY > 50) { // Right side
                if (isLeftFoot) swing = 'in';
                if (isRightFoot) swing = 'out';
            } else { // Left side
                if (isRightFoot) swing = 'in';
                if (isLeftFoot) swing = 'out';
            }
        }

        let isGoal = false;
        const idx = events.indexOf(e);
        if (idx !== -1) {
            for (let i = 1; i <= 8 && (idx + i) < events.length; i++) {
                const nextEvent = events[idx + i];
                if (nextEvent.typeId === 16 && nextEvent.contestantId === e.contestantId) {
                    isGoal = true;
                    break;
                }
            }
        }
        
        // Define short/backward corners:
        // A corner played to the edge of the box (e.g. for a volley) should be painted.
        // A pass is short if the total distance travelled is less than 25 units.
        // A pass is played backwards (not into the box) if it lands further back than X=75 (outside the penalty arc).
        const dist = Math.sqrt(Math.pow(destX - startX, 2) + Math.pow(destY - startY, 2));
        const isOutsideBox = dist < 25 || destX < 75;

        return {
            id: e.id || Math.random().toString(),
            startX,
            startY,
            destX,
            destY,
            player: e.playerName || 'Unknown',
            swing,
            outcome: e.outcome === 1 ? 'completed' : 'missed',
            isGoal,
            isBackward: isOutsideBox,
            isShort: isOutsideBox
        };
    });
};
export const extractFreeKicksFromOpta = (events, selectedTeams = [], isTeamMatchFn = null) => {
    if (!events || !Array.isArray(events)) return [];

    const FREE_KICK_QUALIFIER = 5;

    let freeKicks = events.filter(e => {
        const qualIds = getQualifiers(e).map(q => q.qualifierId);
        return (e.typeId === 1 || [13, 14, 15, 16].includes(e.typeId)) && qualIds.includes(FREE_KICK_QUALIFIER);
    });

    if (selectedTeams.length > 0 && isTeamMatchFn) {
        freeKicks = freeKicks.filter(e =>
            selectedTeams.some(t => isTeamMatchFn(e.teamName, t))
        );
    }

    return freeKicks.map(e => {
        const startX = parseFloat(e.x) || 0;
        const startY = parseFloat(e.y) || 0;
        
        const endXQual = getQualifiers(e).find(q => q.qualifierId === 140);
        const endYQual = getQualifiers(e).find(q => q.qualifierId === 141);

        let destX = endXQual ? parseFloat(endXQual.value) : startX;
        let destY = endYQual ? parseFloat(endYQual.value) : startY;

        // Normalization: 0 = Opponent Goal Line, 50 = Halfway Line, 100 = Own Goal Line
        const attackingSideX = (x) => Math.abs(100 - x);
        
        // If the free kick was taken from the "left" side (x < 50), we flip it
        // so that the team is always attacking the goal at x=100 in Opta coordinates.
        // But our mapper already handles "attacking goal" vs "defending goal" if we use meta.
        // Actually, let's keep it simple: assume the data passed to this function
        // is already filtered for the attacking team.
        
        const finalStartX = attackingSideX(startX);
        const finalStartY = startY; // Side to side
        const finalDestX = attackingSideX(destX);
        const finalDestY = destY;

        const isShot = [13, 14, 15, 16].includes(e.typeId);
        let result = null;
        if (isShot) {
            if (e.typeId === 16) result = 'goal';
            else if (e.typeId === 15) result = 'onTarget';
            else result = 'offTarget';
        }

        return {
            id: e.id || Math.random().toString(),
            startX: finalStartX,
            startY: finalStartY,
            destX: finalDestX,
            destY: finalDestY,
            player: e.playerName || 'Unknown',
            team: e.teamName || 'Unknown',
            minute: e.timeMin || 0,
            outcome: e.outcome === 1 ? 'completed' : 'failed',
            isShot: isShot,
            result: result
        };
    });
};

export const extractWideFreeKickDeliveriesFromOpta = (events, selectedTeams = [], isTeamMatchFn = null) => {
    if (!events || !Array.isArray(events)) return [];

    const FREE_KICK_QUALIFIER = 5;

    let freeKicks = events.filter(e => {
        const qualIds = getQualifiers(e).map(q => q.qualifierId);
        const isFreeKick = (e.typeId === 1 || [13, 14, 15, 16].includes(e.typeId)) && qualIds.includes(FREE_KICK_QUALIFIER);
        const y = parseFloat(e.y) || 0;
        const isWide = y < 21.1 || y > 78.9;
        const x = parseFloat(e.x) || 0;
        // In Opta, attacking half is usually X > 50 
        const isInAttackingHalf = x > 50;
        
        return isFreeKick && isWide && isInAttackingHalf;
    });

    if (selectedTeams.length > 0 && isTeamMatchFn) {
        freeKicks = freeKicks.filter(e =>
            selectedTeams.some(t => isTeamMatchFn(e.teamName, t))
        );
    }

    return freeKicks.map(e => {
        const startX = parseFloat(e.x) || 0;
        const startY = parseFloat(e.y) || 0;
        
        const endXQual = getQualifiers(e).find(q => q.qualifierId === 140);
        const endYQual = getQualifiers(e).find(q => q.qualifierId === 141);

        let destX = endXQual ? parseFloat(endXQual.value) : startX;
        let destY = endYQual ? parseFloat(endYQual.value) : startY;
        
        const qualIds = getQualifiers(e).map(q => q.qualifierId);
        
        let swing = 'straight';
        if (qualIds.includes(153)) swing = 'in';
        else if (qualIds.includes(154)) swing = 'out';
        else if (qualIds.includes(155)) swing = 'straight';
        else {
            const isLeftFoot = qualIds.includes(16) || qualIds.includes(72);
            const isRightFoot = qualIds.includes(15);
            
            if (startY < 50) { // Left side
                if (isRightFoot) swing = 'in';
                if (isLeftFoot) swing = 'out';
            } else { // Right side
                if (isLeftFoot) swing = 'in';
                if (isRightFoot) swing = 'out';
            }
        }

        let isGoal = false;
        const idx = events.indexOf(e);
        if (idx !== -1) {
            // Check next 8 events for a goal by the same team (captures direct assists and immediate scrambles)
            for (let i = 1; i <= 8 && (idx + i) < events.length; i++) {
                const nextEvent = events[idx + i];
                if (nextEvent.typeId === 16 && nextEvent.contestantId === e.contestantId) {
                    isGoal = true;
                    break;
                }
            }
        }

        return {
            id: e.id || Math.random().toString(),
            startX,
            startY,
            destX,
            destY,
            player: e.playerName || 'Unknown',
            swing,
            outcome: e.outcome === 1 ? 'completed' : 'missed',
            isGoal,
            isBackward: destX < 50
        };
    });
};

/**
 * Extracts ball recoveries from an array of Opta events.
 * Includes:
 * - Interceptions (typeId: 8)
 * - Tackles Won (typeId: 7, outcome: 1)
 * - Ball Recoveries (typeId: 49)
 */
export const extractBallRecoveriesFromOpta = (events, selectedTeams = [], isTeamMatchFn = null) => {
    if (!events || !Array.isArray(events)) return [];

    let recoveries = events.filter(e => {
        // Interceptions
        if (e.typeId === 8) return true;
        // Tackles Won
        if (e.typeId === 7 && e.outcome === 1) return true;
        // Ball Recovery
        if (e.typeId === 49) return true;
        
        return false;
    });

    if (selectedTeams.length > 0 && isTeamMatchFn) {
        recoveries = recoveries.filter(e =>
            selectedTeams.some(t => isTeamMatchFn(e.teamName, t))
        );
    }

    return recoveries.map(e => {
        let type = 'Recovery';
        if (e.typeId === 8) type = 'Interception';
        else if (e.typeId === 7) type = 'Tackle';
        else if (e.typeId === 49) type = 'Recovery';

        let x = parseFloat(e.x) || 0;
        let y = parseFloat(e.y) || 0;

        // If comparing two teams, flip coordinates for the second team so their attacks go left
        if (selectedTeams.length === 2 && isTeamMatchFn) {
            if (isTeamMatchFn(e.teamName, selectedTeams[1])) {
                x = 100 - x;
                y = 100 - y;
            }
        }

        return {
            id: e.id || Math.random().toString(),
            x: x,
            y: y,
            player: e.playerName || `Player ${e.playerId || 'Unknown'}`,
            team: e.teamName || 'Unknown',
            type: type,
            minute: e.timeMin || 0
        };
    });
};

export const extractDefensiveActionsFromOpta = (events, selectedTeams = [], isTeamMatchFn = null) => {
    if (!events || !Array.isArray(events)) return [];

    let actions = events.filter(e => {
        // Interceptions (8), Tackles Won (7, outcome 1), Ball Recovery (49)
        if (e.typeId === 8 || e.typeId === 49 || (e.typeId === 7 && e.outcome === 1)) return true;
        
        // Fouls committed (4)
        if (e.typeId === 4) return true;
        
        return false;
    });

    if (selectedTeams.length > 0 && isTeamMatchFn) {
        actions = actions.filter(e =>
            selectedTeams.some(t => isTeamMatchFn(e.teamName, t))
        );
    }

    return actions.map(e => ({
        id: e.id || Math.random().toString(),
        x: parseFloat(e.x) || 0,
        y: parseFloat(e.y) || 0,
        player: e.playerName || `Player ${e.playerId || 'Unknown'}`,
        minute: e.timeMin || 0,
        type: e.typeId === 4 ? 'Foul' : 'Recovery'
    }));
};

let cachedLeagueDefensiveHeight = null;

export const calculateLeagueDefensiveHeight = async (loadedMatches, fetchMatchEvents) => {
    if (cachedLeagueDefensiveHeight !== null) return cachedLeagueDefensiveHeight;
    
    let sumX = 0;
    let sumX2 = 0;
    let count = 0;

    for (const match of loadedMatches) {
        const events = await fetchMatchEvents(match.id);
        if (events) {
            const actions = extractDefensiveActionsFromOpta(events);
            actions.forEach(a => {
                sumX += a.x;
                sumX2 += a.x * a.x;
                count++;
            });
        }
    }
    
    if (count > 0) {
        const avg = sumX / count;
        const variance = (sumX2 / count) - (avg * avg);
        const stdDev = Math.sqrt(variance);
        cachedLeagueDefensiveHeight = {
            avg,
            stdDev,
            minBlock: Math.max(0, avg - stdDev),
            maxBlock: Math.min(100, avg + stdDev)
        };
    } else {
        cachedLeagueDefensiveHeight = { avg: 0, stdDev: 0, minBlock: 0, maxBlock: 0 };
    }
    
    return cachedLeagueDefensiveHeight;
};

export const extractTransitionsFromOpta = (events, selectedTeams = [], isTeamMatchFn = null) => {
    if (!events || !Array.isArray(events)) return [];

    let transitions = [];

    for (let i = 0; i < events.length; i++) {
        const e = events[i];

        const isRecovery = e.typeId === 8 || e.typeId === 49 || (e.typeId === 7 && e.outcome === 1);
        if (!isRecovery) continue;

        const recoveryTeam = e.contestantId || e.teamName;
        if (!recoveryTeam) continue;

        let passEvent = null;
        for (let j = i + 1; j < Math.min(i + 15, events.length); j++) {
            const nextE = events[j];
            const nextTeam = nextE.contestantId || nextE.teamName;
            
            if (nextTeam === recoveryTeam && nextE.typeId === 1) {
                passEvent = nextE;
                break;
            }
            if (nextTeam !== recoveryTeam && (nextE.typeId === 8 || nextE.typeId === 49 || (nextE.typeId === 7 && nextE.outcome === 1))) {
                break;
            }
        }

        if (passEvent) {
            transitions.push({ recovery: e, pass: passEvent });
            let passIndex = i + 1;
            for (let j = i + 1; j <= Math.min(i + 15, events.length - 1); j++) {
                if (events[j] === passEvent) {
                    passIndex = j;
                    break;
                }
                if (events[j] === passEvent) {
                    passIndex = j;
                    break;
                }
            }
            i = passIndex;
        }
    }

    if (selectedTeams.length > 0 && isTeamMatchFn) {
        transitions = transitions.filter(t =>
            selectedTeams.some(team => isTeamMatchFn(t.pass.teamName || t.pass.contestantId, team))
        );
    }

    return transitions.map(t => {
        const pass = t.pass;
        let startX = parseFloat(pass.x) || 0;
        let startY = parseFloat(pass.y) || 0;
        
        const endXQual = getQualifiers(pass).find(q => q.qualifierId === 140);
        const endYQual = getQualifiers(pass).find(q => q.qualifierId === 141);

        let destX = endXQual ? parseFloat(endXQual.value) : startX;
        let destY = endYQual ? parseFloat(endYQual.value) : startY;

        if (selectedTeams.length === 2 && isTeamMatchFn) {
            if (isTeamMatchFn(pass.teamName || pass.contestantId, selectedTeams[1])) {
                startX = 100 - startX;
                startY = 100 - startY;
                destX = 100 - destX;
                destY = 100 - destY;
            }
        }
                let receiver = null;
                if (pass.outcome === 1) {
                    const passIdx = events.indexOf(pass);
                    if (passIdx !== -1) {
                        const nextEvent = events.slice(passIdx + 1).find(next => (next.contestantId || next.teamName) === (pass.contestantId || pass.teamName));
                        if (nextEvent && nextEvent.playerName && nextEvent.playerName !== pass.playerName) {
                            receiver = nextEvent.playerName;
                        }
                    }
                }

                // Calculate Pass Direction
                // Opta X is 0-100 (105m), Y is 0-100 (68m)
                const dxMeters = (destX - startX) * 1.05;
                const dyMeters = (destY - startY) * 0.68;
                const angle = Math.abs((Math.atan2(dyMeters, dxMeters) * 180) / Math.PI);
                
                let passDirection = 'forward';
                if (angle > 60 && angle <= 120) {
                    passDirection = 'horizontal';
                } else if (angle > 120) {
                    passDirection = 'backwards';
                }

                return {
                        id: pass.id || Math.random().toString(),
                        startX: startX,
                        startY: startY,
                        destX: destX,
                        destY: destY,
                        player: pass.playerName || 'Unknown',
                        team: pass.teamName || 'Unknown',
                        completed: pass.outcome === 1,
                        minute: pass.timeMin || 0,
                        receiver: receiver,
                        passDirection: passDirection
                };
        });
};

export const extractConcededTransitionsFromOpta = (events, selectedTeams = [], isTeamMatchFn = null) => {
    if (!events || !Array.isArray(events)) return [];

    let transitions = [];

    for (let i = 0; i < events.length; i++) {
        const e = events[i];

        const isRecovery = e.typeId === 8 || e.typeId === 49 || (e.typeId === 7 && e.outcome === 1);
        if (!isRecovery) continue;

        const recoveryTeam = e.contestantId || e.teamName;
        if (!recoveryTeam) continue;

        let passEvent = null;
        for (let j = i + 1; j < Math.min(i + 15, events.length); j++) {
            const nextE = events[j];
            const nextTeam = nextE.contestantId || nextE.teamName;
            
            if (nextTeam === recoveryTeam && nextE.typeId === 1) {
                passEvent = nextE;
                break;
            }
            if (nextTeam !== recoveryTeam && (nextE.typeId === 8 || nextE.typeId === 49 || (nextE.typeId === 7 && nextE.outcome === 1))) {
                break;
            }
        }

        if (passEvent) {
            let ledToShot = false;
            let ledToGoal = false;
            const recoveryTime = (e.timeMin || 0) * 60 + (e.timeSec || 0);

            for (let k = i + 1; k < events.length; k++) {
                const checkE = events[k];
                const checkTime = (checkE.timeMin || 0) * 60 + (checkE.timeSec || 0);
                
                // If it's a different half or more than 20s have passed, stop looking
                if (checkTime - recoveryTime > 20 || checkTime < recoveryTime) break; 

                const checkTeam = checkE.contestantId || checkE.teamName;
                if (checkTeam === recoveryTeam) {
                    if ([13, 14, 15, 16].includes(checkE.typeId)) {
                        ledToShot = true;
                        if (checkE.typeId === 16) ledToGoal = true;
                        // Keep looking in case a saved shot results in a goal rebound within 20s
                    }
                } else if ([8, 49].includes(checkE.typeId) || (checkE.typeId === 7 && checkE.outcome === 1)) {
                    // The other team won it back, transition over
                    break;
                }
            }

            transitions.push({ recovery: e, pass: passEvent, ledToShot, ledToGoal });
            let passIndex = i + 1;
            for (let j = i + 1; j <= Math.min(i + 15, events.length - 1); j++) {
                if (events[j] === passEvent) {
                    passIndex = j;
                    break;
                }
            }
            i = passIndex;
        }
    }

    if (selectedTeams.length > 0 && isTeamMatchFn) {
        // Filter for recoveries made by teams that are NOT the selected team
        transitions = transitions.filter(t =>
            !selectedTeams.some(team => isTeamMatchFn(t.pass.teamName || t.pass.contestantId, team))
        );
    }

    return transitions.map(t => {
        const pass = t.pass;
        let startX = parseFloat(pass.x) || 0;
        let startY = parseFloat(pass.y) || 0;
        
        const endXQual = getQualifiers(pass).find(q => q.qualifierId === 140);
        const endYQual = getQualifiers(pass).find(q => q.qualifierId === 141);

        let destX = endXQual ? parseFloat(endXQual.value) : startX;
        let destY = endYQual ? parseFloat(endYQual.value) : startY;

        // Opponent's perspective is always attacking left-to-right.
        // We want the visualization to show our defensive half on the left.
        // Therefore, we must flip X and Y.
        startX = 100 - startX;
        startY = 100 - startY;
        destX = 100 - destX;
        destY = 100 - destY;

        const dxMeters = (destX - startX) * 1.05;
        const dyMeters = (destY - startY) * 0.68;
        const angle = Math.abs((Math.atan2(dyMeters, dxMeters) * 180) / Math.PI);
        let passDirection = 'forward';
        if (angle > 60 && angle <= 120) passDirection = 'horizontal';
        else if (angle > 120) passDirection = 'backwards';

        return {
            id: pass.id || Math.random().toString(),
            startX: startX,
            startY: startY,
            destX: destX,
            destY: destY,
            player: pass.playerName || 'Unknown',
            team: pass.teamName || 'Unknown',
            completed: pass.outcome === 1,
            minute: pass.timeMin || 0,
            ledToShot: t.ledToShot,
            ledToGoal: t.ledToGoal,
            receiver: null, // Not needed for defensive map
            passDirection: passDirection
        };
    });
};

export const calculatePPDA = (events, teamName, isTeamMatchFn = (a, b) => a === b) => {
    if (!events || !Array.isArray(events)) return null;

    let passesAllowed = 0;
    let defensiveActions = 0;

    // Filter events to only those matches where teamName was playing
    const matchEvents = events.filter(e => {
        // If we attached homeTeam/awayTeam in MatchAnalysis
        if (e.homeTeam && e.awayTeam) {
            return isTeamMatchFn(e.homeTeam, teamName) || isTeamMatchFn(e.awayTeam, teamName);
        }
        // Fallback: assume the team was playing if they made an event in the match
        return true; 
    });

    matchEvents.forEach(e => {
        const isOurTeam = isTeamMatchFn(e.teamName || e.contestantId, teamName);
        const x = parseFloat(e.x) || 0;

        if (!isOurTeam) {
            // Opponent pass in our attacking 60% (which is their defensive 60%, i.e. x <= 60)
            if (e.typeId === 1 && e.outcome === 1 && x <= 60) {
                passesAllowed++;
            }
        } else {
            // Our defensive action in our attacking 60% (i.e. x >= 40)
            if (x >= 40) {
                const isTackle = e.typeId === 7;
                const isInterception = e.typeId === 8;
                const isRecovery = e.typeId === 49;
                const isFoul = e.typeId === 4;
                if (isTackle || isInterception || isRecovery || isFoul) {
                    defensiveActions++;
                }
            }
        }
    });

    // Avoid division by zero
    const ppda = defensiveActions > 0 ? (passesAllowed / defensiveActions) : passesAllowed;
    
    return {
        teamName,
        passesAllowed,
        defensiveActions,
        ppda: parseFloat(ppda.toFixed(2))
    };
};

export const calculateLeaguePPDA = (allEvents, teamNamesList, isTeamMatchFn = (a, b) => a === b) => {
    const results = teamNamesList.map(teamName => calculatePPDA(allEvents, teamName, isTeamMatchFn)).filter(r => r !== null && (r.passesAllowed > 0 || r.defensiveActions > 0));
    
    // Sort by PPDA ascending (lower is better pressing)
    results.sort((a, b) => a.ppda - b.ppda);
    
    results.forEach((r, idx) => {
        r.rank = idx + 1;
    });

    return results;
};


export const extractFinalThirdEntries = (events, selectedTeams = [], isTeamMatchFn = null) => {
    // Pre-build index map for O(1) lookups instead of O(N) indexOf
    const eventIndexMap = new Map();
    for (let i = 0; i < events.length; i++) eventIndexMap.set(events[i], i);

    let filtered = events.filter(e => e.outcome === 1 && (e.typeId === 1 || e.typeId === 3 || e.typeId === 43 || e.typeId === 61 || e.typeId === 212));
    if (selectedTeams.length > 0 && isTeamMatchFn) {
        filtered = filtered.filter(e => selectedTeams.some(t => isTeamMatchFn(e.teamName, t)));
    }
    return filtered.map((e, idx, arr) => {
        let startX = parseFloat(e.x) || 0;
        let startY = parseFloat(e.y) || 0;
        const endXQual = getQualifiers(e).find(q => q.qualifierId === 140);
        const endYQual = getQualifiers(e).find(q => q.qualifierId === 141);
        let destX = endXQual ? parseFloat(endXQual.value) : startX;
        let destY = endYQual ? parseFloat(endYQual.value) : startY;
        if (selectedTeams.length === 2 && isTeamMatchFn) {
            if (isTeamMatchFn(e.teamName, selectedTeams[1])) {
                startX = 100 - startX;
                startY = 100 - startY;
                destX = 100 - destX;
                destY = 100 - destY;
            }
        }
        
        let receiver = null;
        if (e.typeId === 1) { // Pass
            const originalIdx = eventIndexMap.get(e);
            if (originalIdx !== undefined) {
                const teamId = e.contestantId || e.teamName;
                for (let k = originalIdx + 1; k < events.length; k++) {
                    const next = events[k];
                    if ((next.contestantId || next.teamName) === teamId) {
                        if (next.playerName && next.playerName !== e.playerName) {
                            receiver = next.playerName;
                        }
                        break;
                    }
                }
            }
        }

        return { ...e, startX, startY, destX, destY, receiver };
    }).filter(e => e.startX < 66.6 && e.destX >= 66.6);
};

export const extractOppHalfEntries = (events, selectedTeams = [], isTeamMatchFn = null) => {
    // Pre-build index map for O(1) lookups instead of O(N) indexOf
    const eventIndexMap = new Map();
    for (let i = 0; i < events.length; i++) eventIndexMap.set(events[i], i);

    let filtered = events.filter(e => e.outcome === 1 && (e.typeId === 1 || e.typeId === 3 || e.typeId === 43 || e.typeId === 61 || e.typeId === 212));
    if (selectedTeams.length > 0 && isTeamMatchFn) {
        filtered = filtered.filter(e => selectedTeams.some(t => isTeamMatchFn(e.teamName, t)));
    }
    return filtered.map((e, idx, arr) => {
        let startX = parseFloat(e.x) || 0;
        let startY = parseFloat(e.y) || 0;
        const endXQual = getQualifiers(e).find(q => q.qualifierId === 140);
        const endYQual = getQualifiers(e).find(q => q.qualifierId === 141);
        let destX = endXQual ? parseFloat(endXQual.value) : startX;
        let destY = endYQual ? parseFloat(endYQual.value) : startY;
        if (selectedTeams.length === 2 && isTeamMatchFn) {
            if (isTeamMatchFn(e.teamName, selectedTeams[1])) {
                startX = 100 - startX;
                startY = 100 - startY;
                destX = 100 - destX;
                destY = 100 - destY;
            }
        }
        
        let receiver = null;
        if (e.typeId === 1) { // Pass
            const originalIdx = eventIndexMap.get(e);
            if (originalIdx !== undefined) {
                const teamId = e.contestantId || e.teamName;
                for (let k = originalIdx + 1; k < events.length; k++) {
                    const next = events[k];
                    if ((next.contestantId || next.teamName) === teamId) {
                        if (next.playerName && next.playerName !== e.playerName) {
                            receiver = next.playerName;
                        }
                        break;
                    }
                }
            }
        }

        return { ...e, startX, startY, destX, destY, receiver };
    }).filter(e => e.startX < 50 && e.destX >= 50 && e.destX < 66.6);
};

/**
 * Extracts goals and shots on target grouped by 15-minute intervals.
 */
export const extractMatchMomentum = (events, selectedTeams = [], isTeamMatchFn = null) => {
    const intervals = [
        { label: '0-15', min: 0, max: 15 },
        { label: '16-30', min: 16, max: 30 },
        { label: '31-45', min: 31, max: 45 },
        { label: '46-60', min: 46, max: 60 },
        { label: '61-75', min: 61, max: 75 },
        { label: '76-90+', min: 76, max: 200 } // 200 to catch stoppage time and extra time
    ];

    const momentumData = intervals.map(interval => ({
        interval: interval.label,
        teamGoals: 0,
        teamShots: 0, // Shots on target
        teamAllShots: 0,
        teamBoxEntries: 0,
        opponentGoals: 0,
        opponentShots: 0, // Shots on target
        opponentAllShots: 0,
        opponentBoxEntries: 0
    }));

    if (selectedTeams.length === 0 || !isTeamMatchFn) return momentumData;
    if (!events || !Array.isArray(events)) return momentumData;
    
    const primaryTeam = selectedTeams[0];

    try {
        events.forEach(e => {
            const minute = parseInt(e.timeMin || e.minute || 0, 10);
            
            // Find appropriate interval
            let intervalObj;
            
            // First half stoppage time belongs in 31-45
            if (e.periodId === 1 && minute > 45) {
                intervalObj = momentumData.find(i => i.interval === '31-45');
            } 
            // Second half stoppage time (or extra time) belongs in 76-90+
            else if (minute > 90) {
                intervalObj = momentumData.find(i => i.interval === '76-90+');
            } 
            // Standard minute mapping
            else {
                intervalObj = momentumData.find(i => {
                    const range = intervals.find(r => r.label === i.interval);
                    return minute >= range.min && minute <= range.max;
                });
            }
            
            // Fallback for weird data
            if (!intervalObj) intervalObj = momentumData[momentumData.length - 1];

            const isPrimaryTeam = isTeamMatchFn(e.teamName || e.contestantId, primaryTeam);
            
            // Shots
            if ([13, 14, 15, 16].includes(e.typeId)) {
                const shot = e;
                const isGoal = shot.typeId === 16;
                const isShotOnTarget = shot.typeId === 15 || shot.typeId === 16;
                
                const qualIds = getQualifiers(shot).map(q => q.qualifierId);
                // Set Piece Qualifiers: 24 (Set Piece), 25 (Corner), 26 (Free Kick), 9 (Penalty), 5 (Free kick), 6 (Corner)
                const isSetPiece = qualIds.some(id => [9, 24, 25, 26, 5, 6].includes(id));
                
                if (isPrimaryTeam) {
                    if (isGoal) intervalObj.teamGoals++;
                    if (isShotOnTarget) intervalObj.teamShots++;
                    intervalObj.teamAllShots++;
                } else {
                    if (isGoal) intervalObj.opponentGoals++;
                    if (isShotOnTarget) intervalObj.opponentShots++;
                    intervalObj.opponentAllShots++;
                }
            }

            // Box Entries (Passes, Carries, Take-ons)
            if (e.outcome === 1 && [1, 3, 43].includes(e.typeId)) {
                let startX = parseFloat(e.x) || 0;
                let startY = parseFloat(e.y) || 0;
                
                // Safely handle e.qualifier being an object instead of array
                const qualifiers = Array.isArray(e.qualifier) ? e.qualifier : e.qualifier ? [e.qualifier] : [];
                
                const endXQual = qualifiers.find(q => q.qualifierId === 140 || q.qualifierId === '140');
                const endYQual = qualifiers.find(q => q.qualifierId === 141 || q.qualifierId === '141');
                
                let destX = endXQual ? parseFloat(endXQual.value) : startX;
                let destY = endYQual ? parseFloat(endYQual.value) : startY;

                if (selectedTeams.length === 2 && isTeamMatchFn) {
                    if (isTeamMatchFn(e.teamName, selectedTeams[1])) {
                        startX = 100 - startX;
                        startY = 100 - startY;
                        destX = 100 - destX;
                        destY = 100 - destY;
                    }
                }

                // Check if it enters the box
                if (startX < 83 || startY < 21.1 || startY > 78.9) {
                    if (destX >= 83 && destY >= 21.1 && destY <= 78.9) {
                        if (isPrimaryTeam) {
                            intervalObj.teamBoxEntries++;
                        } else {
                            intervalObj.opponentBoxEntries++;
                        }
                    }
                }
            }
        });
    } catch (err) {
        console.error("extractMatchMomentum crashed:", err);
    }

    return momentumData;
};

export const extractFieldTilt = (events, teamName, isTeamMatchFn = null) => {
    let teamCount = 0;
    let opponentCount = 0;
    let teamPasses = 0;
    let opponentPasses = 0;
    const opponentNames = new Set();

    if (!events || !Array.isArray(events)) {
        return { teamCount: 0, opponentCount: 0, teamTilt: 50, opponentTilt: 50, teamPossession: 50, opponentPossession: 50, resolvedOpponentName: 'Opponent' };
    }

    events.forEach(e => {
        const isPrimaryTeam = isTeamMatchFn ? isTeamMatchFn(e.teamName || e.contestantId, teamName) : (e.teamName === teamName);
        
        if (!isPrimaryTeam && e.teamName) {
            opponentNames.add(e.teamName);
        }

        if (e.typeId === 1 && e.outcome === 1) {
            if (isPrimaryTeam) teamPasses++;
            else opponentPasses++;
        }

        const isAction = e.outcome === 1 && [1, 3, 43, 8, 49].includes(e.typeId); 
        const inFinalQuarter = parseFloat(e.x) >= 75.0;
        
        if (isAction && inFinalQuarter) {
            if (isPrimaryTeam) teamCount++;
            else opponentCount++;
        }
    });

    const totalActions = teamCount + opponentCount;
    const teamTilt = totalActions > 0 ? (teamCount / totalActions) * 100 : 50;
    const opponentTilt = totalActions > 0 ? (opponentCount / totalActions) * 100 : 50;

    const totalPasses = teamPasses + opponentPasses;
    const teamPossession = totalPasses > 0 ? (teamPasses / totalPasses) * 100 : 50;
    const opponentPossession = totalPasses > 0 ? (opponentPasses / totalPasses) * 100 : 50;

    let resolvedOpponentName = 'Opponent';
    if (opponentNames.size === 1) {
        resolvedOpponentName = Array.from(opponentNames)[0];
    } else if (opponentNames.size > 1) {
        resolvedOpponentName = 'Opponents';
    }

    return { teamCount, opponentCount, teamTilt, opponentTilt, teamPossession, opponentPossession, resolvedOpponentName };
};

export const extractBDP = async (teamName, selectedMatchIds, loadedMatches, fetchMatchEvents, isTeamMatchFn) => {
    if (!teamName || !selectedMatchIds || selectedMatchIds.length === 0) return [];

    const bdpData = [];

    // Filter helpers
    const SET_PIECE_QUALIFIERS = [5, 6, 107, 124]; // Free kick, corner, throw in, goal kick

    const isQualifyingPass = (e) => {
        if (e.typeId !== 1) return false;
        
        // Check territorial limit (x <= 66.7 in Opta 0-100 attacking space)
        // Opta events are always normalized so x=100 is the opponent's goal.
        // The first 2/3 of the pitch is x <= 66.7
        const x = parseFloat(e.x);
        if (isNaN(x) || x > 66.7) return false;

        // Check for set piece qualifiers
        const qualIds = getQualifiers(e).map(q => q.qualifierId);
        if (SET_PIECE_QUALIFIERS.some(q => qualIds.includes(q))) return false;

        return true;
    };

    // Process each selected match
    for (let matchId of selectedMatchIds) {
        // Resolve match metadata
        let matchMeta = loadedMatches.find(m => String(m.id) === String(matchId));
        if (!matchMeta) continue;

        const isHome = isTeamMatchFn(matchMeta.homeTeam, teamName);
        const opponentName = isHome ? matchMeta.awayTeam : matchMeta.homeTeam;

        // 1. Calculate opponent's MATCH passing stats
        const matchEvents = await fetchMatchEvents(matchId);
        let matchPasses = 0;
        let matchSuccessful = 0;

        if (matchEvents) {
            matchEvents.forEach(e => {
                const eTeamName = e.teamName || (e.contestantId === matchMeta.homeContestantId ? matchMeta.homeTeam : (e.contestantId === matchMeta.awayContestantId ? matchMeta.awayTeam : ''));
                if (isTeamMatchFn(eTeamName, opponentName) && isQualifyingPass(e)) {
                    matchPasses++;
                    if (e.outcome === 1) matchSuccessful++;
                }
            });
        }

        // 2. Calculate opponent's SEASON passing stats
        const opponentMatchIds = loadedMatches
            .filter(m => isTeamMatchFn(m.homeTeam, opponentName) || isTeamMatchFn(m.awayTeam, opponentName))
            .map(m => m.id);

        let seasonPasses = 0;
        let seasonSuccessful = 0;
        const opponentAllMatches = loadedMatches.filter(m => isTeamMatchFn(m.homeTeam, opponentName) || isTeamMatchFn(m.awayTeam, opponentName));
        const fetchPromises = opponentAllMatches.map(m => fetchMatchEvents(m.id));
        const results = await Promise.all(fetchPromises);
        results.forEach((oppEvents, idx) => {
            if (!oppEvents) return;
            const oppMatchMeta = opponentAllMatches[idx];
            oppEvents.forEach(e => {
                const eTeamName = e.teamName || (e.contestantId === oppMatchMeta?.homeContestantId ? oppMatchMeta?.homeTeam : (e.contestantId === oppMatchMeta?.awayContestantId ? oppMatchMeta?.awayTeam : ''));
                if (isTeamMatchFn(eTeamName, opponentName) && isQualifyingPass(e)) {
                    seasonPasses++;
                    if (e.outcome === 1) seasonSuccessful++;
                }
            });
        });

        const opponentMatchAvg = matchPasses > 0 ? (matchSuccessful / matchPasses) * 100 : 0;
        const opponentSeasonAvg = seasonPasses > 0 ? (seasonSuccessful / seasonPasses) * 100 : 0;
        const bdp = opponentSeasonAvg - opponentMatchAvg;

        bdpData.push({
            opponent: opponentName,
            opponentAvg: opponentSeasonAvg,
            opponentMatch: opponentMatchAvg,
            bdp: bdp,
            matchDate: matchMeta.date,
            matchRound: matchMeta.round || '?',
            _originalIndex: loadedMatches.findIndex(m => m.id === matchId)
        });
    }
    
    // The user explicitly requested to ignore all calendar/database orders 
    // and strictly plot by Matchday Round (lowest to highest / left to right).
    bdpData.sort((a, b) => {
        const roundA = parseInt(a.matchRound) || 0;
        const roundB = parseInt(b.matchRound) || 0;
        return roundA - roundB;
    });
    
    return bdpData;
};

let cachedLeagueBdpRankings = null;

export const calculateLeagueBdpStats = async (selectedTeamName, loadedMatches, fetchMatchEvents) => {
    const SET_PIECE_QUALIFIERS = [5, 6, 26, 107, 124, 166];

    const getQualifiers = (event) => {
        if (!event.qualifier) return [];
        return Array.isArray(event.qualifier) ? event.qualifier : [event.qualifier];
    };

    const isTeamMatchFn = (t1, t2) => {
        if (!t1 || !t2) return false;
        const s1 = t1.toLowerCase().replace(' fk', '').replace(' il', '').replace(' sk', '').replace(' bk', '');
        const s2 = t2.toLowerCase().replace(' fk', '').replace(' il', '').replace(' sk', '').replace(' bk', '');
        return s1.includes(s2) || s2.includes(s1) || (s1 === 'bodø/glimt' && s2.includes('bodø'));
    };

    if (!cachedLeagueBdpRankings || cachedLeagueBdpRankings.length === 0) {
        const isQualifyingPass = (e) => {
            if (e.typeId !== 1) return false;
            const x = parseFloat(e.x);
            if (isNaN(x) || x > 66.7) return false;
            const qualIds = getQualifiers(e).map(q => q.qualifierId);
            if (SET_PIECE_QUALIFIERS.some(q => qualIds.includes(q))) return false;
            return true;
        };

        const allTeams = new Set();
        loadedMatches.forEach(m => {
            allTeams.add(m.homeTeam);
            allTeams.add(m.awayTeam);
        });

        const teamSeasonStats = {};
        for (let team of allTeams) {
            teamSeasonStats[team] = { passes: 0, successful: 0 };
        }

        // 1. Single pass to calculate season averages for all teams
        for (let match of loadedMatches) {
            const events = await fetchMatchEvents(match.id);
            if (!events) continue;
            
            events.forEach(e => {
                const eTeamName = e.teamName || (e.contestantId === match.homeContestantId ? match.homeTeam : (e.contestantId === match.awayContestantId ? match.awayTeam : ''));
                if (!eTeamName || !teamSeasonStats[eTeamName]) return;
                
                if (isQualifyingPass(e)) {
                    teamSeasonStats[eTeamName].passes++;
                    if (e.outcome === 1) teamSeasonStats[eTeamName].successful++;
                }
            });
        }

        // 2. Single pass to calculate match BDPs and aggregate them for rankings
        const teamBdpSums = {};
        for (let team of allTeams) {
            teamBdpSums[team] = { sum: 0, count: 0 };
        }

        for (let match of loadedMatches) {
            const events = await fetchMatchEvents(match.id);
            if (!events) continue;

            const matchStats = {
                [match.homeTeam]: { passes: 0, successful: 0 },
                [match.awayTeam]: { passes: 0, successful: 0 }
            };

            events.forEach(e => {
                const eTeamName = e.teamName || (e.contestantId === match.homeContestantId ? match.homeTeam : (e.contestantId === match.awayContestantId ? match.awayTeam : ''));
                if (matchStats[eTeamName] && isQualifyingPass(e)) {
                    matchStats[eTeamName].passes++;
                    if (e.outcome === 1) matchStats[eTeamName].successful++;
                }
            });

            // Home Team BDP
            const awaySeasonAvg = teamSeasonStats[match.awayTeam].passes > 0 ? (teamSeasonStats[match.awayTeam].successful / teamSeasonStats[match.awayTeam].passes) * 100 : 0;
            const awayMatchAvg = matchStats[match.awayTeam].passes > 0 ? (matchStats[match.awayTeam].successful / matchStats[match.awayTeam].passes) * 100 : 0;
            if (teamSeasonStats[match.awayTeam].passes > 0) {
                teamBdpSums[match.homeTeam].sum += (awaySeasonAvg - awayMatchAvg);
                teamBdpSums[match.homeTeam].count++;
            }

            // Away Team BDP
            const homeSeasonAvg = teamSeasonStats[match.homeTeam].passes > 0 ? (teamSeasonStats[match.homeTeam].successful / teamSeasonStats[match.homeTeam].passes) * 100 : 0;
            const homeMatchAvg = matchStats[match.homeTeam].passes > 0 ? (matchStats[match.homeTeam].successful / matchStats[match.homeTeam].passes) * 100 : 0;
            if (teamSeasonStats[match.homeTeam].passes > 0) {
                teamBdpSums[match.awayTeam].sum += (homeSeasonAvg - homeMatchAvg);
                teamBdpSums[match.awayTeam].count++;
            }
        }

        const rankings = Array.from(allTeams).map(team => {
            const avgBdp = teamBdpSums[team].count > 0 ? teamBdpSums[team].sum / teamBdpSums[team].count : 0;
            return { team, avgBdp };
        });

        rankings.sort((a, b) => b.avgBdp - a.avgBdp);
        cachedLeagueBdpRankings = rankings;
    }

    const normalizedSelected = cachedLeagueBdpRankings.map(r => r.team).find(t => isTeamMatchFn(t, selectedTeamName)) || selectedTeamName;
    const selectedTeamRankIndex = cachedLeagueBdpRankings.findIndex(r => r.team === normalizedSelected);
    const selectedTeamAvgBdp = selectedTeamRankIndex !== -1 ? cachedLeagueBdpRankings[selectedTeamRankIndex].avgBdp : 0;

    return {
        totalAvgBdp: selectedTeamAvgBdp,
        leagueRank: selectedTeamRankIndex !== -1 ? selectedTeamRankIndex + 1 : '-',
        totalTeams: cachedLeagueBdpRankings.length,
        rankings: cachedLeagueBdpRankings
    };
};

/**
 * Extracts possession style data (Passes per Possession, Avg Progressive Distance) for a league-wide scatter plot.
 */
export const extractPossessionStyle = (events) => {
    // Group events by match to avoid sequences crossing games
    const matchGroups = {};
    events.forEach(e => {
        const matchId = e.matchId || 'unknown_match';
        if (!matchGroups[matchId]) matchGroups[matchId] = [];
        matchGroups[matchId].push(e);
    });

    const teamStats = {};

    Object.values(matchGroups).forEach(matchEvents => {
        // Sort events chronologically to ensure sequence integrity
        matchEvents.sort((a, b) => {
            const timeA = (a.timeMin || 0) * 60 + (a.timeSec || 0);
            const timeB = (b.timeMin || 0) * 60 + (b.timeSec || 0);
            return timeA - timeB;
        });

        let currentTeam = null;
        let passesInPoss = 0;
        let progInPoss = 0;

        const savePossession = () => {
            if (currentTeam && passesInPoss > 0) {
                if (!teamStats[currentTeam]) {
                    teamStats[currentTeam] = { totalPossessions: 0, totalPasses: 0, totalProgression: 0, totalAttemptedPasses: 0 };
                }
                teamStats[currentTeam].totalPossessions++;
                teamStats[currentTeam].totalPasses += passesInPoss;
                teamStats[currentTeam].totalProgression += progInPoss;
            }
        };

        matchEvents.forEach(e => {
            // Track global attempted passes for accuracy
            if (e.teamName) {
                if (!teamStats[e.teamName]) {
                    teamStats[e.teamName] = { totalPossessions: 0, totalPasses: 0, totalProgression: 0, totalAttemptedPasses: 0 };
                }
                if (e.typeId === 1) {
                    teamStats[e.teamName].totalAttemptedPasses++;
                }
            }

            // Specific event types that END a possession sequence explicitly
            const SEQUENCE_BREAKERS = [
                4,  // Foul
                5,  // Out of play
                12, // Clearance
                13, // Shot - Miss
                14, // Shot - Post
                15, // Shot - Saved
                16, // Shot - Goal
                27  // Stoppage / Interruption
            ];

            // Sequence breaks if the team changes OR if a sequence-breaking event occurs
            if (e.teamName !== currentTeam || SEQUENCE_BREAKERS.includes(e.typeId)) {
                savePossession();
                currentTeam = e.teamName;
                passesInPoss = 0;
                progInPoss = 0;
            }

            if (e.typeId === 1) { // Pass
                // Also check if this pass is a dead-ball restart (Free Kick, Corner, Throw-in, Goal Kick)
                const isDeadBall = getQualifiers(e).some(q => [5, 6, 107, 124].includes(q.qualifierId));
                if (isDeadBall && passesInPoss > 0) {
                    savePossession();
                    currentTeam = e.teamName;
                    passesInPoss = 0;
                    progInPoss = 0;
                }

                if (e.outcome === 1) { // Successful pass
                    passesInPoss++;
                    let startX = parseFloat(e.x) || 0;
                    const endXQual = getQualifiers(e).find(q => q.qualifierId === 140);
                    let destX = endXQual ? parseFloat(endXQual.value) : startX;
                    
                    let progression = (destX - startX) * 1.05;
                    if (progression < 0) progression = 0;
                    
                    progInPoss += progression;
                } else {
                    savePossession();
                    currentTeam = null;
                }
            } else if (e.outcome === 0) {
                savePossession();
                currentTeam = null;
            }
        });
        savePossession(); // End of match
    });

    const result = Object.entries(teamStats).map(([team, stats]) => {
        return {
            team,
            passesPerPossession: stats.totalPossessions > 0 ? (stats.totalPasses / stats.totalPossessions) : 0,
            avgPassProgression: stats.totalPasses > 0 ? (stats.totalProgression / stats.totalPasses) : 0,
            passAccuracy: stats.totalAttemptedPasses > 0 ? (stats.totalPasses / stats.totalAttemptedPasses) * 100 : 0,
            totalPasses: stats.totalPasses,
            totalPossessions: stats.totalPossessions
        };
    });

    // Calculate Rankings
    result.sort((a, b) => b.passesPerPossession - a.passesPerPossession);
    result.forEach((r, i) => r.rankPasses = i + 1);

    result.sort((a, b) => b.avgPassProgression - a.avgPassProgression);
    result.forEach((r, i) => r.rankProgression = i + 1);

    result.sort((a, b) => b.passAccuracy - a.passAccuracy);
    result.forEach((r, i) => r.rankAccuracy = i + 1);

    return result;
};

export const extractTransitionTimes = (events, teamName, isTeamMatchFn = (a, b) => a === b) => {
    if (!events || !Array.isArray(events)) return null;

    const createEmptyBuckets = () => [
        { label: '0-5s', count: 0, goals: 0 },
        { label: '6-10s', count: 0, goals: 0 },
        { label: '11-15s', count: 0, goals: 0 },
        { label: '16-20s', count: 0, goals: 0 },
        { label: '21s+', count: 0, goals: 0 },
        { label: 'Lost Pos.', count: 0, goals: 0, isFailure: true }
    ];

    const result = {
        offensive: {
            all: { shots: createEmptyBuckets(), shotsOnTarget: createEmptyBuckets(), boxEntries: createEmptyBuckets() },
            defensive: { shots: createEmptyBuckets(), shotsOnTarget: createEmptyBuckets(), boxEntries: createEmptyBuckets() },
            middle: { shots: createEmptyBuckets(), shotsOnTarget: createEmptyBuckets(), boxEntries: createEmptyBuckets() },
            attacking: { shots: createEmptyBuckets(), shotsOnTarget: createEmptyBuckets(), boxEntries: createEmptyBuckets() },
            forwardPassesAttempted: 0,
            forwardPassesCompleted: 0
        },
        conceded: {
            all: { shots: createEmptyBuckets(), shotsOnTarget: createEmptyBuckets(), boxEntries: createEmptyBuckets() },
            defensive: { shots: createEmptyBuckets(), shotsOnTarget: createEmptyBuckets(), boxEntries: createEmptyBuckets() },
            middle: { shots: createEmptyBuckets(), shotsOnTarget: createEmptyBuckets(), boxEntries: createEmptyBuckets() },
            attacking: { shots: createEmptyBuckets(), shotsOnTarget: createEmptyBuckets(), boxEntries: createEmptyBuckets() },
            forwardPassesAttempted: 0,
            forwardPassesCompleted: 0
        }
    };

    const matchGroups = {};
    events.forEach(e => {
        const matchId = e.matchId || 'unknown';
        if (!matchGroups[matchId]) matchGroups[matchId] = [];
        matchGroups[matchId].push(e);
    });

    const SHOT_TYPES = [13, 14, 15, 16];
    const SEQUENCE_BREAKERS = [4, 5, 12, 13, 14, 15, 16, 27];

    Object.values(matchGroups).forEach(matchEvents => {
        matchEvents.sort((a, b) => ((a.timeMin || 0) * 60 + (a.timeSec || 0)) - ((b.timeMin || 0) * 60 + (b.timeSec || 0)));

        for (let i = 0; i < matchEvents.length; i++) {
            const e = matchEvents[i];
            const isOurTeam = isTeamMatchFn(e.teamName || e.contestantId, teamName);
            
            const isRecovery = e.typeId === 8 || e.typeId === 49 || (e.typeId === 7 && e.outcome === 1);
            if (!isRecovery) continue;

            const startTime = (e.timeMin || 0) * 60 + (e.timeSec || 0);
            let startX = parseFloat(e.x) || 0;
            
            const context = isOurTeam ? 'offensive' : 'conceded';
            
            const mappedX = isOurTeam ? startX : (100 - startX);
            
            let zone = 'middle';
            if (mappedX <= 33.3) zone = 'defensive';
            else if (mappedX >= 66.6) zone = 'attacking';

            let timeToBoxEntry = null;
            let timeToShot = null;
            let timeToLoss = null;
            let isGoal = false;
            let isShotOnTarget = false;

            for (let j = i + 1; j < matchEvents.length; j++) {
                const nextE = matchEvents[j];
                const currTime = (nextE.timeMin || 0) * 60 + (nextE.timeSec || 0);
                const duration = currTime - startTime;

                const isNextOurTeam = isTeamMatchFn(nextE.teamName || nextE.contestantId, teamName);
                const isStillHolding = isOurTeam ? isNextOurTeam : !isNextOurTeam;

                if (!isStillHolding) {
                    const possessionActions = [1, 3, 7, 8, 13, 14, 15, 16, 41, 49, 52];
                    if (possessionActions.includes(nextE.typeId)) {
                        timeToLoss = duration;
                        break;
                    } else {
                        continue;
                    }
                }

                if (SEQUENCE_BREAKERS.includes(nextE.typeId)) {
                    if (SHOT_TYPES.includes(nextE.typeId)) {
                        timeToShot = duration;
                        if (nextE.typeId === 16) isGoal = true;
                        if (nextE.typeId === 15 || nextE.typeId === 16) isShotOnTarget = true;
                    } else {
                        timeToLoss = duration;
                    }
                    break;
                }

                if (nextE.typeId === 1 && duration <= 20) {
                    const passStartX = parseFloat(nextE.x) || 0;
                    const destX = parseFloat(getQualifiers(nextE).find(q => q.qualifierId === 140)?.value || passStartX);
                    
                    const pStartX = isOurTeam ? passStartX : (100 - passStartX);
                    const pDestX = isOurTeam ? destX : (100 - destX);
                    
                    if (pDestX > pStartX) {
                        result[context].forwardPassesAttempted++;
                        if (nextE.outcome === 1) {
                            result[context].forwardPassesCompleted++;
                        }
                    }

                    if (nextE.outcome === 1) {
                        if (timeToBoxEntry === null) {
                            if (destX >= 83.5) {
                                timeToBoxEntry = duration;
                            }
                        }
                    }
                }
            }

            const processMetric = (metricName, achievedTime, isAchieved) => {
                if (isAchieved) {
                    let bIdx = 4;
                    if (achievedTime <= 5) bIdx = 0;
                    else if (achievedTime <= 10) bIdx = 1;
                    else if (achievedTime <= 15) bIdx = 2;
                    else if (achievedTime <= 20) bIdx = 3;

                    result[context][zone][metricName][bIdx].count++;
                    result[context]['all'][metricName][bIdx].count++;
                    if (isGoal) {
                        result[context][zone][metricName][bIdx].goals++;
                        result[context]['all'][metricName][bIdx].goals++;
                    }
                } else {
                    const durationEnd = timeToLoss !== null ? timeToLoss : timeToShot;
                    if (durationEnd !== null && durationEnd <= 21) {
                        result[context][zone][metricName][5].count++;
                        result[context]['all'][metricName][5].count++;
                    }
                }
            };

            processMetric('shots', timeToShot, timeToShot !== null);
            processMetric('shotsOnTarget', timeToShot, isShotOnTarget);
            processMetric('boxEntries', timeToBoxEntry, timeToBoxEntry !== null);
        }
    });

    return result;
};

export const extractThrowInsFromOpta = (events, selectedTeams = [], isTeamMatchFn = null) => {
    if (!events || !Array.isArray(events)) return [];

    const THROW_IN_QUALIFIER = 107;

    let throwIns = events.filter(e => {
        if (e.typeId !== 1 && e.typeId !== 22) return false; 
        const qualIds = getQualifiers(e).map(q => q.qualifierId);
        return qualIds.includes(THROW_IN_QUALIFIER);
    });

    if (selectedTeams.length > 0 && isTeamMatchFn) {
        throwIns = throwIns.filter(e =>
            selectedTeams.some(t => isTeamMatchFn(e.teamName, t))
        );
    }

    return throwIns.map(e => {
        const startX = parseFloat(e.x) || 0;
        const startY = parseFloat(e.y) || 0;

        const endXQual = getQualifiers(e).find(q => q.qualifierId === 140);
        const endYQual = getQualifiers(e).find(q => q.qualifierId === 141);

        let destX = endXQual ? parseFloat(endXQual.value) : startX;
        let destY = endYQual ? parseFloat(endYQual.value) : startY;

        // Calculate distance in meters (X 105m, Y 68m)
        const dx = (destX - startX) * 1.05;
        const dy = (destY - startY) * 0.68;
        const distMeters = Math.sqrt(dx * dx + dy * dy);

        let type = 'short';
        if (distMeters >= 20.1) type = 'long';
        else if (distMeters >= 12.1) type = 'medium';

        let third = 'middle';
        if (startX < 33.33) third = 'defensive';
        else if (startX >= 66.66) third = 'attacking';

        const side = startY < 50 ? 'top' : 'bottom';

        return {
            id: e.id || Math.random().toString(),
            side,
            third,
            type,
            outcome: e.outcome === 1 ? 'completed' : 'failed',
            startX,
            startY,
            destX,
            destY,
            distMeters
        };
    });
};

export const extractThrowInTargets = (events, teamName, isTeamMatchFn = null) => {
    if (!events || !Array.isArray(events) || !teamName) return { defensive: [], middle: [], attacking: [] };

    const THROW_IN_QUALIFIER = 107;
    const SHOT_TYPES = [13, 14, 15, 16];
    const SEQUENCE_BREAKERS = [4, 5, 12, 13, 14, 15, 16, 27];

    const targets = {}; 

    const isOurTeam = (contestantId) => isTeamMatchFn ? isTeamMatchFn(contestantId, teamName) : contestantId === teamName;

    events.forEach((e, idx) => {
        if ((e.typeId === 1 || e.typeId === 22) && isOurTeam(e.teamName || e.contestantId)) {
            const qualIds = getQualifiers(e).map(q => q.qualifierId);
            if (qualIds.includes(THROW_IN_QUALIFIER)) {
                
                const startX = parseFloat(e.x) || 0;
                let zone = 'middle';
                if (startX < 33.33) zone = 'defensive';
                else if (startX >= 66.66) zone = 'attacking';

                let receiver = null;
                const nextEvent = events.slice(idx + 1).find(next => isOurTeam(next.teamName || next.contestantId));
                if (nextEvent && nextEvent.playerName && nextEvent.playerName !== e.playerName) {
                    receiver = nextEvent.playerName;
                }

                if (receiver) {
                    if (!targets[receiver]) {
                        targets[receiver] = {
                            name: receiver,
                            total: { received: 0, retained10s: 0, shots20s: 0 },
                            defensive: { received: 0, retained10s: 0, shots20s: 0 },
                            middle: { received: 0, retained10s: 0, shots20s: 0 },
                            attacking: { received: 0, retained10s: 0, shots20s: 0 }
                        };
                    }

                    targets[receiver].total.received++;
                    targets[receiver][zone].received++;

                    const baseTime = (e.timeMin || 0) * 60 + (e.timeSec || 0);
                    let retainedAt10s = false; 
                    let shotWithin20s = false;
                    let lastTeamHolding = true; 

                    for (let j = idx + 1; j < events.length; j++) {
                        const nextE = events[j];
                        const currTime = (nextE.timeMin || 0) * 60 + (nextE.timeSec || 0);
                        const duration = currTime - baseTime;

                        if (duration > 20) {
                            if (lastTeamHolding) retainedAt10s = true;
                            break;
                        }

                        const isNextOurTeam = isOurTeam(nextE.teamName || nextE.contestantId);
                        lastTeamHolding = isNextOurTeam;

                        if (duration <= 10 && !isNextOurTeam && !SHOT_TYPES.includes(nextE.typeId)) {
                            break; 
                        }

                        if (duration > 10 && !retainedAt10s) {
                            if (isNextOurTeam) retainedAt10s = true;
                        }

                        if (SEQUENCE_BREAKERS.includes(nextE.typeId)) {
                            if (SHOT_TYPES.includes(nextE.typeId) && isNextOurTeam) {
                                shotWithin20s = true;
                                if (duration <= 10) retainedAt10s = true; 
                            }
                            break; 
                        }
                    }

                    if (retainedAt10s) {
                        targets[receiver].total.retained10s++;
                        targets[receiver][zone].retained10s++;
                    }
                    if (shotWithin20s) {
                        targets[receiver].total.shots20s++;
                        targets[receiver][zone].shots20s++;
                    }
                }
            }
        }
    });

    const formatZone = (zoneKey) => {
        return Object.values(targets)
            .filter(t => t[zoneKey].received > 0)
            .map(t => ({
                name: t.name,
                received: t[zoneKey].received,
                retained10s: t[zoneKey].retained10s,
                shots20s: t[zoneKey].shots20s,
                retentionPct: t[zoneKey].received > 0 ? Math.round((t[zoneKey].retained10s / t[zoneKey].received) * 100) : 0
            }))
            .sort((a, b) => b.received - a.received || b.retentionPct - a.retentionPct)
            .slice(0, 3);
    };

    return {
        defensive: formatZone('defensive'),
        middle: formatZone('middle'),
        attacking: formatZone('attacking')
    };
};

export const extractPassNetworkFromOpta = (events, teamName, isTeamMatchFn = null) => {
    if (!events || !Array.isArray(events) || !teamName) return { nodes: [], links: [] };

    const isOurTeam = (contestantId) => isTeamMatchFn ? isTeamMatchFn(contestantId, teamName) : contestantId === teamName;
    const teamEvents = events.filter(e => isOurTeam(e.teamName || e.contestantId) && e.playerName);

    if (teamEvents.length === 0) return { nodes: [], links: [] };

    const uniqueMatches = new Set();
    teamEvents.forEach(e => {
        if (e.matchId) uniqueMatches.add(e.matchId);
    });
    const numMatches = uniqueMatches.size > 0 ? uniqueMatches.size : 1;

    // 1. Identify Goalkeeper and Outfielders based on touches & GK specific actions
    const playerStats = {};
    const GK_PASS_Q = 72;
    const GOAL_KICK_Q = 124;

    teamEvents.forEach(e => {
        const pName = e.playerName;
        if (!playerStats[pName]) {
            playerStats[pName] = { name: pName, touches: 0, gkScore: 0, passCount: 0 };
        }
        playerStats[pName].touches++;

        if (e.typeId === 1) playerStats[pName].passCount++;

        const qualIds = getQualifiers(e).map(q => q.qualifierId);
        let gkScore = 0;
        if (e.typeId === 10 || e.typeId === 11 || e.typeId === 41) gkScore = 10;
        else if (qualIds.includes(GK_PASS_Q)) gkScore = 5;
        else if (qualIds.includes(GOAL_KICK_Q)) gkScore = 5;
        
        playerStats[pName].gkScore += gkScore;
    });

    const playersArray = Object.values(playerStats);
    
    // Find GK
    let gk = playersArray.sort((a, b) => b.gkScore - a.gkScore)[0];
    if (!gk) return { nodes: [], links: [] };

    // If no GK actions detected, fallback to the player with least passes but high touches, or just normal fallback
    if (gk.gkScore === 0) {
        // Fallback: player with fewest passes among top 11 touches
        const top11 = [...playersArray].sort((a, b) => b.touches - a.touches).slice(0, 11);
        gk = top11.sort((a, b) => a.passCount - b.passCount)[0];
    }

    const outfielders = playersArray
        .filter(p => p.name !== gk.name)
        .sort((a, b) => b.touches - a.touches)
        .slice(0, 10);

    const top11Names = [gk.name, ...outfielders.map(p => p.name)];
    
    // 2. Calculate average positions for these 11 players
    const positions = {};
    top11Names.forEach(name => { positions[name] = { sumX: 0, sumY: 0, count: 0, touches: playerStats[name].touches }; });

    teamEvents.forEach(e => {
        if (top11Names.includes(e.playerName)) {
            let x = parseFloat(e.x) || 0;
            let y = parseFloat(e.y) || 0;
            
            // Assuming the pass network is for Attack phase, we flip if team played Right to Left?
            // Actually, Opta usually normalizes coordinates so attacking is X: 0->100.
            // But if the user selected them as Away team in some setups, we might need to flip.
            // Let's assume standard Opta coordinates where X increases towards opponent goal.
            
            positions[e.playerName].sumX += x;
            positions[e.playerName].sumY += y;
            positions[e.playerName].count++;
        }
    });

    const nodes = top11Names.map(name => {
        const pos = positions[name];
        return {
            id: name,
            name: name,
            x: pos.count > 0 ? pos.sumX / pos.count : 50,
            y: pos.count > 0 ? pos.sumY / pos.count : 50,
            touches: Math.round(pos.touches / numMatches),
            isGk: name === gk.name
        };
    });

    // 3. Calculate Links (Passes between the 11)
    const linkMap = {};
    
    teamEvents.forEach((e, idx) => {
        if (e.typeId === 1 && e.outcome === 1 && top11Names.includes(e.playerName)) {
            // Find receiver
            let receiver = null;
            const nextEvent = teamEvents.slice(idx + 1).find(next => isOurTeam(next.teamName || next.contestantId));
            if (nextEvent && nextEvent.playerName && nextEvent.playerName !== e.playerName) {
                receiver = nextEvent.playerName;
            }

            if (receiver && top11Names.includes(receiver)) {
                // To avoid directional duplicates, sort names alphabetically to create a unique link pair
                const pair = [e.playerName, receiver].sort();
                const key = `${pair[0]}|${pair[1]}`;
                
                if (!linkMap[key]) {
                    linkMap[key] = { source: pair[0], target: pair[1], count: 0 };
                }
                linkMap[key].count++;
            }
        }
    });

    // Filter out weak links relative to the number of matches (min 3 passes per match)
    const links = Object.values(linkMap)
        .map(l => ({ ...l, count: Math.round(l.count / numMatches) }))
        .filter(l => l.count >= 3);

    return { nodes, links };
};

/**
 * Calculates league-wide attacking metrics and normalized Max scores for the Attack Radar Chart.
 * 
 * Metrics:
 * - Goals
 * - Shots
 * - Shots on Target
 * - Passes into Final Third
 * - Passes into Box
 * - Touches in Box
 * - Crosses
 */
export const calculateLeagueAttackMetrics = (allEvents, loadedMatches, isTeamMatchFn, providedMaxValues = null) => {
    if (!allEvents || !loadedMatches) return { leagueData: {}, maxValues: {} };

    // 1. Determine Match counts per team
    const teamMatchIds = {};
    loadedMatches.forEach(m => {
        if (m.homeTeam) {
            if (!teamMatchIds[m.homeTeam]) teamMatchIds[m.homeTeam] = new Set();
            teamMatchIds[m.homeTeam].add(m.id);
        }
        if (m.awayTeam) {
            if (!teamMatchIds[m.awayTeam]) teamMatchIds[m.awayTeam] = new Set();
            teamMatchIds[m.awayTeam].add(m.id);
        }
    });

    // 2. Aggregate raw stats
    const teamStats = {};
    const currentPossessionByMatch = {};
    
    allEvents.forEach(e => {
        // Find team name
        let team = e.teamName;
        if (!team) {
            const matchMeta = loadedMatches.find(m => m.id === e.matchId);
            if (matchMeta) {
                if (matchMeta.homeContestantId === e.contestantId) team = matchMeta.homeTeam;
                else if (matchMeta.awayContestantId === e.contestantId) team = matchMeta.awayTeam;
            }
        }
        
        if (!team) return;

        if (!teamStats[team]) {
            teamStats[team] = {
                goals: 0,
                shots: 0,
                shotsOnTarget: 0,
                passesIntoFinalThird: 0,
                passesIntoBox: 0,
                touchesInBox: 0,
                crosses: 0,
                totalPasses: 0,
                progressiveDistanceSum: 0,
                finalQuarterPasses: 0,
                possessions: 0
            };
        }

        const stats = teamStats[team];
        const typeId = e.typeId;
        const outcome = e.outcome;
        const x = parseFloat(e.x) || 0;
        const y = parseFloat(e.y) || 0;
        const qualIds = getQualifiers(e).map(q => q.qualifierId);

        // Goals
        if (typeId === 16) stats.goals++;
        
        // Shots
        if ([13, 14, 15, 16].includes(typeId)) stats.shots++;
        
        // Shots on Target
        if (typeId === 15 || typeId === 16) stats.shotsOnTarget++;

        // Passes
        if (typeId === 1 && outcome === 1) {
            const endXQual = getQualifiers(e).find(q => q.qualifierId === 140);
            const endYQual = getQualifiers(e).find(q => q.qualifierId === 141);
            const endX = endXQual ? parseFloat(endXQual.value) : x;
            const endY = endYQual ? parseFloat(endYQual.value) : y;
            
            // Passes into Final 1/3 (originated outside, ended inside)
            if (x <= 66.6 && endX > 66.6) stats.passesIntoFinalThird++;
            
            // Passes into Box (originated outside, ended inside)
            if ((x <= 83.5 || y <= 21.1 || y >= 78.9) && 
                (endX > 83.5 && endY > 21.1 && endY < 78.9)) {
                stats.passesIntoBox++;
            }

            // Crosses
            if (qualIds.includes(2)) stats.crosses++;
            
            // Advanced Metrics Logic
            stats.totalPasses++;
            
            // Progressive Distance
            if (endX > x) {
                stats.progressiveDistanceSum += (endX - x);
            }
        }
        
        // Field Tilt Actions (Passes, carries, take-ons, aerials, recoveries starting in final quarter)
        const isAction = outcome === 1 && [1, 3, 43, 8, 49].includes(typeId);
        if (isAction && x >= 75.0) {
            stats.finalQuarterPasses++;
        }
        
        // Possessions (Uninterrupted sequences of passes or carries)
        const isPassOrCarry = (typeId === 1 && outcome === 1) || typeId === 43;
        const matchId = e.matchId;
        
        if (isPassOrCarry) {
            if (currentPossessionByMatch[matchId] !== team) {
                stats.possessions++;
                currentPossessionByMatch[matchId] = team;
            }
        } else {
            // Any other event (failed pass, stoppage, out of bounds) interrupts
            currentPossessionByMatch[matchId] = null;
        }

        // Touches in Box (Any event inside the box by the attacking team)
        if (x > 83.5 && y > 21.1 && y < 78.9) {
            if ([1, 2, 3, 7, 8, 9, 13, 14, 15, 16, 50, 61].includes(typeId)) {
                stats.touchesInBox++;
            }
        }
    });

    // 3. Convert to "Per Match" and "Derived Percentages", and find max values
    const teamPerMatch = {};
    const localMaxValues = {
        goals: 0, shots: 0, shotsOnTarget: 0, passesIntoFinalThird: 0, 
        passesIntoBox: 0, touchesInBox: 0, crosses: 0,
        goalConversion: 0, goalsPer100: 0, verticality: 0, fieldTilt: 0
    };

    // Pre-calculate opponent final quarter passes for Field Tilt
    const opponentF3PassesMap = {};
    for (const team in teamMatchIds) {
        let oppF3Passes = 0;
        const teamMatches = Array.from(teamMatchIds[team]);
        
        teamMatches.forEach(mId => {
            const matchMeta = loadedMatches.find(m => m.id === mId);
            if (matchMeta) {
                const opponent = matchMeta.homeTeam === team ? matchMeta.awayTeam : matchMeta.homeTeam;
                if (opponent && teamStats[opponent]) {
                    oppF3Passes += (teamStats[opponent].finalQuarterPasses / Array.from(teamMatchIds[opponent]).length); // Approx per match
                }
            }
        });
        opponentF3PassesMap[team] = oppF3Passes / teamMatches.length;
    }

    for (const team in teamStats) {
        const matches = teamMatchIds[team] ? teamMatchIds[team].size : 1;
        teamPerMatch[team] = {};
        
        // Base Metrics
        const metrics = ['goals', 'shots', 'shotsOnTarget', 'passesIntoFinalThird', 'passesIntoBox', 'touchesInBox', 'crosses'];
        for (const metric of metrics) {
            const perMatch = teamStats[team][metric] / matches;
            teamPerMatch[team][metric] = perMatch;
            if (perMatch > localMaxValues[metric]) {
                localMaxValues[metric] = perMatch;
            }
        }
        
        // Derived Metrics
        const stats = teamStats[team];
        const goalConversion = stats.shots > 0 ? (stats.goals / stats.shots) * 100 : 0;
        const goalsPer100 = stats.possessions > 0 ? (stats.goals / stats.possessions) * 100 : 0;
        const verticality = stats.totalPasses > 0 ? (stats.progressiveDistanceSum / stats.totalPasses) : 0;
        
        const teamF3PerMatch = stats.finalQuarterPasses / matches;
        const oppF3PerMatch = opponentF3PassesMap[team] || 1; // avoid divide by zero
        const fieldTilt = (teamF3PerMatch / (teamF3PerMatch + oppF3PerMatch)) * 100;

        teamPerMatch[team].goalConversion = goalConversion;
        teamPerMatch[team].goalsPer100 = goalsPer100;
        teamPerMatch[team].verticality = verticality;
        teamPerMatch[team].fieldTilt = fieldTilt;

        if (goalConversion > localMaxValues.goalConversion) localMaxValues.goalConversion = goalConversion;
        if (goalsPer100 > localMaxValues.goalsPer100) localMaxValues.goalsPer100 = goalsPer100;
        if (verticality > localMaxValues.verticality) localMaxValues.verticality = verticality;
        if (fieldTilt > localMaxValues.fieldTilt) localMaxValues.fieldTilt = fieldTilt;
    }

    const finalMaxValues = providedMaxValues || localMaxValues;

    // 4. Calculate Normalized Max Percentages and Ranks
    const leagueData = {};
    const teamNames = Object.keys(teamPerMatch);
    
    for (const metric of Object.keys(finalMaxValues)) {
        // Sort teams by raw value descending
        const sortedTeams = [...teamNames].sort((a, b) => teamPerMatch[b][metric] - teamPerMatch[a][metric]);
        
        sortedTeams.forEach((team, index) => {
            if (!leagueData[team]) {
                leagueData[team] = {
                    raw: teamPerMatch[team],
                    normalized: {},
                    rank: {}
                };
            }
            
            const raw = teamPerMatch[team][metric];
            const max = finalMaxValues[metric] > 0 ? finalMaxValues[metric] : 1;
            leagueData[team].normalized[metric] = (raw / max) * 100;
            leagueData[team].rank[metric] = index + 1;
        });
    }

    // 5. Calculate League Average Pseudo-Team
    const leagueAvgRaw = {};
    const teamCount = teamNames.length;
    
    for (const metric of Object.keys(finalMaxValues)) {
        let sum = 0;
        teamNames.forEach(team => {
            sum += teamPerMatch[team][metric];
        });
        leagueAvgRaw[metric] = sum / (teamCount || 1);
    }
    
    leagueData['League Average'] = {
        raw: leagueAvgRaw,
        normalized: {},
        rank: {}
    };
    
    for (const metric of Object.keys(finalMaxValues)) {
        const raw = leagueAvgRaw[metric];
        const max = finalMaxValues[metric] > 0 ? finalMaxValues[metric] : 1;
        leagueData['League Average'].normalized[metric] = (raw / max) * 100;
        // League average doesn't need a rank
    }

    return { leagueData, maxValues: finalMaxValues, totalTeams: teamCount };
};

export const calculateLeagueDefenceMetrics = (allEvents, loadedMatches, isTeamMatchFn, providedMaxValues = null) => {
    if (!allEvents || !loadedMatches) return { leagueData: {}, maxValues: {} };

    // 1. Determine Match counts per team
    const teamMatchIds = {};
    loadedMatches.forEach(m => {
        if (m.homeTeam) {
            if (!teamMatchIds[m.homeTeam]) teamMatchIds[m.homeTeam] = new Set();
            teamMatchIds[m.homeTeam].add(m.id);
        }
        if (m.awayTeam) {
            if (!teamMatchIds[m.awayTeam]) teamMatchIds[m.awayTeam] = new Set();
            teamMatchIds[m.awayTeam].add(m.id);
        }
    });

    // 2. Aggregate raw stats
    const teamStats = {};
    const ppdaTracker = {};
    let currentTeamPos = null;
    let matchIdPos = null;

    allEvents.forEach(e => {
        let team = e.teamName;
        if (!team) {
            const matchMeta = loadedMatches.find(m => m.id === e.matchId);
            if (matchMeta) {
                if (matchMeta.homeContestantId === e.contestantId) team = matchMeta.homeTeam;
                else if (matchMeta.awayContestantId === e.contestantId) team = matchMeta.awayTeam;
            }
        }
        
        if (!team) return;

        if (!teamStats[team]) {
            teamStats[team] = {
                shotsAllowed: 0, shotsOnTargetAllowed: 0, boxEntriesAllowed: 0, goalsAllowed: 0,
                highRecoveries: 0, defensiveActionsCount: 0, defensiveActionsXSum: 0, defensiveActionsXCoords: [],
                opponentPossessions: 0
            };
            ppdaTracker[team] = { passesAllowed: 0, defensiveActions: 0 };
        }

        const typeId = e.typeId;
        const outcome = e.outcome;
        const x = parseFloat(e.x) || 0;
        const y = parseFloat(e.y) || 0;

        const matchMeta = loadedMatches.find(m => m.id === e.matchId);
        let opponent = null;
        if (matchMeta) {
            const teamIsHome = matchMeta.homeTeam === team || (matchMeta.homeContestantId === e.contestantId);
            opponent = teamIsHome ? matchMeta.awayTeam : matchMeta.homeTeam;
        }

        if (opponent) {
            if (!teamStats[opponent]) {
                teamStats[opponent] = {
                    shotsAllowed: 0, shotsOnTargetAllowed: 0, boxEntriesAllowed: 0, goalsAllowed: 0,
                    highRecoveries: 0, defensiveActionsCount: 0, defensiveActionsXSum: 0, defensiveActionsXCoords: [],
                    opponentPossessions: 0
                };
                ppdaTracker[opponent] = { passesAllowed: 0, defensiveActions: 0 };
            }
            
            const oppStats = teamStats[opponent];
            
            if (typeId === 16) oppStats.goalsAllowed++;
            if ([13, 14, 15, 16].includes(typeId)) oppStats.shotsAllowed++;
            if (typeId === 15 || typeId === 16) oppStats.shotsOnTargetAllowed++;

            if (outcome === 1 && [1, 3, 43].includes(typeId)) {
                let destX = x;
                let destY = y;
                if (e.qualifier) {
                    const qualifiers = Array.isArray(e.qualifier) ? e.qualifier : [e.qualifier];
                    const endXQual = qualifiers.find(q => q.qualifierId === 140 || q.qualifierId === '140');
                    const endYQual = qualifiers.find(q => q.qualifierId === 141 || q.qualifierId === '141');
                    if (endXQual) destX = parseFloat(endXQual.value);
                    if (endYQual) destY = parseFloat(endYQual.value);
                }
                if (x <= 83.5 || y <= 21.1 || y >= 78.9) {
                    if (destX > 83.5 && destY > 21.1 && destY < 78.9) oppStats.boxEntriesAllowed++;
                }
            }

            if (typeId === 1 && outcome === 1 && x > 40) {
                ppdaTracker[opponent].passesAllowed++;
            }
            
        const SEQUENCE_BREAKERS = [4, 5, 12, 13, 14, 15, 16, 27];
        if (e.matchId !== matchIdPos) {
            matchIdPos = e.matchId;
            currentTeamPos = null;
        }
        if (team !== currentTeamPos || SEQUENCE_BREAKERS.includes(typeId)) {
            currentTeamPos = team;
            if (opponent && teamStats[opponent]) {
                teamStats[opponent].opponentPossessions++;
            }
        }
        }

        const isTackle = typeId === 7;
        const isInterception = typeId === 8;
        const isRecovery = typeId === 49;
        const isFoul = typeId === 4;
        
        if (isTackle || isInterception || isRecovery || isFoul) {
            teamStats[team].defensiveActionsCount++;
            teamStats[team].defensiveActionsXSum += x;
            teamStats[team].defensiveActionsXCoords.push(x);
        }

        if (x >= 40 && (isTackle || isInterception || isRecovery || isFoul)) {
            ppdaTracker[team].defensiveActions++;
        }

        if ((isRecovery || isInterception || isTackle) && x >= 50.0) {
            teamStats[team].highRecoveries++;
        }
    });

    // 3. Convert to Per Match
    const teamPerMatch = {};
    const localMaxValues = {
        ppda: 0, defensiveHeight: 0, blockCompactness: 0, highRecoveries: 0,
        shotsAllowed: 0, shotsOnTargetAllowed: 0, boxEntriesAllowed: 0, goalsAllowed: 0
    };

    const metricsToCalculate = ['ppda', 'defensiveHeight', 'blockCompactness', 'highRecoveries', 'shotsAllowed', 'shotsOnTargetAllowed', 'boxEntriesAllowed', 'goalsAllowed', 'goalsAllowedPer100OppPoss', 'boxEntriesPerGoal'];
    
    for (const team in teamStats) {
        const matches = teamMatchIds[team] ? teamMatchIds[team].size : 1;
        teamPerMatch[team] = {};
        const stats = teamStats[team];
        
        teamPerMatch[team].shotsAllowed = stats.shotsAllowed / matches;
        teamPerMatch[team].shotsOnTargetAllowed = stats.shotsOnTargetAllowed / matches;
        teamPerMatch[team].boxEntriesAllowed = stats.boxEntriesAllowed / matches;
        teamPerMatch[team].goalsAllowed = stats.goalsAllowed / matches;
        teamPerMatch[team].highRecoveries = stats.highRecoveries / matches;
        teamPerMatch[team].opponentPossessions = stats.opponentPossessions / matches;
        teamPerMatch[team].goalsAllowedPer100OppPoss = stats.opponentPossessions > 0 ? (stats.goalsAllowed / stats.opponentPossessions) * 100 : 0;
        teamPerMatch[team].boxEntriesPerGoal = stats.goalsAllowed > 0 ? (stats.boxEntriesAllowed / stats.goalsAllowed) : stats.boxEntriesAllowed;

        const pAllowed = ppdaTracker[team] ? ppdaTracker[team].passesAllowed : 0;
        const dActions = ppdaTracker[team] ? ppdaTracker[team].defensiveActions : 0;
        teamPerMatch[team].ppda = dActions > 0 ? (pAllowed / dActions) : pAllowed;

        teamPerMatch[team].defensiveHeight = stats.defensiveActionsCount > 0 ? (stats.defensiveActionsXSum / stats.defensiveActionsCount) : 0;

        let compactness = 0;
        if (stats.defensiveActionsXCoords.length > 0) {
            const avg = stats.defensiveActionsXSum / stats.defensiveActionsCount;
            const variance = stats.defensiveActionsXCoords.reduce((a, b) => a + Math.pow(b - avg, 2), 0) / stats.defensiveActionsXCoords.length;
            const stdDev = Math.sqrt(variance);
            compactness = 2 * stdDev * 1.05;
        }
        teamPerMatch[team].blockCompactness = compactness;

        for (const metric of metricsToCalculate) {
            if (teamPerMatch[team][metric] > localMaxValues[metric]) {
                localMaxValues[metric] = teamPerMatch[team][metric];
            }
        }
    }

    const finalMaxValues = providedMaxValues || localMaxValues;
    const INVERT_METRICS = ['ppda', 'blockCompactness', 'shotsAllowed', 'shotsOnTargetAllowed', 'boxEntriesAllowed', 'goalsAllowed', 'goalsAllowedPer100OppPoss'];

    const localMinValues = {};
    for (const metric of INVERT_METRICS) {
        localMinValues[metric] = Math.min(...Object.values(teamPerMatch).map(t => t[metric]));
    }

    // 4. Calculate Normalized percentages
    const leagueData = {};
    const teamNames = Object.keys(teamPerMatch);
    
    for (const metric of metricsToCalculate) {
        const isReverse = INVERT_METRICS.includes(metric);
        const sortedTeams = [...teamNames].sort((a, b) => {
            if (isReverse) return teamPerMatch[a][metric] - teamPerMatch[b][metric];
            return teamPerMatch[b][metric] - teamPerMatch[a][metric];
        });
        
        sortedTeams.forEach((team, index) => {
            if (!leagueData[team]) {
                leagueData[team] = { raw: teamPerMatch[team], normalized: {}, rank: {} };
            }
            
            const raw = teamPerMatch[team][metric];
            if (isReverse) {
                const max = finalMaxValues[metric] || 1;
                const min = providedMaxValues ? 0 : (localMinValues[metric] || 0);
                const range = max - min;
                leagueData[team].normalized[metric] = range === 0 ? 100 : Math.max(0, Math.min(100, ((max - raw) / range) * 100));
            } else {
                const max = finalMaxValues[metric] > 0 ? finalMaxValues[metric] : 1;
                leagueData[team].normalized[metric] = (raw / max) * 100;
            }
            leagueData[team].rank[metric] = index + 1;
        });
    }

    // 5. League Average pseudo-team
    const leagueAvgRaw = {};
    const teamCount = teamNames.length;
    
    for (const metric of metricsToCalculate) {
        let sum = 0;
        teamNames.forEach(team => { sum += teamPerMatch[team][metric]; });
        leagueAvgRaw[metric] = sum / (teamCount || 1);
    }

    leagueData['League Average'] = { raw: leagueAvgRaw, normalized: {}, rank: {} };

    for (const metric of metricsToCalculate) {
        const isReverse = INVERT_METRICS.includes(metric);
        const raw = leagueAvgRaw[metric];
        
        if (isReverse) {
            const max = finalMaxValues[metric] || 1;
            const min = providedMaxValues ? 0 : (localMinValues[metric] || 0);
            const range = max - min;
            leagueData['League Average'].normalized[metric] = range === 0 ? 100 : Math.max(0, Math.min(100, ((max - raw) / range) * 100));
        } else {
            const max = finalMaxValues[metric] > 0 ? finalMaxValues[metric] : 1;
            leagueData['League Average'].normalized[metric] = (raw / max) * 100;
        }
    }

    return { leagueData, maxValues: finalMaxValues };
};
const calculateDirection = (pass) => {
    if (!pass) return null;
    const startX = parseFloat(pass.x) || 0;
    const startY = parseFloat(pass.y) || 0;
    const endXQual = getQualifiers(pass).find(q => q.qualifierId === 140);
    const endYQual = getQualifiers(pass).find(q => q.qualifierId === 141);
    let destX = endXQual ? parseFloat(endXQual.value) : startX;
    let destY = endYQual ? parseFloat(endYQual.value) : startY;
    const dxMeters = (destX - startX) * 1.05;
    const dyMeters = (destY - startY) * 0.68;
    const angle = Math.abs((Math.atan2(dyMeters, dxMeters) * 180) / Math.PI);
    if (angle > 60 && angle <= 120) return 'horizontal';
    if (angle > 120) return 'backwards';
    return 'forward';
};

export const calculateLeagueTransitionMetrics = (allEvents, loadedMatches, isTeamMatchFn, providedMaxValues = null) => {
    if (!allEvents || !loadedMatches) return { leagueData: {}, maxValues: {} };

    const teams = {};
    const matchesByTeam = {};

    // 1. Determine unique teams and matches
    loadedMatches.forEach(match => {
        const teamsToAdd = [];
        if (match.homeTeam) teamsToAdd.push(match.homeTeam);
        if (match.awayTeam) teamsToAdd.push(match.awayTeam);
        
        teamsToAdd.forEach(teamName => {
            if (!teams[teamName]) {
                teams[teamName] = {
                    matches: 0,
                    fastShots10: 0,
                    fastShots15: 0,
                    fastShots20: 0,
                    fastSOT10: 0,
                    fastSOT15: 0,
                    fastSOT20: 0,
                    fastGoals10: 0,
                    fastGoals15: 0,
                    fastGoals20: 0,
                    fastBoxEntries10: 0,
                    fastBoxEntries15: 0,
                    fastBoxEntries20: 0,
                    totalTransitions: 0,
                    forwardPasses: 0,
                    transitionsToShot: 0,
                    finalThirdRecoveries: 0,
                    defFastShots20: 0,
                    defBoxEntries20: 0,
                    totalConcededTransitions: 0,
                    defForwardPasses: 0
                };
                matchesByTeam[teamName] = [];
            }
            teams[teamName].matches += 1;
            matchesByTeam[teamName].push(match.id);
        });
    });

    const getBucketSum = (buckets, labels) => {
        return buckets.filter(b => labels.includes(b.label)).reduce((sum, b) => sum + b.count, 0);
    };

    const getGoalSum = (buckets, labels) => {
        return buckets.filter(b => labels.includes(b.label)).reduce((sum, b) => sum + (b.goals || 0), 0);
    };

    // 2. Calculate metrics per team
    Object.keys(teams).forEach(team => {
        const teamMatchIds = matchesByTeam[team];
        const teamEvents = allEvents.filter(e => teamMatchIds.includes(e.matchId));

        // Use extractTransitionTimes
        const transitionTimes = extractTransitionTimes(teamEvents, team, isTeamMatchFn);
        if (transitionTimes && transitionTimes.offensive && transitionTimes.offensive.all) {
            const allOff = transitionTimes.offensive.all;
            
            // 10s = '0-5s' + '6-10s'
            // 15s = '0-5s' + '6-10s' + '11-15s'
            // 20s = '0-5s' + '6-10s' + '11-15s' + '16-20s'
            
            const labels10 = ['0-5s', '6-10s'];
            const labels15 = ['0-5s', '6-10s', '11-15s'];
            const labels20 = ['0-5s', '6-10s', '11-15s', '16-20s'];
            
            teams[team].fastShots10 += getBucketSum(allOff.shots, labels10);
            teams[team].fastShots15 += getBucketSum(allOff.shots, labels15);
            teams[team].fastShots20 += getBucketSum(allOff.shots, labels20);
            
            teams[team].fastSOT10 += getBucketSum(allOff.shotsOnTarget, labels10);
            teams[team].fastSOT15 += getBucketSum(allOff.shotsOnTarget, labels15);
            teams[team].fastSOT20 += getBucketSum(allOff.shotsOnTarget, labels20);
            
            teams[team].fastGoals10 += getGoalSum(allOff.shots, labels10);
            teams[team].fastGoals15 += getGoalSum(allOff.shots, labels15);
            teams[team].fastGoals20 += getGoalSum(allOff.shots, labels20);
            
            teams[team].fastBoxEntries10 += getBucketSum(allOff.boxEntries, labels10);
            teams[team].fastBoxEntries15 += getBucketSum(allOff.boxEntries, labels15);
            teams[team].fastBoxEntries20 += getBucketSum(allOff.boxEntries, labels20);
            
            // transitionToShotPct: how many recoveries led to a shot overall?
            // sum of all shot counts / total recoveries
            const totalShots = allOff.shots.reduce((s, b) => s + b.count, 0);
            teams[team].transitionsToShot += totalShots;
            
            // Total recoveries can be derived from all buckets sum (shots + lost pos + others without shots?)
            // Actually, we can count total recoveries directly from events
        }

        // Forward passes in transition
        // extractTransitionsFromOpta returns an array of transitions with passDirection
        const mappedTransitions = extractTransitionsFromOpta(teamEvents, [team], isTeamMatchFn);
        if (mappedTransitions && mappedTransitions.length > 0) {
            teams[team].totalTransitions += mappedTransitions.length;
            teams[team].forwardPasses += mappedTransitions.filter(t => t.passDirection === 'forward').length;
        }

        // Final third recoveries
        const teamActions = teamEvents.filter(e => isTeamMatchFn(e.teamName || e.contestantId, team));
        const finalThirdRecoveries = teamActions.filter(e => {
            const isRecovery = e.typeId === 8 || e.typeId === 49 || (e.typeId === 7 && e.outcome === 1);
            if (!isRecovery) return false;
            const x = parseFloat(e.x) || 0;
            return x >= 66.6;
        });
        teams[team].finalThirdRecoveries += finalThirdRecoveries.length;
        
        if (transitionTimes && transitionTimes.conceded && transitionTimes.conceded.all) {
            const allConc = transitionTimes.conceded.all;
            const labels20 = ['0-5s', '6-10s', '11-15s', '16-20s'];
            
            teams[team].defFastShots20 += getBucketSum(allConc.shots, labels20);
            teams[team].defBoxEntries20 += getBucketSum(allConc.boxEntries, labels20);
        }

        const concededMappedTransitions = extractConcededTransitionsFromOpta(teamEvents, [team], isTeamMatchFn);
        if (concededMappedTransitions && concededMappedTransitions.length > 0) {
            teams[team].totalConcededTransitions += concededMappedTransitions.length;
            teams[team].defForwardPasses += concededMappedTransitions.filter(t => t.passDirection === 'forward').length;
        }
        
        // Count total recoveries for the team to calculate Transition to Shot %
        const allRecoveries = teamActions.filter(e => e.typeId === 8 || e.typeId === 49 || (e.typeId === 7 && e.outcome === 1));
        teams[team].totalRecoveries = allRecoveries.length;
    });

    // 3. Compute per match / averages
    const leagueData = {};
    const maxValues = {
        shots10s: 0, shots15s: 0, shots20s: 0,
        sot10s: 0, sot15s: 0, sot20s: 0,
        goals10s: 0, goals15s: 0, goals20s: 0,
        boxEntries10s: 0, boxEntries15s: 0, boxEntries20s: 0,
        forwardPassPct: 0,
        forwardPassesPerGame: 0,
        transitionsPerGame: 0,
        transitionToShotPct: 0,
        finalThirdRecoveries: 0,
        defShots20s: 0,
        defBoxEntries20s: 0,
        defBoxEntriesPct: 0,
        defForwardPassPct: 0,
        defForwardPassesPerGame: 0
    };

    const leagueTotals = {
        matches: 0,
        shots10s: 0, shots15s: 0, shots20s: 0,
        sot10s: 0, sot15s: 0, sot20s: 0,
        goals10s: 0, goals15s: 0, goals20s: 0,
        boxEntries10s: 0, boxEntries15s: 0, boxEntries20s: 0,
        forwardPassPctSum: 0,
        forwardPassesSum: 0,
        transitionsSum: 0,
        transitionToShotPctSum: 0,
        finalThirdRecoveries: 0,
        defShots20s: 0,
        defBoxEntries20s: 0,
        defBoxEntriesPctSum: 0,
        defForwardPassPctSum: 0,
        defForwardPassesSum: 0,
        teamCount: 0
    };

    Object.keys(teams).forEach(team => {
        const t = teams[team];
        if (t.matches === 0) return;

        const matches = t.matches;

        const raw = {
            shots10s: t.fastShots10 / matches,
            shots15s: t.fastShots15 / matches,
            shots20s: t.fastShots20 / matches,
            sot10s: t.fastSOT10 / matches,
            sot15s: t.fastSOT15 / matches,
            sot20s: t.fastSOT20 / matches,
            goals10s: t.fastGoals10 / matches,
            goals15s: t.fastGoals15 / matches,
            goals20s: t.fastGoals20 / matches,
            boxEntries10s: t.fastBoxEntries10 / matches,
            boxEntries15s: t.fastBoxEntries15 / matches,
            boxEntries20s: t.fastBoxEntries20 / matches,
            forwardPassPct: t.totalTransitions > 0 ? (t.forwardPasses / t.totalTransitions) * 100 : 0,
            forwardPassesPerGame: t.forwardPasses / matches,
            transitionsPerGame: t.totalTransitions / matches,
            transitionToShotPct: t.totalRecoveries > 0 ? (t.transitionsToShot / t.totalRecoveries) * 100 : 0,
            finalThirdRecoveries: t.finalThirdRecoveries / matches,
            defShots20s: t.defFastShots20 / matches,
            defBoxEntries20s: t.defBoxEntries20 / matches,
            defBoxEntriesPct: t.totalConcededTransitions > 0 ? (t.defBoxEntries20 / t.totalConcededTransitions) * 100 : 0,
            defForwardPassPct: t.totalConcededTransitions > 0 ? (t.defForwardPasses / t.totalConcededTransitions) * 100 : 0,
            defForwardPassesPerGame: t.defForwardPasses / matches
        };

        leagueData[team] = { raw, normalized: {}, rank: {} };

        // Update max values
        Object.keys(maxValues).forEach(key => {
            if (raw[key] > maxValues[key]) maxValues[key] = raw[key];
        });

        // Add to league totals
        leagueTotals.matches += matches;
        leagueTotals.shots10s += t.fastShots10;
        leagueTotals.shots15s += t.fastShots15;
        leagueTotals.shots20s += t.fastShots20;
        leagueTotals.sot10s += t.fastSOT10;
        leagueTotals.sot15s += t.fastSOT15;
        leagueTotals.sot20s += t.fastSOT20;
        leagueTotals.goals10s += t.fastGoals10;
        leagueTotals.goals15s += t.fastGoals15;
        leagueTotals.goals20s += t.fastGoals20;
        leagueTotals.boxEntries10s += t.fastBoxEntries10;
        leagueTotals.boxEntries15s += t.fastBoxEntries15;
        leagueTotals.boxEntries20s += t.fastBoxEntries20;
        leagueTotals.forwardPassPctSum += raw.forwardPassPct;
        leagueTotals.forwardPassesSum += t.forwardPasses;
        leagueTotals.transitionsSum += t.totalTransitions;
        leagueTotals.transitionToShotPctSum += raw.transitionToShotPct;
        leagueTotals.finalThirdRecoveries += t.finalThirdRecoveries;
        leagueTotals.defShots20s += t.defFastShots20;
        leagueTotals.defBoxEntries20s += t.defBoxEntries20;
        leagueTotals.defBoxEntriesPctSum += raw.defBoxEntriesPct;
        leagueTotals.defForwardPassPctSum += raw.defForwardPassPct;
        leagueTotals.defForwardPassesSum += t.defForwardPasses;
        leagueTotals.teamCount++;
    });

    const finalMaxValues = providedMaxValues || maxValues;

    // 4. Normalize and rank
    const teamCount = leagueTotals.teamCount;

    if (teamCount > 0) {
        const avgRaw = {
            shots10s: leagueTotals.shots10s / leagueTotals.matches,
            shots15s: leagueTotals.shots15s / leagueTotals.matches,
            shots20s: leagueTotals.shots20s / leagueTotals.matches,
            sot10s: leagueTotals.sot10s / leagueTotals.matches,
            sot15s: leagueTotals.sot15s / leagueTotals.matches,
            sot20s: leagueTotals.sot20s / leagueTotals.matches,
            goals10s: leagueTotals.goals10s / leagueTotals.matches,
            goals15s: leagueTotals.goals15s / leagueTotals.matches,
            goals20s: leagueTotals.goals20s / leagueTotals.matches,
            boxEntries10s: leagueTotals.boxEntries10s / leagueTotals.matches,
            boxEntries15s: leagueTotals.boxEntries15s / leagueTotals.matches,
            boxEntries20s: leagueTotals.boxEntries20s / leagueTotals.matches,
            forwardPassPct: leagueTotals.forwardPassPctSum / teamCount,
            forwardPassesPerGame: leagueTotals.forwardPassesSum / leagueTotals.matches,
            transitionsPerGame: leagueTotals.transitionsSum / leagueTotals.matches,
            transitionToShotPct: leagueTotals.transitionToShotPctSum / teamCount,
            finalThirdRecoveries: leagueTotals.finalThirdRecoveries / leagueTotals.matches,
            defShots20s: leagueTotals.defShots20s / leagueTotals.matches,
            defBoxEntries20s: leagueTotals.defBoxEntries20s / leagueTotals.matches,
            defBoxEntriesPct: leagueTotals.defBoxEntriesPctSum / teamCount,
            defForwardPassPct: leagueTotals.defForwardPassPctSum / teamCount,
            defForwardPassesPerGame: leagueTotals.defForwardPassesSum / leagueTotals.matches
        };

        leagueData['League Average'] = { raw: avgRaw, normalized: {}, rank: {} };

        // Pre-calculate minimum values for inverted (defensive) metrics
        const localMinValues = {};
        const INVERSE_METRICS = ['defShots10s', 'defShots15s', 'defShots20s', 'defSot10s', 'defSot15s', 'defSot20s', 'defGoals10s', 'defGoals15s', 'defGoals20s', 'defBoxEntries10s', 'defBoxEntries15s', 'defBoxEntries20s', 'defBoxEntriesPct', 'defForwardPassPct', 'defForwardPassesPerGame', 'defFirstThirdLosses', 'defForwardPassCompPct', 'defTransitionToShotPct'];
        
        INVERSE_METRICS.forEach(metric => {
            const allValues = Object.values(leagueData)
                .filter(teamData => teamData.raw && teamData.raw[metric] !== undefined)
                .map(t => t.raw[metric]);
            if (allValues.length > 0) {
                localMinValues[metric] = Math.min(...allValues);
            }
        });

        [...Object.keys(leagueData)].forEach(team => {
            const raw = leagueData[team].raw;
            const normalized = {};
            
            Object.keys(raw).forEach(key => {
                const max = finalMaxValues[key] > 0 ? finalMaxValues[key] : 1;
                
                if (key.startsWith('def') || INVERSE_METRICS.includes(key)) {
                    const min = localMinValues[key] !== undefined ? localMinValues[key] : 0;
                    // For inverted metrics, lower is better. Max raw gets 0%, min raw gets 100%
                    // If max === min, score is 100% (everyone is equal, assume best)
                    if (max === min) {
                        normalized[key] = 100;
                    } else {
                        normalized[key] = Math.max(0, Math.min(100, ((max - raw[key]) / (max - min)) * 100));
                    }
                } else {
                    let val = (raw[key] / max) * 100;
                    normalized[key] = Math.min(100, Math.max(0, val));
                }
            });

            leagueData[team].normalized = normalized;
        });

        // Calculate Ranks
        Object.keys(leagueData).forEach(team => {
            if (team === 'League Average') return;
            const teamRaw = leagueData[team].raw;
            const rank = {};

            Object.keys(teamRaw).forEach(key => {
                let r = 1;
                const isDefensive = key.startsWith('def');
                Object.keys(leagueData).forEach(otherTeam => {
                    if (otherTeam === 'League Average' || otherTeam === team) return;
                    if (isDefensive) {
                        if (leagueData[otherTeam].raw[key] < teamRaw[key]) r++;
                    } else {
                        if (leagueData[otherTeam].raw[key] > teamRaw[key]) r++;
                    }
                });
                rank[key] = r;
            });
            leagueData[team].rank = rank;
        });
    }

    return { leagueData, maxValues: finalMaxValues, totalTeams: teamCount };
};

export const calculateLeagueChanceCreationStats = (events, loadedMatches, isTeamMatchFn) => {
    // 1. Group events by match
    const matchGroups = {};
    events.forEach(e => {
        const matchId = e.matchId || 'unknown';
        if (!matchGroups[matchId]) matchGroups[matchId] = [];
        matchGroups[matchId].push(e);
    });

    const teams = {
        created: {},
        conceded: {}
    };

    Object.values(matchGroups).forEach(matchEvents => {
        matchEvents.sort((a, b) => ((a.timeMin || 0) * 60 + (a.timeSec || 0)) - ((b.timeMin || 0) * 60 + (b.timeSec || 0)));

        const matchMeta = loadedMatches.find(m => m.id === matchEvents[0].matchId);

        // Map teamNames if missing
        matchEvents.forEach(e => {
            if (!e.teamName && matchMeta) {
                if (matchMeta.homeContestantId === e.contestantId) e.teamName = matchMeta.homeTeam;
                else if (matchMeta.awayContestantId === e.contestantId) e.teamName = matchMeta.awayTeam;
            }
        });

        // Get unique teams in this match
        const matchTeams = [...new Set(matchEvents.map(e => e.teamName).filter(Boolean))];
        
        const opponentMap = {};
        if (matchMeta && matchMeta.homeTeam && matchMeta.awayTeam) {
            opponentMap[matchMeta.homeTeam] = matchMeta.awayTeam;
            opponentMap[matchMeta.awayTeam] = matchMeta.homeTeam;
        } else if (matchTeams.length === 2) {
            opponentMap[matchTeams[0]] = matchTeams[1];
            opponentMap[matchTeams[1]] = matchTeams[0];
        }

        matchTeams.forEach(teamName => {
            if (!teams.created[teamName]) {
                teams.created[teamName] = {
                    shots: { setPiece: 0, counter: 0, cross: 0, openPlay: 0, total: 0 },
                    shotsOnTarget: { setPiece: 0, counter: 0, cross: 0, openPlay: 0, total: 0 },
                    goals: { setPiece: 0, counter: 0, cross: 0, openPlay: 0, total: 0 }
                };
            }
            
            const opponentName = opponentMap[teamName];
            if (opponentName && !teams.conceded[opponentName]) {
                teams.conceded[opponentName] = {
                    shots: { setPiece: 0, counter: 0, cross: 0, openPlay: 0, total: 0 },
                    shotsOnTarget: { setPiece: 0, counter: 0, cross: 0, openPlay: 0, total: 0 },
                    goals: { setPiece: 0, counter: 0, cross: 0, openPlay: 0, total: 0 }
                };
            }

            const teamShots = matchEvents.filter(e => 
                [13, 14, 15, 16].includes(e.typeId) && isTeamMatchFn(e.teamName, teamName)
            );

            // Find all counter attack shots (shots within 20s of a recovery)
            const counterShotIds = new Set();
            // Find all cross assisted shots (shots within 5s of a cross)
            const crossShotIds = new Set();
            
            for (let i = 0; i < matchEvents.length; i++) {
                const e = matchEvents[i];
                if (!isTeamMatchFn(e.teamName, teamName)) continue;
                
                const isRecovery = e.typeId === 8 || e.typeId === 49 || (e.typeId === 7 && e.outcome === 1);
                
                const qualIds = e.qualifier ? e.qualifier.map(q => q.qualifierId) : [];
                const isCross = e.typeId === 1 && qualIds.includes(2);
                
                if (!isRecovery && !isCross) continue;

                const startTime = (e.timeMin || 0) * 60 + (e.timeSec || 0);

                for (let j = i + 1; j < matchEvents.length; j++) {
                    const nextE = matchEvents[j];
                    const currTime = (nextE.timeMin || 0) * 60 + (nextE.timeSec || 0);
                    const duration = currTime - startTime;

                    if (isRecovery && duration > 20) {
                        // Keep checking for cross
                        if (!isCross) break;
                    }
                    if (isCross && duration > 5) {
                        // Past 5s window for cross
                        if (!isRecovery) break; 
                    }
                    if (duration > 20) break;

                    if (!isTeamMatchFn(nextE.teamName, teamName)) {
                        break; // Opponent touched the ball
                    }

                    if ([13, 14, 15, 16].includes(nextE.typeId)) {
                        if (isRecovery && duration <= 20) counterShotIds.add(nextE.id);
                        if (isCross && duration <= 5) crossShotIds.add(nextE.id);
                    }
                }
            }

            teamShots.forEach(shot => {
                const isGoal = shot.typeId === 16;
                const isSoT = shot.typeId === 15 || shot.typeId === 16;
                
                const qualIds = shot.qualifier ? shot.qualifier.map(q => q.qualifierId) : [];
                // Set Piece Qualifiers: 24 (Set Piece), 25 (Corner), 26 (Free Kick), 9 (Penalty), 5 (Free kick), 6 (Corner)
                const isSetPiece = qualIds.some(id => [9, 24, 25, 26, 5, 6].includes(id));
                const isCounter = counterShotIds.has(shot.id);
                const isCrossAssist = crossShotIds.has(shot.id);

                let category = 'openPlay';
                if (isSetPiece) category = 'setPiece';
                else if (isCounter) category = 'counter';
                else if (isCrossAssist) category = 'cross';

                teams.created[teamName].shots[category]++;
                teams.created[teamName].shots.total++;
                if (opponentName) {
                    teams.conceded[opponentName].shots[category]++;
                    teams.conceded[opponentName].shots.total++;
                }
                
                if (isSoT) {
                    teams.created[teamName].shotsOnTarget[category]++;
                    teams.created[teamName].shotsOnTarget.total++;
                    if (opponentName) {
                        teams.conceded[opponentName].shotsOnTarget[category]++;
                        teams.conceded[opponentName].shotsOnTarget.total++;
                    }
                }
                
                if (isGoal) {
                    teams.created[teamName].goals[category]++;
                    teams.created[teamName].goals.total++;
                    if (opponentName) {
                        teams.conceded[opponentName].goals[category]++;
                        teams.conceded[opponentName].goals.total++;
                    }
                }
            });
        });
    });

    return teams;
};

export const calculateLeagueDefensiveHeightWorker = (allEvts) => {
    let sumX = 0;
    let sumX2 = 0;
    let count = 0;

    const actions = extractDefensiveActionsFromOpta(allEvts);
    actions.forEach(a => {
        sumX += a.x;
        sumX2 += a.x * a.x;
        count++;
    });
    
    if (count > 0) {
        const avg = sumX / count;
        const variance = (sumX2 / count) - (avg * avg);
        const stdDev = Math.sqrt(variance);
        return {
            avg,
            stdDev,
            minBlock: Math.max(0, avg - stdDev),
            maxBlock: Math.min(100, avg + stdDev)
        };
    } else {
        return { avg: 0, stdDev: 0, minBlock: 0, maxBlock: 0 };
    }
};

export const calculateLeagueBdpStatsWorker = (allEvts, loadedMatches, isTeamMatchFn) => {
    const SET_PIECE_QUALIFIERS = [5, 6, 26, 107, 124, 166];

    const getQualifiers = (event) => {
        if (!event.qualifier) return [];
        return Array.isArray(event.qualifier) ? event.qualifier : [event.qualifier];
    };

    const isQualifyingPass = (e) => {
        if (e.typeId !== 1) return false;
        const x = parseFloat(e.x);
        if (isNaN(x) || x > 66.7) return false;
        const qualIds = getQualifiers(e).map(q => q.qualifierId);
        if (SET_PIECE_QUALIFIERS.some(q => qualIds.includes(q))) return false;
        return true;
    };

    const allTeams = new Set();
    loadedMatches.forEach(m => {
        allTeams.add(m.homeTeam);
        allTeams.add(m.awayTeam);
    });

    const teamSeasonStats = {};
    for (let team of allTeams) {
        teamSeasonStats[team] = { passes: 0, successful: 0 };
    }

    // 1. Calculate season averages for all teams
    allEvts.forEach(e => {
        if (!e.matchId) return;
        const match = loadedMatches.find(m => m.id === e.matchId);
        if (!match) return;
        
        const eTeamName = e.teamName || (e.contestantId === match.homeContestantId ? match.homeTeam : (e.contestantId === match.awayContestantId ? match.awayTeam : ''));
        if (!eTeamName || !teamSeasonStats[eTeamName]) return;
        
        if (isQualifyingPass(e)) {
            teamSeasonStats[eTeamName].passes++;
            if (e.outcome === 1) teamSeasonStats[eTeamName].successful++;
        }
    });

    // 2. Aggregate BDPs
    const teamBdpSums = {};
    for (let team of allTeams) {
        teamBdpSums[team] = { sum: 0, count: 0 };
    }

    const matchGroups = {};
    allEvts.forEach(e => {
        if (!e.matchId) return;
        if (!matchGroups[e.matchId]) matchGroups[e.matchId] = [];
        matchGroups[e.matchId].push(e);
    });

    for (let match of loadedMatches) {
        const events = matchGroups[match.id];
        if (!events) continue;

        const matchStats = {
            [match.homeTeam]: { passes: 0, successful: 0 },
            [match.awayTeam]: { passes: 0, successful: 0 }
        };

        events.forEach(e => {
            const eTeamName = e.teamName || (e.contestantId === match.homeContestantId ? match.homeTeam : (e.contestantId === match.awayContestantId ? match.awayTeam : ''));
            if (matchStats[eTeamName] && isQualifyingPass(e)) {
                matchStats[eTeamName].passes++;
                if (e.outcome === 1) matchStats[eTeamName].successful++;
            }
        });

        // Home Team BDP
        const awaySeasonAvg = teamSeasonStats[match.awayTeam].passes > 0 ? (teamSeasonStats[match.awayTeam].successful / teamSeasonStats[match.awayTeam].passes) * 100 : 0;
        const awayMatchAvg = matchStats[match.awayTeam].passes > 0 ? (matchStats[match.awayTeam].successful / matchStats[match.awayTeam].passes) * 100 : 0;
        if (teamSeasonStats[match.awayTeam].passes > 0) {
            teamBdpSums[match.homeTeam].sum += (awaySeasonAvg - awayMatchAvg);
            teamBdpSums[match.homeTeam].count++;
        }

        // Away Team BDP
        const homeSeasonAvg = teamSeasonStats[match.homeTeam].passes > 0 ? (teamSeasonStats[match.homeTeam].successful / teamSeasonStats[match.homeTeam].passes) * 100 : 0;
        const homeMatchAvg = matchStats[match.homeTeam].passes > 0 ? (matchStats[match.homeTeam].successful / matchStats[match.homeTeam].passes) * 100 : 0;
        if (teamSeasonStats[match.homeTeam].passes > 0) {
            teamBdpSums[match.awayTeam].sum += (homeSeasonAvg - homeMatchAvg);
            teamBdpSums[match.awayTeam].count++;
        }
    }

    const rankings = Array.from(allTeams).map(team => {
        const avgBdp = teamBdpSums[team].count > 0 ? teamBdpSums[team].sum / teamBdpSums[team].count : 0;
        return { team, avgBdp };
    });

    rankings.sort((a, b) => b.avgBdp - a.avgBdp);
    return rankings;
};

export const calculateLeagueSetPieceTable = (allEvents, loadedMatches, isTeamMatchFn) => {
    const matchResults = {}; 
    loadedMatches.forEach(m => {
        if (m.competition === 'Eliteserien') {
            matchResults[m.id] = {
                id: m.id,
                homeTeam: m.homeTeam,
                awayTeam: m.awayTeam,
                homeGoals: { corner: 0, freeKick: 0, throwIn: 0, penalty: 0 },
                awayGoals: { corner: 0, freeKick: 0, throwIn: 0, penalty: 0 }
            };
        }
    });

    const eventsByMatch = {};
    allEvents.forEach(e => {
        if (matchResults[e.matchId]) {
            if (!eventsByMatch[e.matchId]) eventsByMatch[e.matchId] = [];
            eventsByMatch[e.matchId].push(e);
        }
    });

    const STOP_PLAY_TYPES = [2, 4, 5, 6, 30]; 
    const getQualifiers = (e) => e.qualifier ? (Array.isArray(e.qualifier) ? e.qualifier : [e.qualifier]) : [];

    Object.keys(eventsByMatch).forEach(matchId => {
        const events = eventsByMatch[matchId];
        events.sort((a, b) => ((a.timeMin||0)*60+(a.timeSec||0)) - ((b.timeMin||0)*60+(b.timeSec||0)));

        const match = matchResults[matchId];
        const processedGoals = new Set(); 

        for (let i = 0; i < events.length; i++) {
            const e = events[i];
            const typeId = e.typeId;
            const qualIds = getQualifiers(e).map(q => q.qualifierId);
            
            // 1. Direct Set Piece Goals
            if (typeId === 16 && !processedGoals.has(e.id)) {
                let spType = null;
                if (qualIds.includes(9)) spType = 'penalty';
                else if (qualIds.includes(6) || qualIds.includes(25)) spType = 'corner';
                else if (qualIds.includes(5) || qualIds.includes(26) || qualIds.includes(24) || qualIds.includes(112)) spType = 'freeKick';
                else if (qualIds.includes(107)) spType = 'throwIn';

                if (spType) {
                    const goalTeamId = e.contestantId || e.teamName;
                    const goalTeamName = isTeamMatchFn(goalTeamId, match.homeTeam) ? match.homeTeam : match.awayTeam;
                    
                    const isOwnGoal = qualIds.includes(28);
                    let scoringTeam = goalTeamName;
                    if (isOwnGoal) scoringTeam = goalTeamName === match.homeTeam ? match.awayTeam : match.homeTeam;

                    if (scoringTeam === match.homeTeam) match.homeGoals[spType]++;
                    else match.awayGoals[spType]++;
                    
                    processedGoals.add(e.id);
                    continue;
                }
            }

            // 2. Secondary Phase Windows
            let isSetPiece = false;
            let windowSize = 0;
            let spType = null;

            if (typeId === 1 && qualIds.includes(6)) {
                isSetPiece = true; windowSize = 15; spType = 'corner';
            } else if ((typeId === 1 || [13,14,15].includes(typeId)) && (qualIds.includes(5) || qualIds.includes(26))) {
                isSetPiece = true; windowSize = 15; spType = 'freeKick';
            } else if (typeId === 1 && qualIds.includes(107)) {
                isSetPiece = true; windowSize = 15; spType = 'throwIn';
            } else if ([13,14,15].includes(typeId) && qualIds.includes(9)) {
                isSetPiece = true; windowSize = 3; spType = 'penalty';
            }

            if (isSetPiece) {
                const startTime = (e.timeMin || 0) * 60 + (e.timeSec || 0);
                const spTeamId = e.contestantId || e.teamName;
                const spTeamName = isTeamMatchFn(spTeamId, match.homeTeam) ? match.homeTeam : match.awayTeam;

                for (let j = i + 1; j < events.length; j++) {
                    const nextE = events[j];
                    const currTime = (nextE.timeMin || 0) * 60 + (nextE.timeSec || 0);
                    if (currTime - startTime > windowSize) break;
                    // Removed STOP_PLAY_TYPES interruption to prevent Opta noise from discarding scramble goals

                    if (nextE.typeId === 16 && !processedGoals.has(nextE.id)) {
                        const goalTeamId = nextE.contestantId || nextE.teamName;
                        const goalTeamName = isTeamMatchFn(goalTeamId, match.homeTeam) ? match.homeTeam : match.awayTeam;
                        const goalQuals = getQualifiers(nextE).map(q => q.qualifierId);
                        const isOwnGoal = goalQuals.includes(28);

                        let scoringTeam = goalTeamName;
                        if (isOwnGoal) {
                            scoringTeam = goalTeamName === match.homeTeam ? match.awayTeam : match.homeTeam;
                        }
                        
                        if (scoringTeam === spTeamName) {
                            if (scoringTeam === match.homeTeam) match.homeGoals[spType]++;
                            else match.awayGoals[spType]++;
                            processedGoals.add(nextE.id);
                        }
                        break; 
                    }
                }
            }
        }
    });

    return Object.values(matchResults);
};


export const calculateLeagueTopPerformers = (events) => {
    const players = {}; 
    
    events.forEach(e => {
        const pId = e.playerId || e.playerName;
        if (!pId) return; 

        if (!players[pId]) {
            players[pId] = {
                id: pId,
                name: e.playerName || `Player ${pId}`,
                team: e.teamName || 'Unknown',
                goals: 0,
                assists: 0,
                saves: 0,
                recoveries: 0,
                matchIds: new Set()
            };
        }

        const p = players[pId];
        if (e.matchId) p.matchIds.add(e.matchId);

        if (p.team === 'Unknown' && e.teamName) {
            p.team = e.teamName;
        }

        const typeId = e.typeId;
        const qualArray = e.qualifier ? (Array.isArray(e.qualifier) ? e.qualifier : [e.qualifier]) : [];
        const qualIds = qualArray.map(q => q.qualifierId);

        // 1. Goals
        if (typeId === 16) {
            p.goals++;
        }

        // 2. Assists
        const assistQual = qualArray.find(q => q.qualifierId === 210);
        if (e.assist == 1 || (assistQual && assistQual.value == 16)) {
            p.assists++;
        }

        // 3. Saves
        if (typeId === 10) {
            p.saves++;
        }

        // 4. Recoveries
        if (typeId === 49 || typeId === 8 || (typeId === 7 && e.outcome === 1)) {
            p.recoveries++;
        }
    });

    const playerList = Object.values(players).map(p => ({
        ...p,
        matchesPlayed: p.matchIds.size,
        savesPerGame: p.matchIds.size > 0 ? (p.saves / p.matchIds.size) : 0,
        recoveriesPerGame: p.matchIds.size > 0 ? (p.recoveries / p.matchIds.size) : 0
    }));

    const sortAndTop5 = (arr, valKey) => {
        return arr.sort((a, b) => b[valKey] - a[valKey])
                  .slice(0, 5)
                  .map(p => ({
                      name: p.name,
                      team: p.team,
                      value: valKey.includes('PerGame') ? p[valKey].toFixed(1) : p[valKey]
                  }));
    };

    return {
        goals: sortAndTop5([...playerList].filter(p => p.goals > 0), 'goals'),
        assists: sortAndTop5([...playerList].filter(p => p.assists > 0), 'assists'),
        saves: sortAndTop5([...playerList].filter(p => p.saves > 0), 'savesPerGame'),
        recoveries: sortAndTop5([...playerList], 'recoveriesPerGame')
    };
};

export const calculateLeagueStandingsFromEvents = (events, matches) => {
    const standingsMap = {};
    matches.forEach(m => {
        if (m.competition === 'Eliteserien') {
            if (!standingsMap[m.homeTeam]) standingsMap[m.homeTeam] = { team: m.homeTeam, p: 0, w: 0, d: 0, l: 0, gf: 0, ga: 0, gd: 0, pts: 0 };
            if (!standingsMap[m.awayTeam]) standingsMap[m.awayTeam] = { team: m.awayTeam, p: 0, w: 0, d: 0, l: 0, gf: 0, ga: 0, gd: 0, pts: 0 };
        }
    });

    const matchGoals = {};
    events.forEach(e => {
        if (e.typeId === 16 && e.matchId) { 
            const isOwnGoal = getQualifiers(e).some(q => q.qualifierId === 28);
            if (!matchGoals[e.matchId]) matchGoals[e.matchId] = { homeScore: 0, awayScore: 0 };
            
            if (e.teamName === e.homeTeam) {
                if (isOwnGoal) matchGoals[e.matchId].awayScore++;
                else matchGoals[e.matchId].homeScore++;
            } else if (e.teamName === e.awayTeam) {
                if (isOwnGoal) matchGoals[e.matchId].homeScore++;
                else matchGoals[e.matchId].awayScore++;
            }
        }
    });

    const processedMatches = new Set(events.map(e => e.matchId).filter(Boolean));
    
    matches.forEach(m => {
        if (m.competition === 'Eliteserien' && processedMatches.has(m.id)) {
            const mg = matchGoals[m.id] || { homeScore: 0, awayScore: 0 };
            const homeT = standingsMap[m.homeTeam];
            const awayT = standingsMap[m.awayTeam];
            
            if (homeT && awayT) {
                homeT.p++; awayT.p++;
                homeT.gf += mg.homeScore; awayT.gf += mg.awayScore;
                homeT.ga += mg.awayScore; awayT.ga += mg.homeScore;
                homeT.gd += (mg.homeScore - mg.awayScore);
                awayT.gd += (mg.awayScore - mg.homeScore);
                
                if (mg.homeScore > mg.awayScore) { homeT.w++; homeT.pts += 3; awayT.l++; }
                else if (mg.homeScore < mg.awayScore) { awayT.w++; awayT.pts += 3; homeT.l++; }
                else { homeT.d++; awayT.d++; homeT.pts += 1; awayT.pts += 1; }
            }
        }
    });

    const standingsArr = Object.values(standingsMap).sort((a, b) => {
        if (b.pts !== a.pts) return b.pts - a.pts;
        if (b.gd !== a.gd) return b.gd - a.gd;
        return b.gf - a.gf;
    });

    standingsArr.forEach((t, i) => t.pos = i + 1);
    return standingsArr;
};

