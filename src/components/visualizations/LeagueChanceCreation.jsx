import React, { useState, useMemo } from 'react';

const LeagueChanceCreation = ({ chanceStats, getBadge, selectedTeam = null }) => {
    const [viewMode, setViewMode] = useState('shots'); // 'shots', 'shotsOnTarget', 'goals'
    const [chartType, setChartType] = useState('absolute'); // 'absolute' or 'proportional'

    const maxTotal = useMemo(() => {
        if (!chanceStats) return 1;
        let max = 1;
        Object.values(chanceStats).forEach(stats => {
            if (stats[viewMode] && stats[viewMode].total > max) max = stats[viewMode].total;
        });
        return max;
    }, [chanceStats, viewMode]);

    const sortedTeams = useMemo(() => {
        if (!chanceStats) return [];
        let teams = Object.entries(chanceStats)
            .map(([teamName, stats]) => ({
                teamName,
                ...stats[viewMode]
            }))
            .sort((a, b) => b.total - a.total);
            
        if (selectedTeam) {
            // Keep the rank number, so we need to map first to get original index, then filter
            teams = teams.map((t, idx) => ({ ...t, rank: idx + 1 }))
                         .filter(t => t.teamName.includes(selectedTeam) || selectedTeam.includes(t.teamName));
        } else {
            teams = teams.map((t, idx) => ({ ...t, rank: idx + 1 }));
        }
        
        return teams;
    }, [chanceStats, viewMode, selectedTeam]);

    if (!chanceStats || sortedTeams.length === 0) {
        return <div style={{ color: 'var(--color-text-secondary)', fontSize: '0.9rem' }}>No chance creation data available.</div>;
    }

    const COLORS = {
        openPlay: '#3b82f6', // Blue
        cross: '#ec4899',    // Pink
        counter: '#f59e0b',  // Orange
        setPiece: '#8b5cf6'  // Purple
    };

    const LABELS = {
        openPlay: 'Open Play',
        cross: 'OP Cross',
        counter: 'Counter Attack',
        setPiece: 'Set-Piece'
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem', width: '100%' }}>
            {/* Controls */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
                <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                    {Object.entries(COLORS).map(([key, color]) => (
                        <div key={key} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <div style={{ width: '12px', height: '12px', borderRadius: '3px', background: color }}></div>
                            <span style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)' }}>{LABELS[key]}</span>
                        </div>
                    ))}
                </div>

                <div style={{ display: 'flex', gap: '0.4rem', alignItems: 'center' }}>
                    <span style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)', fontWeight: '500' }}>Metric:</span>
                    {[
                        { id: 'shots', label: 'Shots' },
                        { id: 'shotsOnTarget', label: 'Shots on Target' },
                        { id: 'goals', label: 'Goals' },
                    ].map((mode) => (
                        <button
                            key={mode.id}
                            onClick={() => setViewMode(mode.id)}
                            style={{
                                background: viewMode === mode.id ? 'rgba(56,189,248,0.15)' : 'rgba(255,255,255,0.05)',
                                color: viewMode === mode.id ? 'var(--color-accent-blue)' : 'var(--color-text-secondary)',
                                border: viewMode === mode.id ? '1px solid rgba(56,189,248,0.4)' : '1px solid rgba(255,255,255,0.12)',
                                borderRadius: '6px',
                                padding: '0.25rem 0.6rem',
                                cursor: 'pointer',
                                fontSize: '0.75rem',
                                transition: 'all 0.2s',
                            }}
                        >
                            {mode.label}
                        </button>
                    ))}
                </div>

                <div style={{ display: 'flex', gap: '0.4rem', alignItems: 'center' }}>
                    <span style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)', fontWeight: '500' }}>Chart Type:</span>
                    {[
                        { id: 'absolute', label: 'Volume' },
                        { id: 'proportional', label: '100% Stacked' },
                    ].map((mode) => (
                        <button
                            key={mode.id}
                            onClick={() => setChartType(mode.id)}
                            style={{
                                background: chartType === mode.id ? 'rgba(139,92,246,0.15)' : 'rgba(255,255,255,0.05)',
                                color: chartType === mode.id ? '#a78bfa' : 'var(--color-text-secondary)',
                                border: chartType === mode.id ? '1px solid rgba(139,92,246,0.4)' : '1px solid rgba(255,255,255,0.12)',
                                borderRadius: '6px',
                                padding: '0.25rem 0.6rem',
                                cursor: 'pointer',
                                fontSize: '0.75rem',
                                transition: 'all 0.2s',
                            }}
                        >
                            {mode.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Chart */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem', marginTop: '0.5rem' }}>
                {sortedTeams.map((team, idx) => {
                    const { openPlay, cross, counter, setPiece, total } = team;
                    
                    const openPlayPct = total > 0 ? (openPlay / total) * 100 : 0;
                    const crossPct = total > 0 ? (cross / total) * 100 : 0;
                    const counterPct = total > 0 ? (counter / total) * 100 : 0;
                    const setPiecePct = total > 0 ? (setPiece / total) * 100 : 0;

                    // Absolute uses maxTotal to determine width, proportional forces 100% width
                    const barWidthPct = chartType === 'absolute' ? (total / (maxTotal || 1)) * 100 : 100;

                    return (
                        <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                            {/* Team Logo & Rank */}
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', width: '45px', flexShrink: 0 }}>
                                <span style={{ color: 'var(--color-text-secondary)', fontSize: '0.75rem', width: '12px', textAlign: 'right' }}>{team.rank}.</span>
                                <img 
                                    src={getBadge(team.teamName)} 
                                    alt={team.teamName} 
                                    style={{ width: '20px', height: '20px', objectFit: 'contain' }}
                                />
                            </div>

                            {/* Bar Area */}
                            <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <div style={{ 
                                    width: `${barWidthPct}%`, 
                                    height: '24px',  
                                    display: 'flex',
                                    borderRadius: '4px',
                                    overflow: 'hidden',
                                    background: 'rgba(255,255,255,0.05)'
                                }}>
                                    {openPlay > 0 && (
                                        <div 
                                            title={`Open Play: ${openPlay} (${openPlayPct.toFixed(1)}%)`}
                                            style={{ 
                                                width: `${openPlayPct}%`, height: '100%', background: COLORS.openPlay, transition: 'width 0.4s ease',
                                                display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: '0.7rem', fontWeight: 'bold'
                                            }}
                                        >
                                            {chartType === 'proportional' && openPlayPct >= 5 ? `${Math.round(openPlayPct)}%` : (chartType === 'absolute' && openPlayPct >= 5 ? openPlay : null)}
                                        </div>
                                    )}
                                    {cross > 0 && (
                                        <div 
                                            title={`Open Play Cross: ${cross} (${crossPct.toFixed(1)}%)`}
                                            style={{ 
                                                width: `${crossPct}%`, height: '100%', background: COLORS.cross, transition: 'width 0.4s ease',
                                                display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: '0.7rem', fontWeight: 'bold'
                                            }}
                                        >
                                            {chartType === 'proportional' && crossPct >= 5 ? `${Math.round(crossPct)}%` : (chartType === 'absolute' && crossPct >= 5 ? cross : null)}
                                        </div>
                                    )}
                                    {counter > 0 && (
                                        <div 
                                            title={`Counter Attack: ${counter} (${counterPct.toFixed(1)}%)`}
                                            style={{ 
                                                width: `${counterPct}%`, height: '100%', background: COLORS.counter, transition: 'width 0.4s ease',
                                                display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: '0.7rem', fontWeight: 'bold'
                                            }}
                                        >
                                            {chartType === 'proportional' && counterPct >= 5 ? `${Math.round(counterPct)}%` : (chartType === 'absolute' && counterPct >= 5 ? counter : null)}
                                        </div>
                                    )}
                                    {setPiece > 0 && (
                                        <div 
                                            title={`Set-Piece: ${setPiece} (${setPiecePct.toFixed(1)}%)`}
                                            style={{ 
                                                width: `${setPiecePct}%`, height: '100%', background: COLORS.setPiece, transition: 'width 0.4s ease',
                                                display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: '0.7rem', fontWeight: 'bold'
                                            }}
                                        >
                                            {chartType === 'proportional' && setPiecePct >= 5 ? `${Math.round(setPiecePct)}%` : (chartType === 'absolute' && setPiecePct >= 5 ? setPiece : null)}
                                        </div>
                                    )}
                                </div>
                                <span style={{ color: 'var(--color-text-primary)', fontSize: '0.85rem', fontWeight: 'bold', width: '30px' }}>
                                    {total}
                                </span>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default LeagueChanceCreation;
