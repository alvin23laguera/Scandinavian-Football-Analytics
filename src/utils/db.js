const API_URL = '/api/matches';

// We no longer need initDB since we are not using IndexedDB
export const initDB = () => Promise.resolve(true);

export const saveMatch = async (matchData) => {
    try {
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(matchData)
        });
        if (!response.ok) throw new Error('Failed to save match to backend');
        return await response.json();
    } catch (error) {
        console.error("Error saving match:", error);
        throw error;
    }
};

export const getAllMatchesMeta = async () => {
    try {
        const response = await fetch(API_URL);
        if (!response.ok) throw new Error('Failed to fetch matches meta from backend');
        return await response.json();
    } catch (error) {
        console.error("Error fetching match metadata:", error);
        return [];
    }
};

export const getSeasonPPDA = async () => {
    try {
        const response = await fetch('/api/stats/ppda');
        if (!response.ok) throw new Error('Failed to fetch season PPDA from backend');
        return await response.json();
    } catch (error) {
        console.error("Error fetching season PPDA:", error);
        return [];
    }
};

export const getMatchEvents = async (id, retries = 3) => {
    for (let attempt = 0; attempt < retries; attempt++) {
        try {
            const response = await fetch(`${API_URL}/${id}`);
            if (response.ok) {
                return await response.json();
            }
            if (response.status === 404) return null;
            
            // If rate limited or server error, throw to trigger retry
            throw new Error(`Failed to fetch match events from backend (Status: ${response.status})`);
        } catch (error) {
            if (attempt === retries - 1) {
                console.error("Error fetching match events after retries:", error);
                return null;
            }
            // Wait before retrying (exponential backoff: 1s, 2s)
            await new Promise(resolve => setTimeout(resolve, 1000 * Math.pow(2, attempt)));
        }
    }
    return null;
};

export const deleteMatch = async (id) => {
    try {
        const response = await fetch(`${API_URL}/${id}`, {
            method: 'DELETE'
        });
        if (!response.ok) throw new Error('Failed to delete match from backend');
        return true;
    } catch (error) {
        console.error("Error deleting match:", error);
        throw error;
    }
};
