import React, { useState } from 'react';

const LandingPage = ({ onViewChange }) => {
  const [hoveredLeague, setHoveredLeague] = useState(null);

  const leagues = [
    {
      id: 'eliteserien',
      title: 'Eliteserien',
      logo: 'https://www.sbo.net/wp-content/uploads/2022/06/eliteserien1_large-1024x556.jpg',
      available: true
    },
    {
      id: 'allsvenskan',
      title: 'Allsvenskan',
      logo: 'https://play-lh.googleusercontent.com/i5PcRZ7THBo5aFxHcETaLnh-60cRx1Bqe_d9DZU40KuSiXXImFl5ApcadqmkPuOWAg6uSlPhk_Yz8sm0HDccu7Q',
      available: false
    },
    {
      id: 'superligaen',
      title: 'Superligaen',
      logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/0c/Superliga_2010.svg/960px-Superliga_2010.svg.png',
      available: false
    }
  ];

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'var(--color-bg-primary)',
      padding: '2rem'
    }}>
      <h1 style={{ fontSize: '4rem', fontWeight: '800', marginBottom: '1rem', color: 'var(--color-text-primary)' }}>Welcome</h1>
      <h2 style={{ fontSize: '2rem', fontWeight: '400', color: 'var(--color-text-secondary)', marginBottom: '4rem' }}>Choose a League</h2>
      
      <div style={{
        display: 'flex',
        gap: '2.5rem',
        flexWrap: 'wrap',
        justifyContent: 'center',
        maxWidth: '1200px'
      }}>
        {leagues.map((league) => (
          <div 
            key={league.id}
            className="glass-panel"
            onClick={() => league.available && onViewChange('dashboard')}
            onMouseEnter={() => setHoveredLeague(league.id)}
            onMouseLeave={() => setHoveredLeague(null)}
            style={{
              position: 'relative',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '3rem 2rem',
              width: '320px',
              cursor: league.available ? 'pointer' : 'not-allowed',
              transition: 'all 0.3s ease',
              transform: hoveredLeague === league.id && league.available ? 'translateY(-10px) scale(1.02)' : 'none',
              boxShadow: hoveredLeague === league.id && league.available ? '0 20px 40px rgba(0,0,0,0.4)' : 'none',
              border: hoveredLeague === league.id && league.available ? '1px solid rgba(255,255,255,0.2)' : '1px solid rgba(255,255,255,0.05)'
            }}
          >
            {/* Tooltip for unavailable leagues */}
            {!league.available && hoveredLeague === league.id && (
              <div style={{
                position: 'absolute',
                top: '-50px',
                background: '#ef4444',
                color: 'white',
                padding: '0.75rem 1.5rem',
                borderRadius: '8px',
                fontWeight: '600',
                fontSize: '0.9rem',
                whiteSpace: 'nowrap',
                boxShadow: '0 10px 25px rgba(239, 68, 68, 0.4)',
                zIndex: 10,
                pointerEvents: 'none',
                animation: 'fadeInUp 0.2s ease forwards'
              }}>
                This league is not yet available
                {/* Tooltip arrow */}
                <div style={{
                  position: 'absolute',
                  bottom: '-6px',
                  left: '50%',
                  transform: 'translateX(-50%)',
                  width: 0,
                  height: 0,
                  borderLeft: '6px solid transparent',
                  borderRight: '6px solid transparent',
                  borderTop: '6px solid #ef4444'
                }} />
              </div>
            )}

            <div style={{
              width: '200px',
              height: '200px',
              marginBottom: '2rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: 'rgba(255,255,255,0.03)',
              borderRadius: '50%',
              padding: '2rem'
            }}>
              <img 
                src={league.logo} 
                alt={league.title} 
                style={{
                  maxWidth: '100%',
                  maxHeight: '100%',
                  objectFit: 'contain',
                  filter: hoveredLeague === league.id && league.available ? 'drop-shadow(0px 10px 15px rgba(0,0,0,0.5))' : 'none',
                  transition: 'all 0.3s ease'
                }} 
              />
            </div>
            <h3 style={{ 
              fontSize: '1.75rem', 
              margin: 0, 
              color: 'var(--color-text-primary)',
              fontWeight: '600'
            }}>
              {league.title}
            </h3>
          </div>
        ))}
      </div>

      <style>{`
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
};

export default LandingPage;
