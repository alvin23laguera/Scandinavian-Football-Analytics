import React from 'react';
import { getCachedBadge } from '../../utils/badgeCache';
import { leagueStandings } from '../../data/mockData';

const teamColors = {
    'Tromsø': 'rgba(227, 6, 19, 0.7)', // Red
    'Tromsø IL': 'rgba(227, 6, 19, 0.7)',
    'Viking': 'rgba(128, 0, 32, 0.7)', // Burgundy
    'Viking FK': 'rgba(128, 0, 32, 0.7)',
    'Lillestrøm': 'rgba(255, 237, 0, 0.7)', // Yellow
    'Lillestrøm SK': 'rgba(255, 237, 0, 0.7)',
    'Bodø/Glimt': 'rgba(255, 204, 0, 0.7)', // Yellow (diff shade)
    'FK Bodø/Glimt': 'rgba(255, 204, 0, 0.7)',
    'Molde': 'rgba(135, 206, 235, 0.7)', // Sky blue
    'Molde FK': 'rgba(135, 206, 235, 0.7)',
    'Brann': 'rgba(255, 255, 255, 0.7)', // White
    'SK Brann': 'rgba(255, 255, 255, 0.7)',
    'HamKam': 'rgba(0, 128, 0, 0.7)', // Green
    'Hamarkameratene': 'rgba(0, 128, 0, 0.7)',
    'Sandefjord': 'rgba(255, 99, 71, 0.7)', // Red (diff shade)
    'Sandefjord Fotball': 'rgba(255, 99, 71, 0.7)',
    'Kristiansund': 'rgba(0, 0, 128, 0.7)', // Navy blue
    'Kristiansund BK': 'rgba(0, 0, 128, 0.7)',
    'KFUM': 'rgba(240, 240, 240, 0.7)', // White (diff shade)
    'KFUM Oslo': 'rgba(240, 240, 240, 0.7)',
    'Vålerenga': 'rgba(0, 0, 255, 0.7)', // Blue
    'Vålerenga IF': 'rgba(0, 0, 255, 0.7)',
    'Fredrikstad': 'rgba(178, 34, 34, 0.7)', // Red (diff shade)
    'Fredrikstad FK': 'rgba(178, 34, 34, 0.7)',
    'Sarpsborg 08': 'rgba(65, 105, 225, 0.7)', // Blue (diff shade)
    'Sarpsborg': 'rgba(65, 105, 225, 0.7)',
    'Rosenborg': 'rgba(100, 100, 100, 0.7)', // Light black / gray
    'Rosenborg BK': 'rgba(100, 100, 100, 0.7)',
    'Start': 'rgba(173, 255, 47, 0.7)', // Neon yellow/green
    'IK Start': 'rgba(173, 255, 47, 0.7)',
    'Aalesund': 'rgba(255, 165, 0, 0.7)', // Orange
    'Aalesunds FK': 'rgba(255, 165, 0, 0.7)',
    'Eliteserien': 'rgba(0, 0, 128, 0.7)', // Navy blue
    'Opponent': 'rgba(0, 0, 128, 0.7)',
    'Opponents': 'rgba(0, 0, 128, 0.7)',
};

const getBadge = getCachedBadge;

