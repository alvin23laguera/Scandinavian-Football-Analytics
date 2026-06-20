import React, { useState } from 'react';

const ThrowInZonesMap = ({ data, teamName }) => {
    const PITCH_WIDTH = 100;
    const PITCH_HEIGHT = 70;

    const [hoveredArc, setHoveredArc] = useState(null);
    const [selectedThird, setSelectedThird] = useState('all');

    const drawPitch = () => (
        <g className="pitch-markings" opacity="0.6" stroke="#64748b" strokeWidth="0.5" fill="none">
            {/* Outline */}
            <rect x="0" y="0" width={PITCH_WIDTH} height={PITCH_HEIGHT} />
            {/* Halfway line */}
            <line x1="50" y1="0" x2="50" y2={PITCH_HEIGHT} />
            <circle cx="50" cy="35" r="9.15" />
            <circle cx="50" cy="35" r="0.5" fill="#64748b" />
            {/* Penalty areas */}
            <rect x="0" y="15" width="16.5" height="40" />
            <rect x="83.5" y="15" width="16.5" height="40" />
            {/* Goal areas */}
            <rect x="0" y="25" width="5.5" height="20" />
            <rect x="94.5" y="25" width="5.5" height="20" />
            
            {/* Thirds dividers */}
            <line x1="33.33" y1="0" x2="33.33" y2={PITCH_HEIGHT} strokeDasharray="2,4" stroke="#475569" strokeWidth="0.3" />
            <line x1="66.66" y1="0" x2="66.66" y2={PITCH_HEIGHT} strokeDasharray="2,4" stroke="#475569" strokeWidth="0.3" />
            {/* Penalty arcs (the "D") */}
            <path d="M 16.5 27.69 A 9.15 9.15 0 0 1 16.5 42.31" stroke="#64748b" strokeWidth="0.5" fill="none" />
            <path d="M 83.5 27.69 A 9.15 9.15 0 0 0 83.5 42.31" stroke="#64748b" strokeWidth="0.5" fill="none" />
        </g>
    );

    const ARC_COLORS = {
        short: '#38bdf8',  // Blue
        medium: '#f59e0b', // Orange
        long: '#22c55e'    // Green
    };

    const drawArcs = () => {
        const zones = [
            { side: 'top', third: 'defensive', cx: 16.66, cy: 0, sweep: 0 },
            { side: 'top', third: 'middle', cx: 50, cy: 0, sweep: 0 },
            { side: 'top', third: 'attacking', cx: 83.33, cy: 0, sweep: 0 },
            { side: 'bottom', third: 'defensive', cx: 16.66, cy: 70, sweep: 1 },
            { side: 'bottom', third: 'middle', cx: 50, cy: 70, sweep: 1 },
            { side: 'bottom', third: 'attacking', cx: 83.33, cy: 70, sweep: 1 }
        ];

        const radii = {
            short: 3.5,
            medium: 10.5,
            long: 17.5
        };
        const STROKE_WIDTH = 7;

        // Group
        const counts = {};
        zones.forEach(z => {
            counts[`${z.side}-${z.third}`] = { short: 0, medium: 0, long: 0, total: 0 };
        });

        data.forEach(t => {
            const key = `${t.side}-${t.third}`;
            if (counts[key] && counts[key][t.type] !== undefined) {
                counts[key][t.type]++;
                counts[key].total++;
            }
        });

        return zones.map((zone, i) => {
            if (selectedThird !== 'all' && zone.third !== selectedThird) return null;

            const key = `${zone.side}-${zone.third}`;
            const zoneCounts = counts[key];
            
            if (zoneCounts.total === 0) return null;

            return (
                <g key={`zone-${i}`}>
                    {['long', 'medium', 'short'].map((type, j) => {
                        const count = zoneCounts[type];
                        if (count === 0) return null;

                        const r = radii[type];
                        const sweep = zone.sweep;
                        
                        // M cx-r cy A r r 0 0 sweep cx+r cy
                        const pathD = `M ${zone.cx - r} ${zone.cy} A ${r} ${r} 0 0 ${sweep} ${zone.cx + r} ${zone.cy}`;

                        const textY = sweep === 0 ? zone.cy + r : zone.cy - r;
                        const textX = zone.cx;

                        const hoverId = `${key}-${type}`;
                        const isHovered = hoveredArc === hoverId;
                        
                        return (
                            <g 
                                key={`arc-${j}`} 
                                onMouseEnter={() => setHoveredArc(hoverId)}
                                onMouseLeave={() => setHoveredArc(null)}
                                style={{ cursor: 'pointer', transition: 'opacity 0.2s' }}
                            >
                                <path 
                                    d={pathD} 
                                    fill="none" 
                                    stroke={ARC_COLORS[type]} 
                                    strokeWidth={STROKE_WIDTH} 
                                    opacity={hoveredArc && !isHovered ? 0.2 : 0.7}
                                />
                                <text 
                                    x={textX} 
                                    y={textY} 
                                    textAnchor="middle" 
                                    alignmentBaseline="middle" 
                                    fill="#ffffff"
                                    fontSize="2.4" 
                                    fontWeight="bold"
                                    pointerEvents="none"
                                >
                                    {count}
                                </text>
                                <title>{`${count} ${type} throw-ins`}</title>
                            </g>
                        );
                    })}
                </g>
            );
        });
    };

    return (
        <div className="bg-[#0f172a] rounded-xl p-6 border border-slate-800 shadow-2xl relative overflow-hidden h-full flex flex-col">
            <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '0.5rem', alignItems: 'center' }}>
                {[
                    { id: 'all', label: 'All Zones', color: '#94a3b8' },
                    { id: 'defensive', label: 'Defensive Third', color: '#3b82f6' },
                    { id: 'middle', label: 'Middle Third', color: '#eab308' },
                    { id: 'attacking', label: 'Attacking Third', color: '#ef4444' }
                ].map(t => (
                    <button
                        key={t.id}
                        onClick={() => setSelectedThird(t.id)}
                        className="px-4 py-2 rounded-lg text-xs font-bold transition-all border-2"
                        style={{
                            borderColor: selectedThird === t.id ? t.color : 'rgba(100,116,139,0.3)',
                            backgroundColor: selectedThird === t.id ? `${t.color}20` : 'transparent',
                            color: selectedThird === t.id ? t.color : '#64748b',
                            boxShadow: selectedThird === t.id ? `0 0 10px ${t.color}30` : 'none'
                        }}
                    >
                        {t.label}
                    </button>
                ))}
            </div>

            {(() => {
                let totalShort = 0, totalMedium = 0, totalLong = 0;
                data.forEach(t => {
                    if (selectedThird === 'all' || t.third === selectedThird) {
                        if (t.type === 'short') totalShort++;
                        else if (t.type === 'medium') totalMedium++;
                        else if (t.type === 'long') totalLong++;
                    }
                });
                return (
                    <div style={{ textAlign: 'center', marginBottom: '1rem', fontSize: '11px', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                        <span style={{color: ARC_COLORS.short}}>Short - {totalShort}</span>
                        <span style={{ margin: '0 0.75rem', color: '#475569' }}> | </span>
                        <span style={{color: ARC_COLORS.medium}}>Medium - {totalMedium}</span>
                        <span style={{ margin: '0 0.75rem', color: '#475569' }}> | </span>
                        <span style={{color: ARC_COLORS.long}}>Long - {totalLong}</span>
                    </div>
                );
            })()}

            <div className="flex-1 relative w-full bg-[#060a12] rounded-lg border border-slate-800 overflow-hidden shadow-inner min-h-[350px]">
                {/* viewBox padded by 5 units to ensure round linecaps aren't clipped */}
                <svg viewBox="-5 -5 110 80" className="absolute inset-0 w-full h-full p-2" preserveAspectRatio="xMidYMid meet">
                    {drawPitch()}
                    {drawArcs()}
                </svg>
            </div>
        </div>
    );
};

export default ThrowInZonesMap;
