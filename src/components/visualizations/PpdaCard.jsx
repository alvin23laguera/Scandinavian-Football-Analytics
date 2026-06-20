import React from 'react';

const getOrdinalSuffix = (i) => {
    const j = i % 10, k = i % 100;
    if (j === 1 && k !== 11) return "st";
    if (j === 2 && k !== 12) return "nd";
    if (j === 3 && k !== 13) return "rd";
    return "th";
};

const PpdaCard = ({ teamName, ppdaValue, rank, totalTeams, leagueData = [], getBadge, selectedFixturesCount }) => {
    // Determine the color coding based on rank
    let rankColor = '#4ade80'; // Green (Good pressing)
    let rankLabel = 'Elite Pressing';
    
    if (rank) {
        if (rank <= 4) {
            rankColor = '#4ade80'; // Green
            rankLabel = 'Elite Pressing';
        } else if (rank <= 8) {
            rankColor = '#facc15'; // Yellow
            rankLabel = 'Active Pressing';
        } else if (rank <= 12) {
            rankColor = '#f97316'; // Orange
            rankLabel = 'Average Pressing';
        } else {
            rankColor = '#f87171'; // Red
            rankLabel = 'Passive Pressing';
        }
    }

    return (
        <div style={{
            background: 'linear-gradient(145deg, rgba(30, 41, 59, 0.7) 0%, rgba(15, 23, 42, 0.9) 100%)',
            border: `1px solid rgba(255,255,255,0.05)`,
            borderTop: `3px solid ${rankColor}`,
            borderRadius: '12px',
            padding: '1.5rem',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 10px 30px rgba(0,0,0,0.5)',
            position: 'relative',
            overflow: 'hidden',
            minHeight: '200px'
        }}>
            {/* Background glow effect based on rank color */}
            <div style={{
                position: 'absolute',
                top: '-50%',
                left: '-50%',
                width: '200%',
                height: '200%',
                background: `radial-gradient(circle at 50% 0%, ${rankColor}15 0%, transparent 50%)`,
                pointerEvents: 'none'
            }} />

            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1.5rem', zIndex: 1, width: '100%' }}>
                {/* Team Logo */}
                {getBadge && (
                    <div style={{
                        width: '60px',
                        height: '60px',
                        borderRadius: '50%',
                        background: 'rgba(0,0,0,0.3)',
                        padding: '10px',
                        boxShadow: 'inset 0 2px 10px rgba(0,0,0,0.5)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        marginBottom: '-0.5rem'
                    }}>
                        <img src={getBadge(teamName)} alt={teamName} style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                    </div>
                )}

                {/* PPDA Score */}
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    <span style={{ fontSize: '3.5rem', fontWeight: '900', color: 'var(--color-text-primary)', lineHeight: '1' }}>
                        {ppdaValue?.toFixed(2) || 'N/A'}
                    </span>
                    <span style={{ color: rankColor, fontSize: '1.2rem', fontWeight: 'bold', marginTop: '4px' }}>
                        PPDA
                    </span>
                    <span style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)', opacity: 0.6, marginTop: '2px' }}>
                        Across {selectedFixturesCount > 0 ? selectedFixturesCount : 'all'} selected fixture{selectedFixturesCount !== 1 ? 's' : ''}
                    </span>
                </div>
            </div>

            {/* Ranking Footer */}
            <div style={{
                marginTop: '1.5rem',
                paddingTop: '1.5rem',
                borderTop: '1px solid rgba(255,255,255,0.05)',
                width: '100%',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                zIndex: 1
            }}>
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <span style={{ color: 'var(--color-text-secondary)', fontSize: '0.8rem' }}>League Rank</span>
                    <span style={{ fontSize: '1.4rem', fontWeight: 'bold', color: 'var(--color-text-primary)' }}>
                        {rank ? `${rank}${getOrdinalSuffix(rank)}` : 'N/A'}
                    </span>
                </div>
                
                <div style={{
                    padding: '0.5rem 1rem',
                    background: `${rankColor}15`,
                    border: `1px solid ${rankColor}30`,
                    borderRadius: '20px',
                    color: rankColor,
                    fontSize: '0.85rem',
                    fontWeight: 'bold'
                }}>
                    {rankLabel}
                </div>
            </div>
        </div>
    );
};

