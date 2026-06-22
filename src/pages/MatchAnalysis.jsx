
import React, { Component, useState, useEffect, useMemo, useCallback } from 'react';
import html2canvas from 'html2canvas';

const VisDownloadButton = () => {
  const [isDownloading, setIsDownloading] = useState(false);

  const handleDownload = async (e) => {
    const btn = e.currentTarget;
    const panel = btn.closest('.glass-panel');
    if (!panel) return;

    try {
      setIsDownloading(true);
      btn.style.display = 'none';

      const canvas = await html2canvas(panel, {
        backgroundColor: '#0a0a0f',
        scale: 2,
        useCORS: true
      });

      const titleEl = panel.querySelector('.section-title');
      let filename = titleEl ? titleEl.textContent.trim().replace(/\s+/g, '_') : 'Visualization';
      
      const link = document.createElement('a');
      link.download = `${filename}_Export.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
    } catch (err) {
      console.error('Error downloading visualization:', err);
    } finally {
      btn.style.display = 'flex';
      setIsDownloading(false);
    }
  };

  return (
    <button 
      onClick={handleDownload}
      disabled={isDownloading}
      title="Download PNG"
      style={{
        position: 'absolute',
        top: '-45px',
        right: '0px',
        background: 'rgba(255,255,255,0.08)',
        border: '1px solid rgba(255,255,255,0.1)',
        borderRadius: '6px',
        padding: '6px',
        cursor: isDownloading ? 'wait' : 'pointer',
        color: '#fff',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 50,
        transition: 'all 0.2s ease',
        opacity: isDownloading ? 0.5 : 0.8
      }}
      onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.15)'; e.currentTarget.style.opacity = '1'; }}
      onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.08)'; e.currentTarget.style.opacity = '0.8'; }}
    >
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
        <polyline points="7 10 12 15 17 10"></polyline>
        <line x1="12" y1="15" x2="12" y2="3"></line>
      </svg>
    </button>
  );
};

class GlobalErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }
  static getDerivedStateFromError(error) {
    return { hasError: true };
  }
  componentDidCatch(error, errorInfo) {
    console.error('Component error:', error, errorInfo);
  }
  render() {
    if (this.state.hasError) {
      return <h1>Something went wrong.</h1>;
    }
    return (
      <div style={{ position: 'relative', width: '100%', height: '100%' }}>
        <VisDownloadButton />
        {this.props.children}
      </div>
    );
  }
}
import Pitch from '../components/Pitch';
import TeamSelector from '../components/TeamSelector';
import MultiSelectDropdown from '../components/MultiSelectDropdown';
import SetPieceTable from '../components/visualizations/SetPieceTable';
import { useMatchData } from '../context/MatchDataContext';
import { matchStats, pitchEvents, leagueStandings, matches } from '../data/mockData';
import ShotMap from '../components/visualizations/ShotMap';
import BuildUpMap from '../components/visualizations/BuildUpMap';
import CornerDistributionMap from '../components/visualizations/CornerDistributionMap';
import CornerDeliveryArrows from '../components/visualizations/CornerDeliveryArrows';
import CornerDeliveryDonut from '../components/visualizations/CornerDeliveryDonut';
import FreeKickDeliveryMap from '../components/visualizations/FreeKickDeliveryMap';
import FreeKickDeliveryArrows from '../components/visualizations/FreeKickDeliveryArrows';
import FreeKickDeliveryDonut from '../components/visualizations/FreeKickDeliveryDonut';
import ThrowInZonesMap from '../components/visualizations/ThrowInZonesMap';
import ThrowInTargetLeaders from '../components/visualizations/ThrowInTargetLeaders';
import BallRecoveryMap from '../components/visualizations/BallRecoveryMap';
import AverageDefensiveActionHeight from '../components/visualizations/AverageDefensiveActionHeight';
import BlockCompactness from '../components/visualizations/BlockCompactness';
import TransitionMap from '../components/visualizations/TransitionMap';
import DefensiveTransitionMap from '../components/visualizations/DefensiveTransitionMap';
import RecoveryZonesMap from '../components/visualizations/RecoveryZonesMap';
import TransitionTimeChart from '../components/visualizations/TransitionTimeChart';
import PpdaCard from '../components/visualizations/PpdaCard';
import MatchMomentumChart from '../components/visualizations/MatchMomentumChart';
import FinalThirdEntriesMap from '../components/visualizations/FinalThirdEntriesMap';
import OppHalfEntriesMap from '../components/visualizations/OppHalfEntriesMap';
import FieldTiltMap from '../components/visualizations/FieldTiltMap';
import BuildUpDisruptionChart from '../components/visualizations/BuildUpDisruptionChart';
import PossessionStyleChart from '../components/visualizations/PossessionStyleChart';
import PassNetworkMap from '../components/visualizations/PassNetworkMap';
import AttackRadarChart from '../components/visualizations/AttackRadarChart';
import DefenceRadarChart from '../components/visualizations/DefenceRadarChart';
import LeagueChancesConceded from '../components/visualizations/LeagueChancesConceded';

import TransitionRadarChart from '../components/visualizations/TransitionRadarChart';
import AttackingTransitionScatterChart from '../components/visualizations/AttackingTransitionScatterChart';
import DefensiveTransitionScatterChart from '../components/visualizations/DefensiveTransitionScatterChart';
import LeagueRankingsBoard from '../components/visualizations/LeagueRankingsBoard';
import LeagueBuildUpMap from '../components/visualizations/LeagueBuildUpMap';
import LeagueFinalThirdMap from '../components/visualizations/LeagueFinalThirdMap';
import LeagueChanceCreation from '../components/visualizations/LeagueChanceCreation';
import DefensiveStyleChart from '../components/visualizations/DefensiveStyleChart';
import LeagueDefenceRankingsBoard from '../components/visualizations/LeagueDefenceRankingsBoard';
import LeagueBdpChart from '../components/visualizations/LeagueBdpChart';
import { getCachedBadge } from '../utils/badgeCache';

import ErrorBoundary from '../components/ErrorBoundary';
import { 
    extractShotsFromOpta, extractBuildUpFromOpta, extractCornersFromOpta, 
    extractCornerDeliveriesFromOpta,
    extractFreeKicksFromOpta, extractWideFreeKickDeliveriesFromOpta, 
    extractThrowInsFromOpta, extractThrowInTargets,
    extractBallRecoveriesFromOpta, extractTransitionsFromOpta, extractTransitionTimes, calculateLeaguePPDA, 
    extractFinalThirdEntries, extractOppHalfEntries, extractMatchMomentum, extractFieldTilt, extractBDP, 
    calculateLeagueBdpStats, extractPossessionStyle, extractConcededTransitionsFromOpta, extractDefensiveActionsFromOpta, 
    calculateLeagueDefensiveHeight, extractPassNetworkFromOpta, calculateLeagueAttackMetrics, calculateLeagueDefenceMetrics, calculateLeagueTransitionMetrics, calculateLeagueChanceCreationStats
} from '../utils/dataMapper';

const MatchAnalysis = ({ onViewChange }) => {
    const { loadedMatches, fetchMatchEvents, refreshMatches,        seasonPPDA, globalLeagueAttackStats, globalLeagueDefenceStats, globalLeagueTransitionStats,
        globalLeagueBuildUp, globalLeagueFinalThird, globalLeagueChanceCreation, globalLeagueChancesConceded, globalPossessionStyle, globalLeagueSetPieceTable, globalBdpLeagueStats,
        deleteStoredMatch
    } = useMatchData();
    const [storedEvents, setStoredEvents] = useState([]);
    const [activeTab, setActiveTab] = useState('Attack');
    const [selectedTeams, setSelectedTeams] = useState([]);
    const [isCompareMode, setIsCompareMode] = useState(false);
    const [isDownloading, setIsDownloading] = useState(false);
    const [publishedVisuals, setPublishedVisuals] = useState([]);
    const [fixtureContext, setFixtureContext] = useState(null);
    const [bdpData, setBdpData] = useState([]);
    const [bdpLeagueStats, setBdpLeagueStats] = useState(null);
    const [isBdpLoading, setIsBdpLoading] = useState(false);
    const [leagueDefensiveHeight, setLeagueDefensiveHeight] = useState(null);

    useEffect(() => {
        const targetJSON = localStorage.getItem('analyzeMatchTarget');
        if (targetJSON) {
            const target = JSON.parse(targetJSON);
            setSelectedTeams([target.homeTeam, target.awayTeam]);
            setIsCompareMode(true);
            setSelectedStoredMatches({
                [target.homeTeam]: [target.id],
                [target.awayTeam]: [target.id]
            });
            setFixtureContext(target);
            localStorage.removeItem('analyzeMatchTarget');
        }

        const singleTeamTarget = localStorage.getItem('analyzeSingleTeam');
        if (singleTeamTarget) {
            setSelectedTeams([singleTeamTarget]);
            setIsCompareMode(false);
            localStorage.removeItem('analyzeSingleTeam');
        }
    }, []);

    useEffect(() => {
        // Refresh match metadata from backend on every visit to ensure
        // we always have the latest contestant IDs and match info.
        refreshMatches();
    }, []);

    useEffect(() => {
        const ALL_VISUALS = ['AttackRadarChart', 'FieldTiltMap', 'PassNetworkMap', 'OppHalfEntriesMap', 'FinalThirdEntriesMap', 'LeagueChanceCreation', 'ShotMap', 'BuildUpMap', 'MatchMomentumChart', 'PossessionStyleChart', 'DefenceRadarChart', 'BallRecoveryMap', 'AverageDefensiveActionHeight', 'BlockCompactness', 'PpdaCard', 'BdpChart', 'transitionsRadar', 'TransitionMap', 'DefensiveTransitionMap', 'RecoveryZonesMap', 'TransitionTimeChart'];
        try {
            const saved = localStorage.getItem('publishedVisualizations');
            if (saved !== null) {
                const parsed = JSON.parse(saved);
                // Merge in any new visuals that were added after the user last saved
                const merged = [...new Set([...parsed, ...ALL_VISUALS.filter(v => !parsed.includes(v))])];
                if (merged.length !== parsed.length) {
                    localStorage.setItem('publishedVisualizations', JSON.stringify(merged));
                }
                setPublishedVisuals(merged);
            } else {
                setPublishedVisuals(ALL_VISUALS);
            }
        } catch { 
            setPublishedVisuals(ALL_VISUALS);
        }
    }, []);

    const TEAM_COLORS = {
        'Tromsø': '#E3001B',
        'Tromsø IL': '#E3001B',
        'Viking': '#800020',
        'Viking FK': '#800020',
        'Lillestrøm': '#FFED00',
        'Lillestrøm SK': '#FFED00',
        'Bodø/Glimt': '#FFCC00',
        'FK Bodø/Glimt': '#FFCC00',
        'Molde': '#87CEEB',
        'Molde FK': '#87CEEB',
        'Brann': '#FFFFFF',
        'SK Brann': '#FFFFFF',
        'HamKam': '#008000',
        'Hamarkameratene': '#008000',
        'Sandefjord': '#FF6347',
        'Sandefjord Fotball': '#FF6347',
        'Kristiansund': '#000080',
        'Kristiansund BK': '#000080',
        'KFUM': '#F0F0F0',
        'KFUM Oslo': '#F0F0F0',
        'Vålerenga': '#0000FF',
        'Vålerenga IF': '#0000FF',
        'Fredrikstad': '#B22222',
        'Fredrikstad FK': '#B22222',
        'Sarpsborg 08': '#4169E1',
        'Sarpsborg': '#4169E1',
        'Rosenborg': '#646464',
        'Rosenborg BK': '#646464',
        'Start': '#ADFF2F',
        'IK Start': '#ADFF2F',
        'Aalesund': '#FFA500',
        'Aalesunds FK': '#FFA500'
    };
    
    // Filters
    const ALL_COMPETITIONS = [
        { label: 'Eliteserien', value: 'Eliteserien' },
        { label: 'NM Cupen', value: 'NM Cupen' },
        { label: 'Champions League', value: 'Champions League' },
        { label: 'Europa League', value: 'Europa League' },
        { label: 'Conference League', value: 'Conference League' },
        { label: 'Friendly', value: 'Friendly' }
    ];
    const [selectedCompetitions, setSelectedCompetitions] = useState(['Eliteserien']);
    const [selectedStoredMatches, setSelectedStoredMatches] = useState({});



    useEffect(() => {
        const fetchAll = async () => {
            let allEvts = [];
            let allSelectedIds = [];
            
            selectedTeams.forEach(team => {
                const teamSelection = selectedStoredMatches[team];
                
                if (teamSelection === undefined) {
                    // Default behavior ONLY for Eliteserien: Select all available matches
                    if (team === 'Eliteserien') {
                        const ids = loadedMatches.filter(m => m.competition === 'Eliteserien').map(m => m.id);
                        allSelectedIds.push(...ids);
                    }
                    // For single teams, we leave it as a manual process (no default selection)
                } else {
                    // User made an explicit selection (can be empty array if they cleared it)
                    teamSelection.forEach(val => {
                        if (typeof val === 'string' && val.startsWith('round_')) {
                            const roundNum = val.split('_')[1];
                            const ids = loadedMatches
                                .filter(m => m.competition === 'Eliteserien' && (m.round === roundNum || m.round === Number(roundNum)))
                                .map(m => m.id);
                            allSelectedIds.push(...ids);
                        } else {
                            allSelectedIds.push(val);
                        }
                    });
                }
            });
            allSelectedIds = [...new Set(allSelectedIds)];
            
            for (let id of allSelectedIds) {
                let matchMeta = loadedMatches.find(m => m.id === id);
                
                // If not found by direct ID, check if it's a schedule match that we can link to an uploaded DataHub match
                if (!matchMeta && fixtureContext && fixtureContext.id === id) {
                    matchMeta = loadedMatches.find(m => 
                        isTeamMatch(m.homeTeam, fixtureContext.homeTeam) &&
                        isTeamMatch(m.awayTeam, fixtureContext.awayTeam)
                    );
                    if (matchMeta) {
                        id = matchMeta.id; // Override id so fetchMatchEvents uses the real DB ID
                    }
                }

                let evts = await fetchMatchEvents(id);

                if (evts && matchMeta) {
                    // Use explicitly stored contestant IDs when available (post-migration).
                    const fallbackIds = [...new Set(evts.map(e => e.contestantId).filter(Boolean))];
                    const homeId = matchMeta.homeContestantId || fallbackIds[0];
                    const awayId = matchMeta.awayContestantId || fallbackIds[1];

                    const enrichedEvts = evts.map(e => {
                        let resolvedTeamName = e.teamName || 'Unknown';
                        
                        // Universally resolve teamName using contestantId and Match Meta
                        if (e.contestantId) {
                            if (e.contestantId === homeId) resolvedTeamName = matchMeta.homeTeam;
                            else if (e.contestantId === awayId) resolvedTeamName = matchMeta.awayTeam;
                        }

                        return { 
                            ...e, 
                            matchId: id, // Critical: keep track of source match
                            teamName: resolvedTeamName,
                            homeTeam: matchMeta.homeTeam,
                            awayTeam: matchMeta.awayTeam
                        };
                    });
                    allEvts = allEvts.concat(enrichedEvts);
                } else if (evts) {
                    allEvts = allEvts.concat(evts);
                }
            }
            setStoredEvents(allEvts);
        };
        fetchAll();
    }, [selectedStoredMatches, loadedMatches]);

    useEffect(() => {
        const fetchBdp = async () => {
            if (selectedTeams.length === 0) {
                setBdpData({});
                setBdpLeagueStats({});
                return;
            }
            setIsBdpLoading(true);
            
            const newBdpData = {};
            const newLeagueStats = {};
            
            try {
                const normalizeTeamName = (n) => {
                    if (!n) return '';
                    const lower = n.toLowerCase();
                    if (lower.includes('hamar') || lower.includes('hamkam')) return 'HamKam';
                    if (lower.includes('bodø') || lower.includes('glimt')) return 'Bodø/Glimt';
                    if (lower.includes('sarpsborg')) return 'Sarpsborg 08';
                    if (lower.includes('kfum')) return 'KFUM Oslo';
                    if (lower.includes('troms') || lower.includes('tromso')) return 'Tromsø';
                    if (lower.includes('vålerenga')) return 'Vålerenga';
                    if (lower.includes('fredrikstad')) return 'Fredrikstad';
                    if (lower.includes('molde')) return 'Molde';
                    if (lower.includes('start')) return 'Start';
                    if (lower.includes('rosenborg')) return 'Rosenborg';
                    if (lower.includes('lillestrøm')) return 'Lillestrøm';
                    if (lower.includes('sandefjord')) return 'Sandefjord';
                    if (lower.includes('viking')) return 'Viking';
                    if (lower.includes('kristiansund')) return 'Kristiansund';
                    if (lower.includes('aalesund') || lower.includes('ålesund')) return 'Aalesund';
                    if (lower.includes('brann')) return 'Brann';
                    if (lower.includes('haugesund')) return 'Haugesund';
                    if (lower.includes('odd')) return 'Odd';
                    if (lower.includes('strømsgodset')) return 'Strømsgodset';
                    return n;
                };
                const isTeamMatchFn = (t1, t2) => normalizeTeamName(t1) === normalizeTeamName(t2);

                for (let teamName of selectedTeams) {
                    const matchIds = selectedStoredMatches[teamName] || [];
                    if (matchIds.length > 0) {
                        const data = await extractBDP(teamName, matchIds, loadedMatches, fetchMatchEvents, isTeamMatchFn);
                        newBdpData[teamName] = data;
                    }
                    const stats = await calculateLeagueBdpStats(teamName, loadedMatches, fetchMatchEvents);
                    newLeagueStats[teamName] = stats;
                }
                
                const avgHeight = await calculateLeagueDefensiveHeight(loadedMatches, fetchMatchEvents);
                setLeagueDefensiveHeight(avgHeight);
                
                setBdpData(newBdpData);
                setBdpLeagueStats(newLeagueStats);
            } catch (e) {
                console.error("Failed to extract BDP:", e);
            }
            setIsBdpLoading(false);
        };
        fetchBdp();
    }, [selectedTeams, selectedStoredMatches, loadedMatches, fetchMatchEvents]);

    const PHASES = ['Attack', 'Defence', 'Transitions', 'Set-Pieces'];

    const handleTeamSelect = (teamName) => {
        if (isCompareMode) {
            if (selectedTeams.includes(teamName)) {
                setSelectedTeams(selectedTeams.filter(t => t !== teamName));
            } else {
                if (selectedTeams.length < 2) {
                    setSelectedTeams([...selectedTeams, teamName]);
                }
            }
        } else {
            setSelectedTeams([teamName]);
        }
    };

    const handleDownloadReport = () => {
        setIsDownloading(true);
        setTimeout(() => {
            const b64 = "JVBERi0xLjQKMSAwIG9iaiA8PC9UeXBlIC9DYXRhbG9nIC9QYWdlcyAyIDAgUj4+IGVuZG9iagoyIDAgb2JqIDw8L1R5cGUgL1BhZ2VzIC9LaWRzIFszIDAgUl0gL0NvdW50IDE+PiBlbmRvYmoKMyAwIG9iaiA8PC9UeXBlIC9QYWdlIC9QYXJlbnQgMiAwIFIgL1Jlc291cmNlcyA0IDAgUiAvTWVkaWFCb3ggWzAgMCA1MDAgODAwXSAvQ29udGVudHMgNiAwIFI+PiBlbmRvYmoKNCAwIG9iaiA8PC9Gb250IDw8L0YxIDUgMCBSPj4+PiBlbmRvYmoKNSAwIG9iaiA8PC9UeXBlIC9Gb250IC9TdWJ0eXBlIC9UeXBlMSAvQmFzZUZvbnQgL0hlbHZldGljYT4+IGVuZG9iago2IDAgb2JqIDw8L0xlbmd0aCA0ND4+IHN0cmVhbQpCVCAvRjEgMjQgVGYgMTAwIDcwMCBUZCAoVGFjdGljYWwgUmVwb3J0KSBUaiBFVAplbmRzdHJlYW0KZW5kb2JqCnhyZWYKMCA3CjAwMDAwMDAwMDAgNjU1MzUgZgowMDAwMDAwMDA5IDAwMDAwIG4KMDAwMDAwMDA1NiAwMDAwMCBuCjAwMDAwMDAxMTEgMDAwMDAgbgowMDAwMDAwMjEyIDAwMDAwIG4KMDAwMDAwMDI1MCAwMDAwMCBuCjAwMDAwMDAzMTcgMDAwMDAgbgp0cmFpbGVyIDw8L1NpemUgNy9Sb290IDEgMCBSPj4Kc3RhcnR4cmVmCjQwNgolJUVPRg==";
            const pdfData = atob(b64);
            const arrayBuffer = new ArrayBuffer(pdfData.length);
            const uint8Array = new Uint8Array(arrayBuffer);
            for (let i = 0; i < pdfData.length; i++) {
                uint8Array[i] = pdfData.charCodeAt(i);
            }
            const blob = new Blob([uint8Array], { type: 'application/pdf' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `${selectedTeams.join('_vs_')}_Analysis_Report.pdf`;
            a.click();
            URL.revokeObjectURL(url);
            setIsDownloading(false);
        }, 1500);
    };

    // Filter out standing objects for only selected teams
    const teamDataObjects = selectedTeams.map(teamName => {
        if (teamName === 'Eliteserien') return { team: 'Eliteserien', badgeUrl: 'https://images.fotmob.com/image_resources/logo/leaguelogo/59.png' };
        return leagueStandings.find(t => t.team === teamName);
    }).filter(Boolean);

    const normalizeTeamName = (n) => {
        if (!n) return '';
        const lower = n.toLowerCase();
        if (lower.includes('hamar') || lower.includes('hamkam')) return 'HamKam';
        if (lower.includes('bodø') || lower.includes('glimt')) return 'Bodø/Glimt';
        if (lower.includes('sarpsborg')) return 'Sarpsborg 08';
        if (lower.includes('kfum')) return 'KFUM Oslo';
        if (lower.includes('troms') || lower.includes('tromso')) return 'Tromsø';
        if (lower.includes('vålerenga')) return 'Vålerenga';
        if (lower.includes('fredrikstad')) return 'Fredrikstad';
        if (lower.includes('molde')) return 'Molde';
        if (lower.includes('start')) return 'Start';
        if (lower.includes('rosenborg')) return 'Rosenborg';
        if (lower.includes('lillestrøm')) return 'Lillestrøm';
        if (lower.includes('sandefjord')) return 'Sandefjord';
        if (lower.includes('viking')) return 'Viking';
        if (lower.includes('kristiansund')) return 'Kristiansund';
        if (lower.includes('aalesund') || lower.includes('ålesund')) return 'Aalesund';
        if (lower.includes('brann')) return 'Brann';
        if (lower.includes('strømsgodset')) return 'Strømsgodset';
        return n.replace(/ fk| bk| il| if| sk| fotball/gi, '').trim();
    };

    const getBadge = getCachedBadge;

    const isTeamMatch = (savedTeam, selectedTeam) => {
        if (selectedTeam === 'Eliteserien') return true;
        if (!savedTeam || !selectedTeam) return false;
        const normSaved = normalizeTeamName(savedTeam).toLowerCase();
        const normSelected = normalizeTeamName(selectedTeam).toLowerCase();
        return normSaved === normSelected || normSaved.includes(normSelected) || normSelected.includes(normSaved);
    };

    const leagueAttackStats = useMemo(() => {
        if (storedEvents.length === 0 || loadedMatches.length === 0) return null;

        const uniqueMatchIds = new Set(storedEvents.map(e => e.matchId));
        const localLoadedMatches = loadedMatches.filter(m => uniqueMatchIds.has(m.id));

        const localStats = calculateLeagueAttackMetrics(
            storedEvents, 
            localLoadedMatches, 
            isTeamMatch, 
            globalLeagueAttackStats ? globalLeagueAttackStats.maxValues : null
        );

        if (globalLeagueAttackStats && globalLeagueAttackStats.leagueData) {
            const enrichedLeagueData = { ...localStats.leagueData };
            Object.keys(localStats.leagueData).forEach(team => {
                if (team === 'League Average') return;
                const localTeamStats = localStats.leagueData[team];
                
                Object.keys(localTeamStats.raw).forEach(metric => {
                    const localRawValue = localTeamStats.raw[metric];
                    
                    // Count how many global teams have a higher raw value
                    let rank = 1;
                    Object.keys(globalLeagueAttackStats.leagueData).forEach(globalTeam => {
                        if (globalTeam === 'League Average' || globalTeam === team) return;
                        if (globalLeagueAttackStats.leagueData[globalTeam].raw[metric] > localRawValue) {
                            rank++;
                        }
                    });
                    localTeamStats.rank[metric] = rank;
                });
            });
        }
        
        return localStats;
    }, [storedEvents, loadedMatches, isTeamMatch, globalLeagueAttackStats, publishedVisuals]);

    const leagueDefenceStats = useMemo(() => {
        if (!storedEvents.length || !loadedMatches.length || activeTab !== 'Defence') return null;
        if (!globalLeagueDefenceStats && publishedVisuals.includes('DefenceRadarChart')) return null;

        const uniqueMatchIds = new Set(storedEvents.map(e => e.matchId));
        const localLoadedMatches = loadedMatches.filter(m => uniqueMatchIds.has(m.id));

        const localStats = calculateLeagueDefenceMetrics(
            storedEvents, 
            localLoadedMatches, 
            isTeamMatch, 
            globalLeagueDefenceStats ? globalLeagueDefenceStats.maxValues : null
        );

        if (globalLeagueDefenceStats && globalLeagueDefenceStats.leagueData) {
            const enrichedLeagueData = { ...localStats.leagueData };
            
            // Re-calculate ranks for local teams against the global baseline
            Object.keys(localStats.leagueData).forEach(team => {
                if (team === 'League Average') return;
                const localTeamStats = localStats.leagueData[team];
                
                Object.keys(localTeamStats.raw).forEach(metric => {
                    const localRawValue = localTeamStats.raw[metric];
                    const isReverse = ['ppda', 'blockCompactness', 'shotsAllowed', 'shotsOnTargetAllowed', 'boxEntriesAllowed', 'goalsAllowed'].includes(metric);
                    
                    let rank = 1;
                    Object.keys(globalLeagueDefenceStats.leagueData).forEach(globalTeam => {
                        if (globalTeam === 'League Average' || globalTeam === team) return;
                        
                        const globalRawValue = globalLeagueDefenceStats.leagueData[globalTeam].raw[metric];
                        if (isReverse) {
                            if (globalRawValue < localRawValue) rank++;
                        } else {
                            if (globalRawValue > localRawValue) rank++;
                        }
                    });
                    localTeamStats.rank[metric] = rank;
                });
            });
        }

        return localStats;
    }, [storedEvents, loadedMatches, isTeamMatch, globalLeagueDefenceStats, activeTab, publishedVisuals]);

    const leagueTransitionStats = useMemo(() => {
        if (!storedEvents.length || !loadedMatches.length || activeTab !== 'Transitions') return null;
        if (!globalLeagueTransitionStats && publishedVisuals.includes('transitionsRadar')) return null;

        const uniqueMatchIds = new Set(storedEvents.map(e => e.matchId));
        const localLoadedMatches = loadedMatches.filter(m => uniqueMatchIds.has(m.id));

        const localStats = calculateLeagueTransitionMetrics(
            storedEvents, 
            localLoadedMatches, 
            isTeamMatch, 
            globalLeagueTransitionStats ? globalLeagueTransitionStats.maxValues : null
        );

        if (globalLeagueTransitionStats && globalLeagueTransitionStats.leagueData) {
            const enrichedLeagueData = { ...localStats.leagueData };
            
            // Re-calculate ranks for local teams against the global baseline
            Object.keys(localStats.leagueData).forEach(team => {
                if (team === 'League Average') return;
                const localTeamStats = localStats.leagueData[team];
                
                Object.keys(localTeamStats.raw).forEach(metric => {
                    const localRawValue = localTeamStats.raw[metric];
                    
                    let rank = 1;
                    const INVERSE_METRICS = ['defShots10s', 'defShots15s', 'defShots20s', 'defSot10s', 'defSot15s', 'defSot20s', 'defGoals10s', 'defGoals15s', 'defGoals20s', 'defBoxEntries10s', 'defBoxEntries15s', 'defBoxEntries20s', 'defFirstThirdLosses', 'defForwardPassCompPct', 'defTransitionToShotPct'];
                    const isReverse = INVERSE_METRICS.includes(metric);

                    Object.keys(globalLeagueTransitionStats.leagueData).forEach(globalTeam => {
                        if (globalTeam === 'League Average' || globalTeam === team) return;
                        
                        const globalRawValue = globalLeagueTransitionStats.leagueData[globalTeam].raw[metric];
                        if (isReverse) {
                            if (globalRawValue < localRawValue) rank++;
                        } else {
                            if (globalRawValue > localRawValue) rank++;
                        }
                    });
                    localTeamStats.rank[metric] = rank;
                });
            });
        }

        return localStats;
    }, [storedEvents, loadedMatches, isTeamMatch, globalLeagueTransitionStats, activeTab, publishedVisuals]);

    /* leaguePlayerRecoveryStats removed due to undef */
    const activeTeams = selectedTeams.length > 0 ? selectedTeams : [...new Set(storedEvents.map(e => e.teamName || e.contestantId).filter(Boolean))].slice(0, 2);
    
    const isAllMatches = useMemo(() => {
        if (!storedEvents.length || !loadedMatches.length) return false;
        const uniqueMatches = new Set(storedEvents.map(e => e.matchId).filter(Boolean));
        return uniqueMatches.size === loadedMatches.length;
    }, [storedEvents, loadedMatches]);

    const memoizedPossessionStyle = useMemo(() => {
        if (!selectedTeams.includes('Eliteserien') || !publishedVisuals.includes('PossessionStyleChart')) return [];
        if (isAllMatches && globalPossessionStyle) return globalPossessionStyle;
        const teamData = storedEvents.filter(event => isTeamMatch(event.teamName, 'Eliteserien'));
        return extractPossessionStyle(teamData);
    }, [selectedTeams, storedEvents, isTeamMatch, publishedVisuals, isAllMatches, globalPossessionStyle]);

    const leagueChanceStats = useMemo(() => {
        if (isAllMatches && globalLeagueChanceCreation && globalLeagueChancesConceded) {
            return { created: globalLeagueChanceCreation, conceded: globalLeagueChancesConceded };
        }
        if (!storedEvents.length || !loadedMatches.length || (activeTab !== 'Attack' && activeTab !== 'Defence')) return null;
        return calculateLeagueChanceCreationStats(storedEvents, loadedMatches, isTeamMatch);
    }, [storedEvents, loadedMatches, activeTab, isTeamMatch, isAllMatches, globalLeagueChanceCreation, globalLeagueChancesConceded]);

    const leagueBuildUpPasses = useMemo(() => {
        if (isAllMatches && globalLeagueBuildUp) return globalLeagueBuildUp;
        if (!storedEvents.length || !selectedTeams.includes('Eliteserien') || activeTab !== 'Attack') return [];
        return extractBuildUpFromOpta(storedEvents, ['Eliteserien'], isTeamMatch);
    }, [storedEvents, selectedTeams, activeTab, isTeamMatch, isAllMatches, globalLeagueBuildUp]);

    const leagueFinalThirdEntries = useMemo(() => {
        if (isAllMatches && globalLeagueFinalThird) return globalLeagueFinalThird;
        if (!storedEvents.length || !selectedTeams.includes('Eliteserien') || activeTab !== 'Attack') return [];
        return extractFinalThirdEntries(storedEvents, ['Eliteserien'], isTeamMatch);
    }, [storedEvents, selectedTeams, activeTab, isTeamMatch, isAllMatches, globalLeagueFinalThird]);

    // Full screen selection view vs Active dashboard view
    if (selectedTeams.length === 0) {
        return (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '80vh' }}>
                <div style={{ width: '100%', maxWidth: '1000px' }}>
                    <TeamSelector 
                        selectedTeams={selectedTeams} 
                        onSelectTeam={handleTeamSelect} 
                    />
                </div>
            </div>
        );
    }

    // Helper for rendering Phase and Export buttons cleanly
    const renderPhaseAndExport = () => (
        <div style={{ display: 'flex', width: '100%', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', flexWrap: 'wrap' }}>
                <label style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)', marginRight: '0.5rem' }}>Phase:</label>
                {PHASES.map(phase => {
                    const isSelected = activeTab === phase;
                    return (
                        <button 
                            key={phase}
                            onClick={() => setActiveTab(phase)}
                            style={{
                                background: isSelected ? 'var(--color-accent-green)' : 'rgba(255,255,255,0.1)',
                                color: isSelected ? '#000' : 'var(--color-text-secondary)',
                                fontWeight: isSelected ? 'bold' : 'normal',
                                border: 'none', padding: '0.4rem 0.8rem', borderRadius: '4px', cursor: 'pointer', fontSize: '0.85rem',
                                transition: 'all 0.2s'
                            }}
                        >
                            {phase}
                        </button>
                    )
                })}
            </div>

            <div style={{ paddingLeft: '1rem', borderLeft: '1px solid rgba(255,255,255,0.1)' }}>
                <button
                    onClick={handleDownloadReport}
                    disabled={isDownloading}
                    style={{
                        background: isDownloading ? 'rgba(255,255,255,0.1)' : 'var(--color-accent-blue)',
                        color: 'white',
                        padding: '0.6rem 1.2rem',
                        border: 'none',
                        borderRadius: '6px',
                        cursor: isDownloading ? 'wait' : 'pointer',
                        fontWeight: 'bold',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        opacity: isDownloading ? 0.7 : 1,
                        transition: 'all 0.2s',
                        whiteSpace: 'nowrap'
                    }}
                >
                    {isDownloading ? 'Generating...' : (
                        <>
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                                <polyline points="7 10 12 15 17 10"></polyline>
                                <line x1="12" y1="15" x2="12" y2="3"></line>
                            </svg>
                            Export PDF
                        </>
                    )}
                </button>
            </div>
        </div>
    );

    // Component render returns

    return (
        <div>
            {/* Top Section */}
            <div style={{ marginBottom: '2rem' }}>
                {fixtureContext ? (
                    <div className="glass-panel" style={{ position: 'relative', padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                                <div style={{ fontSize: '0.85rem', color: 'var(--color-accent-gold)', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                                    {fixtureContext.competition} • Runde {fixtureContext.round || '-'}
                                </div>
                                <div style={{ fontSize: '0.85rem', color: 'var(--color-text-secondary)' }}>
                                    {new Date(fixtureContext.date).toLocaleDateString('no-NO', { weekday: 'short', day: 'numeric', month: 'long' })} • {fixtureContext.time} • {fixtureContext.venue}
                                </div>
                            </div>
                            <div style={{ display: 'flex', gap: '0.5rem' }}>
                                {onViewChange && (
                                    <button 
                                        onClick={() => { setFixtureContext(null); setSelectedTeams([]); onViewChange('schedule'); }}
                                        style={{ background: 'rgba(255, 255, 255, 0.1)', color: 'white', border: '1px solid rgba(255, 255, 255, 0.3)', borderRadius: '4px', padding: '0.4rem 1rem', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 'bold', transition: 'all 0.2s' }}
                                    >
                                        ← Back to Schedule
                                    </button>
                                )}
                                <button 
                                    onClick={() => { setFixtureContext(null); setSelectedTeams([]); }}
                                    style={{ background: 'rgba(239, 68, 68, 0.1)', color: 'var(--color-accent-red)', border: '1px solid rgba(239, 68, 68, 0.3)', borderRadius: '4px', padding: '0.4rem 1rem', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 'bold', transition: 'all 0.2s' }}
                                >
                                    Lukk
                                </button>
                            </div>
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '2rem', padding: '1rem 0' }}>
                            <div style={{ display: 'flex', flex: 1, justifyContent: 'flex-end', alignItems: 'center', gap: '1rem' }}>
                                <span style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>{fixtureContext.homeTeam}</span>
                                <img src={getBadge(fixtureContext.homeTeam)} alt="" style={{ width: '48px', height: '48px', objectFit: 'contain' }} />
                            </div>
                            <div style={{ fontSize: '2rem', fontWeight: 'bold', letterSpacing: '2px', padding: '0.5rem 1.5rem', background: 'rgba(255,255,255,0.05)', borderRadius: '8px' }}>
                                {fixtureContext.score || 'vs'}
                            </div>
                            <div style={{ display: 'flex', flex: 1, justifyContent: 'flex-start', alignItems: 'center', gap: '1rem' }}>
                                <img src={getBadge(fixtureContext.awayTeam)} alt="" style={{ width: '48px', height: '48px', objectFit: 'contain' }} />
                                <span style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>{fixtureContext.awayTeam}</span>
                            </div>
                        </div>

                        <div style={{ borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '1.5rem' }}>
                            {renderPhaseAndExport()}
                        </div>
                    </div>
                ) : (
                <div className="glass-panel filters-container" style={{ position: 'relative', zIndex: 10, padding: '1.5rem', display: 'flex', gap: '1.5rem', flexWrap: 'wrap', alignItems: 'center' }}>
                    {/* Selected Teams Header */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        {teamDataObjects.map((teamData, index) => (
                            <React.Fragment key={teamData.team}>
                                {index > 0 && <span style={{ color: 'var(--color-text-secondary)', fontWeight: 'bold' }}>vs</span>}
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                    <img src={teamData.badgeUrl} alt={`${teamData.team}`} style={{ width: '40px', height: '40px', objectFit: 'contain' }} />
                                    <h2 style={{ margin: 0, fontSize: '1.2rem', color: 'var(--color-text-primary)' }}>
                                        {teamData.team}
                                    </h2>
                                </div>
                            </React.Fragment>
                        ))}
                    </div>
                    
                    {/* Advanced Dropdowns */}
                    <MultiSelectDropdown 
                        label="Team(s)"
                        options={leagueStandings.map(t => ({ label: t.team, value: t.team }))}
                        selectedValues={selectedTeams}
                        onChange={(newTeams) => {
                            setSelectedTeams(newTeams);
                            setIsCompareMode(newTeams.length === 2);
                        }}
                        maxSelection={2}
                    />

                    <MultiSelectDropdown 
                        label="Competition(s)"
                        options={ALL_COMPETITIONS}
                        selectedValues={selectedCompetitions}
                        onChange={setSelectedCompetitions}
                        selectAllLabel="Select All"
                    />

                    {/* Independent Games Dropdown per Team */}
                    <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                        {selectedTeams.map(team => {
                            let options = [];
                            let quickActions = [];

                            const handleMatchSelect = (ids) => {
                                setSelectedStoredMatches(prev => ({ ...prev, [team]: ids }));
                            };

                            if (team === 'Eliteserien') {
                                const allRounds = [...new Set(loadedMatches.filter(m => m.competition === 'Eliteserien' && m.round).map(m => Number(m.round)))].sort((a, b) => a - b);
                                
                                options = allRounds.map(r => ({
                                    label: `Round ${r}`,
                                    value: `round_${r}`
                                }));

                                quickActions = [
                                    { label: 'Last 3 Rounds', onClick: () => handleMatchSelect(allRounds.slice(-3).map(r => `round_${r}`)) },
                                    { label: 'Last 5 Rounds', onClick: () => handleMatchSelect(allRounds.slice(-5).map(r => `round_${r}`)) },
                                    { label: 'Last 10 Rounds', onClick: () => handleMatchSelect(allRounds.slice(-10).map(r => `round_${r}`)) }
                                ];
                            } else {
                                const teamMatches = loadedMatches
                                    .filter(m => selectedCompetitions.includes(m.competition) || selectedCompetitions.includes('All') || selectedCompetitions.length === 0)
                                    .filter(m => isTeamMatch(m.homeTeam, team) || isTeamMatch(m.awayTeam, team));
                                
                                const teamAliases = {
                                    'Bodo/Glimt': 'FK Bodø/Glimt',
                                    'Bodø/Glimt': 'FK Bodø/Glimt',
                                    'Tromso': 'Tromsø IL',
                                    'Tromsø': 'Tromsø IL',
                                    'Valerenga': 'Vålerenga IF',
                                    'Valeranga': 'Vålerenga IF',
                                    'Vålerenga': 'Vålerenga IF',
                                    'Rosenborg': 'Rosenborg BK',
                                    'Brann': 'Brann',
                                    'Sarpsborg 08': 'Sarpsborg 08',
                                    'Lillestrom': 'Lillestrøm SK',
                                    'Lillestrøm': 'Lillestrøm SK',
                                    'Aalesund': 'Aalesunds FK',
                                    'KFUM': 'KFUM Oslo',
                                    'Start': 'IK Start',
                                    'HamKam': 'Hamarkameratene',
                                    'Viking': 'Viking FK',
                                    'Molde': 'Molde FK',
                                    'Fredrikstad': 'Fredrikstad FK',
                                    'Sandefjord': 'Sandefjord Fotball',
                                    'Kristiansund': 'Kristiansund BK'
                                };
                                const getAlias = (name) => teamAliases[name] || name;

                                options = teamMatches.map(m => {
                                    const isHome = isTeamMatch(m.homeTeam, team);
                                    const rival = isHome ? m.awayTeam : m.homeTeam;
                                    
                                    let h = null;
                                    let a = null;
                                    
                                    // 1. Check if manually edited in DataHub
                                    if (m.homeScore !== undefined && m.awayScore !== undefined && m.homeScore !== '' && m.awayScore !== '') {
                                        h = parseInt(m.homeScore);
                                        a = parseInt(m.awayScore);
                                    } else {
                                        // 2. Fallback to mockData database matches
                                        const dbMatch = matches.find(dbM => 
                                            getAlias(dbM.homeTeam) === getAlias(m.homeTeam) && 
                                            getAlias(dbM.awayTeam) === getAlias(m.awayTeam) && 
                                            dbM.competition === m.competition
                                        );
                                        if (dbMatch && dbMatch.score && dbMatch.score !== null) {
                                            const parts = dbMatch.score.split('-');
                                            if (parts.length === 2) {
                                                h = parseInt(parts[0]);
                                                a = parseInt(parts[1]);
                                            }
                                        }
                                    }
                                    
                                    const score = h !== null && a !== null ? `${h} - ${a}` : '?-?';
                                    
                                    let result = '-';
                                    let resultColor = 'var(--color-text-secondary)';
                                    let resultBg = 'rgba(255,255,255,0.1)';
                                    
                                    if (h !== null && a !== null) {
                                        if (h === a) {
                                            result = 'D';
                                            resultColor = '#eab308';
                                            resultBg = 'rgba(234, 179, 8, 0.15)';
                                        } else if ((isHome && h > a) || (!isHome && a > h)) {
                                            result = 'W';
                                            resultColor = '#22c55e';
                                            resultBg = 'rgba(34, 197, 94, 0.15)';
                                        } else {
                                            result = 'L';
                                            resultColor = '#ef4444';
                                            resultBg = 'rgba(239, 68, 68, 0.15)';
                                        }
                                    }

                                    return {
                                        label: (
                                            <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'space-between', minWidth: '220px' }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                                    {getBadge(rival) && <img src={getBadge(rival)} alt={rival} style={{ width: '24px', height: '24px', objectFit: 'contain' }} />}
                                                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                                                        <span style={{ fontSize: '0.65rem', color: 'var(--color-text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Runde {m.round || '-'}</span>
                                                        <span style={{ fontWeight: 'bold', fontSize: '0.85rem' }}>{rival}</span>
                                                    </div>
                                                </div>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                                    <span style={{ fontSize: '0.85rem', fontWeight: 'bold', fontFamily: 'monospace' }}>{score}</span>
                                                    {result !== '-' && (
                                                        <span style={{ 
                                                            display: 'inline-flex', 
                                                            alignItems: 'center', 
                                                            justifyContent: 'center', 
                                                            width: '24px', 
                                                            height: '24px', 
                                                            borderRadius: '4px', 
                                                            fontSize: '0.75rem', 
                                                            fontWeight: 'bold', 
                                                            color: resultColor, 
                                                            backgroundColor: resultBg 
                                                        }}>
                                                            {result}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        ),
                                        value: m.id
                                    };
                                });
                                
                                quickActions = [
                                    { label: 'Last 3', onClick: () => handleMatchSelect(teamMatches.slice(0, 3).map(m => m.id)) },
                                    { label: 'Last 5', onClick: () => handleMatchSelect(teamMatches.slice(0, 5).map(m => m.id)) },
                                    { label: 'Last 10', onClick: () => handleMatchSelect(teamMatches.slice(0, 10).map(m => m.id)) }
                                ];
                            }

                            return (
                                <MultiSelectDropdown 
                                    key={team}
                                    label={team === 'Eliteserien' ? 'Matchdays' : `${team} Games`}
                                    options={options}
                                    selectedValues={(team === 'Eliteserien' && selectedStoredMatches[team] === undefined) ? options.map(o => o.value) : (selectedStoredMatches[team] || [])}
                                    onChange={handleMatchSelect}
                                    selectAllLabel={`Select All ${team} Matches`}
                                    quickActions={quickActions}
                                />
                            );
                        })}
                    </div>

                    {/* Push phase buttons to the right */}
                    <div style={{ flex: 1 }}></div>

                    {renderPhaseAndExport()}
                </div>
                )}
            </div>

            {/* Analysis Dashboard */}
            <div style={{ width: '100%' }}>
                {fixtureContext && storedEvents.length === 0 ? (
                    <div className="glass-panel" style={{ padding: '4rem 2rem', textAlign: 'center', color: 'var(--color-text-secondary)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '300px' }}>
                        <div style={{ fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '0.5rem', color: 'white' }}>
                            Kampen er ikke spilt eller lastet opp i databasen ennå.
                        </div>
                        <div style={{ fontSize: '0.95rem' }}>
                            The game has not been played or uploaded to the database yet.
                        </div>
                    </div>
                ) : (
                
<div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                    {activeTab === 'Attack' && (
                            <div style={{ display: 'grid', gridTemplateColumns: isCompareMode ? '1fr 1fr' : '1fr', gap: '2rem' }}>
                                {selectedTeams.map(team => {
                                    const isLeagueView = team === 'Eliteserien';
                                    const teamData = storedEvents.filter(event => isTeamMatch(event.teamName, team));

                                    // Check visibility
                                    const hasRadar = !isLeagueView && publishedVisuals.includes('AttackRadarChart');
                                    const hasFieldTilt = publishedVisuals.includes('FieldTiltMap');
                                    const hasPassNetwork = !isLeagueView && publishedVisuals.includes('PassNetworkMap');
                                    const hasOppHalfEntries = !isLeagueView && publishedVisuals.includes('OppHalfEntriesMap');
                                    const hasFinalThirdEntries = !isLeagueView && publishedVisuals.includes('FinalThirdEntriesMap');
                                    const hasLeagueChanceCreation = publishedVisuals.includes('LeagueChanceCreation');
                                    const hasShotMap = !isLeagueView && publishedVisuals.includes('ShotMap');
                                    const hasBuildUp = !isLeagueView && publishedVisuals.includes('BuildUpMap');
                                    const hasMomentum = !isLeagueView && publishedVisuals.includes('MatchMomentumChart');

                                    let oppName = 'Opponents';
                                    const teamMatchIds = selectedStoredMatches[team] || [];
                                    if (teamMatchIds.length === 1) {
                                        const matchId = teamMatchIds[0];
                                        const matchMeta = loadedMatches.find(m => m.id === matchId) || (fixtureContext?.id === matchId ? fixtureContext : null);
                                        if (matchMeta) {
                                            oppName = isTeamMatch(matchMeta.homeTeam, team) ? matchMeta.awayTeam : matchMeta.homeTeam;
                                        }
                                    }

                                    // ── LEAGUE-WIDE ATTACK VIEW ────────────────────────────────────────────────
                                    if (isLeagueView) {
                                        return (
                                            <div key={team} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                                                <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '1.5rem' }}>

                                                    {/* 1. Possession Style Scatter Chart — full width */}
                                                    <div className="glass-panel" style={{ padding: '1.5rem' }}>
                                                        <h3 className="section-title" style={{ margin: '0 0 1rem 0' }}>Possession Style</h3>
                                                        <GlobalErrorBoundary>
                                                            <PossessionStyleChart data={memoizedPossessionStyle} getBadge={getBadge} />
                                                        </GlobalErrorBoundary>
                                                    </div>

                                                    {/* 2. 3 Ranking Lists */}
                                                    <GlobalErrorBoundary>
                                                        <LeagueRankingsBoard
                                                            leagueData={globalLeagueAttackStats?.leagueData || leagueAttackStats?.leagueData}
                                                            loadedMatches={loadedMatches}
                                                            getBadge={getBadge}
                                                        />
                                                    </GlobalErrorBoundary>

                                                    {/* 3 & 4. Dominance Zones side by side */}
                                                    <div style={{ display: 'grid', gridTemplateColumns: isCompareMode ? '1fr' : '1fr 1fr', gap: '1.5rem', width: '100%' }}>
                                                        <div className="glass-panel" style={{ padding: '1.5rem', minWidth: 0 }}>
                                                            <h3 className="section-title" style={{ margin: '0 0 1rem 0' }}>Build-Up Dominance Zones</h3>
                                                            <GlobalErrorBoundary>
                                                                <LeagueBuildUpMap passes={leagueBuildUpPasses} getBadge={getBadge} />
                                                            </GlobalErrorBoundary>
                                                        </div>

                                                        <div className="glass-panel" style={{ padding: '1.5rem', minWidth: 0 }}>
                                                            <h3 className="section-title" style={{ margin: '0 0 1rem 0' }}>Final 1/3 Entries Dominance</h3>
                                                            <GlobalErrorBoundary>
                                                                <LeagueFinalThirdMap entries={leagueFinalThirdEntries} getBadge={getBadge} loadedMatches={loadedMatches} />
                                                            </GlobalErrorBoundary>
                                                        </div>
                                                    </div>

                                                    {/* 5. Chance Creation Bar Chart — full width */}
                                                    <div className="glass-panel" style={{ padding: '1.5rem' }}>
                                                        <h3 className="section-title" style={{ margin: '0 0 1rem 0' }}>Chance Creation Profile</h3>
                                                        <GlobalErrorBoundary>
                                                            <LeagueChanceCreation
                                                                chanceStats={globalLeagueChanceCreation || leagueChanceStats?.created}
                                                                getBadge={getBadge}
                                                                selectedTeam={null}
                                                            />
                                                        </GlobalErrorBoundary>
                                                    </div>

                                                </div>
                                            </div>
                                        );
                                    }

                                    // ── INDIVIDUAL TEAM ATTACK VIEW ────────────────────────────────────────────
                                    return (
                                        <div key={team} style={{ display: 'flex', flexDirection: 'column', gap: '2rem', marginBottom: '2rem' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '0.5rem' }}>
                                                {getBadge(team) && <img src={getBadge(team)} alt={team} style={{ width: '30px', height: '30px', objectFit: 'contain' }} />}
                                                <h2 style={{ margin: 0, fontSize: '1.5rem', color: TEAM_COLORS[team] || '#fff' }}>{team}</h2>
                                            </div>

                                            <div style={{ display: 'grid', gridTemplateColumns: isCompareMode ? '1fr' : '1fr 1fr', gap: '1.5rem' }}>

                                                {/* 1. Shot Map */}
                                                {!isLeagueView && teamData.some(e => e.typeId === 13 || e.typeId === 14 || e.typeId === 15 || e.typeId === 16) && (
                                                    <div className="glass-panel" style={{ padding: '1.5rem' }}>
                                                        <h3 className="section-title" style={{ margin: '0 0 1rem 0' }}>Shot Map</h3>
                                                        <GlobalErrorBoundary>
                                                            <ShotMap shots={extractShotsFromOpta(teamData, [team], isTeamMatch)} />
                                                        </GlobalErrorBoundary>
                                                    </div>
                                                )}

                                                {/* 2. Build-Up Distribution Map */}
                                                {!isLeagueView && teamData.length > 0 && (
                                                    <div className="glass-panel" style={{ padding: '1.5rem' }}>
                                                        <h3 className="section-title" style={{ margin: '0 0 1rem 0' }}>Build-Up Distribution</h3>
                                                        <GlobalErrorBoundary>
                                                            <BuildUpMap passes={extractBuildUpFromOpta(teamData, [team], isTeamMatch)} />
                                                        </GlobalErrorBoundary>
                                                    </div>
                                                )}

                                                {/* 3. Opp. Half Entries */}
                                                {!isLeagueView && (
                                                    <div className="glass-panel" style={{ padding: '1.5rem' }}>
                                                        <h3 className="section-title" style={{ margin: '0 0 1rem 0' }}>Opponent Half Entries</h3>
                                                        <GlobalErrorBoundary>
                                                            <OppHalfEntriesMap entries={extractOppHalfEntries(storedEvents, [team], isTeamMatch)} />
                                                        </GlobalErrorBoundary>
                                                    </div>
                                                )}

                                                {/* 4. Final 1/3 Entries */}
                                                {!isLeagueView && (
                                                    <div className="glass-panel" style={{ padding: '1.5rem' }}>
                                                        <h3 className="section-title" style={{ margin: '0 0 1rem 0' }}>Final Third Entries</h3>
                                                        <GlobalErrorBoundary>
                                                            <FinalThirdEntriesMap entries={extractFinalThirdEntries(storedEvents, [team], isTeamMatch)} />
                                                        </GlobalErrorBoundary>
                                                    </div>
                                                )}

                                                {/* 5. Field Tilt */}
                                                {!isLeagueView && publishedVisuals.includes('FieldTiltMap') && (
                                                    <div className="glass-panel" style={{ padding: '1.5rem' }}>
                                                        <h3 className="section-title" style={{ margin: '0 0 1rem 0' }}>Field Tilt</h3>
                                                        <GlobalErrorBoundary>
                                                            <FieldTiltMap {...extractFieldTilt(storedEvents, team, isTeamMatch)} teamName={team} opponentName={oppName} />
                                                        </GlobalErrorBoundary>
                                                    </div>
                                                )}

                                                {/* 6. Pass Network */}
                                                {!isLeagueView && publishedVisuals.includes('PassNetworkMap') && (
                                                    <div className="glass-panel" style={{ padding: '1.5rem' }}>
                                                        <h3 className="section-title" style={{ margin: '0 0 1rem 0' }}>Pass Network</h3>
                                                        <GlobalErrorBoundary>
                                                            <PassNetworkMap networkData={extractPassNetworkFromOpta(teamData, team, isTeamMatch)} teamColor={TEAM_COLORS[team] || '#FFFFFF'} />
                                                        </GlobalErrorBoundary>
                                                    </div>
                                                )}

                                                {/* 7. Attack Profile Radar Chart */}
                                                {!isLeagueView && (
                                                    <div className="glass-panel" style={{ padding: '1.5rem', gridColumn: '1 / -1' }}>
                                                        <h3 className="section-title" style={{ margin: '0 0 1rem 0' }}>Attacking Profile</h3>
                                                        <GlobalErrorBoundary>
                                                            <AttackRadarChart
                                                                localTeamStats={leagueAttackStats?.leagueData?.[team] || Object.values(leagueAttackStats?.leagueData || {}).find(d => d.teamName === team) || null}
                                                                globalTeamStats={globalLeagueAttackStats?.leagueData?.[team] || null}
                                                                teamName={team}
                                                                teamColor={TEAM_COLORS[team] || '#ef4444'}
                                                                totalTeams={16}
                                                            />
                                                        </GlobalErrorBoundary>
                                                    </div>
                                                )}

                                                {/* 8. Chance Creation stacked bar chart */}
                                                {!isLeagueView && (
                                                    <div className="glass-panel" style={{ padding: '1.5rem', gridColumn: '1 / -1' }}>
                                                        <h3 className="section-title" style={{ margin: '0 0 1rem 0' }}>Chance Creation Profile</h3>
                                                        <GlobalErrorBoundary>
                                                            <LeagueChanceCreation
                                                                chanceStats={leagueChanceStats?.created || globalLeagueChanceCreation}
                                                                getBadge={getBadge}
                                                                selectedTeam={teamData.length > 0 ? teamData[0].teamName : team}
                                                            />
                                                        </GlobalErrorBoundary>
                                                    </div>
                                                )}

                                                {/* 9. Match Momentum Chart (full width) */}
                                                {!isLeagueView && (
                                                    <div className="glass-panel" style={{ padding: '1.5rem', gridColumn: '1 / -1' }}>
                                                        <h3 className="section-title" style={{ margin: '0 0 1rem 0' }}>Match Momentum</h3>
                                                        <GlobalErrorBoundary>
                                                            <MatchMomentumChart
                                                                selectedData={extractMatchMomentum(teamMatchIds.length > 0 ? storedEvents.filter(e => teamMatchIds.map(String).includes(String(e.matchId))) : storedEvents, [team, oppName], isTeamMatch)}
                                                                teamName={team}
                                                                opponentName={oppName}
                                                                isNeutral={false}
                                                            />
                                                        </GlobalErrorBoundary>
                                                    </div>
                                                )}

                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}

                    {activeTab === 'Defence' && (
                        <div style={{ display: 'grid', gridTemplateColumns: isCompareMode ? '1fr 1fr' : '1fr', gap: '2rem' }}>
                            {selectedTeams.map(team => {
                                const isLeagueView = team === 'Eliteserien';
                                const teamData = storedEvents.filter(event => isTeamMatch(event.teamName, team));

                                const hasBallRecovery = !isLeagueView && publishedVisuals.includes('BallRecoveryMap');
                                const hasAverageDefensiveActionHeight = !isLeagueView && publishedVisuals.includes('AverageDefensiveActionHeight');
                                const hasBlockCompactness = !isLeagueView && publishedVisuals.includes('BlockCompactness');
                                const hasPpdaCard = publishedVisuals.includes('PpdaCard');
                                const hasBdpChart = publishedVisuals.includes('BdpChart');
                                const hasDefenceRadar = !isLeagueView && publishedVisuals.includes('DefenceRadarChart');

                                        let oppName = 'Opponents';
                                        const teamMatchIds = selectedStoredMatches[team] || [];
                                        if (teamMatchIds.length === 1) {
                                            const matchId = teamMatchIds[0];
                                            const matchMeta = loadedMatches.find(m => m.id === matchId) || (fixtureContext?.id === matchId ? fixtureContext : null);
                                            if (matchMeta) {
                                                oppName = isTeamMatch(matchMeta.homeTeam, team) ? matchMeta.awayTeam : matchMeta.homeTeam;
                                            }
                                        }

                                        // ── LEAGUE-WIDE DEFENCE VIEW ──────────────────────────────────────────────
                                        if (isLeagueView) {
                                            return (
                                                <div key={team} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '1.5rem' }}>
                                                        
                                                        {/* 1. Defensive Style Scatter Chart (Full width) */}
                                                        <div className="glass-panel" style={{ padding: '1.5rem', gridColumn: '1 / -1' }}>
                                                            <h3 className="section-title" style={{ margin: '0 0 1rem 0' }}>Defensive Style</h3>
                                                            <GlobalErrorBoundary>
                                                                <DefensiveStyleChart data={globalLeagueDefenceStats || leagueDefenceStats} getBadge={getBadge} />
                                                            </GlobalErrorBoundary>
                                                        </div>

                                                        {/* 2. 3 Ranking lists */}
                                                        <GlobalErrorBoundary>
                                                            <LeagueDefenceRankingsBoard 
                                                                leagueData={globalLeagueDefenceStats?.leagueData || leagueDefenceStats?.leagueData} 
                                                                getBadge={getBadge} 
                                                            />
                                                        </GlobalErrorBoundary>

                                                        {/* 3. BDP line chart for all teams (75% horizontal width) */}
                                                        <div className="glass-panel" style={{ padding: '1.5rem', gridColumn: '1 / -1', width: '75%', margin: '0 auto' }}>
                                                            <h3 className="section-title" style={{ margin: '0 0 1rem 0' }}>Build-Up Disruption Performance</h3>
                                                            <GlobalErrorBoundary>
                                                                <LeagueBdpChart 
                                                                    data={globalBdpLeagueStats || []} 
                                                                    getBadge={getBadge} 
                                                                />
                                                            </GlobalErrorBoundary>
                                                        </div>

                                                        {/* 4. Chances Conceded Bar chart (full width) */}
                                                        <div className="glass-panel" style={{ padding: '1.5rem', gridColumn: '1 / -1' }}>
                                                            <h3 className="section-title" style={{ margin: '0 0 1rem 0' }}>Chances Conceded Profile</h3>
                                                            <GlobalErrorBoundary>
                                                                <LeagueChancesConceded 
                                                                    chanceStats={globalLeagueChancesConceded || leagueChanceStats?.conceded} 
                                                                    getBadge={getBadge}
                                                                    selectedTeam={null}
                                                                />
                                                            </GlobalErrorBoundary>
                                                        </div>

                                                    </div>
                                                </div>
                                            );
                                        }

                                        // ── INDIVIDUAL TEAM DEFENCE VIEW ──────────────────────────────────────────
                                        return (
                                            <div key={team} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                                                <h2 className="section-title" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', color: 'var(--color-text-primary)', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '0.5rem', marginBottom: '0.5rem' }}>
                                                    <img src={getBadge(team)} alt={team} style={{ width: '28px', height: '28px', objectFit: 'contain' }} />
                                                    {team}
                                                </h2>
                                                <div style={{ display: 'grid', gridTemplateColumns: isCompareMode ? '1fr' : '1fr 1fr', gap: '1.5rem' }}>
                                                    {hasBdpChart && (
                                                        <div className="glass-panel" style={{ padding: '1.5rem', gridColumn: '1 / -1' }}>
                                                            {isBdpLoading ? (
                                                                <div style={{ height: '350px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-text-secondary)' }}>
                                                                    <div className="loading-spinner" style={{ width: '30px', height: '30px', border: '3px solid rgba(255,255,255,0.1)', borderTopColor: 'var(--color-primary)', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
                                                                    <span style={{ marginLeft: '1rem' }}>Calculating season baseline across all matches...</span>
                                                                </div>
                                                            ) : (
                                                                <GlobalErrorBoundary>
                                                                <BuildUpDisruptionChart 
                                                                    data={bdpData[team] || []} 
                                                                    teamName={team} 
                                                                    teamColor={TEAM_COLORS[team] || 'var(--color-primary)'} 
                                                                    getBadge={getBadge}
                                                                    leagueStats={bdpLeagueStats[team]}
                                                                />
                                                                </GlobalErrorBoundary>
                                                            )}
                                                        </div>
                                                    )}

                                                    {publishedVisuals.includes('PpdaCard') && (
                                                        <div className="glass-panel" style={{ padding: '1.5rem' }}>
                                                            <h3 className="section-title" style={{ marginTop: 0 }}>Passes per Defensive Action</h3>
                                                            <div style={{ width: '100%' }}>
                                                                <GlobalErrorBoundary>
                                                                <PpdaCard 
                                                                    teamName={team}
                                                                    ppdaValue={leagueDefenceStats?.leagueData?.[team]?.raw?.ppda || globalLeagueDefenceStats?.leagueData?.[team]?.raw?.ppda || 0}
                                                                    rank={(() => { const sorted = Object.entries(globalLeagueDefenceStats?.leagueData || {}).filter(([name]) => name !== 'League Average').map(([name, data]) => ({ teamName: name, ppda: data.raw?.ppda || 0 })).sort((a, b) => a.ppda - b.ppda); const idx = sorted.findIndex(t => t.teamName === team); return idx !== -1 ? idx + 1 : 0; })()}
                                                                    totalTeams={16}
                                                                    getBadge={getBadge}
                                                                    selectedFixturesCount={teamMatchIds?.length || 0}
                                                                    leagueData={Object.entries(globalLeagueDefenceStats?.leagueData || {}).filter(([name]) => name !== 'League Average').map(([name, data]) => ({ teamName: name, ppda: data.raw?.ppda || 0 })).sort((a, b) => a.ppda - b.ppda).map((t, i) => ({ ...t, rank: i + 1 }))}
                                                                />
                                                                </GlobalErrorBoundary>
                                                            </div>
                                                        </div>
                                                    )}

                                                    {hasBallRecovery && (
                                                        <div className="glass-panel" style={{ padding: '1.5rem' }}>
                                                            <h3 className="section-title" style={{ marginTop: 0 }}>Ball Recovery Map</h3>
                                                            <GlobalErrorBoundary>
                                                            <BallRecoveryMap recoveries={extractBallRecoveriesFromOpta(teamData, [team], isTeamMatch)} />
                                                            </GlobalErrorBoundary>
                                                        </div>
                                                    )} 

                                                    {hasAverageDefensiveActionHeight && (() => {
                                                        const oppData = storedEvents.filter(event => !isTeamMatch(event.teamName, team));
                                                        
                                                        let oppName = 'Opponents';
                                                        const teamMatchIds = selectedStoredMatches[team] || [];
                                                        if (teamMatchIds.length === 1) {
                                                            const matchId = teamMatchIds[0];
                                                            const matchMeta = loadedMatches.find(m => m.id === matchId) || (fixtureContext && fixtureContext.id === matchId ? fixtureContext : null);
                                                            if (matchMeta) {
                                                                oppName = isTeamMatch(matchMeta.homeTeam, team) ? matchMeta.awayTeam : matchMeta.homeTeam;
                                                            }
                                                        }
                                                        
                                                        return (
                                                            <div className="glass-panel" style={{ padding: '1.5rem', gridColumn: isCompareMode ? '1 / -1' : 'auto' }}>
                                                                <h3 className="section-title" style={{ marginTop: 0 }}>Avg Defensive Action Height</h3>
                                                                <GlobalErrorBoundary>
                                                                <AverageDefensiveActionHeight 
                                                                    teamName={team}
                                                                    teamColor={TEAM_COLORS[team] || 'var(--color-primary)'}
                                                                    teamData={extractDefensiveActionsFromOpta(teamData, [team], isTeamMatch)}
                                                                    opponentName={oppName}
                                                                    opponentColor={oppName === 'Opponents' ? '#1e3a8a' : (TEAM_COLORS[oppName] || '#ffffff')}
                                                                    opponentData={extractDefensiveActionsFromOpta(oppData, [], isTeamMatch)}
                                                                    leagueData={leagueDefensiveHeight !== null ? [{x: leagueDefensiveHeight.avg}] : null}
                                                                />
                                                                </GlobalErrorBoundary>
                                                            </div>
                                                        );
                                                    })()}

                                                    {hasBlockCompactness && (() => {
                                                        const oppData = storedEvents.filter(event => !isTeamMatch(event.teamName, team));
                                                        
                                                        let oppName = 'Opponents';
                                                        const teamMatchIds = selectedStoredMatches[team] || [];
                                                        if (teamMatchIds.length === 1) {
                                                            const matchId = teamMatchIds[0];
                                                            const matchMeta = loadedMatches.find(m => m.id === matchId) || (fixtureContext && fixtureContext.id === matchId ? fixtureContext : null);
                                                            if (matchMeta) {
                                                                oppName = isTeamMatch(matchMeta.homeTeam, team) ? matchMeta.awayTeam : matchMeta.homeTeam;
                                                            }
                                                        }
                                                        
                                                        return (
                                                            <div className="glass-panel" style={{ padding: '1.5rem', gridColumn: isCompareMode ? '1 / -1' : 'auto' }}>
                                                                <h3 className="section-title" style={{ marginTop: 0 }}>Block Compactness</h3>
                                                                <GlobalErrorBoundary>
                                                                <BlockCompactness 
                                                                    teamName={team}
                                                                    teamColor={TEAM_COLORS[team] || 'var(--color-primary)'}
                                                                    teamData={extractDefensiveActionsFromOpta(teamData, [team], isTeamMatch)}
                                                                    opponentName={oppName}
                                                                    opponentColor={oppName === 'Opponents' ? '#1e3a8a' : (TEAM_COLORS[oppName] || '#ffffff')}
                                                                    opponentData={extractDefensiveActionsFromOpta(oppData, [], isTeamMatch)}
                                                                    leagueStats={leagueDefensiveHeight}
                                                                />
                                                                </GlobalErrorBoundary>
                                                            </div>
                                                        );
                                                    })()}

                                                    {hasDefenceRadar && (
                                                        <div className="glass-panel fade-in" style={{ padding: '1.5rem', gridColumn: '1 / -1' }}>
                                                            <h3 className="section-title" style={{ marginTop: 0 }}>Defence Radar Profile</h3>
                                                            <GlobalErrorBoundary>
                                                            <DefenceRadarChart 
                                                                localTeamStats={leagueDefenceStats?.leagueData?.[team] || null}
                                                                globalTeamStats={globalLeagueDefenceStats?.leagueData?.[team] || null}
                                                                teamName={team}
                                                                teamColor={TEAM_COLORS[team] || '#ef4444'}
                                                                totalTeams={16}
                                                            />
                                                            </GlobalErrorBoundary>
                                                        </div>
                                                    )}

                                                    {!isLeagueView && (
                                                        <div className="glass-panel" style={{ padding: '1.5rem', gridColumn: '1 / -1' }}>
                                                            <h3 className="section-title" style={{ margin: '0 0 1rem 0' }}>Chances Conceded Profile</h3>
                                                            <GlobalErrorBoundary>
                                                            <LeagueChancesConceded 
                                                                chanceStats={leagueChanceStats?.conceded || globalLeagueChancesConceded} 
                                                                getBadge={getBadge}
                                                                selectedTeam={team}
                                                            />
                                                            </GlobalErrorBoundary>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}

                            {activeTab === 'Transitions' && (
                                <div style={{ display: 'grid', gridTemplateColumns: isCompareMode ? '1fr 1fr' : '1fr', gap: '2rem' }}>
                                    {selectedTeams.map(team => {
                                        const isLeagueView = team === 'Eliteserien';

                                        // ── INDIVIDUAL TEAM TRANSITIONS VIEW ──────────────────────────────────────
                                        
                                        const teamData = storedEvents.filter(event => {
                                        const meta = loadedMatches.find(m => m.id === event.matchId);
                                        if (!meta) return false;
                                        let eventTeam = 'Unknown';
                                        if (meta.homeContestantId && event.contestantId === meta.homeContestantId) eventTeam = meta.homeTeam;
                                        else if (meta.awayContestantId && event.contestantId === meta.awayContestantId) eventTeam = meta.awayTeam;
                                        else if (event.teamName && isTeamMatch(event.teamName, meta.homeTeam)) eventTeam = meta.homeTeam;
                                        else if (event.teamName && isTeamMatch(event.teamName, meta.awayTeam)) eventTeam = meta.awayTeam;
                                        
                                        return event.matchId; 
                                    });

                                    const matchIds = [...new Set(teamData.map(e => e.matchId))];
                                    let allMatchEvents = [];
                                    matchIds.forEach(id => {
                                        allMatchEvents = allMatchEvents.concat(storedEvents.filter(e => e.matchId === id));
                                    });
                                    let rivalName = 'Opponents';
                                    let rivalColor = '#38bdf8'; // Default Eliteserien Blue
                                    const blueTeams = ['Molde', 'Molde FK', 'Vålerenga', 'Vålerenga IF', 'Sarpsborg 08', 'Sarpsborg', 'Kristiansund', 'Kristiansund BK'];
                                    if (blueTeams.includes(team)) rivalColor = '#ef4444'; // Red for contrast against blue teams

                                    if (matchIds.length === 1) {
                                        const matchMeta = loadedMatches.find(m => m.id === matchIds[0]);
                                        if (matchMeta) {
                                            const opponentName = isTeamMatch(matchMeta.homeTeam, team) ? matchMeta.awayTeam : matchMeta.homeTeam;
                                            rivalColor = TEAM_COLORS[opponentName] || rivalColor;
                                            rivalName = opponentName;
                                        }
                                    }

                                    const hasTransitionMap = !isLeagueView && publishedVisuals.includes('TransitionMap');
                                    const hasDefensiveTransitionMap = !isLeagueView && publishedVisuals.includes('DefensiveTransitionMap');
                                    const hasRecoveryZonesMap = !isLeagueView && publishedVisuals.includes('RecoveryZonesMap');
                                    const hasTransitionTime = !isLeagueView && publishedVisuals.includes('TransitionTimeChart');
                                    const hasTransitionsRadar = true; // always show for individual team view
                                    
                                    const localTeamStats = (() => {
                                        if (isLeagueView) return globalLeagueTransitionStats?.leagueData?.[team] || null;
                                        if (!leagueTransitionStats) return null;
                                        
                                        const getStats = (dataObj) => {
                                            if (!dataObj) return null;
                                            if (dataObj[team]) return dataObj[team];
                                            const matchKey = Object.keys(dataObj).find(k => isTeamMatch(k, team));
                                            return matchKey ? dataObj[matchKey] : null;
                                        };
                                        return getStats(leagueTransitionStats?.leagueData);
                                    })();

                                    // Always render transitions section for individual team view

                                    return (
                                        <div key={team} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                                            <h2 className="section-title" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', color: 'var(--color-text-primary)', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '0.5rem', marginBottom: '0.5rem' }}>
                                                <img src={getBadge(team)} alt={team} style={{ width: '28px', height: '28px', objectFit: 'contain' }} />
                                                {team}
                                            </h2>
                                            
                                            <div style={{ display: 'grid', gridTemplateColumns: isCompareMode ? '1fr' : '1fr 1fr', gap: '1.5rem' }}>
                                                {hasTransitionTime && (
                                                    <div className="glass-panel" style={{ padding: '1.5rem' }}>
                                                        <h3 className="section-title" style={{ marginTop: 0 }}>Time to Action Distribution</h3>
                                                        <GlobalErrorBoundary>
                                                        <TransitionTimeChart 
                                                            data={extractTransitionTimes(allMatchEvents, team, isTeamMatch)}
                                                            teamName={team}
                                                            teamColor={TEAM_COLORS[team] || 'var(--color-primary)'}
                                                            rivalColor={rivalColor}
                                                            rivalName={rivalName}
                                                        />
                                                        </GlobalErrorBoundary>
                                                    </div>
                                                )}

                                                {hasTransitionMap && (
                                                    <div className="glass-panel" style={{ padding: '1.5rem' }}>
                                                        <h3 className="section-title" style={{ marginTop: 0 }}>Attack Transition Zones</h3>
                                                        <GlobalErrorBoundary>
                                                        <TransitionMap transitions={extractTransitionsFromOpta(allMatchEvents, [team], isTeamMatch)} />
                                                        </GlobalErrorBoundary>
                                                    </div>
                                                )}
                                                {hasDefensiveTransitionMap && (
                                                    <div className="glass-panel" style={{ padding: '1.5rem' }}>
                                                        <h3 className="section-title" style={{ marginTop: 0 }}>Defensive Transition Zones</h3>
                                                        <GlobalErrorBoundary>
                                                        <DefensiveTransitionMap transitions={extractConcededTransitionsFromOpta(allMatchEvents, [team], isTeamMatch)} />
                                                        </GlobalErrorBoundary>
                                                    </div>
                                                )}
                                                {hasRecoveryZonesMap && (
                                                    <div className="glass-panel" style={{ padding: '1.5rem' }}>
                                                        <h3 className="section-title" style={{ marginTop: 0 }}>Transitions by Zone</h3>
                                                        <GlobalErrorBoundary>
                                                        <RecoveryZonesMap 
                                                            teamName={team} 
                                                            teamLogo={getBadge(team)} 
                                                            teamColor={TEAM_COLORS[team]} 
                                                            attackingData={extractBallRecoveriesFromOpta(allMatchEvents, [team], isTeamMatch)} 
                                                            defensiveData={extractConcededTransitionsFromOpta(allMatchEvents, [team], isTeamMatch)} 
                                                        />
                                                        </GlobalErrorBoundary>
                                                    </div>
                                                )}
                                                {!isLeagueView && (
                                                    <div style={{ gridColumn: '1 / -1', display: 'grid', gridTemplateColumns: isCompareMode ? '1fr' : '1fr 1fr', gap: '1.5rem' }}>
                                                        <div className="glass-panel" style={{ padding: '1.5rem', minHeight: '550px' }}>
                                                            <h3 className="section-title" style={{ marginTop: 0 }}>Attacking Transitions Profile</h3>
                                                            
                                                                <GlobalErrorBoundary>
                                                                <TransitionRadarChart 
                                                                    type="offensive"
                                                                    teamName={team} 
                                                                    teamColor={TEAM_COLORS[team] || 'var(--color-primary)'}
                                                                    localTeamStats={localTeamStats}
                                                                    globalTeamStats={(() => {
                                                                        const getStats = (dataObj) => {
                                                                            if (!dataObj) return null;
                                                                            if (dataObj[team]) return dataObj[team];
                                                                            const matchKey = Object.keys(dataObj).find(k => isTeamMatch(k, team));
                                                                            return matchKey ? dataObj[matchKey] : null;
                                                                        };
                                                                        return getStats(globalLeagueTransitionStats?.leagueData);
                                                                    })()}
                                                                    totalTeams={globalLeagueTransitionStats?.totalTeams || 16}
                                                                    selectedCount={isLeagueView ? loadedMatches.filter(m => m.competition === 'Eliteserien').length : (selectedStoredMatches[team]?.length || 1)}
                                                                />
                                                                </GlobalErrorBoundary>
                                                            
                                                        </div>
                                                        <div className="glass-panel" style={{ padding: '1.5rem', minHeight: '550px' }}>
                                                            <h3 className="section-title" style={{ marginTop: 0 }}>Defensive Transitions Profile</h3>
                                                            
                                                                <GlobalErrorBoundary>
                                                                <TransitionRadarChart 
                                                                    type="defensive"
                                                                    teamName={team} 
                                                                    teamColor={TEAM_COLORS[team] || 'var(--color-primary)'}
                                                                    localTeamStats={localTeamStats}
                                                                    globalTeamStats={(() => {
                                                                        const getStats = (dataObj) => {
                                                                            if (!dataObj) return null;
                                                                            if (dataObj[team]) return dataObj[team];
                                                                            const matchKey = Object.keys(dataObj).find(k => isTeamMatch(k, team));
                                                                            return matchKey ? dataObj[matchKey] : null;
                                                                        };
                                                                        return getStats(globalLeagueTransitionStats?.leagueData);
                                                                    })()}
                                                                    totalTeams={globalLeagueTransitionStats?.totalTeams || 16}
                                                                    selectedCount={isLeagueView ? loadedMatches.filter(m => m.competition === 'Eliteserien').length : (selectedStoredMatches[team]?.length || 1)}
                                                                />
                                                                </GlobalErrorBoundary>
                                                            
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                                {isLeagueView && (
                                                    <div style={{ gridColumn: '1 / -1', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                                                        <div className="glass-panel" style={{ padding: '1.5rem', minHeight: '550px' }}>
                                                            <h3 className="section-title" style={{ marginTop: 0 }}>League Attacking Transitions</h3>
                                                            {globalLeagueTransitionStats?.leagueData && (
                                                                <GlobalErrorBoundary>
                                                                <AttackingTransitionScatterChart leagueData={globalLeagueTransitionStats.leagueData} getBadge={getBadge} />
                                                                </GlobalErrorBoundary>
                                                            )}
                                                        </div>
                                                        <div className="glass-panel" style={{ padding: '1.5rem', minHeight: '550px' }}>
                                                            <h3 className="section-title" style={{ marginTop: 0 }}>League Defensive Transitions</h3>
                                                            {globalLeagueTransitionStats?.leagueData && (
                                                                <GlobalErrorBoundary>
                                                                <DefensiveTransitionScatterChart leagueData={globalLeagueTransitionStats.leagueData} getBadge={getBadge} />
                                                                </GlobalErrorBoundary>
                                                            )}
                                                        </div>
                                                    </div>
                                                )}
                                        </div>
                                    );
                                })}
                                
                                {selectedTeams.length > 0 && !publishedVisuals.includes('TransitionMap') && !publishedVisuals.includes('DefensiveTransitionMap') && !publishedVisuals.includes('RecoveryZonesMap') && !publishedVisuals.includes('TransitionTimeChart') && !publishedVisuals.includes('transitionsRadar') && (
                                    <div className="glass-panel" style={{ height: '200px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-text-secondary)', gridColumn: '1 / -1' }}>
                                        No Transitions visualizations published. Head to the Settings playground to configure and publish them.
                                    </div>
                                )}
                            </div>
                        )}

                    {activeTab === 'Set-Pieces' && (
                        <div style={{ display: 'grid', gridTemplateColumns: isCompareMode ? '1fr 1fr' : '1fr', gap: '2rem' }}>
                            {selectedTeams.map(team => {
                                const isLeagueView = team === 'Eliteserien';

                                // ── LEAGUE-WIDE SET-PIECES VIEW ──────────────────────────────────────────────
                                if (isLeagueView) {
                                    return (
                                        <div key={team} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                                            <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '1.5rem' }}>
                                                <div className="glass-panel" style={{ padding: '1.5rem', gridColumn: '1 / -1' }}>
                                                    <h3 className="section-title" style={{ margin: '0 0 1rem 0' }}>League Set-Piece Performance</h3>
                                                    <GlobalErrorBoundary>
                                                        <SetPieceTable data={globalLeagueSetPieceTable} getBadge={getBadge} />
                                                    </GlobalErrorBoundary>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                }

                                // ── INDIVIDUAL TEAM SET-PIECES VIEW ──────────────────────────────────────
                                const teamData = storedEvents.filter(event => isTeamMatch(event.teamName, team));

                                const cornerData = extractCornerDeliveriesFromOpta(teamData, [team], isTeamMatch);
                                const cornerZoneData = extractCornersFromOpta(teamData, [team], isTeamMatch);
                                const freeKickData = extractWideFreeKickDeliveriesFromOpta(teamData, [team], isTeamMatch);
                                const throwInData = extractThrowInsFromOpta(teamData, [team], isTeamMatch);
                                const throwInTargetData = extractThrowInTargets(teamData, team, isTeamMatch);

                                return (
                                    <div key={team} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                                        <h2 className="section-title" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', color: 'var(--color-text-primary)', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '0.5rem', marginBottom: '0.5rem' }}>
                                            <img src={getBadge(team)} alt={team} style={{ width: '28px', height: '28px', objectFit: 'contain' }} />
                                            {team}
                                        </h2>

                                        <div style={{ display: 'grid', gridTemplateColumns: isCompareMode ? '1fr' : '1fr 1fr', gap: '1.5rem' }}>

                                            {/* 1. Corner Delivery Zones — full width */}
                                            <div className="glass-panel" style={{ padding: '1.5rem', gridColumn: '1 / -1' }}>
                                                <h3 className="section-title" style={{ marginTop: 0 }}>Corner Delivery Zones</h3>
                                                <GlobalErrorBoundary>
                                                <CornerDistributionMap
                                                    data={cornerZoneData}
                                                    teamName={team}
                                                />
                                                </GlobalErrorBoundary>
                                            </div>

                                            {/* 2. Corner Delivery Types (arrows) */}
                                            <div className="glass-panel" style={{ padding: '1.5rem' }}>
                                                <h3 className="section-title" style={{ marginTop: 0 }}>Corner Delivery Types</h3>
                                                <div style={{ height: '350px' }}>
                                                    <GlobalErrorBoundary>
                                                    <CornerDeliveryArrows
                                                        teamName={team}
                                                        data={cornerData}
                                                    />
                                                    </GlobalErrorBoundary>
                                                </div>
                                            </div>

                                            {/* 3. Corner Delivery Type Donut */}
                                            <div className="glass-panel" style={{ padding: '1.5rem' }}>
                                                <h3 className="section-title" style={{ marginTop: 0 }}>Corner Delivery Split</h3>
                                                <div style={{ height: '350px' }}>
                                                    <GlobalErrorBoundary>
                                                    <CornerDeliveryDonut
                                                        data={cornerData}
                                                        teamName={team}
                                                    />
                                                    </GlobalErrorBoundary>
                                                </div>
                                            </div>

                                            {/* 4. Free Kick Delivery Type (arrows) */}
                                            <div className="glass-panel" style={{ padding: '1.5rem' }}>
                                                <h3 className="section-title" style={{ marginTop: 0 }}>Free Kick Delivery Types</h3>
                                                <div style={{ height: '350px' }}>
                                                    <GlobalErrorBoundary>
                                                    <FreeKickDeliveryArrows
                                                        teamName={team}
                                                        data={freeKickData}
                                                    />
                                                    </GlobalErrorBoundary>
                                                </div>
                                            </div>

                                            {/* 5. Free Kick Delivery Type Donut */}
                                            <div className="glass-panel" style={{ padding: '1.5rem' }}>
                                                <h3 className="section-title" style={{ marginTop: 0 }}>Free Kick Delivery Split</h3>
                                                <div style={{ height: '350px' }}>
                                                    <GlobalErrorBoundary>
                                                    <FreeKickDeliveryDonut
                                                        data={freeKickData}
                                                        teamName={team}
                                                    />
                                                    </GlobalErrorBoundary>
                                                </div>
                                            </div>

                                            {/* 6. Throw-in Distance Field */}
                                            <div className="glass-panel" style={{ padding: '1.5rem' }}>
                                                <h3 className="section-title" style={{ marginTop: 0 }}>Throw-in Zones</h3>
                                                <GlobalErrorBoundary>
                                                <ThrowInZonesMap
                                                    data={throwInData}
                                                    teamName={team}
                                                />
                                                </GlobalErrorBoundary>
                                            </div>

                                            {/* 7. Throw-in Targets */}
                                            <div className="glass-panel" style={{ padding: '1.5rem' }}>
                                                <h3 className="section-title" style={{ marginTop: 0 }}>Throw-in Targets</h3>
                                                <GlobalErrorBoundary>
                                                <ThrowInTargetLeaders
                                                    data={throwInTargetData}
                                                    teamName={team}
                                                />
                                                </GlobalErrorBoundary>
                                            </div>

                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}

                    {activeTab !== 'Attack' && activeTab !== 'Set-Pieces' && activeTab !== 'Defence' && activeTab !== 'Transitions' && (
                        <div className="glass-panel" style={{ height: '400px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-text-secondary)' }}>
                            No {activeTab} visualizations published. Head to the Settings playground to configure and publish them.
                        </div>
                    )}
                </div>
                )}
            </div>
        </div>
    );
};

export default MatchAnalysis;
