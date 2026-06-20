import React, { useState } from 'react';

const TransitionTimeChart = ({ data, teamName, teamColor = 'var(--color-primary)', rivalColor = '#ef4444', rivalName = 'Opponent' }) => {
    if (!data || !data.offensive) return null;

    const [activeFilter, setActiveFilter] = useState('shots');
    const [displayMode, setDisplayMode] = useState('total');
    const [activeZone, setActiveZone] = useState('all');

    const filters = [
        { id: 'shots', label: 'Shots' },
        { id: 'shotsOnTarget', label: 'Shots on Target' },
        { id: 'boxEntries', label: 'Entries Opp. Box' }
    ];

    const zones = [
        { id: 'all', label: 'All Pitch' },
        { id: 'defensive', label: 'Defensive 1/3' },
        { id: 'middle', label: 'Middle 1/3' },
        { id: 'attacking', label: 'Attacking 1/3' }
    ];

    const offData = data.offensive[activeZone]?.[activeFilter] || [];
    const conData = data.conceded[activeZone]?.[activeFilter] || [];

    const offSuccess = offData.filter(d => !d.isFailure);
    const offFailure = offData.filter(d => d.isFailure);
    const conSuccess = conData.filter(d => !d.isFailure);
    const conFailure = conData.filter(d => d.isFailure);

    const offTotalSuccess = offSuccess.reduce((sum, d) => sum + d.count, 0);
    const offTotalFailure = offFailure.reduce((sum, d) => sum + d.count, 0);
    const offTotalTransitions = offTotalSuccess + offTotalFailure;
    const offFailurePct = offTotalTransitions > 0 ? Math.round((offTotalFailure / offTotalTransitions) * 100) : 0;

    const conTotalSuccess = conSuccess.reduce((sum, d) => sum + d.count, 0);
    const conTotalFailure = conFailure.reduce((sum, d) => sum + d.count, 0);
    const conTotalTransitions = conTotalSuccess + conTotalFailure;
    const conFailurePct = conTotalTransitions > 0 ? Math.round((conTotalFailure / conTotalTransitions) * 100) : 0;

    let maxCount = 1;
    if (displayMode === 'total') {
        maxCount = Math.max(
            ...offSuccess.map(d => d.count),
            ...conSuccess.map(d => d.count),
            1
        );
    } else {
        maxCount = Math.max(
            ...offSuccess.map(d => (d.count / (offTotalSuccess || 1)) * 100),
            ...conSuccess.map(d => (d.count / (conTotalSuccess || 1)) * 100),
            1
        );
    }

    return (
        <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {/* Header and Toggles */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div style={{ display: 'flex', justifyContent: 'center' }}>
                    <div style={{ display: 'flex', gap: '4px', background: 'rgba(0,0,0,0.2)', padding: '4px', borderRadius: '8px' }}>
                        {zones.map(z => (
                            <button
                                key={z.id}
                                onClick={() => setActiveZone(z.id)}
                                style={{
                                    padding: '6px 16px',
                                    background: activeZone === z.id ? 'var(--color-accent-blue)' : 'transparent',
                                    color: activeZone === z.id ? '#000' : 'var(--color-text-secondary)',
                                    border: 'none',
                                    borderRadius: '6px',
                                    cursor: 'pointer',
                                    fontSize: '0.8rem',
                                    fontWeight: activeZone === z.id ? 'bold' : 'normal',
                                    transition: 'all 0.2s ease'
                                }}
                            >
                                {z.label}
                            </button>
                        ))}
                    </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', gap: '12px', alignItems: 'center' }}>
                    <div style={{ display: 'flex', gap: '2px', background: 'rgba(0,0,0,0.2)', padding: '2px', borderRadius: '6px' }}>
                        {['total', 'percentage'].map(mode => (
                            <button
                                key={mode}
                                onClick={() => setDisplayMode(mode)}
                                style={{
                                    padding: '4px 8px',
                                    background: displayMode === mode ? 'var(--color-accent-blue)' : 'transparent',
                                    color: displayMode === mode ? '#000' : 'var(--color-text-secondary)',
                                    border: 'none',
                                    borderRadius: '4px',
                                    cursor: 'pointer',
                                    fontSize: '0.7rem',
                                    fontWeight: displayMode === mode ? 'bold' : 'normal',
                                    transition: 'all 0.2s ease',
                                    textTransform: 'capitalize'
                                }}
                            >
                                {mode === 'percentage' ? '%' : mode}
                            </button>
                        ))}
                    </div>

                    {/* Legend */}
                    <div style={{ display: 'flex', gap: '12px', fontSize: '0.75rem', fontWeight: 'bold' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <div style={{ width: '12px', height: '12px', backgroundColor: teamColor, borderRadius: '2px' }}></div>
                            <span style={{ color: 'var(--color-text-primary)' }}>{teamName} Transitions</span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <div style={{ width: '12px', height: '12px', backgroundColor: rivalColor, borderRadius: '2px' }}></div>
                            <span style={{ color: 'var(--color-text-primary)' }}>{rivalName} Transitions</span>
                        </div>
                    </div>

                    <div style={{ display: 'flex', gap: '4px', background: 'rgba(0,0,0,0.2)', padding: '4px', borderRadius: '8px' }}>
                        {filters.map(f => (
                            <button
                                key={f.id}
                                onClick={() => setActiveFilter(f.id)}
                                style={{
                                    padding: '6px 12px',
                                    background: activeFilter === f.id ? 'var(--color-accent-blue)' : 'transparent',
                                    color: activeFilter === f.id ? '#000' : 'var(--color-text-secondary)',
                                    border: 'none',
                                    borderRadius: '6px',
                                    cursor: 'pointer',
                                    fontSize: '0.8rem',
                                    fontWeight: activeFilter === f.id ? 'bold' : 'normal',
                                    transition: 'all 0.2s ease'
                                }}
                            >
                                {f.label}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Unsuccessful Transitions Summary removed to reduce noise for the coaching staff */}
            </div>

            {/* Bar Chart Area */}
            <div style={{ position: 'relative', height: '250px', display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', padding: '0 1rem', marginTop: '1rem' }}>
                <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, zIndex: 0, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', pointerEvents: 'none' }}>
                    {[1, 0.75, 0.5, 0.25, 0].map((tick, i) => {
                        const tickValue = maxCount * tick;
                        return (
                            <div key={i} style={{ width: '100%', display: 'flex', alignItems: 'center' }}>
                                <div style={{ width: '35px', fontSize: '0.7rem', color: 'var(--color-text-secondary)', textAlign: 'right', paddingRight: '8px' }}>
                                    {displayMode === 'percentage' ? `${Math.round(tickValue)}%` : Math.round(tickValue)}
                                </div>
                                <div style={{ flex: 1, borderTop: '1px dashed rgba(255,255,255,0.1)' }}></div>
                            </div>
                        );
                    })}
                </div>

                <div style={{ position: 'absolute', top: 0, left: '43px', right: '1rem', bottom: 0, zIndex: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', paddingBottom: '2px' }}>
                    {offSuccess.map((offBucket, i) => {
                        const conBucket = conSuccess[i];
                        
                        const offValue = displayMode === 'percentage' ? (offBucket.count / (offTotalSuccess || 1)) * 100 : offBucket.count;
                        const conValue = displayMode === 'percentage' ? (conBucket.count / (conTotalSuccess || 1)) * 100 : conBucket.count;
                        
                        const offHeightPct = (offValue / maxCount) * 100;
                        const conHeightPct = (conValue / maxCount) * 100;
                        
                        const barWidth = `${100 / offSuccess.length - 5}%`;
                        
                        return (
                            <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: barWidth, height: '100%', justifyContent: 'flex-end' }}>
                                <div style={{ display: 'flex', width: '100%', height: '100%', alignItems: 'flex-end', justifyContent: 'center', gap: '6px' }}>
                                    
                                    {/* Offensive Bar */}
                                    <div 
                                        className="bar-container"
                                        style={{ 
                                            width: '45%', 
                                            height: `${Math.max(offHeightPct, 0.5)}%`, 
                                            backgroundColor: teamColor,
                                            backgroundImage: 'linear-gradient(to top, rgba(0,0,0,0.3) 0%, rgba(255,255,255,0.1) 100%)',
                                            border: `1px solid ${teamColor}`,
                                            borderBottom: 'none',
                                            borderRadius: '4px 4px 0 0',
                                            transition: 'height 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                                            position: 'relative',
                                            opacity: 0.9,
                                            boxShadow: '0 4px 10px rgba(0,0,0,0.3)',
                                            display: 'flex',
                                            justifyContent: 'center',
                                            alignItems: 'flex-start',
                                            paddingTop: '6px'
                                        }}
                                    >
                                        {offHeightPct > 10 && (
                                            <div style={{ color: '#000', fontWeight: '900', fontSize: '0.65rem', background: 'rgba(255,255,255,0.85)', padding: '2px 4px', borderRadius: '4px' }}>
                                                {displayMode === 'percentage' ? `${Math.round(offValue)}%` : offValue}
                                            </div>
                                        )}
                                        <div className="bar-tooltip" style={{ position: 'absolute', top: '-80px', left: '50%', transform: 'translateX(-50%)', background: 'rgba(0,0,0,0.95)', color: '#fff', padding: '8px 12px', borderRadius: '6px', fontSize: '0.75rem', opacity: 0, pointerEvents: 'none', transition: 'opacity 0.2s', whiteSpace: 'nowrap', zIndex: 10, display: 'flex', flexDirection: 'column', gap: '4px', border: `1px solid ${teamColor}` }}>
                                            <div style={{ fontWeight: 'bold', fontSize: '0.85rem', marginBottom: '2px', borderBottom: '1px solid rgba(255,255,255,0.2)', paddingBottom: '4px', color: teamColor }}>
                                                {teamName} {activeFilter === 'boxEntries' ? 'Entries' : 'Shots'}
                                            </div>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', gap: '12px' }}>
                                                <span style={{ color: 'var(--color-text-secondary)' }}>Count:</span>
                                                <span style={{ fontWeight: 'bold' }}>{offBucket.count}</span>
                                            </div>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', gap: '12px' }}>
                                                <span style={{ color: 'var(--color-text-secondary)' }}>Goals:</span>
                                                <span style={{ fontWeight: 'bold' }}>{offBucket.goals || 0}</span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Conceded Bar */}
                                    <div 
                                        className="bar-container"
                                        style={{ 
                                            width: '45%', 
                                            height: `${Math.max(conHeightPct, 0.5)}%`, 
                                            backgroundColor: rivalColor,
                                            backgroundImage: 'linear-gradient(to top, rgba(0,0,0,0.3) 0%, rgba(255,255,255,0.1) 100%)',
                                            border: `1px solid ${rivalColor}`,
                                            borderBottom: 'none',
                                            borderRadius: '4px 4px 0 0',
                                            transition: 'height 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                                            position: 'relative',
                                            opacity: 0.9,
                                            boxShadow: '0 4px 10px rgba(0,0,0,0.3)',
                                            display: 'flex',
                                            justifyContent: 'center',
                                            alignItems: 'flex-start',
                                            paddingTop: '6px'
                                        }}
                                    >
                                        {conHeightPct > 10 && (
                                            <div style={{ color: '#000', fontWeight: '900', fontSize: '0.65rem', background: 'rgba(255,255,255,0.85)', padding: '2px 4px', borderRadius: '4px' }}>
                                                {displayMode === 'percentage' ? `${Math.round(conValue)}%` : conValue}
                                            </div>
                                        )}
                                        <div className="bar-tooltip" style={{ position: 'absolute', top: '-80px', left: '50%', transform: 'translateX(-50%)', background: 'rgba(0,0,0,0.95)', color: '#fff', padding: '8px 12px', borderRadius: '6px', fontSize: '0.75rem', opacity: 0, pointerEvents: 'none', transition: 'opacity 0.2s', whiteSpace: 'nowrap', zIndex: 10, display: 'flex', flexDirection: 'column', gap: '4px', border: `1px solid ${rivalColor}` }}>
                                            <div style={{ fontWeight: 'bold', fontSize: '0.85rem', marginBottom: '2px', borderBottom: '1px solid rgba(255,255,255,0.2)', paddingBottom: '4px', color: rivalColor }}>
                                                {rivalName} {activeFilter === 'boxEntries' ? 'Entries' : 'Shots'}
                                            </div>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', gap: '12px' }}>
                                                <span style={{ color: 'var(--color-text-secondary)' }}>Count:</span>
                                                <span style={{ fontWeight: 'bold' }}>{conBucket.count}</span>
                                            </div>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', gap: '12px' }}>
                                                <span style={{ color: 'var(--color-text-secondary)' }}>Goals:</span>
                                                <span style={{ fontWeight: 'bold' }}>{conBucket.goals || 0}</span>
                                            </div>
                                        </div>
                                    </div>
                                    
                                </div>
                                
                                <div style={{ marginTop: '8px', fontSize: '0.8rem', color: 'var(--color-text-secondary)', fontWeight: 'bold', textAlign: 'center', whiteSpace: 'nowrap' }}>
                                    {offBucket.label}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
            
            <style dangerouslySetInnerHTML={{__html: `
                .bar-container:hover {
                    opacity: 1 !important;
                    filter: brightness(1.2);
                    cursor: pointer;
                }
                .bar-container:hover .bar-tooltip {
                    opacity: 1 !important;
                    z-index: 50 !important;
                }
            `}} />
        </div>
    );
};

export default TransitionTimeChart;
