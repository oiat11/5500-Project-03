import express from 'express';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
import cors from 'cors'; 
import authRoutes from './routes/auth.route.js';
import donorRoutes from './routes/donor.route.js';

dotenv.config();

const app = express();

app.use(express.json());
app.use(cookieParser());


app.use(cors({
    origin: "http://localhost:5173", 
    methods: "GET, POST, PUT, DELETE, OPTIONS",
    credentials: true,  
}));

const PORT = process.env.PORT;

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});


app.use('/api/auth', authRoutes);
app.use('/api/donor', donorRoutes);


app.use((err, req, res, next) => {
    const statusCode = err.statusCode || 500;
    const message = err.message || 'Internal Server Error';
    return res.status(statusCode).json({
        success: false,
        statusCode,
        message,
    });
});
