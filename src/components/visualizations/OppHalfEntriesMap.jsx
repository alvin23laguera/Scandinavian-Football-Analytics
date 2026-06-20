import React, { useState, useMemo } from 'react';

const OppHalfEntriesMap = ({ entries }) => {
    const [numZones, setNumZones] = useState(5);
    const [eventTypes, setEventTypes] = useState({ passes: true, carries: true });
    const [hoveredZone, setHoveredZone] = useState(null);

    // Filter events by type
    const filteredEntries = useMemo(() => {
        return entries.filter(e => {
            const isPass = e.typeId === 1;
            const isCarry = e.typeId === 43 || e.typeId === 3 || e.typeId === 61 || e.typeId === 212;
            
            if (eventTypes.passes && eventTypes.carries) return isPass || isCarry;
            if (eventTypes.passes) return isPass;
            if (eventTypes.carries) return isCarry;
            return false;
        });
    }, [entries, eventTypes]);

    // Calculate zone metrics
    const zoneData = useMemo(() => {
        const zones = Array(numZones).fill().map(() => ({ count: 0, players: {}, passers: {}, totalPasses: 0 }));
        const overallPlayers = {};
        const overallPassers = {};
        let totalEntries = 0;
        let totalOverallPasses = 0;
        
        filteredEntries.forEach(e => {
            let destY = parseFloat(e.destY !== undefined ? e.destY : e.y);
            if (isNaN(destY)) return; // Skip if invalid coordinates
            
            let yNormalized = 100 - destY; 
            if (yNormalized < 0) yNormalized = 0;
            if (yNormalized >= 100) yNormalized = 99.99;
            
            const zoneIndex = Math.floor((yNormalized / 100) * numZones);
            zones[zoneIndex].count++;
            
            // Determine the key player: Receiver for passes, Carrier for carries
            const player = (e.typeId === 1 && e.receiver) ? e.receiver : e.playerName;
            if (player) {
                zones[zoneIndex].players[player] = (zones[zoneIndex].players[player] || 0) + 1;
                overallPlayers[player] = (overallPlayers[player] || 0) + 1;
                totalEntries++;
            }

            // Determine the passer
            if (e.typeId === 1 && e.playerName) {
                zones[zoneIndex].passers[e.playerName] = (zones[zoneIndex].passers[e.playerName] || 0) + 1;
                overallPassers[e.playerName] = (overallPassers[e.playerName] || 0) + 1;
                zones[zoneIndex].totalPasses++;
                totalOverallPasses++;
            }
        });

        const total = zones.reduce((a, b) => a + b.count, 0);

        // Find overall top player
        let overallTopPlayerName = null;
        let overallMaxCount = 0;
        for (const [name, count] of Object.entries(overallPlayers)) {
            if (count > overallMaxCount) {
                overallMaxCount = count;
                overallTopPlayerName = name;
            }
        }
        
        const overallTopPlayer = overallTopPlayerName ? {
            name: overallTopPlayerName,
            count: overallMaxCount,
            percentage: totalEntries > 0 ? ((overallMaxCount / totalEntries) * 100).toFixed(0) : 0
        } : null;

        // Find overall top passer
        let overallTopPasserName = null;
        let overallMaxPassCount = 0;
        for (const [name, count] of Object.entries(overallPassers)) {
            if (count > overallMaxPassCount) {
                overallMaxPassCount = count;
                overallTopPasserName = name;
            }
        }

        const overallTopPasser = overallTopPasserName ? {
            name: overallTopPasserName,
            count: overallMaxPassCount,
            percentage: totalOverallPasses > 0 ? ((overallMaxPassCount / totalOverallPasses) * 100).toFixed(0) : 0
        } : null;

        return {
            zones: zones.map((z, i) => {
                let topPlayer = null;
                let maxCount = 0;
                for (const [name, count] of Object.entries(z.players)) {
                    if (count > maxCount) {
                        maxCount = count;
                        topPlayer = name;
                    }
                }

                let topPasser = null;
                let maxPassCount = 0;
                for (const [name, count] of Object.entries(z.passers)) {
                    if (count > maxPassCount) {
                        maxPassCount = count;
                        topPasser = name;
                    }
                }

                return {
                    index: i,
                    count: z.count,
                    percentage: total > 0 ? ((z.count / total) * 100).toFixed(1) : 0,
                    total,
                    topPlayer: topPlayer ? {
                        name: topPlayer,
                        count: maxCount,
                        percentage: z.count > 0 ? ((maxCount / z.count) * 100).toFixed(0) : 0
                    } : null,
                    topPasser: topPasser ? {
                        name: topPasser,
                        count: maxPassCount,
                        percentage: z.totalPasses > 0 ? ((maxPassCount / z.totalPasses) * 100).toFixed(0) : 0
                    } : null
                };
            }),
            overallTopPlayer,
            overallTopPasser
        };
    }, [filteredEntries, numZones]);

    const maxCount = Math.max(...zoneData.zones.map(z => z.count), 1);

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', width: '100%' }}>
            {/* Controls */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
                <div style={{ display: 'flex', gap: '0.5rem', background: 'rgba(255,255,255,0.05)', padding: '0.3rem', borderRadius: '8px' }}>
                    <button
                        onClick={() => setEventTypes(prev => ({ ...prev, passes: !prev.passes }))}
                        style={{
                            padding: '0.4rem 1rem',
                            borderRadius: '6px',
                            border: 'none',
                            cursor: 'pointer',
                            background: eventTypes.passes ? 'var(--color-accent-blue)' : 'transparent',
                            color: eventTypes.passes ? '#fff' : 'var(--color-text-secondary)',
                            fontWeight: eventTypes.passes ? 'bold' : 'normal',
                            transition: 'all 0.2s ease'
                        }}
                    >
                        Passes
                    </button>
                    <button
                        onClick={() => setEventTypes(prev => ({ ...prev, carries: !prev.carries }))}
                        style={{
                            padding: '0.4rem 1rem',
                            borderRadius: '6px',
                            border: 'none',
                            cursor: 'pointer',
                            background: eventTypes.carries ? 'var(--color-accent-blue)' : 'transparent',
                            color: eventTypes.carries ? '#fff' : 'var(--color-text-secondary)',
                            fontWeight: eventTypes.carries ? 'bold' : 'normal',
                            transition: 'all 0.2s ease'
                        }}
                    >
                        Carries
                    </button>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <span style={{ color: 'var(--color-text-secondary)', fontSize: '0.9rem' }}>Zones:</span>
                    <div style={{ display: 'flex', gap: '0.3rem', background: 'rgba(255,255,255,0.05)', padding: '0.3rem', borderRadius: '8px' }}>
                        {[3, 4, 5].map(num => (
                            <button
                                key={num}
                                onClick={() => setNumZones(num)}
                                style={{
                                    padding: '0.3rem 0.8rem',
                                    borderRadius: '6px',
                                    border: 'none',
                                    cursor: 'pointer',
                                    background: numZones === num ? '#3b82f6' : 'transparent',
                                    color: numZones === num ? '#fff' : 'var(--color-text-secondary)',
                                    fontWeight: numZones === num ? 'bold' : 'normal',
                                    transition: 'all 0.2s ease'
                                }}
                            >
                                {num}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Vertical Pitch Visualization */}
            <div style={{ 
                position: 'relative', 
                width: '100%', 
                maxWidth: '500px', 
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
                marginTop: '1rem'
            }}>
                {/* Field markings (Middle 50% pitch - SVG) */}
                <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, pointerEvents: 'none', zIndex: 10, overflow: 'hidden', borderRadius: '8px' }}>
                    {/* ViewBox "0 10 100 55" shows width 100, height 55 starting from Y=10.
                        This displays the pitch from Y=10 (showing the penalty box and spot) down to Y=65 (showing the full center circle).
                    */}
                    <svg width="100%" height="100%" viewBox="0 10 100 55" preserveAspectRatio="none" style={{ position: 'absolute', overflow: 'hidden' }}>
                        <defs>
                            <style>
                                {`.pitch-line { fill: none; stroke: rgba(255,255,255,0.4); stroke-width: 0.6; }`}
                            </style>
                        </defs>
                        
                        {/* Halfway line (X=50, SVG Y=50) */}
                        <line x1="0" y1="50" x2="100" y2="50" className="pitch-line" strokeWidth="1.2" />
                        
                        {/* Center Circle (Radius 12.5 for X, 7.5 for Y) */}
                        <path d="M 37.5 50 A 12.5 7.5 0 0 1 62.5 50" className="pitch-line" />
                        <path d="M 37.5 50 A 12.5 7.5 0 0 0 62.5 50" className="pitch-line" />
                        
                        {/* Center spot */}
                        <circle cx="50" cy="50" r="0.5" fill="rgba(255,255,255,0.4)" />

                        {/* Penalty Box */}
                        <rect x="21.1" y="0" width="57.8" height="17" className="pitch-line" />

                        {/* Penalty Spot */}
                        <circle cx="50" cy="11.5" r="0.5" fill="rgba(255,255,255,0.4)" />

                        {/* Penalty Arc (D) */}
                        <path d="M 40.5 17 A 12.5 7.5 0 0 0 59.5 17" className="pitch-line" />
                    </svg>

                    <div style={{ 
                        position: 'absolute', 
                        top: '42.4%', 
                        left: 0, 
                        right: 0, 
                        height: '2px', 
                        borderTop: '2px dashed rgba(255,255,255,0.25)' 
                    }}></div>
                    <span style={{ 
                        position: 'absolute', 
                        top: '43.4%', 
                        left: '10px', 
                        color: 'rgba(255,255,255,0.5)', 
                        fontSize: '0.7rem',
                        textTransform: 'uppercase',
                        letterSpacing: '1px',
                        fontWeight: 'bold'
                    }}>Final 1/3</span>

                    {/* Defensive third line removed */}
                </div>

                {/* Opponent Half Entry Zones (Between 42.4% and 72.7% = 30.3% height) */}
                <div style={{ 
                    position: 'absolute', 
                    top: '42.4%', 
                    left: 0, 
                    right: 0, 
                    height: '30.3%', 
                    display: 'flex',
                    zIndex: 20
                }}>
                    {zoneData.zones.map((zone, idx) => {
                        const intensity = zone.count / maxCount;
                        return (
                            <div 
                                key={idx} 
                                onMouseEnter={() => setHoveredZone(idx)}
                                onMouseLeave={() => setHoveredZone(null)}
                                style={{ 
                                    flex: 1, 
                                    borderRight: idx < numZones - 1 ? '2px dashed rgba(255,255,255,0.3)' : 'none',
                                    borderTopLeftRadius: idx === 0 ? '8px' : '0',
                                    borderTopRightRadius: idx === numZones - 1 ? '8px' : '0',
                                    borderBottomLeftRadius: idx === 0 ? '8px' : '0',
                                    borderBottomRightRadius: idx === numZones - 1 ? '8px' : '0',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    justifyContent: 'center',
                                    alignItems: 'center',
                                    position: 'relative',
                                    background: `rgba(236, 72, 153, ${intensity * 0.7})`, // Pink heatmap
                                    transition: 'background 0.4s ease'
                                }}
                            >
                                <div style={{
                                    background: 'rgba(0,0,0,0.6)',
                                    padding: '0.4rem',
                                    borderRadius: '6px',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    alignItems: 'center',
                                    border: '1px solid rgba(255,255,255,0.1)',
                                    backdropFilter: 'blur(4px)',
                                    zIndex: 20
                                }}>
                                    <span style={{ 
                                        color: '#fff', 
                                        fontWeight: 'bold', 
                                        fontSize: numZones > 4 ? '1rem' : '1.2rem' 
                                    }}>
                                        {zone.count}
                                    </span>
                                    <span style={{ 
                                        color: 'var(--color-accent-pink, #f472b6)', 
                                        fontSize: numZones > 4 ? '0.75rem' : '0.85rem',
                                        fontWeight: 'bold' 
                                    }}>
                                        ({zone.percentage}%)
                                    </span>
                                </div>
                                
                                {/* Tooltip */}
                                {hoveredZone === idx && (zone.topPlayer || zone.topPasser) && (
                                    <div style={{
                                        position: 'absolute',
                                        top: '110%',
                                        width: 'max-content',
                                        background: 'rgba(0,0,0,0.85)',
                                        border: '1px solid var(--color-accent-pink, #ec4899)',
                                        padding: '0.4rem 0.6rem',
                                        borderRadius: '6px',
                                        zIndex: 100,
                                        display: 'flex',
                                        gap: '12px',
                                        alignItems: 'flex-start',
                                        boxShadow: '0 4px 12px rgba(0,0,0,0.5)',
                                        pointerEvents: 'none'
                                    }}>
                                        {zone.topPlayer && (
                                            <div style={{ display: 'flex', flexDirection: 'column' }}>
                                                <span style={{ fontSize: '0.65rem', color: 'rgba(255,255,255,0.7)', textTransform: 'uppercase' }}>Top Target</span>
                                                <span style={{ fontWeight: 'bold', color: '#fff', fontSize: '0.8rem' }}>{zone.topPlayer.name}</span>
                                                <div style={{ display: 'flex', gap: '4px', fontSize: '0.7rem' }}>
                                                    <span style={{ color: 'var(--color-accent-pink, #f472b6)' }}>{zone.topPlayer.count}</span>
                                                    <span style={{ color: 'rgba(255,255,255,0.5)' }}>({zone.topPlayer.percentage}%)</span>
                                                </div>
                                            </div>
                                        )}
                                        
                                        {zone.topPasser && (
                                            <>
                                                {zone.topPlayer && <div style={{ width: '1px', background: 'rgba(255,255,255,0.1)', alignSelf: 'stretch' }}></div>}
                                                <div style={{ display: 'flex', flexDirection: 'column' }}>
                                                    <span style={{ fontSize: '0.65rem', color: 'rgba(255,255,255,0.7)', textTransform: 'uppercase' }}>Top Provider</span>
                                                    <span style={{ fontWeight: 'bold', color: '#fff', fontSize: '0.8rem' }}>{zone.topPasser.name}</span>
                                                    <div style={{ display: 'flex', gap: '4px', fontSize: '0.7rem' }}>
                                                        <span style={{ color: 'var(--color-accent-pink, #f472b6)' }}>{zone.topPasser.count} passes</span>
                                                        <span style={{ color: 'rgba(255,255,255,0.5)' }}>({zone.topPasser.percentage}%)</span>
                                                    </div>
                                                </div>
                                            </>
                                        )}
                                    </div>
                                )}
                            </div>
                        )
                    })}
                </div>
            </div>
            
            <div style={{ textAlign: 'center', color: 'var(--color-text-secondary)', fontSize: '0.85rem', marginTop: '0.5rem', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <div>Showing <b>{filteredEntries.length}</b> total opponent's half entries</div>
                <div style={{ display: 'flex', justifyContent: 'center', gap: '1.5rem', flexWrap: 'wrap' }}>
                    {zoneData.overallTopPlayer && (
                        <div style={{ color: 'var(--color-text-primary)' }}>
                            Most entries: <b style={{ color: 'var(--color-accent-pink, #ec4899)' }}>{zoneData.overallTopPlayer.name}</b> ({zoneData.overallTopPlayer.count} | {zoneData.overallTopPlayer.percentage}%)
                        </div>
                    )}
                    {zoneData.overallTopPasser && (
                        <div style={{ color: 'var(--color-text-primary)' }}>
                            Top Provider: <b style={{ color: 'var(--color-accent-pink, #ec4899)' }}>{zoneData.overallTopPasser.name}</b> ({zoneData.overallTopPasser.count} passes | {zoneData.overallTopPasser.percentage}%)
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default OppHalfEntriesMap;
