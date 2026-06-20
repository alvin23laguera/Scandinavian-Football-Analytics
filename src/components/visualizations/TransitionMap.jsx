import React, { useState } from 'react';

const PITCH_L = 105;
const PITCH_W = 68;

const TransitionMap = ({ transitions }) => {
    const [hoveredEvent, setHoveredEvent] = useState(null);
    const [gridConfig, setGridConfig] = useState({ cols: 8, rows: 4, label: '8x4' });
    const [showArrows, setShowArrows] = useState(true);
    const [directionFilter, setDirectionFilter] = useState('all');

    let data = transitions || [];
    if (directionFilter !== 'all') {
        data = data.filter(t => t.passDirection === directionFilter);
    }

    // --- Compute zone heatmap ---
    const COLS = gridConfig.cols;
    const ROWS = gridConfig.rows;
    const ZONE_W = PITCH_L / COLS;
    const ZONE_H = PITCH_W / ROWS;

    const zoneData = Array.from({ length: COLS * ROWS }, () => ({ total: 0 }));

    data.forEach(t => {
        const col = Math.min(Math.floor((t.destX / 100) * COLS), COLS - 1);
        const row = Math.min(Math.floor((t.destY / 100) * ROWS), ROWS - 1);
        const idx = row * COLS + col;
        if (idx >= 0 && idx < zoneData.length) {
            zoneData[idx].total++;
        }
    });

    const maxCount = Math.max(...zoneData.map(d => d.total), 1);

    // Multi-stop scale based on pass attempt volume
    const getZoneColor = (count) => {
        if (count === 0) return 'transparent';
        
        const intensity = Math.pow(count / maxCount, 0.6); // 0.0 to 1.0
        
        const stops = [
            { t: 0.00, r: 168, g: 85, b: 247 }, // Purple
            { t: 0.25, r: 56, g: 189, b: 248 }, // Light Blue
            { t: 0.50, r: 253, g: 224, b: 71 }, // Yellow
            { t: 0.75, r: 249, g: 115, b: 22 }, // Orange
            { t: 1.00, r: 239, g: 68, b: 68 }    // Red
        ];
        
        let lower = stops[0];
        let upper = stops[stops.length - 1];
        
        for (let i = 0; i < stops.length - 1; i++) {
            if (intensity >= stops[i].t && intensity <= stops[i+1].t) {
                lower = stops[i];
                upper = stops[i+1];
                break;
            }
        }
        
        const range = upper.t - lower.t;
        const localT = range === 0 ? 0 : (intensity - lower.t) / range;
        
        const r = Math.round(lower.r + (upper.r - lower.r) * localT);
        const g = Math.round(lower.g + (upper.g - lower.g) * localT);
        const b = Math.round(lower.b + (upper.b - lower.b) * localT);
        const alpha = 0.25 + (0.55 * intensity);
        
        return `rgba(${r}, ${g}, ${b}, ${alpha})`;
    };

    // --- Pitch markings ---
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

    // --- Heatmap Grid ---
    const renderZones = () =>
        Array.from({ length: ROWS }, (_, row) =>
            Array.from({ length: COLS }, (_, col) => {
                const idx = row * COLS + col;
                const d = zoneData[idx];
                const x = col * ZONE_W;
                const y = row * ZONE_H;

                return (
                    <g key={idx}>
                        <rect
                            x={x} y={y}
                            width={ZONE_W} height={ZONE_H}
                            fill={getZoneColor(d.total)}
                            stroke="rgba(255,255,255,0.08)"
                            strokeWidth="0.3"
                        />
                        {d.total > 0 && (
                            <text
                                x={x + ZONE_W / 2}
                                y={y + ZONE_H / 2}
                                textAnchor="middle"
                                dominantBaseline="central"
                                fontSize="2.2"
                                fontFamily="Inter, sans-serif"
                                fill={d.total > maxCount * 0.4 ? 'rgba(255,255,255,0.9)' : 'rgba(255,255,255,0.6)'}
                                fontWeight="bold"
                            >
                                {d.total}
                            </text>
                        )}
                    </g>
                );
            })
        );

    // --- Arrow definitions ---
    const renderDefs = () => (
        <defs>
            <marker id="arrowhead-green" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto">
                <path d="M 0 0 L 6 3 L 0 6 z" fill="rgba(34, 197, 94, 0.8)" />
            </marker>
            <marker id="arrowhead-red" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto">
                <path d="M 0 0 L 6 3 L 0 6 z" fill="rgba(239, 68, 68, 0.8)" />
            </marker>
        </defs>
    );

    // --- Pass arrows ---
    const renderPass = (t, idx) => {
        const startX = (t.startX / 100) * PITCH_L;
        const startY = (t.startY / 100) * PITCH_W;
        const destX = (t.destX / 100) * PITCH_L;
        const destY = (t.destY / 100) * PITCH_W;
        
        const isHovered = hoveredEvent?.id === (t.id || idx);
        const strokeColor = t.completed ? 'rgba(34, 197, 94, 0.7)' : 'rgba(239, 68, 68, 0.7)';
        const markerEnd = t.completed ? 'url(#arrowhead-green)' : 'url(#arrowhead-red)';
        
        return (
            <g key={t.id || idx}>
                <line
                    x1={startX} y1={startY}
                    x2={destX} y2={destY}
                    stroke={strokeColor}
                    strokeWidth={isHovered ? "0.6" : "0.3"}
                    markerEnd={markerEnd}
                    style={{ cursor: 'pointer', transition: 'stroke-width 0.15s ease' }}
                    onMouseEnter={() => setHoveredEvent(t)}
                    onMouseLeave={() => setHoveredEvent(null)}
                />
                <circle
                    cx={startX} cy={startY} r={isHovered ? 0.8 : 0.5}
                    fill={strokeColor}
                />
                {isHovered && renderTooltip(t, startX, startY)}
            </g>
        );
    };

    // --- Tooltip ---
    const renderTooltip = (t, cx, cy) => {
        const tipW = 28;
        const tipH = 9;
        const nearRight = cx > PITCH_L * 0.72;
        const nearTop = cy < PITCH_W * 0.2;
        const tx = nearRight ? cx - tipW - 2 : cx + 2;
        const ty = nearTop ? cy + 1 : cy - tipH - 1;

        return (
            <g transform={`translate(${tx}, ${ty})`} style={{ pointerEvents: 'none' }}>
                <rect x={0.4} y={0.4} width={tipW} height={tipH} rx="1.2" fill="rgba(0,0,0,0.45)" />
                <rect x={0} y={0} width={tipW} height={tipH} rx="1.2"
                    fill="rgba(10,15,25,0.94)"
                    stroke={t.completed ? "rgba(34, 197, 94, 0.6)" : "rgba(239, 68, 68, 0.6)"}
                    strokeWidth="0.35" />
                <text x={1.2} y={3.2} fontSize="2.1" fill={t.completed ? "#4ade80" : "#f87171"}
                    fontWeight="bold" fontFamily="Inter, sans-serif">
                    {t.player || 'Unknown Player'}
                </text>
                <text x={1.2} y={6.2} fontSize="1.8" fill="rgba(255,255,255,0.8)" fontFamily="Inter, sans-serif">
                    {t.completed ? (t.receiver ? `To ${t.receiver}` : 'Success') : 'Incomplete'}
                </text>
                <text x={22} y={6.2} fontSize="1.7" fill="rgba(255,255,255,0.5)" fontFamily="Inter, sans-serif">
                    {t.minute ? `${t.minute}'` : ''}
                </text>
            </g>
        );
    };

    return (
        <div>
            {/* Controls */}
            {/* Controls */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem', marginBottom: '1.2rem' }}>
                <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap', alignItems: 'center' }}>
                    {/* Grid Size */}
                    <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                        <span style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)', fontWeight: '500' }}>Grid Size:</span>
                        {[
                            { id: '8x4', cols: 8, rows: 4 },
                            { id: '10x5', cols: 10, rows: 5 },
                            { id: '12x6', cols: 12, rows: 6 }
                        ].map(btn => (
                            <button
                                key={btn.id}
                                onClick={() => setGridConfig({ cols: btn.cols, rows: btn.rows, label: btn.id })}
                                style={{
                                    background: gridConfig.label === btn.id ? 'rgba(168, 85, 247, 0.15)' : 'rgba(255,255,255,0.05)',
                                    color: gridConfig.label === btn.id ? 'rgb(192, 132, 252)' : 'var(--color-text-secondary)',
                                    border: gridConfig.label === btn.id ? '1px solid rgba(168, 85, 247, 0.4)' : '1px solid rgba(255,255,255,0.12)',
                                    borderRadius: '6px',
                                    padding: '0.25rem 0.6rem',
                                    cursor: 'pointer',
                                    fontSize: '0.75rem',
                                    transition: 'all 0.2s',
                                }}
                            >
                                {btn.id}
                            </button>
                        ))}
                    </div>

                    {/* Direction Filter */}
                    <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                        <span style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)', fontWeight: '500' }}>Pass:</span>
                        {[
                            { id: 'all', label: 'All' },
                            { id: 'forward', label: 'Forward' },
                            { id: 'horizontal', label: 'Horizontal' },
                            { id: 'backwards', label: 'Backwards' }
                        ].map(btn => (
                            <button
                                key={btn.id}
                                onClick={() => setDirectionFilter(btn.id)}
                                style={{
                                    background: directionFilter === btn.id ? 'rgba(56, 189, 248, 0.15)' : 'rgba(255,255,255,0.05)',
                                    color: directionFilter === btn.id ? 'rgb(56, 189, 248)' : 'var(--color-text-secondary)',
                                    border: directionFilter === btn.id ? '1px solid rgba(56, 189, 248, 0.4)' : '1px solid rgba(255,255,255,0.12)',
                                    borderRadius: '6px',
                                    padding: '0.2rem 0.5rem',
                                    cursor: 'pointer',
                                    fontSize: '0.7rem',
                                    transition: 'all 0.2s',
                                }}
                            >
                                {btn.label}
                            </button>
                        ))}
                    </div>
                    
                    {/* Hide Pass Arrows */}
                    <button 
                        onClick={() => setShowArrows(!showArrows)}
                        style={{
                            background: showArrows ? 'rgba(255,255,255,0.1)' : 'rgba(255,255,255,0.05)',
                            color: 'var(--color-text-primary)',
                            border: '1px solid rgba(255,255,255,0.2)',
                            borderRadius: '4px',
                            padding: '0.25rem 0.6rem',
                            cursor: 'pointer',
                            fontSize: '0.75rem',
                            transition: 'all 0.2s',
                            fontWeight: '500',
                            marginLeft: 'auto'
                        }}
                    >
                        {showArrows ? 'Hide Pass Arrows' : 'Show Pass Arrows'}
                    </button>
                </div>

                {/* Legend */}
                <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', fontSize: '0.75rem', color: 'var(--color-text-secondary)' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                        <span style={{ width: 12, height: 2, background: 'rgba(34, 197, 94, 0.8)' }} /> Complete Pass
                    </span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                        <span style={{ width: 12, height: 2, background: 'rgba(239, 68, 68, 0.8)' }} /> Incomplete Pass
                    </span>
                </div>
            </div>

            {/* Pitch SVG */}
            <div style={{ width: '100%', borderRadius: '8px', overflow: 'hidden' }}>
                <svg
                    viewBox={`-2 -2 ${PITCH_L + 4} ${PITCH_W + 4}`}
                    style={{ width: '100%', height: '100%', backgroundColor: '#0e1420', borderRadius: '8px', boxShadow: '0 4px 20px rgba(0,0,0,0.5)' }}
                >
                    {renderDefs()}
                    {renderZones()}
                    {renderPitch()}
                    {showArrows && data.map((t, idx) => renderPass(t, idx))}
                </svg>
            </div>
            
            {transitions && transitions.length > 0 && (() => {
                const getStats = (dir) => {
                    const group = transitions.filter(t => t.passDirection === dir);
                    const completed = group.filter(t => t.completed).length;
                    return { total: group.length, completed };
                };
                
                const fwd = getStats('forward');
                const horiz = getStats('horizontal');
                const back = getStats('backwards');
                
                const renderStatItem = (label, arrow, stats) => {
                    if (stats.total === 0) return null;
                    const pct = Math.round((stats.completed / stats.total) * 100);
                    return (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', background: 'rgba(255,255,255,0.03)', padding: '0.25rem 0.5rem', borderRadius: '4px', border: '1px solid rgba(255,255,255,0.05)' }}>
                            <span style={{ fontSize: '0.8rem', color: 'var(--color-text-primary)' }}>{arrow}</span>
                            <span style={{ fontWeight: '500' }}>{label}:</span>
                            <strong style={{ color: 'var(--color-text-primary)' }}>{stats.total}</strong>
                            <span style={{ fontSize: '0.7rem', color: pct >= 75 ? '#4ade80' : pct >= 50 ? '#fde047' : '#f87171' }}>
                                ({stats.completed}/{stats.total} - {pct}%)
                            </span>
                        </div>
                    );
                };

                return (
                    <div style={{ marginTop: '0.75rem', display: 'flex', flexWrap: 'wrap', gap: '0.8rem', fontSize: '0.75rem', color: 'var(--color-text-secondary)', alignItems: 'center', justifyContent: 'space-between' }}>
                        <div>
                            Showing <strong style={{ color: 'var(--color-text-primary)' }}>{data.length}</strong> transition passes
                        </div>
                        <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
                            {renderStatItem('Backwards', '←', back)}
                            {renderStatItem('Horizontal', '↔', horiz)}
                            {renderStatItem('Forward', '→', fwd)}
                        </div>
                    </div>
                );
            })()}
        </div>
    );
};

export default TransitionMap;
