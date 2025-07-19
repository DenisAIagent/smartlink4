import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';

// Import routes
import scanRouter from './routes/scan.js';
import linksRouter from './routes/links.js';
import redirectRouter from './routes/redirect.js';

// Load environment variables
dotenv.config();

const app = express();

// Security middleware
app.use(helmet());

// CORS configuration for production and development
const corsOptions = {
  origin: [
    'http://localhost:3000',
    'http://localhost:5173',
    'https://smartlink4-frontend-staring.up.railway.app',
    /\.railway\.app$/
  ],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  credentials: true,
  optionsSuccessStatus: 200
};

app.use(cors(corsOptions));
app.use(express.json());

// MongoDB connection
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error('Error connecting to MongoDB:', error.message);
    process.exit(1);
  }
};

connectDB();

// Routes
app.use('/api', scanRouter);
app.use('/api', linksRouter);
app.use('/api', redirectRouter);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

const PORT = process.env.PORT || 4000;
const NODE_ENV = process.env.NODE_ENV || 'development';

// Detect Railway or other cloud platforms
const getApiUrl = () => {
  if (process.env.RAILWAY_STATIC_URL) {
    return `https://${process.env.RAILWAY_STATIC_URL}`;
  }
  if (process.env.RENDER_EXTERNAL_URL) {
    return process.env.RENDER_EXTERNAL_URL;
  }
  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`;
  }
  return `http://localhost:${PORT}`;
};

app.listen(PORT, () => {
  const apiUrl = getApiUrl();
  
  console.log(`🚀 Serveur démarré sur le port ${PORT}`);
  console.log(`📡 API disponible sur ${apiUrl}`);
  console.log(`🔗 Endpoints: ${apiUrl}/api/scan, ${apiUrl}/api/links, ${apiUrl}/api/redirect`);
  console.log(`❤️  Health check: ${apiUrl}/health`);
  console.log(`🌍 Environment: ${NODE_ENV}`);
});

export default app;