const HorizontalBarChart = ({ leagueData, teamName, rankColor, getBadge }) => {
    if (!leagueData || leagueData.length === 0) return null;

    const idx = leagueData.findIndex(t => t.teamName === teamName);
    if (idx === -1) return null;

    let start = idx - 2;
    let end = idx + 3;

    if (start < 0) {
        end = Math.min(leagueData.length, end + Math.abs(start));
        start = 0;
    } else if (end > leagueData.length) {
        start = Math.max(0, start - (end - leagueData.length));
        end = leagueData.length;
    }

    const displayTeams = leagueData.slice(start, end);
    const maxPpda = Math.max(...displayTeams.map(t => t.ppda)); // No headroom so the highest takes 100%

    return (
        <div style={{
            background: 'linear-gradient(145deg, rgba(30, 41, 59, 0.7) 0%, rgba(15, 23, 42, 0.9) 100%)',
            border: `1px solid rgba(255,255,255,0.05)`,
            borderRadius: '12px',
            padding: '1.5rem',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            boxShadow: '0 10px 30px rgba(0,0,0,0.5)',
            flex: 2,
            minWidth: '350px'
        }}>
            <h4 style={{ margin: '0 0 1.5rem 0', color: 'var(--color-text-secondary)', fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '1px' }}>
                Ranking Comparison
            </h4>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {displayTeams.map((team, i) => {
                    const isSelected = team.teamName === teamName;
                    const barWidth = `${(team.ppda / maxPpda) * 100}%`;
                    const barColor = isSelected ? rankColor : 'rgba(255,255,255,0.2)';
                    const textColor = isSelected ? 'var(--color-text-primary)' : 'var(--color-text-secondary)';

                    return (
                        <div key={team.teamName} style={{ display: 'flex', alignItems: 'center', gap: '1rem', width: '100%' }}>
                            {/* Rank */}
                            <div style={{ width: '24px', color: 'var(--color-text-secondary)', fontSize: '0.85rem', fontWeight: 'bold', textAlign: 'right' }}>
                                {team.rank}.
                            </div>
                            
                            {/* Logo */}
                            {getBadge && (
                                <div title={team.teamName} style={{ width: '36px', height: '36px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                                    <img src={getBadge(team.teamName)} alt={team.teamName} style={{ width: '100%', height: '100%', objectFit: 'contain', opacity: isSelected ? 1 : 0.6 }} />
                                </div>
                            )}

                            {/* Bar & Value */}
                            <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                <div style={{ flex: 1, height: '8px', background: 'rgba(0,0,0,0.3)', borderRadius: '4px', overflow: 'hidden' }}>
                                    <div style={{ width: barWidth, height: '100%', background: barColor, borderRadius: '4px', transition: 'width 0.5s ease-out' }} />
                                </div>
                                <div style={{ width: '36px', color: textColor, fontSize: '0.85rem', fontWeight: 'bold' }}>
                                    {team.ppda.toFixed(2)}
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

const PpdaContainer = (props) => {
    return (
        <div style={{ display: 'flex', gap: '1.5rem', width: '100%', flexWrap: 'nowrap', alignItems: 'stretch' }}>
            <div style={{ flex: '0 1 250px', display: 'flex' }}>
                <div style={{ width: '100%' }}>
                    <PpdaCard {...props} />
                </div>
            </div>
            {props.leagueData && props.leagueData.length > 0 && (
                <HorizontalBarChart {...props} rankColor={
                    props.rank <= 4 ? '#4ade80' :
                    props.rank <= 8 ? '#facc15' :
                    props.rank <= 12 ? '#f97316' : '#f87171'
                } />
            )}
        </div>
    );
};

export default PpdaContainer;
