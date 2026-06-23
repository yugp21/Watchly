const REQUIRED_VARS = ['MONGO_URI', 'SMTP_HOST', 'SMTP_USER', 'SMTP_PASS'];

const validateEnv = () => {
  const missing = REQUIRED_VARS.filter((key) => !process.env[key]);
  if (missing.length > 0) {
    console.error(`[Startup] Missing required environment variables: ${missing.join(', ')}`);
    console.error('[Startup] Check your .env file against .env.example');
    process.exit(1);
  }
};

module.exports = { validateEnv };