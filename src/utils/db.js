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

export const getMatchEvents = async (id) => {
    try {
        const response = await fetch(`${API_URL}/${id}`);
        if (!response.ok) {
            if (response.status === 404) return null;
            throw new Error('Failed to fetch match events from backend');
        }
        return await response.json();
    } catch (error) {
        console.error("Error fetching match events:", error);
        return null;
    }
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
