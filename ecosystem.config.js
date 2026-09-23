const { loadEnvConfig } = require('@next/env');

loadEnvConfig(process.cwd());

module.exports = {
  apps: [
    {
      name: 'admin-panel',
      script: 'node_modules/next/dist/bin/next',
      args: `start -p ${process.env.NEXT_PUBLIC_PORT}`,  // Ensure this matches your desired port
      instances: 'max',
      exec_mode: 'cluster',
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
      error_file: './logs/error.log',
      out_file: './logs/out.log',
      log_file: './logs/combined.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss',
      merge_logs: true,
      time: true,
      env: {
        NODE_ENV: 'development',
      },
      env_production: {
        NODE_ENV: 'production',
      },
    },
  ],
};