import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import passport from 'passport';
import { rateLimit } from 'express-rate-limit';
import config from './config';
import authRoutes from './routes/auth.routes';
import { PrismaClient } from '@prisma/client';
import { createClient } from 'redis';
import './config/passport';
import platformRoutes from './routes/platform.routes';
import { jsonBeautify } from './middleware/json-beautify.middleware';

// Initialize Express app
const app = express();

// Initialize Prisma client
const prisma = new PrismaClient();

// Initialize Redis client
const redis = createClient({
  url: config.redis.url,
});

// Connect to Redis
redis.connect().catch(console.error);

// Middleware
app.use(helmet());
app.use(cors({
  origin: config.server.corsOrigin,
  credentials: true,
}));
app.use(express.json());
app.use(morgan('dev'));
app.use(jsonBeautify);

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
});
app.use(limiter);

// Initialize Passport
app.use(passport.initialize());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/platforms', platformRoutes);

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

// Error handling middleware
app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error(err);
  res.status(500).json({ error: 'Something went wrong!' });
});

// Start server
const PORT = config.server.port;
app.listen(PORT, () => {
  console.log(`Server running in ${config.server.nodeEnv} mode on port ${PORT}`);
});

// Handle graceful shutdown
process.on('SIGTERM', async () => {
  console.log('SIGTERM received. Closing HTTP server and database connections...');
  await prisma.$disconnect();
  await redis.quit();
  process.exit(0);
}); 