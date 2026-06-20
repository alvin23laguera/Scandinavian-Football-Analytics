import React, { useState, useEffect } from 'react';
import { getCachedBadge } from '../utils/badgeCache';
import { useMatchData } from '../context/MatchDataContext';
import LeagueTable from '../components/LeagueTable';

const Schedule = ({ onViewChange }) => {
    const { derivedMatches: matches, derivedStandings: leagueStandings } = useMatchData();
    const [view, setView] = useState(() => localStorage.getItem('scheduleView') || 'league'); // 'league' or team name
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const [currentRound, setCurrentRound] = useState(() => parseInt(localStorage.getItem('scheduleCurrentRound') || '12'));

    useEffect(() => {
        localStorage.setItem('scheduleView', view);
    }, [view]);

    useEffect(() => {
        localStorage.setItem('scheduleCurrentRound', currentRound.toString());
    }, [currentRound]);

    const uniqueTeams = [...new Set(matches.flatMap(m => [m.homeTeam, m.awayTeam]))].sort();

    const handleAnalyzeMatch = (match) => {
        if (match.status === 'Upcoming') return;
        localStorage.setItem('analyzeMatchTarget', JSON.stringify({
            id: match.id,
            homeTeam: match.homeTeam,
            awayTeam: match.awayTeam,
            round: match.round,
            title: `${match.homeTeam} vs ${match.awayTeam}`,
            score: match.score,
            date: match.date,
            time: match.time,
            venue: match.venue,
            competition: match.competition
        }));
        if (onViewChange) onViewChange('analysis');
    };

    // Team name aliases for badge lookup
    const teamAliases = {
        'Hamarkameratene': 'HamKam',
        'Aalesunds FK': 'Aalesund',
        'FK Bodø/Glimt': 'Bodø/Glimt',
        'Rosenborg BK': 'Rosenborg',
        'Lillestrøm SK': 'Lillestrøm',
        'Vålerenga IF': 'Vålerenga',
        'Sandefjord Fotball': 'Sandefjord',
        'Viking FK': 'Viking',
        'Kristiansund BK': 'Kristiansund',
        'Molde FK': 'Molde',
        'IK Start': 'Start',
        'Fredrikstad FK': 'Fredrikstad',
        'KFUM Oslo': 'KFUM Oslo',
    };

    const getDisplayName = (teamName) => teamAliases[teamName] || teamName;
    const getBadge = getCachedBadge;

    const displayedMatches = matches.filter(m => {
        if (view === 'league') return m.round === currentRound;
        return m.homeTeam === view || m.awayTeam === view;
    }).sort((a, b) => new Date(a.date) - new Date(b.date));

    // Get unique rounds for the dropdown
    const uniqueRounds = [...new Set(matches.map(m => m.round))].sort((a, b) => a - b);

    return (
        <div style={{ animation: 'fadeIn 0.5s ease-out' }}>
            <header style={{ 
                marginBottom: '2rem', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'space-between'
            }}>
                <div>
                    <h1 style={{ margin: 0, fontSize: '2.5rem', fontWeight: '900', letterSpacing: '1px', textTransform: 'uppercase', color: 'var(--color-text-primary)' }}>Terminliste</h1>
                    <p style={{ margin: '0.25rem 0 0 0', color: 'var(--color-text-secondary)', fontSize: '1rem' }}>
                        Schedule and match results
                    </p>
                </div>

                <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                    <div style={{ position: 'relative' }}>
                        <button 
                            onClick={() => setDropdownOpen(!dropdownOpen)}
                            style={{
                                display: 'flex', alignItems: 'center', gap: '0.75rem',
                                padding: '0.75rem 1rem', background: 'rgba(0,0,0,0.5)',
                                border: '1px solid rgba(255,255,255,0.2)', color: 'white',
                                borderRadius: '8px', fontSize: '1rem', cursor: 'pointer', minWidth: '220px'
                            }}
                        >
                            {view === 'league' ? (
                                <span>Hele Ligaen (By Round)</span>
                            ) : (
                                <>
                                    <img src={getBadge(view)} alt={view} style={{ width: '24px', height: '24px', objectFit: 'contain' }} />
                                    <span>{getDisplayName(view)}</span>
                                </>
                            )}
                            <span style={{ marginLeft: 'auto' }}>▼</span>
                        </button>
                        
                        {dropdownOpen && (
                            <div style={{
                                position: 'absolute', top: '100%', left: 0, right: 0, marginTop: '0.5rem',
                                background: 'var(--color-bg-elevated, #1a2235)', border: '1px solid rgba(255,255,255,0.1)',
                                borderRadius: '8px', zIndex: 50, maxHeight: '400px', overflowY: 'auto',
                                boxShadow: '0 4px 12px rgba(0,0,0,0.5)'
                            }}>
                                <div 
                                    onClick={() => { setView('league'); setDropdownOpen(false); }}
                                    style={{ padding: '0.75rem 1rem', cursor: 'pointer', borderBottom: '1px solid rgba(255,255,255,0.1)' }}
                                    onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.1)'}
                                    onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                                >
                                    Hele Ligaen (By Round)
                                </div>
                                {uniqueTeams.map(t => (
                                    <div 
                                        key={t}
                                        onClick={() => { setView(t); setDropdownOpen(false); }}
                                        style={{ 
                                            padding: '0.75rem 1rem', display: 'flex', alignItems: 'center', gap: '0.75rem',
                                            cursor: 'pointer'
                                        }}
                                        onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.1)'}
                                        onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                                    >
                                        <img src={getBadge(t)} alt={t} style={{ width: '24px', height: '24px', objectFit: 'contain' }} />
                                        <span>{getDisplayName(t)}</span>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {view === 'league' && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(0,0,0,0.5)', padding: '0.25rem', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.2)' }}>
                            <button 
                                onClick={() => setCurrentRound(r => Math.max(Math.min(...uniqueRounds), r - 1))}
                                style={{ background: 'transparent', border: 'none', color: 'white', padding: '0.5rem 1rem', cursor: 'pointer', borderRadius: '4px' }}
                                onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.1)'}
                                onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                            >
                                &lt; Forrige
                            </button>
                            <select 
                                value={currentRound}
                                onChange={(e) => setCurrentRound(parseInt(e.target.value))}
                                style={{
                                    padding: '0.5rem 1rem',
                                    background: 'transparent',
                                    border: 'none',
                                    color: 'white',
                                    fontSize: '1rem',
                                    outline: 'none',
                                    cursor: 'pointer',
                                    textAlign: 'center',
                                    fontWeight: 'bold',
                                    appearance: 'none',
                                    WebkitAppearance: 'none'
                                }}
                            >
                                {uniqueRounds.map(r => (
                                    <option key={r} value={r} style={{ background: '#1a2235' }}>Runde {r}</option>
                                ))}
                            </select>
                            <button 
                                onClick={() => setCurrentRound(r => Math.min(Math.max(...uniqueRounds), r + 1))}
                                style={{ background: 'transparent', border: 'none', color: 'white', padding: '0.5rem 1rem', cursor: 'pointer', borderRadius: '4px' }}
                                onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.1)'}
                                onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                            >
                                Neste &gt;
                            </button>
                        </div>
                    )}
                </div>
            </header>

            <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 5fr) minmax(0, 3.5fr)', gap: '2rem' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    {displayedMatches.length === 0 ? (
                        <div className="glass-panel" style={{ padding: '2rem', textAlign: 'center', color: 'var(--color-text-secondary)' }}>
                            Ingen kamper funnet (No matches found).
                        </div>
                    ) : (
                        displayedMatches.map(match => (
                            <div 
                                key={match.id} 
                                className="glass-panel"
                                style={{ 
                                    padding: '1.25rem',
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center',
                                    transition: 'transform 0.2s, background 0.2s',
                                    cursor: match.status !== 'Upcoming' ? 'pointer' : 'default',
                                    borderLeft: match.status !== 'Upcoming' ? '4px solid var(--color-accent-green)' : '4px solid rgba(255,255,255,0.1)'
                                }}
                                onClick={() => handleAnalyzeMatch(match)}
                                onMouseEnter={(e) => match.status !== 'Upcoming' && (e.currentTarget.style.transform = 'translateX(4px)', e.currentTarget.style.background = 'rgba(255,255,255,0.05)')}
                                onMouseLeave={(e) => match.status !== 'Upcoming' && (e.currentTarget.style.transform = 'none', e.currentTarget.style.background = 'rgba(255,255,255,0.02)')}
                            >
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', width: '25%' }}>
                                    <span style={{ fontSize: '0.85rem', color: 'var(--color-text-secondary)', fontWeight: 'bold', textTransform: 'uppercase' }}>{match.date}</span>
                                    <span style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.4)' }}>{match.venue}</span>
                                </div>
                                
                                <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', flex: 1, justifyContent: 'center' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', width: '150px', justifyContent: 'flex-end' }}>
                                        <span style={{ fontWeight: '600', fontSize: '1.1rem', color: '#fff', textAlign: 'right' }}>{getDisplayName(match.homeTeam)}</span>
                                        <img src={getBadge(match.homeTeam)} alt={match.homeTeam} style={{ width: '32px', height: '32px', objectFit: 'contain' }} />
                                    </div>
                                    
                                    <div style={{ 
                                        background: match.status !== 'Upcoming' ? 'rgba(0,0,0,0.5)' : 'transparent',
                                        padding: '0.5rem 1rem',
                                        borderRadius: '8px',
                                        minWidth: '80px',
                                        textAlign: 'center',
                                        border: match.status !== 'Upcoming' ? '1px solid rgba(255,255,255,0.1)' : 'none'
                                    }}>
                                        {match.status !== 'Upcoming' ? (
                                            <span style={{ fontSize: '1.5rem', fontWeight: '900', color: '#fff', letterSpacing: '2px' }}>{match.score}</span>
                                        ) : (
                                            <span style={{ fontSize: '1rem', fontWeight: 'bold', color: 'var(--color-text-secondary)' }}>{match.time}</span>
                                        )}
                                    </div>

                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', width: '150px', justifyContent: 'flex-start' }}>
                                        <img src={getBadge(match.awayTeam)} alt={match.awayTeam} style={{ width: '32px', height: '32px', objectFit: 'contain' }} />
                                        <span style={{ fontWeight: '600', fontSize: '1.1rem', color: '#fff', textAlign: 'left' }}>{getDisplayName(match.awayTeam)}</span>
                                    </div>
                                </div>

                                <div style={{ width: '25%', textAlign: 'right' }}>
                                    {match.status !== 'Upcoming' ? (
                                        <button 
                                            onClick={() => {
                                                localStorage.setItem('analyzeMatchTarget', JSON.stringify(match));
                                                if (onViewChange) onViewChange('analysis');
                                            }}
                                            style={{ 
                                                background: 'var(--color-primary, #1e3a8a)', 
                                                color: '#fbbf24', 
                                                border: 'none', 
                                                padding: '0.4rem 0.8rem', 
                                                borderRadius: '4px', 
                                                fontWeight: 'bold', 
                                                fontSize: '0.85rem',
                                                cursor: 'pointer',
                                                boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
                                            }}>
                                            Analyze Match
                                        </button>
                                    ) : (
                                        <span style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.3)' }}>Upcoming</span>
                                    )}
                                </div>
                            </div>
                        ))
                    )}
                </div>

                <div>
                    <h2 style={{ fontSize: '1.2rem', marginBottom: '1rem', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '0.5rem', color: '#fff' }}>Eliteserien Standings</h2>
                    <LeagueTable />
                </div>
            </div>
        </div>
    );
};

export default Schedule;
