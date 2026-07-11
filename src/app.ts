
import express from 'express';
import cors from 'cors';
import authRoutes  from './routes/authroutes.js';
import courseRoutes from './routes/courseRoutes.js'
import lessonRoutes from './routes/lessonRoutes.js'
import uploadRoutes from './routes/uploadRoutes.js'
import errorHandler from './middlewares/error.middleware.js';
import { env} from './config/env.js';
import cookieParser from 'cookie-parser'
export const app = express();


const allowedOrigins = [
  "http://localhost:5173",
  env.FRONTEND_URL,
].filter(Boolean);

app.use(
  cors({
    origin: allowedOrigins,
    credentials: true,
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());


app.use('/api/auth', authRoutes);
app.use('/api/courses', courseRoutes)
app.use('/api/lessons', lessonRoutes)
app.use('/api/uploads', uploadRoutes);

app.get('/api/hello', (req, res) => {
    res.json({ message: 'Hello, World!' });
});

app.use(errorHandler)
