import React, { useState, useMemo } from 'react';

const normalizeTeam = (name) => {
    if (!name) return 'Unknown';
    if (name.includes('Troms')) return 'Tromsø';
    if (name.includes('Bod')) return 'Bodø/Glimt';
    if (name.includes('Vålerenga')) return 'Vålerenga';
    if (name.includes('Lillestr')) return 'Lillestrøm';
    return name;
};

const LeagueFinalThirdMap = ({ entries, getBadge, loadedMatches }) => {
    const [numZones, setNumZones] = useState(5);
    const [metricMode, setMetricMode] = useState('total'); // 'total' or 'percentage'
    const [hoveredZone, setHoveredZone] = useState(null);

    // Calculate matches played per team for per-game averages
    const teamMatchesCount = useMemo(() => {
        const counts = {};
        if (loadedMatches) {
            loadedMatches.forEach(m => {
                const home = normalizeTeam(m.homeTeam);
                const away = normalizeTeam(m.awayTeam);
                counts[home] = (counts[home] || 0) + 1;
                counts[away] = (counts[away] || 0) + 1;
            });
        }
        return counts;
    }, [loadedMatches]);

    const filteredEntries = useMemo(() => {
        return entries.filter(e => {
            const isPass = e.typeId === 1;
            const isCarry = e.typeId === 43 || e.typeId === 3 || e.typeId === 61 || e.typeId === 212;
            return isPass || isCarry;
        });
    }, [entries]);

    const teamTotalEntries = useMemo(() => {
        const totals = {};
        filteredEntries.forEach(e => {
            const team = normalizeTeam(e.teamName);
            totals[team] = (totals[team] || 0) + 1;
        });
        return totals;
    }, [filteredEntries]);

    const zoneData = useMemo(() => {
        const zones = Array(numZones).fill(null).map(() => ({ teams: {} }));
        
        filteredEntries.forEach(e => {
            let destY = parseFloat(e.destY !== undefined ? e.destY : e.y);
            if (isNaN(destY)) return; // Skip if invalid coordinates
            
            let yNormalized = 100 - destY; 
            if (yNormalized < 0) yNormalized = 0;
            if (yNormalized >= 100) yNormalized = 99.99;
            
            const zoneIndex = Math.floor((yNormalized / 100) * numZones);
            const team = normalizeTeam(e.teamName);
            
            if (!zones[zoneIndex].teams[team]) {
                zones[zoneIndex].teams[team] = { count: 0, targets: {}, providers: {} };
            }
            
            zones[zoneIndex].teams[team].count++;
            
            // Target: receiver for passes, carrier for carries
            const target = (e.typeId === 1 && e.receiver) ? e.receiver : e.playerName;
            if (target) {
                zones[zoneIndex].teams[team].targets[target] = (zones[zoneIndex].teams[team].targets[target] || 0) + 1;
            }
            
            // Provider: passer for passes (carries have no provider)
            if (e.typeId === 1 && e.playerName) {
                zones[zoneIndex].teams[team].providers[e.playerName] = (zones[zoneIndex].teams[team].providers[e.playerName] || 0) + 1;
            }
        });

        let maxMetricValue = 0;

        const processedZones = zones.map((z, idx) => {
            if (Object.keys(z.teams).length === 0) return null;

            let bestTeam = null;
            let bestValue = -1;
            let bestTiebreaker = -1;

            for (const [team, stats] of Object.entries(z.teams)) {
                const teamTotal = teamTotalEntries[team] || 1;
                const count = stats.count;
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
                        if (Math.random() > 0.5) bestTeam = team;
                    }
                }
            }

            if (bestValue > maxMetricValue) maxMetricValue = bestValue;

            const winnerStats = z.teams[bestTeam];
            
            // Find top target
            let topTarget = null;
            let maxTargetCount = 0;
            for (const [player, count] of Object.entries(winnerStats.targets)) {
                if (count > maxTargetCount) {
                    maxTargetCount = count;
                    topTarget = player;
                }
            }

            // Find top provider
            let topProvider = null;
            let maxProviderCount = 0;
            for (const [player, count] of Object.entries(winnerStats.providers)) {
                if (count > maxProviderCount) {
                    maxProviderCount = count;
                    topProvider = player;
                }
            }

            const games = teamMatchesCount[bestTeam] || 1;

            return {
                index: idx,
                team: bestTeam,
                count: winnerStats.count,
                percentage: ((winnerStats.count / (teamTotalEntries[bestTeam] || 1)) * 100).toFixed(1),
                metricValue: bestValue,
                topTarget: topTarget ? {
                    name: topTarget,
                    count: maxTargetCount,
                    perGame: (maxTargetCount / games).toFixed(1)
                } : null,
                topProvider: topProvider ? {
                    name: topProvider,
                    count: maxProviderCount,
                    perGame: (maxProviderCount / games).toFixed(1)
                } : null
            };
        });

        return { zones: processedZones, maxMetricValue };
    }, [filteredEntries, numZones, metricMode, teamTotalEntries, teamMatchesCount]);

    const getZoneColor = (value) => {
        if (!value) return 'transparent';
        const intensity = Math.pow(value / (zoneData.maxMetricValue || 1), 0.6);
        return `rgba(6, 182, 212, ${0.1 + intensity * 0.6})`;
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem', width: '100%', height: '100%' }}>
            {/* Controls */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                    <span style={{ color: 'var(--color-text-secondary)', fontSize: '0.8rem', fontWeight: '500' }}>Zones:</span>
                    <div style={{ display: 'flex', gap: '0.3rem', background: 'rgba(255,255,255,0.05)', padding: '0.2rem', borderRadius: '8px' }}>
                        {[3, 4, 5].map(num => (
                            <button
                                key={num}
                                onClick={() => setNumZones(num)}
                                style={{
                                    padding: '0.2rem 0.6rem',
                                    borderRadius: '6px',
                                    border: 'none',
                                    cursor: 'pointer',
                                    background: numZones === num ? '#06b6d4' : 'transparent',
                                    color: numZones === num ? '#fff' : 'var(--color-text-secondary)',
                                    fontWeight: numZones === num ? 'bold' : 'normal',
                                    transition: 'all 0.2s ease',
                                    fontSize: '0.8rem'
                                }}
                            >
                                {num}
                            </button>
                        ))}
                    </div>
                </div>

                <div style={{ display: 'flex', gap: '0.4rem', alignItems: 'center' }}>
                    <span style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)', fontWeight: '500' }}>Dominance:</span>
                    {[
                        { id: 'total', label: 'Total Volume' },
                        { id: 'percentage', label: 'Percentage' },
                    ].map((mode) => (
                        <button
                            key={mode.id}
                            onClick={() => setMetricMode(mode.id)}
                            style={{
                                background: metricMode === mode.id ? 'rgba(6,182,212,0.15)' : 'rgba(255,255,255,0.05)',
                                color: metricMode === mode.id ? '#06b6d4' : 'var(--color-text-secondary)',
                                border: metricMode === mode.id ? '1px solid rgba(6,182,212,0.4)' : '1px solid rgba(255,255,255,0.12)',
                                borderRadius: '6px',
                                padding: '0.25rem 0.6rem',
                                cursor: 'pointer',
                                fontSize: '0.75rem',
                                transition: 'all 0.2s',
                            }}
                        >
                            {mode.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Vertical Pitch Visualization */}
            <div style={{ 
                position: 'relative', 
                width: '100%', 
                maxWidth: '450px', 
                margin: '0 auto',
                aspectRatio: '1.2 / 1',
                background: '#1a1f24',
                border: '2px solid rgba(255,255,255,0.4)',
                borderTop: 'none',
                borderBottom: 'none',
                borderRadius: '8px',
                overflow: 'visible',
                display: 'flex',
                flexDirection: 'column',
                boxShadow: '0 4px 20px rgba(0,0,0,0.5)',
            }}>
                {/* Field markings SVG */}
                <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, pointerEvents: 'none', zIndex: 10 }}>
                    <svg width="100%" height="100%" viewBox="0 -5 100 105" preserveAspectRatio="none" style={{ position: 'absolute', overflow: 'visible' }}>
                        <defs>
                            <style>{`.pitch-line { fill: none; stroke: rgba(255,255,255,0.35); stroke-width: 0.6; }`}</style>
                        </defs>
                        <line x1="0" y1="100" x2="100" y2="100" className="pitch-line" strokeWidth="1.2" />
                        <path d="M 37.5 100 A 12.5 16.6 0 0 1 62.5 100" className="pitch-line" />
                        <circle cx="50" cy="100" r="0.5" fill="rgba(255,255,255,0.4)" />
                        <line x1="0" y1="0" x2="100" y2="0" className="pitch-line" strokeWidth="1.2" />
                        <rect x="21.2" y="0" width="57.6" height="30" className="pitch-line" />
                        <rect x="37.5" y="0" width="25" height="10" className="pitch-line" />
                        <path d="M 45 0 L 45 -4 L 55 -4 L 55 0" fill="none" stroke="rgba(255,255,255,0.8)" strokeWidth="1" />
                        <circle cx="50" cy="20" r="0.5" fill="rgba(255,255,255,0.4)" />
                        <path d="M 40.5 30 A 12.5 16.6 0 0 0 59.5 30" className="pitch-line" />
                    </svg>

                    <div style={{ position: 'absolute', top: '60%', left: 0, right: 0, height: '2px', borderTop: '2px dashed rgba(255,255,255,0.25)' }}></div>
                    <span style={{ position: 'absolute', top: '61.5%', left: '10px', color: 'rgba(255,255,255,0.5)', fontSize: '0.65rem', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: 'bold' }}>Final 1/3 Line</span>
                </div>

                {/* Zones Overlay */}
                <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '60%', display: 'flex', zIndex: 20 }}>
                    {zoneData.zones.map((domData, idx) => (
                        <div 
                            key={idx} 
                            onMouseEnter={() => setHoveredZone(idx)}
                            onMouseLeave={() => setHoveredZone(null)}
                            style={{ 
                                flex: 1, 
                                borderRight: idx < numZones - 1 ? '1px dashed rgba(255,255,255,0.15)' : 'none',
                                borderTopLeftRadius: idx === 0 ? '8px' : '0',
                                borderTopRightRadius: idx === numZones - 1 ? '8px' : '0',
                                display: 'flex',
                                flexDirection: 'column',
                                justifyContent: 'center',
                                alignItems: 'center',
                                position: 'relative',
                                background: domData ? getZoneColor(domData.metricValue) : 'transparent',
                                transition: 'background 0.4s ease'
                            }}
                        >
                            {domData && (
                                <>
                                    <img 
                                        src={getBadge(domData.team)} 
                                        alt={domData.team}
                                        style={{ width: '36px', height: '36px', objectFit: 'contain', opacity: 0.9, filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.5))', marginBottom: '4px' }}
                                    />
                                    <span style={{ color: '#fff', fontWeight: 'bold', fontSize: '1rem', textShadow: '0 1px 3px rgba(0,0,0,0.8)' }}>
                                        {metricMode === 'total' ? domData.count : `${domData.percentage}%`}
                                    </span>
                                </>
                            )}
                            
                            {/* Tooltip */}
                            {hoveredZone === idx && domData && (domData.topTarget || domData.topProvider) && (
                                <div style={{
                                    position: 'absolute',
                                    top: '105%',
                                    width: 'max-content',
                                    background: 'rgba(15, 23, 42, 0.95)',
                                    border: '1px solid #06b6d4',
                                    padding: '0.6rem 0.8rem',
                                    borderRadius: '8px',
                                    zIndex: 100,
                                    display: 'flex',
                                    gap: '16px',
                                    alignItems: 'flex-start',
                                    boxShadow: '0 8px 24px rgba(0,0,0,0.6)',
                                    pointerEvents: 'none'
                                }}>
                                    {domData.topTarget && (
                                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                                            <span style={{ fontSize: '0.65rem', color: 'rgba(255,255,255,0.6)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Top Target / Carrier</span>
                                            <span style={{ fontWeight: 'bold', color: '#fff', fontSize: '0.85rem', marginBottom: '2px' }}>{domData.topTarget.name}</span>
                                            <div style={{ display: 'flex', gap: '6px', fontSize: '0.75rem' }}>
                                                <span style={{ color: '#06b6d4', fontWeight: '600' }}>{domData.topTarget.count} total</span>
                                                <span style={{ color: 'rgba(255,255,255,0.5)' }}>({domData.topTarget.perGame}/g)</span>
                                            </div>
                                        </div>
                                    )}
                                    
                                    {domData.topProvider && (
                                        <>
                                            {domData.topTarget && <div style={{ width: '1px', background: 'rgba(255,255,255,0.1)', alignSelf: 'stretch' }}></div>}
                                            <div style={{ display: 'flex', flexDirection: 'column' }}>
                                                <span style={{ fontSize: '0.65rem', color: 'rgba(255,255,255,0.6)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Top Provider</span>
                                                <span style={{ fontWeight: 'bold', color: '#fff', fontSize: '0.85rem', marginBottom: '2px' }}>{domData.topProvider.name}</span>
                                                <div style={{ display: 'flex', gap: '6px', fontSize: '0.75rem' }}>
                                                    <span style={{ color: '#06b6d4', fontWeight: '600' }}>{domData.topProvider.count} total</span>
                                                    <span style={{ color: 'rgba(255,255,255,0.5)' }}>({domData.topProvider.perGame}/g)</span>
                                                </div>
                                            </div>
                                        </>
                                    )}
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </div>

            {filteredEntries.length > 0 && (
                <div style={{ marginTop: '0.2rem', fontSize: '0.82rem', color: 'var(--color-text-secondary)', textAlign: 'center' }}>
                    <span><strong style={{ color: 'var(--color-text-primary)' }}>{filteredEntries.length}</strong> total final-third entries mapped</span>
                </div>
            )}
        </div>
    );
};

export default LeagueFinalThirdMap;
