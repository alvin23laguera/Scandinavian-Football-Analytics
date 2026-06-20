export const calculateLeagueTransitionMetrics = (allEvents, loadedMatches, isTeamMatchFn, providedMaxValues = null) => {
    if (!allEvents || !loadedMatches) return { leagueData: {}, maxValues: {} };

    const teams = {};
    const matchesByTeam = {};

    // 1. Determine unique teams and matches
    loadedMatches.forEach(match => {
        const contestantIds = Object.keys(match.contestants || {});
        contestantIds.forEach(teamId => {
            const teamName = match.contestants[teamId].name;
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
                    finalThirdRecoveries: 0
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
        transitionToShotPct: 0,
        finalThirdRecoveries: 0
    };

    const leagueTotals = {
        matches: 0,
        shots10s: 0, shots15s: 0, shots20s: 0,
        sot10s: 0, sot15s: 0, sot20s: 0,
        goals10s: 0, goals15s: 0, goals20s: 0,
        boxEntries10s: 0, boxEntries15s: 0, boxEntries20s: 0,
        forwardPassPctSum: 0,
        transitionToShotPctSum: 0,
        finalThirdRecoveries: 0,
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
            transitionToShotPct: t.totalRecoveries > 0 ? (t.transitionsToShot / t.totalRecoveries) * 100 : 0,
            finalThirdRecoveries: t.finalThirdRecoveries / matches
        };

        leagueData[team] = { raw, normalized: {}, rank: {} };

        // Update max values
        Object.keys(raw).forEach(key => {
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
        leagueTotals.transitionToShotPctSum += raw.transitionToShotPct;
        leagueTotals.finalThirdRecoveries += t.finalThirdRecoveries;
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
            transitionToShotPct: leagueTotals.transitionToShotPctSum / teamCount,
            finalThirdRecoveries: leagueTotals.finalThirdRecoveries / leagueTotals.matches
        };

        leagueData['League Average'] = { raw: avgRaw, normalized: {}, rank: {} };

        [...Object.keys(leagueData)].forEach(team => {
            const raw = leagueData[team].raw;
            const normalized = {};
            
            Object.keys(raw).forEach(key => {
                const max = finalMaxValues[key] > 0 ? finalMaxValues[key] : 1;
                let val = (raw[key] / max) * 100;
                normalized[key] = Math.min(100, Math.max(0, val));
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
                Object.keys(leagueData).forEach(otherTeam => {
                    if (otherTeam === 'League Average' || otherTeam === team) return;
                    if (leagueData[otherTeam].raw[key] > teamRaw[key]) r++;
                });
                rank[key] = r;
            });
            leagueData[team].rank = rank;
        });
    }

    return { leagueData, maxValues: finalMaxValues, totalTeams: teamCount };
};
