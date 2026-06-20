import React, { useMemo } from 'react';

const PassNetworkMap = ({ networkData, teamColor = '#FFFFFF' }) => {
    const nodes = networkData?.nodes || [];
    const links = networkData?.links || [];

    // Determine min/max touches for node scaling
    const maxTouches = Math.max(...nodes.map(n => n.touches), 1);
    const minTouches = Math.min(...nodes.map(n => n.touches), 0);

    // Determine min/max passes for link scaling
    const maxPasses = Math.max(...links.map(l => l.count), 1);

    const getNodeRadius = (touches) => {
        // Base radius 2, max radius 5
        const normalized = (touches - minTouches) / (maxTouches - minTouches || 1);
        return 2 + (normalized * 3);
    };

    const getLinkWidth = (count) => {
        // Base width 0.2, max width 1.5
        const normalized = count / maxPasses;
        return 0.2 + (normalized * 1.3);
    };

    // Calculate vertical pitch coordinates
    // Opta X: 0 (own goal) -> 100 (opp goal)
    // SVG CY: 0 (top/opp goal) -> 100 (bottom/own goal) => cy = 100 - x
    // Opta Y: 0 (right) -> 100 (left). SVG CX: 0 (left) -> 100 (right) => cx = 100 - y
    const mappedNodes = useMemo(() => {
        const nodeMap = {};
        nodes.forEach(n => {
            nodeMap[n.id] = {
                ...n,
                cx: ((100 - n.y) / 100) * 68,
                cy: ((100 - n.x) / 100) * 105,
                r: getNodeRadius(n.touches)
            };
        });
        return nodeMap;
    }, [nodes, maxTouches, minTouches]);

    if (!nodes || nodes.length === 0) {
        return (
            <div style={{ width: '100%', height: '400px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-text-secondary)' }}>
                No pass network data available.
            </div>
        );
    }

    return (
        <div style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <div style={{ position: 'relative', width: '100%', maxWidth: '400px', aspectRatio: '68/105' }}>
                <svg viewBox="0 -2 68 109" preserveAspectRatio="none" style={{ width: '100%', height: '100%', backgroundColor: '#0e1420', borderRadius: '8px', boxShadow: '0 4px 20px rgba(0,0,0,0.5)' }}>
                    {/* Vertical Pitch Markings */}
                    {/* Outline */}
                    <rect x="0" y="0" width="68" height="105" fill="none" stroke="rgba(255,255,255,0.4)" strokeWidth="0.5" />
                    
                    {/* Halfway Line */}
                    <line x1="0" y1="52.5" x2="68" y2="52.5" stroke="rgba(255,255,255,0.4)" strokeWidth="0.5" />
                    <circle cx="34" cy="52.5" r="9.15" fill="none" stroke="rgba(255,255,255,0.4)" strokeWidth="0.5" />
                    <circle cx="34" cy="52.5" r="0.5" fill="rgba(255,255,255,0.4)" />

                    {/* Top Penalty Area (Opponent) */}
                    <rect x="13.84" y="0" width="40.32" height="16.5" fill="none" stroke="rgba(255,255,255,0.4)" strokeWidth="0.5" />
                    <rect x="24.84" y="0" width="18.32" height="5.5" fill="none" stroke="rgba(255,255,255,0.4)" strokeWidth="0.5" />
                    <rect x="30.34" y="-2" width="7.32" height="2" fill="none" stroke="rgba(255,255,255,0.4)" strokeWidth="0.5" />
                    <circle cx="34" cy="11" r="0.5" fill="rgba(255,255,255,0.4)" />
                    {/* Penalty Arc */}
                    <path d="M 26.6875 16.5 A 9.15 9.15 0 0 0 41.3125 16.5" fill="none" stroke="rgba(255,255,255,0.4)" strokeWidth="0.5" />

                    {/* Bottom Penalty Area (Own) */}
                    <rect x="13.84" y="88.5" width="40.32" height="16.5" fill="none" stroke="rgba(255,255,255,0.4)" strokeWidth="0.5" />
                    <rect x="24.84" y="99.5" width="18.32" height="5.5" fill="none" stroke="rgba(255,255,255,0.4)" strokeWidth="0.5" />
                    <rect x="30.34" y="105" width="7.32" height="2" fill="none" stroke="rgba(255,255,255,0.4)" strokeWidth="0.5" />
                    <circle cx="34" cy="94" r="0.5" fill="rgba(255,255,255,0.4)" />
                    {/* Penalty Arc */}
                    <path d="M 26.6875 88.5 A 9.15 9.15 0 0 1 41.3125 88.5" fill="none" stroke="rgba(255,255,255,0.4)" strokeWidth="0.5" />

                    {/* Links */}
                    {links.map((link, idx) => {
                        const source = mappedNodes[link.source];
                        const target = mappedNodes[link.target];
                        if (!source || !target) return null;

                        return (
                            <line
                                key={`link-${idx}`}
                                x1={source.cx}
                                y1={source.cy}
                                x2={target.cx}
                                y2={target.cy}
                                stroke={teamColor}
                                strokeWidth={getLinkWidth(link.count)}
                                strokeOpacity="0.4"
                            />
                        );
                    })}

                    {/* Nodes */}
                    {Object.values(mappedNodes).map(node => {
                        const name = node.name.split(' ').pop();
                        const textWidth = name.length * 1.5;
                        return (
                            <g key={`node-${node.id}`}>
                                {/* Inner Circle (Solid) */}
                                <circle
                                    cx={node.cx}
                                    cy={node.cy}
                                    r={node.r}
                                    fill={teamColor}
                                    stroke="#111"
                                    strokeWidth="0.3"
                                    style={{ filter: 'drop-shadow(0px 2px 2px rgba(0,0,0,0.5))' }}
                                />
                                {/* Player Name Background Pill */}
                                <rect 
                                    x={node.cx - textWidth / 2 - 1.5} 
                                    y={node.cy + node.r + 0.6} 
                                    width={textWidth + 3} 
                                    height={3.2} 
                                    rx="1.6" 
                                    fill="rgba(10,15,25,0.75)" 
                                    stroke="rgba(255,255,255,0.15)" 
                                    strokeWidth="0.2" 
                                />
                                {/* Player Name Tag */}
                                <text
                                    x={node.cx}
                                    y={node.cy + node.r + 3}
                                    fill="white"
                                    fontSize="2.1"
                                    fontWeight="bold"
                                    textAnchor="middle"
                                >
                                    {name}
                                </text>
                            </g>
                        );
                    })}
                </svg>
            </div>
            <div style={{ marginTop: '1rem', display: 'flex', gap: '2rem', fontSize: '0.8rem', color: 'var(--color-text-secondary)', background: 'rgba(255,255,255,0.05)', padding: '0.75rem 1.5rem', borderRadius: '8px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: teamColor }}></div>
                    Node Size = Total Touches
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <div style={{ width: '20px', height: '3px', background: teamColor, opacity: 0.6 }}></div>
                    Line Thickness = Pass Volume
                </div>
            </div>
        </div>
    );
};

export default PassNetworkMap;
