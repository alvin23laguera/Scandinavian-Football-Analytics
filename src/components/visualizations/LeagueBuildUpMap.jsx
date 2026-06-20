import React, { useState, useMemo } from 'react';

const PITCH_L = 105;
const PITCH_W = 68;

const COLS = 6;
const ROWS = 3;
const ZONE_W = PITCH_L / COLS;
const ZONE_H = PITCH_W / ROWS;

const TYPE_LABELS = {
    goalKick: 'Goal Kick',
    freekick: 'Free Kick',
    gkPass:   'GK Pass',
};

// Ensure names are properly normalized if needed, but getBadge usually handles it
const normalizeTeam = (name) => {
    if (!name) return 'Unknown';
    if (name.includes('Troms')) return 'Tromsø';
    if (name.includes('Bod')) return 'Bodø/Glimt';
    if (name.includes('Vålerenga')) return 'Vålerenga';
    if (name.includes('Lillestr')) return 'Lillestrøm';
    return name;
};

const LeagueBuildUpMap = ({ passes, getBadge }) => {
    const [metricMode, setMetricMode] = useState('total'); // 'total' or 'percentage'
    const filteredPasses = passes || [];

    const { dominantTeams, maxMetricValue } = useMemo(() => {
        const teamTotalPasses = {};
        filteredPasses.forEach(p => {
            const team = normalizeTeam(p.team);
            teamTotalPasses[team] = (teamTotalPasses[team] || 0) + 1;
        });

        // For each zone (0 to 17), we track { [teamName]: { total, completed } }
        const zoneData = Array.from({ length: COLS * ROWS }, () => ({}));
        
        filteredPasses.forEach(p => {
            if (isNaN(p.x) || isNaN(p.y)) return; // Skip if invalid coordinates
            const col = Math.min(Math.max(Math.floor((p.x / 100) * COLS), 0), COLS - 1);
            const row = Math.min(Math.max(Math.floor((p.y / 100) * ROWS), 0), ROWS - 1);
            const idx = row * COLS + col;
            
            const team = normalizeTeam(p.team);
            if (!zoneData[idx][team]) {
                zoneData[idx][team] = { total: 0, completed: 0 };
            }
            zoneData[idx][team].total += 1;
            if (p.completed) zoneData[idx][team].completed += 1;
        });

        let maxVal = 0;

        // Determine the "winner" for each zone based on the metric mode
        const domTeams = zoneData.map(zoneTeamCounts => {
            if (Object.keys(zoneTeamCounts).length === 0) return null;

            let bestTeam = null;
            let bestValue = -1;
            let bestTiebreaker = -1;

            for (const [team, stats] of Object.entries(zoneTeamCounts)) {
                const teamTotal = teamTotalPasses[team] || 1;
                const count = stats.total;
                const percentage = (count / teamTotal) * 100;

                const primaryValue = metricMode === 'total' ? count : percentage;
                const tiebreakerValue = metricMode === 'total' ? percentage : count;

                if (primaryValue > bestValue) {
                    bestValue = primaryValue;
                    bestTiebreaker = tiebreakerValue;
                    bestTeam = team;
                } else if (primaryValue === bestValue) {
                    if (tiebreakerValue > bestTiebreaker) {
                        bestValue = primaryValue;
                        bestTiebreaker = tiebreakerValue;
                        bestTeam = team;
                    } else if (tiebreakerValue === bestTiebreaker) {
                        // Random tie-breaker as requested
                        if (Math.random() > 0.5) {
                            bestTeam = team;
                        }
                    }
                }
            }

            const winnerStats = zoneTeamCounts[bestTeam];
            const compPct = Math.round((winnerStats.completed / winnerStats.total) * 100);

            if (bestValue > maxVal) maxVal = bestValue;

            return {
                team: bestTeam,
                count: winnerStats.total,
                completion: compPct,
                percentage: ((winnerStats.total / (teamTotalPasses[bestTeam] || 1)) * 100).toFixed(1),
                metricValue: bestValue
            };
        });

        return { dominantTeams: domTeams, maxMetricValue: maxVal };
    }, [filteredPasses, metricMode]);

    const getZoneColor = (value) => {
        if (!value) return 'transparent';
        const intensity = Math.pow(value / (maxMetricValue || 1), 0.6); // gamma correction
        return `rgba(34, 197, 94, ${0.08 + intensity * 0.58})`;
    };

    // Pitch markings
    const renderPitch = () => (
        <g stroke="rgba(255,255,255,0.35)" strokeWidth="0.5" fill="none">
            <rect x="0" y="0" width={PITCH_L} height={PITCH_W} />
            <line x1={PITCH_L / 2} y1="0" x2={PITCH_L / 2} y2={PITCH_W} />
            <circle cx={PITCH_L / 2} cy={PITCH_W / 2} r="9.15" />
            <circle cx={PITCH_L / 2} cy={PITCH_W / 2} r="0.5" fill="rgba(255,255,255,0.4)" />
            {/* Left box */}
            <rect x="0" y={(PITCH_W - 40.32) / 2} width="16.5" height="40.32" />
            <rect x="0" y={(PITCH_W - 18.32) / 2} width="5.5" height="18.32" />
            <rect x="-2" y={(PITCH_W - 7.32) / 2} width="2" height="7.32" />
            <circle cx="11" cy={PITCH_W / 2} r="0.5" fill="rgba(255,255,255,0.4)" />
            <path d={`M 16.5 ${PITCH_W / 2 - 7} A 9.15 9.15 0 0 1 16.5 ${PITCH_W / 2 + 7}`} />
            {/* Right box */}
            <rect x={PITCH_L - 16.5} y={(PITCH_W - 40.32) / 2} width="16.5" height="40.32" />
            <rect x={PITCH_L - 5.5} y={(PITCH_W - 18.32) / 2} width="5.5" height="18.32" />
            <rect x={PITCH_L} y={(PITCH_W - 7.32) / 2} width="2" height="7.32" />
            <circle cx={PITCH_L - 11} cy={PITCH_W / 2} r="0.5" fill="rgba(255,255,255,0.4)" />
            <path d={`M ${PITCH_L - 16.5} ${PITCH_W / 2 - 7} A 9.15 9.15 0 0 0 ${PITCH_L - 16.5} ${PITCH_W / 2 + 7}`} />
        </g>
    );

    // 6x3 Heatmap Grid
    const renderZones = () =>
        Array.from({ length: ROWS }, (_, row) =>
            Array.from({ length: COLS }, (_, col) => {
                const idx = row * COLS + col;
                const domData = dominantTeams[idx];
                const x = col * ZONE_W;
                const y = row * ZONE_H;

                return (
                    <g key={idx}>
                        <rect
                            x={x} y={y}
                            width={ZONE_W} height={ZONE_H}
                            fill={domData ? getZoneColor(domData.metricValue) : 'transparent'}
                            stroke="rgba(255,255,255,0.08)"
                            strokeWidth="0.3"
                        />
                        {domData && (
                            <g transform={`translate(${x + ZONE_W / 2}, ${y + ZONE_H / 2})`}>
                                <image href={getBadge(domData.team)} xlinkHref={getBadge(domData.team)} x="-5" y="-8" width="10" height="10" preserveAspectRatio="xMidYMid meet" opacity="0.9" />
                                {!getBadge(domData.team) && (
                                    <text y="-4" textAnchor="middle" fontSize="1.5" fill="red">{domData.team}</text>
                                )}
                                <text
                                    y="5.5"
                                    textAnchor="middle"
                                    fontSize="2"
                                    fontFamily="Inter, sans-serif"
                                    fill="rgba(255,255,255,0.9)"
                                    fontWeight="bold"
                                >
                                    {metricMode === 'total' ? domData.count : `${domData.percentage}%`}
                                </text>
                                <text
                                    y="8.5"
                                    textAnchor="middle"
                                    fontSize="1.6"
                                    fontFamily="Inter, sans-serif"
                                    fill="rgba(255,255,255,0.6)"
                                    fontWeight="bold"
                                >
                                    ({domData.completion}%)
                                </text>
                            </g>
                        )}
                    </g>
                );
            })
        );

    return (
        <div>
            {/* Controls */}
            <div style={{ display: 'flex', gap: '1.5rem', marginBottom: '1.2rem', flexWrap: 'wrap', alignItems: 'center' }}>
                <div style={{ display: 'flex', gap: '0.6rem', alignItems: 'center' }}>
                    <span style={{ fontSize: '0.78rem', color: 'var(--color-text-secondary)', fontWeight: '500' }}>Dominance Metric:</span>
                    {[
                        { id: 'total', label: 'Total Volume' },
                        { id: 'percentage', label: 'Percentage' },
                    ].map((mode) => (
                        <button
                            key={mode.id}
                            onClick={() => setMetricMode(mode.id)}
                            style={{
                                background: metricMode === mode.id ? 'rgba(56,189,248,0.15)' : 'rgba(255,255,255,0.05)',
                                color: metricMode === mode.id ? 'var(--color-accent-blue)' : 'var(--color-text-secondary)',
                                border: metricMode === mode.id ? '1px solid rgba(56,189,248,0.4)' : '1px solid rgba(255,255,255,0.12)',
                                borderRadius: '6px',
                                padding: '0.3rem 0.75rem',
                                cursor: 'pointer',
                                fontSize: '0.8rem',
                                transition: 'all 0.2s',
                            }}
                        >
                            {mode.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Full pitch SVG */}
            <div style={{ width: '100%', borderRadius: '8px', overflow: 'hidden' }}>
                <svg
                    viewBox={`-2 -10 ${PITCH_L + 4} ${PITCH_W + 16}`}
                    style={{ width: '100%', height: '100%', backgroundColor: '#0e1420', borderRadius: '8px', boxShadow: '0 4px 20px rgba(0,0,0,0.5)', /* removed transition for html2canvas compatibility */ }}
                >
                    {/* Heatmap zones (behind pitch lines) */}
                    {renderZones()}

                    {/* Pitch lines (on top of heatmap) */}
                    {renderPitch()}
                </svg>
            </div>

            {/* Stats bar */}
            {filteredPasses.length > 0 && (
                <div style={{ marginTop: '0.75rem', display: 'flex', gap: '2rem', fontSize: '0.82rem', color: 'var(--color-text-secondary)', alignItems: 'center' }}>
                    <span><strong style={{ color: 'var(--color-text-primary)' }}>{filteredPasses.length}</strong> total build-up passes shown across the league</span>
                </div>
            )}
            {filteredPasses.length === 0 && (
                <div style={{ marginTop: '0.75rem', fontSize: '0.85rem', color: 'var(--color-text-secondary)', textAlign: 'center', padding: '1rem' }}>
                    No build-up passes found for current selection.
                </div>
            )}
        </div>
    );
};

export default LeagueBuildUpMap;
