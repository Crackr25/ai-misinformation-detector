import { Router } from 'express';
import { getDb } from '../db';
import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';

const router = Router();
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

// Middleware to authenticate token (we should move this to a middleware file later)
const authenticate = (req: Request, res: Response, next: any) => {
    const authHeader = req.headers.authorization;
    if (!authHeader) return res.status(401).json({ error: 'No token provided' });

    const token = authHeader.split(' ')[1];
    try {
        const decoded = jwt.verify(token, JWT_SECRET) as any;
        (req as any).user = decoded;
        next();
    } catch (err) {
        return res.status(401).json({ error: 'Invalid token' });
    }
};

// GET settings
router.get('/', authenticate, async (req: Request, res: Response) => {
    const userId = (req as any).user.id;
    const db = await getDb();

    try {
        const settings = await db.get('SELECT api_key, model FROM settings WHERE user_id = ?', [userId]);
        res.json(settings || { apiKey: '', model: '' });
    } catch (error) {
        res.status(500).json({ error: 'Database error' });
    }
});

// POST update settings
router.post('/', authenticate, async (req: Request, res: Response) => {
    const userId = (req as any).user.id;
    const { apiKey, model } = req.body;
    const db = await getDb();

    try {
        await db.run(
            `INSERT INTO settings (user_id, api_key, model) 
             VALUES (?, ?, ?) 
             ON CONFLICT(user_id) DO UPDATE SET api_key = ?, model = ?`,
            [userId, apiKey, model, apiKey, model]
        );
        res.json({ success: true });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Database error' });
    }
});

export default router;
