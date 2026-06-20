import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';

const Pitch = ({ events = [] }) => {
    const pitchRef = useRef(null);

    // Initial 4-3-3 Formation
    const initialPlayers = [
        { id: 'gk', name: 'GK', x: 5, y: 34, color: 'yellow' },
        { id: 2, name: 'RB', x: 25, y: 10, color: 'red' },
        { id: 3, name: 'CB', x: 20, y: 25, color: 'red' },
        { id: 4, name: 'CB', x: 20, y: 43, color: 'red' },
        { id: 5, name: 'LB', x: 25, y: 58, color: 'red' },
        { id: 6, name: 'CDM', x: 40, y: 34, color: 'blue' },
        { id: 7, name: 'CM', x: 50, y: 20, color: 'blue' },
        { id: 8, name: 'CM', x: 50, y: 48, color: 'blue' },
        { id: 9, name: 'RW', x: 75, y: 10, color: 'green' },
        { id: 10, name: 'ST', x: 80, y: 34, color: 'green' },
        { id: 11, name: 'LW', x: 75, y: 58, color: 'green' },
    ];

    const initialBall = { x: 50, y: 34 };

    const [players, setPlayers] = useState(initialPlayers);
    const [ball, setBall] = useState(initialBall);

    // Tools: 'move', 'arrow', 'line', 'delete'
    const [tool, setTool] = useState('move');
    const [drawings, setDrawings] = useState([]);
    const [currentDrawing, setCurrentDrawing] = useState(null);

    // Load from localStorage on mount
    useEffect(() => {
        const savedLayout = localStorage.getItem('tactics-board-layout');
        if (savedLayout) {
            try {
                const parsed = JSON.parse(savedLayout);
                if (parsed.players) setPlayers(parsed.players);
                if (parsed.ball) setBall(parsed.ball);
                if (parsed.drawings) setDrawings(parsed.drawings);
            } catch (e) {
                console.error("Failed to load layout", e);
            }
        }
    }, []);

    const resetFormation = () => {
        if (confirm("Reset formation and clear all drawings?")) {
            setPlayers(initialPlayers);
            setBall(initialBall);
            setDrawings([]);
        }
    };

    const saveFormation = () => {
        const layout = { players, ball, drawings };
        localStorage.setItem('tactics-board-layout', JSON.stringify(layout));
        alert('Formation and drawings saved!');
    };

    // Calculate position based on element rect, NOT mouse cursor, to avoid snapping
    const handleDragEnd = (id, event) => {
        if (!pitchRef.current) return;

        // event.target is the element being dragged. 
        // Note: Framer Motion might wrap it, but usually event.target is reliable for the DOM node.
        // If event.target is the SVG path inside the div, we need the closest draggable div.
        const draggedElement = event.target.closest('.draggable-item');
        if (!draggedElement) return;

        const elementRect = draggedElement.getBoundingClientRect();
        const pitchRect = pitchRef.current.getBoundingClientRect();

        // Calculate center of the element relative to pitch
        const elementCenterX = elementRect.left + elementRect.width / 2;
        const elementCenterY = elementRect.top + elementRect.height / 2;

        let relativeX = ((elementCenterX - pitchRect.left) / pitchRect.width) * 100;
        let relativeY = ((elementCenterY - pitchRect.top) / pitchRect.height) * 100;

        // Clamp
        relativeX = Math.max(0, Math.min(100, relativeX));
        relativeY = Math.max(0, Math.min(100, relativeY));

        if (id === 'ball') {
            setBall({ x: relativeX, y: relativeY });
        } else {
            setPlayers(prev => prev.map(p => p.id === id ? { ...p, x: relativeX, y: relativeY } : p));
        }
    };

    const getRelativeCoords = (e) => {
        if (!pitchRef.current) return { x: 0, y: 0 };
        const rect = pitchRef.current.getBoundingClientRect();
        return {
            x: ((e.clientX - rect.left) / rect.width) * 100,
            y: ((e.clientY - rect.top) / rect.height) * 100
        };
    };

    const handleMouseDown = (e) => {
        if (tool === 'move') return;
        const coords = getRelativeCoords(e);
        setCurrentDrawing({ type: tool, start: coords, end: coords, id: Date.now() });
    };

    const handleMouseMove = (e) => {
        if (!currentDrawing) return;
        const coords = getRelativeCoords(e);
        setCurrentDrawing(prev => ({ ...prev, end: coords }));
    };

    const handleMouseUp = () => {
        if (!currentDrawing) return;
        setDrawings(prev => [...prev, currentDrawing]);
        setCurrentDrawing(null);
    };

    const deleteDrawing = (id, e) => {
        e.stopPropagation(); // Prevent triggering new drawing
        if (tool === 'delete') {
            setDrawings(prev => prev.filter(d => d.id !== id));
        }
    };

    // Helper to render arrow head
    const renderArrowHead = (start, end) => {
        const dx = end.x - start.x;
        const dy = end.y - start.y;
        const angle = Math.atan2(dy, dx);
        // Arrow head length in % (approx)
        const len = 2;

        const x1 = end.x - len * Math.cos(angle - Math.PI / 6);
        const y1 = end.y - len * Math.sin(angle - Math.PI / 6);
        const x2 = end.x - len * Math.cos(angle + Math.PI / 6);
        const y2 = end.y - len * Math.sin(angle + Math.PI / 6);

        return `${x1},${y1} ${end.x},${end.y} ${x2},${y2}`;
    };

    return (
        <div style={{ position: 'relative', height: '100%', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {/* Toolbar */}
            <div className="glass-panel" style={{ padding: '0.5rem', display: 'flex', gap: '1rem', alignItems: 'center', justifyContent: 'center' }}>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                    {[
                        { id: 'move', label: '✋ Move' },
                        { id: 'arrow', label: '↗ Arrow' },
                        { id: 'line', label: '— Line' },
                        { id: 'delete', label: '🗑 Delete' }
                    ].map(t => (
                        <button
                            key={t.id}
                            onClick={() => setTool(t.id)}
                            style={{
                                background: tool === t.id ? 'var(--color-accent-green)' : 'rgba(255,255,255,0.1)',
                                color: tool === t.id ? 'black' : 'white',
                                border: 'none',
                                padding: '4px 12px',
                                borderRadius: '4px',
                                cursor: 'pointer',
                                fontWeight: 'bold'
                            }}
                        >
                            {t.label}
                        </button>
                    ))}
                </div>
                <div style={{ width: '1px', height: '20px', background: 'rgba(255,255,255,0.2)' }}></div>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button onClick={saveFormation} style={{ padding: '4px 12px', background: 'rgba(0,0,0,0.5)', border: '1px solid rgba(255,255,255,0.2)', color: 'white', borderRadius: '4px', cursor: 'pointer' }}>💾 Save</button>
                    <button onClick={resetFormation} style={{ padding: '4px 12px', background: 'rgba(0,0,0,0.5)', border: '1px solid rgba(255,255,255,0.2)', color: 'white', borderRadius: '4px', cursor: 'pointer' }}>Reset</button>
                </div>
            </div>

            <div
                className="glass-panel"
                style={{ flex: 1, padding: '1rem', display: 'flex', justifyContent: 'center', alignItems: 'center', position: 'relative', overflow: 'hidden' }}
            >
                {/* Reference Container for Drag Calculations */}
                <div
                    ref={pitchRef}
                    style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', cursor: tool !== 'move' ? 'crosshair' : 'default' }}
                    onMouseDown={handleMouseDown}
                    onMouseMove={handleMouseMove}
                    onMouseUp={handleMouseUp}
                >
                    <svg width="100%" height="100%" viewBox="0 0 100 100" preserveAspectRatio="none" style={{ backgroundColor: 'var(--color-pitch-grass)', borderRadius: '8px', position: 'absolute', top: 0, left: 0 }}>
                        {/* Static Pitch Markings (Using percentages for responsiveness) */}
                        <rect x="0" y="0" width="100" height="100" fill="none" stroke="var(--color-pitch-line)" strokeWidth="0.5" />
                        <circle cx="50" cy="50" r="10" fill="none" stroke="var(--color-pitch-line)" strokeWidth="0.5" />
                        <line x1="50" y1="0" x2="50" y2="100" stroke="var(--color-pitch-line)" strokeWidth="0.5" />
                        <rect x="0" y="20" width="15" height="60" fill="none" stroke="var(--color-pitch-line)" strokeWidth="0.5" />
                        <rect x="85" y="20" width="15" height="60" fill="none" stroke="var(--color-pitch-line)" strokeWidth="0.5" />
                        <rect x="0" y="35" width="5" height="30" fill="none" stroke="var(--color-pitch-line)" strokeWidth="0.5" />
                        <rect x="95" y="35" width="5" height="30" fill="none" stroke="var(--color-pitch-line)" strokeWidth="0.5" />

                        {/* Drawings Layer */}
                        {drawings.map(d => (
                            <g key={d.id} onClick={(e) => deleteDrawing(d.id, e)} style={{ cursor: tool === 'delete' ? 'pointer' : 'default' }}>
                                <line
                                    x1={d.start.x} y1={d.start.y}
                                    x2={d.end.x} y2={d.end.y}
                                    stroke="yellow"
                                    strokeWidth="1"
                                    strokeDasharray={d.type === 'move' ? '4' : '0'} // Just in case
                                    opacity="0.8"
                                />
                                {d.type === 'arrow' && (
                                    <polyline
                                        points={renderArrowHead(d.start, d.end)}
                                        fill="none"
                                        stroke="yellow"
                                        strokeWidth="1"
                                    />
                                )}
                            </g>
                        ))}
                        {currentDrawing && (
                            <g>
                                <line
                                    x1={currentDrawing.start.x} y1={currentDrawing.start.y}
                                    x2={currentDrawing.end.x} y2={currentDrawing.end.y}
                                    stroke="yellow"
                                    strokeWidth="1"
                                    opacity="0.8"
                                />
                                {currentDrawing.type === 'arrow' && (
                                    <polyline
                                        points={renderArrowHead(currentDrawing.start, currentDrawing.end)}
                                        fill="none"
                                        stroke="yellow"
                                        strokeWidth="1"
                                    />
                                )}
                            </g>
                        )}
                    </svg>

                    {/* Draggable Players Layer */}
                    {players.map((player) => (
                        <motion.div
                            key={player.id}
                            className="draggable-item"
                            drag={tool === 'move'} // Only drag in move mode
                            dragMomentum={false}
                            dragElastic={0} // No elasticity to prevent jumping back
                            dragConstraints={pitchRef}
                            onDragEnd={(e) => handleDragEnd(player.id, e)}
                            style={{
                                position: 'absolute',
                                left: `${player.x}%`,
                                top: `${player.y}%`,
                                width: '30px',
                                height: '30px',
                                marginLeft: '-15px',
                                marginTop: '-15px',
                                backgroundColor: player.name === 'GK' ? '#FFD700' : 'var(--color-bg-card)',
                                border: `2px solid ${player.color === 'red' ? 'var(--color-accent-red)' : player.color === 'blue' ? 'var(--color-accent-blue)' : 'var(--color-accent-green)'}`,
                                borderRadius: '50%',
                                display: 'flex',
                                justifyContent: 'center',
                                alignItems: 'center',
                                cursor: tool === 'move' ? 'grab' : 'default',
                                zIndex: 10,
                                boxShadow: '0 2px 5px rgba(0,0,0,0.3)',
                                color: 'white',
                                fontWeight: 'bold',
                                fontSize: '0.7rem',
                                pointerEvents: tool === 'move' ? 'auto' : 'none' // Let clicks pass through to SVG for drawing if not moving
                            }}
                            whileHover={{ scale: tool === 'move' ? 1.1 : 1 }}
                            whileDrag={{ scale: 1.2, cursor: 'grabbing', zIndex: 100 }}
                        >
                            {player.name}
                        </motion.div>
                    ))}

                    {/* Draggable Ball */}
                    <motion.div
                        className="draggable-item"
                        drag={tool === 'move'}
                        dragMomentum={false}
                        dragElastic={0}
                        dragConstraints={pitchRef}
                        onDragEnd={(e) => handleDragEnd('ball', e)}
                        style={{
                            position: 'absolute',
                            left: `${ball.x}%`,
                            top: `${ball.y}%`,
                            width: '15px',
                            height: '15px',
                            marginLeft: '-7.5px',
                            marginTop: '-7.5px',
                            backgroundColor: 'white',
                            border: '1px solid black',
                            borderRadius: '50%',
                            zIndex: 11,
                            cursor: tool === 'move' ? 'grab' : 'default',
                            boxShadow: '0 2px 4px rgba(0,0,0,0.4)',
                            pointerEvents: tool === 'move' ? 'auto' : 'none'
                        }}
                        whileHover={{ scale: tool === 'move' ? 1.2 : 1 }}
                        whileDrag={{ scale: 1.3, cursor: 'grabbing', zIndex: 100 }}
                    />
                </div>
            </div>
        </div>
    );
};

export default Pitch;
