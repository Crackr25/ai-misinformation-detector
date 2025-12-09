import type { AnalysisResult } from '../types';

interface OpenRouterResponse {
    choices: {
        message: {
            content: string;
        };
    }[];
}

export const OpenRouterService = {
    analyzeContent: async (
        text: string,
        imageBase64: string | null,
        apiKey: string,
        model: string
    ): Promise<AnalysisResult> => {
        if (!apiKey) {
            throw new Error("API Key is missing. Please configure it in Settings.");
        }

        const messages: any[] = [
            {
                role: 'system',
                content: `You are an expert AI Misinformation Detection System. Analyze the provided content (text and/or image) for signs of AI generation and misinformation. 
        Respond ONLY with a valid JSON object in the following format:
        {
          "isAIGenerated": boolean,
          "confidenceScore": number (0-100),
          "riskLevel": "low" | "medium" | "high",
          "indicators": ["indicator 1", "indicator 2"],
          "factCheckSuggestion": "suggestion string",
          "verdict": "Short verdict string"
        }`
            },
            {
                role: 'user',
                content: [
                    { type: 'text', text: text || "Analyze this image." },
                ]
            }
        ];

        if (imageBase64) {
            messages[1].content.push({
                type: 'image_url',
                image_url: { url: imageBase64 }
            });
        }

        try {
            const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${apiKey}`,
                    'Content-Type': 'application/json',
                    'HTTP-Referer': 'http://localhost:5173', // Required by OpenRouter
                    'X-Title': 'AI Misinformation Detector' // Optional
                },
                body: JSON.stringify({
                    model: model,
                    messages: messages,
                    response_format: { type: 'json_object' } // Force JSON if supported, otherwise system prompt handles it
                })
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error?.message || 'API request failed');
            }

            const data: OpenRouterResponse = await response.json();
            const content = data.choices[0].message.content;

            try {
                const result = JSON.parse(content);
                return {
                    id: crypto.randomUUID(),
                    timestamp: new Date().toISOString(),
                    content: text ? text.substring(0, 100) + (text.length > 100 ? '...' : '') : "Image Analysis",
                    imageUrl: imageBase64 || undefined,
                    ...result
                };
            } catch (parseError) {
                console.error("Failed to parse API response:", content);
                throw new Error("Invalid response format from AI model.");
            }

        } catch (error: any) {
            console.error("Analysis failed:", error);
            throw error;
        }
    }
};
