import React from 'react';
import { useMatchData } from '../context/MatchDataContext';
import { leagueStandings as mockStandings } from '../data/mockData';

const badgeMap = mockStandings.reduce((acc, curr) => {
    acc[curr.team] = curr.badgeUrl;
    return acc;
}, {});

const LeagueTable = () => {
    const { derivedStandings, globalLeagueStandings } = useMatchData();
    const leagueStandings = globalLeagueStandings || derivedStandings;
    return (
        <div className="glass-panel" style={{ padding: '1rem', overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.8rem' }}>
                <thead>
                    <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.1)', textAlign: 'left', color: 'var(--color-text-secondary)' }}>
                        <th style={{ padding: '0.5rem' }}>#</th>
                        <th style={{ padding: '0.5rem' }}>Team</th>
                        <th style={{ padding: '0.5rem' }}>P</th>
                        <th style={{ padding: '0.5rem' }}>W</th>
                        <th style={{ padding: '0.5rem' }}>D</th>
                        <th style={{ padding: '0.5rem' }}>L</th>
                        <th style={{ padding: '0.5rem' }}>GD</th>
                        <th style={{ padding: '0.5rem' }}>Pts</th>
                    </tr>
                </thead>
                <tbody>
                    {leagueStandings.map((team) => (
                        <tr
                            key={team.team}
                            style={{
                                borderBottom: '1px solid rgba(255,255,255,0.05)',
                                background: 'transparent',
                                color: 'inherit'
                            }}
                        >
                            <td style={{ padding: '0.5rem', fontWeight: 'normal' }}>{team.pos}</td>
                            <td style={{ padding: '0.5rem', fontWeight: 'normal' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                    <img
                                        src={team.badgeUrl || badgeMap[team.team]}
                                        alt={`${team.team} badge`}
                                        style={{ width: '20px', height: '20px', objectFit: 'contain' }}
                                    />
                                    <span>{team.team}</span>
                                </div>
                            </td>
                            <td style={{ padding: '0.5rem' }}>{team.p}</td>
                            <td style={{ padding: '0.5rem' }}>{team.w}</td>
                            <td style={{ padding: '0.5rem' }}>{team.d}</td>
                            <td style={{ padding: '0.5rem' }}>{team.l}</td>
                            <td style={{ padding: '0.5rem' }}>{team.gd}</td>
                            <td style={{ padding: '0.5rem', fontWeight: 'bold' }}>{team.pts}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default LeagueTable;
