import React, { useState } from 'react';
import { ResponsiveContainer } from 'recharts';

const DefensiveTransitionScatterChart = ({ leagueData, getBadge }) => {
    const [hoveredTeam, setHoveredTeam] = useState(null);

    if (!leagueData || Object.keys(leagueData).length === 0) {
        return <div style={{ color: 'var(--color-text-secondary)', fontSize: '0.9rem' }}>No transition data available.</div>;
    }

    // Extract valid team data (excluding League Average)
    const teams = Object.keys(leagueData).filter(t => t !== 'League Average');
    const validData = teams.map(team => {
        const raw = leagueData[team].raw || {};
        const rank = leagueData[team].rank || {};
        return {
            team,
            shots20s: raw.defShots20s || 0,
            boxEntriesPct: raw.defBoxEntriesPct || 0,
            boxEntries20s: raw.defBoxEntries20s || 0,
            rankShots: rank.defShots20s,
            rankBoxEntriesPct: rank.defBoxEntriesPct,
            rankBoxEntries: rank.defBoxEntries20s
        };
    }).filter(d => typeof d.shots20s === 'number' && typeof d.boxEntriesPct === 'number');

    if (validData.length === 0) {
        return <div style={{ color: 'var(--color-text-secondary)', fontSize: '0.9rem' }}>No valid transition data available.</div>;
    }

    const leagueAvgData = leagueData['League Average']?.raw || {};
    const leagueAvgX = leagueAvgData.defShots20s || Math.max(...validData.map(d => d.shots20s)) / 2;
    const leagueAvgY = leagueAvgData.defBoxEntriesPct || Math.max(...validData.map(d => d.boxEntriesPct)) / 2;

    const chartWidth = 800;
    const chartHeight = 400;
    const margin = { top: 20, right: 30, bottom: 50, left: 60 };
    const svgWidth = chartWidth + margin.left + margin.right;
    const svgHeight = chartHeight + margin.top + margin.bottom;

    let minX = Math.min(...validData.map(d => d.shots20s)) * 0.9;
    let maxX = Math.max(...validData.map(d => d.shots20s)) * 1.1;
    let minY = Math.min(...validData.map(d => d.boxEntriesPct)) * 0.85;
    let maxY = Math.max(...validData.map(d => d.boxEntriesPct)) * 1.05;

    if (minX === maxX) { minX -= 1; maxX += 1; }
    if (minY === maxY) { minY -= 1; maxY += 1; }
    if (isNaN(minX) || isNaN(maxX)) { minX = 0; maxX = 10; }
    if (isNaN(minY) || isNaN(maxY)) { minY = 0; maxY = 100; }

    // Inversed: Smaller value = further right
    const mapX = (val) => margin.left + ((maxX - val) / (maxX - minX)) * chartWidth;
    // Inversed: Smaller value = higher up (smaller SVG y-coordinate)
    const mapY = (val) => margin.top + ((val - minY) / (maxY - minY)) * chartHeight;

    const gridLinesX = [
        minX, 
        minX + (maxX - minX) * 0.25, 
        minX + (maxX - minX) * 0.5, 
        minX + (maxX - minX) * 0.75, 
        maxX
    ];
    const gridLinesY = [
        minY, 
        minY + (maxY - minY) * 0.25, 
        minY + (maxY - minY) * 0.5, 
        minY + (maxY - minY) * 0.75, 
        maxY
    ];

    return (
        <div style={{ width: '100%', height: '100%', minHeight: '400px', position: 'relative' }}>
            <svg viewBox={`0 0 ${svgWidth} ${svgHeight}`} style={{ width: '100%', height: '100%' }}>
                {/* Defs for styles */}
                <defs>
                    <style>
                        {`
                            .grid-line { stroke: rgba(255,255,255,0.05); stroke-width: 1; stroke-dasharray: 4 4; }
                            .axis-line { stroke: rgba(255,255,255,0.2); stroke-width: 1; }
                            .axis-label { fill: var(--color-text-secondary); font-size: 12px; font-family: sans-serif; text-anchor: middle; }
                            .axis-title { fill: var(--color-text-primary); font-size: 13px; font-family: sans-serif; font-weight: bold; text-anchor: middle; }
                            .quadrant-line { stroke: rgba(6, 182, 212, 0.4); stroke-width: 1; stroke-dasharray: 6 4; }
                            .team-node { transition: all 0.3s ease; }
                            .team-node.faded { opacity: 0.2; }
                            .team-node:hover { z-index: 10; }
                        `}
                    </style>
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
                {!isNaN(leagueAvgX) && <line x1={mapX(leagueAvgX)} y1={margin.top} x2={mapX(leagueAvgX)} y2={svgHeight - margin.bottom} className="quadrant-line" />}
                {!isNaN(leagueAvgY) && <line x1={margin.left} y1={mapY(leagueAvgY)} x2={svgWidth - margin.right} y2={mapY(leagueAvgY)} className="quadrant-line" />}
                
                {/* Axes */}
                <line x1={margin.left} y1={svgHeight - margin.bottom} x2={svgWidth - margin.right} y2={svgHeight - margin.bottom} className="axis-line" />
                <line x1={margin.left} y1={margin.top} x2={margin.left} y2={svgHeight - margin.bottom} className="axis-line" />

                {/* Axis Titles */}
                <text x={margin.left + chartWidth / 2} y={svgHeight - 15} className="axis-title" style={{ textRendering: 'optimizeLegibility' }}>Opp. Shot Attempts After Recovery (20s)</text>
                <g transform={`translate(20, ${margin.top + chartHeight / 2}) rotate(-90)`}>
                    <text x="0" y="0" className="axis-title" style={{ textRendering: 'optimizeLegibility', dominantBaseline: 'middle' }}>Opp. Box Entries After Recovery (%)</text>
                </g>

                {/* Data Points (Badges) */}
                {validData.map((d, i) => {
                    const cx = mapX(d.shots20s);
                    const cy = mapY(d.boxEntriesPct);
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
                                <image href={badge} xlinkHref={badge} x={cx - 16} y={cy - 16} width="32" height="32" preserveAspectRatio="xMidYMid meet"  />
                            ) : (
                                <circle 
                                    cx={cx} 
                                    cy={cy} 
                                    r={8} 
                                    fill={isHovered ? 'var(--color-accent-blue)' : 'var(--color-accent-green)'}
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
                    const cx = mapX(d.shots20s);
                    const cy = mapY(d.boxEntriesPct);
                    
                    let top = cy + 20;
                    if (cy > svgHeight - 140) {
                        top = cy - 110; 
                    }

                    const getOrdinal = (n) => {
                        if (!n) return '';
                        const s = ["th", "st", "nd", "rd"], v = n % 100;
                        return n + (s[(v - 20) % 10] || s[v] || s[0]);
                    };

                    let leftPct = (cx / svgWidth) * 100;
                    if (leftPct < 15) leftPct = 15;
                    if (leftPct > 85) leftPct = 85;

                    return (
                        <div style={{
                            position: 'absolute',
                            left: `${leftPct}%`,
                            top: `${(top / svgHeight) * 100}%`,
                            transform: 'translate(-50%, 0)',
                            background: 'rgba(0,0,0,0.9)',
                            border: '1px solid var(--color-accent-blue)',
                            padding: '0.6rem 0.8rem',
                            borderRadius: '8px',
                            boxShadow: '0 8px 16px rgba(0,0,0,0.5)',
                            pointerEvents: 'none',
                            zIndex: 100,
                            minWidth: '260px',
                            backdropFilter: 'blur(4px)'
                        }}>
                            <div style={{ color: '#fff', fontWeight: 'bold', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '0.4rem', marginBottom: '0.4rem', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.9rem' }}>
                                {getBadge && getBadge(d.team) && <img src={getBadge(d.team)} alt="" style={{ width: '16px', height: '16px', objectFit: 'contain' }} />}
                                {d.team}
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '0.75rem', color: 'var(--color-text-secondary)' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                    <span>Opp. Shot Attempts (20s):</span>
                                    <span>
                                        <b style={{ color: '#fff' }}>{d.shots20s.toFixed(1)}</b> 
                                        {d.rankShots && <span style={{ color: 'var(--color-accent-blue)', marginLeft: '3px' }}>({getOrdinal(d.rankShots)})</span>}
                                    </span>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                    <span>Opp. Box Entries (%):</span>
                                    <span>
                                        <b style={{ color: '#fff' }}>{d.boxEntriesPct.toFixed(1)}%</b>
                                        {d.rankBoxEntriesPct && <span style={{ color: 'var(--color-accent-blue)', marginLeft: '3px' }}>({getOrdinal(d.rankBoxEntriesPct)})</span>}
                                    </span>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '2px', paddingTop: '4px', borderTop: '1px dashed rgba(255,255,255,0.1)' }}>
                                    <span>Opp. Box Entries (20s):</span>
                                    <span>
                                        <b style={{ color: '#fff' }}>{d.boxEntries20s.toFixed(1)}</b>
                                        {d.rankBoxEntries && <span style={{ color: 'var(--color-accent-blue)', marginLeft: '3px' }}>({getOrdinal(d.rankBoxEntries)})</span>}
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

export default DefensiveTransitionScatterChart;
