import React from 'react';

const MatchCard = ({ match }) => {
    const isUpcoming = match.status === 'Upcoming';

    // Determine the "Opponent" for display relative to Tromsø IL if possible
    const isHome = match.homeTeam === 'Tromsø IL';
    const opponent = isHome ? match.awayTeam : match.homeTeam;

    return (
        <div className="glass-panel" style={{ padding: '1.25rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderLeft: match.isTIL ? '3px solid var(--color-accent-red)' : 'none' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <div style={{ fontWeight: 'bold', minWidth: '40px', textAlign: 'center', color: 'var(--color-text-secondary)' }}>
                    {new Date(match.date).toLocaleDateString('no-NO', { day: '2-digit', month: 'short' })}
                </div>
                <div>
                    <h3 style={{ margin: 0, fontSize: '1rem' }}>
                        {match.homeTeam} vs {match.awayTeam}
                    </h3>
                    <span style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)' }}>
                        {match.venue} • {match.competition}
                    </span>
                </div>
            </div>

            <div style={{ textAlign: 'right' }}>
                {isUpcoming ? (
                    <div style={{ fontSize: '0.9rem', color: 'var(--color-accent-green)', fontWeight: 'bold' }}>
                        {match.time}
                    </div>
                ) : (
                    <div style={{ fontSize: '1.2rem', fontWeight: 'bold', letterSpacing: '1px' }}>
                        {match.score}
                    </div>
                )}
            </div>
        </div>
    );
};

export default MatchCard;
