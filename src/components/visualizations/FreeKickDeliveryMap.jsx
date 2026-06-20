import React, { useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const FreeKickDeliveryMap = ({ data = [], teamName = "Tromsø IL" }) => {
  const [selectedOriginZone, setSelectedOriginZone] = useState(null);
  const [displayMode, setDisplayMode] = useState('total');

  // Alignment Constants
  const Y_OFFSET = 5; 
  const PEN_AREA_X1 = 21.1;
  const PEN_AREA_X2 = 78.9;
  const PEN_WIDTH = PEN_AREA_X2 - PEN_AREA_X1; 
  const LANE_WIDTH = PEN_WIDTH / 3; 
  const X_SPLIT_1 = PEN_AREA_X1 + LANE_WIDTH; 
  const X_SPLIT_2 = PEN_AREA_X1 + 2 * LANE_WIDTH;

  const zones = useMemo(() => {
    return [
      // 1. SIX YARD BOX (0 - 5.5m)
      { id: '1', x: [54.8, 63.2], y: [0, 5.5], isBox: true },
      { id: '2', x: [45.2, 54.8], y: [0, 5.5], isBox: true },
      { id: '3', x: [36.8, 45.2], y: [0, 5.5], isBox: true },
      
      // 2. OUTER WINGS - DEEP (0 - 8.25m)
      { id: '4', x: [0, 21.1], y: [0, 8.25] },
      { id: '5', x: [78.9, 100], y: [0, 8.25] },

      // 3. MERGED SIDE ZONES (8.25 - 25m)
      { id: '6', x: [0, 21.1], y: [8.25, 25] }, 
      { id: '7', x: [78.9, 100], y: [8.25, 25] }, 

      // 4. MAIN BOX SIDES & CENTER (0 - 16.5m)
      { id: '8', x: [63.2, 78.9], y: [0, 5.5], isBox: true }, 
      { id: '9', x: [21.1, 36.8], y: [0, 5.5], isBox: true }, 
      { id: '10', x: [X_SPLIT_2, 78.9], y: [5.5, 16.5], isBox: true },
      { id: '11', x: [X_SPLIT_1, X_SPLIT_2], y: [5.5, 16.5], isBox: true },
      { id: '12', x: [21.1, X_SPLIT_1], y: [5.5, 16.5], isBox: true },

      // 5. TOP OF BOX CENTER STRIP (16.5 - 25m)
      { id: '13', x: [X_SPLIT_2, 78.9], y: [16.5, 25] },
      { id: '14', x: [X_SPLIT_1, X_SPLIT_2], y: [16.5, 25] },
      { id: '15', x: [21.1, X_SPLIT_1], y: [16.5, 25] },

      // 6. DEEP ATTACKING HALF (25 - 50m)
      { id: '16', x: [0, 21.1], y: [25, 50] },
      { id: '17', x: [21.1, X_SPLIT_1], y: [25, 50] },
      { id: '18', x: [X_SPLIT_1, X_SPLIT_2], y: [25, 50] },
      { id: '19', x: [X_SPLIT_2, 78.9], y: [25, 50] },
      { id: '20', x: [78.9, 100], y: [25, 50] },

      // 7. BEHIND HALFWAY (50 - 65m)
      { id: '21', x: [0, 21.1], y: [50, 65] },
      { id: '22', x: [21.1, 78.9], y: [50, 65] },
      { id: '23', x: [78.9, 100], y: [50, 65] },
    ];
  }, [X_SPLIT_1, X_SPLIT_2]);

  // Data processing
  const stats = useMemo(() => {
    // 1. Calculate origin frequency for initial state
    const originFreq = {};
    zones.forEach(z => originFreq[z.id] = 0);
    data.forEach(e => {
        const z = zones.find(z => e.startY >= z.x[0] && e.startY <= z.x[1] && e.startX >= z.y[0] && e.startX <= z.y[1]);
        if (z) originFreq[z.id]++;
    });

    // 2. Filter data by selected origin
    let filtered = data;
    if (selectedOriginZone) {
      const source = zones.find(z => z.id === selectedOriginZone);
      filtered = data.filter(e => e.startY >= source.x[0] && e.startY <= source.x[1] && e.startX >= source.y[0] && e.startX <= source.y[1]);
    }

    // 3. Calculate destination stats for the filtered set
    const destStats = {};
    const takerCounts = {};
    let totalShots = 0;
    let goals = 0;

    zones.forEach(z => destStats[z.id] = { total: 0, completed: 0 });
    filtered.forEach(e => {
      // Taker
      if (e.player) {
        takerCounts[e.player] = (takerCounts[e.player] || 0) + 1;
      }

      // Direct Shot Handling
      if (e.isShot) {
          totalShots++;
          if (e.result === 'goal') goals++;
          return;
      }

      // Destination for deliveries
      const z = zones.find(z => e.destY >= z.x[0] && e.destY <= z.x[1] && e.destX >= z.y[0] && e.destX <= z.y[1]);
      if (z) {
        destStats[z.id].total++;
        if (e.outcome === 'completed') destStats[z.id].completed++;
      }
    });

    const topTaker = Object.entries(takerCounts).sort((a, b) => b[1] - a[1])[0];

    return { originFreq, destStats, totalFiltered: filtered.length, topTaker, totalShots, goals };
  }, [data, zones, selectedOriginZone]);

  const maxOrigin = Math.max(...Object.values(stats.originFreq), 1);
  const maxDest = Math.max(...Object.values(stats.destStats).map(s => s.total), 1);

  const getShade = (count, max, isOrigin) => {
    if (count === 0) return 'rgba(255, 255, 255, 0.02)';
    const intensity = count / max;
    if (isOrigin) {
        return `hsla(35, 100%, ${Math.max(40, 70 - intensity * 20)}%, ${0.1 + intensity * 0.6})`;
    }
    return `hsla(210, 100%, ${Math.max(40, 80 - intensity * 30)}%, ${0.2 + intensity * 0.6})`;
  };

  const handleZoneClick = (zone) => {
    if (zone.isBox) return; 
    setSelectedOriginZone(selectedOriginZone === zone.id ? null : zone.id);
  };

  const buttonStyle = (isActive) => ({
    background: isActive ? 'rgba(56,189,248,0.15)' : 'rgba(255,255,255,0.05)',
    color: isActive ? '#38bdf8' : '#94a3b8',
    border: `1px solid ${isActive ? 'rgba(56,189,248,0.4)' : 'rgba(255,255,255,0.12)'}`,
    borderRadius: '6px',
    padding: '0.35rem 0.8rem',
    cursor: 'pointer',
    fontSize: '0.65rem',
    fontWeight: 'bold',
    transition: 'all 0.2s ease',
  });

  return (
    <div className="bg-[#0f172a] rounded-xl p-6 border border-slate-800 shadow-2xl relative overflow-hidden">
      <div className="flex justify-between items-start mb-4">
        <div className="flex flex-col gap-1">
            <h3 className="text-[1.1rem] font-bold text-white flex items-center gap-2 m-0 uppercase tracking-wide">
                <span className="w-1.5 h-5 bg-blue-500 rounded-full"></span>
                Free Kick Delivery Zones
            </h3>
            <p className="text-slate-400 text-xs ml-3 mt-1">
                {teamName} {selectedOriginZone ? `• Origin: Zone ${selectedOriginZone}` : '• Select Origin Zone'}
            </p>
        </div>
        
        <div className="flex flex-col items-end gap-2">
            <div className={`flex gap-2 transition-opacity duration-300 ${selectedOriginZone ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
                <button onClick={() => setSelectedOriginZone(null)} className="text-[10px] bg-red-500/10 text-red-400 border border-red-500/30 px-3 py-1 rounded hover:bg-red-500/20 transition-colors uppercase font-bold tracking-wider mr-2">
                    Reset
                </button>
                <div className="flex gap-1">
                    {['total', 'efficiency', 'percentage'].map(mode => (
                        <button key={mode} onClick={() => setDisplayMode(mode)} style={buttonStyle(displayMode === mode)}>
                            {mode.toUpperCase()}
                        </button>
                    ))}
                </div>
            </div>
            
            <div className={`flex items-center gap-2 mt-1 transition-opacity duration-300 ${selectedOriginZone ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
                <span className="text-xl font-black text-blue-500 leading-none">{stats.totalFiltered || 0}</span>
                <span className="text-slate-400 text-[10px] uppercase tracking-widest font-bold">Free Kicks</span>
            </div>
        </div>
      </div>

      <div className="relative aspect-[1/1.3] w-full bg-[#060a12] rounded-lg border border-slate-800 overflow-hidden shadow-inner">
        <svg viewBox="0 0 100 70" className="absolute inset-0 w-full h-full z-20">
          
          {/* PITCH MARKINGS */}
          <g opacity="0.6">
            <line x1="0" y1={Y_OFFSET} x2="100" y2={Y_OFFSET} stroke="#f8fafc" strokeWidth="0.8" />
            <line x1="0" y1={Y_OFFSET} x2="0" y2={70} stroke="#64748b" strokeWidth="0.5" />
            <line x1="100" y1={Y_OFFSET} x2="100" y2={70} stroke="#64748b" strokeWidth="0.5" />
            <rect x="45.2" y={Y_OFFSET - 2} width="9.6" height="2" fill="none" stroke="#f8fafc" strokeWidth="0.6" />
            <rect x="21.1" y={Y_OFFSET} width="57.8" height="16.5" fill="none" stroke="#64748b" strokeWidth="0.5" />
            <rect x="36.8" y={Y_OFFSET} width="26.4" height="5.5" fill="none" stroke="#64748b" strokeWidth="0.5" />
            
            {/* Penalty Arc (D) */}
            <path d={`M 36.8 ${16.5 + Y_OFFSET} Q 50 ${25 + Y_OFFSET} 63.2 ${16.5 + Y_OFFSET}`} fill="none" stroke="#64748b" strokeWidth="0.5" />

            <line x1="0" y1={50 + Y_OFFSET} x2="100" y2={50 + Y_OFFSET} stroke="#64748b" strokeWidth="0.5" />
            <circle cx="50" cy={50 + Y_OFFSET} r="9.15" fill="none" stroke="#64748b" strokeWidth="0.5" />
          </g>

          {/* DIRECT SHOTS ON GOAL INDICATOR */}
          {selectedOriginZone && stats.totalShots > 0 && (
            <g>
               <rect x="45.2" y={Y_OFFSET - 2} width="9.6" height="2" fill="hsla(210, 100%, 50%, 0.6)" stroke="#38bdf8" strokeWidth="0.6" />
               <text x="50" y={Y_OFFSET - 3} textAnchor="middle" fill="#38bdf8" style={{ fontSize: '3.5px', fontWeight: 'bold', pointerEvents: 'none' }}>
                  {displayMode === 'efficiency' ? `${stats.goals}/${stats.totalShots}` : 
                   displayMode === 'percentage' ? `${((stats.totalShots / stats.totalFiltered) * 100).toFixed(0)}%` : 
                   stats.totalShots}
               </text>
               {displayMode === 'efficiency' && (
                 <text x="50" y={Y_OFFSET - 6.5} textAnchor="middle" fill="#7dd3fc" style={{ fontSize: '2px', fontWeight: 'bold', pointerEvents: 'none' }}>
                    {((stats.goals / stats.totalShots) * 100).toFixed(0)}%
                 </text>
               )}
            </g>
          )}

          {/* ZONE HEATMAP */}
          <g>
            {zones.map(zone => {
              const isOrigin = selectedOriginZone === zone.id;
              const s = stats.destStats[zone.id];
              const count = selectedOriginZone ? s.total : stats.originFreq[zone.id];
              const max = selectedOriginZone ? maxDest : maxOrigin;
              
              const fillColor = isOrigin 
                ? `hsla(35, 100%, 50%, 0.5)` // Solid orange for origin
                : selectedOriginZone 
                    ? getShade(count, max, false) // Blue targets
                    : getShade(count, max, true); // Initial amber
              
              return (
                <g key={zone.id} onClick={() => handleZoneClick(zone)} className={`${zone.isBox ? 'opacity-40' : 'cursor-pointer'} group`}>
                  <rect
                    x={zone.x[0]}
                    y={zone.y[0] + Y_OFFSET}
                    width={zone.x[1] - zone.x[0]}
                    height={zone.y[1] - zone.y[0]}
                    fill={fillColor}
                    stroke={isOrigin ? "#f59e0b" : "rgba(56, 189, 248, 0.15)"}
                    strokeWidth={isOrigin ? "0.4" : "0.1"}
                    className="transition-all duration-300"
                  />
                  
                  {/* Label Logic */}
                  {!selectedOriginZone ? (
                    /* Initial State: Show Zone IDs */
                    <text 
                      x={(zone.x[0] + zone.x[1]) / 2} 
                      y={(zone.y[0] + zone.y[1]) / 2 + Y_OFFSET + 0.5} 
                      textAnchor="middle" 
                      fill="white" 
                      style={{ fontSize: '2px', fontWeight: 'bold', pointerEvents: 'none', opacity: count > 0 ? 1 : 0.4 }}
                    >
                      {zone.id}
                    </text>
                  ) : (
                    /* Selected State: Show delivery counts/efficiency */
                    (count > 0 || isOrigin) && (
                      <g style={{ pointerEvents: 'none' }}>
                        {displayMode === 'efficiency' && !isOrigin ? (
                          <>
                            <text x={(zone.x[0] + zone.x[1]) / 2} y={(zone.y[0] + zone.y[1]) / 2 + Y_OFFSET - 0.2} textAnchor="middle" fill="white" style={{ fontSize: '1.9px', fontWeight: 'bold' }}>
                              {s.completed}/{s.total}
                            </text>
                            <text x={(zone.x[0] + zone.x[1]) / 2} y={(zone.y[0] + zone.y[1]) / 2 + Y_OFFSET + 1.2} textAnchor="middle" fill="#7dd3fc" style={{ fontSize: '1.4px', fontWeight: 'bold' }}>
                              {((s.completed/s.total)*100).toFixed(0)}%
                            </text>
                          </>
                        ) : (
                          <text 
                            x={(zone.x[0] + zone.x[1]) / 2} 
                            y={(zone.y[0] + zone.y[1]) / 2 + Y_OFFSET + 0.5} 
                            textAnchor="middle" 
                            fill={isOrigin ? "#38bdf8" : "white"} 
                            style={{ fontSize: isOrigin ? '2.5px' : '2.1px', fontWeight: 'bold' }}
                          >
                            {displayMode === 'percentage' ? `${((count / stats.totalFiltered) * 100).toFixed(0)}%` : count}
                          </text>
                        )}
                      </g>
                    )
                  )}
                </g>
              );
            })}
          </g>
        </svg>

        <AnimatePresence>
            {/* 'Select origin zone' prompt removed */}
        </AnimatePresence>
      </div>

      {/* PRIMARY TAKER FOOTER */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '1rem', paddingTop: '0.75rem', borderTop: '1px solid rgba(30,41,59,0.5)', opacity: selectedOriginZone && stats.topTaker ? 1 : 0, pointerEvents: selectedOriginZone && stats.topTaker ? 'auto' : 'none', transition: 'opacity 0.3s ease' }}>
          <span style={{ color: '#94a3b8', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 'bold' }}>Primary Taker:</span>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
              <span style={{ background: 'rgba(56,189,248,0.15)', color: '#38bdf8', border: '1px solid rgba(56,189,248,0.4)', padding: '0.25rem 0.75rem', borderRadius: '0.375rem', fontSize: '0.75rem', fontWeight: 'bold', letterSpacing: '0.025em' }}>
                  {stats.topTaker ? stats.topTaker[0] : 'None'} <span style={{ opacity: 0.5, margin: '0 0.25rem' }}>-</span> <span style={{ fontWeight: '900' }}>{stats.topTaker ? stats.topTaker[1] : 0}</span>
              </span>
          </div>
      </div>
    </div>
  );
};

export default FreeKickDeliveryMap;
