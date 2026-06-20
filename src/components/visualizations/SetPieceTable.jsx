import React, { useState, useMemo } from 'react';

const TYPE_CONFIG = [
    { key: 'corner', label: 'Corner Kicks' },
    { key: 'freeKick', label: 'Free Kicks' },
    { key: 'throwIn', label: 'Throw-Ins' },
    { key: 'penalty', label: 'Penalties' }
];

const FULL_TEAM_NAMES = {
    'Bodø/Glimt': 'FK Bodø/Glimt',
    'Bod/Glimt': 'FK Bodø/Glimt',
    'Brann': 'SK Brann',
    'Molde': 'Molde FK',
    'Viking': 'Viking FK',
    'Rosenborg': 'Rosenborg BK',
    'Tromsø': 'Tromsø IL',
    'Troms': 'Tromsø IL',
    'Lillestrøm': 'Lillestrøm SK',
    'Lillestrm': 'Lillestrøm SK',
    'Vålerenga': 'Vålerenga Fotball',
    'VǾlerenga': 'Vålerenga Fotball',
    'Sarpsborg 08': 'Sarpsborg 08 FF',
    'HamKam': 'Hamarkameratene',
    'Odd': 'Odds BK',
    'Aalesund': 'Aalesunds FK',
    'Sandefjord': 'Sandefjord Fotball',
    'Strømsgodset': 'Strømsgodset IF',
    'Strmsgodset': 'Strømsgodset IF',
    'Haugesund': 'FK Haugesund',
    'Stabæk': 'Stabæk Fotball',
    'Stabk': 'Stabæk Fotball',
    'KFUM': 'KFUM Oslo'
};

