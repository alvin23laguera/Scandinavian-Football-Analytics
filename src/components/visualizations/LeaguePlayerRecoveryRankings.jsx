import React from 'react';
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

const RankingColumn = ({ title, data, valueKey, getBadge, showAll }) => {
    // Sort data: Higher is better for recoveries
    const sorted = [...data]
        .sort((a, b) => b[valueKey] - a[valueKey])
        .filter(p => p[valueKey] > 0); // Only show players with > 0 recoveries

    const displayCount = showAll ? 20 : 10;
    const displayData = sorted.slice(0, displayCount);

    return (
        <div style={{ flex: 1, minWidth: '250px' }}>
            <h4 style={{ color: 'var(--color-text-secondary)', marginBottom: '1rem', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '0.5rem' }}>
                {title}
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {displayData.map((item, index) => {
                    const fullName = getFullTeamName(item.team);
                    const badge = getBadge ? getBadge(fullName) : null;
                    
                    return (
                        <div key={`${item.player}-${item.team}-${index}`} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.35rem 0.5rem', background: 'rgba(255,255,255,0.02)', borderRadius: '4px', fontSize: '0.85rem' }}>
                            <div style={{ color: 'var(--color-text-secondary)', fontWeight: 'bold', width: '20px' }}>
                                {index + 1}.
                            </div>
                            {badge && (
                                <img 
                                    src={badge} 
                                    alt={item.team} 
                                    style={{ width: '20px', height: '20px', objectFit: 'contain' }}
                                />
                            )}
                            <div style={{ flex: 1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                <span style={{ color: 'var(--color-text-primary)' }}>{item.player}</span>
                            </div>
                            <div style={{ fontWeight: 'bold', color: 'var(--color-accent-blue)', fontSize: '0.9rem' }}>
                                {item[valueKey]}
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

const LeaguePlayerRecoveryRankings = ({ stats, getBadge, pdfSelections, setPdfSelections }) => {
    if (!stats || stats.length === 0) return null;

    return (
        <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
            
            {pdfSelections && setPdfSelections && (
                <PdfSelectionToggle 
                    id={"league-recovery-rankings"}
                    title={"League Player Recoveries"}
                    phase="Global"
                    pdfSelections={pdfSelections}
                    setPdfSelections={setPdfSelections}
                />
            )}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <h3 className="section-title" style={{ margin: 0, border: 'none' }}>Player Defensive Leaders</h3>
            </div>
            
            <div style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap', flex: 1 }}>
                <RankingColumn 
                    title="Total Recoveries" 
                    data={stats} 
                    valueKey="recoveries"
                    getBadge={getBadge}
                    showAll={false}
                />
                <RankingColumn 
                    title="Shots Blocked" 
                    data={stats} 
                    valueKey="blockedShots"
                    getBadge={getBadge}
                    showAll={false}
                />
            </div>
        </div>
    );
};

export default LeaguePlayerRecoveryRankings;
