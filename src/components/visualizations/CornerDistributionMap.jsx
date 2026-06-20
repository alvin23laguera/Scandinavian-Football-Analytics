import React, { useMemo, useState } from 'react';
import { motion } from 'framer-motion';

const CornerDistributionMap = ({ data = [], teamName = "Tromsø IL" }) => {
  const [sideFilter, setSideFilter] = useState('all'); 
  const [displayMode, setDisplayMode] = useState('total'); // 'total', 'efficiency', 'percentage'

  // Define zones precisely matching the SVG pitch markings
  const zones = useMemo(() => {
    const penAreaWidth = 78.9 - 21.1; 
    const evenWidth = penAreaWidth / 3; 
    const xSplit1 = 21.1 + evenWidth; 
    const xSplit2 = 21.1 + 2 * evenWidth;
    const penHalfwayY = 16.5 / 2;
    
    return [
      { id: 'near_6y', label: 'Near Post', x: [54.8, 63.2], y: [0, 5.5] },
      { id: 'center_6y', label: 'Goal Mouth', x: [45.2, 54.8], y: [0, 5.5] },
      { id: 'far_6y', label: 'Far Post', x: [36.8, 45.2], y: [0, 5.5] },
      { id: 'near_wing', label: 'Near Wing', x: [63.2, 78.9], y: [0, 5.5] },
      { id: 'far_wing', label: 'Far Wing', x: [21.1, 36.8], y: [0, 5.5] },
      { id: 'near_box', label: 'Near Box', x: [xSplit2, 78.9], y: [5.5, 16.5] },
      { id: 'center_box', label: 'Center Box', x: [xSplit1, xSplit2], y: [5.5, 16.5] },
      { id: 'far_box', label: 'Far Box', x: [21.1, xSplit1], y: [5.5, 16.5] },
      { id: 'near_top', label: 'Near Top', x: [xSplit2, 78.9], y: [16.5, 25] },
      { id: 'center_top', label: 'Center Top', x: [xSplit1, xSplit2], y: [16.5, 25] },
      { id: 'far_top', label: 'Far Top', x: [21.1, xSplit1], y: [16.5, 25] },
      { id: 'short_deep', label: 'Short Deep', x: [78.9, 90], y: [0, penHalfwayY] },
      { id: 'short_high', label: 'Short High', x: [78.9, 90], y: [penHalfwayY, 25] },
    ];
  }, []);

  const processedData = useMemo(() => {
    return data
      .map(event => {
        const takenFrom = event.y < 50 ? 'left' : 'right';
        let vX = event.y;
        let vY = event.x;

        // TACTICAL MIRRORING: If taken from the left, mirror to the right
        // so that "Near Post" is always the same physical location.
        if (takenFrom === 'left') {
          vX = 100 - vX;
        }

        return {
          ...event,
          vX, 
          vY,
          takenFrom
        };
      })
      .filter(event => sideFilter === 'all' || event.takenFrom === sideFilter);
  }, [data, sideFilter]);

  // Identify the primary corner taker for visual verification
  const primaryTakerInfo = useMemo(() => {
    if (!processedData.length) return null;
    const counts = {};
    processedData.forEach(d => {
      const name = d.player || d.playerName || 'Unknown';
      counts[name] = (counts[name] || 0) + 1;
    });
    const sorted = Object.entries(counts).sort((a, b) => b[1] - a[1]);
    return { name: sorted[0][0], count: sorted[0][1] };
  }, [processedData]);

  const zoneStats = useMemo(() => {
    const stats = {};
    zones.forEach(z => stats[z.id] = { total: 0, completed: 0 });
    processedData.forEach(event => {
      const zone = zones.find(z => 
        event.vX >= z.x[0] && event.vX <= z.x[1] &&
        event.vY >= z.y[0] && event.vY <= z.y[1]
      );
      if (zone) {
        stats[zone.id].total++;
        if (event.completed || event.outcome === 'completed') stats[zone.id].completed++;
      }
    });
    return stats;
  }, [processedData, zones]);

  const maxTotal = Math.max(...Object.values(zoneStats).map(s => s.total), 1);
  const totalCountInView = processedData.length;

  const getBlueShade = (count) => {
    if (count === 0) return 'rgba(30, 41, 59, 0.1)'; 
    const intensity = (count / maxTotal);
    return `hsla(210, 100%, ${Math.max(40, 80 - intensity * 30)}%, ${0.15 + intensity * 0.55})`;
  };

  const X_START = 10;
  const X_RANGE = 80;
  const Y_OFFSET = 5; 
  const Y_TOTAL_VIEW = 26 + Y_OFFSET;

  // Reusable button style
  const buttonStyle = (isActive) => ({
    background: isActive ? 'rgba(56,189,248,0.15)' : 'rgba(255,255,255,0.05)',
    color: isActive ? '#38bdf8' : '#94a3b8',
    border: `1px solid ${isActive ? 'rgba(56,189,248,0.4)' : 'rgba(255,255,255,0.12)'}`,
    borderRadius: '6px',
    padding: '0.4rem 0.8rem',
    cursor: 'pointer',
    fontSize: '0.75rem',
    fontWeight: 'bold',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
    transition: 'all 0.2s ease',
    outline: 'none'
  });

  return (
    <div className="bg-[#0f172a] rounded-xl p-6 border border-slate-800 shadow-2xl relative overflow-hidden">
      <div className="flex justify-between items-start mb-4">
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
            <h3 className="section-title" style={{ margin: '0' }}>
                Corner Kick Delivery Zones
            </h3>
            <p style={{ color: '#94a3b8', fontSize: '0.75rem', marginLeft: '0.75rem', marginTop: '0.25rem' }}>
                {teamName} • Pattern Distribution
            </p>
        </div>
        
        <div className="flex flex-col items-end gap-2">
            <div className="flex gap-2">
                <div className="flex gap-1 bg-[#1e293b]/40 p-1 rounded-lg border border-slate-700/50 mr-2">
                    {['all', 'left', 'right'].map(id => (
                        <button key={id} onClick={() => setSideFilter(id)} style={buttonStyle(sideFilter === id)}>
                            {id}
                        </button>
                    ))}
                </div>
                <div className="flex gap-1">
                    {[
                        { id: 'total', label: 'Total' },
                        { id: 'efficiency', label: 'Efficiency' },
                        { id: 'percentage', label: 'Percentage' }
                    ].map(mode => (
                        <button key={mode.id} onClick={() => setDisplayMode(mode.id)} style={buttonStyle(displayMode === mode.id)}>
                            {mode.label}
                        </button>
                    ))}
                </div>
            </div>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.25rem' }}>
                <span style={{ fontSize: '1.25rem', fontWeight: '900', color: '#38bdf8', lineHeight: 1 }}>{totalCountInView}</span>
                <span style={{ color: '#94a3b8', fontSize: '0.65rem', textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 'bold' }}>Total Corners</span>
            </div>
        </div>
      </div>

      <div className="relative aspect-[1.6/1] w-full bg-[#060a12] rounded-lg border border-slate-800 overflow-hidden shadow-inner">
        <svg viewBox={`${X_START} 0 ${X_RANGE} ${Y_TOTAL_VIEW}`} className="absolute inset-0 w-full h-full z-20 overflow-visible">
          
          <g>
            {zones.map((zone) => {
              const stats = zoneStats[zone.id];
              return (
                <rect
                  key={zone.id}
                  x={zone.x[0]}
                  y={zone.y[0] + Y_OFFSET}
                  width={zone.x[1] - zone.x[0]}
                  height={zone.y[1] - zone.y[0]}
                  fill={getBlueShade(stats.total)}
                  stroke="rgba(59, 130, 246, 0.15)"
                  strokeWidth="0.08"
                  className="transition-all duration-300 cursor-pointer"
                />
              );
            })}
          </g>

          <g pointerEvents="none">
            {zones.map((zone) => {
              const stats = zoneStats[zone.id];
              if (stats.total === 0) return null;

              const centerX = (zone.x[0] + zone.x[1]) / 2;
              const centerY = (zone.y[0] + zone.y[1]) / 2 + Y_OFFSET;

              if (displayMode === 'efficiency') {
                const perc = ((stats.completed / stats.total) * 100).toFixed(0);
                return (
                    <g key={`text-${zone.id}`}>
                        <text x={centerX} y={centerY + 0.2} textAnchor="middle" fill="white" style={{ fontSize: '2.8px', fontWeight: '900' }}>
                            {stats.completed}/{stats.total}
                        </text>
                        <text x={centerX} y={centerY + 1.8} textAnchor="middle" fill="#38bdf8" style={{ fontSize: '1.8px', fontWeight: 'bold' }}>
                            {perc}%
                        </text>
                    </g>
                );
              }

              if (displayMode === 'percentage') {
                const perc = ((stats.total / totalCountInView) * 100).toFixed(0);
                return (
                    <text key={`text-${zone.id}`} x={centerX} y={centerY + 0.6} textAnchor="middle" fill="white" style={{ fontSize: '3.5px', fontWeight: '900' }}>
                        {perc}%
                    </text>
                );
              }

              return (
                <text key={`text-${zone.id}`} x={centerX} y={centerY + 0.6} textAnchor="middle" fill="white" style={{ fontSize: '3.5px', fontWeight: '900' }}>
                    {stats.total}
                </text>
              );
            })}
          </g>

          {/* PITCH MARKINGS */}
          <line x1={X_START} y1={Y_OFFSET} x2={100 - X_START} y2={Y_OFFSET} stroke="#475569" strokeWidth="0.4" />
          <rect x="21.1" y={Y_OFFSET} width="57.8" height="16.5" fill="none" stroke="#64748b" strokeWidth="0.5" />
          <rect x="36.8" y={Y_OFFSET} width="26.4" height="5.5" fill="none" stroke="#94a3b8" strokeWidth="0.6" />
          <path d={`M 36.8 ${Y_OFFSET + 16.5} Q 50 ${Y_OFFSET + 25} 63.2 ${Y_OFFSET + 16.5}`} fill="none" stroke="#64748b" strokeWidth="0.5" />
          <path d={`M 45.2 ${Y_OFFSET} L 45.2 ${Y_OFFSET - 1.5} L 54.8 ${Y_OFFSET - 1.5} L 54.8 ${Y_OFFSET}`} fill="none" stroke="#475569" strokeWidth="0.5" />
          <circle cx="50" cy={Y_OFFSET + 11} r="0.25" fill="#475569" />
          
          <line x1="10" y1={Y_OFFSET} x2="10" y2={Y_TOTAL_VIEW} stroke="#334155" strokeWidth="0.3" />
          <line x1="90" y1={Y_OFFSET} x2="90" y2={Y_TOTAL_VIEW} stroke="#334155" strokeWidth="0.3" />

          {/* CORNER FLAG INDICATOR (Always on the Right due to Mirroring) */}
          <g>
            <circle cx="90" cy={Y_OFFSET} r="0.8" fill="#38bdf8" opacity="0.6" />
            <circle cx="90" cy={Y_OFFSET} r="0.3" fill="#ffffff" />
            <path d={`M 90 ${Y_OFFSET} L 90 ${Y_OFFSET - 2.5} L 88 ${Y_OFFSET - 2} L 90 ${Y_OFFSET - 1.5}`} fill="#38bdf8" />
            <text x="89.5" y={Y_OFFSET - 3.5} fill="#38bdf8" fontSize="1.8" fontWeight="bold" textAnchor="end">Perspective</text>
          </g>
        </svg>
      </div>

      {primaryTakerInfo && (
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '1rem', paddingTop: '0.75rem', borderTop: '1px solid rgba(30,41,59,0.5)' }}>
              <span style={{ color: '#94a3b8', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 'bold' }}>Primary Taker:</span>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <span style={{ background: 'rgba(56,189,248,0.15)', color: '#38bdf8', border: '1px solid rgba(56,189,248,0.4)', padding: '0.25rem 0.75rem', borderRadius: '0.375rem', fontSize: '0.75rem', fontWeight: 'bold', letterSpacing: '0.025em' }}>
                      {primaryTakerInfo.name} <span style={{ opacity: 0.5, margin: '0 0.25rem' }}>-</span> <span style={{ fontWeight: '900' }}>{primaryTakerInfo.count}</span>
                  </span>
              </div>
          </div>
      )}
    </div>
  );
};

export default CornerDistributionMap;
