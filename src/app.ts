
import express from 'express';
import cors from 'cors';
import authRoutes  from './routes/authroutes.js';
import courseRoutes from './routes/courseRoutes.js'
import lessonRoutes from './routes/lessonRoutes.js'
import errorHandler from './middlewares/error.middleware.js';
import { env} from './config/env.js';
import cookieParser from 'cookie-parser'
export const app = express();

app.use(cors(
    {
        origin: env.FRONTRND_URL,
        credentials: true,
    }
));

app.use(express.json());
app.use(cookieParser());
app.use('/api/auth', authRoutes);
app.use('/api/courses', courseRoutes)
app.use('/api/lessons', lessonRoutes)
app.get('/api/hello', (req, res) => {
    res.json({ message: 'Hello, World!' });
});

app.use(errorHandler)
