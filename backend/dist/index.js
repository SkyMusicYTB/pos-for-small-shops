"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const morgan_1 = __importDefault(require("morgan"));
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
const config_1 = require("./utils/config");
const database_1 = require("./services/database");
const auth_1 = require("./routes/auth");
const business_1 = require("./routes/business");
class Server {
    constructor() {
        this.app = (0, express_1.default)();
        this.db = database_1.DatabaseService.getInstance();
        this.initializeMiddleware();
        this.initializeRoutes();
        this.initializeErrorHandling();
    }
    initializeMiddleware() {
        // Security middleware
        this.app.use((0, helmet_1.default)());
        // CORS configuration
        this.app.use((0, cors_1.default)({
            origin: process.env.NODE_ENV === 'production'
                ? ['https://your-domain.com'] // Replace with actual domain
                : ['http://localhost:3000', 'http://localhost:5173'],
            credentials: true,
            methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
            allowedHeaders: ['Content-Type', 'Authorization']
        }));
        // Request parsing
        this.app.use(express_1.default.json({ limit: '10mb' }));
        this.app.use(express_1.default.urlencoded({ extended: true, limit: '10mb' }));
        // Logging
        this.app.use((0, morgan_1.default)('combined'));
        // Rate limiting
        const limiter = (0, express_rate_limit_1.default)({
            windowMs: config_1.config.RATE_LIMIT_WINDOW_MS,
            max: config_1.config.RATE_LIMIT_MAX_REQUESTS,
            message: {
                success: false,
                error: 'Too many requests from this IP, please try again later.'
            },
            standardHeaders: true,
            legacyHeaders: false
        });
        this.app.use('/api/', limiter);
    }
    initializeRoutes() {
        // Health check endpoint
        this.app.get('/health', async (req, res) => {
            try {
                let dbHealth;
                try {
                    dbHealth = await this.db.healthCheck();
                }
                catch (error) {
                    dbHealth = { status: 'disconnected', error: 'Database not available' };
                }
                res.status(200).json({
                    success: true,
                    data: {
                        status: 'healthy',
                        timestamp: new Date().toISOString(),
                        database: dbHealth,
                        environment: config_1.config.NODE_ENV,
                        version: '1.0.0'
                    }
                });
            }
            catch (error) {
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
        this.app.get('/api', (req, res) => {
            res.json({
                success: true,
                message: 'POS System API',
                version: '1.0.0',
                endpoints: {
                    auth: '/api/auth',
                    businesses: '/api/businesses',
                    health: '/health'
                }
            });
        });
        this.app.use('/api/auth', auth_1.authRoutes);
        this.app.use('/api/businesses', business_1.businessRoutes);
        // Catch-all route for undefined endpoints
        this.app.use('*', (req, res) => {
            res.status(404).json({
                success: false,
                error: 'Endpoint not found',
                message: `Route ${req.originalUrl} not found`
            });
        });
    }
    initializeErrorHandling() {
        // Global error handler
        this.app.use((error, req, res, next) => {
            console.error('Global error handler:', error);
            res.status(500).json({
                success: false,
                error: 'Internal server error',
                message: config_1.config.NODE_ENV === 'development' ? error.message : 'Something went wrong'
            });
        });
        // Handle uncaught exceptions
        process.on('uncaughtException', (error) => {
            console.error('Uncaught Exception:', error);
            process.exit(1);
        });
        // Handle unhandled promise rejections
        process.on('unhandledRejection', (reason, promise) => {
            console.error('Unhandled Rejection at:', promise, 'reason:', reason);
            process.exit(1);
        });
    }
    async connectDatabase() {
        try {
            const isConnected = await this.db.testConnection();
            if (!isConnected) {
                throw new Error('Database connection failed');
            }
            console.log('✅ Database connected successfully');
        }
        catch (error) {
            console.error('⚠️  Database connection failed:', error);
            console.log('⚠️  Server will start without database connection');
            console.log('⚠️  Please ensure Supabase is running and migrations are applied');
        }
    }
    async start() {
        try {
            // Validate configuration
            (0, config_1.validateConfig)();
            // Try to connect to database (but don't fail if it's not available)
            await this.connectDatabase();
            // Start the server
            const PORT = config_1.config.PORT;
            this.app.listen(PORT, () => {
                console.log(`🚀 Server running on port ${PORT}`);
                console.log(`📊 Environment: ${config_1.config.NODE_ENV}`);
                console.log(`🔗 Health check: http://localhost:${PORT}/health`);
                console.log(`🔐 API base URL: http://localhost:${PORT}/api`);
                if (config_1.config.NODE_ENV === 'development') {
                    console.log(`\n📝 Default Super Admin Account:`);
                    console.log(`   Email: ${config_1.config.SUPER_ADMIN_EMAIL}`);
                    console.log(`   Password: ${config_1.config.SUPER_ADMIN_PASSWORD}`);
                    console.log(`   ⚠️  Please change the password after first login\n`);
                }
                console.log(`\n📋 Next Steps:`);
                console.log(`   1. Start Supabase: supabase start`);
                console.log(`   2. Run migrations: See WINDOWS_SETUP.md`);
                console.log(`   3. Test frontend: cd ../frontend && npm run dev\n`);
            });
        }
        catch (error) {
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
//# sourceMappingURL=index.js.map