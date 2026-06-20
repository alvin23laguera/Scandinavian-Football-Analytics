import React, { useMemo, useState } from 'react';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, Tooltip } from 'recharts';
import MultiSelectDropdown from '../MultiSelectDropdown';

const ALL_METRICS = [
    { key: 'ppda', label: 'PPDA' },
    { key: 'highRecoveries', label: 'High Recoveries' },
    { key: 'defensiveHeight', label: 'Avg Defensive Action Height' },
    { key: 'blockCompactness', label: 'Block Compactness' },
    { key: 'shotsAllowed', label: 'Shots Allowed' },
    { key: 'shotsOnTargetAllowed', label: 'Shots on Target Allowed' },
    { key: 'boxEntriesAllowed', label: 'Box Entries Allowed' },
    { key: 'goalsAllowed', label: 'Goals Allowed' }
];

const DEFAULT_METRICS = ['ppda', 'highRecoveries', 'defensiveHeight', 'blockCompactness', 'shotsAllowed', 'shotsOnTargetAllowed', 'boxEntriesAllowed', 'goalsAllowed'];

const DefenceRadarChart = ({ teamName, teamColor, localTeamStats, globalTeamStats, totalTeams = 16, selectedCount = 1 }) => {
    const [selectedMetrics, setSelectedMetrics] = useState(DEFAULT_METRICS);

    const chartData = useMemo(() => {
        if (!localTeamStats?.normalized || !globalTeamStats?.normalized) return [];

        return selectedMetrics.map(metricKey => {
            const metricMeta = ALL_METRICS.find(m => m.key === metricKey);
            return {
                subject: metricMeta.label,
                localValue: localTeamStats.normalized[metricKey] || 0,
                globalValue: globalTeamStats.normalized[metricKey] || 0,
                localRaw: localTeamStats.raw[metricKey] || 0,
                globalRaw: globalTeamStats.raw[metricKey] || 0,
                localRank: localTeamStats.rank ? localTeamStats.rank[metricKey] : null,
                globalRank: globalTeamStats.rank ? globalTeamStats.rank[metricKey] : null,
                metricKey: metricKey
            };
        });
    }, [localTeamStats, globalTeamStats, selectedMetrics]);

    if (!localTeamStats || !globalTeamStats) {
        return (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', minHeight: '350px', color: 'var(--color-text-secondary)', fontSize: '0.9rem' }}>
                <div className="spinner" style={{ marginBottom: '1rem' }}></div>
                <div>Generating Defensive Radar Profile...</div>
                <div style={{ fontSize: '0.8rem', opacity: 0.7, marginTop: '0.5rem' }}>
                    Aggregating entire league database...
                </div>
            </div>
        );
    }

    const renderTooltip = ({ active, payload, label }) => {
        if (active && payload && payload.length) {
            const formatRawValue = (val, key) => {
                if (val === undefined || val === null) return '0.00';
                const num = val.toFixed(2);
                const perMatchMetrics = ['highRecoveries', 'shotsAllowed', 'shotsOnTargetAllowed', 'boxEntriesAllowed', 'goalsAllowed'];
                
                if (perMatchMetrics.includes(key)) return `${num} Per Game`;
                if (key === 'defensiveHeight' || key === 'blockCompactness') return `${num}m`;
                
                return num;
            };

            const metricKey = payload[0].payload.metricKey;

            return (
                <div style={{ background: 'rgba(10,15,25,0.95)', border: '1px solid rgba(255,255,255,0.1)', padding: '12px', borderRadius: '8px', boxShadow: '0 4px 12px rgba(0,0,0,0.5)', width: '320px', margin: '0 auto' }}>
                    <p style={{ margin: '0 0 12px 0', fontWeight: 'bold', color: '#fff', fontSize: '0.95rem', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '6px', textAlign: 'center' }}>{label}</p>
                    
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
                    <span style={{ color: 'var(--color-text-secondary)' }}>Overall Season</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <div style={{ width: '12px', height: '12px', background: teamColor, opacity: 0.8, borderRadius: '2px' }} />
                    <span style={{ color: 'var(--color-text-primary)' }}>{selectedCount} Selected Fixtures</span>
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
                        
                        <Radar 
                            name="Overall Season" 
                            dataKey="globalValue" 
                            stroke="rgba(0, 191, 255, 0.8)" 
                            fill="rgba(0, 191, 255, 0.4)" 
                            fillOpacity={0.4} 
                        />

                        <Radar 
                            name="Selected Fixtures" 
                            dataKey="localValue" 
                            stroke={teamColor} 
                            fill={teamColor} 
                            fillOpacity={0.5} 
                        />
                    </RadarChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
};

export default DefenceRadarChart;
