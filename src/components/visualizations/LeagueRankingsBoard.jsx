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
        if (isReversed) return a.value - b.value;
        return b.value - a.value;
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
                        <span style={{ fontWeight: 'bold', fontSize: '1rem', color: index === 0 ? 'var(--color-accent-green)' : '#fff' }}>
                            {item.formattedValue} {valueSuffix && <span style={{fontSize: '0.75rem', fontWeight: 'normal', color: 'var(--color-text-secondary)'}}>{valueSuffix}</span>}
                        </span>
                    </div>
                ))}
            </div>
        </div>
    );
};

const LeagueRankingsBoard = ({ leagueData, loadedMatches, getBadge, pdfSelections, setPdfSelections }) => {
    const [showAll, setShowAll] = useState(false);

    if (!leagueData) return null;

    const teamNames = Object.keys(leagueData).filter(t => t !== 'League Average');

    // Prepare data lists
    const fieldTiltData = teamNames.map(team => ({
        team,
        value: leagueData[team].raw.fieldTilt || 0,
        formattedValue: (leagueData[team].raw.fieldTilt || 0).toFixed(1) + '%'
    }));

    const boxEntriesData = teamNames.map(team => {
        const avg = (leagueData[team].raw.passesIntoBox || 0) + (leagueData[team].raw.touchesInBox || 0) + (leagueData[team].raw.crosses || 0) * 0.3; // Approx
        const teamMatchesCount = loadedMatches ? loadedMatches.filter(m => m.competition === 'Eliteserien' && (m.homeTeam === team || m.awayTeam === team)).length : 1;
        const total = avg * (teamMatchesCount > 0 ? teamMatchesCount : 1);
        return {
            team,
            value: total,
            formattedValue: `${Math.round(total)} (${avg.toFixed(1)})`
        };
    });

    const goalsPer100Data = teamNames.map(team => {
        const goals = leagueData[team].raw.goals || 0;
        const entries = (leagueData[team].raw.passesIntoBox || 0) + (leagueData[team].raw.touchesInBox || 0) + (leagueData[team].raw.crosses || 0) * 0.3;
        const ratio = entries > 0 ? (goals / entries) * 100 : 0;
        return {
            team,
            value: ratio,
            formattedValue: ratio.toFixed(1)
        };
    });

    return (
        <div style={{ marginTop: '0', gridColumn: '1 / -1' }}>
            
            {pdfSelections && setPdfSelections && (
                <PdfSelectionToggle 
                    id={"league-attack-rankings"}
                    title={"League Attack Rankings"}
                    phase="Global"
                    pdfSelections={pdfSelections}
                    setPdfSelections={setPdfSelections}
                />
            )}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <h2 className="section-title" style={{ margin: 0, border: 'none' }}>Team Performance Rankings</h2>
                <button 
                    onClick={() => setShowAll(!showAll)}
                    style={{ background: 'transparent', color: 'var(--color-accent-blue)', border: '1px solid var(--color-accent-blue)', padding: '0.4rem 1rem', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}
                >
                    {showAll ? 'Collapse to Top 5' : 'Show Full List'}
                </button>
            </div>
            
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.5rem' }}>
                <RankingColumn 
                    title="Field Tilt %" 
                    data={fieldTiltData} 
                    getBadge={getBadge} 
                    showAll={showAll}
                />
                <RankingColumn 
                    title="Entries into Box (Total & Avg)" 
                    data={boxEntriesData} 
                    getBadge={getBadge} 
                    showAll={showAll}
                />
                <RankingColumn 
                    title="Goals per 100 Box Entries" 
                    data={goalsPer100Data} 
                    getBadge={getBadge} 
                    showAll={showAll}
                />
            </div>
        </div>
    );
};

export default LeagueRankingsBoard;