const FieldTiltMap = ({ 
    teamTilt = 60, 
    opponentTilt = 40, 
    teamName = "Tromsø", 
    opponentName = "Opponents", 
    isMultiCompare = false,
    teamCount = 0,
    opponentCount = 0,
    metricType = "passes",
    teamPossession = null,
    opponentPossession = null
}) => {
    
    // Default to a fallback color if not found
    const tColor = teamColors[teamName] || 'rgba(227, 6, 19, 0.7)';
    const oColor = teamColors[opponentName] || 'rgba(255, 255, 255, 0.3)';

    const teamLogo = getBadge(teamName);
    // If we compare against multiple matches or explicitly requested 'Opponents'
    const opponentLogo = (isMultiCompare || opponentName === 'Opponents' || opponentName === 'Opponent') 
        ? getBadge('Opponents') 
        : getBadge(opponentName);

    return (
        <div style={{ width: '100%', maxWidth: '800px', margin: '0 auto' }}>
            {/* Possession Legend */}
            {(teamPossession !== null && opponentPossession !== null) && (
                <div style={{ display: 'flex', justifyContent: 'center', gap: '2rem', marginBottom: '1rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <div style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: tColor, boxShadow: '0 2px 4px rgba(0,0,0,0.3)' }}></div>
                        <span style={{ color: 'var(--color-text-primary)', fontSize: '0.95rem', fontWeight: 'bold' }}>
                            {teamName} Possession: {teamPossession.toFixed(1)}%
                        </span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <div style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: oColor, boxShadow: '0 2px 4px rgba(0,0,0,0.3)' }}></div>
                        <span style={{ color: 'var(--color-text-primary)', fontSize: '0.95rem', fontWeight: 'bold' }}>
                            {opponentName === 'Opponent' || opponentName === 'Opponents' ? 'Rivals' : opponentName} Possession: {opponentPossession.toFixed(1)}%
                        </span>
                    </div>
                </div>
            )}
            
            <div style={{ position: 'relative', width: '100%' }}>
                <svg viewBox="0 0 100 65" style={{ width: '100%', height: 'auto', backgroundColor: 'var(--color-pitch-grass)', borderRadius: '8px', overflow: 'hidden' }}>
                {/* Zones (drawn before lines so lines are on top!) */}
                <rect x="0" y="0" width={teamTilt} height="65" fill={tColor} />
                <rect x={teamTilt} y="0" width={opponentTilt} height="65" fill={oColor} />
                
                {/* Zone Divider */}
                <line x1={teamTilt} y1="0" x2={teamTilt} y2="65" stroke="rgba(255, 255, 255, 0.8)" strokeWidth="0.8" />

                {/* Static Pitch Markings */}
                {/* Touchlines (Outer border) */}
                <rect x="0.5" y="0.5" width="99" height="64" fill="none" stroke="rgba(255, 255, 255, 0.5)" strokeWidth="0.5" />
                
                {/* Halfway line */}
                <line x1="50" y1="0" x2="50" y2="65" stroke="rgba(255, 255, 255, 0.5)" strokeWidth="0.5" />
                {/* Center Circle */}
                <circle cx="50" cy="32.5" r="9.15" fill="none" stroke="rgba(255, 255, 255, 0.5)" strokeWidth="0.5" />
                {/* Center Spot */}
                <circle cx="50" cy="32.5" r="0.5" fill="rgba(255, 255, 255, 0.5)" />
                
                {/* Left Penalty Area (Team) */}
                <rect x="0" y="13.84" width="16.5" height="37.32" fill="none" stroke="rgba(255, 255, 255, 0.5)" strokeWidth="0.5" />
                {/* Left 6-yard box */}
                <rect x="0" y="24.84" width="5.5" height="15.32" fill="none" stroke="rgba(255, 255, 255, 0.5)" strokeWidth="0.5" />
                {/* Left Penalty Spot */}
                <circle cx="11" cy="32.5" r="0.5" fill="rgba(255, 255, 255, 0.5)" />
                {/* Left Penalty Arc (D) */}
                <path d="M 16.5 25.19 A 9.15 9.15 0 0 1 16.5 39.81" fill="none" stroke="rgba(255, 255, 255, 0.5)" strokeWidth="0.5" />
                
                {/* Right Penalty Area (Opponent) */}
                <rect x="83.5" y="13.84" width="16.5" height="37.32" fill="none" stroke="rgba(255, 255, 255, 0.5)" strokeWidth="0.5" />
                {/* Right 6-yard box */}
                <rect x="94.5" y="24.84" width="5.5" height="15.32" fill="none" stroke="rgba(255, 255, 255, 0.5)" strokeWidth="0.5" />
                {/* Right Penalty Spot */}
                <circle cx="89" cy="32.5" r="0.5" fill="rgba(255, 255, 255, 0.5)" />
                {/* Right Penalty Arc (D) */}
                <path d="M 83.5 25.19 A 9.15 9.15 0 0 0 83.5 39.81" fill="none" stroke="rgba(255, 255, 255, 0.5)" strokeWidth="0.5" />
            </svg>
            
            {/* HTML Overlay for Logos and Text */}
            <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none', display: 'flex' }}>
                {/* Team Side */}
                <div style={{ width: `${teamTilt}%`, height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '0.75rem' }}>
                    <div style={{
                        width: '60px',
                        height: '60px',
                        borderRadius: '50%',
                        background: (isMultiCompare || teamName === 'Opponents' || teamName === 'Opponent') ? '#0a1024' : 'rgba(0,0,0,0.4)',
                        padding: '10px',
                        boxShadow: 'inset 0 2px 10px rgba(0,0,0,0.5), 0 4px 6px rgba(0,0,0,0.3)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        backdropFilter: 'blur(4px)'
                    }}>
                        <img src={teamLogo} alt={teamName} style={{ 
                            width: '100%', 
                            height: '100%', 
                            objectFit: 'contain',
                            transform: (isMultiCompare || teamName === 'Opponents' || teamName === 'Opponent') ? 'scale(1.15)' : 'none'
                        }} />
                    </div>
                    <span style={{ fontSize: '2.5rem', fontWeight: '900', color: 'white', textShadow: '2px 2px 4px rgba(0,0,0,0.8)', lineHeight: 1 }}>
                        {teamTilt.toFixed(1)}%
                    </span>
                </div>

                {/* Opponent Side */}
                <div style={{ width: `${opponentTilt}%`, height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '0.75rem' }}>
                    <div style={{
                        width: '60px',
                        height: '60px',
                        borderRadius: '50%',
                        background: (isMultiCompare || opponentName === 'Opponents' || opponentName === 'Opponent') ? '#0a1024' : 'rgba(0,0,0,0.4)',
                        padding: '10px',
                        boxShadow: 'inset 0 2px 10px rgba(0,0,0,0.5), 0 4px 6px rgba(0,0,0,0.3)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        backdropFilter: 'blur(4px)'
                    }}>
                        <img src={opponentLogo} alt={opponentName} style={{ 
                            width: '100%', 
                            height: '100%', 
                            objectFit: 'contain',
                            transform: (isMultiCompare || opponentName === 'Opponents' || opponentName === 'Opponent') ? 'scale(1.15)' : 'none'
                        }} />
                    </div>
                    <span style={{ fontSize: '2.5rem', fontWeight: '900', color: 'white', textShadow: '2px 2px 4px rgba(0,0,0,0.8)', lineHeight: 1 }}>
                        {opponentTilt.toFixed(1)}%
                    </span>
                </div>
            </div>
            </div>

            {/* General Info Footer */}
            <div style={{ marginTop: '1rem', textAlign: 'center', color: 'var(--color-text-secondary)', fontSize: '0.9rem', fontWeight: '500' }}>
                <span style={{ fontWeight: '700', color: 'var(--color-text-primary)' }}>Showing {teamCount + opponentCount} final 1/4 passes & touches.</span> | 
                <span style={{ color: tColor, fontWeight: '700', background: 'rgba(255, 255, 255, 0.1)', padding: '2px 8px', borderRadius: '4px', margin: '0 6px', textShadow: '0 1px 2px rgba(0,0,0,0.5)' }}>
                    {teamName} {teamCount}
                </span> 
                - 
                <span style={{ color: oColor, fontWeight: '700', background: 'rgba(255, 255, 255, 0.1)', padding: '2px 8px', borderRadius: '4px', margin: '0 6px', textShadow: '0 1px 2px rgba(0,0,0,0.5)' }}>
                    {opponentName === 'Opponent' || opponentName === 'Opponents' ? 'Rivals' : opponentName} {opponentCount}
                </span>
            </div>
        </div>
    );
};

export default FieldTiltMap;
