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
          MONGO_URI: 'mongodb+srv://thai-le:Bekilled461988@cluster0.if01q.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0'
        },
        env_production: {
          NODE_ENV: 'production',
          PORT: 80,
          MONGO_URI: 'mongodb+srv://<user>:<password>@your-cluster.mongodb.net/easytrip'
        }
      }
    ]
  };
  