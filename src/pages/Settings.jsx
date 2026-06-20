import React, { useState } from 'react';
import { getCachedBadge } from '../utils/badgeCache';
import { useMatchData } from '../context/MatchDataContext';
import ShotMap from '../components/visualizations/ShotMap';
import BuildUpMap from '../components/visualizations/BuildUpMap';
import MatchMomentumChart from '../components/visualizations/MatchMomentumChart';
import FieldTiltMap from '../components/visualizations/FieldTiltMap';
import CornerDistributionMap from '../components/visualizations/CornerDistributionMap';
import FreeKickDeliveryMap from '../components/visualizations/FreeKickDeliveryMap';
import FreeKickDeliveryArrows from '../components/visualizations/FreeKickDeliveryArrows';
import CornerDeliveryArrows from '../components/visualizations/CornerDeliveryArrows';
import CornerDeliveryDonut from '../components/visualizations/CornerDeliveryDonut';
import FreeKickDeliveryDonut from '../components/visualizations/FreeKickDeliveryDonut';
import ThrowInZonesMap from '../components/visualizations/ThrowInZonesMap';
import ThrowInTargetLeaders from '../components/visualizations/ThrowInTargetLeaders';
import BallRecoveryMap from '../components/visualizations/BallRecoveryMap';
import AverageDefensiveActionHeight from '../components/visualizations/AverageDefensiveActionHeight';
import BlockCompactness from '../components/visualizations/BlockCompactness';
import TransitionMap from '../components/visualizations/TransitionMap';
import DefensiveTransitionMap from '../components/visualizations/DefensiveTransitionMap';
import RecoveryZonesMap from '../components/visualizations/RecoveryZonesMap';
import FinalThirdEntriesMap from '../components/visualizations/FinalThirdEntriesMap';
import OppHalfEntriesMap from '../components/visualizations/OppHalfEntriesMap';
import BuildUpDisruptionChart from '../components/visualizations/BuildUpDisruptionChart';
import PpdaCard from '../components/visualizations/PpdaCard';
import PossessionStyleChart from '../components/visualizations/PossessionStyleChart';
import TransitionTimeChart from '../components/visualizations/TransitionTimeChart';
import PassNetworkMap from '../components/visualizations/PassNetworkMap';
import AttackRadarChart from '../components/visualizations/AttackRadarChart';
import DefenceRadarChart from '../components/visualizations/DefenceRadarChart';
import TransitionRadarChart from '../components/visualizations/TransitionRadarChart';
import AttackingTransitionScatterChart from '../components/visualizations/AttackingTransitionScatterChart';
import DefensiveTransitionScatterChart from '../components/visualizations/DefensiveTransitionScatterChart';
import LeagueBdpChart from '../components/visualizations/LeagueBdpChart';
import SetPieceTable from '../components/visualizations/SetPieceTable';
import ErrorBoundary from '../components/ErrorBoundary';
import { leagueStandings } from '../data/mockData';

const mockSetPieceTable = [
    { team: 'Bodø/Glimt', mp: 15, w: 10, d: 3, l: 2, gf: 12, ga: 4, gd: 8, pts: 33 },
    { team: 'Brann', mp: 15, w: 9, d: 4, l: 2, gf: 14, ga: 5, gd: 9, pts: 31 },
    { team: 'Molde', mp: 15, w: 8, d: 5, l: 2, gf: 10, ga: 6, gd: 4, pts: 29 },
    { team: 'Viking', mp: 15, w: 7, d: 4, l: 4, gf: 9, ga: 7, gd: 2, pts: 25 },
    { team: 'Rosenborg', mp: 15, w: 6, d: 5, l: 4, gf: 8, ga: 7, gd: 1, pts: 23 },
    { team: 'Tromsø', mp: 15, w: 5, d: 6, l: 4, gf: 7, ga: 7, gd: 0, pts: 21 },
    { team: 'Lillestrøm', mp: 15, w: 5, d: 4, l: 6, gf: 8, ga: 9, gd: -1, pts: 19 },
    { team: 'Vålerenga', mp: 15, w: 4, d: 5, l: 6, gf: 6, ga: 8, gd: -2, pts: 17 },
    { team: 'Sarpsborg 08', mp: 15, w: 4, d: 4, l: 7, gf: 7, ga: 10, gd: -3, pts: 16 },
    { team: 'HamKam', mp: 15, w: 3, d: 5, l: 7, gf: 5, ga: 9, gd: -4, pts: 14 },
    { team: 'Odd', mp: 15, w: 3, d: 4, l: 8, gf: 4, ga: 9, gd: -5, pts: 13 },
    { team: 'Aalesund', mp: 15, w: 2, d: 5, l: 8, gf: 5, ga: 10, gd: -5, pts: 11 },
    { team: 'Sandefjord', mp: 15, w: 2, d: 4, l: 9, gf: 3, ga: 9, gd: -6, pts: 10 },
];

const mockThrowInData = [
    { side: 'top', third: 'defensive', type: 'short' },
    { side: 'top', third: 'defensive', type: 'short' },
    { side: 'top', third: 'defensive', type: 'medium' },
    { side: 'top', third: 'defensive', type: 'long' },
    { side: 'top', third: 'middle', type: 'short' },
    { side: 'top', third: 'middle', type: 'long' },
    { side: 'top', third: 'attacking', type: 'short' },
    { side: 'top', third: 'attacking', type: 'medium' },
    { side: 'bottom', third: 'defensive', type: 'short' },
    { side: 'bottom', third: 'defensive', type: 'medium' },
    { side: 'bottom', third: 'middle', type: 'short' },
    { side: 'bottom', third: 'middle', type: 'medium' },
    { side: 'bottom', third: 'middle', type: 'long' },
    { side: 'bottom', third: 'attacking', type: 'short' },
    { side: 'bottom', third: 'attacking', type: 'medium' },
    { side: 'bottom', third: 'defensive', type: 'short' },
    { side: 'bottom', third: 'defensive', type: 'medium' },
    { side: 'bottom', third: 'middle', type: 'short' },
    { side: 'bottom', third: 'middle', type: 'medium' },
    { side: 'bottom', third: 'attacking', type: 'medium' },
    { side: 'bottom', third: 'attacking', type: 'long' }
];

const mockThrowInTargetsData = {
    defensive: [
        { name: 'Jenssen', received: 14, retained10s: 10, shots20s: 0, retentionPct: 71 },
        { name: 'Gundersen', received: 8, retained10s: 3, shots20s: 0, retentionPct: 37 },
        { name: 'Opsahl', received: 5, retained10s: 4, shots20s: 0, retentionPct: 80 }
    ],
    middle: [
        { name: 'Antonsen', received: 18, retained10s: 15, shots20s: 2, retentionPct: 83 },
        { name: 'Nilsen', received: 12, retained10s: 9, shots20s: 1, retentionPct: 75 },
        { name: 'Jenssen', received: 9, retained10s: 4, shots20s: 0, retentionPct: 44 }
    ],
    attacking: [
        { name: 'Erlien', received: 15, retained10s: 8, shots20s: 4, retentionPct: 53 },
        { name: 'Moses', received: 11, retained10s: 6, shots20s: 3, retentionPct: 54 },
        { name: 'Vesterlund', received: 6, retained10s: 5, shots20s: 2, retentionPct: 83 }
    ]
};

const mockShotsData = [
    { startX: 60, destX: 75, destY: 15, typeId: 1, outcome: 1, receiver: 'L. Olden Larsen', playerName: 'J. Hjertø-Dahl' },
    { startX: 55, destX: 80, destY: 25, typeId: 1, outcome: 1, receiver: 'L. Olden Larsen', playerName: 'M. Antonsen' },
    { startX: 65, destX: 70, destY: 50, typeId: 43, outcome: 1, playerName: 'R. Jenssen' },
    { startX: 40, destX: 85, destY: 85, typeId: 1, outcome: 1, receiver: 'D. Braut', playerName: 'C. Winther' },
    { startX: 50, destX: 90, destY: 10, typeId: 3, outcome: 1, playerName: 'D. Edvardsson' },
    { startX: 62, destX: 78, destY: 55, typeId: 1, outcome: 1, receiver: 'R. Jenssen', playerName: 'M. Antonsen' },
    { startX: 58, destX: 68, destY: 95, typeId: 43, outcome: 1, playerName: 'V. Ekblom' },
    { startX: 45, destX: 82, destY: 45, typeId: 1, outcome: 1, receiver: 'L. Olden Larsen', playerName: 'C. Winther' },
    { startX: 30, destX: 88, destY: 75, typeId: 1, outcome: 1, receiver: 'D. Braut', playerName: 'M. Antonsen' },
    { startX: 61, destX: 73, destY: 35, typeId: 1, outcome: 1, receiver: 'D. Edvardsson', playerName: 'J. Hjertø-Dahl' },
];

const mockPossessionStyle = [
    { team: 'Bodø/Glimt', passesPerPossession: 6.2, avgPassProgression: 11.4, passAccuracy: 88.5, totalPossessions: 400, totalPasses: 2480, rankPasses: 1, rankProgression: 7, rankAccuracy: 1 },
    { team: 'Molde', passesPerPossession: 5.5, avgPassProgression: 12.1, passAccuracy: 85.2, totalPossessions: 380, totalPasses: 2090, rankPasses: 2, rankProgression: 6, rankAccuracy: 2 },
    { team: 'Tromsø IL', passesPerPossession: 5.1, avgPassProgression: 14.2, passAccuracy: 81.4, totalPossessions: 390, totalPasses: 1989, rankPasses: 3, rankProgression: 5, rankAccuracy: 3 },
    { team: 'Brann', passesPerPossession: 4.8, avgPassProgression: 15.3, passAccuracy: 79.1, totalPossessions: 410, totalPasses: 1968, rankPasses: 4, rankProgression: 3, rankAccuracy: 4 },
    { team: 'Viking', passesPerPossession: 4.2, avgPassProgression: 16.5, passAccuracy: 76.5, totalPossessions: 420, totalPasses: 1764, rankPasses: 5, rankProgression: 2, rankAccuracy: 5 },
    { team: 'KFUM', passesPerPossession: 4.0, avgPassProgression: 14.8, passAccuracy: 74.0, totalPossessions: 415, totalPasses: 1660, rankPasses: 6, rankProgression: 4, rankAccuracy: 6 },
    { team: 'Lillestrøm', passesPerPossession: 3.5, avgPassProgression: 18.0, passAccuracy: 71.2, totalPossessions: 450, totalPasses: 1575, rankPasses: 7, rankProgression: 1, rankAccuracy: 7 }
];


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
};

const baseMockData = {
    shots: [
        { label: '0-5s', count: 18, goals: 3 },
        { label: '6-10s', count: 24, goals: 4 },
        { label: '11-15s', count: 12, goals: 1 },
        { label: '16-20s', count: 5, goals: 0 },
        { label: '21s+', count: 8, goals: 1 },
        { label: 'Lost Pos.', count: 42, isFailure: true }
    ],
    shotsOnTarget: [
        { label: '0-5s', count: 6, goals: 3 },
        { label: '6-10s', count: 10, goals: 4 },
        { label: '11-15s', count: 4, goals: 1 },
        { label: '16-20s', count: 1, goals: 0 },
        { label: '21s+', count: 2, goals: 1 },
        { label: 'Lost Pos.', count: 86, isFailure: true }
    ],
    boxEntries: [
        { label: '0-5s', count: 35, goals: 3 },
        { label: '6-10s', count: 42, goals: 4 },
        { label: '11-15s', count: 28, goals: 1 },
        { label: '16-20s', count: 15, goals: 0 },
        { label: '21s+', count: 22, goals: 1 },
        { label: 'Lost Pos.', count: 18, isFailure: true }
    ]
};

const mockLeagueAttackMetrics = {
    leagueData: {
        'Tromsø': {
            raw: { goals: 1.8, shots: 14.5, shotsOnTarget: 5.2, passesIntoFinalThird: 42.1, passesIntoBox: 12.4, touchesInBox: 22.0, crosses: 15.2, goalConversion: 12.4, goalsPer100: 2.1, verticality: 5.8, fieldTilt: 58.4 },
            normalized: { goals: 90, shots: 85, shotsOnTarget: 80, passesIntoFinalThird: 95, passesIntoBox: 88, touchesInBox: 75, crosses: 70, goalConversion: 82, goalsPer100: 91, verticality: 88, fieldTilt: 90 },
            rank: { goals: 2, shots: 3, shotsOnTarget: 4, passesIntoFinalThird: 1, passesIntoBox: 2, touchesInBox: 5, crosses: 6, goalConversion: 4, goalsPer100: 2, verticality: 3, fieldTilt: 2 }
        },
        'Opponent': {
            raw: { goals: 1.2, shots: 10.5, shotsOnTarget: 3.5, passesIntoFinalThird: 35.0, passesIntoBox: 8.2, touchesInBox: 15.5, crosses: 12.0, goalConversion: 11.4, goalsPer100: 1.4, verticality: 4.5, fieldTilt: 41.6 },
            normalized: { goals: 60, shots: 61, shotsOnTarget: 53, passesIntoFinalThird: 79, passesIntoBox: 58, touchesInBox: 52, crosses: 55, goalConversion: 76, goalsPer100: 60, verticality: 68, fieldTilt: 64 },
            rank: { goals: 8, shots: 10, shotsOnTarget: 11, passesIntoFinalThird: 5, passesIntoBox: 9, touchesInBox: 12, crosses: 10, goalConversion: 7, goalsPer100: 9, verticality: 10, fieldTilt: 12 }
        },
        'League Average': {
            raw: { goals: 1.1, shots: 11.0, shotsOnTarget: 3.8, passesIntoFinalThird: 33.5, passesIntoBox: 9.0, touchesInBox: 16.2, crosses: 13.5, goalConversion: 10.0, goalsPer100: 1.3, verticality: 4.8, fieldTilt: 50.0 },
            normalized: { goals: 55, shots: 64, shotsOnTarget: 58, passesIntoFinalThird: 76, passesIntoBox: 64, touchesInBox: 55, crosses: 62, goalConversion: 66, goalsPer100: 56, verticality: 72, fieldTilt: 76 },
            rank: {}
        }
    },
    maxValues: {
        goals: 2.0, shots: 17.0, shotsOnTarget: 6.5, passesIntoFinalThird: 44.0, passesIntoBox: 14.0, touchesInBox: 29.0, crosses: 21.5,
        goalConversion: 15.0, goalsPer100: 2.3, verticality: 6.6, fieldTilt: 65.0
    },
    totalTeams: 16
};

const mockLeagueDefenceMetrics = {
    leagueData: {
        'Tromsø': {
            raw: { ppda: 9.5, highRecoveries: 15.2, defensiveHeight: 48.5, blockCompactness: 25.4, shotsAllowed: 8.5, shotsOnTargetAllowed: 2.5, boxEntriesAllowed: 14.0, goalsAllowed: 0.8 },
            normalized: { ppda: 80, highRecoveries: 85, defensiveHeight: 75, blockCompactness: 90, shotsAllowed: 82, shotsOnTargetAllowed: 88, boxEntriesAllowed: 85, goalsAllowed: 95 },
            rank: { ppda: 3, highRecoveries: 2, defensiveHeight: 5, blockCompactness: 1, shotsAllowed: 2, shotsOnTargetAllowed: 1, boxEntriesAllowed: 2, goalsAllowed: 1 }
        },
        'League Average': {
            raw: { ppda: 12.0, highRecoveries: 12.5, defensiveHeight: 45.0, blockCompactness: 28.5, shotsAllowed: 11.5, shotsOnTargetAllowed: 4.2, boxEntriesAllowed: 18.5, goalsAllowed: 1.4 },
            normalized: { ppda: 60, highRecoveries: 65, defensiveHeight: 60, blockCompactness: 70, shotsAllowed: 65, shotsOnTargetAllowed: 62, boxEntriesAllowed: 60, goalsAllowed: 55 },
            rank: {}
        }
    },
    maxValues: {
        ppda: 15.0, highRecoveries: 18.0, defensiveHeight: 52.0, blockCompactness: 35.0, shotsAllowed: 16.0, shotsOnTargetAllowed: 6.5, boxEntriesAllowed: 25.0, goalsAllowed: 2.5
    },
    totalTeams: 16
};

