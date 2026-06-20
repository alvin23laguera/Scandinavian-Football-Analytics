import React, { useState } from 'react';

const PITCH_L = 105;
const PITCH_W = 68;

const DefensiveTransitionMap = ({ transitions }) => {
    const [gridConfig, setGridConfig] = useState({ cols: 8, rows: 4, label: '8x4' });

    const data = transitions || [];

    // --- Compute zone heatmap ---
    // We use startX and startY because we want to see where possession was lost
    const COLS = gridConfig.cols;
    const ROWS = gridConfig.rows;
    const ZONE_W = PITCH_L / COLS;
    const ZONE_H = PITCH_W / ROWS;

    const zoneData = Array.from({ length: COLS * ROWS }, () => ({ total: 0 }));
    const colTotals = Array(COLS).fill(0);
    const rowTotals = Array(ROWS).fill(0);

    data.forEach(t => {
        // startX/startY represent where the opponent recovered the ball
        const col = Math.min(Math.floor((t.startX / 100) * COLS), COLS - 1);
        const row = Math.min(Math.floor((t.startY / 100) * ROWS), ROWS - 1);
        const idx = row * COLS + col;
        if (idx >= 0 && idx < zoneData.length) {
            zoneData[idx].total++;
            colTotals[col]++;
            rowTotals[row]++;
        }
    });

    const maxCount = Math.max(...zoneData.map(d => d.total), 1);

    // Multi-stop scale based on volume
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

    // --- Marginals ---
    const renderMarginals = () => (
        <g>
            {/* Column Totals (Bottom) */}
            {colTotals.map((total, col) => (
                <text
                    key={`col-${col}`}
                    x={col * ZONE_W + ZONE_W / 2}
                    y={PITCH_W + 4}
                    textAnchor="middle"
                    fontSize="2.2"
                    fontFamily="Inter, sans-serif"
                    fill="rgba(255,255,255,0.8)"
                    fontWeight="600"
                >
                    {total}
                </text>
            ))}
            
            {/* Row Totals (Right) */}
            {rowTotals.map((total, row) => (
                <text
                    key={`row-${row}`}
                    x={PITCH_L + 3.5}
                    y={row * ZONE_H + ZONE_H / 2}
                    textAnchor="middle"
                    dominantBaseline="central"
                    fontSize="2.2"
                    fontFamily="Inter, sans-serif"
                    fill="rgba(255,255,255,0.8)"
                    fontWeight="600"
                >
                    {total}
                </text>
            ))}
        </g>
    );

    // --- Danger Dots ---
    const renderDangerDots = () => {
        return data.filter(t => t.ledToShot).map(t => {
            const cx = (t.startX / 100) * PITCH_L;
            const cy = (t.startY / 100) * PITCH_W;
            return (
                <g key={`danger-${t.id}`}>
                    <circle cx={cx} cy={cy} r="2.2" fill="rgba(57, 255, 20, 0.25)" />
                    <circle cx={cx} cy={cy} r="0.9" fill="#39FF14" stroke="rgba(0,0,0,0.8)" strokeWidth="0.3" />
                </g>
            );
        });
    };

    return (
        <div>
            {/* Controls */}
            <div style={{ display: 'flex', gap: '1.5rem', marginBottom: '1.2rem', flexWrap: 'wrap', alignItems: 'center' }}>
                <div style={{ display: 'flex', gap: '0.6rem', alignItems: 'center' }}>
                    <span style={{ fontSize: '0.78rem', color: 'var(--color-text-secondary)', fontWeight: '500' }}>Grid Size:</span>
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
                                padding: '0.3rem 0.75rem',
                                cursor: 'pointer',
                                fontSize: '0.8rem',
                                transition: 'all 0.2s',
                            }}
                        >
                            {btn.id}
                        </button>
                    ))}
                </div>
                <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', marginLeft: 'auto', fontSize: '0.75rem', color: 'var(--color-text-secondary)' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                        <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#39FF14', border: '1px solid rgba(0,0,0,0.8)', display: 'inline-block', boxShadow: '0 0 4px rgba(57, 255, 20, 0.5)' }} /> 
                        Led to Shot (20s)
                    </span>
                </div>
            </div>

            {/* Pitch SVG */}
            <div style={{ width: '100%', borderRadius: '8px', overflow: 'hidden' }}>
                <svg
                    viewBox={`-2 -2 ${PITCH_L + 7} ${PITCH_W + 7}`}
                    style={{ width: '100%', height: '100%', backgroundColor: '#0e1420', borderRadius: '8px', boxShadow: '0 4px 20px rgba(0,0,0,0.5)' }}
                >
                    {renderZones()}
                    {renderPitch()}
                    {renderDangerDots()}
                    {renderMarginals()}
                </svg>
            </div>
            
            {data.length > 0 && (() => {
                const shots = data.filter(t => t.ledToShot).length;
                const goals = data.filter(t => t.ledToGoal).length;
                return (
                    <div style={{ marginTop: '0.75rem', fontSize: '0.82rem', color: 'var(--color-text-secondary)', display: 'flex', gap: '1rem', alignItems: 'center' }}>
                        <span>
                            Showing <strong style={{ color: 'var(--color-text-primary)' }}>{data.length}</strong> possessions lost
                        </span>
                        <span>
                            (<strong style={{ color: '#f87171' }}>{shots}</strong> led to a shot, <strong style={{ color: '#f87171' }}>{goals}</strong> ended in a goal)
                        </span>
                    </div>
                );
            })()}
        </div>
    );
};

export default DefensiveTransitionMap;