const SetPieceTable = ({ data, getBadge }) => {
    const [hoveredRow, setHoveredRow] = useState(null);
    const [mode, setMode] = useState('points'); // 'points' or 'goals'
    const [activeTypes, setActiveTypes] = useState({
        corner: true,
        freeKick: true,
        throwIn: true,
        penalty: true
    });

    const toggleType = (type) => {
        setActiveTypes(prev => ({
            ...prev,
            [type]: !prev[type]
        }));
    };

    // Calculate dynamic standings from raw match data based on activeTypes
    const standings = useMemo(() => {
        if (!data || data.length === 0) return [];
        
        // If data is the old mock array, return it directly to prevent crashes
        if (data[0] && typeof data[0].homeGoals !== 'object' && data[0].team) {
             return data;
        }

        const tableMap = {};
        const getTeamRow = (team) => {
            if (!tableMap[team]) {
                tableMap[team] = { 
                    team, mp: 0, w: 0, d: 0, l: 0, gf: 0, ga: 0, gd: 0, pts: 0,
                    goalsByType: {
                        corner: { gf: 0, ga: 0 },
                        freeKick: { gf: 0, ga: 0 },
                        throwIn: { gf: 0, ga: 0 },
                        penalty: { gf: 0, ga: 0 }
                    }
                };
            }
            return tableMap[team];
        };

        data.forEach(match => {
            if (!match.homeTeam || !match.awayTeam) return;

            const homeRow = getTeamRow(match.homeTeam);
            const awayRow = getTeamRow(match.awayTeam);
            
            homeRow.mp++; 
            awayRow.mp++;

            let mHomeGoals = 0;
            let mAwayGoals = 0;

            // Tally goals based on active filters
            Object.keys(activeTypes).forEach(type => {
                if (!match.homeGoals || !match.awayGoals) return;

                const hGoals = match.homeGoals[type] || 0;
                const aGoals = match.awayGoals[type] || 0;

                // Always track the breakdown for the Goals view, regardless of if it's active in the general tally
                // Wait, if it's not active, we probably still track it, but maybe not display it?
                // Actually, let's tally breakdown only if we want to display it. But we only display active ones anyway.
                homeRow.goalsByType[type].gf += hGoals;
                homeRow.goalsByType[type].ga += aGoals;
                awayRow.goalsByType[type].gf += aGoals;
                awayRow.goalsByType[type].ga += hGoals;

                if (activeTypes[type]) {
                    mHomeGoals += hGoals;
                    mAwayGoals += aGoals;
                }
            });

            homeRow.gf += mHomeGoals;
            homeRow.ga += mAwayGoals;
            awayRow.gf += mAwayGoals;
            awayRow.ga += mHomeGoals;

            if (mHomeGoals > mAwayGoals) { homeRow.w++; homeRow.pts += 3; awayRow.l++; }
            else if (mHomeGoals < mAwayGoals) { awayRow.w++; awayRow.pts += 3; homeRow.l++; }
            else { homeRow.d++; homeRow.pts += 1; awayRow.d++; awayRow.pts += 1; }
        });

        Object.values(tableMap).forEach(row => row.gd = row.gf - row.ga);
        
        return Object.values(tableMap).sort((a, b) => {
            if (mode === 'points') {
                if (b.pts !== a.pts) return b.pts - a.pts;
                if (b.gd !== a.gd) return b.gd - a.gd;
                return b.gf - a.gf;
            } else {
                if (b.gd !== a.gd) return b.gd - a.gd;
                return b.gf - a.gf;
            }
        });
    }, [data, activeTypes, mode]);

    if (!data || data.length === 0) {
        return <div style={{ color: 'var(--color-text-secondary)', padding: '1rem' }}>No set-piece data available.</div>;
    }

    const formatGD = (val) => {
        if (val > 0) return `+${val}`;
        if (val < 0) return val;
        return '0';
    };

    const getGDColor = (val) => {
        if (val > 0) return '#4ade80';
        if (val < 0) return '#f87171';
        return 'var(--color-text-secondary)';
    };

    return (
        <div style={{ width: '100%', overflowX: 'auto', background: 'var(--color-bg-panel)', borderRadius: '12px', padding: '1.5rem', boxShadow: '0 8px 16px rgba(0,0,0,0.2)' }}>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
                {/* Multi-Selector Filters */}
                <div style={{ display: 'flex', gap: '0.5rem', background: 'rgba(0,0,0,0.2)', padding: '6px', borderRadius: '10px' }}>
                    {TYPE_CONFIG.map(type => (
                        <button
                            key={type.key}
                            onClick={() => toggleType(type.key)}
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '6px',
                                padding: '6px 12px',
                                background: activeTypes[type.key] ? 'rgba(255,255,255,0.1)' : 'transparent',
                                color: activeTypes[type.key] ? '#fff' : 'var(--color-text-secondary)',
                                border: '1px solid',
                                borderColor: activeTypes[type.key] ? 'rgba(255,255,255,0.2)' : 'transparent',
                                borderRadius: '6px',
                                cursor: 'pointer',
                                fontSize: '0.85rem',
                                fontWeight: activeTypes[type.key] ? 'bold' : 'normal',
                                transition: 'all 0.2s ease',
                                opacity: activeTypes[type.key] ? 1 : 0.6
                            }}
                        >
                            <span>{type.label}</span>
                        </button>
                    ))}
                </div>

                {/* Mode Toggle */}
                <div style={{ display: 'flex', background: 'rgba(0,0,0,0.3)', borderRadius: '8px', padding: '4px' }}>
                    <button 
                        onClick={() => setMode('points')}
                        style={{ 
                            padding: '6px 12px', 
                            background: mode === 'points' ? 'var(--color-accent-blue)' : 'transparent',
                            color: mode === 'points' ? '#000' : 'var(--color-text-secondary)',
                            border: 'none',
                            borderRadius: '6px',
                            cursor: 'pointer',
                            fontWeight: 'bold',
                            fontSize: '0.8rem',
                            transition: 'all 0.2s ease'
                        }}
                    >
                        Match Points
                    </button>
                    <button 
                        onClick={() => setMode('goals')}
                        style={{ 
                            padding: '6px 12px', 
                            background: mode === 'goals' ? 'var(--color-accent-blue)' : 'transparent',
                            color: mode === 'goals' ? '#000' : 'var(--color-text-secondary)',
                            border: 'none',
                            borderRadius: '6px',
                            cursor: 'pointer',
                            fontWeight: 'bold',
                            fontSize: '0.8rem',
                            transition: 'all 0.2s ease'
                        }}
                    >
                        Goals Only
                    </button>
                </div>
            </div>

            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'center', fontSize: '0.9rem' }}>
                <thead>
                    <tr style={{ borderBottom: '2px solid rgba(255,255,255,0.1)', color: 'var(--color-text-secondary)', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                        <th style={{ padding: '0.8rem 0.5rem', width: '40px' }}>#</th>
                        <th style={{ padding: '0.8rem 1rem', textAlign: 'left' }}>Club</th>
                        <th style={{ padding: '0.8rem 0.5rem' }}>MP</th>
                        
                        {mode === 'points' && (
                            <>
                                <th style={{ padding: '0.8rem 0.5rem' }}>W</th>
                                <th style={{ padding: '0.8rem 0.5rem' }}>D</th>
                                <th style={{ padding: '0.8rem 0.5rem' }}>L</th>
                                <th style={{ padding: '0.8rem 0.5rem' }}>GF</th>
                                <th style={{ padding: '0.8rem 0.5rem' }}>GA</th>
                            </>
                        )}

                        {mode === 'goals' && TYPE_CONFIG.filter(t => activeTypes[t.key]).map(type => (
                            <th key={type.key} style={{ padding: '0.8rem 0.5rem' }}>
                                {type.label}
                            </th>
                        ))}

                        <th style={{ padding: '0.8rem 0.5rem', fontWeight: mode === 'goals' ? 'bold' : 'normal', color: mode === 'goals' ? 'var(--color-text-primary)' : 'var(--color-text-secondary)' }}>Total GD</th>
                        
                        {mode === 'points' && (
                            <th style={{ padding: '0.8rem 0.5rem', fontWeight: 'bold', color: 'var(--color-text-primary)' }}>Pts</th>
                        )}
                    </tr>
                </thead>
                <tbody>
                    {standings.map((team, index) => {
                        const isHovered = hoveredRow === index;
                        const rank = index + 1;
                        let rankColor = 'transparent';
                        let rankText = 'var(--color-text-secondary)';

                        if (rank <= 3) {
                            rankColor = 'rgba(74, 222, 128, 0.2)'; 
                            rankText = '#4ade80';
                        } else if (rank >= standings.length - 2 && standings.length > 4) {
                            rankColor = 'rgba(248, 113, 113, 0.2)'; 
                            rankText = '#f87171';
                        }

                        return (
                            <tr 
                                key={team.team}
                                onMouseEnter={() => setHoveredRow(index)}
                                onMouseLeave={() => setHoveredRow(null)}
                                style={{ 
                                    borderBottom: '1px solid rgba(255,255,255,0.05)',
                                    background: isHovered ? 'rgba(255,255,255,0.05)' : 'transparent',
                                    transition: 'background 0.2s ease',
                                    cursor: 'default'
                                }}
                            >
                                <td style={{ padding: '0.6rem 0.5rem', fontWeight: 'bold', color: rankText, background: isHovered ? rankColor : 'transparent', transition: 'background 0.2s ease' }}>
                                    {rank}
                                </td>
                                <td style={{ padding: '0.6rem 1rem', textAlign: 'left', display: 'flex', alignItems: 'center', gap: '10px', fontWeight: 'bold' }}>
                                    {getBadge && getBadge(team.team) ? (
                                        <img src={getBadge(team.team)} alt="" style={{ width: '20px', height: '20px', objectFit: 'contain' }} />
                                    ) : (
                                        <div style={{ width: '20px', height: '20px', borderRadius: '50%', background: 'rgba(255,255,255,0.1)' }}></div>
                                    )}
                                    <span style={{ color: isHovered ? 'var(--color-accent-blue)' : 'var(--color-text-primary)', transition: 'color 0.2s ease' }}>
                                        {FULL_TEAM_NAMES[team.team] || team.team}
                                    </span>
                                </td>
                                <td style={{ padding: '0.6rem 0.5rem', color: 'var(--color-text-secondary)' }}>{team.mp}</td>
                                
                                {mode === 'points' && (
                                    <>
                                        <td style={{ padding: '0.6rem 0.5rem', color: '#fff' }}>{team.w}</td>
                                        <td style={{ padding: '0.6rem 0.5rem', color: '#fff' }}>{team.d}</td>
                                        <td style={{ padding: '0.6rem 0.5rem', color: '#fff' }}>{team.l}</td>
                                        <td style={{ padding: '0.6rem 0.5rem', color: '#4ade80' }}>{team.gf}</td>
                                        <td style={{ padding: '0.6rem 0.5rem', color: '#f87171' }}>{team.ga}</td>
                                    </>
                                )}

                                {mode === 'goals' && team.goalsByType && TYPE_CONFIG.filter(t => activeTypes[t.key]).map(type => {
                                    const typeStats = team.goalsByType[type.key];
                                    const typeGd = typeStats.gf - typeStats.ga;
                                    return (
                                        <td key={type.key} style={{ padding: '0.6rem 0.5rem', whiteSpace: 'nowrap' }}>
                                            <span style={{ color: '#fff', marginRight: '6px' }}>
                                                {typeStats.gf}-{typeStats.ga}
                                            </span>
                                            <span style={{ color: 'rgba(255,255,255,0.2)', marginRight: '6px' }}>|</span>
                                            <span style={{ color: getGDColor(typeGd), fontWeight: 'bold' }}>
                                                {formatGD(typeGd)}
                                            </span>
                                        </td>
                                    );
                                })}

                                <td style={{ padding: '0.6rem 0.5rem', color: getGDColor(team.gd), fontWeight: mode === 'goals' ? 'bold' : 'normal' }}>
                                    {formatGD(team.gd)}
                                </td>
                                
                                {mode === 'points' && (
                                    <td style={{ padding: '0.6rem 0.5rem', fontWeight: 'bold', fontSize: '1.05rem', color: 'var(--color-accent-blue)' }}>
                                        {team.pts}
                                    </td>
                                )}
                            </tr>
                        );
                    })}
                </tbody>
            </table>
        </div>
    );
};

export default SetPieceTable;
