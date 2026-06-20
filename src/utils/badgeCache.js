import { leagueStandings } from '../data/mockData';

export const globalBadgeCache = {};
let isFetching = false;
let fetchPromise = null;

export const loadAllBadges = async () => {
    if (Object.keys(globalBadgeCache).length > 0) return globalBadgeCache;
    if (isFetching && fetchPromise) return fetchPromise;

    isFetching = true;
    fetchPromise = new Promise(async (resolve) => {
        const cache = {};
        
        const fetchAsBase64 = async (url) => {
            try {
                const response = await fetch(url);
                if (!response.ok) return null;
                const blob = await response.blob();
                return new Promise((res) => {
                    const reader = new FileReader();
                    reader.onloadend = () => res(reader.result);
                    reader.onerror = () => res(null);
                    reader.readAsDataURL(blob);
                });
            } catch (e) {
                return null;
            }
        };

        // Fetch all teams
        for (const team of leagueStandings) {
            if (team.badgeUrl) {
                const proxiedUrl = team.badgeUrl.replace('https://r2.thesportsdb.com', '/sportsdb-images');
                const base64 = await fetchAsBase64(proxiedUrl);
                if (base64) {
                    cache[team.id || team.team] = base64;
                    // Also store normalized versions to be safe
                    cache[team.team.toLowerCase()] = base64;
                }
            }
        }

        // Fetch Eliteserien logo
        const eliteBase64 = await fetchAsBase64('/fotmob-images/image_resources/logo/leaguelogo/59.png');
        if (eliteBase64) cache['Eliteserien'] = eliteBase64;
        
        // Fetch default Opponent logo
        const opponentBase64 = await fetchAsBase64('https://i0.wp.com/futbird.com/wp-content/uploads/2023/03/image_2023-03-18_065124516.png?fit=1200%2C720&ssl=1');
        if (opponentBase64) cache['Opponent'] = opponentBase64;

        Object.assign(globalBadgeCache, cache);
        isFetching = false;
        resolve(globalBadgeCache);
    });

    return fetchPromise;
};

export const getCachedBadge = (teamName) => {
    if (!teamName) return null;
    if (teamName === 'Eliteserien') return globalBadgeCache['Eliteserien'] || '/fotmob-images/image_resources/logo/leaguelogo/59.png';
    if (teamName === 'Opponent' || teamName === 'Opponents') return globalBadgeCache['Opponent'] || 'https://i0.wp.com/futbird.com/wp-content/uploads/2023/03/image_2023-03-18_065124516.png?fit=1200%2C720&ssl=1';
    
    const teamAliases = {
        'Hamarkameratene': 'HamKam',
        'Aalesunds FK': 'Aalesund',
        'FK Bodø/Glimt': 'Bodø/Glimt',
        'Rosenborg BK': 'Rosenborg',
        'Lillestrøm SK': 'Lillestrøm',
        'Vålerenga IF': 'Vålerenga',
        'Sandefjord Fotball': 'Sandefjord',
        'Viking FK': 'Viking',
        'Kristiansund BK': 'Kristiansund',
        'Molde FK': 'Molde',
        'IK Start': 'Start',
        'Fredrikstad FK': 'Fredrikstad',
        'KFUM Oslo': 'KFUM',
        'Sarpsborg 08 FF': 'Sarpsborg 08',
        'Strømsgodset IF': 'Strømsgodset',
        'Odds BK': 'Odd',
        'FK Haugesund': 'Haugesund',
        'Tromsø IL': 'Tromsø',
        'SK Brann': 'Brann'
    };
    
    const searchName = teamAliases[teamName] || teamName;

    // Exact or lowercase match
    if (globalBadgeCache[searchName]) return globalBadgeCache[searchName];
    if (globalBadgeCache[searchName.toLowerCase()]) return globalBadgeCache[searchName.toLowerCase()];
    
    // Partial match (e.g. Bodø/Glimt)
    const normalized = searchName.toLowerCase().replace(/[^a-z0-9]/g, '');
    for (const key of Object.keys(globalBadgeCache)) {
        const normKey = key.toLowerCase().replace(/[^a-z0-9]/g, '');
        if (normKey === normalized || normKey.includes(normalized) || normalized.includes(normKey)) {
            return globalBadgeCache[key];
        }
    }

    // Fallback to searching mockData and returning proxy url directly
    const team = leagueStandings.find(t => 
        t.team.toLowerCase() === searchName.toLowerCase() || 
        t.team.toLowerCase().includes(searchName.toLowerCase()) ||
        searchName.toLowerCase().includes(t.team.toLowerCase())
    );
    if (team && team.badgeUrl) {
        return team.badgeUrl.replace('https://r2.thesportsdb.com', '/sportsdb-images');
    }
    
    return null;
};
