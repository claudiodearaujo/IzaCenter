// apps/backend/src/server.ts

import app from './app';
import { env, connectDatabase, disconnectDatabase } from './config';

// =============================================
// START SERVER
// =============================================

async function bootstrap() {
  try {
    // Connect to database
    await connectDatabase();

    // Start HTTP server
    const server = app.listen(env.PORT, () => {
      console.log('');
      console.log('✨ ============================================ ✨');
      console.log('   🔮 IZABELA TAROT API SERVER');
      console.log('✨ ============================================ ✨');
      console.log('');
      console.log(`   🌍 Environment: ${env.NODE_ENV}`);
      console.log(`   🚀 Server running on: http://localhost:${env.PORT}`);
      console.log(`   📡 API endpoint: http://localhost:${env.PORT}${env.API_PREFIX}`);
      console.log(`   💚 Health check: http://localhost:${env.PORT}/health`);
      console.log('');
      console.log('✨ ============================================ ✨');
      console.log('');
    });

    // =============================================
    // GRACEFUL SHUTDOWN
    // =============================================

    const gracefulShutdown = async (signal: string) => {
      console.log(`\n📤 ${signal} received. Shutting down gracefully...`);

      server.close(async () => {
        console.log('🔌 HTTP server closed');

        try {
          await disconnectDatabase();
          console.log('✅ Graceful shutdown completed');
          process.exit(0);
        } catch (error) {
          console.error('❌ Error during shutdown:', error);
          process.exit(1);
        }
      });

      // Force shutdown after 30 seconds
      setTimeout(() => {
        console.error('⚠️ Forced shutdown after timeout');
        process.exit(1);
      }, 30000);
    };

    // Handle shutdown signals
    process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
    process.on('SIGINT', () => gracefulShutdown('SIGINT'));

    // Handle uncaught exceptions
    process.on('uncaughtException', (error) => {
      console.error('❌ Uncaught Exception:', error);
      process.exit(1);
    });

    process.on('unhandledRejection', (reason, promise) => {
      console.error('❌ Unhandled Rejection at:', promise, 'reason:', reason);
    });

  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
}

// Start the server
bootstrap();
