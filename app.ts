import { createAppConfig } from './config/config';
import { createBotApp, initializeBotApp } from './app.bot';

const config = createAppConfig();
createBotApp(config)
  .then((app) => initializeBotApp(app))
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
