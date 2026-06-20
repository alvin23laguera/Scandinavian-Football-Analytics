import React, { useMemo } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';

const LeagueBdpChart = ({ data, getBadge }) => {
    const chartData = useMemo(() => {
        if (!data || data.length === 0) return [];
        // Data should already be sorted from best to worst, but let's ensure it is sorted just in case
        return [...data].sort((a, b) => b.avgBdp - a.avgBdp);
    }, [data]);

    if (!chartData || chartData.length === 0) {
        return <div style={{ color: 'var(--color-danger)', fontSize: '0.9rem', padding: '1rem' }}>No BDP data available. Raw data: {data ? JSON.stringify(data) : 'undefined/null'}</div>;
    }

    const gradientOffset = () => {
        const dataMax = Math.max(...chartData.map(i => i.avgBdp));
        const dataMin = Math.min(...chartData.map(i => i.avgBdp));
        if (dataMax <= 0) return 0;
        if (dataMin >= 0) return 1;
        return dataMax / (dataMax - dataMin);
    };

    const off = gradientOffset();

    const CustomTooltip = ({ active, payload }) => {
        if (active && payload && payload.length) {
            const pointData = payload[0].payload;
            const isPositive = pointData.avgBdp > 0;
            const bdpColor = isPositive ? 'var(--color-success, #4ade80)' : 'var(--color-danger, #ef4444)';
            const badge = getBadge ? getBadge(pointData.team) : null;

            return (
                <div style={{
                    backgroundColor: 'rgba(10, 16, 36, 0.95)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: '8px',
                    padding: '1rem',
                    color: 'white',
                    boxShadow: '0 4px 6px rgba(0,0,0,0.3)',
                    minWidth: '200px'
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
                        {badge && <img src={badge} alt={pointData.team} style={{ width: '24px', height: '24px', objectFit: 'contain' }} />}
                        <span style={{ fontWeight: 'bold' }}>{pointData.team}</span>
                    </div>
                    
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '8px' }}>
                        <span style={{ color: 'var(--color-text-secondary)' }}>Avg BDP Differential:</span>
                        <span style={{ color: bdpColor, fontWeight: 'bold' }}>
                            {isPositive ? '+' : ''}{pointData.avgBdp.toFixed(2)}%
                        </span>
                    </div>
                </div>
            );
        }
        return null;
    };

    const CustomDot = (props) => {
        const { cx, cy, payload, active } = props;
        if (!payload || !payload.team) return null;
        
        const badge = getBadge ? getBadge(payload.team) : null;
        return (
            <g>
                <circle cx={cx} cy={cy} r={active ? 18 : 14} fill="var(--color-bg-primary, #0a1024)" stroke="rgba(255,255,255,0.2)" strokeWidth={active ? 2.5 : 1.5} />
                {badge && (
                    <foreignObject x={cx - (active ? 12 : 10)} y={cy - (active ? 12 : 10)} width={active ? 24 : 20} height={active ? 24 : 20}>
                        <img src={badge}  style={{ width: '100%', height: '100%', objectFit: 'contain' }} alt="Badge" />
                    </foreignObject>
                )}
            </g>
        );
    };

    return (
        <div style={{ width: '100%', height: '400px' }}>
            <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                    data={chartData}
                    margin={{ top: 20, right: 60, left: 20, bottom: 20 }}
                >
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" vertical={false} />
                    <XAxis 
                        dataKey="team" 
                        stroke="var(--color-text-secondary)" 
                        tick={false}
                        tickLine={false}
                        axisLine={{ stroke: 'rgba(255,255,255,0.2)' }}
                        padding={{ left: 50, right: 50 }}
                    />
                    <YAxis 
                        tickFormatter={(val) => `${val > 0 ? '+' : ''}${val}%`}
                        stroke="var(--color-text-secondary)"
                        tick={{ fill: 'var(--color-text-secondary)', fontSize: 12 }}
                        tickLine={false}
                        axisLine={{ stroke: 'rgba(255,255,255,0.2)' }}
                        domain={['auto', 'auto']}
                    />
                    <Tooltip content={<CustomTooltip />} />
                    <ReferenceLine y={0} stroke="rgba(255,255,255,0.5)" strokeDasharray="3 3" />
                    
                    <defs>
                        <linearGradient id="splitColor" x1="0" y1="0" x2="0" y2="1">
                            <stop offset={off} stopColor="var(--color-success, #4ade80)" stopOpacity={0.4} />
                            <stop offset={off} stopColor="var(--color-danger, #ef4444)" stopOpacity={0.4} />
                        </linearGradient>
                        <linearGradient id="splitStroke" x1="0" y1="0" x2="0" y2="1">
                            <stop offset={off} stopColor="var(--color-success, #4ade80)" stopOpacity={1} />
                            <stop offset={off} stopColor="var(--color-danger, #ef4444)" stopOpacity={1} />
                        </linearGradient>
                    </defs>
                    
                    <Area 
                        type="monotone" 
                        dataKey="avgBdp" 
                        stroke="url(#splitStroke)" 
                        strokeWidth={3}
                        fill="url(#splitColor)" 
                        dot={<CustomDot />}
                        activeDot={<CustomDot active />}
                    />
                </AreaChart>
            </ResponsiveContainer>
        </div>
    );
};

export default LeagueBdpChart;
