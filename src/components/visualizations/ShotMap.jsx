import React, { useState } from 'react';

const ORIENTATIONS = [
    { label: '→', title: 'Left to Right', deg: 0 },
    { label: '←', title: 'Right to Left', deg: 180 },
    { label: '↓', title: 'Top to Bottom', deg: 90 },
    { label: '↑', title: 'Bottom to Top', deg: 270 },
];

// viewBox for right half of pitch with small margin
const VB_X = 48, VB_Y = -6, VB_W = 64, VB_H = 80;

const ShotMap = ({ shots }) => {
    const [hoveredShot, setHoveredShot] = useState(null);
    const [orientIdx, setOrientIdx] = useState(0);

    const pitchLength = 105;
    const pitchWidth = 68;
    const rotDeg = ORIENTATIONS[orientIdx].deg;
    const isVertical = rotDeg === 90 || rotDeg === 270;

    const renderPitch = () => (
        <g stroke="rgba(255,255,255,0.4)" strokeWidth="0.5" fill="none">
            {/* Outline */}
            <rect x="0" y="0" width={pitchLength} height={pitchWidth} />
            {/* Center Line */}
            <line x1={pitchLength / 2} y1="0" x2={pitchLength / 2} y2={pitchWidth} />
            {/* Center Circle */}
            <circle cx={pitchLength / 2} cy={pitchWidth / 2} r="9.15" />
            <circle cx={pitchLength / 2} cy={pitchWidth / 2} r="0.5" fill="rgba(255,255,255,0.4)" />
            {/* Left Penalty Area */}
            <rect x="0" y={(pitchWidth - 40.32) / 2} width="16.5" height="40.32" />
            <rect x="0" y={(pitchWidth - 18.32) / 2} width="5.5" height="18.32" />
            <rect x="-2" y={(pitchWidth - 7.32) / 2} width="2" height="7.32" />
            <circle cx="11" cy={pitchWidth / 2} r="0.5" fill="rgba(255,255,255,0.4)" />
            <path d={`M 16.5 ${(pitchWidth / 2) - 7} A 9.15 9.15 0 0 1 16.5 ${(pitchWidth / 2) + 7}`} />
            {/* Right Penalty Area */}
            <rect x={pitchLength - 16.5} y={(pitchWidth - 40.32) / 2} width="16.5" height="40.32" />
            <rect x={pitchLength - 5.5} y={(pitchWidth - 18.32) / 2} width="5.5" height="18.32" />
            <rect x={pitchLength} y={(pitchWidth - 7.32) / 2} width="2" height="7.32" />
            <circle cx={pitchLength - 11} cy={pitchWidth / 2} r="0.5" fill="rgba(255,255,255,0.4)" />
            <path d={`M ${pitchLength - 16.5} ${(pitchWidth / 2) - 7} A 9.15 9.15 0 0 0 ${pitchLength - 16.5} ${(pitchWidth / 2) + 7}`} />
        </g>
    );

    const renderTooltip = (shot, cx, cy) => {
        const tipW = 22;
        const tipH = 10;
        // Smart placement: flip to left if near right edge of viewBox
        const nearRight = cx > VB_X + VB_W * 0.72;
        const nearTop = cy < VB_Y + VB_H * 0.2;
        const tx = nearRight ? cx - tipW - 2 : cx + 2.5;
        const ty = nearTop ? cy + 1 : cy - tipH - 1;

        // Counter-rotate the tooltip text so it stays upright regardless of pitch rotation
        const pivotX = tx + tipW / 2;
        const pivotY = ty + tipH / 2;

        return (
            <g
                transform={`rotate(${-rotDeg}, ${pivotX}, ${pivotY})`}
                style={{ pointerEvents: 'none' }}
            >
                {/* Shadow */}
                <rect x={tx + 0.4} y={ty + 0.4} width={tipW} height={tipH} rx="1.2"
                    fill="rgba(0,0,0,0.5)" />
                {/* Background */}
                <rect x={tx} y={ty} width={tipW} height={tipH} rx="1.2"
                    fill="rgba(10,10,20,0.92)"
                    stroke="rgba(255,255,255,0.15)"
                    strokeWidth="0.3" />
                {/* Player name */}
                <text
                    x={tx + 1.2} y={ty + 3.5}
                    fontSize="2.2"
                    fill="#60a5fa"
                    fontWeight="bold"
                    fontFamily="Inter, sans-serif"
                >
                    {shot.player}
                </text>
                {/* Result + minute */}
                <text
                    x={tx + 1.2} y={ty + 7.5}
                    fontSize="1.9"
                    fill="rgba(255,255,255,0.85)"
                    fontFamily="Inter, sans-serif"
                >
                    {shot.result === 'goal'
                        ? '⚽ Goal'
                        : shot.result === 'onTarget'
                            ? '🎯 On Target'
                            : '✕ Off Target'}
                    {'  '}·{'  '}{shot.minute}'
                </text>
            </g>
        );
    };

    const renderMarker = (shot, cx, cy) => {
        const isHovered = hoveredShot?.id === shot.id;
        const r = isHovered ? 1.8 : 1.2;
        const handlers = {
            onMouseEnter: () => setHoveredShot(shot),
            onMouseLeave: () => setHoveredShot(null),
            style: { cursor: 'pointer', transition: 'all 0.15s ease' },
        };

        if (shot.result === 'goal') {
            return (
                <text x={cx} y={cy} fontSize={isHovered ? 3.5 : 2.5}
                    textAnchor="middle" dominantBaseline="central" {...handlers}>
                    ⚽
                </text>
            );
        } else if (shot.result === 'onTarget') {
            return (
                <circle cx={cx} cy={cy} r={r}
                    fill="rgba(96,165,250,0.85)"
                    stroke="white" strokeWidth="0.4"
                    {...handlers} />
            );
        } else {
            return (
                <circle cx={cx} cy={cy} r={r}
                    fill="transparent"
                    stroke="rgba(248,113,113,0.85)" strokeWidth="0.7"
                    {...handlers} />
            );
        }
    };

    return (
        <div>
            {/* Header Controls */}
            <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem', alignItems: 'center' }}>
                {/* Legend */}
                <div style={{ marginLeft: 'auto', display: 'flex', gap: '1rem', alignItems: 'center', fontSize: '0.78rem', color: 'var(--color-text-secondary)' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                        <span style={{ display: 'inline-block', width: '10px', height: '10px', borderRadius: '50%', background: 'rgba(96,165,250,0.85)', border: '1px solid white' }} />
                        On Target
                    </span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                        <span style={{ display: 'inline-block', width: '10px', height: '10px', borderRadius: '50%', border: '1.5px solid rgba(248,113,113,0.85)' }} />
                        Off Target
                    </span>
                    <span>⚽ Goal</span>
                </div>
            </div>

            {/* Pitch Container — aspect ratio flips for vertical orientations */}
            <div style={{
                position: 'relative',
                width: '100%',
                aspectRatio: isVertical ? `${VB_H} / ${VB_W}` : `${VB_W} / ${VB_H}`,
                overflow: 'hidden',
                borderRadius: '8px',
            }}>
                <svg
                    viewBox={`${VB_X} ${VB_Y} ${VB_W} ${VB_H}`}
                    style={{
                        position: 'absolute',
                        top: isVertical ? `${(VB_H - VB_W) / 2 / VB_H * 100}%` : 0,
                        left: isVertical ? `-${(VB_H - VB_W) / 2 / VB_W * 100}%` : 0,
                        width: isVertical ? `${VB_H / VB_W * 100}%` : '100%',
                        height: isVertical ? `${VB_W / VB_H * 100}%` : '100%',
                        backgroundColor: '#0e1420',
                        transform: `rotate(${rotDeg}deg)`,
                        transformOrigin: 'center center',
                        boxShadow: '0 4px 20px rgba(0,0,0,0.5)',
                    }}
                >
                    {renderPitch()}
                    {shots.map((shot, idx) => {
                        const cx = (shot.x / 100) * pitchLength;
                        const cy = (shot.y / 100) * pitchWidth;
                        return (
                            <g key={shot.id || idx}>
                                {renderMarker(shot, cx, cy)}
                                {hoveredShot?.id === (shot.id || idx) && renderTooltip(shot, cx, cy)}
                            </g>
                        );
                    })}
                </svg>
            </div>

            {/* Shot count */}
            {shots.length > 0 && (
                <div style={{ marginTop: '0.75rem', fontSize: '0.8rem', color: 'var(--color-text-secondary)' }}>
                    {shots.length} shot{shots.length !== 1 ? 's' : ''} ·{' '}
                    {shots.filter(s => s.result === 'goal').length} goal{shots.filter(s => s.result === 'goal').length !== 1 ? 's' : ''} ·{' '}
                    {shots.filter(s => s.result === 'onTarget').length} on target ·{' '}
                    {shots.filter(s => s.result === 'offTarget').length} off target
                </div>
            )}
        </div>
    );
};

export default ShotMap;