const mockLeagueTransitionMetrics = {
    leagueData: {
        'Tromsø': {
            raw: {
                shots10s: 3.5, shots15s: 5.2, shots20s: 6.8,
                sot10s: 1.5, sot15s: 2.1, sot20s: 2.8,
                goals10s: 0.3, goals15s: 0.5, goals20s: 0.7,
                boxEntries10s: 4.2, boxEntries15s: 6.5, boxEntries20s: 8.1,
                forwardPassPct: 65.5, transitionToShotPct: 15.2, finalThirdRecoveries: 12.5
            },
            normalized: {
                shots10s: 85, shots15s: 82, shots20s: 78,
                sot10s: 88, sot15s: 85, sot20s: 80,
                goals10s: 90, goals15s: 85, goals20s: 82,
                boxEntries10s: 75, boxEntries15s: 72, boxEntries20s: 70,
                forwardPassPct: 92, transitionToShotPct: 88, finalThirdRecoveries: 85
            },
            rank: {
                shots10s: 2, shots15s: 3, shots20s: 4,
                sot10s: 1, sot15s: 2, sot20s: 3,
                goals10s: 1, goals15s: 2, goals20s: 2,
                boxEntries10s: 5, boxEntries15s: 5, boxEntries20s: 6,
                forwardPassPct: 1, transitionToShotPct: 2, finalThirdRecoveries: 2
            }
        },
        'League Average': {
            raw: {
                shots10s: 2.1, shots15s: 3.5, shots20s: 4.8,
                sot10s: 0.8, sot15s: 1.4, sot20s: 1.9,
                goals10s: 0.1, goals15s: 0.2, goals20s: 0.3,
                boxEntries10s: 2.8, boxEntries15s: 4.5, boxEntries20s: 5.8,
                forwardPassPct: 52.0, transitionToShotPct: 10.5, finalThirdRecoveries: 8.5
            },
            normalized: {
                shots10s: 50, shots15s: 50, shots20s: 50,
                sot10s: 50, sot15s: 50, sot20s: 50,
                goals10s: 50, goals15s: 50, goals20s: 50,
                boxEntries10s: 50, boxEntries15s: 50, boxEntries20s: 50,
                forwardPassPct: 50, transitionToShotPct: 50, finalThirdRecoveries: 50
            },
            rank: {}
        }
    },
    maxValues: {
        shots10s: 4.0, shots15s: 6.0, shots20s: 8.0,
        sot10s: 2.0, sot15s: 3.0, sot20s: 4.0,
        goals10s: 0.5, goals15s: 0.8, goals20s: 1.0,
        boxEntries10s: 6.0, boxEntries15s: 8.0, boxEntries20s: 10.0,
        forwardPassPct: 75.0, transitionToShotPct: 20.0, finalThirdRecoveries: 15.0
    },
    totalTeams: 16
};

const mockTransitionTimes = {
    all: JSON.parse(JSON.stringify(baseMockData)),
    defensive: JSON.parse(JSON.stringify(baseMockData)),
    middle: JSON.parse(JSON.stringify(baseMockData)),
    attacking: JSON.parse(JSON.stringify(baseMockData))
};
// Add some slight variation for playground testing
mockTransitionTimes.defensive.shots[0].count = 5;
mockTransitionTimes.attacking.shots[0].count = 30;

const mockMatchMomentum = [
    { interval: '0-15', teamGoals: 0, teamShots: 2, teamAllShots: 4, teamBoxEntries: 8, opponentGoals: 0, opponentShots: 1, opponentAllShots: 2, opponentBoxEntries: 3 },
    { interval: '16-30', teamGoals: 1, teamShots: 3, teamAllShots: 5, teamBoxEntries: 11, opponentGoals: 0, opponentShots: 2, opponentAllShots: 3, opponentBoxEntries: 4 },
    { interval: '31-45', teamGoals: 0, teamShots: 1, teamAllShots: 2, teamBoxEntries: 5, opponentGoals: 1, opponentShots: 4, opponentAllShots: 6, opponentBoxEntries: 9 },
    { interval: '46-60', teamGoals: 2, teamShots: 4, teamAllShots: 7, teamBoxEntries: 14, opponentGoals: 0, opponentShots: 1, opponentAllShots: 2, opponentBoxEntries: 3 },
    { interval: '61-75', teamGoals: 0, teamShots: 2, teamAllShots: 4, teamBoxEntries: 7, opponentGoals: 0, opponentShots: 2, opponentAllShots: 5, opponentBoxEntries: 6 },
    { interval: '76-90+', teamGoals: 1, teamShots: 3, teamAllShots: 6, teamBoxEntries: 12, opponentGoals: 1, opponentShots: 3, opponentAllShots: 4, opponentBoxEntries: 8 }
];

const mockTromsoFredrikstadShots = [
    { id: 1, x: 88, y: 45, result: 'goal', player: 'Lars Olden Larsen', xG: 0.45, minute: 12 },
    { id: 2, x: 92, y: 52, result: 'goal', player: 'Daniel Braut', xG: 0.60, minute: 34 },
    { id: 3, x: 85, y: 35, result: 'onTarget', player: 'Ruben Yttergård Jenssen', xG: 0.15, minute: 41 },
    { id: 4, x: 75, y: 60, result: 'offTarget', player: 'Jens Hjertø-Dahl', xG: 0.08, minute: 55 },
    { id: 5, x: 95, y: 48, result: 'goal', player: 'Viktor Ekblom', xG: 0.75, minute: 67 },
    { id: 6, x: 80, y: 70, result: 'offTarget', player: 'David Edvardsson', xG: 0.10, minute: 72 },
    { id: '11', x: 25, y: 70, type: 'Recovery', player: 'M. Antonsen', team: 'Tromsø', minute: 61 },
    { id: '12', x: 30, y: 20, type: 'Interception', player: 'C. Winther', team: 'Tromsø', minute: 73 },
];

const mockBdpData = [
    { opponent: 'Brann', opponentAvg: 81.5, opponentMatch: 79.2, bdp: 2.3, matchRound: 1 },
    { opponent: 'Molde', opponentAvg: 84.0, opponentMatch: 77.5, bdp: 6.5, matchRound: 2 },
    { opponent: 'Viking', opponentAvg: 79.8, opponentMatch: 81.2, bdp: -1.4, matchRound: 3 },
    { opponent: 'Bodø/Glimt', opponentAvg: 86.5, opponentMatch: 79.0, bdp: 7.5, matchRound: 4 },
    { opponent: 'Rosenborg', opponentAvg: 80.2, opponentMatch: 75.8, bdp: 4.4, matchRound: 5 },
    { opponent: 'Lillestrøm', opponentAvg: 77.0, opponentMatch: 78.5, bdp: -1.5, matchRound: 6 },
];

const mockBuildUpPasses = [
    { id: 'b1', x: 25, y: 50, player: 'R. Jenssen', team: 'Tromsø', completed: true,  minute: 3,  type: 'gkPass', receiver: 'L. Olden Larsen' },
    { id: 'b2', x: 75, y: 30, player: 'R. Jenssen', team: 'Tromsø', completed: true,  minute: 18, type: 'goalKick', receiver: 'J. Hjertø-Dahl' },
    { id: 'b3', x: 82, y: 68, player: 'R. Jenssen', team: 'Tromsø', completed: false, minute: 27, type: 'goalKick' },
    { id: 'b4', x: 15, y: 40, player: 'R. Jenssen', team: 'Tromsø', completed: true,  minute: 35, type: 'gkPass', receiver: 'D. Edvardsson' },
    { id: 'b5', x: 45, y: 55, player: 'D. Edvardsson', team: 'Tromsø', completed: true, minute: 44, type: 'freekick', receiver: 'V. Ekblom' },
    { id: 'b6', x: 65, y: 25, player: 'R. Jenssen', team: 'Tromsø', completed: true,  minute: 52, type: 'goalKick', receiver: 'L. Olden Larsen' },
    { id: 'b7', x: 55, y: 60, player: 'R. Jenssen', team: 'Tromsø', completed: false, minute: 61, type: 'gkPass' },
    { id: 'b8', x: 70, y: 45, player: 'R. Jenssen', team: 'Tromsø', completed: true,  minute: 72, type: 'goalKick', receiver: 'D. Braut' },
    { id: 'b9', x: 42,  y: 35, player: 'M. Børsheim', team: 'Tromsø', completed: true,  minute: 78, type: 'freekick', receiver: 'R. Jenssen' },
    { id: 'b10', x: 28, y: 50, player: 'R. Jenssen', team: 'Tromsø', completed: true, minute: 85, type: 'gkPass', receiver: 'L. Olden Larsen' },
];

const mockCornerData = [
    { x: 96, y: 40, team: 'Tromsø', completed: true }, { x: 96, y: 50, team: 'Tromsø', completed: false },
    { x: 88, y: 50, team: 'Tromsø', completed: true }, { x: 88, y: 50, team: 'Tromsø', completed: true },
    { x: 88, y: 52, team: 'Tromsø', completed: false }, { x: 75, y: 50, team: 'Tromsø', completed: true },
    { x: 98, y: 10, team: 'Tromsø', completed: true }, { x: 92, y: 42, team: 'Tromsø', completed: false },
    { x: 94, y: 58, team: 'Tromsø', completed: true }, { x: 95, y: 38, team: 'Tromsø', completed: true },
    { x: 85, y: 45, team: 'Tromsø', completed: false }, { x: 86, y: 55, team: 'Tromsø', completed: true },
];

const mockFreeKickData = [
    { startX: 45, startY: 25, destX: 8,  destY: 45, outcome: 'completed' },
    { startX: 45, startY: 25, destX: 12, destY: 55, outcome: 'failed' },
    { startX: 45, startY: 25, destX: 5,  destY: 35, outcome: 'completed' },
    { startX: 30, startY: 50, destX: 15, destY: 48, outcome: 'completed' },
    { startX: 30, startY: 50, destX: 12, destY: 65, outcome: 'failed' },
    { startX: 55, startY: 75, destX: 10, destY: 50, outcome: 'completed' },
    { startX: 55, startY: 75, destX: 8,  destY: 42, outcome: 'completed' },
    { startX: 55, startY: 75, destX: 14, destY: 58, outcome: 'failed' },
    { startX: 40, startY: 15, destX: 6,  destY: 44, outcome: 'completed' },
];

const mockBallRecoveries = [
    { id: 'r1', x: 25, y: 50, player: 'J. Gundersen', minute: 12, type: 'Interception' },
    { id: 'r2', x: 65, y: 30, player: 'R. Jenssen', minute: 18, type: 'Tackle' },
    { id: 'r3', x: 82, y: 68, player: 'L. Olden Larsen', minute: 27, type: 'Recovery' },
    { id: 'r4', x: 55, y: 40, player: 'A. Nilsen', minute: 35, type: 'Interception' },
    { id: 'r5', x: 75, y: 55, player: 'V. Ekblom', minute: 44, type: 'Tackle' },
    { id: 'r6', x: 90, y: 25, player: 'J. Hjertø-Dahl', minute: 52, type: 'Recovery' },
    { id: 'r7', x: 55, y: 60, player: 'M. Børsheim', minute: 61, type: 'Interception' },
    { id: 'r8', x: 85, y: 45, player: 'D. Braut', minute: 72, type: 'Recovery' },
    { id: 'r9', x: 62, y: 35, player: 'R. Jenssen', minute: 78, type: 'Tackle' },
    { id: 'r10', x: 88, y: 50, player: 'L. Olden Larsen', minute: 85, type: 'Interception' },
    { id: 'r11', x: 95, y: 40, player: 'V. Ekblom', minute: 88, type: 'Recovery' },
    { id: 'r12', x: 70, y: 60, player: 'D. Edvardsson', minute: 90, type: 'Tackle' },
    { id: 'r13', x: 78, y: 25, player: 'M. Børsheim', minute: 92, type: 'Interception' },
];

const mockOpponentRecoveries = [
    { id: 'o1', x: 20, y: 50, minute: 15 },
    { id: 'o2', x: 35, y: 20, minute: 22 },
    { id: 'o3', x: 25, y: 80, minute: 31 },
    { id: 'o4', x: 45, y: 40, minute: 40 },
    { id: 'o5', x: 15, y: 60, minute: 48 },
    { id: 'o6', x: 50, y: 30, minute: 55 },
    { id: 'o7', x: 10, y: 45, minute: 65 },
    { id: 'o8', x: 30, y: 70, minute: 76 },
    { id: 'o9', x: 40, y: 15, minute: 82 },
    { id: 'o10', x: 22, y: 55, minute: 89 },
];

const mockTransitions = [
    { id: 't1', startX: 25, startY: 50, destX: 45, destY: 70, player: 'J. Gundersen', minute: 12, completed: true, receiver: 'L. Olden Larsen', passDirection: 'forward' },
    { id: 't2', startX: 65, startY: 30, destX: 85, destY: 20, player: 'R. Jenssen', minute: 18, completed: true, receiver: 'J. Hjertø-Dahl', passDirection: 'forward' },
    { id: 't3', startX: 82, startY: 68, destX: 95, destY: 50, player: 'L. Olden Larsen', minute: 27, completed: false, passDirection: 'forward' },
    { id: 't4', startX: 55, startY: 40, destX: 60, destY: 95, player: 'A. Nilsen', minute: 35, completed: true, receiver: 'V. Ekblom', passDirection: 'horizontal' },
    { id: 't5', startX: 75, startY: 55, destX: 70, destY: 15, player: 'V. Ekblom', minute: 44, completed: true, receiver: 'D. Braut', passDirection: 'horizontal' },
    { id: 't6', startX: 50, startY: 20, destX: 30, destY: 35, player: 'J. Hjertø-Dahl', minute: 52, completed: false, passDirection: 'backwards' },
    { id: 't7', startX: 55, startY: 60, destX: 70, destY: 80, player: 'M. Børsheim', minute: 61, completed: true, receiver: 'L. Olden Larsen', passDirection: 'forward' },
    { id: 't8', startX: 85, startY: 45, destX: 95, destY: 45, player: 'D. Braut', minute: 72, completed: true, receiver: 'V. Ekblom', passDirection: 'forward' },
    { id: 't9', startX: 62, startY: 35, destX: 50, destY: 20, player: 'R. Jenssen', minute: 78, completed: false, passDirection: 'backwards' },
    { id: 't10', startX: 40, startY: 50, destX: 70, destY: 60, player: 'L. Olden Larsen', minute: 85, completed: true, receiver: 'D. Edvardsson', passDirection: 'forward' },
];

const mockPpdaLeagueData = [
    { teamName: 'Bodø/Glimt', ppda: 7.2, rank: 1 },
    { teamName: 'Brann', ppda: 7.8, rank: 2 },
    { teamName: 'Tromsø', ppda: 8.4, rank: 3 },
    { teamName: 'Viking', ppda: 9.1, rank: 4 },
    { teamName: 'Molde', ppda: 9.5, rank: 5 },
    { teamName: 'KFUM', ppda: 10.2, rank: 6 }
];

const mockPpdaLeague = {
    teamName: 'Tromsø',
    ppdaValue: 8.4,
    rank: 3,
    totalTeams: 16
};

const mockFinalThirdEntries = [
    { typeId: 1, destY: 80, receiver: 'Player A', playerName: 'Passer A' },
    { typeId: 1, destY: 20, receiver: 'Player B', playerName: 'Passer B' },
    { typeId: 43, destY: 50, playerName: 'Carrier C' }
];

const mockPassNetworkData = {
    nodes: [
        { id: 'GK', name: 'J. Haugaard', x: 10, y: 50, touches: 45, isGk: true },
        { id: 'CB1', name: 'A. Jenssen', x: 25, y: 30, touches: 65, isGk: false },
        { id: 'CB2', name: 'C. Psyche', x: 25, y: 70, touches: 60, isGk: false },
        { id: 'LB', name: 'R. Jenssen', x: 45, y: 15, touches: 50, isGk: false },
        { id: 'RB', name: 'J. Nilsen', x: 45, y: 85, touches: 55, isGk: false },
        { id: 'CM1', name: 'S. Opsahl', x: 55, y: 40, touches: 75, isGk: false },
        { id: 'CM2', name: 'M. Antonsen', x: 55, y: 60, touches: 70, isGk: false },
        { id: 'AM', name: 'L. Olden Larsen', x: 75, y: 50, touches: 40, isGk: false },
        { id: 'LW', name: 'J. Hjertø-Dahl', x: 80, y: 20, touches: 35, isGk: false },
        { id: 'RW', name: 'V. Ekblom', x: 80, y: 80, touches: 38, isGk: false },
        { id: 'ST', name: 'D. Braut', x: 90, y: 50, touches: 25, isGk: false }
    ],
    links: [
        { source: 'GK', target: 'CB1', count: 12 },
        { source: 'GK', target: 'CB2', count: 10 },
        { source: 'CB1', target: 'CB2', count: 18 },
        { source: 'CB1', target: 'LB', count: 15 },
        { source: 'CB2', target: 'RB', count: 14 },
        { source: 'CB1', target: 'CM1', count: 20 },
        { source: 'CB2', target: 'CM2', count: 18 },
        { source: 'CM1', target: 'CM2', count: 25 },
        { source: 'CM1', target: 'AM', count: 12 },
        { source: 'CM2', target: 'AM', count: 14 },
        { source: 'LB', target: 'LW', count: 10 },
        { source: 'RB', target: 'RW', count: 12 },
        { source: 'AM', target: 'ST', count: 8 },
        { source: 'LW', target: 'ST', count: 5 },
        { source: 'RW', target: 'ST', count: 6 },
    ]
};

