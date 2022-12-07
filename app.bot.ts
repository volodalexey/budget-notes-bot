import { AppConfigT } from './config/config';
import {
  BotSbjNext,
  createAirgramBot,
  BotT,
  initializeAirgramBot,
  destroyAirgramBot,
  BotInfoT,
} from './bot/bot';
import { createDb, DbT, destroyDb, initializeDb, DBApp } from './db/db';

interface InitialBotAppT {
  db: DbT;
  dbApp: DBApp;
  airgram: BotT;
  botInfo: BotInfoT;
  botSubjectNext: BotSbjNext;
  config: AppConfigT;
}

export type BotAppT = InitialBotAppT;

export async function createBotApp(
  config: AppConfigT,
): Promise<InitialBotAppT> {
  const dbApp = createDb(config.db);
  return {
    db: dbApp.db,
    dbApp,
    ...(await createAirgramBot(config, dbApp)),
    config,
  };
}

export async function initializeBotApp(app: InitialBotAppT): Promise<BotAppT> {
  await initializeDb(app.db);
  await initializeAirgramBot();

  return app;
}

export function destroyBotApp(app: BotAppT): Promise<[void, void]> {
  return Promise.all([destroyAirgramBot(app.airgram), destroyDb(app.dbApp)]);
}
