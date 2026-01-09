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
        },
        env_production: {
          NODE_ENV: 'production',
          PORT: 80,
        }
      }
    ]
  };
  