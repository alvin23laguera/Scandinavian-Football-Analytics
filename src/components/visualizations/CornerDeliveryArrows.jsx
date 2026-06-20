import React, { useState, useMemo } from 'react';

const CornerDeliveryArrows = ({ 
    teamName, 
    data = [] 
}) => {
    const [showInswing, setShowInswing] = useState(true);
    const [showOutswing, setShowOutswing] = useState(true);
    const [showStraight, setShowStraight] = useState(true);
    
    const [showLeft, setShowLeft] = useState(true);
    const [showRight, setShowRight] = useState(true);

    const filteredData = useMemo(() => {
        return data.filter(d => {
            if (d.swing === 'in' && !showInswing) return false;
            if (d.swing === 'out' && !showOutswing) return false;
            if (d.swing === 'straight' && !showStraight) return false;
            
            // Opta Y < 50 is the left side from the attacking perspective.
            const isLeft = d.startY < 50; 
            if (isLeft && !showLeft) return false;
            if (!isLeft && !showRight) return false;

            return true;
        });
    }, [data, showInswing, showOutswing, showStraight, showLeft, showRight]);

    const PITCH_W = 100;
    const PITCH_L = 25; // Final 1/4 of the pitch

    const renderPitch = () => (
        <g stroke="rgba(255,255,255,0.3)" strokeWidth="0.5" fill="none">
            {/* Outline up to final 1/4 */}
            <rect x="0" y="0" width={PITCH_W} height={PITCH_L} />
            
            {/* Goal */}
            <rect x="45.2" y="-2" width="9.6" height="2" />
            
            {/* Six Yard Box */}
            <rect x="36.8" y="0" width="26.4" height="5.5" />
            
            {/* Penalty Box */}
            <rect x="21.1" y="0" width="57.8" height="16.5" />
            
            {/* Penalty Arc (clipped by our height if needed, but it's at 16.5-25 so it fits) */}
            <path d="M 36.8 16.5 Q 50 25 63.2 16.5" />
            
            {/* Penalty Spot */}
            <circle cx="50" cy="11" r="0.5" fill="rgba(255,255,255,0.4)" />
            
            {/* Corner Arcs */}
            <path d="M 0 2 A 2 2 0 0 0 2 0" />
            <path d="M 100 2 A 2 2 0 0 1 98 0" />
        </g>
    );

    const getArrowColor = (swing) => {
        switch(swing) {
            case 'in': return '#22c55e'; // Green
            case 'out': return '#f97316'; // Orange
            case 'straight': return '#38bdf8'; // Blue
            default: return '#94a3b8';
        }
    };

    const renderArrow = (delivery, index) => {
        const startX = delivery.startY; // Opta Y -> SVG X
        const startY = 100 - delivery.startX; // Opta X -> SVG Y (attacking upwards)
        const destX = delivery.destY;
        const destY = 100 - delivery.destX;

        const color = getArrowColor(delivery.swing);
        const isMissed = delivery.outcome === 'missed';
        
        const opacity = 0.8;
        const strokeDash = isMissed ? "1.5 1.5" : "none";
        const strokeWidth = "0.4";

        let controlX = (startX + destX) / 2;
        let controlY = (startY + destY) / 2;

        const curveMagnitude = 11;

        // In-swinging means the ball curves towards the goal. Therefore it was aimed OUT, and the curve belly points AWAY from the goal line (Y=0), so +Y.
        // Out-swinging means the ball curves away from the goal. Therefore it was aimed IN, and the curve belly points TOWARDS the goal line, so -Y.
        if (delivery.swing === 'in') {
            controlY += curveMagnitude;
        } else if (delivery.swing === 'out') {
            controlY -= curveMagnitude;
        }

        const pathId = `arrow-${index}`;
        const markerId = `head-${index}`;

        return (
            <g key={index}>
                <title>Taker: {delivery.player} | {isMissed ? 'Missed/Cleared' : 'Completed'}</title>
                <defs>
                    <marker id={markerId} viewBox="0 0 10 10" refX="6" refY="5" markerWidth="3" markerHeight="3" orient="auto">
                        <path d="M 0 0 L 10 5 L 0 10 z" fill={color} opacity={opacity} />
                    </marker>
                </defs>
                {delivery.swing === 'straight' ? (
                    <line 
                        x1={startX} 
                        y1={startY} 
                        x2={destX} 
                        y2={destY} 
                        stroke={color} 
                        strokeWidth={strokeWidth} 
                        strokeDasharray={strokeDash}
                        opacity={opacity}
                        markerEnd={`url(#${markerId})`}
                    />
                ) : (
                    <path 
                        d={`M ${startX} ${startY} Q ${controlX} ${controlY} ${destX} ${destY}`} 
                        fill="none" 
                        stroke={color} 
                        strokeWidth={strokeWidth} 
                        strokeDasharray={strokeDash}
                        opacity={opacity}
                        markerEnd={`url(#${markerId})`}
                    />
                )}
                <circle cx={startX} cy={startY} r="0.6" fill={color} opacity={opacity} />
            </g>
        );
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', height: '100%' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '0.5rem' }}>
                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                    <button
                        onClick={() => setShowInswing(!showInswing)}
                        style={{
                            background: showInswing ? 'rgba(34,197,94,0.15)' : 'transparent',
                            color: showInswing ? '#22c55e' : 'var(--color-text-secondary)',
                            border: showInswing ? '1px solid rgba(34,197,94,0.4)' : '1px solid rgba(255,255,255,0.1)',
                            borderRadius: '6px',
                            padding: '0.4rem 0.8rem',
                            cursor: 'pointer',
                            fontSize: '0.75rem',
                            fontWeight: 'bold',
                            transition: 'all 0.2s'
                        }}
                    >
                        In-Swinging
                    </button>
                    <button
                        onClick={() => setShowOutswing(!showOutswing)}
                        style={{
                            background: showOutswing ? 'rgba(249,115,22,0.15)' : 'transparent',
                            color: showOutswing ? '#f97316' : 'var(--color-text-secondary)',
                            border: showOutswing ? '1px solid rgba(249,115,22,0.4)' : '1px solid rgba(255,255,255,0.1)',
                            borderRadius: '6px',
                            padding: '0.4rem 0.8rem',
                            cursor: 'pointer',
                            fontSize: '0.75rem',
                            fontWeight: 'bold',
                            transition: 'all 0.2s'
                        }}
                    >
                        Out-Swinging
                    </button>
                    <button
                        onClick={() => setShowStraight(!showStraight)}
                        style={{
                            background: showStraight ? 'rgba(56,189,248,0.15)' : 'transparent',
                            color: showStraight ? '#38bdf8' : 'var(--color-text-secondary)',
                            border: showStraight ? '1px solid rgba(56,189,248,0.4)' : '1px solid rgba(255,255,255,0.1)',
                            borderRadius: '6px',
                            padding: '0.4rem 0.8rem',
                            cursor: 'pointer',
                            fontSize: '0.75rem',
                            fontWeight: 'bold',
                            transition: 'all 0.2s'
                        }}
                    >
                        Straight
                    </button>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.5rem' }}>
                    <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                        <button
                            onClick={() => setShowLeft(!showLeft)}
                            style={{
                                background: showLeft ? 'rgba(255,255,255,0.15)' : 'transparent',
                                color: showLeft ? '#fff' : 'var(--color-text-secondary)',
                                border: showLeft ? '1px solid rgba(255,255,255,0.4)' : '1px solid rgba(255,255,255,0.1)',
                                borderRadius: '6px',
                                padding: '0.3rem 0.6rem',
                                cursor: 'pointer',
                                fontSize: '0.7rem',
                                fontWeight: 'bold',
                                transition: 'all 0.2s'
                            }}
                        >
                            Left Corners
                        </button>
                        <button
                            onClick={() => setShowRight(!showRight)}
                            style={{
                                background: showRight ? 'rgba(255,255,255,0.15)' : 'transparent',
                                color: showRight ? '#fff' : 'var(--color-text-secondary)',
                                border: showRight ? '1px solid rgba(255,255,255,0.4)' : '1px solid rgba(255,255,255,0.1)',
                                borderRadius: '6px',
                                padding: '0.3rem 0.6rem',
                                cursor: 'pointer',
                                fontSize: '0.7rem',
                                fontWeight: 'bold',
                                transition: 'all 0.2s'
                            }}
                        >
                            Right Corners
                        </button>
                    </div>
                    <div style={{ display: 'flex', gap: '1rem', fontSize: '0.7rem', color: 'var(--color-text-secondary)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                            <div style={{ width: '15px', height: '2px', backgroundColor: '#fff', opacity: 0.8 }}></div>
                            <span>Completed</span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                            <div style={{ width: '15px', height: '2px', borderBottom: '2px dotted #fff', opacity: 0.5 }}></div>
                            <span>Missed</span>
                        </div>
                    </div>
                </div>
            </div>

            <div style={{ flex: 1, backgroundColor: '#0e1420', borderRadius: '8px', padding: '0.5rem', position: 'relative', overflow: 'hidden' }}>
                <svg viewBox="-2 -4 104 31" style={{ width: '100%', height: '100%' }}>
                    {renderPitch()}
                    {filteredData.filter(d => !d.isBackward).map((d, i) => renderArrow(d, i))}
                </svg>
            </div>

            <div style={{ backgroundColor: 'rgba(0,0,0,0.2)', padding: '0.5rem 1rem', borderRadius: '8px', fontSize: '0.8rem', fontWeight: 'bold', color: '#fff', textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
                {(() => {
                    const forwardData = filteredData.filter(d => !d.isBackward);
                    const backwardCount = filteredData.filter(d => d.isBackward).length;
                    
                    const total = forwardData.length;
                    
                    let mainText = null;
                    if (total === 0) {
                        mainText = <span>No deliveries match the filters.</span>;
                    } else {
                        const goals = forwardData.filter(d => d.isGoal).length;
                        const activeSwings = [showInswing && 'in', showOutswing && 'out', showStraight && 'straight'].filter(Boolean);
                        
                        if (activeSwings.length === 1) {
                            const typeLabel = showInswing ? 'In-swinging' : showOutswing ? 'Out-swinging' : 'Straight';
                            const color = showInswing ? '#22c55e' : showOutswing ? '#f97316' : '#38bdf8';
                            const comp = forwardData.filter(d => d.outcome === 'completed').length;
                            mainText = <span>{total} <span style={{color}}>{typeLabel}</span> Corner. {comp}/{total} completed | {goals} goals</span>;
                        } else {
                            const inCount = forwardData.filter(d => d.swing === 'in').length;
                            const outCount = forwardData.filter(d => d.swing === 'out').length;
                            const stCount = forwardData.filter(d => d.swing === 'straight').length;
                            
                            const parts = [];
                            if (inCount > 0) parts.push(<span key="in" style={{color: '#22c55e'}}>{inCount} in-swinging</span>);
                            if (outCount > 0) parts.push(<span key="out" style={{color: '#f97316'}}>{outCount} out-swinging</span>);
                            if (stCount > 0) parts.push(<span key="st" style={{color: '#38bdf8'}}>{stCount} straight</span>);
                            
                            const joinedParts = parts.length > 0 ? parts.reduce((prev, curr) => [prev, ' | ', curr]) : null;
                            
                            mainText = <span>{total} crosses. {joinedParts} | {goals} goals</span>;
                        }
                    }
                    
                    return (
                        <>
                            <div>{mainText}</div>
                            {backwardCount > 0 && (
                                <div style={{ fontSize: '0.65rem', color: 'var(--color-text-secondary)', fontWeight: 'normal' }}>
                                    * Additionally, {backwardCount} corner{backwardCount !== 1 ? 's were' : ' was'} played short.
                                </div>
                            )}
                        </>
                    );
                })()}
            </div>
        </div>
    );
};

export default CornerDeliveryArrows;
