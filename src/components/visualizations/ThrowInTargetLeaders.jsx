import React, { useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LabelList, Cell } from 'recharts';

const ThrowInTargetLeaders = ({ data, teamName }) => {
    const [activeMetric, setActiveMetric] = useState('received');

    // Flatten data. Index 0 renders at the TOP in Recharts with this config, so we put Attacking first (top).
    // Use uniqueId to prevent Recharts from merging categories if the same player appears in multiple zones.
    const chartData = [
        ...(data.attacking || []).map(t => ({ ...t, zone: 'Attacking', uniqueId: `${t.name}-Attacking` })),
        ...(data.middle || []).map(t => ({ ...t, zone: 'Middle', uniqueId: `${t.name}-Middle` })),
        ...(data.defensive || []).map(t => ({ ...t, zone: 'Defensive', uniqueId: `${t.name}-Defensive` }))
    ];

    if (chartData.length === 0) {
        return (
            <div className="bg-[#0f172a] rounded-xl p-6 border border-slate-800 shadow-2xl h-full flex items-center justify-center">
                <p className="text-slate-500 italic">No target data recorded.</p>
            </div>
        );
    }

    const CustomTooltip = ({ active, payload }) => {
        if (active && payload && payload.length) {
            const data = payload[0].payload;
            return (
                <div style={{
                    backgroundColor: '#0f172a',
                    border: '1px solid #334155',
                    padding: '16px',
                    borderRadius: '8px',
                    boxShadow: '0 10px 25px rgba(0,0,0,0.5)',
                    color: '#f8fafc',
                    fontSize: '13px',
                    zIndex: 100,
                    minWidth: '220px'
                }}>
                    <p style={{ fontWeight: 'bold', fontSize: '15px', margin: '0 0 12px 0', borderBottom: '1px solid #334155', paddingBottom: '8px' }}>
                        {data.name} <span style={{ color: '#94a3b8', fontWeight: 'normal', fontSize: '12px', marginLeft: '6px' }}>({data.zone})</span>
                    </p>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <span style={{ color: '#60a5fa' }}>Throws Received:</span>
                            <span style={{ fontWeight: 'bold', fontSize: '14px' }}>{data.received}</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <span style={{ color: '#34d399' }}>Retention (10s):</span>
                            <span style={{ fontWeight: 'bold', fontSize: '14px' }}>{data.retentionPct}%</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <span style={{ color: '#818cf8' }}>Shots Created (20s):</span>
                            <span style={{ fontWeight: 'bold', fontSize: '14px' }}>{data.shots20s}</span>
                        </div>
                    </div>
                </div>
            );
        }
        return null;
    };

    const CustomYAxisTick = (props) => {
        const { x, y, payload } = props;
        const targetIndex = chartData.findIndex(t => t.uniqueId === payload.value);
        if (targetIndex === -1) return null;
        
        const target = chartData[targetIndex];
        
        // Color based on zone
        let color = '#94a3b8';
        if (target.zone === 'Attacking') color = '#ef4444';
        else if (target.zone === 'Middle') color = '#eab308';
        else if (target.zone === 'Defensive') color = '#3b82f6';

        // Zone calculations
        const zoneItems = chartData.filter(t => t.zone === target.zone);
        const indexInZone = zoneItems.findIndex(t => t.uniqueId === target.uniqueId);
        
        // Sub-title for the middle item in the zone
        const isMiddleInZone = indexInZone === Math.floor(zoneItems.length / 2);
        let zoneTitle = '';
        if (target.zone === 'Attacking') zoneTitle = 'ATT 1/3';
        else if (target.zone === 'Middle') zoneTitle = 'MID 1/3';
        else if (target.zone === 'Defensive') zoneTitle = 'DEF 1/3';

        return (
            <g transform={`translate(${x},${y})`}>
                {/* Player Name */}
                <text x={0} y={0} dy={4} textAnchor="end" fill={color} fontSize="11" fontWeight="bold">
                    {target.name}
                </text>
                
                {/* Zone Sub-title (rotated left) */}
                {isMiddleInZone && (
                    <text 
                        x={-90} 
                        y={0} 
                        dy={4}
                        transform={`rotate(-90, -90, 0)`} 
                        textAnchor="middle" 
                        fill="#cbd5e1" 
                        fontSize="12" 
                        fontWeight="900" 
                        letterSpacing="3"
                    >
                        {zoneTitle}
                    </text>
                )}
            </g>
        );
    };

    const renderCustomBarLabel = (props) => {
        const { x, y, width, height, value } = props;
        return (
            <text x={x + width + 5} y={y + height / 2} fill="#cbd5e1" fontSize="10" fontWeight="bold" dy={3}>
                {value}
            </text>
        );
    };

    const xAxisLabelText = activeMetric === 'received' ? 'Throw-Ins Received' : 
                           activeMetric === 'retained10s' ? 'Possessions Retained (10s)' : 
                           'Shots Created (20s)';

    // Dynamic zone heights for absolute positioned dividers
    const totalItems = chartData.length;
    const a_len = chartData.filter(t => t.zone === 'Attacking').length;
    const m_len = chartData.filter(t => t.zone === 'Middle').length;
    const d_len = chartData.filter(t => t.zone === 'Defensive').length;

    const chartInnerHeight = 330; // 350px total - 20px bottom margin
    const hAtt = (a_len / totalItems) * chartInnerHeight;
    const hMid = (m_len / totalItems) * chartInnerHeight;

    const topMid = hAtt;
    const topDef = hAtt + hMid;

    return (
        <div className="bg-[#0f172a] rounded-xl p-6 border border-slate-800 shadow-2xl relative h-full flex flex-col overflow-hidden">
            <div className="flex justify-center items-center mb-6 shrink-0 relative z-10 w-full">
                <div className="flex gap-4 mx-auto">
                    <button 
                        onClick={() => setActiveMetric('received')}
                        style={{
                            padding: '10px 20px',
                            borderRadius: '8px',
                            fontWeight: 'bold',
                            fontSize: '11px',
                            textTransform: 'uppercase',
                            cursor: 'pointer',
                            border: activeMetric === 'received' ? '2px solid #3b82f6' : '1px solid #475569',
                            backgroundColor: activeMetric === 'received' ? '#1e3a8a' : '#1e293b',
                            color: activeMetric === 'received' ? '#ffffff' : '#94a3b8',
                            boxShadow: activeMetric === 'received' ? '0 4px 10px rgba(59, 130, 246, 0.4)' : '0 2px 4px rgba(0,0,0,0.2)',
                            transition: 'all 0.2s'
                        }}
                    >
                        Receptions
                    </button>
                    <button 
                        onClick={() => setActiveMetric('retained10s')}
                        style={{
                            padding: '10px 20px',
                            borderRadius: '8px',
                            fontWeight: 'bold',
                            fontSize: '11px',
                            textTransform: 'uppercase',
                            cursor: 'pointer',
                            border: activeMetric === 'retained10s' ? '2px solid #3b82f6' : '1px solid #475569',
                            backgroundColor: activeMetric === 'retained10s' ? '#1e3a8a' : '#1e293b',
                            color: activeMetric === 'retained10s' ? '#ffffff' : '#94a3b8',
                            boxShadow: activeMetric === 'retained10s' ? '0 4px 10px rgba(59, 130, 246, 0.4)' : '0 2px 4px rgba(0,0,0,0.2)',
                            transition: 'all 0.2s'
                        }}
                    >
                        Poss. Retained
                    </button>
                    <button 
                        onClick={() => setActiveMetric('shots20s')}
                        style={{
                            padding: '10px 20px',
                            borderRadius: '8px',
                            fontWeight: 'bold',
                            fontSize: '11px',
                            textTransform: 'uppercase',
                            cursor: 'pointer',
                            border: activeMetric === 'shots20s' ? '2px solid #3b82f6' : '1px solid #475569',
                            backgroundColor: activeMetric === 'shots20s' ? '#1e3a8a' : '#1e293b',
                            color: activeMetric === 'shots20s' ? '#ffffff' : '#94a3b8',
                            boxShadow: activeMetric === 'shots20s' ? '0 4px 10px rgba(59, 130, 246, 0.4)' : '0 2px 4px rgba(0,0,0,0.2)',
                            transition: 'all 0.2s'
                        }}
                    >
                        Shots Created
                    </button>
                </div>
            </div>
            
            <div className="w-full mt-4 relative" style={{ height: '350px' }}>
                {/* Horizontal Dividers cut perfectly to the grid */}
                {a_len > 0 && (m_len > 0 || d_len > 0) && (
                    <div className="absolute left-[130px] right-[40px] border-b border-slate-600/60 border-dashed pointer-events-none z-0" style={{ top: `${topMid}px` }} />
                )}
                {m_len > 0 && d_len > 0 && (
                    <div className="absolute left-[130px] right-[40px] border-b border-slate-600/60 border-dashed pointer-events-none z-0" style={{ top: `${topDef}px` }} />
                )}

                <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                        data={chartData}
                        layout="vertical"
                        margin={{ top: 0, right: 40, left: 20, bottom: 20 }}
                        barSize={16}
                    >
                        <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#1e293b" />
                        <XAxis 
                            type="number" 
                            stroke="#64748b" 
                            fontSize={10}
                            tickLine={false}
                            axisLine={{ stroke: '#334155' }}
                            label={{ 
                                value: xAxisLabelText, 
                                position: 'insideBottom', 
                                offset: -15, 
                                fill: '#94a3b8', 
                                fontSize: 11,
                                fontWeight: 'bold'
                            }}
                        />
                        <YAxis 
                            dataKey="uniqueId" 
                            type="category" 
                            axisLine={{ stroke: '#334155' }}
                            tickLine={false}
                            tick={<CustomYAxisTick />}
                            width={110}
                        />
                        <Tooltip content={<CustomTooltip />} cursor={{ fill: '#1e293b' }} />
                        
                        <Bar dataKey={activeMetric} radius={[0, 4, 4, 0]}>
                            {chartData.map((entry, index) => {
                                let fill = '#3b82f6'; // default for Defensive
                                if (entry.zone === 'Attacking') fill = '#ef4444';
                                else if (entry.zone === 'Middle') fill = '#eab308';
                                return <Cell key={`cell-${index}`} fill={fill} fillOpacity={0.8} />;
                            })}
                            <LabelList content={renderCustomBarLabel} />
                        </Bar>
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
};

export default ThrowInTargetLeaders;
