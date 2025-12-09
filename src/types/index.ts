export interface AnalysisResult {
    id: string;
    timestamp: string;
    content: string; // Text content or "Image Analysis"
    imageUrl?: string;
    isAIGenerated: boolean;
    confidenceScore: number;
    riskLevel: 'low' | 'medium' | 'high';
    indicators: string[];
    factCheckSuggestion: string;
    verdict: string;
}

export interface SystemStats {
    totalScanned: number;
    flagged: number;
    verified: number;
    accuracy: number; // Running average or calculated
}

export interface UserSettings {
    apiKey: string;
    model: string;
}

export const DEFAULT_MODEL = "anthropic/claude-3.5-sonnet";

declare global {
    interface Window {
        storage: Storage;
    }
}
