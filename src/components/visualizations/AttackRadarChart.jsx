import React, { useState, useMemo } from 'react';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Tooltip, ResponsiveContainer } from 'recharts';
import MultiSelectDropdown from '../MultiSelectDropdown';

const ALL_METRICS = [
    { key: 'goals', label: 'Goals' },
    { key: 'goalConversion', label: 'Goal Conversion %' },
    { key: 'goalsPer100', label: 'Goals p100 Possessions' },
    { key: 'shots', label: 'Shots' },
    { key: 'shotsOnTarget', label: 'Shots on Target' },
    { key: 'passesIntoFinalThird', label: 'Passes into Final 1/3' },
    { key: 'fieldTilt', label: 'Field Tilt' },
    { key: 'passesIntoBox', label: 'Passes into Box' },
    { key: 'touchesInBox', label: 'Touches in Box' },
    { key: 'crosses', label: 'Crosses' },
    { key: 'verticality', label: 'Verticality' }
];

const DEFAULT_METRICS = ['goals', 'goalConversion', 'shots', 'passesIntoFinalThird', 'fieldTilt', 'passesIntoBox', 'touchesInBox', 'verticality'];

const AttackRadarChart = ({ teamName, teamColor, localTeamStats, globalTeamStats, totalTeams = 16, selectedCount = 1 }) => {
    const [selectedMetrics, setSelectedMetrics] = useState(DEFAULT_METRICS);

    const chartData = useMemo(() => {
        if (!localTeamStats) return [];

        const data = [];
        ALL_METRICS.forEach(metric => {
            if (!selectedMetrics.includes(metric.key)) return;

            data.push({
                subject: metric.label,
                fullMark: 100,
                
                // Local stats (Selected Fixtures)
                localRaw: localTeamStats.raw[metric.key],
                localValue: localTeamStats.normalized[metric.key],
                localRank: localTeamStats.rank?.[metric.key],
                
                // Global stats (Overall Season)
                globalRaw: globalTeamStats.raw[metric.key],
                globalValue: globalTeamStats.normalized[metric.key],
                globalRank: globalTeamStats.rank?.[metric.key],
                metricKey: metric.key
            });
        });

        return data;
    }, [localTeamStats, globalTeamStats, selectedMetrics]);

    if (!localTeamStats || !globalTeamStats) {
        return (
            <div style={{ height: '350px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: 'var(--color-text-secondary)', textAlign: 'center' }}>
                <div className="loading-spinner" style={{ width: '30px', height: '30px', border: '3px solid rgba(255,255,255,0.1)', borderTopColor: 'var(--color-primary)', borderRadius: '50%', animation: 'spin 1s linear infinite', marginBottom: '1rem' }} />
                <span>Calculating league baselines...</span>
                <span style={{ fontSize: '0.75rem', marginTop: '0.5rem', color: 'var(--color-text-secondary)', opacity: 0.7 }}>
                    Debug: LocalStats={localTeamStats ? 'Found' : 'Missing'} | GlobalStats={globalTeamStats ? 'Found' : 'Missing'} | Team={teamName}
                </span>
            </div>
        );
    }

    const renderTooltip = ({ active, payload, label }) => {
        if (active && payload && payload.length) {
            const formatRawValue = (val, key) => {
                if (val === undefined || val === null) return '0.00';
                const num = val.toFixed(2);
                const perMatchMetrics = ['goals', 'shots', 'shotsOnTarget', 'passesIntoFinalThird', 'passesIntoBox', 'touchesInBox', 'crosses'];
                const percentageMetrics = ['goalConversion', 'verticality', 'fieldTilt'];
                
                if (perMatchMetrics.includes(key)) return `${num} Per Game`;
                if (percentageMetrics.includes(key)) return `${num}%`;
                if (key === 'goalsPer100') return `${num} p/100`;
                
                return num;
            };

            const metricKey = payload[0].payload.metricKey;

            return (
                <div style={{ background: 'rgba(10,15,25,0.95)', border: '1px solid rgba(255,255,255,0.1)', padding: '12px', borderRadius: '8px', boxShadow: '0 4px 12px rgba(0,0,0,0.5)', width: '320px', margin: '0 auto' }}>
                    <p style={{ margin: '0 0 12px 0', fontWeight: 'bold', color: '#fff', fontSize: '0.95rem', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '6px', textAlign: 'center' }}>{label}</p>
                    
                    {/* Overall Season Shade */}
                    <div style={{ color: 'rgba(255,255,255,0.8)', display: 'flex', justifyContent: 'space-between', gap: '32px', fontSize: '0.85rem', marginBottom: '12px', alignItems: 'center' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: 'rgba(0, 191, 255, 0.8)' }} />
                            <span style={{ fontWeight: '500' }}>Overall Season</span>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '2px' }}>
                            <span style={{ fontWeight: 'bold', color: '#fff' }}>{formatRawValue(payload[0].payload.globalRaw, metricKey)}</span>
                            <span style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.8)' }}>Percentile: {payload[0].payload.globalValue?.toFixed(0)}%</span>
                            {payload[0].payload.globalRank && (
                                <span style={{ fontSize: '0.85rem', fontWeight: 'bold', color: 'rgba(0, 191, 255, 0.9)' }}>
                                    League Rank: {payload[0].payload.globalRank}
                                </span>
                            )}
                        </div>
                    </div>

                    {/* Selected Fixtures Shade */}
                    <div style={{ color: teamColor, display: 'flex', justifyContent: 'space-between', gap: '32px', fontSize: '0.85rem', alignItems: 'center' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: teamColor }} />
                            <span style={{ fontWeight: 'bold' }}>Selected Fixtures</span>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '2px' }}>
                            <span style={{ fontWeight: 'bold', color: '#fff' }}>{formatRawValue(payload[0].payload.localRaw, metricKey)}</span>
                            <span style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.8)' }}>Potential Percentile: {payload[0].payload.localValue?.toFixed(0)}%</span>
                            {payload[0].payload.localRank && (
                                <span style={{ fontSize: '0.85rem', fontWeight: 'bold', color: payload[0].payload.localRank <= 3 ? 'var(--color-accent-green)' : teamColor }}>
                                    Potential Rank: {payload[0].payload.localRank}
                                </span>
                            )}
                        </div>
                    </div>
                </div>
            );
        }
        return null;
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', width: '100%', height: '100%' }}>
            <div data-html2canvas-ignore="true" style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', marginBottom: '1rem' }}>
                <MultiSelectDropdown 
                    label="Select Metrics"
                    options={ALL_METRICS.map(m => ({ label: m.label, value: m.key }))}
                    selectedValues={selectedMetrics}
                    onChange={setSelectedMetrics}
                    selectAllLabel="All Metrics"
                    maxSelection={8}
                />
            </div>
            
            <div style={{ display: 'flex', justifyContent: 'center', gap: '1.5rem', marginBottom: '1rem', fontSize: '0.8rem', padding: '0.5rem', background: 'rgba(255,255,255,0.03)', borderRadius: '8px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <div style={{ width: '12px', height: '12px', background: 'rgba(0, 191, 255, 0.4)', border: '1px solid rgba(0, 191, 255, 0.8)', borderRadius: '2px' }} />
                    <span style={{ color: 'var(--color-text-secondary)' }}>Overall Season Performance</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <div style={{ width: '12px', height: '12px', background: teamColor, opacity: 0.8, borderRadius: '2px' }} />
                    <span style={{ color: 'var(--color-text-primary)' }}>{selectedCount} Selected Fixtures Performance</span>
                </div>
            </div>
            
            <div style={{ flex: 1, minHeight: '480px', width: '100%', position: 'relative' }}>
                <ResponsiveContainer width="100%" height={480}>
                    <RadarChart cx="50%" cy="42%" outerRadius="65%" data={chartData}>
                        <PolarGrid stroke="rgba(255,255,255,0.15)" />
                        <PolarAngleAxis 
                            dataKey="subject" 
                            tick={{ fill: 'var(--color-text-secondary)', fontSize: 11, fontWeight: 500 }} 
                        />
                        <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                        <Tooltip 
                            content={renderTooltip} 
                            position={{ x: 0, y: 350 }} 
                            wrapperStyle={{ width: '100%', zIndex: 1000 }}
                        />
                        
                        {/* Overall Season (Background Polygon) */}
                        <Radar 
                            name="Overall Season" 
                            dataKey="globalValue" 
                            stroke="rgba(0, 191, 255, 0.8)" 
                            fill="rgba(0, 191, 255, 0.4)" 
                            fillOpacity={0.4} 
                            isAnimationActive={true}
                        />

                        {/* Selected Fixtures (Foreground Polygon) */}
                        <Radar 
                            name="Selected Fixtures" 
                            dataKey="localValue" 
                            stroke={teamColor} 
                            fill={teamColor} 
                            fillOpacity={0.5} 
                            isAnimationActive={true}
                        />
                    </RadarChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
};

export default AttackRadarChart;
