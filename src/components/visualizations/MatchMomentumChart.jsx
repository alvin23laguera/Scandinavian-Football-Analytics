import React, { useState, useMemo } from 'react';

const MatchMomentumChart = ({ selectedData, teamName, opponentName, selectedCount = 1, isNeutral = true, onFetchAll }) => {
    const [metric, setMetric] = useState('goals'); // 'goals', 'shotsOnTarget', 'allShots', 'boxEntries'
    const [aggregation, setAggregation] = useState('total'); // 'total', 'perGame'

    const activeData = selectedData;
    const activeCount = selectedCount;

    // Determine max value for Y-axis scaling
    const maxY = useMemo(() => {
        let max = 0.1; // Small non-zero default
        activeData.forEach(d => {
            let tVal, oVal;
            if (metric === 'goals') { tVal = d.teamGoals; oVal = d.opponentGoals; }
            else if (metric === 'shotsOnTarget') { tVal = d.teamShots; oVal = d.opponentShots; }
            else if (metric === 'allShots') { tVal = d.teamAllShots; oVal = d.opponentAllShots; }
            else if (metric === 'boxEntries') { tVal = d.teamBoxEntries; oVal = d.opponentBoxEntries; }
            
            if (tVal > max) max = tVal;
            if (oVal > max) max = oVal;
        });

        if (aggregation === 'perGame' && activeCount > 0) {
            max = max / activeCount;
        }

        // Give a little headroom, and ensure minimum scale
        const scaledMax = Math.max(max * 1.1, aggregation === 'perGame' ? 1 : 3);
        
        // For perGame we might want a decimal max, for total we want an integer
        return aggregation === 'perGame' ? Math.ceil(scaledMax * 10) / 10 : Math.ceil(scaledMax);
    }, [activeData, metric, aggregation, activeCount]);

    const totals = useMemo(() => {
        let tTotal = 0;
        let oTotal = 0;
        activeData.forEach(bucket => {
            if (metric === 'goals') { tTotal += bucket.teamGoals || 0; oTotal += bucket.opponentGoals || 0; }
            else if (metric === 'shotsOnTarget') { tTotal += bucket.teamShots || 0; oTotal += bucket.opponentShots || 0; }
            else if (metric === 'allShots') { tTotal += bucket.teamAllShots || 0; oTotal += bucket.opponentAllShots || 0; }
            else if (metric === 'boxEntries') { tTotal += bucket.teamBoxEntries || 0; oTotal += bucket.opponentBoxEntries || 0; }
        });
        return { tTotal, oTotal };
    }, [activeData, metric]);

    const totalMetricLabel = metric === 'goals' ? 'goals' : metric === 'shotsOnTarget' ? 'shots on target' : metric === 'allShots' ? 'shots' : 'entries into the box';

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', width: '100%', maxWidth: '800px', margin: '0 auto' }}>
            
            {/* Header / Controls */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <div style={{ width: '12px', height: '12px', borderRadius: '3px', background: '#60a5fa' }}></div>
                            <span style={{ fontSize: '0.85rem', color: 'var(--color-text-primary)', fontWeight: 'bold' }}>{teamName}</span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <div style={{ width: '12px', height: '12px', borderRadius: '3px', background: '#1e3a8a' }}></div>
                            <span style={{ fontSize: '0.85rem', color: 'var(--color-text-primary)', fontWeight: 'bold' }}>{opponentName}</span>
                        </div>
                    </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', alignItems: 'flex-end' }}>
                    {/* Aggregation Toggle */}
                    <div style={{ display: 'flex', gap: '0.5rem', background: 'rgba(255,255,255,0.05)', padding: '0.3rem', borderRadius: '8px' }}>
                        <button
                            onClick={() => setAggregation('total')}
                            style={{
                                padding: '0.3rem 0.8rem',
                                borderRadius: '6px',
                                border: 'none',
                                cursor: 'pointer',
                                background: aggregation === 'total' ? 'rgba(255,255,255,0.15)' : 'transparent',
                                color: aggregation === 'total' ? '#fff' : 'var(--color-text-secondary)',
                                fontWeight: aggregation === 'total' ? 'bold' : 'normal',
                                transition: 'all 0.2s ease',
                                fontSize: '0.75rem'
                            }}
                        >
                            TOTAL
                        </button>
                        <button
                            onClick={() => setAggregation('perGame')}
                            style={{
                                padding: '0.3rem 0.8rem',
                                borderRadius: '6px',
                                border: 'none',
                                cursor: 'pointer',
                                background: aggregation === 'perGame' ? 'rgba(255,255,255,0.15)' : 'transparent',
                                color: aggregation === 'perGame' ? '#fff' : 'var(--color-text-secondary)',
                                fontWeight: aggregation === 'perGame' ? 'bold' : 'normal',
                                transition: 'all 0.2s ease',
                                fontSize: '0.75rem'
                            }}
                        >
                            PER GAME
                        </button>
                    </div>

                    {/* Metric Toggle */}
                    <div style={{ display: 'flex', gap: '0.5rem', background: 'rgba(255,255,255,0.05)', padding: '0.3rem', borderRadius: '8px', flexWrap: 'wrap' }}>
                    <button
                        onClick={() => setMetric('goals')}
                        style={{
                            padding: '0.4rem 0.8rem',
                            borderRadius: '6px',
                            border: 'none',
                            cursor: 'pointer',
                            background: metric === 'goals' ? 'rgba(255,255,255,0.15)' : 'transparent',
                            color: metric === 'goals' ? '#fff' : 'var(--color-text-secondary)',
                            fontWeight: metric === 'goals' ? 'bold' : 'normal',
                            transition: 'all 0.2s ease',
                            fontSize: '0.8rem'
                        }}
                    >
                        Goals
                    </button>
                    <button
                        onClick={() => setMetric('shotsOnTarget')}
                        style={{
                            padding: '0.4rem 0.8rem',
                            borderRadius: '6px',
                            border: 'none',
                            cursor: 'pointer',
                            background: metric === 'shotsOnTarget' ? 'rgba(255,255,255,0.15)' : 'transparent',
                            color: metric === 'shotsOnTarget' ? '#fff' : 'var(--color-text-secondary)',
                            fontWeight: metric === 'shotsOnTarget' ? 'bold' : 'normal',
                            transition: 'all 0.2s ease',
                            fontSize: '0.8rem'
                        }}
                    >
                        Shots OT
                    </button>
                    <button
                        onClick={() => setMetric('allShots')}
                        style={{
                            padding: '0.4rem 0.8rem',
                            borderRadius: '6px',
                            border: 'none',
                            cursor: 'pointer',
                            background: metric === 'allShots' ? 'rgba(255,255,255,0.15)' : 'transparent',
                            color: metric === 'allShots' ? '#fff' : 'var(--color-text-secondary)',
                            fontWeight: metric === 'allShots' ? 'bold' : 'normal',
                            transition: 'all 0.2s ease',
                            fontSize: '0.8rem'
                        }}
                    >
                        Shots
                    </button>
                    <button
                        onClick={() => setMetric('boxEntries')}
                        style={{
                            padding: '0.4rem 0.8rem',
                            borderRadius: '6px',
                            border: 'none',
                            cursor: 'pointer',
                            background: metric === 'boxEntries' ? 'rgba(255,255,255,0.15)' : 'transparent',
                            color: metric === 'boxEntries' ? '#fff' : 'var(--color-text-secondary)',
                            fontWeight: metric === 'boxEntries' ? 'bold' : 'normal',
                            transition: 'all 0.2s ease',
                            fontSize: '0.8rem'
                        }}
                    >
                        Entries Opp. Box
                    </button>
                </div>
            </div>
        </div>

        {/* Chart Area */}
            <div style={{ display: 'flex', flexDirection: 'column' }}>
                <div style={{ 
                    position: 'relative', 
                    height: '300px', 
                    background: 'rgba(0,0,0,0.2)', 
                    borderRadius: '8px', 
                    border: '1px solid rgba(255,255,255,0.05)',
                    display: 'flex',
                    alignItems: 'center',
                    padding: '0 1rem',
                    marginLeft: '30px' // Space for Y-axis labels
                }}>
                    {/* Background Grid Lines & Y-Axis */}
                    {(() => {
                        let lines = 4;
                        let step = maxY / lines;
                        
                        if (aggregation === 'total') {
                            step = Math.max(1, Math.ceil(maxY / 4));
                            lines = Math.ceil(maxY / step);
                        }
                        
                        const gridLines = [];
                        for (let i = lines; i >= -lines; i--) {
                            if (i === 0) continue;
                            const val = step * i;
                            const posPercent = 50 - (val / maxY) * 50; 
                            if (posPercent >= 0 && posPercent <= 100) {
                                gridLines.push({ val, posPercent, isZeroLine: false });
                            }
                        }
                        gridLines.push({ val: 0, posPercent: 50, isZeroLine: true });

                        return gridLines.map((line, i) => {
                            const { val, posPercent, isZeroLine } = line;
                            
                            // Format label
                            const label = (aggregation === 'perGame' && maxY < 10) 
                                ? Math.abs(val).toFixed(1) 
                                : Math.abs(val).toFixed(0);

                            

                            return (
                                <React.Fragment key={`grid-${i}`}>
                                    {/* Grid Line */}
                                    <div style={{ 
                                        position: 'absolute', 
                                        top: `${posPercent}%`, 
                                        left: 0, 
                                        right: 0, 
                                        height: isZeroLine ? '2px' : '1px', 
                                        background: isZeroLine ? 'rgba(255,255,255,0.3)' : 'rgba(255,255,255,0.05)', 
                                        zIndex: 1,
                                        transform: 'translateY(-50%)'
                                    }}></div>
                                    
                                    {/* Y-axis Label */}
                                    <div style={{
                                        position: 'absolute',
                                        top: `${posPercent}%`,
                                        left: '-35px',
                                        width: '25px',
                                        textAlign: 'right',
                                        transform: 'translateY(-50%)',
                                        fontSize: '0.7rem',
                                        color: isZeroLine ? 'rgba(255,255,255,0.6)' : 'rgba(255,255,255,0.3)'
                                    }}>
                                        {Math.abs(val) === 0 ? '0' : label}
                                    </div>
                                </React.Fragment>
                            );
                        });
                    })()}

                    {/* Bars Container */}
                    <div style={{ 
                        display: 'flex', 
                        width: '100%', 
                        height: '100%', 
                        justifyContent: 'space-around', 
                        alignItems: 'center',
                        zIndex: 2 
                    }}>
                        {activeData.map((bucket, idx) => {
                            let tVal = 0, oVal = 0;
                            if (metric === 'goals') { tVal = bucket.teamGoals || 0; oVal = bucket.opponentGoals || 0; }
                            else if (metric === 'shotsOnTarget') { tVal = bucket.teamShots || 0; oVal = bucket.opponentShots || 0; }
                            else if (metric === 'allShots') { tVal = bucket.teamAllShots || 0; oVal = bucket.opponentAllShots || 0; }
                            else if (metric === 'boxEntries') { tVal = bucket.teamBoxEntries || 0; oVal = bucket.opponentBoxEntries || 0; }
                            
                            if (aggregation === 'perGame' && activeCount > 0) {
                                tVal = tVal / activeCount;
                                oVal = oVal / activeCount;
                            }
                            
                            // Height percentage relative to the full container (0 to 50%)
                            const maxBarHeight = 50; 
                            const tHeight = (tVal / maxY) * maxBarHeight;
                            const oHeight = (oVal / maxY) * maxBarHeight;

                            const totalVal = tVal + oVal;
                            const diffVal = tVal - oVal;
                            const formatVal = (v) => aggregation === 'perGame' ? v.toFixed(2) : v;
                            const totalStr = formatVal(totalVal);
                            const diffStr = diffVal > 0 ? `+${formatVal(diffVal)}` : formatVal(diffVal);

                            return (
                                <div key={idx} style={{ 
                                    display: 'flex', 
                                    flexDirection: 'column', 
                                    alignItems: 'center', 
                                    height: '100%', 
                                    position: 'relative',
                                    width: '40px'
                                }} title={`Team: ${formatVal(tVal)} | Opponent: ${formatVal(oVal)}`}>
                                    
                                    {/* Top Bar (Team) */}
                                    <div style={{ 
                                        flex: 1, 
                                        display: 'flex', 
                                        flexDirection: 'column-reverse', 
                                        width: '100%'
                                    }}>
                                        <div style={{ 
                                            height: `${tHeight * 2}%`, // times 2 because flex: 1 is 50% of container height
                                            width: '100%', 
                                            background: '#60a5fa', // Light blue
                                            borderTopLeftRadius: '4px',
                                            borderTopRightRadius: '4px',
                                            transition: 'height 0.5s ease',
                                            opacity: 0.9,
                                            position: 'relative'
                                        }}>
                                            {tVal > 0 && (
                                                <div style={{ position: 'absolute', top: '-18px', left: '0', right: '0', textAlign: 'center', fontSize: '0.65rem', color: 'white', fontWeight: 'bold' }}>
                                                    {formatVal(tVal)}
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    <div style={{ 
                                        position: 'absolute',
                                        top: '50%',
                                        left: '50%',
                                        transform: 'translate(-50%, -50%)',
                                        background: '#1a1f24',
                                        padding: '2px 6px',
                                        borderRadius: '10px',
                                        fontSize: '0.65rem',
                                        color: '#ffffff',
                                        fontWeight: 'bold',
                                        zIndex: 10,
                                        whiteSpace: 'nowrap',
                                        border: '1px solid rgba(255,255,255,0.1)'
                                    }}>
                                        {(() => {
                                            if (isNeutral) {
                                                return totalVal > 0 ? totalStr : '0';
                                            } else {
                                                if (totalVal === 0) return '0';
                                                let diffColor = '#ffffff';
                                                if (diffVal > 0) diffColor = '#4ade80'; // Green
                                                else if (diffVal < 0) diffColor = '#f87171'; // Red
                                                
                                                return (
                                                    <span style={{ color: diffColor }}>
                                                        {diffStr}
                                                    </span>
                                                );
                                            }
                                        })()}
                                    </div>

                                    {/* Bottom Bar (Opponent) */}
                                    <div style={{ 
                                        flex: 1, 
                                        display: 'flex', 
                                        flexDirection: 'column', 
                                        width: '100%'
                                    }}>
                                        <div style={{ 
                                            height: `${oHeight * 2}%`, // times 2 because flex: 1 is 50% of container height
                                            width: '100%', 
                                            background: '#1e3a8a', // Navy blue
                                            borderBottomLeftRadius: '4px',
                                            borderBottomRightRadius: '4px',
                                            transition: 'height 0.5s ease',
                                            opacity: 0.9,
                                            position: 'relative'
                                        }}>
                                            {oVal > 0 && (
                                                <div style={{ position: 'absolute', bottom: '-18px', left: '0', right: '0', textAlign: 'center', fontSize: '0.65rem', color: 'white', fontWeight: 'bold' }}>
                                                    {formatVal(oVal)}
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* X-axis Labels (Time Intervals) */}
                <div style={{ 
                    display: 'flex', 
                    width: '100%', 
                    justifyContent: 'space-around',
                    marginLeft: '30px', // Align with chart area
                    padding: '0 1rem',
                    marginTop: '0.5rem'
                }}>
                    {activeData.map((bucket, idx) => {
                        return (
                            <div key={`label-${idx}`} style={{
                                width: '40px',
                                textAlign: 'center',
                                fontSize: '0.7rem',
                                color: 'rgba(255,255,255,0.6)'
                            }}>
                                {bucket.interval}
                            </div>
                        );
                    })}
                </div>

                {/* Summary Box */}
                <div style={{ marginTop: '1.5rem', textAlign: 'center', fontSize: '0.85rem', color: 'var(--color-text-secondary)' }}>
                    Showing {totals.tTotal + totals.oTotal} {totalMetricLabel}, 
                    <span style={{ color: '#ffffff', fontWeight: 'bold', marginLeft: '0.25rem' }}>
                        {teamName} {totals.tTotal}-{totals.oTotal} {opponentName}
                    </span>
                </div>
            </div>
        </div>
    );
};

export default MatchMomentumChart;
