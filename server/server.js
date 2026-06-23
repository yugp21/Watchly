require('dotenv').config();
const { validateEnv } = require('./config/env');

validateEnv();

const app = require('./app');
const connectDB = require('./config/db');
const { startMonitorJob } = require('./jobs/monitorJob');

const PORT = process.env.PORT || 5000;

let server;

const start = async () => {
  await connectDB();
  startMonitorJob();
  server = app.listen(PORT, () => {
    console.log(`[Startup] Watchly server running on http://localhost:${PORT}`);
  });
};

const shutdown = (signal) => {
  console.log(`[Shutdown] ${signal} received. Closing server gracefully...`);
  if (server) {
    server.close(() => {
      console.log('[Shutdown] HTTP server closed.');
      process.exit(0);
    });
  } else {
    process.exit(0);
  }
};

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));

process.on('unhandledRejection', (reason) => {
  console.error('[Fatal] Unhandled rejection:', reason);
});

start();