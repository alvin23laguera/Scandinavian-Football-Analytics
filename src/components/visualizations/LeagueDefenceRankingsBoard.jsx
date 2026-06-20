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

const RankingColumn = ({ title, data, valueSuffix, isReversed, getBadge, showAll }) => {
    // Sort data
    const sorted = [...data].sort((a, b) => {
        if (isReversed) return a.value - b.value; // Lower is better
        return b.value - a.value; // Higher is better
    });
    
    const displayData = showAll ? sorted : sorted.slice(0, 5);

    return (
        <div className="glass-panel" style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column' }}>
            <h3 style={{ fontSize: '1.1rem', margin: '0 0 1rem 0', color: '#fff', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '0.5rem' }}>{title}</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {displayData.map((item, index) => (
                    <div key={item.team} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
                            <span style={{ fontSize: '0.9rem', fontWeight: 'bold', color: index === 0 ? 'gold' : index === 1 ? 'silver' : index === 2 ? '#cd7f32' : 'var(--color-text-secondary)', width: '16px', textAlign: 'center' }}>
                                {index + 1}
                            </span>
                            <img src={getBadge(item.team)} alt={item.team} style={{ width: '22px', height: '22px', objectFit: 'contain' }} />
                            <span style={{ fontWeight: '600', fontSize: '0.9rem', color: index === 0 ? '#fff' : 'var(--color-text-secondary)' }}>
                                {getFullTeamName(item.team)}
                            </span>
                        </div>
                        <span style={{ fontWeight: 'bold', fontSize: '1rem', color: index === 0 ? 'var(--color-accent-blue)' : '#fff' }}>
                            {item.formattedValue} {valueSuffix && <span style={{fontSize: '0.75rem', fontWeight: 'normal', color: 'var(--color-text-secondary)'}}>{valueSuffix}</span>}
                        </span>
                    </div>
                ))}
            </div>
        </div>
    );
};

const LeagueDefenceRankingsBoard = ({ leagueData, getBadge, pdfSelections, setPdfSelections }) => {
    const [showAll, setShowAll] = useState(false);

    if (!leagueData) return null;

    const teamNames = Object.keys(leagueData).filter(t => t !== 'League Average');

    // 1. Box Entries Allowed (Lower is better)
    const boxEntriesData = teamNames.map(team => {
        const val = leagueData[team].raw.boxEntriesAllowed || 0;
        return {
            team,
            value: val,
            formattedValue: val.toFixed(1)
        };
    });

    // 2. Goals Allowed per 100 Opp. Possessions (Lower is better)
    const goalsPer100Data = teamNames.map(team => {
        const val = leagueData[team].raw.goalsAllowedPer100OppPoss || 0;
        return {
            team,
            value: val,
            formattedValue: val.toFixed(2)
        };
    });

    // 3. Shots on Target Allowed per Match (Lower is better)
    const shotsOnTargetAllowedData = teamNames.map(team => {
        const val = leagueData[team].raw.shotsOnTargetAllowed || 0;
        return {
            team,
            value: val,
            formattedValue: val.toFixed(1)
        };
    });

    return (
        <div style={{ marginTop: '2rem', gridColumn: '1 / -1' }}>
            
            {pdfSelections && setPdfSelections && (
                <PdfSelectionToggle 
                    id={"league-defence-rankings"}
                    title={"League Defence Rankings"}
                    phase="Global"
                    pdfSelections={pdfSelections}
                    setPdfSelections={setPdfSelections}
                />
            )}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <h2 className="section-title" style={{ margin: 0, border: 'none' }}>Defensive Performance Rankings</h2>
                <button 
                    onClick={() => setShowAll(!showAll)}
                    style={{ background: 'transparent', color: 'var(--color-accent-blue)', border: '1px solid var(--color-accent-blue)', padding: '0.4rem 1rem', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}
                >
                    {showAll ? 'Collapse to Top 5' : 'Show Full List'}
                </button>
            </div>
            
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.5rem' }}>
                <RankingColumn 
                    title="Box Entries Allowed" 
                    data={boxEntriesData} 
                    getBadge={getBadge} 
                    isReversed={true}
                    showAll={showAll}
                />
                <RankingColumn 
                    title="Goals Allowed per 100 Opp. Poss." 
                    data={goalsPer100Data} 
                    getBadge={getBadge} 
                    isReversed={true}
                    showAll={showAll}
                />
                <RankingColumn 
                    title="Shots on Target Allowed" 
                    data={shotsOnTargetAllowedData} 
                    getBadge={getBadge} 
                    isReversed={true}
                    showAll={showAll}
                />
            </div>
        </div>
    );
};

export default LeagueDefenceRankingsBoard;
