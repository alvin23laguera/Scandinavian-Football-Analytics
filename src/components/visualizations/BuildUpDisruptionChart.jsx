import React from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';

const BuildUpDisruptionChart = ({ data, teamName, teamColor, getBadge, leagueStats }) => {
    let chartData = data || [];
    chartData = chartData.map((d, i) => ({ ...d, _id: i.toString() }));

    // Custom tooltip to show the math clearly
    const CustomTooltip = ({ active, payload, label }) => {
        if (active && payload && payload.length) {
            const pointData = payload[0].payload;
            if (pointData.isDummy) return null;
            const bdp = pointData.bdp;
            const isPositive = bdp > 0;
            const bdpColor = isPositive ? 'var(--color-success, #4ade80)' : 'var(--color-danger, #ef4444)';
            const oppBadge = getBadge ? getBadge(pointData.opponent) : null;

            return (
                <div style={{
                    backgroundColor: 'rgba(10, 16, 36, 0.95)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: '8px',
                    padding: '1rem',
                    color: 'white',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.5)',
                    minWidth: '200px'
                }}>
                    <h4 style={{ margin: '0 0 0.5rem 0', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '0.5rem', color: 'var(--color-text-secondary)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        {oppBadge && <img src={oppBadge} alt={pointData.opponent} style={{ width: '16px', height: '16px', objectFit: 'contain' }} />}
                        vs {pointData.opponent}
                    </h4>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
                        <span style={{ color: 'var(--color-text-secondary)' }}>Opponent Avg:</span>
                        <span style={{ fontWeight: 'bold' }}>{pointData.opponentAvg.toFixed(1)}%</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                        <span style={{ color: 'var(--color-text-secondary)' }}>Opponent Match:</span>
                        <span style={{ fontWeight: 'bold' }}>{pointData.opponentMatch.toFixed(1)}%</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '0.5rem', marginTop: '0.25rem' }}>
                        <span style={{ fontWeight: 'bold' }}>Disruption (BDP):</span>
                        <span style={{ fontWeight: 'bold', color: bdpColor }}>
                            {bdp > 0 ? '+' : ''}{bdp.toFixed(1)}%
                        </span>
                    </div>
                </div>
            );
        }
        return null;
    };

    const renderDot = (props, isActive) => {
        const { cx, cy, payload } = props;
        if (payload?.isDummy) return null;

        const badgeUrl = getBadge && payload && payload.opponent ? getBadge(payload.opponent) : null;
        
        const radius = isActive ? 16 : 14;
        const imgSize = isActive ? 24 : 20;
        const offset = imgSize / 2;
        
        if (!badgeUrl) {
            return (
                <circle key={`dot-${payload?.opponent}`} cx={cx} cy={cy} r={isActive ? 8 : 5} fill={isActive ? (teamColor || '#3b82f6') : "#0a1024"} stroke={isActive ? "#fff" : (teamColor || '#3b82f6')} strokeWidth={2} />
            );
        }
        
        return (
            <g key={`dot-${payload?.opponent}`}>
                <circle cx={cx} cy={cy} r={radius} fill="#0a1024" stroke={isActive ? '#fff' : (teamColor || 'var(--color-primary, #3b82f6)')} strokeWidth={isActive ? 2 : 1.5} />
                <foreignObject x={cx - offset} y={cy - offset} width={imgSize} height={imgSize}>
                    <img src={badgeUrl}  style={{ width: '100%', height: '100%', objectFit: 'contain' }} alt="Team Logo" />
                </foreignObject>
            </g>
        );
    };

    // Calculate Y-axis domain based on data to keep 0 centered if possible, or just dynamic
    const dataMax = data ? Math.max(...data.map(d => d.bdp), 5) : 10;
    const dataMin = data ? Math.min(...data.map(d => d.bdp), -5) : -10;
    
    const maxAbsBdp = Math.max(Math.abs(dataMax), Math.abs(dataMin));
    const yDomain = [-Math.ceil(maxAbsBdp + 2), Math.ceil(maxAbsBdp + 2)];

    // Calculate gradient offset so 0% aligns with the visual center of the area path
    const gradientOffset = () => {
        if (!data || data.length === 0) return 0.5;
        const dMax = Math.max(...data.map(d => d.bdp), 0);
        const dMin = Math.min(...data.map(d => d.bdp), 0);
        
        if (dMax <= 0) return 0;
        if (dMin >= 0) return 1;
        
        return dMax / (dMax - dMin);
    };
    const off = gradientOffset();

    const selectedMatchesAvg = data && data.length > 0 ? (data.reduce((sum, d) => sum + d.bdp, 0) / data.length) : 0;
    const totalAvg = leagueStats ? leagueStats.totalAvgBdp : 0;
    const rank = leagueStats ? leagueStats.leagueRank : '-';
    const totalTeams = leagueStats ? leagueStats.totalTeams : 16;

    return (
        <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column' }}>
            <div style={{ marginBottom: '1rem', textAlign: 'center' }}>
                <h3 style={{ margin: 0, color: 'var(--color-text-primary)' }}>Build-Up Disruption Percentage (BDP)</h3>
            </div>
            
            {/* Legend / Stats Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', padding: '0.75rem 1rem', backgroundColor: 'rgba(255,255,255,0.03)', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.05)' }}>
                <div style={{ display: 'flex', gap: '1.5rem' }}>
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                        <span style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.2rem' }}>Selected Avg</span>
                        <span style={{ fontSize: '1.1rem', fontWeight: 'bold', color: selectedMatchesAvg > 0 ? 'var(--color-success, #4ade80)' : 'var(--color-danger, #ef4444)' }}>
                            {selectedMatchesAvg > 0 ? '+' : ''}{selectedMatchesAvg.toFixed(1)}%
                        </span>
                    </div>
                    <div style={{ width: '1px', backgroundColor: 'rgba(255,255,255,0.1)' }}></div>
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                        <span style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.2rem' }}>Total Season Avg</span>
                        <span style={{ fontSize: '1.1rem', fontWeight: 'bold', color: totalAvg > 0 ? 'var(--color-success, #4ade80)' : 'var(--color-danger, #ef4444)' }}>
                            {totalAvg > 0 ? '+' : ''}{totalAvg.toFixed(1)}%
                        </span>
                    </div>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
                    <span style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.2rem' }}>League Rank</span>
                    <span style={{ fontSize: '1.25rem', fontWeight: 'bold', color: 'var(--color-text-primary)' }}>
                        {rank} <span style={{ fontSize: '0.9rem', color: 'var(--color-text-secondary)', fontWeight: 'normal' }}>/ {totalTeams}</span>
                    </span>
                </div>
            </div>
            
            <div style={{ width: '100%', height: '400px' }}>
                {data && data.length === 1 ? (
                    <div style={{ 
                        width: '100%', 
                        height: '100%', 
                        display: 'flex', 
                        flexDirection: 'column', 
                        alignItems: 'center', 
                        justifyContent: 'center',
                        backgroundColor: 'rgba(0,0,0,0.2)',
                        borderRadius: '12px',
                        border: '1px solid rgba(255,255,255,0.05)',
                        position: 'relative'
                    }}>
                        <div style={{ fontSize: '1.25rem', color: 'var(--color-text-secondary)', marginBottom: '1rem', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                            Match Disruption
                        </div>
                        <div style={{ 
                            fontSize: '6rem', 
                            fontWeight: 'bold', 
                            color: data[0].bdp > 0 ? 'var(--color-success, #4ade80)' : 'var(--color-danger, #ef4444)',
                            textShadow: `0 0 40px ${data[0].bdp > 0 ? 'rgba(74,222,128,0.4)' : 'rgba(239,68,68,0.4)'}`
                        }}>
                            {data[0].bdp > 0 ? '+' : ''}{data[0].bdp.toFixed(1)}%
                        </div>
                    </div>
                ) : (
                    <div style={{ width: '100%', height: '100%', position: 'relative' }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart
                            data={chartData}
                            margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
                        >
                            <defs>
                                <linearGradient id={`splitColor-${teamName?.replace(/\s+/g, '-')}`} x1="0" y1="0" x2="0" y2="1">
                                    <stop offset={off} stopColor="rgba(74,222,128,0.4)" stopOpacity={1}/>
                                    <stop offset={off} stopColor="rgba(239,68,68,0.4)" stopOpacity={1}/>
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.15)" vertical={false} />
                            <XAxis 
                                dataKey={(d) => d.matchRound ? `MD ${d.matchRound}` : d.opponent} 
                                stroke="var(--color-text-secondary)" 
                                tick={{ fill: 'var(--color-text-secondary)', fontSize: 12 }}
                                tickMargin={10}
                                padding={{ left: 20, right: 20 }}
                            />
                            <YAxis 
                                domain={yDomain}
                                stroke="var(--color-text-secondary)" 
                                tick={{ fill: 'var(--color-text-secondary)', fontSize: 12 }}
                                tickFormatter={(val) => `${val > 0 ? '+' : ''}${val}%`}
                                width={60}
                            />
                            <Tooltip content={<CustomTooltip />} cursor={{ stroke: 'rgba(255,255,255,0.1)', strokeWidth: 2 }} />
                            
                            {/* The Baseline at 0% */}
                            <ReferenceLine y={0} stroke="rgba(255,255,255,0.4)" strokeWidth={2} />

                            {/* Main BDP Area */}
                            <Area 
                                type="monotone" 
                                dataKey="bdp" 
                                stroke={teamColor || 'var(--color-primary, #3b82f6)'} 
                                strokeWidth={3}
                                fill={`url(#splitColor-${teamName?.replace(/\s+/g, '-')})`}
                                dot={(props) => renderDot(props, false)}
                                activeDot={(props) => renderDot(props, true)}
                                animationDuration={1500}
                            />
                        </AreaChart>
                    </ResponsiveContainer>
                    </div>
                )}
            </div>
        </div>
    );
};

export default BuildUpDisruptionChart;
