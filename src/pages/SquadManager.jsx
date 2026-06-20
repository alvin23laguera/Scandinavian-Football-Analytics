import React, { useState, useEffect } from 'react';
import { getCachedBadge } from '../utils/badgeCache';
import rosters from '../data/rosters.json';
import { useMatchData } from '../context/MatchDataContext';

const SquadManager = () => {
    const [selectedTeam, setSelectedTeam] = useState('Tromsø');
    const [playerStats, setPlayerStats] = useState({});
    const { derivedStandings } = useMatchData();

    const categories = [
        { title: 'Keepere', subtitle: 'Goalkeepers', pos: 'GK' },
        { title: 'Forsvarsspillere', subtitle: 'Defenders', pos: 'DF' },
        { title: 'Midtbanespillere', subtitle: 'Midfielders', pos: 'MF' },
        { title: 'Angrepsspillere', subtitle: 'Attackers', pos: 'FW' }
    ];

    useEffect(() => {
        const storedEventsStr = localStorage.getItem('optaEvents');
        const allEvents = storedEventsStr ? JSON.parse(storedEventsStr) : [];
        
        const stats = {};
        allEvents.forEach(e => {
            if (e.playerName) {
                if (!stats[e.playerName]) {
                    stats[e.playerName] = {
                        passes: 0,
                        shots: 0,
                        tackles: 0,
                        interceptions: 0,
                        duels: 0,
                        events: 0
                    };
                }
                stats[e.playerName].events++;
                if (e.type === 'Pass') stats[e.playerName].passes++;
                if (e.type === 'Shot' || e.type === 'Goal') stats[e.playerName].shots++;
                if (e.type === 'Tackle') stats[e.playerName].tackles++;
                if (e.type === 'Interception') stats[e.playerName].interceptions++;
                if (e.type === 'Duel') stats[e.playerName].duels++;
            }
        });
        setPlayerStats(stats);
    }, []);

    const getBadge = getCachedBadge;

    const teamRoster = rosters[selectedTeam] || [];

    return (
        <div style={{ animation: 'fadeIn 0.5s ease-out' }}>
            {/* Header */}
            <header style={{ 
                marginBottom: '2rem', 
                display: 'flex', 
                flexDirection: 'column',
                alignItems: 'center', 
                justifyContent: 'center',
                gap: '1.5rem'
            }}>
                <div style={{ textAlign: 'center' }}>
                    <h1 style={{ margin: 0, fontSize: '2.5rem', fontWeight: '900', letterSpacing: '1px', textTransform: 'uppercase', color: 'var(--color-text-primary)' }}>Squad Manager</h1>
                    <p style={{ margin: '0.25rem 0 0 0', color: 'var(--color-text-secondary)', fontSize: '1rem' }}>
                        Player performance and roster analysis
                    </p>
                </div>

                <div style={{
                    display: 'flex',
                    justifyContent: 'center',
                    flexWrap: 'wrap',
                    gap: '0.4rem',
                    background: 'rgba(255,255,255,0.02)',
                    padding: '1rem',
                    borderRadius: '12px',
                    border: '1px solid rgba(255,255,255,0.05)',
                    width: '100%'
                }}>
                    {derivedStandings.map(t => (
                        <div 
                            key={t.team}
                            onClick={() => setSelectedTeam(t.team)}
                            title={t.team}
                            style={{ 
                                cursor: 'pointer',
                                padding: '0.3rem',
                                borderRadius: '8px',
                                background: selectedTeam === t.team ? 'rgba(255,255,255,0.1)' : 'transparent',
                                border: selectedTeam === t.team ? '1px solid var(--color-accent-blue)' : '1px solid transparent',
                                transition: 'all 0.2s ease',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center'
                            }}
                            onMouseEnter={(e) => {
                                if (selectedTeam !== t.team) {
                                    e.currentTarget.style.background = 'rgba(255,255,255,0.05)';
                                }
                            }}
                            onMouseLeave={(e) => {
                                if (selectedTeam !== t.team) {
                                    e.currentTarget.style.background = 'transparent';
                                }
                            }}
                        >
                            <img 
                                src={getBadge(t.team)} 
                                alt={t.team} 
                                style={{ 
                                    width: '38px', 
                                    height: '38px', 
                                    objectFit: 'contain',
                                    filter: selectedTeam === t.team ? 'none' : 'grayscale(30%) opacity(0.8)',
                                    transition: 'all 0.2s ease'
                                }} 
                            />
                        </div>
                    ))}
                </div>
            </header>

            {/* Roster Categories */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                {categories.map(cat => {
                    const players = teamRoster.filter(p => p.position === cat.pos);
                    if (players.length === 0) return null;

                    return (
                        <div key={cat.pos} className="glass-panel" style={{ padding: '1.5rem' }}>
                            <div style={{ marginBottom: '1.5rem', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '0.5rem' }}>
                                <h2 style={{ margin: 0, fontSize: '1.5rem', color: 'var(--color-primary, #3b82f6)' }}>{cat.title}</h2>
                                <p style={{ margin: 0, color: 'var(--color-text-secondary)', fontSize: '0.9rem' }}>{cat.subtitle}</p>
                            </div>
                            
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1.5rem' }}>
                                {players.map(player => {
                                    const pStats = playerStats[player.name] || { passes: 0, shots: 0, tackles: 0, interceptions: 0, events: 0 };
                                    return (
                                        <div key={player.id} style={{ 
                                            background: 'rgba(255,255,255,0.03)', 
                                            borderRadius: '8px', 
                                            overflow: 'hidden',
                                            border: '1px solid rgba(255,255,255,0.05)',
                                            transition: 'transform 0.2s',
                                            cursor: 'pointer'
                                        }}
                                        onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-4px)'}
                                        onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
                                        >
                                            <div style={{ display: 'flex', padding: '1rem', gap: '1rem', alignItems: 'center', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                                                {player.image && player.image !== 'false' ? (
                                                    <img src={player.image} alt={player.name} style={{ width: '60px', height: '60px', borderRadius: '50%', objectFit: 'cover', objectPosition: 'center 15%', border: '2px solid rgba(255,255,255,0.1)' }} />
                                                ) : (
                                                    <div style={{ width: '60px', height: '60px', borderRadius: '50%', background: 'rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem', fontWeight: 'bold' }}>
                                                        {player.number || ''}
                                                    </div>
                                                )}
                                                <div>
                                                    <div style={{ fontWeight: 'bold', fontSize: '1.1rem', color: '#fff' }}>{player.name}</div>
                                                    <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', marginTop: '0.25rem' }}>
                                                        <span style={{ fontSize: '0.8rem', background: 'var(--color-primary, #3b82f6)', padding: '2px 6px', borderRadius: '4px', fontWeight: 'bold' }}>#{player.number}</span>
                                                        <span style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)' }}>{player.status || 'Active'}</span>
                                                    </div>
                                                </div>
                                            </div>
                                            
                                            <div style={{ padding: '1rem', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', fontSize: '0.85rem' }}>
                                                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                                    <span style={{ color: 'var(--color-text-secondary)' }}>Events:</span>
                                                    <span style={{ fontWeight: 'bold', color: '#fff' }}>{pStats.events}</span>
                                                </div>
                                                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                                    <span style={{ color: 'var(--color-text-secondary)' }}>Passes:</span>
                                                    <span style={{ fontWeight: 'bold', color: '#fff' }}>{pStats.passes}</span>
                                                </div>
                                                {cat.pos === 'FW' || cat.pos === 'MF' ? (
                                                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                                        <span style={{ color: 'var(--color-text-secondary)' }}>Shots:</span>
                                                        <span style={{ fontWeight: 'bold', color: '#fff' }}>{pStats.shots}</span>
                                                    </div>
                                                ) : null}
                                                {cat.pos === 'DF' || cat.pos === 'MF' ? (
                                                    <>
                                                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                                            <span style={{ color: 'var(--color-text-secondary)' }}>Tackles:</span>
                                                            <span style={{ fontWeight: 'bold', color: '#fff' }}>{pStats.tackles}</span>
                                                        </div>
                                                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                                            <span style={{ color: 'var(--color-text-secondary)' }}>Intercept:</span>
                                                            <span style={{ fontWeight: 'bold', color: '#fff' }}>{pStats.interceptions}</span>
                                                        </div>
                                                    </>
                                                ) : null}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default SquadManager;
