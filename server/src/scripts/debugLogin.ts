
import { getDb } from '../db';
import bcrypt from 'bcryptjs';

async function verify() {
    try {
        const db = await getDb();
        const user = await db.get('SELECT * FROM users WHERE username = ?', ['admin']);

        if (!user) {
            console.error('User admin NOT found!');
        } else {
            console.log('User admin found.');
            console.log('Stored hash:', user.password);

            const isMatch = await bcrypt.compare('password', user.password);
            console.log('Password match:', isMatch);
        }
    } catch (err) {
        console.error('Verification failed:', err);
    }
}

verify();
