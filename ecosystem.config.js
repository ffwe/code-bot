module.exports = {
  apps : [{
    name: 'code-bot',
    script: 'src/index.js',
    watch: '.',
    autorestart: true,
  },
  {
    name: 'code-bot-dev',
    script: 'src/index.js',
    args: ['--dev'],
    watch: '.',
    autorestart: true,
  }],

  deploy : {
    production : {
      user : 'SSH_USERNAME',
      host : 'SSH_HOSTMACHINE',
      ref  : 'origin/master',
      repo : 'GIT_REPOSITORY',
      path : 'DESTINATION_PATH',
      'pre-deploy-local': '',
      'post-deploy' : 'npm install && pm2 reload ecosystem.config.js --env production',
      'pre-setup': ''
    }
  }
};