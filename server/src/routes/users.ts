import { Router } from 'express';
import { getDb } from '../db';
import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import { authenticate } from '../middleware/authMiddleware';

const router = Router();

// GET all users
router.get('/', authenticate, async (req: Request, res: Response) => {
    const db = await getDb();
    try {
        const users = await db.all('SELECT id, username FROM users');
        res.json(users);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Database error' });
    }
});

// CREATE user
router.post('/', authenticate, async (req: Request, res: Response) => {
    const { username, password } = req.body;

    if (!username || !password) {
        res.status(400).json({ error: 'Username and password are required' });
        return;
    }

    const db = await getDb();
    try {
        const existingUser = await db.get('SELECT * FROM users WHERE username = ?', [username]);
        if (existingUser) {
            res.status(400).json({ error: 'Username already exists' });
            return;
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const result = await db.run('INSERT INTO users (username, password) VALUES (?, ?)', [username, hashedPassword]);

        res.status(201).json({ id: result.lastID, username });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Database error' });
    }
});

// UPDATE user
router.put('/:id', authenticate, async (req: Request, res: Response) => {
    const { id } = req.params;
    const { username, password } = req.body;

    if (!username) {
        res.status(400).json({ error: 'Username is required' });
        return;
    }

    const db = await getDb();
    try {
        // Check if username unique (excluding self)
        const existingUser = await db.get('SELECT * FROM users WHERE username = ? AND id != ?', [username, id]);
        if (existingUser) {
            res.status(400).json({ error: 'Username already exists' });
            return;
        }

        if (password) {
            const hashedPassword = await bcrypt.hash(password, 10);
            await db.run('UPDATE users SET username = ?, password = ? WHERE id = ?', [username, hashedPassword, id]);
        } else {
            await db.run('UPDATE users SET username = ? WHERE id = ?', [username, id]);
        }

        res.json({ id: Number(id), username });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Database error' });
    }
});

// DELETE user
router.delete('/:id', authenticate, async (req: Request, res: Response) => {
    const { id } = req.params;
    const db = await getDb();

    try {
        await db.run('DELETE FROM users WHERE id = ?', [id]);
        res.json({ success: true });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Database error' });
    }
});

export default router;
