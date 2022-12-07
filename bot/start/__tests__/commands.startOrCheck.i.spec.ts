import { PreparedTestBotMessages } from '../../../test/test';
import {
  startBotMockApp,
  destroyBotMockApp,
  CreateMockTestBotMessageResponses,
  AppBotMockI,
} from '../../../test/app.bot.mock';
import { TrKey } from '../../../i18n/keys';
import { LanguageEnum, ToTranslate } from '../../../i18n/i18n';
import {
  createAddUser,
  userKeyStr,
  UserStatusEnum,
  DEFAULT_USER_QUOTA,
} from '../../../db/models/userModel';

import { toCommand, BotCommandEnum } from '../../helpers';
import { AppTestConfigT } from '../../../config/config';

describe('Check start command handler', () => {
  let appBotMock: AppBotMockI;
  let config: AppTestConfigT;
  let testBotMsgsRes: PreparedTestBotMessages;
  let userLangCode: LanguageEnum;
  let userFirstName: string | undefined;
  let userIdStr: string;

  beforeAll(async () => {
    appBotMock = await startBotMockApp();
    config = appBotMock.config;
    userLangCode = appBotMock.userLangCode;
    userFirstName = appBotMock.user.first_name;
    userIdStr = appBotMock.user.id;
    testBotMsgsRes = CreateMockTestBotMessageResponses({ appBotMock });
  });

  const cmd_start = toCommand(BotCommandEnum.start);

  it(`"${cmd_start}" user should be rejected as of quota limit reached`, () =>
    testBotMsgsRes([
      {
        toSendText: cmd_start,
        toBeMessage: new ToTranslate(TrKey.USER_QUOTA_REACHED, userLangCode),
        prepareDB: async () => {
          await appBotMock.db.users.delete(userIdStr);
          const dbUser = await appBotMock.db.users.add(
            createAddUser(
              {
                id: userIdStr,
                username: config.test.user_name,
                first_name: userFirstName,
                language_code: userLangCode,
                quota: 0,
              },
              {
                language: config.test.user_language,
                week_starts_on: config.test.user_week_starts_on,
                time_zone: config.test.user_time_zone,
              },
            ),
          );
          return dbUser;
        },
        toExpect: [
          (_) => {
            const dbUser = _[0].preparedData;
            expect(dbUser).toBeDefined();
          },
          (_) => {
            const dbUser = _[0].preparedData;
            expect(dbUser).toHaveProperty(
              'status',
              userKeyStr(UserStatusEnum.unknown),
            );
          },
        ],
      },
    ]));

  it(`"${cmd_start}" user should be allowed to use this bot and quota decreased`, () =>
    testBotMsgsRes([
      {
        toSendText: cmd_start,
        toBeMessage: new ToTranslate(
          TrKey.YOU_ARE_ALLOWED_TO_USE,
          userLangCode,
        ),
        prepareDB: async () => {
          await appBotMock.db.users.delete(userIdStr);
          const dbUser = await appBotMock.db.users.add(
            createAddUser(
              {
                id: userIdStr,
                username: config.test.user_name,
                first_name: userFirstName,
                language_code: userLangCode,
              },
              {
                language: config.test.user_language,
                week_starts_on: config.test.user_week_starts_on,
                time_zone: config.test.user_time_zone,
              },
            ),
          );
          return dbUser;
        },
        clearDB: () => appBotMock.db.users.findById(userIdStr),
        toExpect: [
          (_) => {
            const dbUser = _[0].preparedData;
            expect(dbUser).toBeDefined();
          },
          (_) => {
            const dbUser = _[0].preparedData;
            expect(dbUser).toHaveProperty(
              'status',
              userKeyStr(UserStatusEnum.unknown),
            );
          },
          (_) => {
            const dbUser = _[0].clearedData;
            expect(dbUser).toHaveProperty('quota', DEFAULT_USER_QUOTA - 1);
          },
        ],
      },
      {
        toSendText: 'anything',
        toBeMessage: new ToTranslate(TrKey.UNHANDLED_MESSAGE, userLangCode),
        clearDB: () => appBotMock.db.users.findById(userIdStr),
        toExpect: [
          (_) => {
            const dbUser = _[1].clearedData;
            expect(dbUser).toHaveProperty('quota', DEFAULT_USER_QUOTA - 2);
          },
        ],
      },
    ]));

  afterAll(() => destroyBotMockApp(appBotMock));
});
