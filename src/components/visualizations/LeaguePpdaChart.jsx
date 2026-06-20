import React, { useMemo } from 'react';

const LeaguePpdaChart = ({ leagueData, getBadge }) => {
    const sortedTeams = useMemo(() => {
        if (!leagueData) return [];
        return Object.entries(leagueData)
            .map(([teamName, stats]) => ({
                teamName,
                ppda: stats.ppda || 0
            }))
            .filter(t => t.ppda > 0)
            .sort((a, b) => a.ppda - b.ppda); // Lowest PPDA is better
    }, [leagueData]);

    if (!leagueData || sortedTeams.length === 0) {
        return <div style={{ color: 'var(--color-text-secondary)', fontSize: '0.9rem' }}>No PPDA data available.</div>;
    }

    const maxPpda = Math.max(...sortedTeams.map(t => t.ppda), 15);

    return (
        <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                <span style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)' }}>Passes Allowed Per Defensive Action (Lower is better)</span>
            </div>
            
            {sortedTeams.map((team, index) => {
                const percentage = (team.ppda / maxPpda) * 100;
                const isTop3 = index < 3;
                const badge = getBadge(team.teamName);
                
                return (
                    <div key={team.teamName} style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div style={{ width: '20px', textAlign: 'center', fontSize: '0.8rem', color: 'var(--color-text-secondary)', fontWeight: 'bold' }}>
                            {index + 1}
                        </div>
                        
                        <div style={{ width: '24px', height: '24px', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                            {badge ? (
                                <img src={badge} alt={team.teamName} style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} />
                            ) : (
                                <div style={{ width: '20px', height: '20px', borderRadius: '50%', background: 'var(--color-bg-tertiary)' }}></div>
                            )}
                        </div>
                        
                        <div style={{ width: '100px', fontSize: '0.85rem', color: 'var(--color-text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                            {team.teamName}
                        </div>
                        
                        <div style={{ flex: 1, height: '20px', background: 'rgba(255,255,255,0.05)', borderRadius: '10px', overflow: 'hidden', position: 'relative' }}>
                            <div style={{
                                width: `${percentage}%`,
                                height: '100%',
                                background: isTop3 
                                    ? 'linear-gradient(90deg, rgba(236, 72, 153, 0.5) 0%, rgba(236, 72, 153, 1) 100%)' 
                                    : 'linear-gradient(90deg, rgba(56, 189, 248, 0.4) 0%, rgba(56, 189, 248, 0.8) 100%)',
                                borderRadius: '10px',
                                transition: 'width 0.5s ease-out'
                            }}></div>
                        </div>
                        
                        <div style={{ width: '40px', textAlign: 'right', fontSize: '0.85rem', fontWeight: 'bold', color: 'var(--color-text-primary)' }}>
                            {team.ppda.toFixed(1)}
                        </div>
                    </div>
                );
            })}
        </div>
    );
};

export default LeaguePpdaChart;
