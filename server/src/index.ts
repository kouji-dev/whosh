import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import passport from 'passport';
import { rateLimit } from 'express-rate-limit';
import config from './config';
import authRoutes from './domains/auth/auth.routes';
import './config/passport';
import platformRoutes from './domains/platform/platform.routes';
import postRoutes from './domains/post/post.routes';
import channelRoutes from './domains/channel/channel.routes';
import { jsonBeautify } from './lib/middleware/json-beautify.middleware';
import { errorHandler } from './lib/middleware/error.middleware';
import { logger } from './infra/logger/pino-logger';

// Initialize Express app
const app = express();

// Middleware
app.use(helmet());
app.use(cors({
  origin: config.server.corsOrigin,
  credentials: true,
}));
app.use(morgan('dev'));
app.use(express.json());
app.use(jsonBeautify);
app.use(errorHandler);
app.use(passport.initialize());

// Rate limiting
app.use(rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
}));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/platforms', platformRoutes);
app.use('/api/posts', postRoutes);
app.use('/api/channels', channelRoutes);

// Start server
const PORT = config.port;

// Initialize services and start server
async function startServer() {
  try {
    // Start HTTP server
    app.listen(PORT, () => {
      logger.info(`Server running in ${config.server.nodeEnv} mode on port ${PORT}`);
    });
  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
}

startServer();

// Handle graceful shutdown
process.on('SIGTERM', async () => {
  logger.info('SIGTERM received. Closing HTTP server and database connections...');
  process.exit(0);
}); 