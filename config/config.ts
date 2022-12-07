import { cosmiconfigSync } from 'cosmiconfig';
import { parseWeekStartsOn, WeekStartsOn } from '../bot/datetime';
import { LanguageEnum, TrLanguage } from '../i18n/i18n';
import { logConfig } from '../logger/logger';

export function toNumber(futureNumber: string | number): number {
  let _number;
  if (typeof futureNumber === 'string') {
    try {
      _number = Number.parseInt(futureNumber);
    } catch (e) {
      throw e;
    } finally {
      if (Number.isNaN(_number)) {
        throw new Error(
          `Can not convert ${futureNumber} to Integer/Number. Result is ${_number}`,
        );
      }
    }
  } else {
    _number = futureNumber;
  }
  if (_number < 0) {
    _number = -1 * _number;
  }
  return _number;
}

export type InitialBotConfigT = {
  bot_token: string;
  bot_name?: string;
  tdlib_command: string;
  tdlib_db: string;
  api_id: string | number;
  api_hash: string;
};

export type BotConfigT = Pick<
  InitialBotConfigT,
  Exclude<keyof InitialBotConfigT, 'api_id'>
> & {
  api_id: number;
};

export function parseBotConfig(config: InitialBotConfigT): BotConfigT {
  const api_id = toNumber(config.api_id);
  return { ...config, api_id };
}

export type InitialDBConfigT = {
  host: string;
  port: string;
  database: string;
  user: string;
  password: string;
};

export type DBConfigT = Pick<
  InitialDBConfigT,
  Exclude<keyof InitialDBConfigT, 'port'>
> & {
  port: number;
};

export function parseDBConfig(config: InitialDBConfigT): DBConfigT {
  const port = toNumber(config.port);
  return { ...config, port };
}

export type InitialUserConfigT = {
  language: string;
  time_zone: string;
  week_starts_on: string | number;
};

export type UserConfigT = Pick<
  InitialUserConfigT,
  Exclude<keyof InitialUserConfigT, 'language' | 'week_starts_on'>
> & {
  language: LanguageEnum;
  week_starts_on: WeekStartsOn;
};

export function parseUserConfig(config: InitialUserConfigT): UserConfigT {
  const language = TrLanguage(config.language);
  const week_starts_on = parseWeekStartsOn(config.week_starts_on);
  return { ...config, language, week_starts_on };
}

export type InitialTestConfigT = {
  chat_id: string | number;
  bot_id: string | number;
  bot_name: string;
  user_id: string | number;
  user_name: string;
  user_language: string;
  user_time_zone: string;
  user_week_starts_on: string | number;
};

export type TestConfigT = Pick<
  InitialTestConfigT,
  Exclude<
    keyof InitialTestConfigT,
    'chat_id' | 'bot_id' | 'user_id' | 'user_language' | 'user_week_starts_on'
  >
> & {
  chat_id: number;
  bot_id: number;
  user_id: number;
  user_language: LanguageEnum;
  user_week_starts_on: WeekStartsOn;
};

export function parseTestConfig(
  config?: InitialTestConfigT,
): TestConfigT | undefined {
  if (config) {
    const chat_id = toNumber(config.chat_id);
    const bot_id = toNumber(config.bot_id);
    const user_id = toNumber(config.user_id);
    const user_language = TrLanguage(config.user_language);
    const user_week_starts_on = parseWeekStartsOn(config.user_week_starts_on);
    return {
      ...config,
      chat_id,
      bot_id,
      user_id,
      user_language,
      user_week_starts_on,
    };
  }
}

export type InitialAdminConfigT = {
  user_id: string | number;
};

export type AdminConfigT = Pick<
  InitialAdminConfigT,
  Exclude<keyof InitialAdminConfigT, 'user_id'>
> & {
  user_id: number;
};

export function parseAdminConfig(
  config?: InitialAdminConfigT,
): AdminConfigT | undefined {
  if (config) {
    const user_id = toNumber(config.user_id);
    return { ...config, user_id };
  }
}

export type InitialAppConfigT = {
  bot_section: InitialBotConfigT;
  db_section: InitialDBConfigT;
  user_section: InitialUserConfigT;
  test_section?: InitialTestConfigT;
  admin_section?: InitialAdminConfigT;
};

export type AppConfigT = {
  bot: BotConfigT;
  db: DBConfigT;
  user: UserConfigT;
  test?: TestConfigT;
  admin?: AdminConfigT;
};

export function createAppConfig(): AppConfigT {
  const config = cosmiconfigSync(process.env.CONFIG || 'app_').search()
    ?.config as InitialAppConfigT;
  const botConfig = parseBotConfig(config.bot_section);
  const dbConfig = parseDBConfig(config.db_section);
  const userConfig = parseUserConfig(config.user_section);
  const testConfig = parseTestConfig(config.test_section);
  const adminConfig = parseAdminConfig(config.admin_section);
  const retConfig = {
    bot: botConfig,
    db: dbConfig,
    user: userConfig,
    test: testConfig,
    admin: adminConfig,
  };
  logConfig(retConfig);
  return retConfig;
}

export type AppTestConfigT = Pick<
  AppConfigT,
  Exclude<keyof AppConfigT, 'test'>
> & {
  test: TestConfigT;
};

export function createAppTestConfig(): AppTestConfigT {
  const config = createAppConfig();
  if (!config.test) {
    throw new Error('Test section is not provided in config');
  }
  return config as AppTestConfigT;
}
