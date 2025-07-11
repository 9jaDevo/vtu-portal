import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { createServer } from 'http';
import { initDatabase } from './database/init.js';
import { errorHandler } from './middleware/errorHandler.js';
import { logger } from './utils/logger.js';

// Import routes using named imports
import { authRoutes } from './routes/auth.js';
import { adminRoutes } from './routes/admin.js';
import { walletRoutes } from './routes/wallet.js';
import { transactionRoutes } from './routes/transactions.js';
import { apiRoutes } from './routes/api.js';
import { webhookRoutes } from './routes/webhook.js';
// Import service-specific routes
import { airtimeRoutes } from './routes/airtime.js';
import { dataRoutes } from './routes/data.js';
import { tvRoutes } from './routes/tv.js';
import { electricityRoutes } from './routes/electricity.js';
import { educationRoutes } from './routes/education.js';
import { insuranceRoutes } from './routes/insurance.js';

const app = express();
const server = createServer(app);

// Middleware
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/wallet', walletRoutes);
app.use('/api/transactions', transactionRoutes);
app.use('/api', apiRoutes);
app.use('/api/webhook', webhookRoutes);
// Add service-specific routes
app.use('/api/airtime', airtimeRoutes);
app.use('/api/data', dataRoutes);
app.use('/api/tv', tvRoutes);
app.use('/api/electricity', electricityRoutes);
app.use('/api/education', educationRoutes);
app.use('/api/insurance', insuranceRoutes);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Error handling
app.use(errorHandler);

const PORT = process.env.PORT || 3001;

async function startServer() {
  try {
    // Initialize database
    try {
      await initDatabase();
      logger.info('Database initialization completed');
    } catch (error) {
      logger.warn('Database initialization failed, server starting without database');
      logger.warn('Error:', error instanceof Error ? error.message : error);
    }

    // Start server
    server.listen(PORT, () => {
      logger.info(`Server running on port ${PORT}`);
      logger.info(`Environment: ${process.env.NODE_ENV || 'development'}`);
      logger.info(`Health check: http://localhost:${PORT}/health`);
      
      // Show configuration status
      const supabaseConfigured = process.env.NEXT_PUBLIC_SUPABASE_URL && 
        process.env.SUPABASE_SERVICE_ROLE_KEY &&
        process.env.NEXT_PUBLIC_SUPABASE_URL !== 'your_supabase_project_url_here';
      
      logger.info(`Database status: ${supabaseConfigured ? 'Connected' : 'Not configured'}`);
      
      if (!supabaseConfigured) {
        logger.info('Configure Supabase to enable user authentication and data storage');
      }
    });
  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
}

startServer();