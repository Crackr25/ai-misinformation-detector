import { DEFAULT_MODEL, type AnalysisResult, type SystemStats, type UserSettings } from '../types';

const API_URL = 'http://localhost:3000/api';

const getHeaders = () => {
    const token = localStorage.getItem('token');
    return {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
    };
};

export const StorageService = {
    getHistory: async (): Promise<AnalysisResult[]> => {
        try {
            const response = await fetch(`${API_URL}/scans`, { headers: getHeaders() });
            if (response.ok) return await response.json();
            return [];
        } catch (error) {
            console.error('Error fetching history:', error);
            return [];
        }
    },

    saveResult: async (result: AnalysisResult) => {
        try {
            await fetch(`${API_URL}/scans`, {
                method: 'POST',
                headers: getHeaders(),
                body: JSON.stringify(result)
            });
        } catch (error) {
            console.error('Error saving result:', error);
        }
    },

    getStats: async (): Promise<SystemStats> => {
        try {
            const response = await fetch(`${API_URL}/scans/stats`, { headers: getHeaders() });
            if (response.ok) return await response.json();
            return { totalScanned: 0, flagged: 0, verified: 0, accuracy: 0 };
        } catch (error) {
            console.error('Error fetching stats:', error);
            return { totalScanned: 0, flagged: 0, verified: 0, accuracy: 0 };
        }
    },

    getSettings: async (): Promise<UserSettings> => {
        try {
            const response = await fetch(`${API_URL}/settings`, { headers: getHeaders() });
            if (response.ok) return await response.json();
            return { apiKey: '', model: DEFAULT_MODEL };
        } catch (error) {
            console.error('Error fetching settings:', error);
            return { apiKey: '', model: DEFAULT_MODEL };
        }
    },

    saveSettings: async (settings: UserSettings) => {
        try {
            await fetch(`${API_URL}/settings`, {
                method: 'POST',
                headers: getHeaders(),
                body: JSON.stringify(settings)
            });
        } catch (error) {
            console.error('Error saving settings:', error);
        }
    },

    clearAll: async () => {
        // We haven't implemented a clear all endpoint yet, 
        // but typically this would verify with the server.
        // For now, let's just log.
        console.warn('Clear All not fully implemented on backend yet.');
    }
};
