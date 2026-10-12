import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import morgan from 'morgan';
import { connectDB } from './config/db.js';

// 1. Load environment variables from .env file
dotenv.config();

// 2. Connect to MongoDB
connectDB();

// 3. Initialize Express application
const app = express();

// 4. Global Middlewares
// CORS allows requests from our React frontend (running on a different port)
app.use(cors());

// Parses incoming JSON request bodies (e.g. req.body in POST requests)
app.use(express.json());

// Parses URL-encoded data from HTML form submissions
app.use(express.urlencoded({ extended: true }));

// HTTP request logger for development (prints method, URL, status code, response time)
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// 5. Basic Routes
app.get('/', (req, res) => {
  res.json({
    message: 'Welcome to TripTales API 🌍✈️',
    version: '1.0.0',
    status: 'Server is running smoothly',
  });
});

app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
  });
});

// 6. 404 Route Handler (for undefined endpoints)
app.use((req, res, next) => {
  res.status(404).json({
    success: false,
    message: `Not Found - ${req.originalUrl}`,
  });
});

// 7. Global Error Handler
app.use((err, req, res, next) => {
  console.error('Server Error:', err.stack);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal Server Error',
  });
});

// 8. Start the HTTP Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 [TripTales Server]: Running on http://localhost:${PORT} in ${process.env.NODE_ENV} mode`);
});
