import React, { useState, useMemo } from 'react';

const DefensiveStyleChart = ({ data, getBadge }) => {
    const [hoveredTeam, setHoveredTeam] = useState(null);

    // Filter out teams with no PPDA or high recoveries data
    const validData = useMemo(() => {
        if (!data || !data.leagueData) return [];
        const leagueDataObj = data.leagueData;
        const teams = Object.keys(leagueDataObj).filter(k => k !== 'League Average');
        
        return teams.map(team => {
            const raw = leagueDataObj[team].raw;
            return {
                team,
                ppda: raw.ppda || 0,
                highRecoveries: raw.highRecoveries || 0,
                defensiveHeight: raw.defensiveHeight || 0,
                rankPpda: leagueDataObj[team].rank?.ppda,
                rankRecoveries: leagueDataObj[team].rank?.highRecoveries,
                rankDefensiveHeight: leagueDataObj[team].rank?.defensiveHeight
            };
        }).filter(d => d.ppda > 0);
    }, [data]);

    // Calculate dynamic bounds with padding
    const { minX, maxX, minY, maxY } = useMemo(() => {
        if (validData.length === 0) return { minX: 0, maxX: 20, minY: 0, maxY: 10 };
        
        let minXRaw = Math.min(...validData.map(d => d.ppda));
        let maxXRaw = Math.max(...validData.map(d => d.ppda));
        let minY = Math.min(...validData.map(d => d.highRecoveries));
        let maxY = Math.max(...validData.map(d => d.highRecoveries));

        if (minXRaw === maxXRaw) { minXRaw -= 2; maxXRaw += 2; }
        if (minY === maxY) { minY -= 2; maxY += 2; }

        const padX = (maxXRaw - minXRaw) * 0.15;
        const padY = (maxY - minY) * 0.15;

        // X-axis is reversed: lower PPDA is on the right. 
        // So visually, left = maxX + padX, right = minX - padX.
        // We'll map X manually by keeping minX as the logical "right" and maxX as the logical "left"
        return {
            minX: Math.max(0, minXRaw - padX),
            maxX: maxXRaw + padX,
            minY: Math.max(0, minY - padY),
            maxY: maxY + padY
        };
    }, [validData]);

    if (validData.length === 0) {
        return (
            <div style={{ color: 'var(--color-text-secondary)', padding: '3rem', textAlign: 'center', background: '#1a1f24', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)' }}>
                No defensive data available for the selected matches.
            </div>
        );
    }

    // Averages across the league to draw quadrant lines
    const leagueAvgX = data.leagueData['League Average']?.raw?.ppda || (validData.reduce((acc, d) => acc + d.ppda, 0) / validData.length);
    const leagueAvgY = data.leagueData['League Average']?.raw?.highRecoveries || (validData.reduce((acc, d) => acc + d.highRecoveries, 0) / validData.length);

    // SVG dimensions and margins
    const svgWidth = 800;
    const svgHeight = 500;
    const margin = { top: 40, right: 40, bottom: 60, left: 70 };
    const chartWidth = svgWidth - margin.left - margin.right;
    const chartHeight = svgHeight - margin.top - margin.bottom;

    // Coordinate mapping functions
    // X is REVERSED: higher PPDA (less intensity) is on the left, lower PPDA (more intensity) is on the right
    const mapX = (val) => margin.left + ((maxX - val) / (maxX - minX)) * chartWidth;
    const mapY = (val) => margin.top + chartHeight - ((val - minY) / (maxY - minY)) * chartHeight;

    // Grid ticks
    const xTicks = 5;
    const yTicks = 5;
    const gridLinesX = Array.from({ length: xTicks + 1 }).map((_, i) => maxX - (i * (maxX - minX) / xTicks));
    const gridLinesY = Array.from({ length: yTicks + 1 }).map((_, i) => minY + (i * (maxY - minY) / yTicks));

    return (
        <div style={{ position: 'relative', width: '100%', maxWidth: '800px', margin: '0 auto', background: '#13171a', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)' }}>
            {/* Removed quadrant names as requested */}

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
                </defs>

                {/* X-Axis Grid & Labels (Reversed) */}
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
                <text x={margin.left + chartWidth / 2} y={svgHeight - 15} className="axis-title">PPDA</text>
                <text x={- (margin.top + chartHeight / 2)} y={20} transform="rotate(-90)" className="axis-title">Recoveries in Opp. Half</text>

                {/* Data Points (Badges) */}
                {validData.map((d, i) => {
                    const cx = mapX(d.ppda);
                    const cy = mapY(d.highRecoveries);
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
                    const cx = mapX(d.ppda);
                    const cy = mapY(d.highRecoveries);
                    
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
                            minWidth: '240px',
                            backdropFilter: 'blur(4px)'
                        }}>
                            <div style={{ color: '#fff', fontWeight: 'bold', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '0.4rem', marginBottom: '0.4rem', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.9rem' }}>
                                {getBadge && getBadge(d.team) && <img src={getBadge(d.team)} alt="" style={{ width: '16px', height: '16px', objectFit: 'contain' }} />}
                                {d.team}
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', fontSize: '0.75rem', color: 'var(--color-text-secondary)' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                    <span>PPDA:</span>
                                    <span>
                                        <b style={{ color: '#fff' }}>{d.ppda.toFixed(1)}</b> 
                                        {d.rankPpda && <span style={{ color: 'var(--color-accent-blue)', marginLeft: '3px' }}>({getOrdinal(d.rankPpda)})</span>}
                                    </span>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                    <span>High Recoveries:</span>
                                    <span>
                                        <b style={{ color: '#fff' }}>{d.highRecoveries.toFixed(1)} /90</b>
                                        {d.rankRecoveries && <span style={{ color: 'var(--color-accent-blue)', marginLeft: '3px' }}>({getOrdinal(d.rankRecoveries)})</span>}
                                    </span>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '2px', paddingTop: '4px', borderTop: '1px dashed rgba(255,255,255,0.1)' }}>
                                    <span>Avg Defensive Height:</span>
                                    <span>
                                        <b style={{ color: '#fff' }}>{d.defensiveHeight.toFixed(1)}m</b>
                                        {d.rankDefensiveHeight && <span style={{ color: 'var(--color-accent-blue)', marginLeft: '3px' }}>({getOrdinal(d.rankDefensiveHeight)})</span>}
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

export default DefensiveStyleChart;
