import { Router } from 'express';
import { getDb } from '../db';
import { Request, Response } from 'express';

const router = Router();

// POST public scan & analyze
router.post('/analyze', async (req: Request, res: Response) => {
    const { text, image, model } = req.body;
    const db = await getDb();

    try {
        // 1. Get API Key from any configured user (Fallback strategy)
        // We look for the first user who has set up an API key.
        const settings = await db.get('SELECT api_key, model FROM settings WHERE api_key IS NOT NULL AND api_key != "" LIMIT 1');

        if (!settings || !settings.api_key) {
            res.status(503).json({ error: 'Service not configured. Admin must set API Key.' });
            return;
        }

        const apiKey = settings.api_key;
        const useModel = model || settings.model || 'openai/gpt-3.5-turbo';

        // 2. Call OpenRouter
        const messages: any[] = [
            {
                role: 'system',
                content: `You are an expert AI Misinformation Detection System. Analyze the provided content (text and/or image) for signs of AI generation and misinformation. 
        Respond ONLY with a valid JSON object in the following format:
        {
          "isAIGenerated": boolean,
          "confidenceScore": number (0-100),
          "riskLevel": "high" | "medium" | "low",
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

        if (image) {
            messages[1].content.push({
                type: 'image_url',
                image_url: { url: image }
            });
        }

        const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${apiKey}`,
                'Content-Type': 'application/json',
                'HTTP-Referer': 'http://localhost:5173', // Adjust for prod
                'X-Title': 'AI Misinformation Detector'
            },
            body: JSON.stringify({
                model: useModel,
                messages: messages,
                response_format: { type: 'json_object' }
            })
        });

        if (!response.ok) {
            const errorData = await response.json();
            res.status(502).json({ error: 'AI Service Error', details: errorData });
            return;
        }

        const data: any = await response.json();
        const content = data.choices[0].message.content;
        let result;
        try {
            result = JSON.parse(content);
        } catch (e) {
            res.status(500).json({ error: 'Failed to parse AI response' });
            return;
        }

        // 3. Save to DB (Anonymous)
        const scanId = crypto.randomUUID();
        const timestamp = new Date().toISOString();

        await db.run(
            `INSERT INTO scans (id, user_id, timestamp, content, image_url, is_ai_generated, confidence_score, risk_level, indicators, fact_check_suggestion, verdict)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                scanId,
                null, // Anonymous
                timestamp,
                text ? text.substring(0, 500) : "Image Only",
                image || null,
                result.isAIGenerated ? 1 : 0,
                result.confidenceScore,
                result.riskLevel,
                JSON.stringify(result.indicators),
                result.factCheckSuggestion,
                result.verdict
            ]
        );

        res.json({
            id: scanId,
            timestamp,
            ...result
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

export default router;
