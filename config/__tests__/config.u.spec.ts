import { listTimeZones } from 'timezone-support';

import { LanguageEnum } from '../../i18n/i18n';
import { createAppTestConfig } from '../config';

describe('Check Config', () => {
  test('Application config creates and contains all fields', () => {
    const appConfig = createAppTestConfig();

    expect(appConfig).toBeDefined();

    expect(appConfig).toHaveProperty('bot', expect.any(Object));
    const { bot: botConfig } = appConfig;
    expect(botConfig).toHaveProperty('bot_token', expect.any(String));
    expect(botConfig).toHaveProperty('tdlib_command', expect.any(String));
    expect(botConfig).toHaveProperty('tdlib_db', expect.any(String));
    expect(botConfig).toHaveProperty('api_id', expect.any(Number));
    expect(botConfig).toHaveProperty('api_hash', expect.any(String));

    expect(appConfig).toHaveProperty('db', expect.any(Object));
    const { db: dbConfig } = appConfig;
    expect(dbConfig).toHaveProperty('host', expect.any(String));
    expect(dbConfig).toHaveProperty('port', expect.any(Number));
    expect(dbConfig).toHaveProperty('database', expect.any(String));
    expect(dbConfig).toHaveProperty('user', expect.any(String));
    expect(dbConfig).toHaveProperty('password', expect.any(String));

    expect(appConfig).toHaveProperty('user', expect.any(Object));
    const { user: userConfig } = appConfig;
    expect(userConfig).toHaveProperty('language', expect.any(String));
    expect(Object.values(LanguageEnum)).toContain(userConfig.language);
    expect(userConfig).toHaveProperty('time_zone', expect.any(String));
    expect(listTimeZones()).toContain(userConfig.time_zone);
    expect(userConfig).toHaveProperty('week_starts_on', expect.any(Number));

    expect(appConfig).toHaveProperty('test', expect.any(Object));
    const { test: testConfig } = appConfig;
    expect(testConfig).toHaveProperty('chat_id', expect.any(Number));
    expect(testConfig).toHaveProperty('bot_id', expect.any(Number));
    expect(testConfig).toHaveProperty('user_id', expect.any(Number));
    expect(testConfig).toHaveProperty('user_name', expect.any(String));
    expect(testConfig).toHaveProperty('user_language', expect.any(String));
    expect(Object.values(LanguageEnum)).toContain(testConfig.user_language);
    expect(testConfig).toHaveProperty('user_time_zone', expect.any(String));
    expect(listTimeZones()).toContain(testConfig.user_time_zone);
    expect(testConfig).toHaveProperty(
      'user_week_starts_on',
      expect.any(Number),
    );

    if (appConfig.admin) {
      expect(appConfig).toHaveProperty('admin', expect.any(Object));
      const { admin: adminConfig } = appConfig;
      expect(adminConfig).toHaveProperty('user_id', expect.any(Number));
    }
  });
});
