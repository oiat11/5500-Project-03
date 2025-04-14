import express from 'express';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
import cors from 'cors'; 
import authRoutes from './routes/auth.route.js';
import donorRoutes from './routes/donor.route.js';
import eventRoutes from './routes/event.route.js';
import tagRoutes from './routes/tag.route.js';
import userRoutes from './routes/user.route.js';

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
app.use('/api/event', eventRoutes);
app.use('/api/tag', tagRoutes);
app.use('/api/user', userRoutes);

app.use((err, req, res, next) => {
    console.error("❌ Server Error:", err);
  
    const statusCode = err.statusCode || 500;
    const message = err.message || "Something went wrong. Please try again later.";
  
    return res.status(statusCode).json({
      success: false,
      statusCode,
      message,
    });
  });
  