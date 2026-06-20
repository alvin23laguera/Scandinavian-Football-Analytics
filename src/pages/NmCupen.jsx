import React from 'react';
import { nmCupenMatches } from '../data/nmCupenData';

const MatchNode = ({ match, scale = 1, isUpcoming = false, isFinal = false }) => {
    return (
        <div className={`glass-panel bracket-node ${isFinal ? 'final-node' : ''}`} style={{ 
            padding: isFinal ? '1rem' : `${0.5 * scale}rem`, 
            minWidth: isFinal ? '220px' : `${140 * scale}px`, 
            position: 'relative',
            boxShadow: isFinal ? '0 0 30px rgba(255, 215, 0, 0.1)' : 'none',
            border: isFinal ? '1px solid rgba(255, 215, 0, 0.3)' : '1px solid rgba(255,255,255,0.05)',
            transform: `scale(${isFinal ? 1 : scale})`,
            transition: 'all 0.2s ease-in-out'
        }}>
            {isFinal && <div style={{ fontSize: '0.7rem', color: 'gold', marginBottom: '0.8rem', fontWeight: 'bold', textAlign: 'center', textTransform: 'uppercase', letterSpacing: '1px' }}>Ullevaal Stadion • {match.date}</div>}
            
            <div className="team-row" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingBottom: '0.2rem', borderBottom: '1px solid rgba(255,255,255,0.05)', marginBottom: '0.2rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    {match.homeBadge && <img src={match.homeBadge} alt={match.homeTeam} style={{ width: isFinal ? '20px' : '14px', height: isFinal ? '20px' : '14px', objectFit: 'contain' }} />}
                    <span style={{ fontWeight: match.homeScore !== null && match.homeScore > match.awayScore ? '700' : '500', fontSize: isFinal ? '0.95rem' : '0.8rem', color: isUpcoming ? 'var(--color-text-secondary)' : '#fff' }}>
                        {match.homeTeam.length > 15 ? match.homeTeam.substring(0, 13) + '..' : match.homeTeam}
                    </span>
                </div>
                <span style={{ fontWeight: 'bold', fontSize: isFinal ? '1.05rem' : '0.9rem', color: match.homeScore > match.awayScore ? 'var(--color-accent-green)' : 'var(--color-text-secondary)' }}>
                    {isUpcoming ? '-' : match.homeScore}
                </span>
            </div>

            <div className="team-row" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    {match.awayBadge && <img src={match.awayBadge} alt={match.awayTeam} style={{ width: isFinal ? '20px' : '14px', height: isFinal ? '20px' : '14px', objectFit: 'contain' }} />}
                    <span style={{ fontWeight: match.awayScore !== null && match.awayScore > match.homeScore ? '700' : '500', fontSize: isFinal ? '0.95rem' : '0.8rem', color: isUpcoming ? 'var(--color-text-secondary)' : '#fff' }}>
                        {match.awayTeam.length > 15 ? match.awayTeam.substring(0, 13) + '..' : match.awayTeam}
                    </span>
                </div>
                <span style={{ fontWeight: 'bold', fontSize: isFinal ? '1.05rem' : '0.9rem', color: match.awayScore > match.homeScore ? 'var(--color-accent-green)' : 'var(--color-text-secondary)' }}>
                    {isUpcoming ? '-' : match.awayScore}
                </span>
            </div>
            {isUpcoming && !isFinal && <div style={{ fontSize: '0.65rem', color: 'var(--color-accent-green)', marginTop: '0.3rem', textAlign: 'center' }}>{match.date} • {match.time}</div>}
        </div>
    );
};

const BracketColumn = ({ title, matches, scale = 1, isUpcoming = false }) => {
    return (
        <div className="bracket-column" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-around', gap: '0.5rem', flex: 1, minHeight: '100%', padding: '0 0.2rem' }}>
            <h4 style={{ color: 'var(--color-text-secondary)', textTransform: 'uppercase', letterSpacing: '1px', fontSize: '0.75rem', textAlign: 'center', marginBottom: '0.5rem', whiteSpace: 'nowrap' }}>{title}</h4>
            <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-around', height: '100%', gap: '1rem' }}>
                {matches.map(match => (
                    <MatchNode key={match.id} match={match} scale={scale} isUpcoming={isUpcoming} />
                ))}
            </div>
        </div>
    );
};

const NmCupen = () => {
    return (
        <div className="nm-cupen-page" style={{ padding: '2rem', animation: 'fadeIn 0.5s ease-out', height: '100%', display: 'flex', flexDirection: 'column' }}>
            <h1 style={{ fontSize: '2.5rem', marginBottom: '0.5rem', background: '-webkit-linear-gradient(45deg, var(--color-accent-green), #ffffff)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>NM Cupen 2026</h1>
            <p style={{ color: 'var(--color-text-secondary)', marginBottom: '2rem', fontSize: '0.9rem', fontStyle: 'italic', opacity: 0.8 }}>* Displaying playoff bracket from the Round of 16 onwards.</p>

            <div className="bracket-wrapper" style={{ 
                flex: 1,
                padding: '2rem', 
                backgroundColor: 'rgba(0,0,0,0.1)', 
                borderRadius: '16px',
                border: '1px solid rgba(255,255,255,0.05)',
                display: 'flex',
                alignItems: 'stretch',
                justifyContent: 'center',
                minHeight: '600px'
            }}>
                
                {/* LEFT SIDE BLOCK */}
                <div style={{ display: 'flex', flex: 3 }}>
                    <BracketColumn title="Round of 16" matches={nmCupenMatches.left.r16} scale={0.75} />
                    <BracketColumn title="Quarterfinals" matches={nmCupenMatches.left.qf} scale={0.85} />
                    <BracketColumn title="Semifinal" matches={nmCupenMatches.left.sf} scale={0.95} />
                </div>

                {/* CENTER FINAL BLOCK */}
                <div style={{ flex: 2, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', padding: '0 1rem' }}>
                    <h2 style={{ color: 'gold', textTransform: 'uppercase', letterSpacing: '2px', fontSize: '1.2rem', marginBottom: '1.5rem', textAlign: 'center', textShadow: '0 0 10px rgba(255,215,0,0.5)' }}>The Final</h2>
                    <MatchNode match={nmCupenMatches.final} isFinal={true} />
                </div>

                {/* RIGHT SIDE BLOCK */}
                <div style={{ display: 'flex', flex: 3 }}>
                    <BracketColumn title="Semifinal" matches={nmCupenMatches.right.sf} scale={0.95} />
                    <BracketColumn title="Quarterfinals" matches={nmCupenMatches.right.qf} scale={0.85} />
                    <BracketColumn title="Round of 16" matches={nmCupenMatches.right.r16} scale={0.75} />
                </div>

            </div>
        </div>
    );
};

export default NmCupen;