const mockTransitionData = {
    'Tromsø': { raw: { shots20s: 3.5, forwardPassPct: 45.1, boxEntries20s: 4.2 }, rank: { shots20s: 1, forwardPassPct: 3, boxEntries20s: 1 } },
    'Bodø/Glimt': { raw: { shots20s: 2.8, forwardPassPct: 52.5, boxEntries20s: 3.8 }, rank: { shots20s: 2, forwardPassPct: 1, boxEntries20s: 2 } },
    'Molde': { raw: { shots20s: 2.5, forwardPassPct: 48.0, boxEntries20s: 3.1 }, rank: { shots20s: 3, forwardPassPct: 2, boxEntries20s: 3 } },
    'Brann': { raw: { shots20s: 1.8, forwardPassPct: 38.0, boxEntries20s: 2.1 }, rank: { shots20s: 4, forwardPassPct: 4, boxEntries20s: 4 } },
    'League Average': { raw: { shots20s: 2.0, forwardPassPct: 43.5, boxEntries20s: 2.5 }, rank: {} }
};

const mockDefensiveTransitionData = {
    'Tromsø': { raw: { defShots20s: 1.1, defBoxEntriesPct: 12.5, defBoxEntries20s: 1.5 }, rank: { defShots20s: 1, defBoxEntriesPct: 1, defBoxEntries20s: 1 } },
    'Bodø/Glimt': { raw: { defShots20s: 1.5, defBoxEntriesPct: 15.1, defBoxEntries20s: 2.0 }, rank: { defShots20s: 2, defBoxEntriesPct: 2, defBoxEntries20s: 2 } },
    'Molde': { raw: { defShots20s: 1.8, defBoxEntriesPct: 18.5, defBoxEntries20s: 2.4 }, rank: { defShots20s: 3, defBoxEntriesPct: 3, defBoxEntries20s: 3 } },
    'Brann': { raw: { defShots20s: 2.1, defBoxEntriesPct: 22.0, defBoxEntries20s: 3.1 }, rank: { defShots20s: 4, defBoxEntriesPct: 4, defBoxEntries20s: 4 } },
    'League Average': { raw: { defShots20s: 2.0, defBoxEntriesPct: 17.5, defBoxEntries20s: 2.5 }, rank: {} }
};

const getBadge = getCachedBadge;

