import React from 'react';

const StatPanel = ({ title, value, trend, details }) => {
    // Determine trend color
    const trendClass = trend === 'up' ? 'trend-up' : trend === 'down' ? 'trend-down' : '';
    const trendSymbol = trend === 'up' ? '▲' : trend === 'down' ? '▼' : '−';

    return (
        <div className="glass-panel metric-card">
            <div>
                <h4 className="metric-label">{title}</h4>
                <div className="metric-value">{value}</div>
            </div>
            {details && (
                <div className="trend-indicator ${trendClass}">
                    <span style={{ marginRight: '4px' }}>{trendSymbol}</span>
                    {details}
                </div>
            )}

            {/* Tiny chart simulation */}
            <div style={{ display: 'flex', alignItems: 'flex-end', height: '30px', gap: '4px', marginTop: '10px' }}>
                {[40, 60, 45, 70, 50, 80, 65].map((h, i) => (
                    <div key={i} style={{
                        flex: 1,
                        background: 'var(--color-accent-blue)',
                        opacity: 0.3 + (i * 0.1),
                        height: `${h}%`,
                        borderRadius: '2px'
                    }}></div>
                ))}
            </div>
        </div>
    );
};

export default StatPanel;
