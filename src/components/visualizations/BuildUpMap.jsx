import React, { useState } from 'react';

// Full pitch dimensions
const PITCH_L = 105;
const PITCH_W = 68;

// 6 columns × 3 rows = 18 zones
const COLS = 6;
const ROWS = 3;
const ZONE_W = PITCH_L / COLS;   // 17.5 m
const ZONE_H = PITCH_W / ROWS;   // ~22.67 m

// Map event type to readable label
const TYPE_LABELS = {
    goalKick: 'Goal Kick',
    freekick: 'Free Kick',
    gkPass:   'GK Pass',
};

const BuildUpMap = ({ passes }) => {
    const [hoveredPass, setHoveredPass] = useState(null);
    const [labelMode, setLabelMode] = useState('total'); // 'total', 'completed', 'precision'
    const [filterTypes, setFilterTypes] = useState(['goalKick', 'freekick', 'gkPass']);

    const filteredPasses = (passes || []).filter(p => filterTypes.includes(p.type));

    // --- Compute zone heatmap and stats ---
    const zoneData = Array.from({ length: COLS * ROWS }, () => ({ total: 0, completed: 0 }));
    const colData = Array.from({ length: COLS }, () => ({ total: 0, completed: 0 }));
    const rowData = Array.from({ length: ROWS }, () => ({ total: 0, completed: 0 }));

    filteredPasses.forEach(p => {
        const col = Math.min(Math.floor((p.x / 100) * COLS), COLS - 1);
        const row = Math.min(Math.floor((p.y / 100) * ROWS), ROWS - 1);
        const idx = row * COLS + col;
        
        zoneData[idx].total++;
        colData[col].total++;
        rowData[row].total++;
        
        if (p.completed) {
            zoneData[idx].completed++;
            colData[col].completed++;
            rowData[row].completed++;
        }
    });
    const maxCount = Math.max(...zoneData.map(d => d.total), 1);

    const getZoneColor = (count) => {
        if (count === 0) return 'transparent';
        const intensity = Math.pow(count / maxCount, 0.6); // gamma for better visual spread
        return `rgba(34, 197, 94, ${0.08 + intensity * 0.58})`;
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

    // --- Marginals ---
    const renderMarginals = () => {
        const overallTotal = filteredPasses.length;
        const overallCompleted = filteredPasses.filter(p => p.completed).length;
        if (overallTotal === 0) return null;

        const getLabel = (data) => {
            let val = '';
            let pctVal = '';
            if (labelMode === 'total') {
                const pct = Math.round((data.total / overallTotal) * 100);
                val = `${data.total}`;
                pctVal = `(${pct}%)`;
            } else if (labelMode === 'completed') {
                if (overallCompleted === 0) {
                    val = `${data.completed}`;
                    pctVal = `(0%)`;
                } else {
                    const pct = Math.round((data.completed / overallCompleted) * 100);
                    val = `${data.completed}`;
                    pctVal = `(${pct}%)`;
                }
            } else if (labelMode === 'precision') {
                const pct = Math.round((data.completed / data.total) * 100);
                val = `${data.completed}/${data.total}`;
                pctVal = `(${pct}%)`;
            }
            
            return (
                <>
                    <tspan>{val}</tspan>
                    <tspan fontSize="1.8" fill="rgba(255, 255, 255, 0.5)" dx="1.5">{pctVal}</tspan>
                </>
            );
        };

        return (
            <g>
                {/* Column Totals (Top) */}
                {colData.map((data, col) => {
                    if (data.total === 0) return null;
                    const x = col * ZONE_W + ZONE_W / 2;
                    return (
                        <g key={`col-${col}`}>
                            <text
                                x={x} y={-4}
                                textAnchor="middle" fontSize="2.6"
                                fill="rgba(255, 255, 255, 0.9)"
                                fontFamily="Inter, sans-serif" fontWeight="bold"
                            >
                                {getLabel(data)}
                            </text>
                        </g>
                    );
                })}

                {/* Row Totals (Right side) */}
                {rowData.map((data, row) => {
                    if (data.total === 0) return null;
                    const y = row * ZONE_H + ZONE_H / 2;
                    return (
                        <g key={`row-${row}`}>
                            <text
                                x={PITCH_L + 2.5} y={y}
                                textAnchor="start" dominantBaseline="central" fontSize="2.6"
                                fill="rgba(255, 255, 255, 0.9)"
                                fontFamily="Inter, sans-serif" fontWeight="bold"
                            >
                                {getLabel(data)}
                            </text>
                        </g>
                    );
                })}
            </g>
        );
    };

    // --- 6x3 Heatmap Grid ---
    const renderZones = () =>
        Array.from({ length: ROWS }, (_, row) =>
            Array.from({ length: COLS }, (_, col) => {
                const idx = row * COLS + col;
                const data = zoneData[idx];
                const x = col * ZONE_W;
                const y = row * ZONE_H;

                let label = '';
                if (labelMode === 'total') label = data.total;
                else if (labelMode === 'completed') label = data.completed;
                else if (labelMode === 'precision') label = `${data.completed}/${data.total}`;

                return (
                    <g key={idx}>
                        <rect
                            x={x} y={y}
                            width={ZONE_W} height={ZONE_H}
                            fill={getZoneColor(data.total)}
                            stroke="rgba(255,255,255,0.08)"
                            strokeWidth="0.3"
                        />
                        {data.total > 0 && (
                            <text
                                x={x + ZONE_W / 2}
                                y={y + ZONE_H / 2}
                                textAnchor="middle"
                                dominantBaseline="central"
                                fontSize={labelMode === 'precision' ? "2.3" : "2.8"}
                                fontFamily="Inter, sans-serif"
                                fill={data.total > maxCount * 0.4 ? 'rgba(255,255,255,0.9)' : 'rgba(255,255,255,0.5)'}
                                fontWeight="bold"
                            >
                                {label}
                            </text>
                        )}
                    </g>
                );
            })
        );

    // --- Pass dots ---
    const renderPass = (p, idx) => {
        const cx = (p.x / 100) * PITCH_L;
        const cy = (p.y / 100) * PITCH_W;
        const isHovered = hoveredPass?.id === (p.id || idx);
        const r = isHovered ? 1.8 : 1.1;
        const color = p.completed ? 'rgba(74, 222, 128, 0.9)' : 'rgba(248, 113, 113, 0.9)';

        return (
            <g key={p.id || idx}>
                <circle
                    cx={cx} cy={cy} r={r}
                    fill={color}
                    stroke={p.completed ? 'rgba(255,255,255,0.6)' : 'rgba(255,255,255,0.4)'}
                    strokeWidth="0.3"
                    style={{ cursor: 'pointer', /* removed transition for html2canvas compatibility */ }}
                    onMouseEnter={() => setHoveredPass(p)}
                    onMouseLeave={() => setHoveredPass(null)}
                />
                {isHovered && renderTooltip(p, cx, cy)}
            </g>
        );
    };

    // --- Tooltip ---
    const renderTooltip = (p, cx, cy) => {
        const tipW = 24;
        const tipH = 11;
        const nearRight = cx > PITCH_L * 0.72;
        const nearTop = cy < PITCH_W * 0.2;
        const tx = nearRight ? cx - tipW - 2 : cx + 2;
        const ty = nearTop ? cy + 1 : cy - tipH - 1;
        const pivotX = tx + tipW / 2;
        const pivotY = ty + tipH / 2;

        return (
            <g transform={`translate(${tx}, ${ty})`} style={{ pointerEvents: 'none' }}>
                <rect x={0.4} y={0.4} width={tipW} height={tipH} rx="1.2" fill="rgba(0,0,0,0.45)" />
                <rect x={0} y={0} width={tipW} height={tipH} rx="1.2"
                    fill="rgba(10,15,25,0.94)"
                    stroke={p.completed ? 'rgba(74,222,128,0.4)' : 'rgba(248,113,113,0.4)'}
                    strokeWidth="0.35" />
                <text x={1.2} y={3.2} fontSize="2.1" fill={p.completed ? '#4ade80' : '#f87171'}
                    fontWeight="bold" fontFamily="Inter, sans-serif">
                    {p.player}
                </text>
                <text x={1.2} y={6.2} fontSize="1.8" fill="rgba(255,255,255,0.8)" fontFamily="Inter, sans-serif">
                    {TYPE_LABELS[p.type] || p.type}
                    {p.completed && p.receiver ? ` - ${p.receiver}` : ''}
                </text>
                <text x={1.2} y={9.2} fontSize="1.7" fill="rgba(255,255,255,0.5)" fontFamily="Inter, sans-serif">
                    {p.minute}'
                </text>
            </g>
        );
    };

    const completed = filteredPasses.filter(p => p.completed).length;
    const incomplete = filteredPasses.filter(p => !p.completed).length;

    return (
        <div>
            {/* Controls */}
            {/* Controls */}
            <div style={{ display: 'flex', gap: '1.5rem', marginBottom: '1.2rem', flexWrap: 'wrap', alignItems: 'center' }}>
                <div style={{ display: 'flex', gap: '0.6rem', alignItems: 'center' }}>
                    <span style={{ fontSize: '0.78rem', color: 'var(--color-text-secondary)', fontWeight: '500' }}>Event Type:</span>
                    {Object.entries(TYPE_LABELS).map(([key, label]) => {
                        const active = filterTypes.includes(key);
                        return (
                            <button
                                key={key}
                                onClick={() => setFilterTypes(prev =>
                                    active ? prev.filter(t => t !== key) : [...prev, key]
                                )}
                                style={{
                                    background: active ? 'rgba(34,197,94,0.15)' : 'rgba(255,255,255,0.05)',
                                    color: active ? '#4ade80' : 'var(--color-text-secondary)',
                                    border: active ? '1px solid rgba(34,197,94,0.4)' : '1px solid rgba(255,255,255,0.12)',
                                    borderRadius: '6px',
                                    padding: '0.3rem 0.75rem',
                                    cursor: 'pointer',
                                    fontSize: '0.8rem',
                                    transition: 'all 0.2s',
                                }}
                            >
                                {label}
                            </button>
                        );
                    })}
                </div>

                <div style={{ display: 'flex', gap: '0.6rem', alignItems: 'center' }}>
                    <span style={{ fontSize: '0.78rem', color: 'var(--color-text-secondary)', fontWeight: '500' }}>Grid Label:</span>
                    {[
                        { id: 'total', label: 'Total Attempts' },
                        { id: 'completed', label: 'Completed' },
                        { id: 'precision', label: 'Precision' },
                    ].map((mode) => (
                        <button
                            key={mode.id}
                            onClick={() => setLabelMode(mode.id)}
                            style={{
                                background: labelMode === mode.id ? 'rgba(56,189,248,0.15)' : 'rgba(255,255,255,0.05)',
                                color: labelMode === mode.id ? 'var(--color-accent-blue)' : 'var(--color-text-secondary)',
                                border: labelMode === mode.id ? '1px solid rgba(56,189,248,0.4)' : '1px solid rgba(255,255,255,0.12)',
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

                {/* Legend */}
                <div style={{ marginLeft: 'auto', display: 'flex', gap: '1rem', alignItems: 'center', fontSize: '0.78rem', color: 'var(--color-text-secondary)' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                        <span style={{ width: 8, height: 8, borderRadius: '50%', background: 'rgba(74,222,128,0.9)', display: 'inline-block' }} />
                        Complete
                    </span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                        <span style={{ width: 8, height: 8, borderRadius: '50%', background: 'rgba(248,113,113,0.9)', display: 'inline-block' }} />
                        Incomplete
                    </span>
                </div>
            </div>
            <div className="pdf-export-target" style={{ width: '100%', background: 'transparent' }}>

            {/* Full pitch SVG */}
            <div style={{ width: '100%', borderRadius: '8px', overflow: 'hidden' }}>
                <svg
                    viewBox={`-2 -10 ${PITCH_L + 20} ${PITCH_W + 16}`}
                    style={{ width: '100%', height: '100%', backgroundColor: '#0e1420', borderRadius: '8px', boxShadow: '0 4px 20px rgba(0,0,0,0.5)', /* removed transition for html2canvas compatibility */ }}
                >
                    {/* Heatmap zones (behind pitch lines) */}
                    {renderZones()}

                    {/* Pitch lines (on top of heatmap) */}
                    {renderPitch()}

                    {/* Marginals */}
                    {renderMarginals()}

                    {/* Pass dots */}
                    {filteredPasses.map((p, idx) => renderPass(p, idx))}
                </svg>
            </div>

            {/* Stats bar */}
            {filteredPasses.length > 0 && (
                <div style={{ marginTop: '0.75rem', display: 'flex', gap: '2rem', fontSize: '0.82rem', color: 'var(--color-text-secondary)', alignItems: 'center' }}>
                    <span><strong style={{ color: 'var(--color-text-primary)' }}>{filteredPasses.length}</strong> passes shown</span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <span style={{ width: 8, height: 8, borderRadius: '50%', background: 'rgba(74,222,128,0.9)' }} />
                        <strong style={{ color: '#4ade80' }}>{completed}</strong> completed
                    </span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <span style={{ width: 8, height: 8, borderRadius: '50%', background: 'rgba(248,113,113,0.9)' }} />
                        <strong style={{ color: '#f87171' }}>{incomplete}</strong> incomplete
                    </span>
                    <span style={{ marginLeft: 'auto', padding: '0.2rem 0.6rem', background: 'rgba(56,189,248,0.1)', borderRadius: '4px', border: '1px solid rgba(56,189,248,0.2)', color: 'var(--color-accent-blue)' }}>
                        Precision: <strong>{(completed / filteredPasses.length * 100).toFixed(1)}%</strong>
                    </span>
                </div>
            )}
            {filteredPasses.length === 0 && (
                <div style={{ marginTop: '0.75rem', fontSize: '0.85rem', color: 'var(--color-text-secondary)', textAlign: 'center', padding: '1rem' }}>
                    No build-up passes found for current selection.
                </div>
            )}
            </div>
        </div>
    );
};

export default BuildUpMap;
