import React, { useState, useCallback, useRef, useEffect } from 'react';
import { processOptaToCSV, downloadCSV, processEventsToCSV } from '../utils/jsonToCsv';
import { useMatchData } from '../context/MatchDataContext';
import { leagueStandings } from '../data/mockData';

const NM_CUPEN_ROUNDS = [
    { no: 'Åttedelsfinaler', en: 'Round of 16', value: 'Round of 16' },
    { no: 'Kvartfinaler', en: 'Quarter-Finals', value: 'Quarter-Finals' },
    { no: 'Semifinaler', en: 'Semi-Finals', value: 'Semi-Finals' },
    { no: 'Finale', en: 'Final', value: 'Final' }
];

const NMCupenRoundSelect = ({ value, onChange }) => {
    const [isOpen, setIsOpen] = useState(false);
    const wrapperRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const currentOpt = NM_CUPEN_ROUNDS.find(r => r.value === value) || NM_CUPEN_ROUNDS.find(r => r.no === value);

    return (
        <div ref={wrapperRef} style={{ position: 'relative', width: '100%' }}>
            <div 
                onClick={() => setIsOpen(!isOpen)}
                style={{ 
                    width: '100%', padding: '0.5rem', borderRadius: '4px', 
                    border: '1px solid rgba(255,255,255,0.2)', 
                    background: 'rgba(0,0,0,0.2)', color: 'white',
                    cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                    minHeight: '38px'
                }}
            >
                {currentOpt ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                        <span style={{ fontSize: '0.9rem', lineHeight: '1' }}>{currentOpt.no}</span>
                    </div>
                ) : (
                    <span style={{ color: 'var(--color-text-secondary)', fontSize: '0.9rem' }}>Select round...</span>
                )}
                <span style={{ fontSize: '0.7rem', color: 'var(--color-text-secondary)' }}>{isOpen ? '▲' : '▼'}</span>
            </div>

            {isOpen && (
                <div style={{ 
                    position: 'absolute', top: '100%', left: 0, right: 0, marginTop: '4px',
                    background: 'rgba(15, 23, 42, 0.95)', border: '1px solid rgba(255,255,255,0.2)', 
                    borderRadius: '4px', zIndex: 50, boxShadow: '0 8px 16px rgba(0,0,0,0.8)',
                    backdropFilter: 'blur(8px)', overflow: 'hidden'
                }}>
                    {NM_CUPEN_ROUNDS.map(opt => (
                        <div 
                            key={opt.value}
                            onClick={() => {
                                onChange(opt.value);
                                setIsOpen(false);
                            }}
                            onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.1)'}
                            onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                            style={{ 
                                padding: '0.5rem 1rem', cursor: 'pointer', borderBottom: '1px solid rgba(255,255,255,0.05)',
                                display: 'flex', flexDirection: 'column', gap: '2px', transition: 'background 0.2s'
                            }}
                        >
                            <span style={{ color: 'white', fontSize: '0.9rem', fontWeight: 'bold' }}>{opt.no}</span>
                            <span style={{ color: 'var(--color-accent-blue)', fontSize: '0.75rem' }}>{opt.en}</span>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

const EUROPE_ROUNDS = [
    { no: 'Kvalifisering', en: 'Qualifying Round', value: 'Kvalifisering', type: 'qualifying' },
    { no: 'Ligafase', en: 'League Phase', value: 'Ligafase', type: 'league' },
    { no: 'Play-off', en: 'Play-Off', value: 'Play-off', type: 'legs' },
    { no: 'Åttedelsfinaler', en: 'Round of 16', value: 'Åttedelsfinaler', type: 'legs' },
    { no: 'Kvartfinaler', en: 'Quarter-Finals', value: 'Kvartfinaler', type: 'legs' },
    { no: 'Semifinaler', en: 'Semi-Finals', value: 'Semifinaler', type: 'legs' },
    { no: 'Finale', en: 'Final', value: 'Finale', type: 'none' }
];

const LEAGUE_MATCHDAYS = [1, 2, 3, 4, 5, 6, 7, 8].map(n => ({
    no: `Kampdag ${n}`, en: `Matchday ${n}`, value: `Kampdag ${n}`
}));

const LEGS = [
    { no: '1. kamp', en: '1st leg', value: '1. kamp' },
    { no: '2. kamp', en: '2nd leg', value: '2. kamp' }
];

const EuropeRoundSelect = ({ round, subRound, onRoundChange, onSubRoundChange }) => {
    const [isRoundOpen, setIsRoundOpen] = useState(false);
    const [isSubOpen, setIsSubOpen] = useState(false);
    const roundRef = useRef(null);
    const subRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (roundRef.current && !roundRef.current.contains(event.target)) setIsRoundOpen(false);
            if (subRef.current && !subRef.current.contains(event.target)) setIsSubOpen(false);
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const currentRound = EUROPE_ROUNDS.find(r => r.value === round);
    
    let subRoundUI = null;
    if (currentRound) {
        if (currentRound.type === 'qualifying') {
            subRoundUI = (
                <input 
                    type="text" 
                    placeholder="e.g. 2"
                    value={subRound}
                    onChange={(e) => onSubRoundChange(e.target.value)}
                    style={{ width: '100%', padding: '0.5rem', borderRadius: '4px', border: '1px solid rgba(255,255,255,0.2)', background: 'rgba(0,0,0,0.2)', color: 'white', marginTop: '0.5rem' }}
                />
            );
        } else if (currentRound.type === 'league') {
            const currentSub = LEAGUE_MATCHDAYS.find(r => r.value === subRound);
            subRoundUI = (
                <div ref={subRef} style={{ position: 'relative', width: '100%', marginTop: '0.5rem' }}>
                    <div onClick={() => setIsSubOpen(!isSubOpen)} style={{ width: '100%', padding: '0.5rem', borderRadius: '4px', border: '1px solid rgba(255,255,255,0.2)', background: 'rgba(0,0,0,0.2)', color: 'white', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        {currentSub ? (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                                <span style={{ fontSize: '0.85rem' }}>{currentSub.no}</span>
                            </div>
                        ) : <span style={{ color: 'var(--color-text-secondary)', fontSize: '0.85rem' }}>Select matchday...</span>}
                        <span style={{ fontSize: '0.7rem', color: 'var(--color-text-secondary)' }}>{isSubOpen ? '▲' : '▼'}</span>
                    </div>
                    {isSubOpen && (
                        <div style={{ position: 'absolute', top: '100%', left: 0, right: 0, marginTop: '4px', background: 'rgba(15, 23, 42, 0.95)', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '4px', zIndex: 50, maxHeight: '150px', overflowY: 'auto' }}>
                            {LEAGUE_MATCHDAYS.map(opt => (
                                <div key={opt.value} onClick={() => { onSubRoundChange(opt.value); setIsSubOpen(false); }} onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.1)'} onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'} style={{ padding: '0.4rem 0.8rem', cursor: 'pointer', borderBottom: '1px solid rgba(255,255,255,0.05)', display: 'flex', flexDirection: 'column' }}>
                                    <span style={{ color: 'white', fontSize: '0.85rem', fontWeight: 'bold' }}>{opt.no}</span>
                                    <span style={{ color: 'var(--color-accent-blue)', fontSize: '0.7rem' }}>{opt.en}</span>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            );
        } else if (currentRound.type === 'legs') {
            const currentSub = LEGS.find(r => r.value === subRound);
            subRoundUI = (
                <div ref={subRef} style={{ position: 'relative', width: '100%', marginTop: '0.5rem' }}>
                    <div onClick={() => setIsSubOpen(!isSubOpen)} style={{ width: '100%', padding: '0.5rem', borderRadius: '4px', border: '1px solid rgba(255,255,255,0.2)', background: 'rgba(0,0,0,0.2)', color: 'white', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        {currentSub ? (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                                <span style={{ fontSize: '0.85rem' }}>{currentSub.no}</span>
                            </div>
                        ) : <span style={{ color: 'var(--color-text-secondary)', fontSize: '0.85rem' }}>Select leg...</span>}
                        <span style={{ fontSize: '0.7rem', color: 'var(--color-text-secondary)' }}>{isSubOpen ? '▲' : '▼'}</span>
                    </div>
                    {isSubOpen && (
                        <div style={{ position: 'absolute', top: '100%', left: 0, right: 0, marginTop: '4px', background: 'rgba(15, 23, 42, 0.95)', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '4px', zIndex: 50 }}>
                            {LEGS.map(opt => (
                                <div key={opt.value} onClick={() => { onSubRoundChange(opt.value); setIsSubOpen(false); }} onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.1)'} onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'} style={{ padding: '0.4rem 0.8rem', cursor: 'pointer', borderBottom: '1px solid rgba(255,255,255,0.05)', display: 'flex', flexDirection: 'column' }}>
                                    <span style={{ color: 'white', fontSize: '0.85rem', fontWeight: 'bold' }}>{opt.no}</span>
                                    <span style={{ color: 'var(--color-accent-blue)', fontSize: '0.7rem' }}>{opt.en}</span>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            );
        }
    }

    return (
        <div style={{ width: '100%' }}>
            <div ref={roundRef} style={{ position: 'relative', width: '100%' }}>
                <div onClick={() => setIsRoundOpen(!isRoundOpen)} style={{ width: '100%', padding: '0.5rem', borderRadius: '4px', border: '1px solid rgba(255,255,255,0.2)', background: 'rgba(0,0,0,0.2)', color: 'white', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center', minHeight: '38px' }}>
                    {currentRound ? (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                            <span style={{ fontSize: '0.9rem', lineHeight: '1' }}>{currentRound.no}</span>
                        </div>
                    ) : <span style={{ color: 'var(--color-text-secondary)', fontSize: '0.9rem' }}>Select round...</span>}
                    <span style={{ fontSize: '0.7rem', color: 'var(--color-text-secondary)' }}>{isRoundOpen ? '▲' : '▼'}</span>
                </div>
                {isRoundOpen && (
                    <div className="custom-scrollbar" style={{ position: 'absolute', top: '100%', left: 0, right: 0, marginTop: '4px', background: 'rgba(15, 23, 42, 0.95)', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '4px', zIndex: 51, maxHeight: '200px', overflowY: 'auto', boxShadow: '0 8px 16px rgba(0,0,0,0.8)', backdropFilter: 'blur(8px)' }}>
                        {EUROPE_ROUNDS.map(opt => (
                            <div key={opt.value} onClick={() => { onRoundChange(opt.value); onSubRoundChange(''); setIsRoundOpen(false); }} onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.1)'} onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'} style={{ padding: '0.5rem 1rem', cursor: 'pointer', borderBottom: '1px solid rgba(255,255,255,0.05)', display: 'flex', flexDirection: 'column', gap: '2px' }}>
                                <span style={{ color: 'white', fontSize: '0.9rem', fontWeight: 'bold' }}>{opt.no}</span>
                                <span style={{ color: 'var(--color-accent-blue)', fontSize: '0.75rem' }}>{opt.en}</span>
                            </div>
                        ))}
                    </div>
                )}
            </div>
            {subRoundUI}
        </div>
    );
};

const TeamAutocompleteInput = ({ value, onChange, placeholder }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [filteredOptions, setFilteredOptions] = useState(leagueStandings);
    const wrapperRef = useRef(null);
    const inputRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleInputChange = (e) => {
        const val = e.target.value;
        onChange(val);
        setFilteredOptions(
            leagueStandings.filter(t => t.team.toLowerCase().includes(val.toLowerCase()))
        );
        setIsOpen(true);
    };

    return (
        <div ref={wrapperRef} style={{ position: 'relative', width: '100%' }}>
            <input 
                ref={inputRef}
                type="text" 
                placeholder={placeholder}
                value={value} 
                onChange={handleInputChange}
                onFocus={() => {
                    setFilteredOptions(leagueStandings.filter(t => t.team.toLowerCase().includes(value.toLowerCase())));
                    setIsOpen(true);
                }}
                style={{ width: '100%', padding: '0.5rem', borderRadius: '4px', border: '1px solid rgba(255,255,255,0.2)', background: 'rgba(0,0,0,0.2)', color: 'white' }}
            />
            {isOpen && (
                <div className="custom-scrollbar" style={{ 
                    position: 'absolute', 
                    top: '100%', 
                    left: 0, 
                    right: 0, 
                    marginTop: '4px',
                    background: 'rgba(15, 23, 42, 0.95)', 
                    border: '1px solid rgba(255,255,255,0.2)', 
                    borderRadius: '4px', 
                    maxHeight: '220px', 
                    overflowY: 'auto', 
                    zIndex: 50,
                    boxShadow: '0 8px 16px rgba(0,0,0,0.8)',
                    backdropFilter: 'blur(8px)'
                }}>
                    {filteredOptions.length > 0 ? (
                        filteredOptions.map(opt => (
                            <div 
                                key={opt.team}
                                onClick={() => {
                                    onChange(opt.team);
                                    setIsOpen(false);
                                }}
                                onMouseEnter={(e) => e.target.style.background = 'rgba(255,255,255,0.1)'}
                                onMouseLeave={(e) => e.target.style.background = 'transparent'}
                                style={{ padding: '0.6rem 1rem', cursor: 'pointer', color: 'white', fontSize: '0.9rem', transition: 'background 0.2s', borderBottom: '1px solid rgba(255,255,255,0.05)' }}
                            >
                                {opt.team}
                            </div>
                        ))
                    ) : (
                        <div style={{ padding: '0.8rem 1rem', color: 'var(--color-text-secondary)', fontSize: '0.85rem', fontStyle: 'italic', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                            No Eliteserien teams found matching "{value}"
                        </div>
                    )}

                    <div 
                        onClick={() => {
                            setIsOpen(false);
                            inputRef.current?.focus();
                        }}
                        onMouseEnter={(e) => e.target.style.background = 'rgba(56, 189, 248, 0.1)'}
                        onMouseLeave={(e) => e.target.style.background = 'transparent'}
                        style={{ 
                            padding: '0.8rem 1rem', cursor: 'pointer', color: 'var(--color-accent-blue)', 
                            fontSize: '0.85rem', fontWeight: 'bold', transition: 'background 0.2s'
                        }}
                    >
                        ✎ Proceed with manually typed opponent
                    </div>
                </div>
            )}
        </div>
    );
};

const DataHub = () => {
    const { saveNewMatch, loadedMatches, deleteStoredMatch, fetchMatchEvents } = useMatchData();
    const [activeTab, setActiveTab] = useState('import');
    const [logs, setLogs] = useState([]);
    const [isDragging, setIsDragging] = useState(false);
    const [stagedFiles, setStagedFiles] = useState([]);
    const [expandedGroups, setExpandedGroups] = useState({});
    
    // For editing stored matches
    const [editingMatchId, setEditingMatchId] = useState(null);
    const [editHomeScore, setEditHomeScore] = useState('');
    const [editAwayScore, setEditAwayScore] = useState('');

    const addLog = (msg, type = 'info') => {
        setLogs(prev => [...prev, { time: new Date().toLocaleTimeString(), msg, type }]);
    };

    const handleFileUpload = async (file) => {
        addLog(`Reading file: ${file.name}...`);
        try {
            const text = await file.text();
            addLog(`Parsing JSON events from ${file.name}...`);
            
            let jsonStr = text.trim();
            const startIndex = jsonStr.indexOf('{');
            const endIndex = jsonStr.lastIndexOf('}');
            
            if (startIndex === -1 || endIndex === -1) {
                throw new Error("Invalid format: Could not find valid JSON payload inside file.");
            }
            
            const data = JSON.parse(jsonStr.substring(startIndex, endIndex + 1));
            
            if (!data.liveData || !data.liveData.event) {
                throw new Error("No liveData.event found. Is this an Opta F24 Match Event file?");
            }
            
            const events = data.liveData.event;
            if (events.length === 0) {
                throw new Error("File parsed successfully, but zero match events were found.");
            }

            // Extract the unique contestant IDs from the events.
            // We store the order: ids[0] = first team seen, ids[1] = second.
            // The home/away mapping will be resolved when the user assigns team names.
            const contestantIds = [...new Set(events.map(e => e.contestantId).filter(Boolean))];
            
            // Try formatting title from file name
            let matchTitle = file.name.replace('.json', '').replace('.xml', '').replace(/_/g, ' ');

            setStagedFiles(prev => [...prev, {
                id: Date.now() + Math.random(),
                fileName: file.name,
                matchTitle: matchTitle,
                homeTeam: '',
                awayTeam: '',
                homeScore: '',
                awayScore: '',
                contestantIds: contestantIds, // [homeId, awayId] once user assigns teams
                competition: 'Eliteserien',
                round: '',
                subRound: '',
                events: events,
                rawText: text
            }]);
            
            addLog(`Successfully parsed ${file.name}. Ready for review.`, 'success');
        } catch (error) {
            addLog(`Error processing ${file.name}: ${error.message}`, 'error');
        }
    };

    const handleDrop = useCallback((e) => {
        e.preventDefault();
        setIsDragging(false);
        const files = Array.from(e.dataTransfer.files);
        if (files.length === 0) return;
        
        files.forEach(file => {
            handleFileUpload(file);
        });
    }, []);

    const handleDragOver = useCallback((e) => {
        e.preventDefault();
        setIsDragging(true);
    }, []);

    const handleDragLeave = useCallback((e) => {
        e.preventDefault();
        setIsDragging(false);
    }, []);

    const handleFileSelect = (e) => {
        const files = Array.from(e.target.files);
        files.forEach(file => {
            handleFileUpload(file);
        });
        e.target.value = null; // reset
    };

    const updateStagedFile = (id, field, value) => {
        setStagedFiles(prev => prev.map(f => f.id === id ? { ...f, [field]: value } : f));
    }

    const removeStagedFile = (id) => {
        setStagedFiles(prev => prev.filter(f => f.id !== id));
    }

    const handleSaveToApp = async (fileState) => {
        addLog(`Saving ${fileState.matchTitle} to app datastore...`);
        
        if (!fileState.homeTeam || !fileState.awayTeam) {
            addLog('Please fill in Home Team and Away Team before saving.', 'error');
            return;
        }

        try {
            // Map the contestant IDs to home/away by counting events per ID.
            // The team with more events in the first half's first 10 minutes
            // is likely to match the user-supplied team names.
            // A more reliable approach: find the first kick-off event (typeId 32)
            // and determine which contestant ID kicked off.
            const ids = fileState.contestantIds || [];
            let homeContestantId = ids[0] || null;
            let awayContestantId = ids[1] || null;

            // Attempt intelligent extraction from the parsed JSON text
            try {
                const data = JSON.parse(fileState.rawText.substring(
                    fileState.rawText.indexOf('{'), 
                    fileState.rawText.lastIndexOf('}') + 1
                ));

                if (data.matchInfo && data.matchInfo.contestant) {
                    const hC = data.matchInfo.contestant.find(c => c.position === 'home');
                    const aC = data.matchInfo.contestant.find(c => c.position === 'away');
                    if (hC) homeContestantId = hC.id;
                    if (aC) awayContestantId = aC.id;
                } else if (data.liveData && data.liveData.matchDetails && data.liveData.matchDetails.contestant) {
                    const hC = data.liveData.matchDetails.contestant.find(c => c.position === 'home');
                    const aC = data.liveData.matchDetails.contestant.find(c => c.position === 'away');
                    if (hC) homeContestantId = hC.id;
                    if (aC) awayContestantId = aC.id;
                } else if (data.Games && data.Games.Game) {
                    homeContestantId = data.Games.Game.home_team_id || homeContestantId;
                    awayContestantId = data.Games.Game.away_team_id || awayContestantId;
                }
            } catch (err) {
                console.warn("Could not intelligently extract contestant IDs, falling back to array order.");
            }

            await saveNewMatch({
                id: `${fileState.matchTitle}_${fileState.competition}_${fileState.round}`.replace(/\s+/g, '_').toLowerCase(),
                matchTitle: fileState.matchTitle,
                homeTeam: fileState.homeTeam,
                awayTeam: fileState.awayTeam,
                homeScore: fileState.homeScore,
                awayScore: fileState.awayScore,
                homeContestantId,
                awayContestantId,
                competition: fileState.competition,
                round: fileState.subRound ? `${fileState.round} - ${fileState.subRound}` : fileState.round,
                fileName: fileState.fileName,
                events: fileState.events
            });
            addLog(`Successfully saved ${fileState.matchTitle}.`, 'success');
            removeStagedFile(fileState.id);
        } catch (e) {
            addLog(`Failed to save to datastore: ${e.message}`, 'error');
        }
    };

    const handleDownloadCSV = (fileState) => {
        addLog(`Generating CSV for ${fileState.fileName}...`);
        try {
            const csvData = processOptaToCSV(fileState.rawText);
            const outFileName = fileState.fileName.endsWith('.json') 
                ? fileState.fileName.replace('.json', '.csv') 
                : `${fileState.fileName}.csv`;
            downloadCSV(csvData, outFileName);
            addLog(`Download prompted for CSV.`, 'success');
        } catch (e) {
            addLog(`Failed to generate CSV: ${e.message}`, 'error');
        }
    };

    const handleDownloadStoredCSV = async (m) => {
        addLog(`Fetching events for ${m.matchTitle} from Database...`);
        try {
            const events = await fetchMatchEvents(m.id);
            if (!events || events.length === 0) throw new Error("No events found in database.");
            
            addLog(`Generating CSV for ${m.matchTitle}...`);
            const csvData = processEventsToCSV(events);
            const outFileName = `${m.matchTitle.replace(/\s+/g, '_')}_events.csv`;
            downloadCSV(csvData, outFileName);
            addLog(`Download prompted for stored CSV (From DB).`, 'success');
        } catch (e) {
            addLog(`Failed to generate CSV: ${e.message}`, 'error');
        }
    };

    const groupedMatches = loadedMatches.reduce((acc, m) => {
        const comp = m.competition || 'Unknown Competition';
        const rnd = m.round || 'Unknown';
        if (!acc[comp]) acc[comp] = {};
        if (!acc[comp][rnd]) acc[comp][rnd] = [];
        acc[comp][rnd].push(m);
        return acc;
    }, {});

    return (
        <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: '2rem' }}>
                <div>
                    <h1 className="section-title" style={{ marginTop: 0, fontSize: '2.5rem' }}>Data Hub</h1>
                    <p style={{ color: 'var(--color-text-secondary)' }}>
                        Upload match event JSON files to register them in the app or convert them to CSV for external analysis.
                    </p>
                </div>
            </div>

            <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem' }}>
                <button 
                    onClick={() => setActiveTab('import')} 
                    className="glass-panel" 
                    style={{ padding: '0.75rem 1.5rem', cursor: 'pointer', border: activeTab === 'import' ? '1px solid var(--color-accent-blue)' : 'var(--glass-border)', color: activeTab === 'import' ? 'var(--color-accent-blue)' : 'var(--color-text-primary)' }}
                >
                    Import Data
                </button>
                <button 
                    onClick={() => setActiveTab('manager')} 
                    className="glass-panel" 
                    style={{ padding: '0.75rem 1.5rem', cursor: 'pointer', border: activeTab === 'manager' ? '1px solid var(--color-accent-blue)' : 'var(--glass-border)', color: activeTab === 'manager' ? 'var(--color-accent-blue)' : 'var(--color-text-primary)' }}
                >
                    Database Manager
                </button>
            </div>

            {activeTab === 'import' && (
                <>

            <div 
                className="glass-panel"
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                style={{
                    padding: '4rem 2rem',
                    textAlign: 'center',
                    border: isDragging ? '2px dashed var(--color-accent-blue)' : '2px dashed rgba(255,255,255,0.2)',
                    background: isDragging ? 'rgba(56, 189, 248, 0.1)' : 'var(--glass-bg)',
                    marginBottom: '2rem',
                    transition: 'all 0.2s ease',
                    borderRadius: '12px'
                }}
            >
                <div style={{ marginBottom: '1rem' }}>
                    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="var(--color-accent-blue)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                        <polyline points="17 8 12 3 7 8"></polyline>
                        <line x1="12" y1="3" x2="12" y2="15"></line>
                    </svg>
                </div>
                <h3 style={{ margin: '0 0 0.5rem 0', color: 'var(--color-text-primary)' }}>Drag & Drop Match Files Here</h3>
                <p style={{ color: 'var(--color-text-secondary)', marginBottom: '1.5rem', fontSize: '0.9rem' }}>
                    Supports raw Opta F24 `.json` and text files.
                </p>
                
                <input 
                    type="file" 
                    id="file-upload" 
                    multiple 
                    style={{ display: 'none' }} 
                    onChange={handleFileSelect}
                />
                <label 
                    htmlFor="file-upload" 
                    style={{
                        background: 'var(--color-accent-blue)',
                        color: 'white',
                        padding: '0.75rem 1.5rem',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        fontWeight: 'bold',
                        display: 'inline-block'
                    }}
                >
                    Browse Files
                </label>
            </div>

            {/* Staged Files Section */}
            {stagedFiles.length > 0 && (
                <div style={{ marginBottom: '2rem' }}>
                    <h3 className="section-title">Staged Matches</h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        {stagedFiles.map(file => (
                            <div key={file.id} className="glass-panel" style={{ padding: '1.5rem', display: 'flex', flexWrap: 'wrap', gap: '1.5rem', alignItems: 'center' }}>
                                <div style={{ flex: '1 1 300px' }}>
                                    <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--color-text-secondary)', marginBottom: '0.3rem' }}>Match Name</label>
                                    <input 
                                        type="text" 
                                        value={file.matchTitle} 
                                        onChange={(e) => updateStagedFile(file.id, 'matchTitle', e.target.value)}
                                        style={{ width: '100%', padding: '0.5rem', borderRadius: '4px', border: '1px solid rgba(255,255,255,0.2)', background: 'rgba(0,0,0,0.2)', color: 'white' }}
                                    />
                                    <div style={{ fontSize: '0.75rem', color: 'var(--color-accent-green)', marginTop: '0.3rem' }}>
                                        {file.events.length} events detected
                                    </div>
                                </div>
                                <div style={{ flex: '1 1 200px' }}>
                                    <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--color-text-secondary)', marginBottom: '0.3rem' }}>Home Team</label>
                                    <TeamAutocompleteInput 
                                        placeholder="e.g. Tromsø"
                                        value={file.homeTeam}
                                        onChange={(val) => updateStagedFile(file.id, 'homeTeam', val)}
                                    />
                                    <input 
                                        type="number" 
                                        placeholder="Home Score"
                                        value={file.homeScore} 
                                        onChange={(e) => updateStagedFile(file.id, 'homeScore', e.target.value)}
                                        style={{ width: '100%', padding: '0.5rem', borderRadius: '4px', border: '1px solid rgba(255,255,255,0.2)', background: 'rgba(0,0,0,0.2)', color: 'white', marginTop: '0.5rem' }}
                                    />
                                </div>
                                <div style={{ flex: '1 1 200px' }}>
                                    <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--color-text-secondary)', marginBottom: '0.3rem' }}>Away Team</label>
                                    <TeamAutocompleteInput 
                                        placeholder="e.g. Fredrikstad"
                                        value={file.awayTeam}
                                        onChange={(val) => updateStagedFile(file.id, 'awayTeam', val)}
                                    />
                                    <input 
                                        type="number" 
                                        placeholder="Away Score"
                                        value={file.awayScore} 
                                        onChange={(e) => updateStagedFile(file.id, 'awayScore', e.target.value)}
                                        style={{ width: '100%', padding: '0.5rem', borderRadius: '4px', border: '1px solid rgba(255,255,255,0.2)', background: 'rgba(0,0,0,0.2)', color: 'white', marginTop: '0.5rem' }}
                                    />
                                </div>
                                <div style={{ flex: '1 1 200px' }}>
                                    <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--color-text-secondary)', marginBottom: '0.3rem' }}>Competition</label>
                                    <select 
                                        value={file.competition}
                                        onChange={(e) => updateStagedFile(file.id, 'competition', e.target.value)}
                                        style={{ width: '100%', padding: '0.5rem', borderRadius: '4px', border: '1px solid rgba(255,255,255,0.2)', background: 'var(--color-bg-dark)', color: 'white' }}
                                    >
                                        <option value="Eliteserien">Eliteserien</option>
                                        <option value="NM Cupen">NM Cupen</option>
                                        <option value="Champions League">Champions League</option>
                                        <option value="Europa League">Europa League</option>
                                        <option value="Conference League">Conference League</option>
                                        <option value="Friendly">Friendly</option>
                                    </select>
                                </div>
                                <div style={{ flex: '1 1 200px' }}>
                                    <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--color-text-secondary)', marginBottom: '0.3rem' }}>Round</label>
                                    {['Champions League', 'Europa League', 'Conference League'].includes(file.competition) ? (
                                        <EuropeRoundSelect 
                                            round={file.round}
                                            subRound={file.subRound}
                                            onRoundChange={(val) => updateStagedFile(file.id, 'round', val)}
                                            onSubRoundChange={(val) => updateStagedFile(file.id, 'subRound', val)}
                                        />
                                    ) : file.competition === 'NM Cupen' ? (
                                        <NMCupenRoundSelect 
                                            value={file.round}
                                            onChange={(val) => updateStagedFile(file.id, 'round', val)}
                                        />
                                    ) : (
                                        <input 
                                            type="text" 
                                            placeholder="e.g. 1"
                                            value={file.round} 
                                            onChange={(e) => updateStagedFile(file.id, 'round', e.target.value)}
                                            style={{ width: '100%', padding: '0.5rem', borderRadius: '4px', border: '1px solid rgba(255,255,255,0.2)', background: 'rgba(0,0,0,0.2)', color: 'white' }}
                                        />
                                    )}
                                </div>
                                <div style={{ flex: '1 1 100%', display: 'flex', gap: '0.5rem', justifyContent: 'flex-end', borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '1rem' }}>
                                    <button 
                                        onClick={() => removeStagedFile(file.id)}
                                        style={{ padding: '0.5rem 1rem', background: 'transparent', border: '1px solid var(--color-accent-pink)', color: 'var(--color-accent-pink)', borderRadius: '4px', cursor: 'pointer' }}
                                    >
                                        Discard
                                    </button>
                                    <button 
                                        onClick={() => handleDownloadCSV(file)}
                                        style={{ padding: '0.5rem 1rem', background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)', color: 'white', borderRadius: '4px', cursor: 'pointer' }}
                                    >
                                        Download CSV
                                    </button>
                                    <button 
                                        onClick={() => handleSaveToApp(file)}
                                        style={{ padding: '0.5rem 1rem', background: 'var(--color-accent-green)', color: '#000', fontWeight: 'bold', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                                    >
                                        Save to Database
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Logs Area */}
            {logs.length > 0 && (
                <div className="glass-panel" style={{ padding: '1.5rem' }}>
                    <h3 style={{ marginTop: 0, borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '0.5rem' }}>Process Log</h3>
                    <div style={{ maxHeight: '300px', overflowY: 'auto', fontFamily: 'monospace', fontSize: '0.9rem' }}>
                        {logs.map((log, index) => (
                            <div key={index} style={{ 
                                padding: '0.5rem 0',
                                color: log.type === 'error' ? 'var(--color-accent-pink)' : (log.type === 'success' ? 'var(--color-accent-green)' : 'var(--color-text-secondary)'),
                                display: 'flex',
                                gap: '1rem'
                            }}>
                                <span style={{ opacity: 0.5 }}>[{log.time}]</span>
                                <span>{log.msg}</span>
                            </div>
                        ))}
                    </div>
                </div>
            )}
            </>
            )}

            {activeTab === 'manager' && (
                <div style={{ marginBottom: '2rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                        <h3 className="section-title" style={{ margin: 0 }}>Stored Database Directory</h3>
                    </div>
                    {loadedMatches.length === 0 ? (
                        <p style={{ color: 'var(--color-text-secondary)', padding: '2rem', textAlign: 'center', border: '1px dashed rgba(255,255,255,0.2)', borderRadius: '8px' }}>
                            No matches stored locally. Import some data to get started!
                        </p>
                    ) : (
                        <div>
                            {Object.entries(groupedMatches).map(([comp, rounds]) => (
                                <div key={comp} style={{ marginBottom: '2rem' }}>
                                    <h4 className="section-title" style={{ fontSize: '1.4rem', color: 'var(--color-text-primary)', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '0.5rem', marginBottom: '1rem' }}>
                                        {comp}
                                    </h4>
                                    
                                    {Object.entries(rounds).sort((a,b) => parseInt(a[0]) - parseInt(b[0])).map(([rnd, matches]) => {
                                        const groupId = `${comp}-${rnd}`;
                                        const isExpanded = expandedGroups[groupId];
                                        
                                        return (
                                            <div key={rnd} className="glass-panel" style={{ marginBottom: '1rem', overflow: 'hidden' }}>
                                                <div 
                                                    onClick={() => setExpandedGroups(prev => ({...prev, [groupId]: !prev[groupId]}))}
                                                    style={{ padding: '1rem 1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer', background: 'rgba(255,255,255,0.02)' }}
                                                    onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'}
                                                    onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.02)'}
                                                >
                                                    <h5 style={{ margin: 0, fontSize: '1.1rem' }}>
                                                        {rnd === 'Unknown' ? 'Unknown Round' : `Round ${rnd}`} 
                                                        <span style={{ fontSize: '0.85rem', color: 'var(--color-accent-blue)', marginLeft: '1rem', fontWeight: 'normal' }}>
                                                            {matches.length} fixture{matches.length !== 1 ? 's' : ''}
                                                        </span>
                                                    </h5>
                                                    <span style={{ transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.3s' }}>
                                                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                            <polyline points="6 9 12 15 18 9"></polyline>
                                                        </svg>
                                                    </span>
                                                </div>
                                                
                                                {isExpanded && (
                                                    <div style={{ padding: '0 1.5rem 1.5rem 1.5rem', overflowX: 'auto', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                                                        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.9rem', marginTop: '1rem' }}>
                                                            <thead>
                                                                <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                                                                    <th style={{ padding: '0.75rem', color: 'var(--color-text-secondary)' }}>Match Name</th>
                                                                    <th style={{ padding: '0.75rem', color: 'var(--color-text-secondary)' }}>Teams</th>
                                                                    <th style={{ padding: '0.75rem', color: 'var(--color-text-secondary)' }}>Date Saved</th>
                                                                    <th style={{ padding: '0.75rem', color: 'var(--color-text-secondary)' }}>Actions</th>
                                                                </tr>
                                                            </thead>
                                                            <tbody>
                                                                {matches.map(m => (
                                                                    <tr key={m.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                                                                        <td style={{ padding: '1rem 0.75rem', fontWeight: 'bold' }}>{m.matchTitle}</td>
                                                                        <td style={{ padding: '1rem 0.75rem', color: 'var(--color-text-secondary)' }}>
                                                                            <div style={{ marginBottom: '0.2rem' }}>
                                                                                {m.homeTeam || '?'} {(m.homeScore !== undefined && m.homeScore !== '') ? m.homeScore : ''} - {(m.awayScore !== undefined && m.awayScore !== '') ? m.awayScore : ''} {m.awayTeam || '?'}
                                                                            </div>
                                                                            {editingMatchId === m.id && (
                                                                                <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
                                                                                    <input type="number" value={editHomeScore} onChange={e => setEditHomeScore(e.target.value)} placeholder="Home" style={{ width: '60px', padding: '0.3rem', borderRadius: '4px', border: '1px solid rgba(255,255,255,0.2)', background: 'rgba(0,0,0,0.2)', color: 'white' }} />
                                                                                    <input type="number" value={editAwayScore} onChange={e => setEditAwayScore(e.target.value)} placeholder="Away" style={{ width: '60px', padding: '0.3rem', borderRadius: '4px', border: '1px solid rgba(255,255,255,0.2)', background: 'rgba(0,0,0,0.2)', color: 'white' }} />
                                                                                    <button onClick={async () => {
                                                                                        await saveNewMatch({ ...m, homeScore: editHomeScore, awayScore: editAwayScore });
                                                                                        setEditingMatchId(null);
                                                                                    }} style={{ background: 'var(--color-accent-green)', padding: '0.3rem 0.6rem', border: 'none', borderRadius: '4px', cursor: 'pointer', color: 'black', fontWeight: 'bold' }}>Save</button>
                                                                                </div>
                                                                            )}
                                                                        </td>
                                                                        <td style={{ padding: '1rem 0.75rem', color: 'var(--color-text-secondary)' }}>{new Date(m.dateSaved).toLocaleDateString()}</td>
                                                                        <td style={{ padding: '1rem 0.75rem' }}>
                                                                            <div style={{ display: 'flex', gap: '0.5rem' }}>
                                                                                <button 
                                                                                    onClick={() => {
                                                                                        if (editingMatchId === m.id) {
                                                                                            setEditingMatchId(null);
                                                                                        } else {
                                                                                            setEditingMatchId(m.id);
                                                                                            setEditHomeScore(m.homeScore || '');
                                                                                            setEditAwayScore(m.awayScore || '');
                                                                                        }
                                                                                    }}
                                                                                    style={{ padding: '0.4rem 0.8rem', background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)', color: 'white', borderRadius: '4px', cursor: 'pointer', transition: 'all 0.2s', whiteSpace: 'nowrap' }}
                                                                                >
                                                                                    {editingMatchId === m.id ? 'Cancel' : 'Edit Score'}
                                                                                </button>
                                                                                <button 
                                                                                    onClick={() => handleDownloadStoredCSV(m)}
                                                                                    style={{ padding: '0.4rem 0.8rem', background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)', color: 'white', borderRadius: '4px', cursor: 'pointer', transition: 'all 0.2s', whiteSpace: 'nowrap' }}
                                                                                >
                                                                                    Download CSV
                                                                                </button>
                                                                                <button 
                                                                                    onClick={() => {
                                                                                        if (window.confirm("Are you sure you want to completely purge this match data?")) {
                                                                                            deleteStoredMatch(m.id);
                                                                                        }
                                                                                    }}
                                                                                    style={{ padding: '0.4rem 0.8rem', background: 'transparent', border: '1px solid var(--color-accent-pink)', color: 'var(--color-accent-pink)', borderRadius: '4px', cursor: 'pointer', transition: 'all 0.2s' }}
                                                                                >
                                                                                    Delete
                                                                                </button>
                                                                            </div>
                                                                        </td>
                                                                    </tr>
                                                                ))}
                                                            </tbody>
                                                        </table>
                                                    </div>
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default DataHub;
