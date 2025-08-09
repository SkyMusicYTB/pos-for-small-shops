import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import { config, validateConfig } from './utils/config';
import { DatabaseService } from './services/database';
import { authRoutes } from './routes/auth';

class Server {
  private app: express.Application;
  private db: DatabaseService;

  constructor() {
    this.app = express();
    this.db = DatabaseService.getInstance();
    this.initializeMiddleware();
    this.initializeRoutes();
    this.initializeErrorHandling();
  }

  private initializeMiddleware(): void {
    // Security middleware
    this.app.use(helmet());
    
    // CORS configuration
    this.app.use(cors({
      origin: process.env.NODE_ENV === 'production' 
        ? ['https://your-domain.com'] // Replace with actual domain
        : ['http://localhost:3000', 'http://localhost:5173'],
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization']
    }));

    // Request parsing
    this.app.use(express.json({ limit: '10mb' }));
    this.app.use(express.urlencoded({ extended: true, limit: '10mb' }));

    // Logging
    this.app.use(morgan('combined'));

    // Rate limiting
    const limiter = rateLimit({
      windowMs: config.RATE_LIMIT_WINDOW_MS,
      max: config.RATE_LIMIT_MAX_REQUESTS,
      message: {
        success: false,
        error: 'Too many requests from this IP, please try again later.'
      },
      standardHeaders: true,
      legacyHeaders: false
    });
    this.app.use('/api/', limiter);
  }

  private initializeRoutes(): void {
    // Health check endpoint
    this.app.get('/health', async (req, res) => {
      try {
        const dbHealth = await this.db.healthCheck();
        res.status(200).json({
          success: true,
          data: {
            status: 'healthy',
            timestamp: new Date().toISOString(),
            database: dbHealth,
            environment: config.NODE_ENV,
            version: '1.0.0'
          }
        });
      } catch (error) {
        res.status(503).json({
          success: false,
          error: 'Service unavailable',
          data: {
            status: 'unhealthy',
            timestamp: new Date().toISOString()
          }
        });
      }
    });

    // API routes
    this.app.use('/api/auth', authRoutes);

    // Catch-all route for undefined endpoints
    this.app.use('*', (req, res) => {
      res.status(404).json({
        success: false,
        error: 'Endpoint not found',
        message: `Route ${req.originalUrl} not found`
      });
    });
  }

  private initializeErrorHandling(): void {
    // Global error handler
    this.app.use((error: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
      console.error('Global error handler:', error);

      res.status(500).json({
        success: false,
        error: 'Internal server error',
        message: config.NODE_ENV === 'development' ? error.message : 'Something went wrong'
      });
    });

    // Handle uncaught exceptions
    process.on('uncaughtException', (error: Error) => {
      console.error('Uncaught Exception:', error);
      process.exit(1);
    });

    // Handle unhandled promise rejections
    process.on('unhandledRejection', (reason: any, promise: Promise<any>) => {
      console.error('Unhandled Rejection at:', promise, 'reason:', reason);
      process.exit(1);
    });
  }

  private async connectDatabase(): Promise<void> {
    try {
      const isConnected = await this.db.testConnection();
      if (!isConnected) {
        throw new Error('Database connection failed');
      }
      console.log('✅ Database connected successfully');
    } catch (error) {
      console.error('❌ Database connection failed:', error);
      process.exit(1);
    }
  }

  public async start(): Promise<void> {
    try {
      // Validate configuration
      validateConfig();

      // Connect to database
      await this.connectDatabase();

      // Start the server
      const PORT = config.PORT;
      this.app.listen(PORT, () => {
        console.log(`🚀 Server running on port ${PORT}`);
        console.log(`📊 Environment: ${config.NODE_ENV}`);
        console.log(`🔗 Health check: http://localhost:${PORT}/health`);
        console.log(`🔐 API base URL: http://localhost:${PORT}/api`);
        
        if (config.NODE_ENV === 'development') {
          console.log(`\n📝 Default Super Admin Account:`);
          console.log(`   Email: ${config.SUPER_ADMIN_EMAIL}`);
          console.log(`   Password: ${config.SUPER_ADMIN_PASSWORD}`);
          console.log(`   ⚠️  Please change the password after first login\n`);
        }
      });
    } catch (error) {
      console.error('❌ Failed to start server:', error);
      process.exit(1);
    }
  }
}

// Start the server
const server = new Server();
server.start().catch((error) => {
  console.error('Failed to start application:', error);
  process.exit(1);
});