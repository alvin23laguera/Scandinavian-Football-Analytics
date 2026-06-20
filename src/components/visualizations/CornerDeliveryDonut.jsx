import React, { useMemo, useState } from 'react';

const CornerDeliveryDonut = ({ data = [], teamName = "Tromsø IL" }) => {
    const [sideFilter, setSideFilter] = useState('all'); // 'all', 'left', 'right'

    const [viewMode, setViewMode] = useState('total'); // 'total' or 'percent'

    const processedData = useMemo(() => {
        return data.filter(d => {
            const isLeft = d.startY < 50;
            if (sideFilter === 'left' && !isLeft) return false;
            if (sideFilter === 'right' && isLeft) return false;
            return true;
        });
    }, [data, sideFilter]);

    const stats = useMemo(() => {
        const counts = {
            in: { total: 0, completed: 0, color: '#22c55e', label: 'In-Swinging' },
            out: { total: 0, completed: 0, color: '#f97316', label: 'Out-Swinging' },
            straight: { total: 0, completed: 0, color: '#38bdf8', label: 'Straight' }
        };

        processedData.forEach(d => {
            if (counts[d.swing]) {
                counts[d.swing].total += 1;
                if (d.outcome === 'completed') {
                    counts[d.swing].completed += 1;
                }
            }
        });

        return counts;
    }, [processedData]);

    const totalCorners = processedData.length;
    const totalCompleted = processedData.filter(d => d.outcome === 'completed').length;
    const completedPerc = totalCorners > 0 ? Math.round((totalCompleted / totalCorners) * 100) : 0;

    // SVG arc drawing helper
    const polarToCartesian = (centerX, centerY, radius, angleInDegrees) => {
        const angleInRadians = (angleInDegrees - 90) * Math.PI / 180.0;
        return {
            x: centerX + (radius * Math.cos(angleInRadians)),
            y: centerY + (radius * Math.sin(angleInRadians))
        };
    };

    const describeArc = (x, y, radius, startAngle, endAngle) => {
        if (totalCorners === 0) return "";
        let arcEnd = endAngle;
        // SVG arcs bug out at exactly 360
        if (arcEnd - startAngle >= 360) arcEnd -= 0.01;

        const start = polarToCartesian(x, y, radius, arcEnd);
        const end = polarToCartesian(x, y, radius, startAngle);
        const largeArcFlag = arcEnd - startAngle <= 180 ? "0" : "1";

        return [
            "M", start.x, start.y,
            "A", radius, radius, 0, largeArcFlag, 0, end.x, end.y
        ].join(" ");
    };

    const generateArcs = () => {
        let currentAngle = 0;
        const gap = totalCorners > 0 ? 3 : 0; // 3 degree gap between segments
        
        // Count active segments to distribute the gap properly
        const activeSegments = Object.values(stats).filter(s => s.total > 0).length;
        const totalGapAngle = activeSegments > 1 ? activeSegments * gap : 0;
        const availableAngle = 360 - totalGapAngle;

        const arcs = [];

        Object.keys(stats).forEach(key => {
            const stat = stats[key];
            if (stat.total === 0) return;

            const segmentAngle = (stat.total / totalCorners) * availableAngle;
            const startAngle = currentAngle;
            const endAngle = startAngle + segmentAngle;
            
            const completedRatio = stat.completed / stat.total;
            const completedEndAngle = startAngle + (segmentAngle * completedRatio);

            arcs.push({
                key,
                stat,
                startAngle,
                endAngle,
                completedEndAngle,
                midAngle: startAngle + (segmentAngle / 2)
            });

            currentAngle = endAngle + gap;
        });

        return arcs;
    };

    const arcs = generateArcs();

    const CENTER = 150;
    const OUTER_RAD = 100;
    const INNER_RAD = 78;
    const OUTER_WIDTH = 14;
    const INNER_WIDTH = 10;

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', height: '100%' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <button
                            onClick={() => setSideFilter('all')}
                            style={{
                                background: sideFilter === 'all' ? 'rgba(255,255,255,0.15)' : 'transparent',
                                color: sideFilter === 'all' ? '#fff' : 'var(--color-text-secondary)',
                                border: sideFilter === 'all' ? '1px solid rgba(255,255,255,0.4)' : '1px solid rgba(255,255,255,0.1)',
                                borderRadius: '6px',
                                padding: '0.3rem 0.6rem',
                                cursor: 'pointer',
                                fontSize: '0.7rem',
                                fontWeight: 'bold',
                                transition: 'all 0.2s'
                            }}
                        >
                            All
                        </button>
                        <button
                            onClick={() => setSideFilter('left')}
                            style={{
                                background: sideFilter === 'left' ? 'rgba(255,255,255,0.15)' : 'transparent',
                                color: sideFilter === 'left' ? '#fff' : 'var(--color-text-secondary)',
                                border: sideFilter === 'left' ? '1px solid rgba(255,255,255,0.4)' : '1px solid rgba(255,255,255,0.1)',
                                borderRadius: '6px',
                                padding: '0.3rem 0.6rem',
                                cursor: 'pointer',
                                fontSize: '0.7rem',
                                fontWeight: 'bold',
                                transition: 'all 0.2s'
                            }}
                        >
                            Left Corners
                        </button>
                        <button
                            onClick={() => setSideFilter('right')}
                            style={{
                                background: sideFilter === 'right' ? 'rgba(255,255,255,0.15)' : 'transparent',
                                color: sideFilter === 'right' ? '#fff' : 'var(--color-text-secondary)',
                                border: sideFilter === 'right' ? '1px solid rgba(255,255,255,0.4)' : '1px solid rgba(255,255,255,0.1)',
                                borderRadius: '6px',
                                padding: '0.3rem 0.6rem',
                                cursor: 'pointer',
                                fontSize: '0.7rem',
                                fontWeight: 'bold',
                                transition: 'all 0.2s'
                            }}
                        >
                            Right Corners
                        </button>
                    </div>
                    
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <button
                            onClick={() => setViewMode('total')}
                            style={{
                                background: viewMode === 'total' ? 'var(--color-accent-blue)' : 'transparent',
                                color: viewMode === 'total' ? '#000' : 'var(--color-text-secondary)',
                                border: viewMode === 'total' ? '1px solid var(--color-accent-blue)' : '1px solid rgba(255,255,255,0.1)',
                                borderRadius: '4px',
                                padding: '0.2rem 0.5rem',
                                cursor: 'pointer',
                                fontSize: '0.65rem',
                                fontWeight: 'bold',
                                transition: 'all 0.2s'
                            }}
                        >
                            Total
                        </button>
                        <button
                            onClick={() => setViewMode('percent')}
                            style={{
                                background: viewMode === 'percent' ? 'var(--color-accent-blue)' : 'transparent',
                                color: viewMode === 'percent' ? '#000' : 'var(--color-text-secondary)',
                                border: viewMode === 'percent' ? '1px solid var(--color-accent-blue)' : '1px solid rgba(255,255,255,0.1)',
                                borderRadius: '4px',
                                padding: '0.2rem 0.5rem',
                                cursor: 'pointer',
                                fontSize: '0.65rem',
                                fontWeight: 'bold',
                                transition: 'all 0.2s'
                            }}
                        >
                            %
                        </button>
                    </div>
                </div>
                
                {/* Legend */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem', alignItems: 'flex-end' }}>
                    {Object.keys(stats).map(key => (
                        <div key={key} style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                            <span style={{ fontSize: '0.7rem', color: 'var(--color-text-secondary)', fontWeight: 'bold' }}>{stats[key].label}</span>
                            <span style={{ width: '12px', height: '4px', backgroundColor: stats[key].color, borderRadius: '2px' }}></span>
                        </div>
                    ))}
                </div>
            </div>

            <div style={{ flex: 1, backgroundColor: '#0e1420', borderRadius: '8px', position: 'relative', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                {totalCorners === 0 ? (
                    <div style={{ color: 'var(--color-text-secondary)', fontSize: '0.9rem' }}>No data available for this selection.</div>
                ) : (
                    <svg viewBox="0 0 300 300" style={{ width: '100%', height: '100%', maxHeight: '300px' }}>
                        {arcs.map((arc) => (
                            <g key={arc.key}>
                                {/* Outer Ring Background (faint) */}
                                <path
                                    d={describeArc(CENTER, CENTER, OUTER_RAD, arc.startAngle, arc.endAngle)}
                                    fill="none"
                                    stroke={arc.stat.color}
                                    strokeWidth={OUTER_WIDTH}
                                    opacity="0.15"
                                />
                                {/* Outer Ring (Total Volume) */}
                                <path
                                    d={describeArc(CENTER, CENTER, OUTER_RAD, arc.startAngle, arc.endAngle)}
                                    fill="none"
                                    stroke={arc.stat.color}
                                    strokeWidth={OUTER_WIDTH}
                                    strokeLinecap="round"
                                />

                                {/* Inner Ring Background (Track) */}
                                <path
                                    d={describeArc(CENTER, CENTER, INNER_RAD, arc.startAngle, arc.endAngle)}
                                    fill="none"
                                    stroke={arc.stat.color}
                                    strokeWidth={INNER_WIDTH}
                                    opacity="0.1"
                                />
                                {/* Inner Ring (Completed Volume) */}
                                {arc.stat.completed > 0 && (
                                    <path
                                        d={describeArc(CENTER, CENTER, INNER_RAD, arc.startAngle, arc.completedEndAngle)}
                                        fill="none"
                                        stroke={arc.stat.color}
                                        strokeWidth={INNER_WIDTH}
                                        strokeLinecap="round"
                                        opacity="0.9"
                                    />
                                )}

                                {/* Outer Text Label (Total Amount) */}
                                {(() => {
                                    const pos = polarToCartesian(CENTER, CENTER, OUTER_RAD + 18, arc.midAngle);
                                    const textAnchor = arc.midAngle > 180 ? 'end' : 'start';
                                    const value = viewMode === 'percent' 
                                        ? `${Math.round((arc.stat.total / totalCorners) * 100)}%`
                                        : arc.stat.total;
                                    
                                    return (
                                        <text 
                                            x={pos.x} 
                                            y={pos.y} 
                                            fill="#fff" 
                                            fontSize="13" 
                                            fontWeight="black" 
                                            textAnchor={textAnchor}
                                            alignmentBaseline="middle"
                                        >
                                            {value}
                                        </text>
                                    );
                                })()}

                                {/* Inner Text Label (Completed Amount) */}
                                {(() => {
                                    const pos = polarToCartesian(CENTER, CENTER, INNER_RAD - 18, arc.midAngle);
                                    // Invert the text anchor for the inner ring so it draws INWARDS towards the center, preventing overlap with the ring.
                                    const textAnchor = arc.midAngle > 180 ? 'start' : 'end';
                                    const value = viewMode === 'percent'
                                        ? `${Math.round((arc.stat.completed / arc.stat.total) * 100)}%`
                                        : arc.stat.completed;
                                        
                                    return (
                                        <text 
                                            x={pos.x} 
                                            y={pos.y} 
                                            fill={arc.stat.color} 
                                            fontSize="11" 
                                            fontWeight="black" 
                                            textAnchor={textAnchor}
                                            alignmentBaseline="middle"
                                        >
                                            {value}
                                        </text>
                                    );
                                })()}
                            </g>
                        ))}

                        {/* Center Statistics */}
                        <text x={CENTER} y={CENTER - 5} textAnchor="middle" fill="#fff" fontSize="28" fontWeight="black">
                            {totalCorners}
                        </text>
                        <text x={CENTER} y={CENTER + 15} textAnchor="middle" fill="var(--color-text-secondary)" fontSize="10" fontWeight="bold">
                            CORNERS
                        </text>
                        <text x={CENTER} y={CENTER + 35} textAnchor="middle" fill="#fff" fontSize="12" fontWeight="bold">
                            {completedPerc}% Comp
                        </text>
                    </svg>
                )}
            </div>
        </div>
    );
};

export default CornerDeliveryDonut;
