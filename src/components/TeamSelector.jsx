import React, { useState, useEffect } from 'react';
import { leagueStandings } from '../data/mockData';

const TeamSelector = ({ selectedTeams, onSelectTeam }) => {
    // If no teams are selected, expand automatically
    const [isExpanded, setIsExpanded] = useState(selectedTeams.length === 0);

    useEffect(() => {
        if (selectedTeams.length === 0) {
            setIsExpanded(true);
        }
    }, [selectedTeams]);

    const handleTeamClick = (teamName) => {
        onSelectTeam(teamName);
        setIsExpanded(false); // Collapse immediately
    };

    if (!isExpanded && selectedTeams.length > 0) {
        return (
            <div style={{ marginBottom: '1rem', display: 'flex' }}>
                <button 
                    onClick={() => setIsExpanded(true)}
                    className="glass-panel"
                    style={{
                        padding: '0.5rem 1rem',
                        fontSize: '0.85rem',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        cursor: 'pointer',
                        color: 'var(--color-text-secondary)',
                        border: '1px solid rgba(255,255,255,0.1)',
                        transition: 'all 0.2s ease',
                        background: 'rgba(255, 255, 255, 0.05)',
                        borderRadius: '8px'
                    }}
                    onMouseEnter={(e) => { 
                        e.currentTarget.style.color = 'white'; 
                        e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)';
                        e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.3)';
                    }}
                    onMouseLeave={(e) => { 
                        e.currentTarget.style.color = 'var(--color-text-secondary)'; 
                        e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)';
                        e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.1)';
                    }}
                >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"></path>
                    </svg>
                    <span>Change Opponent</span>
                </button>
            </div>
        );
    }

    return (
        <div className="team-selector-container glass-panel" style={{ padding: '2rem', marginBottom: '2rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                    <div>
                        <h3 style={{ margin: 0, fontSize: '1.4rem', color: 'var(--color-text-primary)' }}>Velg Lag</h3>
                        <div style={{ fontSize: '0.8rem', textTransform: 'uppercase', color: 'var(--color-text-secondary)' }}>Select Team</div>
                    </div>
                </div>

                <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                    {selectedTeams.length > 0 && (
                        <button 
                            onClick={() => setIsExpanded(false)}
                            style={{
                                background: 'transparent', border: 'none', color: 'var(--color-text-secondary)',
                                cursor: 'pointer', fontSize: '0.9rem', textDecoration: 'underline'
                            }}
                        >
                            Cancel
                        </button>
                    )}
                </div>
            </div>
            
            <div 
                className="team-grid" 
                style={{ 
                    display: 'flex', 
                    flexWrap: 'wrap',
                    justifyContent: 'center',
                    gap: '1rem',
                }}
            >
                {[{ team: 'Eliteserien', badgeUrl: 'https://images.fotmob.com/image_resources/logo/leaguelogo/59.png' }, ...leagueStandings].map((teamData) => {
                    const isSelected = selectedTeams.includes(teamData.team);

                    return (
                        <button
                            key={teamData.team}
                            onClick={() => handleTeamClick(teamData.team)}
                            style={{
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                background: isSelected ? 'rgba(255, 255, 255, 0.15)' : 'transparent',
                                border: isSelected ? '1px solid var(--color-accent-green)' : '1px solid transparent',
                                opacity: 1,
                                borderRadius: '12px',
                                padding: '1rem 0.5rem',
                                cursor: 'pointer',
                                transition: 'all 0.2s ease',
                                color: 'inherit'
                            }}
                            onMouseEnter={(e) => {
                                if (!isSelected) {
                                    e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)';
                                    e.currentTarget.style.transform = 'translateY(-2px)';
                                }
                            }}
                            onMouseLeave={(e) => {
                                if (!isSelected) {
                                    e.currentTarget.style.background = 'transparent';
                                    e.currentTarget.style.transform = 'translateY(0)';
                                }
                            }}
                        >
                            <img 
                                src={teamData.badgeUrl} 
                                alt={`${teamData.team} badge`} 
                                style={{ 
                                    width: '50px', 
                                    height: '50px', 
                                    objectFit: 'contain',
                                    marginBottom: '0.75rem'
                                }} 
                            />
                            <span style={{ fontSize: '0.8rem', textAlign: 'center', lineHeight: '1.2' }}>
                                {teamData.team}
                            </span>
                        </button>
                    );
                })}
            </div>
        </div>
    );
};

export default TeamSelector;
