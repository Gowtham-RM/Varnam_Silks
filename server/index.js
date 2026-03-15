import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import productRoutes from './routes/products.js';
import authRoutes from './routes/auth.js';
import adminRoutes from './routes/admin.js';
import analyticsRouter from './routes/analytics.js';
import orderRoutes from './routes/orders.js';
import cartRoutes from './routes/cart.js';
import chatRoutes from './routes/chat.js';
import paymentRoutes from './routes/payment.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load .env from parent directory
dotenv.config({ path: join(__dirname, '..', '.env') });

const app = express();

const requiredEnvVars = ['MONGODB_URI', 'JWT_SECRET'];

const validateRequiredEnv = () => {
  const missingVars = requiredEnvVars.filter((name) => !process.env[name]);
  if (missingVars.length > 0) {
    console.error(`❌ Missing required environment variables: ${missingVars.join(', ')}`);
    console.error('Set these values in Render -> Environment before deploying.');
    process.exit(1);
  }
};

// Middleware
const allowedOrigins = [
  process.env.FRONTEND_URL,
  'https://varnam-silks.vercel.app',
  'http://localhost:5173',
].filter(Boolean);

app.use(cors({
  origin: (origin, callback) => {
    // Allow server-to-server tools and same-origin calls without browser origin header.
    if (!origin) {
      callback(null, true);
      return;
    }

    if (allowedOrigins.includes(origin)) {
      callback(null, true);
      return;
    }

    callback(new Error(`CORS blocked for origin: ${origin}`));
  },
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'x-user-id'],
}));
app.use(express.json());

// MongoDB Connection
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ MongoDB connected successfully');
  } catch (error) {
    console.error('❌ MongoDB connection error:', error.message);
    console.error('Check your MONGODB_URI and ensure MongoDB Atlas Network Access allows Render.');
    process.exit(1);
  }
};

// Connect to database
validateRequiredEnv();
connectDB();

// Health check route
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Server is running' });
});

// API Routes
app.use('/api/products', productRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/admin', analyticsRouter);
app.use('/api/cart', cartRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/payment', paymentRoutes);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
