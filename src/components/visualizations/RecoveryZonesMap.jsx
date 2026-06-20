import React, { useState } from 'react';

const PITCH_L = 105;
const PITCH_W = 68;

const RecoveryZonesMap = ({ teamName, teamLogo, teamColor, attackingData, defensiveData }) => {
    const [phase, setPhase] = useState('attack'); // 'attack' or 'defense'
    const [zoneCount, setZoneCount] = useState(3); // 3, 4, 5, or 6
    const [orientation, setOrientation] = useState('vertical'); // 'vertical' (slices X) or 'horizontal' (slices Y)

    const data = phase === 'attack' ? (attackingData || []) : (defensiveData || []);
    
    // Normalize coordinates depending on data source
    // attackingData uses { x, y }
    // defensiveData uses { startX, startY }
    const getCoords = (t) => {
        const x = t.x !== undefined ? t.x : t.startX;
        const y = t.y !== undefined ? t.y : t.startY;
        return { x, y };
    };

    // Calculate Zone Stats
    const zoneStats = Array(zoneCount).fill(0);
    
    data.forEach(t => {
        const { x, y } = getCoords(t);
        let coordToSlice = orientation === 'vertical' ? x : y;
        
        // Ensure within 0-99.999
        if (coordToSlice < 0) coordToSlice = 0;
        if (coordToSlice >= 100) coordToSlice = 99.999;
        
        const zoneIdx = Math.floor((coordToSlice / 100) * zoneCount);
        zoneStats[zoneIdx]++;
    });

    const maxCount = Math.max(...zoneStats, 1);

    const getHexColor = (colorStr) => {
        if (!colorStr) return { r: 168, g: 85, b: 247 };
        if (colorStr.startsWith('#')) {
            const hex = colorStr.replace('#', '');
            if (hex.length === 6) {
                return {
                    r: parseInt(hex.substring(0, 2), 16),
                    g: parseInt(hex.substring(2, 4), 16),
                    b: parseInt(hex.substring(4, 6), 16)
                };
            }
        } else if (colorStr.startsWith('rgb')) {
            const matches = colorStr.match(/\d+/g);
            if (matches && matches.length >= 3) {
                return { r: parseInt(matches[0]), g: parseInt(matches[1]), b: parseInt(matches[2]) };
            }
        }
        return { r: 168, g: 85, b: 247 };
    };
    
    const rgb = getHexColor(teamColor);

    const renderZoneBackgrounds = () => {
        return zoneStats.map((count, idx) => {
            const intensity = count === 0 ? 0 : 0.15 + (count / maxCount) * 0.55;
            const fill = `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${intensity})`;
            
            let rectProps = {};
            if (orientation === 'vertical') {
                const zoneWidth = PITCH_L / zoneCount;
                rectProps = { x: idx * zoneWidth, y: 0, width: zoneWidth, height: PITCH_W };
            } else {
                const zoneHeight = PITCH_W / zoneCount;
                rectProps = { x: 0, y: idx * zoneHeight, width: PITCH_L, height: zoneHeight };
            }

            return (
                <rect
                    key={`zone-bg-${idx}`}
                    {...rectProps}
                    fill={fill}
                    stroke="rgba(255,255,255,0.15)"
                    strokeWidth="0.5"
                    style={{ transition: 'all 0.3s' }}
                />
            );
        });
    };

    const renderZoneTexts = () => {
        return zoneStats.map((count, idx) => {
            let x, y;
            if (orientation === 'vertical') {
                const zoneWidth = PITCH_L / zoneCount;
                x = idx * zoneWidth + zoneWidth / 2;
                y = PITCH_W / 2;
            } else {
                const zoneHeight = PITCH_W / zoneCount;
                x = PITCH_L / 2;
                y = idx * zoneHeight + zoneHeight / 2;
            }

            // If it's the center zone where the badge is, add a subtle background for readability
            const isCenterZone = teamLogo && zoneCount % 2 !== 0 && idx === Math.floor(zoneCount / 2);

            return (
                <g key={`zone-text-${idx}`}>
                    {isCenterZone && (
                        <circle cx={x} cy={y} r="7" fill="rgba(0,0,0,0.5)" filter="blur(0.5px)" />
                    )}
                    <text
                        x={x}
                        y={y}
                        textAnchor="middle"
                        dominantBaseline="central"
                        fontSize={orientation === 'vertical' ? "12" : "10"}
                        fontFamily="Inter, sans-serif"
                        fill="rgba(255,255,255,1)"
                        fontWeight="bold"
                        style={{ textShadow: '0px 2px 4px rgba(0,0,0,0.8)' }}
                    >
                        {count}
                    </text>
                </g>
            );
        });
    };

    const renderPitch = () => (
        <g stroke="rgba(255,255,255,0.3)" strokeWidth="0.5" fill="none">
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

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {/* Header Controls */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem', marginBottom: '0.5rem' }}>
                <div style={{ display: 'flex', gap: '0.5rem', background: 'rgba(0,0,0,0.3)', padding: '0.25rem', borderRadius: '8px' }}>
                    <button
                        onClick={() => setPhase('attack')}
                        style={{
                            padding: '0.4rem 1.5rem',
                            background: phase === 'attack' ? 'rgba(74,222,128,0.2)' : 'transparent',
                            color: phase === 'attack' ? '#4ade80' : 'var(--color-text-secondary)',
                            border: phase === 'attack' ? '1px solid rgba(74,222,128,0.3)' : '1px solid transparent',
                            borderRadius: '6px',
                            cursor: 'pointer',
                            fontWeight: '600',
                            transition: 'all 0.2s',
                            fontSize: '0.8rem'
                        }}
                    >
                        Attacking Transitions
                    </button>
                    <button
                        onClick={() => setPhase('defense')}
                        style={{
                            padding: '0.4rem 1.5rem',
                            background: phase === 'defense' ? 'rgba(239,68,68,0.2)' : 'transparent',
                            color: phase === 'defense' ? '#ef4444' : 'var(--color-text-secondary)',
                            border: phase === 'defense' ? '1px solid rgba(239,68,68,0.3)' : '1px solid transparent',
                            borderRadius: '6px',
                            cursor: 'pointer',
                            fontWeight: '600',
                            transition: 'all 0.2s',
                            fontSize: '0.8rem'
                        }}
                    >
                        Defensive Transitions
                    </button>
                </div>

                <div style={{ display: 'flex', gap: '2.5rem', alignItems: 'center' }}>
                    {/* Zones Toggle */}
                    <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                        <span style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)', fontWeight: '500' }}>Zones:</span>
                        <div style={{ display: 'flex', gap: '0.2rem' }}>
                            {[3, 4, 5, 6].map(num => (
                                <button
                                    key={num}
                                    onClick={() => setZoneCount(num)}
                                    style={{
                                        background: zoneCount === num ? 'rgba(255,255,255,0.15)' : 'transparent',
                                        color: zoneCount === num ? '#fff' : 'var(--color-text-secondary)',
                                        border: zoneCount === num ? '1px solid rgba(255,255,255,0.3)' : '1px solid rgba(255,255,255,0.05)',
                                        borderRadius: '4px',
                                        padding: '0.25rem 0.6rem',
                                        cursor: 'pointer',
                                        fontSize: '0.75rem',
                                        fontWeight: '600',
                                        transition: 'all 0.2s',
                                    }}
                                >
                                    {num}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Orientation Toggle */}
                    <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                        <span style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)', fontWeight: '500' }}>Slice:</span>
                        <div style={{ display: 'flex', gap: '0.2rem' }}>
                            {[
                                { id: 'vertical', label: 'Vertical' },
                                { id: 'horizontal', label: 'Horizontal' }
                            ].map(opt => (
                                <button
                                    key={opt.id}
                                    onClick={() => setOrientation(opt.id)}
                                    style={{
                                        background: orientation === opt.id ? 'rgba(255,255,255,0.15)' : 'transparent',
                                        color: orientation === opt.id ? '#fff' : 'var(--color-text-secondary)',
                                        border: orientation === opt.id ? '1px solid rgba(255,255,255,0.3)' : '1px solid rgba(255,255,255,0.05)',
                                        borderRadius: '4px',
                                        padding: '0.25rem 0.6rem',
                                        cursor: 'pointer',
                                        fontSize: '0.75rem',
                                        fontWeight: '600',
                                        transition: 'all 0.2s',
                                    }}
                                >
                                    {opt.label}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Pitch Container */}
            <div style={{ width: '100%', borderRadius: '8px', overflow: 'hidden', position: 'relative' }}>
                <svg
                    viewBox={`-2 -2 ${PITCH_L + 4} ${PITCH_W + 4}`}
                    style={{ width: '100%', height: '100%', backgroundColor: '#0e1420', borderRadius: '8px', boxShadow: '0 4px 20px rgba(0,0,0,0.5)' }}
                >
                    {renderZoneBackgrounds()}
                    {renderPitch()}
                    
                    {/* Team Badge in Center Circle */}
                    {teamLogo && (
                        <image href={teamLogo} xlinkHref={teamLogo} x={(PITCH_L / 2) - 5} y={(PITCH_W / 2) - 5} width="10" height="10" preserveAspectRatio="xMidYMid meet"  />
                    )}
                    
                    {renderZoneTexts()}
                </svg>
            </div>
            
            {/* Footer Summary */}
            <div style={{ fontSize: '0.82rem', color: 'var(--color-text-secondary)', display: 'flex', justifyContent: 'space-between' }}>
                <span>
                    Showing <strong style={{ color: 'var(--color-text-primary)' }}>{data.length}</strong> {phase === 'attack' ? 'possessions recovered' : 'possessions lost'}
                </span>
            </div>
        </div>
    );
};

export default RecoveryZonesMap;