const Settings = () => {
    const { globalLeagueSetPieceTable } = useMatchData();
    const [activeTab, setActiveTab] = useState('defence');
    const [expandedSaves, setExpandedSaves] = useState({ attack: true, defence: false, transitions: false, setPieces: false });
    const [playgroundTeam, setPlaygroundTeam] = useState('Tromsø');

    const toggleSaveMenu = (menu) => {
        setExpandedSaves(prev => ({ ...prev, [menu]: !prev[menu] }));
    };

    const [publishedVisuals, setPublishedVisuals] = useState(() => {
        const ALL_VISUALS = ['AttackRadarChart', 'FieldTiltMap', 'PassNetworkMap', 'OppHalfEntriesMap', 'FinalThirdEntriesMap', 'LeagueChanceCreation', 'ShotMap', 'BuildUpMap', 'MatchMomentumChart', 'DefenceRadarChart', 'BallRecoveryMap', 'AverageDefensiveActionHeight', 'BlockCompactness', 'PpdaCard', 'BdpChart', 'transitionsRadar', 'TransitionMap', 'DefensiveTransitionMap', 'RecoveryZonesMap', 'TransitionTimeChart'];
        try {
            const saved = localStorage.getItem('publishedVisualizations');
            return saved !== null ? JSON.parse(saved) : ALL_VISUALS;
        } catch {
            return ALL_VISUALS;
        }
    });

    const handlePublish = (vizName) => {
        let updated;
        if (publishedVisuals.includes(vizName)) {
            updated = publishedVisuals.filter(v => v !== vizName);
        } else {
            updated = [...publishedVisuals, vizName];
        }
        setPublishedVisuals(updated);
        localStorage.setItem('publishedVisualizations', JSON.stringify(updated));
    };

    const [hiddenPlaygroundVisuals, setHiddenPlaygroundVisuals] = useState(() => {
        try {
            const saved = localStorage.getItem('hiddenPlaygroundVisuals');
            return saved ? JSON.parse(saved) : [];
        } catch {
            return [];
        }
    });

    const toggleHiddenVisual = (vizName, forceHide = undefined) => {
        let updated;
        const isHidden = hiddenPlaygroundVisuals.includes(vizName);
        
        if (forceHide === true && !isHidden) updated = [...hiddenPlaygroundVisuals, vizName];
        else if (forceHide === false && isHidden) updated = hiddenPlaygroundVisuals.filter(v => v !== vizName);
        else if (forceHide === undefined) {
             updated = isHidden ? hiddenPlaygroundVisuals.filter(v => v !== vizName) : [...hiddenPlaygroundVisuals, vizName];
        } else {
             updated = hiddenPlaygroundVisuals;
        }

        setHiddenPlaygroundVisuals(updated);
        localStorage.setItem('hiddenPlaygroundVisuals', JSON.stringify(updated));
    };

    const tabs = [
        { id: 'attack', titleNO: 'Angrep', titleEN: 'Attack' },
        { id: 'defence', titleNO: 'Forsvar', titleEN: 'Defence' },
        { id: 'transitions', titleNO: 'Omstillinger', titleEN: 'Transitions' },
        { id: 'set-pieces', titleNO: 'Dødballer', titleEN: 'Set-Piece Actions' },
    ];

    // Helper for the zoomed out preview style
    const playgroundScaleStyle = {
        transform: 'scale(0.8)',
        transformOrigin: 'top center',
        marginBottom: '-12%' // Offset the space left by scaling
    };

    return (
        <div className="fade-in" style={{ padding: '2rem', minHeight: '100%', display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <h1 style={{ fontSize: '2.5rem', margin: 0 }}>
                    Innstillinger <span style={{ fontSize: '1.2rem', color: 'var(--color-text-secondary)', fontWeight: 'normal' }}>Settings</span>
                </h1>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column' }}>
                <div style={{ padding: '1.5rem 0', borderBottom: '1px solid var(--color-border)' }}>
                    <h2 style={{ fontSize: '1.5rem', margin: '0 0 1rem 0', color: 'var(--color-accent-blue)' }}>Visualization Playground</h2>
                    <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.9rem', margin: 0 }}>
                        Use this sandbox to prototype and test new data visualizations for different phases of the game.
                    </p>
                </div>

                {/* Tabs - No longer fixed */}
                <div style={{ display: 'flex', borderBottom: '1px solid var(--color-border)', marginBottom: '2rem' }}>
                    {tabs.map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            style={{
                                flex: 1,
                                padding: '1rem',
                                background: activeTab === tab.id ? 'rgba(255, 255, 255, 0.05)' : 'transparent',
                                border: 'none',
                                borderBottom: activeTab === tab.id ? '3px solid var(--color-accent-blue)' : '3px solid transparent',
                                color: activeTab === tab.id ? 'var(--color-text-primary)' : 'var(--color-text-secondary)',
                                cursor: 'pointer',
                                transition: 'all 0.2s ease',
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                gap: '4px'
                            }}
                        >
                            <span style={{ fontSize: '1.1rem', fontWeight: activeTab === tab.id ? 'bold' : 'normal' }}>
                                {tab.titleNO}
                            </span>
                            <span style={{ fontSize: '0.75rem', opacity: 0.8, textTransform: 'uppercase', letterSpacing: '1px' }}>
                                {tab.titleEN}
                            </span>
                        </button>
                    ))}
                </div>

                {/* Content Area */}
                <div>
                    {activeTab === 'set-pieces' && (
                        <div className="fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '3rem' }}>
                            {!hiddenPlaygroundVisuals.includes('SetPieceTable') && (
                                <div className="glass-panel" style={{ display: 'flex', flexDirection: 'column', borderStyle: 'dashed', borderWidth: '2px', borderColor: 'var(--color-border)', backgroundColor: 'transparent', padding: '1.5rem' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                            <span style={{ padding: '4px 8px', background: 'rgba(56,189,248,0.1)', color: 'var(--color-accent-blue)', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 'bold' }}>DRAFT</span>
                                            <h4 style={{ margin: 0, fontSize: '1.1rem' }}>League Table (Set-Pieces Only)</h4>
                                        </div>
                                        <div style={{ display: 'flex', gap: '8px' }}>
                                            <button
                                                onClick={() => toggleHiddenVisual('SetPieceTable', true)}
                                                style={{ padding: '0.5rem 1rem', backgroundColor: 'transparent', color: 'var(--color-text-secondary)', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', fontSize: '0.85rem', transition: 'all 0.2s ease' }}
                                                title="Hide from playground and keep in folder"
                                            >
                                                📁 Place in Folder
                                            </button>
                                            <button
                                                onClick={() => handlePublish('SetPieceTable')}
                                                style={{ padding: '0.5rem 1rem', backgroundColor: publishedVisuals.includes('SetPieceTable') ? 'rgba(56,189,248,0.1)' : 'var(--color-accent-blue)', color: publishedVisuals.includes('SetPieceTable') ? 'var(--color-accent-blue)' : '#000', border: publishedVisuals.includes('SetPieceTable') ? '1px solid var(--color-accent-blue)' : 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', fontSize: '0.85rem', transition: 'all 0.2s ease' }}
                                            >
                                                {publishedVisuals.includes('SetPieceTable') ? '✅ Published' : '🚀 Publish'}
                                            </button>
                                        </div>
                                    </div>
                                    <div style={{ padding: '2rem', background: 'rgba(0,0,0,0.2)', borderRadius: '8px' }}>
                                        <SetPieceTable data={globalLeagueSetPieceTable || mockSetPieceTable} getBadge={getBadge} />
                                    </div>
                                </div>
                            )}

                            {!hiddenPlaygroundVisuals.includes('CornerMap') && (
                                <div className="glass-panel" style={{ display: 'flex', flexDirection: 'column', borderStyle: 'dashed', borderWidth: '2px', borderColor: 'var(--color-border)', backgroundColor: 'transparent', padding: '1.5rem' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                            <span style={{ padding: '4px 8px', background: 'rgba(56,189,248,0.1)', color: 'var(--color-accent-blue)', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 'bold' }}>DRAFT</span>
                                            <h4 style={{ margin: 0, fontSize: '1.1rem' }}>Corner kick delivery zones</h4>
                                        </div>
                                        <div style={{ display: 'flex', gap: '8px' }}>
                                            <button
                                                onClick={() => toggleHiddenVisual('CornerMap', true)}
                                                style={{ padding: '0.5rem 1rem', backgroundColor: 'transparent', color: 'var(--color-text-secondary)', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', fontSize: '0.85rem', transition: 'all 0.2s ease' }}
                                                title="Hide from playground and keep in folder"
                                            >
                                                📁 Place in Folder
                                            </button>
                                            <button
                                                onClick={() => handlePublish('CornerMap')}
                                                style={{ padding: '0.5rem 1rem', backgroundColor: publishedVisuals.includes('CornerMap') ? 'rgba(56,189,248,0.1)' : 'var(--color-accent-blue)', color: publishedVisuals.includes('CornerMap') ? 'var(--color-accent-blue)' : '#000', border: publishedVisuals.includes('CornerMap') ? '1px solid var(--color-accent-blue)' : 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', fontSize: '0.85rem', transition: 'all 0.2s ease' }}
                                            >
                                                {publishedVisuals.includes('CornerMap') ? '✓ Published' : 'Publish to Dashboard'}
                                            </button>
                                        </div>
                                    </div>
                                    <div style={playgroundScaleStyle}>
                                        <CornerDistributionMap data={mockCornerData} />
                                    </div>
                                </div>
                            )}

                            {!hiddenPlaygroundVisuals.includes('FreeKickMap') && (
                                <div className="glass-panel" style={{ display: 'flex', flexDirection: 'column', borderStyle: 'dashed', borderWidth: '2px', borderColor: 'var(--color-border)', backgroundColor: 'transparent', padding: '1.5rem' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                            <span style={{ padding: '4px 8px', background: 'rgba(56,189,248,0.1)', color: 'var(--color-accent-blue)', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 'bold' }}>DRAFT</span>
                                            <h4 style={{ margin: 0, fontSize: '1.1rem' }}>Free kick delivery zones</h4>
                                        </div>
                                        <div style={{ display: 'flex', gap: '8px' }}>
                                            <button
                                                onClick={() => toggleHiddenVisual('FreeKickMap', true)}
                                                style={{ padding: '0.5rem 1rem', backgroundColor: 'transparent', color: 'var(--color-text-secondary)', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', fontSize: '0.85rem', transition: 'all 0.2s ease' }}
                                                title="Hide from playground and keep in folder"
                                            >
                                                📁 Place in Folder
                                            </button>
                                            <button
                                                onClick={() => handlePublish('FreeKickMap')}
                                                style={{ padding: '0.5rem 1rem', backgroundColor: publishedVisuals.includes('FreeKickMap') ? 'rgba(56,189,248,0.1)' : 'var(--color-accent-blue)', color: publishedVisuals.includes('FreeKickMap') ? 'var(--color-accent-blue)' : '#000', border: publishedVisuals.includes('FreeKickMap') ? '1px solid var(--color-accent-blue)' : 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', fontSize: '0.85rem', transition: 'all 0.2s ease' }}
                                            >
                                                {publishedVisuals.includes('FreeKickMap') ? '✓ Published' : 'Publish to Dashboard'}
                                            </button>
                                        </div>
                                    </div>
                                    <div style={playgroundScaleStyle}>
                                        <FreeKickDeliveryMap data={mockFreeKickData} />
                                    </div>
                                </div>
                            )}

                            {/* Free Kick Delivery Arrows */}
                            <div className="glass-panel" style={{ padding: '1.5rem', marginTop: '1.5rem', border: '1px solid rgba(255,255,255,0.05)', position: 'relative' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                                    <div>
                                        <h3 style={{ margin: 0, fontSize: '1.1rem', color: '#fff', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                            Free Kick Delivery Arrows
                                        </h3>
                                        <p style={{ margin: '0.2rem 0 0 0', fontSize: '0.8rem', color: 'var(--color-text-secondary)' }}>
                                            View out-wide free kick deliveries into the box
                                        </p>
                                    </div>
                                    <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                                        <button 
                                            onClick={() => toggleHiddenVisual('FreeKickDeliveryArrows', true)}
                                            style={{ background: 'transparent', border: 'none', color: 'var(--color-text-secondary)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.8rem' }}
                                        >
                                            Hide Example
                                        </button>
                                        <button 
                                            onClick={() => handlePublish('FreeKickDeliveryArrows')}
                                            style={{ padding: '0.5rem 1rem', backgroundColor: publishedVisuals.includes('FreeKickDeliveryArrows') ? 'rgba(56,189,248,0.1)' : 'var(--color-accent-blue)', color: publishedVisuals.includes('FreeKickDeliveryArrows') ? 'var(--color-accent-blue)' : '#000', border: publishedVisuals.includes('FreeKickDeliveryArrows') ? '1px solid var(--color-accent-blue)' : 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', fontSize: '0.85rem', transition: 'all 0.2s ease' }}
                                        >
                                            {publishedVisuals.includes('FreeKickDeliveryArrows') ? 'V Published' : 'Publish to Dashboard'}
                                        </button>
                                    </div>
                                </div>
                                
                                {!hiddenPlaygroundVisuals.includes('FreeKickDeliveryArrows') && (
                                    <div style={{ padding: '1.5rem', background: 'rgba(0,0,0,0.2)', borderRadius: '8px' }}>
                                        <div style={{ marginBottom: '1rem', fontSize: '0.8rem', color: 'var(--color-text-secondary)' }}>
                                            <span>Mock Data: Out-wide Free Kicks</span>
                                        </div>
                                        <div style={{...playgroundScaleStyle, height: '400px'}}>
                                            <FreeKickDeliveryArrows 
                                                teamName="Tromsø" 
                                                data={[
                                                    { startX: 75, startY: 10, destX: 92, destY: 45, swing: 'in', outcome: 'completed' },
                                                    { startX: 80, startY: 90, destX: 95, destY: 55, swing: 'in', outcome: 'completed' },
                                                    { startX: 85, startY: 15, destX: 94, destY: 48, swing: 'out', outcome: 'missed' },
                                                    { startX: 70, startY: 85, destX: 88, destY: 50, swing: 'straight', outcome: 'completed' },
                                                    { startX: 82, startY: 5, destX: 98, destY: 52, swing: 'out', outcome: 'completed' },
                                                    { startX: 78, startY: 95, destX: 90, destY: 42, swing: 'in', outcome: 'missed' }
                                                ]}
                                            />
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Corner Delivery Arrows */}
                            <div className="glass-panel" style={{ padding: '1.5rem', marginTop: '1.5rem', border: '1px solid rgba(255,255,255,0.05)', position: 'relative' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                                    <div>
                                        <h3 style={{ margin: 0, fontSize: '1.1rem', color: '#fff', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                            Corner Delivery Type
                                        </h3>
                                        <p style={{ margin: '0.2rem 0 0 0', fontSize: '0.8rem', color: 'var(--color-text-secondary)' }}>
                                            View corner kick deliveries into the penalty area
                                        </p>
                                    </div>
                                    <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                                        <button 
                                            onClick={() => toggleHiddenVisual('CornerDeliveryArrows', true)}
                                            style={{ background: 'transparent', border: 'none', color: 'var(--color-text-secondary)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.8rem' }}
                                        >
                                            Hide Example
                                        </button>
                                        <button 
                                            onClick={() => handlePublish('CornerDeliveryArrows')}
                                            style={{ padding: '0.5rem 1rem', backgroundColor: publishedVisuals.includes('CornerDeliveryArrows') ? 'rgba(56,189,248,0.1)' : 'var(--color-accent-blue)', color: publishedVisuals.includes('CornerDeliveryArrows') ? 'var(--color-accent-blue)' : '#000', border: publishedVisuals.includes('CornerDeliveryArrows') ? '1px solid var(--color-accent-blue)' : 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', fontSize: '0.85rem', transition: 'all 0.2s ease' }}
                                        >
                                            {publishedVisuals.includes('CornerDeliveryArrows') ? 'V Published' : 'Publish to Dashboard'}
                                        </button>
                                    </div>
                                </div>
                                
                                {!hiddenPlaygroundVisuals.includes('CornerDeliveryArrows') && (
                                    <div style={{ padding: '1.5rem', background: 'rgba(0,0,0,0.2)', borderRadius: '8px' }}>
                                        <div style={{ marginBottom: '1rem', fontSize: '0.8rem', color: 'var(--color-text-secondary)' }}>
                                            <span>Mock Data: Corners</span>
                                        </div>
                                        <div style={{...playgroundScaleStyle, height: '350px'}}>
                                            <CornerDeliveryArrows 
                                                teamName="Tromsø" 
                                                data={[
                                                    { startX: 100, startY: 0, destX: 92, destY: 45, swing: 'in', outcome: 'completed' },
                                                    { startX: 100, startY: 100, destX: 95, destY: 55, swing: 'out', outcome: 'completed' },
                                                    { startX: 100, startY: 0, destX: 94, destY: 48, swing: 'straight', outcome: 'missed' },
                                                    { startX: 100, startY: 100, destX: 88, destY: 50, swing: 'in', outcome: 'completed' },
                                                    { startX: 100, startY: 0, destX: 98, destY: 52, swing: 'in', outcome: 'completed' },
                                                    { startX: 100, startY: 100, destX: 90, destY: 42, swing: 'out', outcome: 'missed' }
                                                ]}
                                            />
                                        </div>
                                    </div>
                                )}
                            </div>

                            <div className="glass-panel" style={{ display: 'flex', flexDirection: 'column', borderStyle: 'dashed', borderWidth: '2px', borderColor: 'var(--color-border)', backgroundColor: 'transparent', padding: '1.5rem' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem' }}>
                                    <div>
                                        <h3 style={{ margin: '0 0 0.5rem 0', color: '#fff', fontSize: '1.2rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                            <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: 'var(--color-accent-blue)', display: 'inline-block' }}></span>
                                            Corner Delivery Donut
                                        </h3>
                                        <p style={{ margin: '0.2rem 0 0 0', fontSize: '0.8rem', color: 'var(--color-text-secondary)' }}>
                                            Overview of delivery types and completion percentages
                                        </p>
                                    </div>
                                    <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                                        <button 
                                            onClick={() => toggleHiddenVisual('CornerDeliveryDonut', true)}
                                            style={{ background: 'transparent', border: 'none', color: 'var(--color-text-secondary)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.8rem' }}
                                        >
                                            Hide Example
                                        </button>
                                        <button 
                                            onClick={() => handlePublish('CornerDeliveryDonut')}
                                            style={{ padding: '0.5rem 1rem', backgroundColor: publishedVisuals.includes('CornerDeliveryDonut') ? 'rgba(56,189,248,0.1)' : 'var(--color-accent-blue)', color: publishedVisuals.includes('CornerDeliveryDonut') ? 'var(--color-accent-blue)' : '#000', border: publishedVisuals.includes('CornerDeliveryDonut') ? '1px solid var(--color-accent-blue)' : 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', fontSize: '0.85rem', transition: 'all 0.2s ease' }}
                                        >
                                            {publishedVisuals.includes('CornerDeliveryDonut') ? 'V Published' : 'Publish to Dashboard'}
                                        </button>
                                    </div>
                                </div>
                                
                                {!hiddenPlaygroundVisuals.includes('CornerDeliveryDonut') && (
                                    <div style={{ padding: '1.5rem', background: 'rgba(0,0,0,0.2)', borderRadius: '8px' }}>
                                        <div style={{ marginBottom: '1rem', fontSize: '0.8rem', color: 'var(--color-text-secondary)' }}>
                                            <span>Mock Data: Corners</span>
                                        </div>
                                        <div style={{...playgroundScaleStyle, height: '400px'}}>
                                            <CornerDeliveryDonut 
                                                teamName="Tromsø" 
                                                data={[
                                                    { startX: 100, startY: 0, destX: 92, destY: 45, swing: 'in', outcome: 'completed' },
                                                    { startX: 100, startY: 100, destX: 95, destY: 55, swing: 'out', outcome: 'completed' },
                                                    { startX: 100, startY: 0, destX: 94, destY: 48, swing: 'straight', outcome: 'missed' },
                                                    { startX: 100, startY: 100, destX: 88, destY: 50, swing: 'in', outcome: 'completed' },
                                                    { startX: 100, startY: 0, destX: 98, destY: 52, swing: 'in', outcome: 'completed' },
                                                    { startX: 100, startY: 100, destX: 90, destY: 42, swing: 'out', outcome: 'missed' },
                                                    { startX: 100, startY: 100, destX: 92, destY: 49, swing: 'in', outcome: 'missed' },
                                                    { startX: 100, startY: 0, destX: 95, destY: 51, swing: 'out', outcome: 'completed' },
                                                    { startX: 100, startY: 0, destX: 93, destY: 45, swing: 'straight', outcome: 'completed' }
                                                ]}
                                            />
                                        </div>
                                    </div>
                                )}
                            </div>
                    
                    {/* Free Kick Delivery Donut Section */}
                            <div className="glass-panel" style={{ display: 'flex', flexDirection: 'column', borderStyle: 'dashed', borderWidth: '2px', borderColor: 'var(--color-border)', backgroundColor: 'transparent', padding: '1.5rem' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem' }}>
                                    <div>
                                        <h3 style={{ margin: '0 0 0.5rem 0', color: '#fff', fontSize: '1.2rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                            <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: 'var(--color-accent-blue)', display: 'inline-block' }}></span>
                                            Free Kick Delivery Donut
                                        </h3>
                                        <p style={{ margin: '0.2rem 0 0 0', fontSize: '0.8rem', color: 'var(--color-text-secondary)' }}>
                                            Overview of free kick delivery types and completion percentages
                                        </p>
                                    </div>
                                    <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                                        <button 
                                            onClick={() => toggleHiddenVisual('FreeKickDeliveryDonut', true)}
                                            style={{ background: 'transparent', border: 'none', color: 'var(--color-text-secondary)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.8rem' }}
                                        >
                                            Hide Example
                                        </button>
                                        <button 
                                            onClick={() => handlePublish('FreeKickDeliveryDonut')}
                                            style={{ padding: '0.5rem 1rem', backgroundColor: publishedVisuals.includes('FreeKickDeliveryDonut') ? 'rgba(56,189,248,0.1)' : 'var(--color-accent-blue)', color: publishedVisuals.includes('FreeKickDeliveryDonut') ? 'var(--color-accent-blue)' : '#000', border: publishedVisuals.includes('FreeKickDeliveryDonut') ? '1px solid var(--color-accent-blue)' : 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', fontSize: '0.85rem', transition: 'all 0.2s ease' }}
                                        >
                                            {publishedVisuals.includes('FreeKickDeliveryDonut') ? 'V Published' : 'Publish to Dashboard'}
                                        </button>
                                    </div>
                                </div>
                                
                                {!hiddenPlaygroundVisuals.includes('FreeKickDeliveryDonut') && (
                                    <div style={{ padding: '1.5rem', background: 'rgba(0,0,0,0.2)', borderRadius: '8px' }}>
                                        <div style={{ marginBottom: '1rem', fontSize: '0.8rem', color: 'var(--color-text-secondary)' }}>
                                            <span>Mock Data: Free Kicks</span>
                                        </div>
                                        <div style={{...playgroundScaleStyle, height: '400px'}}>
                                            <FreeKickDeliveryDonut 
                                                teamName="Tromsø" 
                                                data={[
                                                    { startX: 80, startY: 10, destX: 92, destY: 45, swing: 'in', outcome: 'completed' },
                                                    { startX: 75, startY: 90, destX: 95, destY: 55, swing: 'out', outcome: 'completed' },
                                                    { startX: 85, startY: 20, destX: 94, destY: 48, swing: 'straight', outcome: 'missed' },
                                                    { startX: 70, startY: 80, destX: 88, destY: 50, swing: 'in', outcome: 'completed' },
                                                    { startX: 65, startY: 15, destX: 98, destY: 52, swing: 'in', outcome: 'completed' },
                                                    { startX: 88, startY: 85, destX: 90, destY: 42, swing: 'out', outcome: 'missed' },
                                                    { startX: 90, startY: 95, destX: 92, destY: 49, swing: 'in', outcome: 'missed' },
                                                    { startX: 82, startY: 5, destX: 95, destY: 51, swing: 'out', outcome: 'completed' },
                                                    { startX: 78, startY: 25, destX: 93, destY: 45, swing: 'straight', outcome: 'completed' }
                                                ]}
                                            />
                                        </div>
                                    </div>
                                )}

                                {!hiddenPlaygroundVisuals.includes('ThrowInMap') && (
                                    <div className="glass-panel" style={{ display: 'flex', flexDirection: 'column', borderStyle: 'dashed', borderWidth: '2px', borderColor: 'var(--color-border)', backgroundColor: 'transparent', padding: '1.5rem', marginTop: '1.5rem' }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                                <span style={{ padding: '4px 8px', background: 'rgba(56,189,248,0.1)', color: 'var(--color-accent-blue)', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 'bold' }}>DRAFT</span>
                                                <h4 style={{ margin: 0, fontSize: '1.1rem' }}>Throw-In Distance</h4>
                                            </div>
                                            <div style={{ display: 'flex', gap: '8px' }}>
                                                <button
                                                    onClick={() => toggleHiddenVisual('ThrowInMap', true)}
                                                    style={{ padding: '0.5rem 1rem', backgroundColor: 'transparent', color: 'var(--color-text-secondary)', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', fontSize: '0.85rem', transition: 'all 0.2s ease' }}
                                                    title="Hide from playground and keep in folder"
                                                >
                                                    Hide in Folder
                                                </button>
                                                <button
                                                    onClick={() => handlePublish('ThrowInMap')}
                                                    style={{ padding: '0.5rem 1rem', backgroundColor: publishedVisuals.includes('ThrowInMap') ? 'rgba(56,189,248,0.1)' : 'var(--color-accent-blue)', color: publishedVisuals.includes('ThrowInMap') ? 'var(--color-accent-blue)' : '#000', border: publishedVisuals.includes('ThrowInMap') ? '1px solid var(--color-accent-blue)' : 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', fontSize: '0.85rem', transition: 'all 0.2s ease' }}
                                                >
                                                    {publishedVisuals.includes('ThrowInMap') ? 'Published' : 'Publish to Dashboard'}
                                                </button>
                                            </div>
                                        </div>
                                        <div style={{...playgroundScaleStyle, height: '400px'}}>
                                            <ThrowInZonesMap data={mockThrowInData} teamName="Tromsø" />
                                        </div>
                                    </div>
                                )}

                                {!hiddenPlaygroundVisuals.includes('ThrowInTargetLeaders') && (
                                    <div className="glass-panel" style={{ display: 'flex', flexDirection: 'column', borderStyle: 'dashed', borderWidth: '2px', borderColor: 'var(--color-border)', backgroundColor: 'transparent', padding: '1.5rem', marginTop: '1.5rem' }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                                <span style={{ padding: '4px 8px', background: 'rgba(56,189,248,0.1)', color: 'var(--color-accent-blue)', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 'bold' }}>DRAFT</span>
                                                <h4 style={{ margin: 0, fontSize: '1.1rem' }}>Throw-In Target Leaders</h4>
                                            </div>
                                            <div style={{ display: 'flex', gap: '8px' }}>
                                                <button
                                                    onClick={() => toggleHiddenVisual('ThrowInTargetLeaders', true)}
                                                    style={{ padding: '0.5rem 1rem', backgroundColor: 'transparent', color: 'var(--color-text-secondary)', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', fontSize: '0.85rem', transition: 'all 0.2s ease' }}
                                                    title="Hide from playground and keep in folder"
                                                >
                                                    Hide in Folder
                                                </button>
                                                <button
                                                    onClick={() => handlePublish('ThrowInTargetLeaders')}
                                                    style={{ padding: '0.5rem 1rem', backgroundColor: publishedVisuals.includes('ThrowInTargetLeaders') ? 'rgba(56,189,248,0.1)' : 'var(--color-accent-blue)', color: publishedVisuals.includes('ThrowInTargetLeaders') ? 'var(--color-accent-blue)' : '#000', border: publishedVisuals.includes('ThrowInTargetLeaders') ? '1px solid var(--color-accent-blue)' : 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', fontSize: '0.85rem', transition: 'all 0.2s ease' }}
                                                >
                                                    {publishedVisuals.includes('ThrowInTargetLeaders') ? 'Published' : 'Publish to Dashboard'}
                                                </button>
                                            </div>
                                        </div>
                                        <div style={{...playgroundScaleStyle, height: '400px'}}>
                                            <ThrowInTargetLeaders data={mockThrowInTargetsData} teamName="Tromsø" />
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                    
                    {/* Defence Tab */}
                    {activeTab === 'defence' && (
                        <div className="fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '3rem' }}>
                            {!hiddenPlaygroundVisuals.includes('BuildUpDisruptionChart') && (
                                <div className="glass-panel" style={{ display: 'flex', flexDirection: 'column', borderStyle: 'dashed', borderWidth: '2px', borderColor: 'var(--color-border)', backgroundColor: 'transparent', padding: '1.5rem' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                            <span style={{ padding: '4px 8px', background: 'rgba(56,189,248,0.1)', color: 'var(--color-accent-blue)', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 'bold' }}>NEW</span>
                                            <h4 style={{ margin: 0, fontSize: '1.1rem' }}>Build-Up Disruption (BDP)</h4>
                                        </div>
                                        <div style={{ display: 'flex', gap: '8px' }}>
                                            <button
                                                onClick={() => toggleHiddenVisual('BuildUpDisruptionChart', true)}
                                                style={{ padding: '0.5rem 1rem', backgroundColor: 'transparent', color: 'var(--color-text-secondary)', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', fontSize: '0.85rem', transition: 'all 0.2s ease' }}
                                                title="Hide from playground and keep in folder"
                                            >
                                                📁 Place in Folder
                                            </button>
                                            <button
                                                onClick={() => handlePublish('BuildUpDisruptionChart')}
                                                style={{ padding: '0.5rem 1rem', backgroundColor: publishedVisuals.includes('BuildUpDisruptionChart') ? 'rgba(56,189,248,0.1)' : 'var(--color-accent-blue)', color: publishedVisuals.includes('BuildUpDisruptionChart') ? 'var(--color-accent-blue)' : '#000', border: publishedVisuals.includes('BuildUpDisruptionChart') ? '1px solid var(--color-accent-blue)' : 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', fontSize: '0.85rem', transition: 'all 0.2s ease' }}
                                            >
                                                {publishedVisuals.includes('BuildUpDisruptionChart') ? '✓ Published' : 'Publish to Dashboard'}
                                            </button>
                                        </div>
                                    </div>
                                    <div style={playgroundScaleStyle}>
                                        <BuildUpDisruptionChart 
                                            data={mockBdpData}
                                            teamName="Tromsø"
                                            teamColor="#E3001B"
                                            getBadge={getBadge}
                                            leagueStats={{ totalAvgBdp: 3.1, leagueRank: 2, totalTeams: 16 }}
                                        />
                                    </div>
                                </div>
                            )}

                            {!hiddenPlaygroundVisuals.includes('BallRecoveryMap') && (
                                <div className="glass-panel" style={{ display: 'flex', flexDirection: 'column', borderStyle: 'dashed', borderWidth: '2px', borderColor: 'var(--color-border)', backgroundColor: 'transparent', padding: '1.5rem' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                            <span style={{ padding: '4px 8px', background: 'rgba(56,189,248,0.1)', color: 'var(--color-accent-blue)', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 'bold' }}>DRAFT</span>
                                            <h4 style={{ margin: 0, fontSize: '1.1rem' }}>Ball Recoveries</h4>
                                        </div>
                                        <div style={{ display: 'flex', gap: '8px' }}>
                                            <button
                                                onClick={() => toggleHiddenVisual('BallRecoveryMap', true)}
                                                style={{ padding: '0.5rem 1rem', backgroundColor: 'transparent', color: 'var(--color-text-secondary)', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', fontSize: '0.85rem', transition: 'all 0.2s ease' }}
                                                title="Hide from playground and keep in folder"
                                            >
                                                📁 Place in Folder
                                            </button>
                                            <button
                                                onClick={() => handlePublish('BallRecoveryMap')}
                                                style={{ padding: '0.5rem 1rem', backgroundColor: publishedVisuals.includes('BallRecoveryMap') ? 'rgba(56,189,248,0.1)' : 'var(--color-accent-blue)', color: publishedVisuals.includes('BallRecoveryMap') ? 'var(--color-accent-blue)' : '#000', border: publishedVisuals.includes('BallRecoveryMap') ? '1px solid var(--color-accent-blue)' : 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', fontSize: '0.85rem', transition: 'all 0.2s ease' }}
                                            >
                                                {publishedVisuals.includes('BallRecoveryMap') ? '✓ Published' : 'Publish to Dashboard'}
                                            </button>
                                        </div>
                                    </div>
                                    <div style={playgroundScaleStyle}>
                                        <BallRecoveryMap recoveries={mockBallRecoveries} />
                                    </div>
                                </div>
                            )}

                            {!hiddenPlaygroundVisuals.includes('AverageDefensiveActionHeight') && (
                                <div className="glass-panel" style={{ display: 'flex', flexDirection: 'column', borderStyle: 'dashed', borderWidth: '2px', borderColor: 'var(--color-border)', backgroundColor: 'transparent', padding: '1.5rem' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                            <span style={{ padding: '4px 8px', background: 'rgba(56,189,248,0.1)', color: 'var(--color-accent-blue)', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 'bold' }}>NEW</span>
                                            <h4 style={{ margin: 0, fontSize: '1.1rem' }}>Avg Defensive Action Height</h4>
                                        </div>
                                        <div style={{ display: 'flex', gap: '8px' }}>
                                            <button
                                                onClick={() => toggleHiddenVisual('AverageDefensiveActionHeight', true)}
                                                style={{ padding: '0.5rem 1rem', backgroundColor: 'transparent', color: 'var(--color-text-secondary)', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', fontSize: '0.85rem', transition: 'all 0.2s ease' }}
                                                title="Hide from playground and keep in folder"
                                            >
                                                📁 Place in Folder
                                            </button>
                                            <button
                                                onClick={() => handlePublish('AverageDefensiveActionHeight')}
                                                style={{ padding: '0.5rem 1rem', backgroundColor: publishedVisuals.includes('AverageDefensiveActionHeight') ? 'rgba(56,189,248,0.1)' : 'var(--color-accent-blue)', color: publishedVisuals.includes('AverageDefensiveActionHeight') ? 'var(--color-accent-blue)' : '#000', border: publishedVisuals.includes('AverageDefensiveActionHeight') ? '1px solid var(--color-accent-blue)' : 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', fontSize: '0.85rem', transition: 'all 0.2s ease' }}
                                            >
                                                {publishedVisuals.includes('AverageDefensiveActionHeight') ? '✓ Published' : 'Publish to Dashboard'}
                                            </button>
                                        </div>
                                    </div>
                                    <div style={playgroundScaleStyle}>
                                        <AverageDefensiveActionHeight 
                                            teamName="Tromsø" 
                                            teamColor="#E3001B"
                                            teamData={mockBallRecoveries}
                                            opponentName="Fredrikstad"
                                            opponentColor="#ffffff"
                                            opponentData={mockOpponentRecoveries}
                                            leagueData={[...mockBallRecoveries, ...mockOpponentRecoveries]}
                                        />
                                    </div>
                                </div>
                            )}

                            {/* Block Compactness */}
                            <div className="glass-panel" style={{ padding: '1.5rem', marginTop: '1.5rem', border: '1px solid rgba(255,255,255,0.05)', position: 'relative' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                                    <div>
                                        <h3 style={{ margin: 0, fontSize: '1.1rem', color: '#fff', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                            Block Compactness
                                        </h3>
                                        <p style={{ margin: '0.2rem 0 0 0', fontSize: '0.8rem', color: 'var(--color-text-secondary)' }}>
                                            View block depth and spread
                                        </p>
                                    </div>
                                    <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                                        <button 
                                            onClick={() => toggleHiddenVisual('BlockCompactness', true)}
                                            style={{ background: 'transparent', border: 'none', color: 'var(--color-text-secondary)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.8rem' }}
                                        >
                                            Hide Example
                                        </button>
                                        <button 
                                            onClick={() => handlePublish('BlockCompactness')}
                                            style={{ padding: '0.5rem 1rem', backgroundColor: publishedVisuals.includes('BlockCompactness') ? 'rgba(56,189,248,0.1)' : 'var(--color-accent-blue)', color: publishedVisuals.includes('BlockCompactness') ? 'var(--color-accent-blue)' : '#000', border: publishedVisuals.includes('BlockCompactness') ? '1px solid var(--color-accent-blue)' : 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', fontSize: '0.85rem', transition: 'all 0.2s ease' }}
                                        >
                                            {publishedVisuals.includes('BlockCompactness') ? 'V Published' : 'Publish to Dashboard'}
                                        </button>
                                    </div>
                                </div>
                                
                                {!hiddenPlaygroundVisuals.includes('BlockCompactness') && (
                                    <div style={{ padding: '1.5rem', background: 'rgba(0,0,0,0.2)', borderRadius: '8px' }}>
                                        <div style={{ marginBottom: '1rem', fontSize: '0.8rem', color: 'var(--color-text-secondary)', display: 'flex', justifyContent: 'space-between' }}>
                                            <span>Mock Match: Tromsø vs Fredrikstad</span>
                                        </div>
                                        <div style={playgroundScaleStyle}>
                                            <BlockCompactness 
                                                teamName="Tromsø" 
                                                teamColor="#E3001B"
                                                teamData={mockBallRecoveries}
                                                opponentName="Fredrikstad"
                                                opponentColor="#ffffff"
                                                opponentData={mockOpponentRecoveries}
                                                leagueStats={{ minBlock: 35, maxBlock: 72 }}
                                            />
                                        </div>
                                    </div>
                                )}
                            </div>
                            {!hiddenPlaygroundVisuals.includes('PpdaCard') && (
                                <div className="glass-panel" style={{ display: 'flex', flexDirection: 'column', borderStyle: 'dashed', borderWidth: '2px', borderColor: 'var(--color-border)', backgroundColor: 'transparent', padding: '1.5rem' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                            <span style={{ padding: '4px 8px', background: 'rgba(56,189,248,0.1)', color: 'var(--color-accent-blue)', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 'bold' }}>DRAFT</span>
                                            <h4 style={{ margin: 0, fontSize: '1.1rem' }}>Passes per Defensive Action</h4>
                                        </div>
                                        <div style={{ display: 'flex', gap: '8px' }}>
                                            <button
                                                onClick={() => toggleHiddenVisual('PpdaCard', true)}
                                                style={{ padding: '0.5rem 1rem', backgroundColor: 'transparent', color: 'var(--color-text-secondary)', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', fontSize: '0.85rem', transition: 'all 0.2s ease' }}
                                                title="Hide from playground and keep in folder"
                                            >
                                                📁 Place in Folder
                                            </button>
                                            <button
                                                onClick={() => handlePublish('PpdaCard')}
                                                style={{ padding: '0.5rem 1rem', backgroundColor: publishedVisuals.includes('PpdaCard') ? 'rgba(56,189,248,0.1)' : 'var(--color-accent-blue)', color: publishedVisuals.includes('PpdaCard') ? 'var(--color-accent-blue)' : '#000', border: publishedVisuals.includes('PpdaCard') ? '1px solid var(--color-accent-blue)' : 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', fontSize: '0.85rem', transition: 'all 0.2s ease' }}
                                            >
                                                {publishedVisuals.includes('PpdaCard') ? '✓ Published' : 'Publish to Dashboard'}
                                            </button>
                                        </div>
                                    </div>
                                    <div style={{ width: '100%', maxWidth: '800px', margin: '0 auto' }}>
                                        <PpdaCard 
                                            teamName={mockPpdaLeague.teamName} 
                                            ppdaValue={mockPpdaLeague.ppdaValue} 
                                            rank={mockPpdaLeague.rank} 
                                            totalTeams={mockPpdaLeague.totalTeams}
                                            leagueData={mockPpdaLeagueData}
                                            getBadge={getBadge}
                                        />
                                    </div>
                                </div>
                            )}

                            {!hiddenPlaygroundVisuals.includes('DefenceRadarChart') && (
                                <div className="glass-panel" style={{ display: 'flex', flexDirection: 'column', borderStyle: 'dashed', borderWidth: '2px', borderColor: 'var(--color-border)', backgroundColor: 'transparent', padding: '1.5rem' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                            <span style={{ padding: '4px 8px', background: 'rgba(56,189,248,0.1)', color: 'var(--color-accent-blue)', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 'bold' }}>NEW</span>
                                            <h4 style={{ margin: 0, fontSize: '1.1rem' }}>Defence Radar Chart</h4>
                                        </div>
                                        <div style={{ display: 'flex', gap: '8px' }}>
                                            <button
                                                onClick={() => toggleHiddenVisual('DefenceRadarChart', true)}
                                                style={{ padding: '0.5rem 1rem', backgroundColor: 'transparent', color: 'var(--color-text-secondary)', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', fontSize: '0.85rem', transition: 'all 0.2s ease' }}
                                                title="Hide from playground and keep in folder"
                                            >
                                                📁 Place in Folder
                                            </button>
                                            <button
                                                onClick={() => handlePublish('DefenceRadarChart')}
                                                style={{ padding: '0.5rem 1rem', backgroundColor: publishedVisuals.includes('DefenceRadarChart') ? 'rgba(56,189,248,0.1)' : 'var(--color-accent-blue)', color: publishedVisuals.includes('DefenceRadarChart') ? 'var(--color-accent-blue)' : '#000', border: publishedVisuals.includes('DefenceRadarChart') ? '1px solid var(--color-accent-blue)' : 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', fontSize: '0.85rem', transition: 'all 0.2s ease' }}
                                            >
                                                {publishedVisuals.includes('DefenceRadarChart') ? '✓ Published' : 'Publish to Dashboard'}
                                            </button>
                                        </div>
                                    </div>
                                    <div style={playgroundScaleStyle}>
                                        <ErrorBoundary>
                                            <DefenceRadarChart 
                                                teamName="Tromsø" 
                                                teamColor="#E3001B"
                                                localTeamStats={mockLeagueDefenceMetrics?.leagueData?.['Tromsø'] || null}
                                                globalTeamStats={mockLeagueDefenceMetrics?.leagueData?.['League Average'] || null}
                                                totalTeams={16}
                                            />
                                        </ErrorBoundary>
                                    </div>
                                </div>
                            )}

                            {!hiddenPlaygroundVisuals.includes('BdpChart') && (
                                <div className="glass-panel" style={{ display: 'flex', flexDirection: 'column', borderStyle: 'dashed', borderWidth: '2px', borderColor: 'var(--color-border)', backgroundColor: 'transparent', padding: '1.5rem' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                            <span style={{ padding: '4px 8px', background: 'rgba(56,189,248,0.1)', color: 'var(--color-accent-blue)', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 'bold' }}>NEW</span>
                                            <h4 style={{ margin: 0, fontSize: '1.1rem' }}>BDP Chart</h4>
                                        </div>
                                        <div style={{ display: 'flex', gap: '8px' }}>
                                            <button
                                                onClick={() => toggleHiddenVisual('BdpChart', true)}
                                                style={{ padding: '0.5rem 1rem', backgroundColor: 'transparent', color: 'var(--color-text-secondary)', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', fontSize: '0.85rem', transition: 'all 0.2s ease' }}
                                                title="Hide from playground and keep in folder"
                                            >
                                                📁 Place in Folder
                                            </button>
                                            <button
                                                onClick={() => handlePublish('BdpChart')}
                                                style={{ padding: '0.5rem 1rem', backgroundColor: publishedVisuals.includes('BdpChart') ? 'rgba(56,189,248,0.1)' : 'var(--color-accent-blue)', color: publishedVisuals.includes('BdpChart') ? 'var(--color-accent-blue)' : '#000', border: publishedVisuals.includes('BdpChart') ? '1px solid var(--color-accent-blue)' : 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', fontSize: '0.85rem', transition: 'all 0.2s ease' }}
                                            >
                                                {publishedVisuals.includes('BdpChart') ? '✓ Published' : 'Publish to Dashboard'}
                                            </button>
                                        </div>
                                    </div>
                                    <div style={playgroundScaleStyle}>
                                        <ErrorBoundary>
                                            <LeagueBdpChart 
                                                leagueData={mockLeagueDefenceMetrics?.leagueData}
                                                getBadge={getCachedBadge}
                                                selectedTeam={null}
                                            />
                                        </ErrorBoundary>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Transitions Tab */}
                    {activeTab === 'transitions' && (
                        <div className="fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '3rem' }}>
                            {!hiddenPlaygroundVisuals.includes('transitionsRadar') && (
                                <div className="glass-panel" style={{ display: 'flex', flexDirection: 'column', borderStyle: 'dashed', borderWidth: '2px', borderColor: 'var(--color-border)', backgroundColor: 'transparent', padding: '1.5rem' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                            <span style={{ padding: '4px 8px', background: 'rgba(56,189,248,0.1)', color: 'var(--color-accent-blue)', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 'bold' }}>NEW</span>
                                            <h4 style={{ margin: 0, fontSize: '1.1rem' }}>Attacking Transitions Profile</h4>
                                        </div>
                                        <div style={{ display: 'flex', gap: '8px' }}>
                                            <button
                                                onClick={() => toggleHiddenVisual('transitionsRadar', true)}
                                                style={{ padding: '0.5rem 1rem', backgroundColor: 'transparent', color: 'var(--color-text-secondary)', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', fontSize: '0.85rem', transition: 'all 0.2s ease' }}
                                                title="Hide from playground and keep in folder"
                                            >
                                                📁 Place in Folder
                                            </button>
                                            <button
                                                onClick={() => handlePublish('transitionsRadar')}
                                                style={{ padding: '0.5rem 1rem', backgroundColor: publishedVisuals.includes('transitionsRadar') ? 'rgba(56,189,248,0.1)' : 'var(--color-accent-blue)', color: publishedVisuals.includes('transitionsRadar') ? 'var(--color-accent-blue)' : '#000', border: publishedVisuals.includes('transitionsRadar') ? '1px solid var(--color-accent-blue)' : 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', fontSize: '0.85rem', transition: 'all 0.2s ease' }}
                                            >
                                                {publishedVisuals.includes('transitionsRadar') ? '✓ Published' : 'Publish to Dashboard'}
                                            </button>
                                        </div>
                                    </div>
                                    <div style={{ padding: '2rem 0', width: '100%', maxWidth: '800px', margin: '0 auto', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                                        <ErrorBoundary>
                                            <TransitionRadarChart 
                                                teamName="Tromsø" 
                                                teamColor="#E3001B"
                                                localTeamStats={mockLeagueTransitionMetrics?.leagueData?.['Tromsø'] || null}
                                                globalTeamStats={mockLeagueTransitionMetrics?.leagueData?.['League Average'] || null}
                                                totalTeams={16}
                                            />
                                        </ErrorBoundary>
                                    </div>
                                </div>
                            )}

                            {!hiddenPlaygroundVisuals.includes('RecoveryZonesMap') && (
                                <div className="glass-panel" style={{ display: 'flex', flexDirection: 'column', borderStyle: 'dashed', borderWidth: '2px', borderColor: 'var(--color-border)', backgroundColor: 'transparent', padding: '1.5rem' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                            <span style={{ padding: '4px 8px', background: 'rgba(56,189,248,0.1)', color: 'var(--color-accent-blue)', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 'bold' }}>NEW</span>
                                            <h4 style={{ margin: 0, fontSize: '1.1rem' }}>Transitions by Zone</h4>
                                        </div>
                                        <div style={{ display: 'flex', gap: '8px' }}>
                                            <button
                                                onClick={() => toggleHiddenVisual('RecoveryZonesMap', true)}
                                                style={{ padding: '0.5rem 1rem', backgroundColor: 'transparent', color: 'var(--color-text-secondary)', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', fontSize: '0.85rem', transition: 'all 0.2s ease' }}
                                                title="Hide from playground and keep in folder"
                                            >
                                                📁 Place in Folder
                                            </button>
                                            <button
                                                onClick={() => handlePublish('RecoveryZonesMap')}
                                                style={{ padding: '0.5rem 1rem', backgroundColor: publishedVisuals.includes('RecoveryZonesMap') ? 'rgba(56,189,248,0.1)' : 'var(--color-accent-blue)', color: publishedVisuals.includes('RecoveryZonesMap') ? 'var(--color-accent-blue)' : '#000', border: publishedVisuals.includes('RecoveryZonesMap') ? '1px solid var(--color-accent-blue)' : 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', fontSize: '0.85rem', transition: 'all 0.2s ease' }}
                                            >
                                                {publishedVisuals.includes('RecoveryZonesMap') ? '✓ Published' : 'Publish to Dashboard'}
                                            </button>
                                        </div>
                                    </div>
                                    <div style={playgroundScaleStyle}>
                                        <RecoveryZonesMap 
                                            teamName="Tromsø" 
                                            teamLogo="https://images.fotmob.com/image_resources/logo/teamlogo/8547.png" 
                                            teamColor="#ef4444" 
                                            attackingData={mockTransitions} 
                                            defensiveData={mockTransitions} 
                                        />
                                    </div>
                                </div>
                            )}

                            {!hiddenPlaygroundVisuals.includes('TransitionMap') && (
                                <div className="glass-panel" style={{ display: 'flex', flexDirection: 'column', borderStyle: 'dashed', borderWidth: '2px', borderColor: 'var(--color-border)', backgroundColor: 'transparent', padding: '1.5rem' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                            <span style={{ padding: '4px 8px', background: 'rgba(56,189,248,0.1)', color: 'var(--color-accent-blue)', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 'bold' }}>DRAFT</span>
                                            <h4 style={{ margin: 0, fontSize: '1.1rem' }}>ATT Transition Zones</h4>
                                        </div>
                                        <div style={{ display: 'flex', gap: '8px' }}>
                                            <button
                                                onClick={() => toggleHiddenVisual('TransitionMap', true)}
                                                style={{ padding: '0.5rem 1rem', backgroundColor: 'transparent', color: 'var(--color-text-secondary)', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', fontSize: '0.85rem', transition: 'all 0.2s ease' }}
                                                title="Hide from playground and keep in folder"
                                            >
                                                📁 Place in Folder
                                            </button>
                                            <button
                                                onClick={() => handlePublish('TransitionMap')}
                                                style={{ padding: '0.5rem 1rem', backgroundColor: publishedVisuals.includes('TransitionMap') ? 'rgba(56,189,248,0.1)' : 'var(--color-accent-blue)', color: publishedVisuals.includes('TransitionMap') ? 'var(--color-accent-blue)' : '#000', border: publishedVisuals.includes('TransitionMap') ? '1px solid var(--color-accent-blue)' : 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', fontSize: '0.85rem', transition: 'all 0.2s ease' }}
                                            >
                                                {publishedVisuals.includes('TransitionMap') ? '✓ Published' : 'Publish to Dashboard'}
                                            </button>
                                        </div>
                                    </div>
                                    <div style={playgroundScaleStyle}>
                                        <TransitionMap transitions={mockTransitions} />
                                    </div>
                                </div>
                            )}

                            {!hiddenPlaygroundVisuals.includes('DefensiveTransitionMap') && (
                                <div className="glass-panel" style={{ display: 'flex', flexDirection: 'column', borderStyle: 'dashed', borderWidth: '2px', borderColor: 'var(--color-border)', backgroundColor: 'transparent', padding: '1.5rem' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                                        <div>
                                            <h3 className="section-title" style={{ marginTop: 0 }}>Defensive Transition Zones</h3>
                                            <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.85rem', margin: '4px 0 0 0' }}>Heatmap tracking where possession is lost, signaling where the opponent begins their attacks.</p>
                                        </div>
                                        <div style={{ display: 'flex', gap: '8px' }}>
                                            <button
                                                onClick={() => toggleHiddenVisual('DefensiveTransitionMap', true)}
                                                style={{ padding: '0.5rem 1rem', backgroundColor: 'transparent', color: 'var(--color-text-secondary)', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', fontSize: '0.85rem', transition: 'all 0.2s ease' }}
                                                title="Hide from playground and keep in folder"
                                            >
                                                Hide
                                            </button>
                                            <button
                                                onClick={() => handlePublish('DefensiveTransitionMap')}
                                                style={{ padding: '0.5rem 1rem', backgroundColor: publishedVisuals.includes('DefensiveTransitionMap') ? 'rgba(56,189,248,0.1)' : 'var(--color-accent-blue)', color: publishedVisuals.includes('DefensiveTransitionMap') ? 'var(--color-accent-blue)' : '#000', border: publishedVisuals.includes('DefensiveTransitionMap') ? '1px solid var(--color-accent-blue)' : 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', fontSize: '0.85rem', transition: 'all 0.2s ease' }}
                                            >
                                                {publishedVisuals.includes('DefensiveTransitionMap') ? 'V Published' : 'Publish to Dashboard'}
                                            </button>
                                        </div>
                                    </div>
                                    <div style={playgroundScaleStyle}>
                                        <DefensiveTransitionMap transitions={mockTransitions} />
                                    </div>
                                </div>
                            )}

                            {!hiddenPlaygroundVisuals.includes('TransitionTimeChart') && (
                                <div className="glass-panel" style={{ display: 'flex', flexDirection: 'column', borderStyle: 'dashed', borderWidth: '2px', borderColor: 'var(--color-border)', backgroundColor: 'transparent', padding: '1.5rem' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                            <span style={{ padding: '4px 8px', background: 'rgba(56,189,248,0.1)', color: 'var(--color-accent-blue)', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 'bold' }}>NEW</span>
                                            <h4 style={{ margin: 0, fontSize: '1.1rem' }}>Transition Time-to-Action</h4>
                                        </div>
                                        <div style={{ display: 'flex', gap: '8px' }}>
                                            <button
                                                onClick={() => toggleHiddenVisual('TransitionTimeChart', true)}
                                                style={{ padding: '0.5rem 1rem', backgroundColor: 'transparent', color: 'var(--color-text-secondary)', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', fontSize: '0.85rem', transition: 'all 0.2s ease' }}
                                                title="Hide from playground and keep in folder"
                                            >
                                                📁 Place in Folder
                                            </button>
                                            <button
                                                onClick={() => handlePublish('TransitionTimeChart')}
                                                style={{ padding: '0.5rem 1rem', backgroundColor: publishedVisuals.includes('TransitionTimeChart') ? 'rgba(56,189,248,0.1)' : 'var(--color-accent-blue)', color: publishedVisuals.includes('TransitionTimeChart') ? 'var(--color-accent-blue)' : '#000', border: publishedVisuals.includes('TransitionTimeChart') ? '1px solid var(--color-accent-blue)' : 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', fontSize: '0.85rem', transition: 'all 0.2s ease' }}
                                            >
                                                {publishedVisuals.includes('TransitionTimeChart') ? '✓ Published' : 'Publish to Dashboard'}
                                            </button>
                                        </div>
                                    </div>
                                    <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '1rem', paddingRight: '1.5rem' }}>
                                        <select 
                                            value={playgroundTeam} 
                                            onChange={(e) => setPlaygroundTeam(e.target.value)}
                                            style={{ 
                                                background: 'rgba(0,0,0,0.4)', 
                                                color: '#fff', 
                                                border: '1px solid rgba(255,255,255,0.2)', 
                                                padding: '0.4rem 0.8rem', 
                                                borderRadius: '6px',
                                                outline: 'none',
                                                cursor: 'pointer'
                                            }}
                                        >
                                            {Object.keys(TEAM_COLORS).filter((v, i, a) => a.indexOf(v) === i && !v.includes(' IL') && !v.includes(' FK') && !v.includes(' SK') && !v.includes(' Fotball') && !v.includes(' BK') && !v.includes(' Oslo') && !v.includes('Hamarkameratene')).map(t => (
                                                <option key={t} value={t}>{t}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div style={playgroundScaleStyle}>
                                        <TransitionTimeChart 
                                            data={mockTransitionTimes} 
                                            teamName={playgroundTeam} 
                                            teamColor={TEAM_COLORS[playgroundTeam] || 'var(--color-primary)'}
                                        />
                                    </div>
                                </div>
                            )}

                            {!hiddenPlaygroundVisuals.includes('AttackingTransitionScatterChart') && (
                                <div className="glass-panel" style={{ display: 'flex', flexDirection: 'column', borderStyle: 'dashed', borderWidth: '2px', borderColor: 'var(--color-border)', backgroundColor: 'transparent', padding: '1.5rem' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                            <span style={{ padding: '4px 8px', background: 'rgba(56,189,248,0.1)', color: 'var(--color-accent-blue)', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 'bold' }}>NEW</span>
                                            <h4 style={{ margin: 0, fontSize: '1.1rem' }}>Attacking Transitions Style</h4>
                                        </div>
                                        <div style={{ display: 'flex', gap: '8px' }}>
                                            <button
                                                onClick={() => toggleHiddenVisual('AttackingTransitionScatterChart', true)}
                                                style={{ padding: '0.5rem 1rem', backgroundColor: 'transparent', color: 'var(--color-text-secondary)', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', fontSize: '0.85rem', transition: 'all 0.2s ease' }}
                                                title="Hide from playground and keep in folder"
                                            >
                                                📁 Place in Folder
                                            </button>
                                            <button
                                                onClick={() => handlePublish('AttackingTransitionScatterChart')}
                                                style={{ padding: '0.5rem 1rem', backgroundColor: publishedVisuals.includes('AttackingTransitionScatterChart') ? 'rgba(56,189,248,0.1)' : 'var(--color-accent-blue)', color: publishedVisuals.includes('AttackingTransitionScatterChart') ? 'var(--color-accent-blue)' : '#000', border: publishedVisuals.includes('AttackingTransitionScatterChart') ? '1px solid var(--color-accent-blue)' : 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', fontSize: '0.85rem', transition: 'all 0.2s ease' }}
                                            >
                                                {publishedVisuals.includes('AttackingTransitionScatterChart') ? '✓ Published' : 'Publish to Dashboard'}
                                            </button>
                                        </div>
                                    </div>
                                    <div style={playgroundScaleStyle}>
                                        <AttackingTransitionScatterChart 
                                            leagueData={mockTransitionData} 
                                            getBadge={getBadge} 
                                        />
                                    </div>
                                </div>
                            )}

                            {!hiddenPlaygroundVisuals.includes('DefensiveTransitionScatterChart') && (
                                <div className="glass-panel" style={{ display: 'flex', flexDirection: 'column', borderStyle: 'dashed', borderWidth: '2px', borderColor: 'var(--color-border)', backgroundColor: 'transparent', padding: '1.5rem' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                            <span style={{ padding: '4px 8px', background: 'rgba(56,189,248,0.1)', color: 'var(--color-accent-blue)', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 'bold' }}>NEW</span>
                                            <h4 style={{ margin: 0, fontSize: '1.1rem' }}>Defensive Transition Scatter Chart</h4>
                                        </div>
                                        <div style={{ display: 'flex', gap: '8px' }}>
                                            <button
                                                onClick={() => toggleHiddenVisual('DefensiveTransitionScatterChart', true)}
                                                style={{ padding: '0.5rem 1rem', backgroundColor: 'transparent', color: 'var(--color-text-secondary)', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', fontSize: '0.85rem', transition: 'all 0.2s ease' }}
                                                title="Hide from playground and keep in folder"
                                            >
                                                📁 Place in Folder
                                            </button>
                                            <button
                                                onClick={() => handlePublish('DefensiveTransitionScatterChart')}
                                                style={{ padding: '0.5rem 1rem', backgroundColor: publishedVisuals.includes('DefensiveTransitionScatterChart') ? 'rgba(56,189,248,0.1)' : 'var(--color-accent-blue)', color: publishedVisuals.includes('DefensiveTransitionScatterChart') ? 'var(--color-accent-blue)' : '#000', border: publishedVisuals.includes('DefensiveTransitionScatterChart') ? '1px solid var(--color-accent-blue)' : 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', fontSize: '0.85rem', transition: 'all 0.2s ease' }}
                                            >
                                                {publishedVisuals.includes('DefensiveTransitionScatterChart') ? '✓ Published' : 'Publish to Dashboard'}
                                            </button>
                                        </div>
                                    </div>
                                    <div style={playgroundScaleStyle}>
                                        <DefensiveTransitionScatterChart 
                                            leagueData={mockDefensiveTransitionData} 
                                            getBadge={getBadge} 
                                        />
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Placeholder for other tabs */}
                    {activeTab !== 'attack' && activeTab !== 'set-pieces' && activeTab !== 'defence' && activeTab !== 'transitions' && (
                        <div className="fade-in glass-panel" style={{ padding: '4rem', textAlign: 'center', borderStyle: 'dashed', borderWidth: '2px', borderColor: 'var(--color-border)', backgroundColor: 'transparent' }}>
                            <p style={{ color: 'var(--color-text-secondary)', margin: 0 }}>Charts for {activeTab} will appear here during development.</p>
                        </div>
                    )}

                    {activeTab === 'attack' && (
                        <div className="fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '3rem' }}>
                            {!hiddenPlaygroundVisuals.includes('PossessionStyleChart') && (
                                <div className="glass-panel" style={{ display: 'flex', flexDirection: 'column', borderStyle: 'dashed', borderWidth: '2px', borderColor: 'var(--color-border)', backgroundColor: 'transparent', padding: '1.5rem' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                            <span style={{ padding: '4px 8px', background: 'rgba(56,189,248,0.1)', color: 'var(--color-accent-blue)', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 'bold' }}>NEW</span>
                                            <h4 style={{ margin: 0, fontSize: '1.1rem' }}>League Possession Style</h4>
                                        </div>
                                        <div style={{ display: 'flex', gap: '8px' }}>
                                            <button
                                                onClick={() => toggleHiddenVisual('PossessionStyleChart', true)}
                                                style={{ padding: '0.5rem 1rem', backgroundColor: 'transparent', color: 'var(--color-text-secondary)', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', fontSize: '0.85rem', transition: 'all 0.2s ease' }}
                                                title="Hide from playground and keep in folder"
                                            >
                                                📁 Place in Folder
                                            </button>
                                            <button
                                                onClick={() => handlePublish('PossessionStyleChart')}
                                                style={{ padding: '0.5rem 1rem', backgroundColor: publishedVisuals.includes('PossessionStyleChart') ? 'rgba(56,189,248,0.1)' : 'var(--color-accent-blue)', color: publishedVisuals.includes('PossessionStyleChart') ? 'var(--color-accent-blue)' : '#000', border: publishedVisuals.includes('PossessionStyleChart') ? '1px solid var(--color-accent-blue)' : 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', fontSize: '0.85rem', transition: 'all 0.2s ease' }}
                                            >
                                                {publishedVisuals.includes('PossessionStyleChart') ? '✓ Published' : 'Publish to Dashboard'}
                                            </button>
                                        </div>
                                    </div>
                                    <div style={playgroundScaleStyle}>
                                        <PossessionStyleChart data={mockPossessionStyle} getBadge={getBadge} />
                                    </div>
                                </div>
                            )}

                            {!hiddenPlaygroundVisuals.includes('AttackRadarChart') && (
                                <div className="glass-panel" style={{ display: 'flex', flexDirection: 'column', borderStyle: 'dashed', borderWidth: '2px', borderColor: 'var(--color-border)', backgroundColor: 'transparent', padding: '1.5rem' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                            <span style={{ padding: '4px 8px', background: 'rgba(56,189,248,0.1)', color: 'var(--color-accent-blue)', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 'bold' }}>NEW</span>
                                            <h4 style={{ margin: 0, fontSize: '1.1rem' }}>Attack Radar Chart</h4>
                                        </div>
                                        <div style={{ display: 'flex', gap: '8px' }}>
                                            <button
                                                onClick={() => toggleHiddenVisual('AttackRadarChart', true)}
                                                style={{ padding: '0.5rem 1rem', backgroundColor: 'transparent', color: 'var(--color-text-secondary)', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', fontSize: '0.85rem', transition: 'all 0.2s ease' }}
                                                title="Hide from playground and keep in folder"
                                            >
                                                📁 Place in Folder
                                            </button>
                                            <button
                                                onClick={() => handlePublish('AttackRadarChart')}
                                                style={{ padding: '0.5rem 1rem', backgroundColor: publishedVisuals.includes('AttackRadarChart') ? 'rgba(56,189,248,0.1)' : 'var(--color-accent-blue)', color: publishedVisuals.includes('AttackRadarChart') ? 'var(--color-accent-blue)' : '#000', border: publishedVisuals.includes('AttackRadarChart') ? '1px solid var(--color-accent-blue)' : 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', fontSize: '0.85rem', transition: 'all 0.2s ease' }}
                                            >
                                                {publishedVisuals.includes('AttackRadarChart') ? '✓ Published' : 'Publish to Dashboard'}
                                            </button>
                                        </div>
                                    </div>
                                    <div style={playgroundScaleStyle}>
                                        <ErrorBoundary>
                                            <AttackRadarChart 
                                                teamName="Tromsø" 
                                                teamColor="#E3001B"
                                                opponentName="Opponent"
                                                opponentColor="#ffffff"
                                                leagueStats={mockLeagueAttackMetrics}
                                            />
                                        </ErrorBoundary>
                                    </div>
                                </div>
                            )}

                            {!hiddenPlaygroundVisuals.includes('FieldTiltMap') && (
                                <div className="glass-panel" style={{ display: 'flex', flexDirection: 'column', borderStyle: 'dashed', borderWidth: '2px', borderColor: 'var(--color-border)', backgroundColor: 'transparent', padding: '1.5rem' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                            <span style={{ padding: '4px 8px', background: 'rgba(56,189,248,0.1)', color: 'var(--color-accent-blue)', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 'bold' }}>NEW</span>
                                            <h4 style={{ margin: 0, fontSize: '1.1rem' }}>Field Tilt</h4>
                                        </div>
                                        <div style={{ display: 'flex', gap: '8px' }}>
                                            <button
                                                onClick={() => toggleHiddenVisual('FieldTiltMap', true)}
                                                style={{ padding: '0.5rem 1rem', backgroundColor: 'transparent', color: 'var(--color-text-secondary)', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', fontSize: '0.85rem', transition: 'all 0.2s ease' }}
                                                title="Hide from playground and keep in folder"
                                            >
                                                📁 Place in Folder
                                            </button>
                                            <button
                                                onClick={() => handlePublish('FieldTiltMap')}
                                                style={{ padding: '0.5rem 1rem', backgroundColor: publishedVisuals.includes('FieldTiltMap') ? 'rgba(56,189,248,0.1)' : 'var(--color-accent-blue)', color: publishedVisuals.includes('FieldTiltMap') ? 'var(--color-accent-blue)' : '#000', border: publishedVisuals.includes('FieldTiltMap') ? '1px solid var(--color-accent-blue)' : 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', fontSize: '0.85rem', transition: 'all 0.2s ease' }}
                                            >
                                                {publishedVisuals.includes('FieldTiltMap') ? '✓ Published' : 'Publish to Dashboard'}
                                            </button>
                                        </div>
                                    </div>
                                    <div style={playgroundScaleStyle}>
                                        <FieldTiltMap 
                                            teamTilt={60.4} 
                                            opponentTilt={39.6} 
                                            teamName="Tromsø" 
                                            opponentName="Opponent" 
                                            teamCount={32} 
                                            opponentCount={21} 
                                            metricType="passes & touches" 
                                            teamPossession={55.2} 
                                            opponentPossession={44.8} 
                                        />
                                    </div>
                                </div>
                            )}

                            {!hiddenPlaygroundVisuals.includes('MatchMomentumChart') && (
                                <div className="glass-panel" style={{ display: 'flex', flexDirection: 'column', borderStyle: 'dashed', borderWidth: '2px', borderColor: 'var(--color-border)', backgroundColor: 'transparent', padding: '1.5rem' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                            <span style={{ padding: '4px 8px', background: 'rgba(56,189,248,0.1)', color: 'var(--color-accent-blue)', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 'bold' }}>NEW</span>
                                            <h4 style={{ margin: 0, fontSize: '1.1rem' }}>Match Momentum</h4>
                                        </div>
                                        <div style={{ display: 'flex', gap: '8px' }}>
                                            <button
                                                onClick={() => toggleHiddenVisual('MatchMomentumChart', true)}
                                                style={{ padding: '0.5rem 1rem', backgroundColor: 'transparent', color: 'var(--color-text-secondary)', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', fontSize: '0.85rem', transition: 'all 0.2s ease' }}
                                                title="Hide from playground and keep in folder"
                                            >
                                                📁 Place in Folder
                                            </button>
                                            <button
                                                onClick={() => handlePublish('MatchMomentumChart')}
                                                style={{ padding: '0.5rem 1rem', backgroundColor: publishedVisuals.includes('MatchMomentumChart') ? 'rgba(56,189,248,0.1)' : 'var(--color-accent-blue)', color: publishedVisuals.includes('MatchMomentumChart') ? 'var(--color-accent-blue)' : '#000', border: publishedVisuals.includes('MatchMomentumChart') ? '1px solid var(--color-accent-blue)' : 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', fontSize: '0.85rem', transition: 'all 0.2s ease' }}
                                            >
                                                {publishedVisuals.includes('MatchMomentumChart') ? '✓ Published' : 'Publish to Dashboard'}
                                            </button>
                                        </div>
                                    </div>
                                    <div style={playgroundScaleStyle}>
                                        <MatchMomentumChart 
                                            selectedData={mockMatchMomentum} 
                                            teamName="Tromsø" 
                                            opponentName="Opponent" 
                                            selectedCount={1} 
                                            onFetchAll={async () => {
                                                // Mock fetch all matches
                                                return new Promise(resolve => setTimeout(() => resolve({ 
                                                    data: mockMatchMomentum.map(d => ({...d, teamGoals: d.teamGoals * 2})), 
                                                    count: 5 
                                                }), 800));
                                            }}
                                        />
                                    </div>
                                </div>
                            )}

                            {!hiddenPlaygroundVisuals.includes('OppHalfEntriesMap') && (
                                <div className="glass-panel" style={{ display: 'flex', flexDirection: 'column', borderStyle: 'dashed', borderWidth: '2px', borderColor: 'var(--color-border)', backgroundColor: 'transparent', padding: '1.5rem' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                                        <div>
                                            <h3 className="section-title" style={{ margin: 0 }}>Opponent's Half Entries</h3>
                                            <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.85rem', marginTop: '0.5rem', marginBottom: 0 }}>How a team enters the opponent's half before the final third</p>
                                        </div>
                                        <div style={{ display: 'flex', gap: '8px' }}>
                                            <button
                                                onClick={() => toggleHiddenVisual('OppHalfEntriesMap', true)}
                                                style={{ padding: '0.5rem 1rem', backgroundColor: 'transparent', color: 'var(--color-text-secondary)', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', fontSize: '0.85rem', transition: 'all 0.2s ease' }}
                                                title="Hide from playground and keep in folder"
                                            >
                                                Hide
                                            </button>
                                            <button
                                                onClick={() => handlePublish('OppHalfEntriesMap')}
                                                style={{ padding: '0.5rem 1rem', backgroundColor: publishedVisuals.includes('OppHalfEntriesMap') ? 'rgba(56,189,248,0.1)' : 'var(--color-accent-blue)', color: publishedVisuals.includes('OppHalfEntriesMap') ? 'var(--color-accent-blue)' : '#000', border: publishedVisuals.includes('OppHalfEntriesMap') ? '1px solid var(--color-accent-blue)' : 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', fontSize: '0.85rem', transition: 'all 0.2s ease' }}
                                            >
                                                {publishedVisuals.includes('OppHalfEntriesMap') ? 'V Published' : 'Publish to Dashboard'}
                                            </button>
                                        </div>
                                    </div>
                                    <div style={playgroundScaleStyle}>
                                        <OppHalfEntriesMap entries={mockFinalThirdEntries} />
                                    </div>
                                </div>
                            )}

                            {!hiddenPlaygroundVisuals.includes('FinalThirdEntriesMap') && (
                                <div className="glass-panel" style={{ display: 'flex', flexDirection: 'column', borderStyle: 'dashed', borderWidth: '2px', borderColor: 'var(--color-border)', backgroundColor: 'transparent', padding: '1.5rem' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                            <span style={{ padding: '4px 8px', background: 'rgba(56,189,248,0.1)', color: 'var(--color-accent-blue)', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 'bold' }}>NEW</span>
                                            <h4 style={{ margin: 0, fontSize: '1.1rem' }}>Final Third Entries</h4>
                                        </div>
                                        <div style={{ display: 'flex', gap: '8px' }}>
                                            <button
                                                onClick={() => toggleHiddenVisual('FinalThirdEntriesMap', true)}
                                                style={{ padding: '0.5rem 1rem', backgroundColor: 'transparent', color: 'var(--color-text-secondary)', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', fontSize: '0.85rem', transition: 'all 0.2s ease' }}
                                                title="Hide from playground and keep in folder"
                                            >
                                                📁 Place in Folder
                                            </button>
                                            <button
                                                onClick={() => handlePublish('FinalThirdEntriesMap')}
                                                style={{ padding: '0.5rem 1rem', backgroundColor: publishedVisuals.includes('FinalThirdEntriesMap') ? 'rgba(56,189,248,0.1)' : 'var(--color-accent-blue)', color: publishedVisuals.includes('FinalThirdEntriesMap') ? 'var(--color-accent-blue)' : '#000', border: publishedVisuals.includes('FinalThirdEntriesMap') ? '1px solid var(--color-accent-blue)' : 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', fontSize: '0.85rem', transition: 'all 0.2s ease' }}
                                            >
                                                {publishedVisuals.includes('FinalThirdEntriesMap') ? '✓ Published' : 'Publish to Dashboard'}
                                            </button>
                                        </div>
                                    </div>
                                    <div style={playgroundScaleStyle}>
                                        <FinalThirdEntriesMap entries={mockFinalThirdEntries} />
                                    </div>
                                </div>
                            )}

                            {!hiddenPlaygroundVisuals.includes('ShotMap') && (
                                <div className="glass-panel" style={{ display: 'flex', flexDirection: 'column', borderStyle: 'dashed', borderWidth: '2px', borderColor: 'var(--color-border)', backgroundColor: 'transparent', padding: '1.5rem' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                            <span style={{ padding: '4px 8px', background: 'rgba(56,189,248,0.1)', color: 'var(--color-accent-blue)', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 'bold' }}>DRAFT</span>
                                            <h4 style={{ margin: 0, fontSize: '1.1rem' }}>Shot Map</h4>
                                        </div>
                                        <div style={{ display: 'flex', gap: '8px' }}>
                                            <button
                                                onClick={() => toggleHiddenVisual('ShotMap', true)}
                                                style={{ padding: '0.5rem 1rem', backgroundColor: 'transparent', color: 'var(--color-text-secondary)', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', fontSize: '0.85rem', transition: 'all 0.2s ease' }}
                                                title="Hide from playground and keep in folder"
                                            >
                                                📁 Place in Folder
                                            </button>
                                            <button
                                                onClick={() => handlePublish('ShotMap')}
                                                style={{ padding: '0.5rem 1rem', backgroundColor: publishedVisuals.includes('ShotMap') ? 'rgba(56,189,248,0.1)' : 'var(--color-accent-blue)', color: publishedVisuals.includes('ShotMap') ? 'var(--color-accent-blue)' : '#000', border: publishedVisuals.includes('ShotMap') ? '1px solid var(--color-accent-blue)' : 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', fontSize: '0.85rem', transition: 'all 0.2s ease' }}
                                            >
                                                {publishedVisuals.includes('ShotMap') ? '✓ Published' : 'Publish to Dashboard'}
                                            </button>
                                        </div>
                                    </div>
                                    <div style={playgroundScaleStyle}>
                                        <ShotMap shots={mockTromsoFredrikstadShots} />
                                    </div>
                                </div>
                            )}

                            {!hiddenPlaygroundVisuals.includes('PassNetworkMap') && (
                                <div className="glass-panel" style={{ display: 'flex', flexDirection: 'column', borderStyle: 'dashed', borderWidth: '2px', borderColor: 'var(--color-border)', backgroundColor: 'transparent', padding: '1.5rem' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                            <span style={{ padding: '4px 8px', background: 'rgba(56,189,248,0.1)', color: 'var(--color-accent-blue)', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 'bold' }}>NEW</span>
                                            <h4 style={{ margin: 0, fontSize: '1.1rem' }}>Pass Network</h4>
                                        </div>
                                        <div style={{ display: 'flex', gap: '8px' }}>
                                            <button
                                                onClick={() => toggleHiddenVisual('PassNetworkMap', true)}
                                                style={{ padding: '0.5rem 1rem', backgroundColor: 'transparent', color: 'var(--color-text-secondary)', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', fontSize: '0.85rem', transition: 'all 0.2s ease' }}
                                                title="Hide from playground and keep in folder"
                                            >
                                                📁 Place in Folder
                                            </button>
                                            <button
                                                onClick={() => handlePublish('PassNetworkMap')}
                                                style={{ padding: '0.5rem 1rem', backgroundColor: publishedVisuals.includes('PassNetworkMap') ? 'rgba(56,189,248,0.1)' : 'var(--color-accent-blue)', color: publishedVisuals.includes('PassNetworkMap') ? 'var(--color-accent-blue)' : '#000', border: publishedVisuals.includes('PassNetworkMap') ? '1px solid var(--color-accent-blue)' : 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', fontSize: '0.85rem', transition: 'all 0.2s ease' }}
                                            >
                                                {publishedVisuals.includes('PassNetworkMap') ? '✓ Published' : 'Publish to Dashboard'}
                                            </button>
                                        </div>
                                    </div>
                                    <div style={playgroundScaleStyle}>
                                        <ErrorBoundary>
                                            <PassNetworkMap networkData={mockPassNetworkData} teamColor="#E3001B" />
                                        </ErrorBoundary>
                                    </div>
                                </div>
                            )}

                            {!hiddenPlaygroundVisuals.includes('BuildUpMap') && (
                                <div className="glass-panel" style={{ display: 'flex', flexDirection: 'column', borderStyle: 'dashed', borderWidth: '2px', borderColor: 'var(--color-border)', backgroundColor: 'transparent', padding: '1.5rem' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                            <span style={{ padding: '4px 8px', background: 'rgba(34,197,94,0.1)', color: 'var(--color-accent-green)', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 'bold' }}>DRAFT</span>
                                            <h4 style={{ margin: 0, fontSize: '1.1rem' }}>Build-Up Map</h4>
                                        </div>
                                        <div style={{ display: 'flex', gap: '8px' }}>
                                            <button
                                                onClick={() => toggleHiddenVisual('BuildUpMap', true)}
                                                style={{ padding: '0.5rem 1rem', backgroundColor: 'transparent', color: 'var(--color-text-secondary)', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', fontSize: '0.85rem', transition: 'all 0.2s ease' }}
                                                title="Hide from playground and keep in folder"
                                            >
                                                📁 Place in Folder
                                            </button>
                                            <button
                                                onClick={() => handlePublish('BuildUpMap')}
                                                style={{ padding: '0.5rem 1rem', backgroundColor: publishedVisuals.includes('BuildUpMap') ? 'rgba(34,197,94,0.1)' : 'var(--color-accent-green)', color: publishedVisuals.includes('BuildUpMap') ? 'var(--color-accent-green)' : '#000', border: publishedVisuals.includes('BuildUpMap') ? '1px solid var(--color-accent-green)' : 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', fontSize: '0.85rem', transition: 'all 0.2s ease' }}
                                            >
                                                {publishedVisuals.includes('BuildUpMap') ? '✓ Published' : 'Publish to Dashboard'}
                                            </button>
                                        </div>
                                    </div>
                                    <div style={playgroundScaleStyle}>
                                        <BuildUpMap passes={mockBuildUpPasses} />
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Saved Visualizations Menu - Now more persistent */}
                    <div className="glass-panel fade-in" style={{ marginTop: '4rem', padding: '2rem', backgroundColor: 'rgba(0, 0, 0, 0.25)', border: '1px solid rgba(255, 255, 255, 0.08)' }}>
                        <h3 style={{ marginTop: 0, color: 'var(--color-text-primary)', display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <span>📁</span> Lagrede Visualiseringer <span style={{ fontSize: '0.9rem', color: 'var(--color-text-secondary)', fontWeight: 'normal' }}>Saved Visualizations</span>
                        </h3>
                        <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.9rem', marginBottom: '2rem' }}>
                            Visualizations published to the main dashboard. Click one to view it in the playground above.
                        </p>
                        
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                            {/* Attack Dropdown */}
                            <div className="glass-panel" style={{ padding: 0, overflow: 'hidden' }}>
                                <div 
                                    onClick={() => toggleSaveMenu('attack')}
                                    style={{ padding: '1rem 1.5rem', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(255,255,255,0.03)' }}
                                >
                                    <div style={{ color: 'var(--color-accent-blue)', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '12px' }}>
                                        ⚔️ Angrep (Attack)
                                    </div>
                                    <span style={{ transform: expandedSaves.attack ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.3s', color: 'var(--color-text-secondary)', fontSize: '0.8rem' }}>▼</span>
                                </div>
                                {expandedSaves.attack && (
                                    <div style={{ padding: '1rem 1.5rem', borderTop: '1px solid rgba(255,255,255,0.05)', background: 'rgba(0,0,0,0.2)' }}>
                                        {publishedVisuals.length > 0 ? (
                                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '1rem' }}>
                                                {publishedVisuals.includes('MatchMomentumChart') && (
                                                    <div onClick={() => setActiveTab('attack')} style={{ padding: '0.75rem', background: 'rgba(56,189,248,0.1)', borderRadius: '6px', border: '1px solid rgba(56,189,248,0.2)', cursor: 'pointer', transition: 'transform 0.2s' }} onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-2px)'} onMouseLeave={e => e.currentTarget.style.transform = 'none'}>
                                                        <div style={{ fontSize: '0.85rem', fontWeight: 'bold', color: 'var(--color-accent-blue)' }}>Match Momentum</div>
                                                        <div style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.5)', marginTop: '4px' }}>Published & Ready</div>
                                                    </div>
                                                )}
                                                {publishedVisuals.includes('OppHalfEntriesMap') && (
                                                    <div onClick={() => setActiveTab('attack')} style={{ padding: '0.75rem', background: 'rgba(56,189,248,0.1)', borderRadius: '6px', border: '1px solid rgba(56,189,248,0.2)', cursor: 'pointer', transition: 'transform 0.2s' }} onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-2px)'} onMouseLeave={e => e.currentTarget.style.transform = 'none'}>
                                                        <div style={{ fontSize: '0.85rem', fontWeight: 'bold', color: 'var(--color-accent-blue)' }}>Opponent's Half Entries</div>
                                                        <div style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.5)', marginTop: '4px' }}>Published & Ready</div>
                                                    </div>
                                                )}
                                                {publishedVisuals.includes('FinalThirdEntriesMap') && (
                                                    <div onClick={() => setActiveTab('attack')} style={{ padding: '0.75rem', background: 'rgba(56,189,248,0.1)', borderRadius: '6px', border: '1px solid rgba(56,189,248,0.2)', cursor: 'pointer', transition: 'transform 0.2s' }} onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-2px)'} onMouseLeave={e => e.currentTarget.style.transform = 'none'}>
                                                        <div style={{ fontSize: '0.85rem', fontWeight: 'bold', color: 'var(--color-accent-blue)' }}>Final Third Entries</div>
                                                        <div style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.5)', marginTop: '4px' }}>Published & Ready</div>
                                                    </div>
                                                )}
                                                {publishedVisuals.includes('ShotMap') && (
                                                    <div onClick={() => setActiveTab('attack')} style={{ padding: '0.75rem', background: 'rgba(56,189,248,0.1)', borderRadius: '6px', border: '1px solid rgba(56,189,248,0.2)', cursor: 'pointer', transition: 'transform 0.2s' }} onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-2px)'} onMouseLeave={e => e.currentTarget.style.transform = 'none'}>
                                                        <div style={{ fontSize: '0.85rem', fontWeight: 'bold', color: 'var(--color-accent-blue)' }}>Shot Map</div>
                                                        <div style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.5)', marginTop: '4px' }}>Published & Ready</div>
                                                    </div>
                                                )}
                                                {publishedVisuals.includes('PassNetworkMap') && (
                                                    <div onClick={() => setActiveTab('attack')} style={{ padding: '0.75rem', background: 'rgba(56,189,248,0.1)', borderRadius: '6px', border: '1px solid rgba(56,189,248,0.2)', cursor: 'pointer', transition: 'transform 0.2s' }} onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-2px)'} onMouseLeave={e => e.currentTarget.style.transform = 'none'}>
                                                        <div style={{ fontSize: '0.85rem', fontWeight: 'bold', color: 'var(--color-accent-blue)' }}>Pass Network</div>
                                                        <div style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.5)', marginTop: '4px' }}>Published & Ready</div>
                                                    </div>
                                                )}
                                                {publishedVisuals.includes('BuildUpMap') && (
                                                    <div onClick={() => setActiveTab('attack')} style={{ padding: '0.75rem', background: 'rgba(34,197,94,0.1)', borderRadius: '6px', border: '1px solid rgba(34,197,94,0.2)', cursor: 'pointer', transition: 'transform 0.2s' }} onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-2px)'} onMouseLeave={e => e.currentTarget.style.transform = 'none'}>
                                                        <div style={{ fontSize: '0.85rem', fontWeight: 'bold', color: 'var(--color-accent-green)' }}>Build-Up Map</div>
                                                        <div style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.5)', marginTop: '4px' }}>Published & Ready</div>
                                                    </div>
                                                )}
                                            </div>
                                        ) : (
                                            <div style={{ color: 'var(--color-text-secondary)', fontSize: '0.85rem', fontStyle: 'italic' }}>Ingen lagrede visualiseringer.</div>
                                        )}
                                    </div>
                                )}
                            </div>

                            {/* Set-Pieces Dropdown */}
                            <div className="glass-panel" style={{ padding: 0, overflow: 'hidden' }}>
                                <div 
                                    onClick={() => toggleSaveMenu('setPieces')}
                                    style={{ padding: '1rem 1.5rem', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(255,255,255,0.03)' }}
                                >
                                    <div style={{ color: 'var(--color-text-primary)', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '12px' }}>
                                        🎯 Dødballer (Set-Pieces)
                                    </div>
                                    <span style={{ transform: expandedSaves.setPieces ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.3s', color: 'var(--color-text-secondary)', fontSize: '0.8rem' }}>▼</span>
                                </div>
                                {expandedSaves.setPieces && (
                                    <div style={{ padding: '1rem 1.5rem', borderTop: '1px solid rgba(255,255,255,0.05)', background: 'rgba(0,0,0,0.2)' }}>
                                        {publishedVisuals.filter(v => ['CornerMap', 'FreeKickMap', 'ThrowInMap', 'ThrowInTargetLeaders', 'SetPieceTable'].includes(v)).length > 0 ? (
                                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '1rem' }}>
                                                {publishedVisuals.includes('SetPieceTable') && (
                                                    <div onClick={() => { setActiveTab('set-pieces'); toggleHiddenVisual('SetPieceTable', false); }} style={{ padding: '0.75rem', background: 'rgba(56,189,248,0.1)', borderRadius: '6px', border: '1px solid rgba(56,189,248,0.2)', cursor: 'pointer', transition: 'transform 0.2s' }} onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-2px)'} onMouseLeave={e => e.currentTarget.style.transform = 'none'}>
                                                        <div style={{ fontSize: '0.85rem', fontWeight: 'bold', color: 'var(--color-accent-blue)' }}>Set-Piece League Table</div>
                                                        <div style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.5)', marginTop: '4px' }}>Published & Ready</div>
                                                    </div>
                                                )}
                                                {publishedVisuals.includes('CornerMap') && (
                                                    <div onClick={() => { setActiveTab('set-pieces'); toggleHiddenVisual('CornerMap', false); }} style={{ padding: '0.75rem', background: 'rgba(56,189,248,0.1)', borderRadius: '6px', border: '1px solid rgba(56,189,248,0.2)', cursor: 'pointer', transition: 'transform 0.2s' }} onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-2px)'} onMouseLeave={e => e.currentTarget.style.transform = 'none'}>
                                                        <div style={{ fontSize: '0.85rem', fontWeight: 'bold', color: 'var(--color-accent-blue)' }}>Corner Map</div>
                                                        <div style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.5)', marginTop: '4px' }}>Published & Ready</div>
                                                    </div>
                                                )}
                                                {publishedVisuals.includes('FreeKickMap') && (
                                                    <div onClick={() => { setActiveTab('set-pieces'); toggleHiddenVisual('FreeKickMap', false); }} style={{ padding: '0.75rem', background: 'rgba(34,197,94,0.1)', borderRadius: '6px', border: '1px solid rgba(34,197,94,0.2)', cursor: 'pointer', transition: 'transform 0.2s' }} onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-2px)'} onMouseLeave={e => e.currentTarget.style.transform = 'none'}>
                                                        <div style={{ fontSize: '0.85rem', fontWeight: 'bold', color: 'var(--color-accent-green)' }}>Free Kick Map</div>
                                                        <div style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.5)', marginTop: '4px' }}>Published & Ready</div>
                                                    </div>
                                                )}
                                                {publishedVisuals.includes('ThrowInMap') && (
                                                    <div onClick={() => { setActiveTab('set-pieces'); toggleHiddenVisual('ThrowInMap', false); }} style={{ padding: '0.75rem', background: 'rgba(34,197,94,0.1)', borderRadius: '6px', border: '1px solid rgba(34,197,94,0.2)', cursor: 'pointer', transition: 'transform 0.2s' }} onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-2px)'} onMouseLeave={e => e.currentTarget.style.transform = 'none'}>
                                                        <div style={{ fontSize: '0.85rem', fontWeight: 'bold', color: 'var(--color-accent-green)' }}>Throw-In Distance</div>
                                                        <div style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.5)', marginTop: '4px' }}>Published & Ready</div>
                                                    </div>
                                                )}
                                                {publishedVisuals.includes('ThrowInTargetLeaders') && (
                                                    <div onClick={() => { setActiveTab('set-pieces'); toggleHiddenVisual('ThrowInTargetLeaders', false); }} style={{ padding: '0.75rem', background: 'rgba(34,197,94,0.1)', borderRadius: '6px', border: '1px solid rgba(34,197,94,0.2)', cursor: 'pointer', transition: 'transform 0.2s' }} onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-2px)'} onMouseLeave={e => e.currentTarget.style.transform = 'none'}>
                                                        <div style={{ fontSize: '0.85rem', fontWeight: 'bold', color: 'var(--color-accent-green)' }}>Throw-In Targets</div>
                                                        <div style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.5)', marginTop: '4px' }}>Published & Ready</div>
                                                    </div>
                                                )}
                                            </div>
                                        ) : (
                                            <div style={{ color: 'var(--color-text-secondary)', fontSize: '0.85rem', fontStyle: 'italic' }}>Ingen lagrede visualiseringer.</div>
                                        )}
                                    </div>
                                )}
                            </div>

                            {/* Defence Dropdown */}
                            <div className="glass-panel" style={{ padding: 0, overflow: 'hidden' }}>
                                <div 
                                    onClick={() => toggleSaveMenu('defence')}
                                    style={{ padding: '1rem 1.5rem', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(255,255,255,0.03)' }}
                                >
                                    <div style={{ color: 'var(--color-text-primary)', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '12px' }}>
                                        🛡️ Forsvar (Defence)
                                    </div>
                                    <span style={{ transform: expandedSaves.defence ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.3s', color: 'var(--color-text-secondary)', fontSize: '0.8rem' }}>▼</span>
                                </div>
                                {expandedSaves.defence && (
                                    <div style={{ padding: '1rem 1.5rem', borderTop: '1px solid rgba(255,255,255,0.05)', background: 'rgba(0,0,0,0.2)' }}>
                                        {publishedVisuals.filter(v => ['BallRecoveryMap', 'PpdaCard', 'AverageDefensiveActionHeight', 'BlockCompactness'].includes(v)).length > 0 ? (
                                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '1rem' }}>
                                                {publishedVisuals.includes('BallRecoveryMap') && (
                                                    <div onClick={() => { setActiveTab('defence'); toggleHiddenVisual('BallRecoveryMap', false); }} style={{ padding: '0.75rem', background: 'rgba(239,68,68,0.1)', borderRadius: '6px', border: '1px solid rgba(239,68,68,0.2)', cursor: 'pointer', transition: 'transform 0.2s' }} onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-2px)'} onMouseLeave={e => e.currentTarget.style.transform = 'none'}>
                                                        <div style={{ fontSize: '0.85rem', fontWeight: 'bold', color: 'var(--color-accent-red, #ef4444)' }}>Ball Recovery Map</div>
                                                        <div style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.5)', marginTop: '4px' }}>Published & Ready</div>
                                                    </div>
                                                )}
                                                {publishedVisuals.includes('PpdaCard') && (
                                                    <div onClick={() => { setActiveTab('defence'); toggleHiddenVisual('PpdaCard', false); }} style={{ padding: '0.75rem', background: 'rgba(74,222,128,0.1)', borderRadius: '6px', border: '1px solid rgba(74,222,128,0.2)', cursor: 'pointer', transition: 'transform 0.2s' }} onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-2px)'} onMouseLeave={e => e.currentTarget.style.transform = 'none'}>
                                                        <div style={{ fontSize: '0.85rem', fontWeight: 'bold', color: '#4ade80' }}>PPDA Flashcard</div>
                                                        <div style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.5)', marginTop: '4px' }}>Published & Ready</div>
                                                    </div>
                                                )}
                                                {publishedVisuals.includes('AverageDefensiveActionHeight') && (
                                                    <div onClick={() => { setActiveTab('defence'); toggleHiddenVisual('AverageDefensiveActionHeight', false); }} style={{ padding: '0.75rem', background: 'rgba(56,189,248,0.1)', borderRadius: '6px', border: '1px solid rgba(56,189,248,0.2)', cursor: 'pointer', transition: 'transform 0.2s' }} onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-2px)'} onMouseLeave={e => e.currentTarget.style.transform = 'none'}>
                                                        <div style={{ fontSize: '0.85rem', fontWeight: 'bold', color: 'var(--color-accent-blue)' }}>Avg Defensive Action Height</div>
                                                        <div style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.5)', marginTop: '4px' }}>Published & Ready</div>
                                                    </div>
                                                )}
                                                {publishedVisuals.includes('BlockCompactness') && (
                                                    <div onClick={() => { setActiveTab('defence'); toggleHiddenVisual('BlockCompactness', false); }} style={{ padding: '0.75rem', background: 'rgba(56,189,248,0.1)', borderRadius: '6px', border: '1px solid rgba(56,189,248,0.2)', cursor: 'pointer', transition: 'transform 0.2s' }} onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-2px)'} onMouseLeave={e => e.currentTarget.style.transform = 'none'}>
                                                        <div style={{ fontSize: '0.85rem', fontWeight: 'bold', color: 'var(--color-accent-blue)' }}>Block Compactness</div>
                                                        <div style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.5)', marginTop: '4px' }}>Published & Ready</div>
                                                    </div>
                                                )}
                                            </div>
                                        ) : (
                                            <div style={{ color: 'var(--color-text-secondary)', fontSize: '0.85rem', fontStyle: 'italic' }}>Ingen lagrede visualiseringer.</div>
                                        )}
                                    </div>
                                )}
                            </div>

                            {/* Transitions Dropdown */}
                            <div className="glass-panel" style={{ padding: 0, overflow: 'hidden' }}>
                                <div 
                                    onClick={() => toggleSaveMenu('transitions')}
                                    style={{ padding: '1rem 1.5rem', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(255,255,255,0.03)' }}
                                >
                                    <div style={{ color: 'var(--color-text-primary)', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '12px' }}>
                                        ⚡ Omstillinger (Transitions)
                                    </div>
                                    <span style={{ transform: expandedSaves.transitions ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.3s', color: 'var(--color-text-secondary)', fontSize: '0.8rem' }}>▼</span>
                                </div>
                                {expandedSaves.transitions && (
                                    <div style={{ padding: '1rem 1.5rem', borderTop: '1px solid rgba(255,255,255,0.05)', background: 'rgba(0,0,0,0.2)' }}>
                                        {publishedVisuals.filter(v => ['RecoveryZonesMap', 'TransitionMap', 'DefensiveTransitionMap', 'transitionsRadar'].includes(v)).length > 0 ? (
                                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '1rem' }}>
                                                {publishedVisuals.includes('transitionsRadar') && (
                                                    <div onClick={() => { setActiveTab('transitions'); toggleHiddenVisual('transitionsRadar', false); }} style={{ padding: '0.75rem', background: 'rgba(56,189,248,0.1)', borderRadius: '6px', border: '1px solid rgba(56,189,248,0.2)', cursor: 'pointer', transition: 'transform 0.2s' }} onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-2px)'} onMouseLeave={e => e.currentTarget.style.transform = 'none'}>
                                                        <div style={{ fontSize: '0.85rem', fontWeight: 'bold', color: 'rgb(56, 189, 248)' }}>Attacking Transitions Profile</div>
                                                        <div style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.5)', marginTop: '4px' }}>Published & Ready</div>
                                                    </div>
                                                )}
                                                {publishedVisuals.includes('RecoveryZonesMap') && (
                                                    <div onClick={() => { setActiveTab('transitions'); toggleHiddenVisual('RecoveryZonesMap', false); }} style={{ padding: '0.75rem', background: 'rgba(56,189,248,0.1)', borderRadius: '6px', border: '1px solid rgba(56,189,248,0.2)', cursor: 'pointer', transition: 'transform 0.2s' }} onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-2px)'} onMouseLeave={e => e.currentTarget.style.transform = 'none'}>
                                                        <div style={{ fontSize: '0.85rem', fontWeight: 'bold', color: 'rgb(56, 189, 248)' }}>Transitions by Zone</div>
                                                        <div style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.5)', marginTop: '4px' }}>Published & Ready</div>
                                                    </div>
                                                )}
                                                {publishedVisuals.includes('TransitionMap') && (
                                                    <div onClick={() => { setActiveTab('transitions'); toggleHiddenVisual('TransitionMap', false); }} style={{ padding: '0.75rem', background: 'rgba(168,85,247,0.1)', borderRadius: '6px', border: '1px solid rgba(168,85,247,0.2)', cursor: 'pointer', transition: 'transform 0.2s' }} onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-2px)'} onMouseLeave={e => e.currentTarget.style.transform = 'none'}>
                                                        <div style={{ fontSize: '0.85rem', fontWeight: 'bold', color: 'rgb(192, 132, 252)' }}>Transition Map</div>
                                                        <div style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.5)', marginTop: '4px' }}>Published & Ready</div>
                                                    </div>
                                                )}
                                                {publishedVisuals.includes('DefensiveTransitionMap') && (
                                                    <div onClick={() => { setActiveTab('transitions'); toggleHiddenVisual('DefensiveTransitionMap', false); }} style={{ padding: '0.75rem', background: 'rgba(168,85,247,0.1)', borderRadius: '6px', border: '1px solid rgba(168,85,247,0.2)', cursor: 'pointer', transition: 'transform 0.2s' }} onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-2px)'} onMouseLeave={e => e.currentTarget.style.transform = 'none'}>
                                                        <div style={{ fontSize: '0.85rem', fontWeight: 'bold', color: 'rgb(192, 132, 252)' }}>Defensive Transition Map</div>
                                                        <div style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.5)', marginTop: '4px' }}>Published & Ready</div>
                                                    </div>
                                                )}
                                            </div>
                                        ) : (
                                            <div style={{ color: 'var(--color-text-secondary)', fontSize: '0.85rem', fontStyle: 'italic' }}>Ingen lagrede visualiseringer.</div>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Settings;
