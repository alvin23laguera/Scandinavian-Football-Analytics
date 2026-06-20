import React, { useState } from 'react';

const PITCH_L = 105;
const PITCH_W = 68;

const AverageDefensiveActionHeight = ({ 
    teamName, 
    teamColor, 
    teamData,
    opponentName,
    opponentColor,
    opponentData,
    leagueData
}) => {
    const [showOpponent, setShowOpponent] = useState(true);
    const [showLeague, setShowLeague] = useState(false);

    const getHexColor = (colorStr, defaultColor) => {
        if (!colorStr) return defaultColor;
        if (colorStr.startsWith('#')) {
            const hex = colorStr.replace('#', '');
            if (hex.length === 6) {
                return {
                    r: parseInt(hex.substring(0, 2), 16),
                    g: parseInt(hex.substring(2, 4), 16),
                    b: parseInt(hex.substring(4, 6), 16)
                };
            }
        } else if (colorStr.startsWith('rgb')) {
            const matches = colorStr.match(/\d+/g);
            if (matches && matches.length >= 3) {
                return { r: parseInt(matches[0]), g: parseInt(matches[1]), b: parseInt(matches[2]) };
            }
        }
        return defaultColor;
    };
    
    const teamRgb = getHexColor(teamColor, { r: 56, g: 189, b: 248 });
    const oppRgb = getHexColor(opponentColor, { r: 239, g: 68, b: 68 });
    const leagueRgb = { r: 56, g: 189, b: 248 }; // Eliteserien sky blue

    const calculateStats = (data) => {
        if (!data || data.length === 0) return null;
        let xCoords = data.map(d => d.x !== undefined ? d.x : (d.startX !== undefined ? d.startX : 0));
        const sum = xCoords.reduce((a, b) => a + b, 0);
        return { avg: sum / xCoords.length };
    };

    const teamStats = calculateStats(teamData);
    const oppStats = calculateStats(opponentData);
    const leagueStats = calculateStats(leagueData);

    const renderPitch = () => (
        <g stroke="rgba(255,255,255,0.3)" strokeWidth="0.5" fill="none">
            <rect x="0" y="0" width={PITCH_L} height={PITCH_W} />
            <line x1={PITCH_L / 2} y1="0" x2={PITCH_L / 2} y2={PITCH_W} />
            <circle cx={PITCH_L / 2} cy={PITCH_W / 2} r="9.15" />
            <circle cx={PITCH_L / 2} cy={PITCH_W / 2} r="0.5" fill="rgba(255,255,255,0.4)" />
            
            {/* Left penalty box */}
            <rect x="0" y={(PITCH_W - 40.32) / 2} width="16.5" height="40.32" />
            <rect x="0" y={(PITCH_W - 18.32) / 2} width="5.5" height="18.32" />
            <rect x="-2" y={(PITCH_W - 7.32) / 2} width="2" height="7.32" />
            <circle cx="11" cy={PITCH_W / 2} r="0.5" fill="rgba(255,255,255,0.4)" />
            <path d={`M 16.5 ${PITCH_W / 2 - 7} A 9.15 9.15 0 0 1 16.5 ${PITCH_W / 2 + 7}`} />
            
            {/* Right penalty box */}
            <rect x={PITCH_L - 16.5} y={(PITCH_W - 40.32) / 2} width="16.5" height="40.32" />
            <rect x={PITCH_L - 5.5} y={(PITCH_W - 18.32) / 2} width="5.5" height="18.32" />
            <rect x={PITCH_L} y={(PITCH_W - 7.32) / 2} width="2" height="7.32" />
            <circle cx={PITCH_L - 11} cy={PITCH_W / 2} r="0.5" fill="rgba(255,255,255,0.4)" />
            <path d={`M ${PITCH_L - 16.5} ${PITCH_W / 2 - 7} A 9.15 9.15 0 0 0 ${PITCH_L - 16.5} ${PITCH_W / 2 + 7}`} />
        </g>
    );

    const renderLine = (stats, rgb, yPosIndicator) => {
        if (!stats) return null;

        const avgX = (stats.avg / 100) * PITCH_L;
        const color = `rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`;
        const distanceStr = (stats.avg * 1.05).toFixed(1) + 'm';
        
        // yPosIndicator determines if label is at top or bottom
        const isTop = yPosIndicator === 'top';
        const lineStart = 0;
        const lineEnd = PITCH_W;
        
        const arrowY = isTop ? -2 : PITCH_W + 2;
        const textY = isTop ? -5 : PITCH_W + 5;

        return (
            <g style={{ transition: 'all 0.5s ease' }}>
                <line 
                    x1={avgX} 
                    y1={lineStart} 
                    x2={avgX} 
                    y2={lineEnd} 
                    stroke={color} 
                    strokeWidth="0.8" 
                    strokeDasharray="3 2" 
                    opacity="0.8"
                />
                
                {/* Small connecting arrow/tick on the outside */}
                <path 
                    d={`M ${avgX} ${isTop ? 0 : PITCH_W} L ${avgX - 1} ${arrowY} L ${avgX + 1} ${arrowY} Z`} 
                    fill={color} 
                    opacity="0.8"
                />

                <text 
                    x={avgX} 
                    y={textY} 
                    fill={color} 
                    fontSize="2.5" 
                    fontWeight="600" 
                    fontFamily="Inter, sans-serif"
                    dominantBaseline="central"
                    textAnchor="middle"
                    opacity="0.9"
                >
                    {distanceStr}
                </text>
            </g>
        );
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {/* Header Controls */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
                <div style={{ display: 'flex', gap: '8px' }}>
                    {opponentName && oppStats && (
                        <button
                            onClick={() => setShowOpponent(!showOpponent)}
                            style={{
                                background: showOpponent ? `rgba(${oppRgb.r}, ${oppRgb.g}, ${oppRgb.b}, 0.2)` : 'transparent',
                                color: showOpponent ? `rgb(${oppRgb.r}, ${oppRgb.g}, ${oppRgb.b})` : 'var(--color-text-secondary)',
                                border: showOpponent ? `1px solid rgb(${oppRgb.r}, ${oppRgb.g}, ${oppRgb.b})` : '1px solid rgba(255,255,255,0.2)',
                                boxShadow: showOpponent ? `0 0 10px rgba(${oppRgb.r}, ${oppRgb.g}, ${oppRgb.b}, 0.5)` : 'none',
                                borderRadius: '4px',
                                padding: '0.3rem 0.75rem',
                                cursor: 'pointer',
                                fontSize: '0.75rem',
                                transition: 'all 0.3s ease',
                                fontWeight: 'bold'
                            }}
                        >
                            {opponentName}
                        </button>
                    )}
                    {leagueStats && (
                        <button
                            onClick={() => setShowLeague(!showLeague)}
                            style={{
                                background: showLeague ? `rgba(${leagueRgb.r}, ${leagueRgb.g}, ${leagueRgb.b}, 0.2)` : 'transparent',
                                color: showLeague ? `rgb(${leagueRgb.r}, ${leagueRgb.g}, ${leagueRgb.b})` : 'var(--color-text-secondary)',
                                border: showLeague ? `1px solid rgb(${leagueRgb.r}, ${leagueRgb.g}, ${leagueRgb.b})` : '1px solid rgba(255,255,255,0.2)',
                                boxShadow: showLeague ? `0 0 10px rgba(${leagueRgb.r}, ${leagueRgb.g}, ${leagueRgb.b}, 0.5)` : 'none',
                                borderRadius: '4px',
                                padding: '0.3rem 0.75rem',
                                cursor: 'pointer',
                                fontSize: '0.75rem',
                                transition: 'all 0.3s ease',
                                fontWeight: 'bold'
                            }}
                        >
                            League Avg.
                        </button>
                    )}
                </div>
                
                <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', fontSize: '0.75rem', color: 'var(--color-text-secondary)' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                        <span style={{ width: 12, height: 2, background: `rgb(${teamRgb.r}, ${teamRgb.g}, ${teamRgb.b})`, borderTop: '1px dashed #fff' }} /> {teamName}
                    </span>
                    {showOpponent && opponentName && oppStats && (
                        <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                            <span style={{ width: 12, height: 2, background: `rgb(${oppRgb.r}, ${oppRgb.g}, ${oppRgb.b})`, borderTop: '1px dashed #fff' }} /> {opponentName}
                        </span>
                    )}
                    {showLeague && leagueStats && (
                        <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                            <span style={{ width: 12, height: 2, background: `rgb(${leagueRgb.r}, ${leagueRgb.g}, ${leagueRgb.b})`, borderTop: '1px dashed #fff' }} /> League Avg
                        </span>
                    )}
                </div>
            </div>

            {/* Pitch Container */}
            <div style={{ width: '100%', borderRadius: '8px', overflow: 'hidden', position: 'relative', marginTop: '0.5rem' }}>
                <svg
                    viewBox={`-5 -8 ${PITCH_L + 10} ${PITCH_W + 16}`}
                    style={{ width: '100%', height: '100%', backgroundColor: '#0e1420', borderRadius: '8px', boxShadow: '0 4px 20px rgba(0,0,0,0.5)' }}
                >
                    {renderPitch()}
                    {showLeague && renderLine(leagueStats, leagueRgb, 'top')}
                    {showOpponent && renderLine(oppStats, oppRgb, 'top')}
                    {renderLine(teamStats, teamRgb, 'bottom')}
                </svg>
            </div>
        </div>
    );
};

export default AverageDefensiveActionHeight;
