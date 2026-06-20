import React, { useState } from 'react';

// Full pitch dimensions
const PITCH_L = 105;
const PITCH_W = 68;

// 6 columns × 3 rows = 18 zones
const COLS = 6;
const ROWS = 3;
const ZONE_W = PITCH_L / COLS;   // 17.5 m
const ZONE_H = PITCH_W / ROWS;   // ~22.67 m

const BallRecoveryMap = ({ recoveries }) => {
    const [hoveredEvent, setHoveredEvent] = useState(null);
    const [viewSection, setViewSection] = useState('full'); // 'full', 'opp_half', 'final_third'
    const [labelMode, setLabelMode] = useState('total'); // 'total', 'percentage'
    const [showDots, setShowDots] = useState(true);

    const data = recoveries || [];

    // --- Filter data based on view section ---
    const filteredData = data.filter(r => {
        if (viewSection === 'opp_half') return r.x >= 50;
        if (viewSection === 'final_third') return r.x >= 66.666;
        return true;
    });

    // --- Compute top player ---
    const getTopPlayer = (recoveriesList) => {
        if (!recoveriesList || recoveriesList.length === 0) return null;
        const counts = {};
        let max = 0;
        let topPlayer = null;
        recoveriesList.forEach(r => {
            const player = r.player || 'Unknown Player';
            counts[player] = (counts[player] || 0) + 1;
            if (counts[player] > max) {
                max = counts[player];
                topPlayer = player;
            }
        });
        return { name: topPlayer, count: max };
    };
    const topPlayerInfo = getTopPlayer(filteredData);

    // --- Compute zone heatmap and marginals ---
    const zoneData = Array.from({ length: COLS * ROWS }, () => ({ total: 0 }));
    const colTotals = Array(COLS).fill(0);
    const rowTotals = Array(ROWS).fill(0);

    filteredData.forEach(r => {
        const col = Math.min(Math.floor((r.x / 100) * COLS), COLS - 1);
        const row = Math.min(Math.floor((r.y / 100) * ROWS), ROWS - 1);
        const idx = row * COLS + col;
        zoneData[idx].total++;
        colTotals[col]++;
        rowTotals[row]++;
    });
    const maxCount = Math.max(...zoneData.map(d => d.total), 1);

    const getZoneColor = (count) => {
        if (count === 0) return 'transparent';
        const intensity = Math.pow(count / maxCount, 0.6); // gamma
        return `rgba(239, 68, 68, ${0.1 + intensity * 0.6})`; // Orange-red
    };

    // --- Marginals ---
    const renderMarginals = () => {
        const totalEvents = filteredData.length;
        if (totalEvents === 0) return null;

        return (
            <g>
                {/* Column Totals (Top) */}
                {colTotals.map((count, col) => {
                    if (count === 0) return null;
                    const x = col * ZONE_W + ZONE_W / 2;
                    const pct = Math.round((count / totalEvents) * 100);
                    return (
                        <g key={`col-${col}`}>
                            <text
                                x={x} y={-4}
                                textAnchor="middle" fontSize="2.6"
                                fill="rgba(253, 224, 71, 0.95)"
                                fontFamily="Inter, sans-serif" fontWeight="bold"
                            >
                                {count} <tspan fontSize="1.8" fill="rgba(253, 224, 71, 0.65)">({pct}%)</tspan>
                            </text>
                        </g>
                    );
                })}

                {/* Row Totals (Right side) */}
                {rowTotals.map((count, row) => {
                    if (count === 0) return null;
                    const y = row * ZONE_H + ZONE_H / 2;
                    const pct = Math.round((count / totalEvents) * 100);
                    return (
                        <g key={`row-${row}`}>
                            <text
                                x={PITCH_L + 2.5} y={y}
                                textAnchor="start" dominantBaseline="central" fontSize="2.6"
                                fill="rgba(253, 224, 71, 0.95)"
                                fontFamily="Inter, sans-serif" fontWeight="bold"
                            >
                                {count} <tspan fontSize="1.8" fill="rgba(253, 224, 71, 0.65)">({pct}%)</tspan>
                            </text>
                        </g>
                    );
                })}
            </g>
        );
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

    // --- 6x3 Heatmap Grid ---
    const renderZones = () =>
        Array.from({ length: ROWS }, (_, row) =>
            Array.from({ length: COLS }, (_, col) => {
                const idx = row * COLS + col;
                const d = zoneData[idx];
                const x = col * ZONE_W;
                const y = row * ZONE_H;
                
                let labelText = '';
                if (d.total > 0) {
                    labelText = labelMode === 'total' ? d.total : `${Math.round((d.total / filteredData.length) * 100)}%`;
                }

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
                                fontSize={labelMode === 'percentage' ? "2.2" : "2.8"}
                                fontFamily="Inter, sans-serif"
                                fill={d.total > maxCount * 0.4 ? 'rgba(255,255,255,0.9)' : 'rgba(255,255,255,0.6)'}
                                fontWeight="bold"
                            >
                                {labelText}
                            </text>
                        )}
                    </g>
                );
            })
        );

    // --- Recovery dots ---
    const renderRecovery = (r, idx) => {
        const cx = (r.x / 100) * PITCH_L;
        const cy = (r.y / 100) * PITCH_W;
        const isHovered = hoveredEvent?.id === (r.id || idx);
        const radius = isHovered ? 1.8 : 1.1;
        // Yellow dots for ball recoveries
        const color = 'rgba(253, 224, 71, 0.9)'; // yellow-300

        return (
            <g key={r.id || idx}>
                <circle
                    cx={cx} cy={cy} r={radius}
                    fill={color}
                    stroke="rgba(255,255,255,0.6)"
                    strokeWidth="0.3"
                    style={{ cursor: 'pointer', transition: 'r 0.15s ease' }}
                    onMouseEnter={() => setHoveredEvent(r)}
                    onMouseLeave={() => setHoveredEvent(null)}
                />
                {isHovered && renderTooltip(r, cx, cy)}
            </g>
        );
    };

    // --- Tooltip ---
    const renderTooltip = (r, cx, cy) => {
        const tipW = 24;
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
                    stroke="rgba(253,224,71,0.4)"
                    strokeWidth="0.35" />
                <text x={1.2} y={3.2} fontSize="2.1" fill="#fde047"
                    fontWeight="bold" fontFamily="Inter, sans-serif">
                    {r.player || 'Unknown Player'}
                </text>
                <text x={1.2} y={6.2} fontSize="1.8" fill="rgba(255,255,255,0.8)" fontFamily="Inter, sans-serif">
                    {r.type || 'Ball Recovery'}
                </text>
                <text x={17} y={6.2} fontSize="1.7" fill="rgba(255,255,255,0.5)" fontFamily="Inter, sans-serif">
                    {r.minute ? `${r.minute}'` : ''}
                </text>
            </g>
        );
    };

    const getViewBox = () => {
        // We added margins: y=-10 to y=PITCH_W+10 (height=PITCH_W+20), and extra width for row totals on the right
        if (viewSection === 'opp_half') {
            return `${PITCH_L / 2 - 2} -10 ${PITCH_L / 2 + 16} ${PITCH_W + 16}`;
        }
        if (viewSection === 'final_third') {
            const thirdStart = (PITCH_L * 2) / 3;
            return `${thirdStart - 2} -10 ${PITCH_L / 3 + 16} ${PITCH_W + 16}`;
        }
        return `-2 -10 ${PITCH_L + 20} ${PITCH_W + 16}`;
    };

    return (
        <div>
            {/* Controls */}
            <div style={{ display: 'flex', gap: '1.5rem', marginBottom: '1.2rem', flexWrap: 'wrap', alignItems: 'center' }}>
                <div style={{ display: 'flex', gap: '0.6rem', alignItems: 'center' }}>
                    <span style={{ fontSize: '0.78rem', color: 'var(--color-text-secondary)', fontWeight: '500' }}>Pitch View:</span>
                    {[
                        { id: 'full', label: 'Full Pitch' },
                        { id: 'opp_half', label: 'Opp. Half' },
                        { id: 'final_third', label: 'Final 1/3' }
                    ].map(btn => (
                        <button
                            key={btn.id}
                            onClick={() => setViewSection(btn.id)}
                            style={{
                                background: viewSection === btn.id ? 'rgba(239, 68, 68, 0.15)' : 'rgba(255,255,255,0.05)',
                                color: viewSection === btn.id ? 'rgb(248, 113, 113)' : 'var(--color-text-secondary)',
                                border: viewSection === btn.id ? '1px solid rgba(239, 68, 68, 0.4)' : '1px solid rgba(255,255,255,0.12)',
                                borderRadius: '6px',
                                padding: '0.3rem 0.75rem',
                                cursor: 'pointer',
                                fontSize: '0.8rem',
                                transition: 'all 0.2s',
                            }}
                        >
                            {btn.label}
                        </button>
                    ))}
                </div>

                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
                    <div style={{ display: 'flex', gap: '0.6rem', alignItems: 'center' }}>
                        <span style={{ fontSize: '0.78rem', color: 'var(--color-text-secondary)', fontWeight: '500' }}>Grid Label:</span>
                        {[
                            { id: 'total', label: 'Total' },
                            { id: 'percentage', label: '%' }
                        ].map(btn => (
                            <button
                                key={btn.id}
                                onClick={() => setLabelMode(btn.id)}
                                style={{
                                    background: labelMode === btn.id ? 'rgba(56,189,248,0.15)' : 'rgba(255,255,255,0.05)',
                                    color: labelMode === btn.id ? 'var(--color-accent-blue)' : 'var(--color-text-secondary)',
                                    border: labelMode === btn.id ? '1px solid rgba(56,189,248,0.4)' : '1px solid rgba(255,255,255,0.12)',
                                    borderRadius: '6px',
                                    padding: '0.3rem 0.75rem',
                                    cursor: 'pointer',
                                    fontSize: '0.8rem',
                                    transition: 'all 0.2s',
                                }}
                            >
                                {btn.label}
                            </button>
                        ))}
                    </div>
                    {/* Toggle Dots Button */}
                    <button
                        onClick={() => setShowDots(!showDots)}
                        style={{
                            background: 'transparent',
                            color: showDots ? 'var(--color-text-secondary)' : 'rgba(255,255,255,0.3)',
                            border: 'none',
                            cursor: 'pointer',
                            fontSize: '0.7rem',
                            textDecoration: 'underline',
                            textAlign: 'left',
                            padding: 0,
                            paddingLeft: '4.5rem', // Aligns roughly with the buttons
                            marginTop: '0.3rem'
                        }}
                    >
                        {showDots ? 'Hide Recovery Dots' : 'Show Recovery Dots'}
                    </button>
                </div>

                <div style={{ display: 'flex', gap: '0.6rem', alignItems: 'center', marginLeft: 'auto' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.78rem', color: 'var(--color-text-secondary)' }}>
                        <span style={{ width: 8, height: 8, borderRadius: '50%', background: 'rgba(253, 224, 71, 0.9)', display: 'inline-block' }} />
                        Recovery
                    </span>
                </div>
            </div>

            {/* Pitch SVG */}
            <div style={{ width: '100%', borderRadius: '8px', overflow: 'hidden' }}>
                <svg
                    viewBox={getViewBox()}
                    style={{ width: '100%', height: '100%', backgroundColor: '#0e1420', borderRadius: '8px', boxShadow: '0 4px 20px rgba(0,0,0,0.5)', transition: 'all 0.5s ease-in-out' }}
                >
                    {/* Heatmap zones */}
                    {renderZones()}
                    {/* Pitch lines */}
                    {renderPitch()}
                    {/* Marginals */}
                    {renderMarginals()}
                    {/* Recovery dots */}
                    {showDots && filteredData.map((r, idx) => renderRecovery(r, idx))}
                </svg>
            </div>

            {/* Stats bar */}
            {filteredData.length > 0 && (
                <div style={{ marginTop: '0.75rem', display: 'flex', gap: '2rem', fontSize: '0.82rem', color: 'var(--color-text-secondary)', alignItems: 'center' }}>
                    <span>
                        <strong style={{ color: 'var(--color-text-primary)' }}>{filteredData.length}</strong> recoveries in view
                    </span>
                    {topPlayerInfo && (
                        <span>
                            Top recoverer: <strong style={{ color: '#fde047' }}>{topPlayerInfo.name}</strong> ({topPlayerInfo.count})
                        </span>
                    )}
                </div>
            )}
            {filteredData.length === 0 && (
                <div style={{ marginTop: '0.75rem', fontSize: '0.85rem', color: 'var(--color-text-secondary)', textAlign: 'center', padding: '1rem' }}>
                    No ball recoveries in this section.
                </div>
            )}
        </div>
    );
};

export default BallRecoveryMap;
