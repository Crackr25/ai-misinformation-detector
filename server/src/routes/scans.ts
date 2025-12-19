import { Router } from 'express';
import { getDb } from '../db';
import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';

const router = Router();
import { authenticate } from '../middleware/authMiddleware';

// GET history
router.get('/', authenticate, async (req: Request, res: Response) => {
    const userId = (req as any).user.id;
    const db = await getDb();

    try {
        const rows = await db.all('SELECT * FROM scans WHERE user_id = ? ORDER BY timestamp DESC', [userId]);
        // Map back to frontend model (camelCase)
        const history = rows.map(row => ({
            id: row.id,
            timestamp: row.timestamp,
            content: row.content,
            imageUrl: row.image_url,
            isAIGenerated: !!row.is_ai_generated,
            confidenceScore: row.confidence_score,
            riskLevel: row.risk_level,
            indicators: JSON.parse(row.indicators || '[]'),
            factCheckSuggestion: row.fact_check_suggestion,
            verdict: row.verdict
        }));
        res.json(history);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Database error' });
    }
});

// POST save result
router.post('/', authenticate, async (req: Request, res: Response) => {
    const userId = (req as any).user.id;
    const result = req.body;
    const db = await getDb();

    try {
        await db.run(
            `INSERT INTO scans (id, user_id, timestamp, content, image_url, is_ai_generated, confidence_score, risk_level, indicators, fact_check_suggestion, verdict)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                result.id,
                userId,
                result.timestamp,
                result.content,
                result.imageUrl,
                result.isAIGenerated ? 1 : 0,
                result.confidenceScore,
                result.riskLevel,
                JSON.stringify(result.indicators),
                result.factCheckSuggestion,
                result.verdict
            ]
        );
        res.json({ success: true });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Database error' });
    }
});

// GET stats
router.get('/stats', authenticate, async (req: Request, res: Response) => {
    const userId = (req as any).user.id;
    const db = await getDb();

    try {
        const rows = await db.all('SELECT is_ai_generated, confidence_score FROM scans WHERE user_id = ?', [userId]);

        const totalScanned = rows.length;
        const flagged = rows.filter(r => r.is_ai_generated).length;
        const verified = totalScanned - flagged;

        let accuracy = 0;
        if (totalScanned > 0) {
            const totalConfidence = rows.reduce((acc, curr) => acc + curr.confidence_score, 0);
            accuracy = totalConfidence / totalScanned;
        }

        res.json({
            totalScanned,
            flagged,
            verified,
            accuracy
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Database error' });
    }
});

export default router;
