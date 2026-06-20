import React, { useState, useMemo } from 'react';

const PossessionStyleChart = ({ data, getBadge }) => {
    const [hoveredTeam, setHoveredTeam] = useState(null);

    // Filter out teams with no possessions to avoid NaN or dividing by zero errors
    const validData = useMemo(() => {
        return (data || []).filter(d => d.totalPossessions > 0);
    }, [data]);

    // Calculate dynamic bounds with padding
    const { minX, maxX, minY, maxY } = useMemo(() => {
        if (validData.length === 0) return { minX: 0, maxX: 10, minY: 0, maxY: 10 };
        
        let minX = Math.min(...validData.map(d => d.passesPerPossession));
        let maxX = Math.max(...validData.map(d => d.passesPerPossession));
        let minY = Math.min(...validData.map(d => d.avgPassProgression));
        let maxY = Math.max(...validData.map(d => d.avgPassProgression));

        // Avoid infinite bounds if all values are identical
        if (minX === maxX) { minX -= 1; maxX += 1; }
        if (minY === maxY) { minY -= 1; maxY += 1; }

        // Add 15% padding
        const padX = (maxX - minX) * 0.15;
        const padY = (maxY - minY) * 0.15;

        return {
            minX: Math.max(0, minX - padX),
            maxX: maxX + padX,
            minY: Math.max(0, minY - padY),
            maxY: maxY + padY
        };
    }, [validData]);

    if (validData.length === 0) {
        return (
            <div style={{ color: 'var(--color-text-secondary)', padding: '3rem', textAlign: 'center', background: '#1a1f24', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)' }}>
                No possession data available for the selected matches.
            </div>
        );
    }

    // Averages across the league to draw quadrant lines
    const leagueAvgX = validData.reduce((acc, d) => acc + d.passesPerPossession, 0) / validData.length;
    const leagueAvgY = validData.reduce((acc, d) => acc + d.avgPassProgression, 0) / validData.length;

    // SVG dimensions and margins
    const svgWidth = 800;
    const svgHeight = 500;
    const margin = { top: 40, right: 40, bottom: 60, left: 70 };
    const chartWidth = svgWidth - margin.left - margin.right;
    const chartHeight = svgHeight - margin.top - margin.bottom;

    // Coordinate mapping functions
    const mapX = (val) => margin.left + ((val - minX) / (maxX - minX)) * chartWidth;
    const mapY = (val) => margin.top + chartHeight - ((val - minY) / (maxY - minY)) * chartHeight;

    // Grid ticks
    const xTicks = 5;
    const yTicks = 5;
    const gridLinesX = Array.from({ length: xTicks + 1 }).map((_, i) => minX + (i * (maxX - minX) / xTicks));
    const gridLinesY = Array.from({ length: yTicks + 1 }).map((_, i) => minY + (i * (maxY - minY) / yTicks));

    return (
        <div style={{ position: 'relative', width: '100%', maxWidth: '800px', margin: '0 auto', background: '#13171a', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)', overflow: 'hidden' }}>
            <svg width="100%" height="100%" viewBox={`0 0 ${svgWidth} ${svgHeight}`} style={{ display: 'block', overflow: 'visible' }}>
                <defs>
                    <style>
                        {`
                            .grid-line { stroke: rgba(255,255,255,0.05); stroke-width: 1; }
                            .axis-line { stroke: rgba(255,255,255,0.2); stroke-width: 1.5; }
                            .quadrant-line { stroke: rgba(6, 182, 212, 0.4); stroke-width: 1; stroke-dasharray: 6 4; }
                            .axis-label { fill: rgba(255,255,255,0.5); font-size: 12px; text-anchor: middle; }
                            .axis-title { fill: rgba(255,255,255,0.7); font-size: 14px; font-weight: bold; text-anchor: middle; letter-spacing: 1px; }
                            .team-node { transition: all 0.2s ease; cursor: pointer; }
                            .team-node:hover { transform: scale(1.15); }
                            .team-node.faded { opacity: 0.2; }
                        `}
                    </style>
                    <filter id="glow">
                        <feGaussianBlur stdDeviation="2.5" result="coloredBlur"/>
                        <feMerge>
                            <feMergeNode in="coloredBlur"/>
                            <feMergeNode in="SourceGraphic"/>
                        </feMerge>
                    </filter>
                </defs>

                {/* X-Axis Grid & Labels */}
                {gridLinesX.map((val, i) => (
                    <g key={`gx-${i}`}>
                        <line x1={mapX(val)} y1={margin.top} x2={mapX(val)} y2={svgHeight - margin.bottom} className="grid-line" />
                        <text x={mapX(val)} y={svgHeight - margin.bottom + 20} className="axis-label">{val.toFixed(1)}</text>
                    </g>
                ))}

                {/* Y-Axis Grid & Labels */}
                {gridLinesY.map((val, i) => (
                    <g key={`gy-${i}`}>
                        <line x1={margin.left} y1={mapY(val)} x2={svgWidth - margin.right} y2={mapY(val)} className="grid-line" />
                        <text x={margin.left - 15} y={mapY(val) + 4} className="axis-label" textAnchor="end">{val.toFixed(1)}</text>
                    </g>
                ))}

                {/* League Average Quadrant Lines */}
                <line x1={mapX(leagueAvgX)} y1={margin.top} x2={mapX(leagueAvgX)} y2={svgHeight - margin.bottom} className="quadrant-line" />
                <line x1={margin.left} y1={mapY(leagueAvgY)} x2={svgWidth - margin.right} y2={mapY(leagueAvgY)} className="quadrant-line" />
                
                {/* Axes */}
                <line x1={margin.left} y1={svgHeight - margin.bottom} x2={svgWidth - margin.right} y2={svgHeight - margin.bottom} className="axis-line" />
                <line x1={margin.left} y1={margin.top} x2={margin.left} y2={svgHeight - margin.bottom} className="axis-line" />

                {/* Axis Titles */}
                <text x={margin.left + chartWidth / 2} y={svgHeight - 15} className="axis-title">Passes per Possession</text>
                <text x={- (margin.top + chartHeight / 2)} y={20} transform="rotate(-90)" className="axis-title">Avg. Progressive Distance per Pass (meters)</text>

                {/* Data Points (Badges) */}
                {validData.map((d, i) => {
                    const cx = mapX(d.passesPerPossession);
                    const cy = mapY(d.avgPassProgression);
                    const isHovered = hoveredTeam === d.team;
                    const isFaded = hoveredTeam && hoveredTeam !== d.team;
                    const badge = getBadge ? getBadge(d.team) : null;

                    return (
                        <g 
                            key={d.team} 
                            className={`team-node ${isFaded ? 'faded' : ''}`}
                            style={{ transformOrigin: `${cx}px ${cy}px` }}
                            onMouseEnter={() => setHoveredTeam(d.team)}
                            onMouseLeave={() => setHoveredTeam(null)}
                        >
                            {badge ? (
                                <image href={badge} xlinkHref={badge} x={cx - 16} y={cy - 16} width="32" height="32" preserveAspectRatio="xMidYMid meet" style={{ filter: isHovered ? 'drop-shadow(0px 0px 8px rgba(6,182,212,0.8))' : 'drop-shadow(0px 2px 4px rgba(0,0,0,0.5))' }} />
                            ) : (
                                <circle 
                                    cx={cx} 
                                    cy={cy} 
                                    r={8} 
                                    fill={isHovered ? 'var(--color-accent-blue)' : 'var(--color-accent-red)'}
                                    stroke="#fff"
                                    strokeWidth="2"
                                />
                            )}
                        </g>
                    );
                })}
            </svg>

            {/* Custom Tooltip */}
            {hoveredTeam && (
                (() => {
                    const d = validData.find(t => t.team === hoveredTeam);
                    if (!d) return null;
                    const cx = mapX(d.passesPerPossession);
                    const cy = mapY(d.avgPassProgression);
                    
                    // Tooltip positioning: below the badge by default, above if too close to the bottom
                    let top = cy + 20;
                    if (cy > svgHeight - 140) {
                        top = cy - 130; // position above if near bottom
                    }

                    const getOrdinal = (n) => {
                        if (!n) return '';
                        const s = ["th", "st", "nd", "rd"], v = n % 100;
                        return n + (s[(v - 20) % 10] || s[v] || s[0]);
                    };

                    return (
                        <div style={{
                            position: 'absolute',
                            left: `${(cx / svgWidth) * 100}%`,
                            top: `${(top / svgHeight) * 100}%`,
                            transform: 'translate(-50%, 0)', // Center horizontally relative to badge
                            background: 'rgba(0,0,0,0.9)',
                            border: '1px solid var(--color-accent-blue)',
                            padding: '0.6rem 0.8rem',
                            borderRadius: '8px',
                            boxShadow: '0 8px 16px rgba(0,0,0,0.5)',
                            pointerEvents: 'none',
                            zIndex: 100,
                            minWidth: '200px',
                            backdropFilter: 'blur(4px)'
                        }}>
                            <div style={{ color: '#fff', fontWeight: 'bold', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '0.4rem', marginBottom: '0.4rem', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.9rem' }}>
                                {getBadge && getBadge(d.team) && <img src={getBadge(d.team)} alt="" style={{ width: '16px', height: '16px', objectFit: 'contain' }} />}
                                {d.team}
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', fontSize: '0.75rem', color: 'var(--color-text-secondary)' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                    <span>Passes / Poss:</span>
                                    <span>
                                        <b style={{ color: '#fff' }}>{d.passesPerPossession.toFixed(2)}</b> 
                                        {d.rankPasses && <span style={{ color: 'var(--color-accent-blue)', marginLeft: '3px' }}>({getOrdinal(d.rankPasses)})</span>}
                                    </span>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                    <span>Avg. Progression:</span>
                                    <span>
                                        <b style={{ color: '#fff' }}>{d.avgPassProgression.toFixed(1)}m</b>
                                        {d.rankProgression && <span style={{ color: 'var(--color-accent-blue)', marginLeft: '3px' }}>({getOrdinal(d.rankProgression)})</span>}
                                    </span>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px dashed rgba(255,255,255,0.1)', paddingTop: '4px', marginTop: '2px' }}>
                                    <span>Pass Accuracy:</span>
                                    <span>
                                        <b style={{ color: '#fff' }}>{d.passAccuracy ? d.passAccuracy.toFixed(1) : 0}%</b>
                                        {d.rankAccuracy && <span style={{ color: 'var(--color-accent-blue)', marginLeft: '3px' }}>({getOrdinal(d.rankAccuracy)})</span>}
                                    </span>
                                </div>
                            </div>
                        </div>
                    );
                })()
            )}
        </div>
    );
};

export default PossessionStyleChart;
