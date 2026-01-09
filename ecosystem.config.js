module.exports = {
    apps: [
      {
        name: 'easytrip-api',
        script: 'server.js',
        watch: true,
        ignore_watch: ['node_modules', '.git'],
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
          PORT: 80,
          MONGO_URI: process.env.MONGO_URI,
          MONGO_PROTOCOL: process.env.MONGO_PROTOCOL,
          MONGO_HOST: process.env.MONGO_HOST,
          MONGO_DB: process.env.MONGO_DB,
          MONGO_USER: process.env.MONGO_USER,
          MONGO_PASS: process.env.MONGO_PASS,
          MONGO_OPTIONS: process.env.MONGO_OPTIONS,
        }
      }
    ]
  };