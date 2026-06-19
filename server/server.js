require('dotenv').config();
const app = require('./app');
const connectDB = require('./config/db');
const { startMonitorJob } = require('./jobs/monitorJob');

const PORT = process.env.PORT || 5000;

const start = async () => {
  await connectDB();
  startMonitorJob();
  app.listen(PORT, () => {
    console.log(`Watchly server running on http://localhost:${PORT}`);
  });
};

start();
