module.exports = {
  apps: [
    {
      name: 'memapp',
      script: 'npm',
      args: 'start',
      log_date_format: 'HH:mm:ss.SSS YYYY-MM-DD',
    },
  ],
  deploy: {
    production: {
      key: process.env.SSH_KEY_PATH,
      user: process.env.SSH_USER,
      host: process.env.SSH_HOST,
      port: process.env.SSH_PORT,
      ssh_options: 'StrictHostKeyChecking=no',
      ref: 'origin/master',
      repo: 'git@gitlab.com:volodalexey/budget-notes-bot.git',
      path: '/home/vl/budget-notes-bot',
      'post-deploy': [
        process.env.PGPASSWORD
          ? `PGPASSWORD=${process.env.PGPASSWORD} pg_dump --username=${process.env.SSH_USER} --no-owner memory > ~/memory-backups/memory_$(date +%d_%m_%y).bak`
          : false,
        `npm ci`,
        `pm2 startOrRestart ecosystem.config.js --env production`,
      ]
        .filter(Boolean)
        .join(' && '),
    },
  },
};
