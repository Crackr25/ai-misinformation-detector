import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/auth';
import settingsRoutes from './routes/settings';
import scanRoutes from './routes/scans';
import publicRoutes from './routes/public';
import userRoutes from './routes/users';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/settings', settingsRoutes);
app.use('/api/scans', scanRoutes);
app.use('/api/public', publicRoutes);
app.use('/api/users', userRoutes);

app.get('/', (req, res) => {
    res.send('AI Misinformation Detector Backend is running');
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
