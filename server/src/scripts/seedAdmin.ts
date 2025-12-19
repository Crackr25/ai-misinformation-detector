
import { getDb } from '../db';
import bcrypt from 'bcryptjs';

async function seed() {
    try {
        const db = await getDb();
        const username = 'admin';
        const password = 'password';
        const hashedPassword = await bcrypt.hash(password, 10);

        try {
            await db.run('INSERT INTO users (username, password) VALUES (?, ?)', [username, hashedPassword]);
            console.log('Admin user created successfully.');
        } catch (error: any) {
            if (error.message && error.message.includes('UNIQUE constraint failed')) {
                console.log('Admin user already exists. Updating password...');
                await db.run('UPDATE users SET password = ? WHERE username = ?', [hashedPassword, username]);
                console.log('Admin password updated.');
            } else {
                throw error;
            }
        }
    } catch (err) {
        console.error('Failed to seed admin:', err);
        process.exit(1);
    }
}

seed();
