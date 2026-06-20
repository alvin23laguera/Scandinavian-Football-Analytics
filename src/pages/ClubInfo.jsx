import React from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { leagueStandings } from '../data/mockData';

// We map coordinates, stadiums, capacities, and historical titles for an analytical guide
const clubLocations = [
    { team: "Tromsø",     fullName: "Tromsø IL",               lat: 69.6492, lon: 18.9553, city: "Tromsø",      stadium: "Romssa Arena", capacity: "6,687", titles: 0, cupTitles: 2 },
    { team: "Bodø/Glimt", fullName: "FK Bodø/Glimt",           lat: 67.2804, lon: 14.4049, city: "Bodø",        stadium: "Aspmyra Stadion", capacity: "8,270", titles: 4, cupTitles: 2 },
    { team: "Rosenborg",  fullName: "Rosenborg BK",            lat: 63.4124, lon: 10.4045, city: "Trondheim",   stadium: "Lerkendal Stadion", capacity: "21,421", titles: 27, cupTitles: 11 },
    { team: "Molde",      fullName: "Molde FK",                lat: 62.7335, lon: 7.1472,  city: "Molde",       stadium: "Aker Stadion", capacity: "11,249", titles: 5, cupTitles: 6 },
    { team: "Kristiansund",fullName: "Kristiansund BK",        lat:63.1118, lon: 7.7314,  city: "Kristiansund",stadium: "Nordmøre Stadion", capacity: "4,444", titles: 1, cupTitles: 0 },
    { team: "Aalesund",   fullName: "Aalesunds FK",            lat: 62.4722, lon: 6.1884,  city: "Ålesund",     stadium: "Color Line Stadion", capacity: "10,778", titles: 0, cupTitles: 2 },
    { team: "Brann",      fullName: "SK Brann",                lat: 60.3664, lon: 5.3562,  city: "Bergen",      stadium: "Brann Stadion", capacity: "16,750", titles: 3, cupTitles: 5 },
    { team: "Viking",     fullName: "Viking FK",               lat: 58.9148, lon: 5.7275,  city: "Stavanger",   stadium: "SR-Bank Arena", capacity: "15,900", titles: 12, cupTitles: 4 },
    { team: "Start",      fullName: "IK Start",                lat: 58.1408, lon: 7.9897,  city: "Kristiansand",stadium: "Sparebanken Sør Arena", capacity: "14,448", titles: 2, cupTitles: 0 },
    { team: "Sandefjord", fullName: "Sandefjord Fotball",      lat: 59.1309, lon: 10.2173, city: "Sandefjord",  stadium: "Release Arena", capacity: "6,582", titles: 0, cupTitles: 0 },
    { team: "Fredrikstad",fullName: "Fredrikstad FK",          lat: 59.2140, lon: 10.9413, city: "Fredrikstad", stadium: "Fredrikstad Stadion", capacity: "12,500", titles: 11, cupTitles: 3 },
    { team: "Sarpsborg 08",fullName: "Sarpsborg 08 FF",        lat:59.2842, lon: 11.1119, city: "Sarpsborg",   stadium: "Sarpsborg Stadion", capacity: "8,022", titles: 0, cupTitles: 0 },
    { team: "Vålerenga",  fullName: "Vålerenga Fotball",       lat: 59.9175, lon: 10.8066, city: "Oslo",        stadium: "Intility Arena", capacity: "16,555", titles: 5, cupTitles: 4 },
    { team: "KFUM",       fullName: "KFUM-Kameratene Oslo",    lat: 59.8895, lon: 10.7818, city: "Oslo",        stadium: "KFUM Arena", capacity: "1,500", titles: 0, cupTitles: 0 },
    { team: "Lillestrøm", fullName: "Lillestrøm SK",           lat: 59.9555, lon: 11.0560, city: "Lillestrøm",  stadium: "Åråsen Stadion", capacity: "10,540", titles: 5, cupTitles: 6 },
    { team: "HamKam",     fullName: "Hamarkameratene",         lat: 60.7964, lon: 11.0924, city: "Hamar",       stadium: "Briskeby Arena", capacity: "7,800", titles: 0, cupTitles: 0 },
];

