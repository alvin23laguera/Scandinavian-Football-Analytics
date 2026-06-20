import React from 'react';

const PITCH_L = 105;
const PITCH_W = 68;

const BlockCompactness = ({ 
    teamName, 
    teamColor, 
    teamData,
    opponentName,
    opponentColor,
    opponentData,
    leagueStats
}) => {
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
        const avg = sum / xCoords.length;
        const variance = xCoords.reduce((a, b) => a + Math.pow(b - avg, 2), 0) / xCoords.length;
        const stdDev = Math.sqrt(variance);

        return { 
            avg, 
            minBlock: Math.max(0, avg - stdDev), 
            maxBlock: Math.min(100, avg + stdDev)
        };
    };

    const teamStats = calculateStats(teamData);
    const oppStats = calculateStats(opponentData);

    const renderPitch = () => (
        <g stroke="rgba(255,255,255,0.3)" strokeWidth="0.5" fill="none">
            <rect x="0" y="0" width={PITCH_L} height={PITCH_W} />
            <line x1={PITCH_L / 2} y1="0" x2={PITCH_L / 2} y2={PITCH_W} />
            <circle cx={PITCH_L / 2} cy={PITCH_W / 2} r="9.15" />
            <circle cx={PITCH_L / 2} cy={PITCH_W / 2} r="0.5" fill="rgba(255,255,255,0.4)" />
            
            <rect x="0" y={(PITCH_W - 40.32) / 2} width="16.5" height="40.32" />
            <rect x="0" y={(PITCH_W - 18.32) / 2} width="5.5" height="18.32" />
            <rect x="-2" y={(PITCH_W - 7.32) / 2} width="2" height="7.32" />
            <circle cx="11" cy={PITCH_W / 2} r="0.5" fill="rgba(255,255,255,0.4)" />
            <path d={`M 16.5 ${PITCH_W / 2 - 7} A 9.15 9.15 0 0 1 16.5 ${PITCH_W / 2 + 7}`} />
            
            <rect x={PITCH_L - 16.5} y={(PITCH_W - 40.32) / 2} width="16.5" height="40.32" />
            <rect x={PITCH_L - 5.5} y={(PITCH_W - 18.32) / 2} width="5.5" height="18.32" />
            <rect x={PITCH_L} y={(PITCH_W - 7.32) / 2} width="2" height="7.32" />
            <circle cx={PITCH_L - 11} cy={PITCH_W / 2} r="0.5" fill="rgba(255,255,255,0.4)" />
            <path d={`M ${PITCH_L - 16.5} ${PITCH_W / 2 - 7} A 9.15 9.15 0 0 0 ${PITCH_L - 16.5} ${PITCH_W / 2 + 7}`} />
        </g>
    );

    const [showOpponent, setShowOpponent] = React.useState(true);

    const renderBlock = (stats, rgb, name, isTop) => {
        if (!stats) return null;

        const avgX = (stats.avg / 100) * PITCH_L;
        const minX = (stats.minBlock / 100) * PITCH_L;
        const width = ((stats.maxBlock - stats.minBlock) / 100) * PITCH_L;

        const color = `rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`;
        const blockColor = `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.25)`;

        // Distance text values
        const blockDistanceMeters = ((stats.maxBlock - stats.minBlock) * 1.05).toFixed(1);
        const goalDistanceMeters = (stats.minBlock * 1.05).toFixed(1);

        const yOffset = 0; // Full width
        const height = PITCH_W;
        
        // Dynamic label offsets
        const goalTextY = isTop ? PITCH_W + 6 : -6;
        const goalLineY = isTop ? PITCH_W + 2 : -2;
        const blockTextY = PITCH_W / 2;
        
        return (
            <g key={`block-${name}`} style={{ transition: 'all 0.5s ease' }}>
                <rect 
                    x={minX} 
                    y={yOffset} 
                    width={width} 
                    height={height} 
                    fill={blockColor} 
                    stroke={color}
                    strokeWidth="0.5"
                />
                {/* Average Height Line (now dashed) */}
                <line 
                    x1={avgX} 
                    y1={yOffset} 
                    x2={avgX} 
                    y2={yOffset + height} 
                    stroke={color} 
                    strokeWidth="0.5" 
                    strokeDasharray="2 2"
                />

                {/* Dimension Line: Distance to Goal (outside pitch) */}
                <line 
                    x1={0} 
                    y1={goalLineY} 
                    x2={minX} 
                    y2={goalLineY} 
                    stroke={color} 
                    strokeWidth="0.5" 
                    strokeDasharray="2 2"
                />
                <path d={`M ${minX} ${goalLineY} L ${minX - 1.5} ${goalLineY - 1.5} L ${minX - 1.5} ${goalLineY + 1.5} Z`} fill={color} />

                {/* Text: Block Compactness (inside the block) */}
                {/* Background pill to ensure text readability against pitch lines */}
                <rect 
                    x={avgX - 10} 
                    y={blockTextY + (isTop ? 4 : -4) - 2.5} 
                    width="20" 
                    height="5" 
                    fill="#0e1420" 
                    rx="1" 
                    opacity="0.8"
                />
                <text 
                    x={avgX} 
                    y={blockTextY + (isTop ? 4 : -4)} 
                    fill={color} 
                    fontSize="3.5" 
                    fontWeight="bold" 
                    fontFamily="Inter, sans-serif"
                    dominantBaseline="central"
                    textAnchor="middle"
                >
                    {blockDistanceMeters}m
                </text>

                {/* Text: Distance to Goal (outside pitch) */}
                <text 
                    x={minX / 2} 
                    y={goalTextY} 
                    fill={color} 
                    fontSize="3" 
                    fontWeight="bold" 
                    fontFamily="Inter, sans-serif"
                    dominantBaseline="central"
                    textAnchor="middle"
                >
                    {goalDistanceMeters}m to Goal
                </text>
            </g>
        );
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
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
            </div>

            <div style={{ width: '100%', borderRadius: '8px', overflow: 'hidden', position: 'relative' }}>
                <svg
                    viewBox={`-5 -12 ${PITCH_L + 10} ${PITCH_W + 24}`}
                    style={{ width: '100%', height: '100%', backgroundColor: '#0e1420', borderRadius: '8px', boxShadow: '0 4px 20px rgba(0,0,0,0.5)' }}
                >
                    {renderPitch()}
                    {renderBlock(teamStats, teamRgb, teamName, false)}
                    {showOpponent && renderBlock(oppStats, oppRgb, opponentName, true)}
                </svg>
            </div>
            
            {leagueStats && leagueStats.minBlock !== undefined && (
                <div style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)', display: 'flex', gap: '1rem', alignItems: 'center' }}>
                    <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: `rgb(${leagueRgb.r}, ${leagueRgb.g}, ${leagueRgb.b})` }}></div>
                    <span>
                        <strong style={{ color: '#fff' }}>League Average:</strong> 
                        &nbsp;{(leagueStats.minBlock * 1.05).toFixed(1)}m Distance to Goal
                        &nbsp;&bull;&nbsp; 
                        {((leagueStats.maxBlock - leagueStats.minBlock) * 1.05).toFixed(1)}m Block Size 
                    </span>
                </div>
            )}
        </div>
    );
};

export default BlockCompactness;
