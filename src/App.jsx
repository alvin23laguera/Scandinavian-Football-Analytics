import { useState } from 'react'
import './styles/index.css' // Import Global Styles
import './App.css'           // Import Layout Styles
import Layout from './components/Layout'
import LandingPage from './pages/LandingPage'
import Dashboard from './pages/Dashboard'
import MatchAnalysis from './pages/MatchAnalysis'
import SquadManager from './pages/SquadManager'
import Schedule from './pages/Schedule'
import ClubInfo from './pages/ClubInfo'
import NmCupen from './pages/NmCupen'
import DataHub from './pages/DataHub'
import Settings from './pages/Settings'
import { MatchDataProvider } from './context/MatchDataContext'
import ErrorBoundary from './components/ErrorBoundary'

function App() {
  const [currentView, setCurrentView] = useState('landing');

  if (currentView === 'landing') {
    return (
      <MatchDataProvider>
        <LandingPage onViewChange={setCurrentView} />
      </MatchDataProvider>
    );
  }

  return (
    <MatchDataProvider>
      <ErrorBoundary>
        <Layout currentView={currentView} onViewChange={setCurrentView}>
          {currentView === 'dashboard' && <Dashboard />}
          {currentView === 'analysis' && <MatchAnalysis onViewChange={setCurrentView} />}
          {currentView === 'squad' && <SquadManager />}
          {currentView === 'schedule' && <Schedule onViewChange={setCurrentView} />}
          {currentView === 'club-info' && <ClubInfo onViewChange={setCurrentView} />}
          {currentView === 'nm-cupen' && <NmCupen />}
          {currentView === 'data-hub' && <DataHub />}
          {currentView === 'settings' && <Settings />}
        </Layout>
      </ErrorBoundary>
    </MatchDataProvider>
  )
}

export default App