const ClubInfo = ({ onViewChange }) => {
    // Merge live mock data badges with location
    const matchedClubs = clubLocations.map(loc => {
        const teamData = leagueStandings.find(t => t.team === loc.team);
        return {
            ...loc,
            badgeUrl: teamData ? teamData.badgeUrl : ''
        };
    });

    return (
        <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
            <header className="section-header glass-panel" style={{ 
                marginBottom: '2rem', 
                textAlign: 'center', 
                padding: '1.5rem', 
                background: 'linear-gradient(90deg, rgba(186,12,47,0.1) 0%, rgba(186,12,47,0.3) 50%, rgba(186,12,47,0.1) 100%)',
                borderBottom: '2px solid #BA0C2F',
                borderTop: '1px solid rgba(255,255,255,0.05)',
                borderLeft: '1px solid rgba(255,255,255,0.05)',
                borderRight: '1px solid rgba(255,255,255,0.05)',
                borderRadius: '12px'
            }}>
                <h2 style={{ fontSize: '2.5rem', fontWeight: '900', margin: '0 0 0.5rem 0', textTransform: 'uppercase', letterSpacing: '2px', color: '#ffffff', textShadow: '0 2px 4px rgba(0,0,0,0.5)' }}>
                    Norsk Klubbinformasjon
                </h2>
                <p style={{ color: 'rgba(255,255,255,0.85)', fontSize: '1.1rem', margin: 0, fontStyle: 'italic', letterSpacing: '1px' }}>
                    Norwegian Clubs Information
                </p>
            </header>

            <div style={{ flex: 1, display: 'flex', gap: '1.5rem', minHeight: 0 }}>
                {/* Map Panel */}
                <div className="glass-panel" style={{ flex: '1 1 45%', position: 'relative', overflow: 'hidden', padding: 0 }}>
                    {/* Z-index 0 to not block header/sidebar; Custom leaflet tiles ensure premium dark aesthetics */}
                    <MapContainer 
                        center={[64.5, 11.5]} 
                        zoom={5} 
                        style={{ height: '100%', width: '100%', background: '#0a0a0a' }}
                        zoomControl={false}
                    >
                        <TileLayer
                            url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
                            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a> contributors'
                        />
                        
                        {matchedClubs.map((club, idx) => {
                            const CustomIcon = L.divIcon({
                                className: 'custom-icon',
                                html: `
                                    <div style="width: 36px; height: 36px; padding: 4px; background: rgba(25, 25, 30, 0.9); border: 1px solid var(--color-accent-gold); border-radius: 50%; box-shadow: 0 4px 10px rgba(0,0,0,0.5); display: flex; align-items: center; justify-content: center; transform: translate(-50%, -50%); transition: transform 0.2s;">
                                        <img src="${club.badgeUrl}" style="width: 24px; height: 24px; object-fit: contain;" />
                                    </div>
                                `
                            });

                            return (
                                <Marker 
                                    key={idx} 
                                    position={[club.lat, club.lon]} 
                                    icon={CustomIcon}
                                >
                                    <Popup className="premium-popup">
                                        <div style={{ textAlign: 'center', minWidth: '160px' }}>
                                            <img src={club.badgeUrl} alt="" style={{ height: '48px', marginBottom: '8px' }} />
                                            <h3 style={{ margin: '0 0 4px 0', fontSize: '1.2rem', color: '#111' }}>{club.fullName}</h3>
                                            <div style={{ fontSize: '0.85rem', color: '#444', marginBottom: '8px' }}>
                                                <strong>{club.city}</strong>
                                            </div>
                                            <div style={{ borderTop: '1px solid #ccc', paddingTop: '8px' }}>
                                                <div style={{ fontSize: '0.8rem', color: '#666' }}>Stadium</div>
                                                <strong style={{ color: '#111' }}>{club.stadium}</strong>
                                            </div>
                                            <div style={{ marginTop: '4px', marginBottom: '12px' }}>
                                                <div style={{ fontSize: '0.8rem', color: '#666' }}>Capacity</div>
                                                <strong style={{ color: '#111' }}>{club.capacity}</strong>
                                            </div>
                                            <button 
                                                onClick={() => {
                                                    localStorage.setItem('analyzeSingleTeam', club.team);
                                                    if (onViewChange) onViewChange('analysis');
                                                }}
                                                style={{
                                                    width: '100%',
                                                    padding: '8px',
                                                    background: 'var(--color-accent-gold)',
                                                    color: '#fff',
                                                    border: 'none',
                                                    borderRadius: '4px',
                                                    fontWeight: 'bold',
                                                    cursor: 'pointer'
                                                }}
                                            >
                                                Analyze Team
                                            </button>
                                        </div>
                                    </Popup>
                                </Marker>
                            );
                        })}
                    </MapContainer>
                </div>

                {/* Right Column for Lists */}
                <div className="glass-panel" style={{ flex: '1 1 55%', display: 'flex', flexDirection: 'column', padding: '2rem', overflow: 'hidden' }}>
                    
                    {/* Big Attractive Header */}
                    <div style={{ textAlign: 'center', marginBottom: '1.5rem', paddingBottom: '1.5rem', borderBottom: '1px solid rgba(255,255,255,0.1)', flexShrink: 0 }}>
                        <h3 style={{ fontSize: '2rem', fontWeight: '900', margin: '0 0 0.5rem 0', letterSpacing: '2px', textTransform: 'uppercase', color: 'var(--color-accent-gold)' }}>
                            Mestere
                        </h3>
                        <p style={{ margin: 0, fontSize: '0.9rem', color: 'var(--color-text-secondary)', fontStyle: 'italic', opacity: 0.8 }}>
                            Among current top-flight clubs
                        </p>
                    </div>

                    {/* Single Scrollable Container */}
                    <div style={{ overflowY: 'auto', paddingRight: '0.75rem', flex: 1, display: 'flex', flexDirection: 'row', gap: '2rem' }}>
                        
                        {/* Eliteserien Column */}
                        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '0.5rem' }}>
                                <h4 style={{ margin: 0, color: 'var(--color-text-primary)', textTransform: 'uppercase', letterSpacing: '1px', fontSize: '1rem', fontWeight: '700' }}>Eliteserien</h4>
                                <span style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)', opacity: 0.7 }}>All-Time</span>
                            </div>
                            
                            {matchedClubs
                                .filter(c => c.titles > 0)
                                .sort((a, b) => b.titles - a.titles)
                                .map((club, idx) => (
                                    <div key={`league-${idx}`} style={{ 
                                        display: 'flex', 
                                        alignItems: 'center', 
                                        justifyContent: 'space-between', 
                                        padding: '1rem', 
                                        background: 'rgba(255,255,255,0.03)', 
                                        borderRadius: '8px', 
                                        border: '1px solid rgba(255,255,255,0.05)',
                                        flexShrink: 0,
                                        transition: 'background 0.2s',
                                        cursor: 'pointer'
                                    }}
                                    onClick={() => {
                                        localStorage.setItem('analyzeSingleTeam', club.team);
                                        if (onViewChange) onViewChange('analysis');
                                    }}
                                    onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.06)'}
                                    onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.03)'}
                                    >
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                            <img src={club.badgeUrl} alt={club.team} style={{ width: '32px', height: '32px', objectFit: 'contain' }} />
                                            <span style={{ fontWeight: 'bold', fontSize: '1.1rem', color: 'var(--color-text-primary)' }}>{club.fullName}</span>
                                        </div>
                                        
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                            <span style={{ color: '#d97706', fontWeight: 'bold', fontSize: '1.5rem' }}>{club.titles}</span>
                                            <img 
                                                src="https://cdn.resfu.com/img_data/competiciones/copa/18.png?size=60x&lossy=1" 
                                                alt="League Trophy" 
                                                style={{ height: '36px', width: 'auto', filter: 'drop-shadow(0 4px 6px rgba(0,0,0,0.5))' }} 
                                            />
                                        </div>
                                    </div>
                                ))
                            }
                        </div>

                        {/* NM Cupen Column */}
                        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '0.5rem' }}>
                                <h4 style={{ margin: 0, color: 'var(--color-text-primary)', textTransform: 'uppercase', letterSpacing: '1px', fontSize: '1rem', fontWeight: '700' }}>NM Cupen</h4>
                                <span style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)', opacity: 0.7 }}>1963-Present</span>
                            </div>
                            
                            {matchedClubs
                                .filter(c => c.cupTitles > 0)
                                .sort((a, b) => b.cupTitles - a.cupTitles)
                                .map((club, idx) => (
                                    <div key={`cup-${idx}`} style={{ 
                                        display: 'flex', 
                                        alignItems: 'center', 
                                        justifyContent: 'space-between', 
                                        padding: '1rem', 
                                        background: 'rgba(255,255,255,0.03)', 
                                        borderRadius: '8px', 
                                        border: '1px solid rgba(255,255,255,0.05)',
                                        flexShrink: 0,
                                        transition: 'background 0.2s',
                                        cursor: 'pointer'
                                    }}
                                    onClick={() => {
                                        localStorage.setItem('analyzeSingleTeam', club.team);
                                        if (onViewChange) onViewChange('analysis');
                                    }}
                                    onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.06)'}
                                    onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.03)'}
                                    >
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                            <img src={club.badgeUrl} alt={club.team} style={{ width: '32px', height: '32px', objectFit: 'contain' }} />
                                            <span style={{ fontWeight: 'bold', fontSize: '1.1rem', color: 'var(--color-text-primary)' }}>{club.fullName}</span>
                                        </div>
                                        
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                            <span style={{ color: '#0ea5e9', fontWeight: 'bold', fontSize: '1.5rem' }}>{club.cupTitles}</span>
                                            <img 
                                                src="https://cdn.resfu.com/img_data/competiciones/copa/593.png?size=60x&lossy=1" 
                                                alt="Cup Trophy" 
                                                style={{ height: '36px', width: 'auto', filter: 'drop-shadow(0 4px 6px rgba(0,0,0,0.5))' }} 
                                            />
                                        </div>
                                    </div>
                                ))
                            }
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ClubInfo;
