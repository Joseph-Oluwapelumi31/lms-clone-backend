
import express from 'express';
import cors from 'cors';
import authRoutes  from './routes/authroutes.js';
import { Request, Response } from 'express';
import errorHandler from './middlewares/error.middleware.js';
import { env} from './config/env.js';

export const app = express();

app.use(cors(
    {
        origin: env.FRONTRND_URL,
        credentials: true,
    }
));

app.use(express.json());

app.use('/api/auth', authRoutes);
app.get('/api/hello', (req, res) => {
    res.json({ message: 'Hello, World!' });
});

app.use(errorHandler)
