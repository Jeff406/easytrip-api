const path = require('path');

const certDir = path.join(__dirname, 'certs');

module.exports = {
  apps: [
    {
      name: 'easytrip-api',
      script: 'server.js',
      watch: true,
      ignore_watch: ['node_modules', '.git', 'certs'],
      env: {
        NODE_ENV: 'development',
        PORT: 5000,
        MONGO_URI: process.env.MONGO_URI,
        MONGO_PROTOCOL: process.env.MONGO_PROTOCOL,
        MONGO_HOST: process.env.MONGO_HOST,
        MONGO_DB: process.env.MONGO_DB,
        MONGO_USER: process.env.MONGO_USER,
        MONGO_PASS: process.env.MONGO_PASS,
        MONGO_OPTIONS: process.env.MONGO_OPTIONS,
      },
      env_production: {
        NODE_ENV: 'production',
        PORT: 443,
        SSL_KEY_PATH: process.env.SSL_KEY_PATH || path.join(certDir, 'server.key'),
        SSL_CERT_PATH: process.env.SSL_CERT_PATH || path.join(certDir, 'server.crt'),
        MONGO_URI: process.env.MONGO_URI,
        MONGO_PROTOCOL: process.env.MONGO_PROTOCOL,
        MONGO_HOST: process.env.MONGO_HOST,
        MONGO_DB: process.env.MONGO_DB,
        MONGO_USER: process.env.MONGO_USER,
        MONGO_PASS: process.env.MONGO_PASS,
        MONGO_OPTIONS: process.env.MONGO_OPTIONS,
      },
    },
  ],
};