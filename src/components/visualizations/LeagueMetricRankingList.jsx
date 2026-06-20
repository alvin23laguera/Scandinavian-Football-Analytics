import React, { useState } from 'react';
import PdfSelectionToggle from '../pdf/PdfSelectionToggle';

const FULL_TEAM_NAMES = {
    'Tromsø': 'Tromsø IL',
    'Tromsø IL': 'Tromsø IL',
    'Bodø/Glimt': 'FK Bodø/Glimt',
    'Rosenborg': 'Rosenborg BK',
    'Viking': 'Viking FK',
    'Lillestrøm': 'Lillestrøm SK',
    'Molde': 'Molde FK',
    'Brann': 'SK Brann',
    'HamKam': 'HamKam Fotball',
    'Sandefjord': 'Sandefjord Fotball',
    'Kristiansund': 'Kristiansund BK',
    'KFUM': 'KFUM Oslo',
    'Vålerenga': 'Vålerenga Fotball',
    'Fredrikstad': 'Fredrikstad FK',
    'Sarpsborg 08': 'Sarpsborg 08 FF',
    'Start': 'IK Start',
    'Aalesund': 'Aalesunds FK',
    'Odd': 'Odds BK',
    'Strømsgodset': 'Strømsgodset IF',
    'Haugesund': 'FK Haugesund'
};

const getFullTeamName = (shortName) => FULL_TEAM_NAMES[shortName] || shortName;

const LeagueMetricRankingList = ({ leagueData, metricKey, title, getBadge, isLowerBetter = true, formatValue = (v) => v.toFixed(2), defaultCount = 8, pdfSelections, setPdfSelections }) => {
    const [showAll, setShowAll] = useState(false);

    if (!leagueData) return null;

    // Filter out 'League Average'
    const validTeams = Object.keys(leagueData).filter(t => t !== 'League Average');
    
    // Sort data
    const sorted = validTeams
        .map(team => ({
            team,
            value: leagueData[team]?.raw?.[metricKey] || 0
        }))
        .filter(item => item.value > 0 || !isLowerBetter) // Generally want to exclude 0s if they mean missing data
        .sort((a, b) => isLowerBetter ? a.value - b.value : b.value - a.value);

    const displayCount = showAll ? sorted.length : defaultCount;
    const displayData = sorted.slice(0, displayCount);

    return (
        <div style={{ display: 'flex', flexDirection: 'column', height: '100%', paddingTop: '1.5rem', paddingBottom: '0.5rem' }}>
            
            {pdfSelections && setPdfSelections && (
                <PdfSelectionToggle 
                    id={`league-metric-${metricKey}`}
                    title={title}
                    phase="Global"
                    pdfSelections={pdfSelections}
                    setPdfSelections={setPdfSelections}
                />
            )}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', paddingLeft: '0.5rem', paddingRight: '0.5rem' }}>
                <h3 className="section-title" style={{ margin: 0, border: 'none' }}>{title}</h3>
                <button 
                    onClick={() => setShowAll(!showAll)}
                    style={{ background: 'transparent', color: 'var(--color-accent-blue)', border: '1px solid var(--color-accent-blue)', padding: '0.3rem 0.8rem', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold', fontSize: '0.8rem' }}
                >
                    {showAll ? `Top ${defaultCount}` : 'Show All'}
                </button>
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', flex: 1, overflowY: 'auto' }}>
                {displayData.map((item, index) => {
                    const fullName = getFullTeamName(item.team);
                    const badge = getBadge ? getBadge(fullName) : null;
                    
                    return (
                        <div key={`${item.team}-${index}`} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.4rem 0.5rem', background: 'rgba(255,255,255,0.02)', borderRadius: '4px', fontSize: '0.85rem' }}>
                            <div style={{ color: 'var(--color-text-secondary)', fontWeight: 'bold', width: '20px' }}>
                                {index + 1}.
                            </div>
                            {badge && (
                                <img 
                                    src={badge} 
                                    alt={item.team} 
                                    style={{ width: '24px', height: '24px', objectFit: 'contain' }}
                                />
                            )}
                            <div style={{ flex: 1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                <span style={{ color: 'var(--color-text-primary)' }}>{item.team}</span>
                            </div>
                            <div style={{ fontWeight: 'bold', color: 'var(--color-accent-red)', fontSize: '0.95rem' }}>
                                {formatValue(item.value)}
                            </div>
                        </div>
                    );
                })}
                {sorted.length === 0 && (
                    <div style={{ color: 'var(--color-text-secondary)', fontStyle: 'italic', padding: '0.5rem' }}>
                        No data available
                    </div>
                )}
            </div>
        </div>
    );
};

export default LeagueMetricRankingList;
