import { PreparedTestBotMessages } from '../../../test/test';
import {
  startBotMockApp,
  destroyBotMockApp,
  CreateMockTestBotMessageResponses,
  AppBotMockI,
} from '../../../test/app.bot.mock';
import { TrKey } from '../../../i18n/keys';
import { LanguageEnum, ToTranslate } from '../../../i18n/i18n';
import { setDTDate } from '../../datetime';
import { createAddUser, UserStatusEnum } from '../../../db/models/userModel';
import { BotCommandEnum, toCommand } from '../../helpers';
import { AppTestConfigT } from '../../../config/config';

describe('Check users datetime generation', () => {
  let appBotMock: AppBotMockI;
  let config: AppTestConfigT;
  let testBotMsgsRes: PreparedTestBotMessages;
  let userLangCode: LanguageEnum;
  let userIdStr: string;

  const userFirstName = 'userFirstName';

  let mockCreatedDate: Date, mockUpdatedDate: Date;

  beforeAll(async () => {
    appBotMock = await startBotMockApp();
    config = appBotMock.config;
    userLangCode = appBotMock.userLangCode;
    userIdStr = appBotMock.user.id;
    testBotMsgsRes = CreateMockTestBotMessageResponses({ appBotMock });
  });

  it(`should add new user`, () =>
    testBotMsgsRes([
      {
        prepareDB: async () => {
          mockCreatedDate = new Date();
          setDTDate(mockCreatedDate);
          await appBotMock.db.users.deleteAll();
          await appBotMock.db.users.add(
            createAddUser(
              {
                id: userIdStr,
                username: config.test.user_name,
                first_name: userFirstName,
                language_code: userLangCode,
                status: UserStatusEnum.developer,
              },
              {
                language: config.test.user_language,
                week_starts_on: config.test.user_week_starts_on,
                time_zone: config.test.user_time_zone,
              },
            ),
          );
        },
        clearDB: () => appBotMock.db.users.findById(userIdStr),
        toExpect: (_) => {
          const dbUser = _[0].clearedData;
          expect(dbUser).toBeDefined();
        },
      },
      {
        toExpect: [
          (_) => {
            const dbUser = _[0].clearedData;
            expect(dbUser).toHaveProperty('created_at', mockCreatedDate);
          },
          (_) => {
            const dbUser = _[0].clearedData;
            expect(dbUser).toHaveProperty('updated_at', null);
          },
          (_) => {
            const dbUser = _[0].clearedData;
            expect(dbUser).toHaveProperty('deleted_at', null);
          },
        ],
      },
    ]));

  const cmd_setlang = toCommand(BotCommandEnum.setlang);
  const cmd_setlang_real = `${cmd_setlang} ${LanguageEnum.English}`;
  it(`"${cmd_setlang_real}" should update user language`, () =>
    testBotMsgsRes([
      {
        toSendText: cmd_setlang_real,
        prepareDB: async () => {
          mockCreatedDate = new Date();
          setDTDate(mockCreatedDate);
          await appBotMock.db.users.deleteAll();
          await appBotMock.db.users.add(
            createAddUser(
              {
                id: userIdStr,
                username: config.test.user_name,
                first_name: userFirstName,
                language_code: userLangCode,
                status: UserStatusEnum.developer,
              },
              {
                language: config.test.user_language,
                week_starts_on: config.test.user_week_starts_on,
                time_zone: config.test.user_time_zone,
              },
            ),
          );
          mockUpdatedDate = new Date();
          setDTDate(mockUpdatedDate);
        },
        toBeMessage: new ToTranslate(
          TrKey.LANGUAGE_UPDATED,
          LanguageEnum.English,
          {
            oldLanguage: userLangCode,
            newLanguage: LanguageEnum.English,
          },
        ),
        clearDB: () => appBotMock.db.users.findById(userIdStr),
      },
      {
        toExpect: [
          (_) => {
            const dbUser = _[0].clearedData;
            expect(dbUser).toBeDefined();
          },
          (_) => {
            const dbUser = _[0].clearedData;
            expect(dbUser).toHaveProperty('created_at', mockCreatedDate);
          },
          (_) => {
            const dbUser = _[0].clearedData;
            expect(dbUser).toHaveProperty('updated_at', mockUpdatedDate);
          },
          (_) => {
            const dbUser = _[0].clearedData;
            expect(dbUser).toHaveProperty('deleted_at', null);
          },
        ],
      },
    ]));

  const cmd_settimezone = toCommand(BotCommandEnum.settimezone);
  it(`"${cmd_settimezone} user_time_zone" should update user time zone`, () => {
    return testBotMsgsRes([
      {
        toSendText: `${cmd_settimezone} ${config.test.user_time_zone}`,
        prepareDB: async () => {
          mockCreatedDate = new Date();
          setDTDate(mockCreatedDate);
          await appBotMock.db.users.deleteAll();
          await appBotMock.db.users.add(
            createAddUser(
              {
                id: userIdStr,
                username: config.test.user_name,
                first_name: userFirstName,
                language_code: userLangCode,
                status: UserStatusEnum.developer,
              },
              {
                language: config.test.user_language,
                week_starts_on: config.test.user_week_starts_on,
                time_zone: config.test.user_time_zone,
              },
            ),
          );
          mockUpdatedDate = new Date();
          setDTDate(mockUpdatedDate);
        },
        toBeMessage: new ToTranslate(TrKey.TIME_ZONE_UPDATED, userLangCode, {
          oldTimeZone: config.test.user_time_zone,
          newTimeZone: config.test.user_time_zone,
        }),
        clearDB: () => appBotMock.db.users.findById(userIdStr),
      },
      {
        toExpect: [
          (_) => {
            const dbUser = _[0].clearedData;
            expect(dbUser).toBeDefined();
          },
          (_) => {
            const dbUser = _[0].clearedData;
            expect(dbUser).toHaveProperty('created_at', mockCreatedDate);
          },
          (_) => {
            const dbUser = _[0].clearedData;
            expect(dbUser).toHaveProperty('updated_at', mockUpdatedDate);
          },
          (_) => {
            const dbUser = _[0].clearedData;
            expect(dbUser).toHaveProperty('deleted_at', null);
          },
        ],
      },
    ]);
  });

  const cmd_setweekstartson = toCommand(BotCommandEnum.setweekstartson);
  const week_starts_on = '0';
  const cmd_setweekstartson_real = `${cmd_setweekstartson} ${week_starts_on}`;
  it(`"${cmd_setweekstartson_real}" should update user week starts on`, () =>
    testBotMsgsRes([
      {
        toSendText: cmd_setweekstartson_real,
        prepareDB: async () => {
          mockCreatedDate = new Date();
          setDTDate(mockCreatedDate);
          await appBotMock.db.users.deleteAll();
          await appBotMock.db.users.add(
            createAddUser(
              {
                id: userIdStr,
                username: config.test.user_name,
                first_name: userFirstName,
                language_code: userLangCode,
                status: UserStatusEnum.developer,
              },
              {
                language: config.test.user_language,
                week_starts_on: config.test.user_week_starts_on,
                time_zone: config.test.user_time_zone,
              },
            ),
          );
          mockUpdatedDate = new Date();
          setDTDate(mockUpdatedDate);
        },
        toBeMessage: new ToTranslate(
          TrKey.WEEK_STARTS_ON_UPDATED,
          userLangCode,
          {
            oldWeeksStartsOn: config.test.user_week_starts_on,
            newWeeksStartsOn: week_starts_on,
          },
        ),
        clearDB: () => appBotMock.db.users.findById(userIdStr),
      },
      {
        toExpect: [
          (_) => {
            const dbUser = _[0].clearedData;
            expect(dbUser).toBeDefined();
          },
          (_) => {
            const dbUser = _[0].clearedData;
            expect(dbUser).toHaveProperty('created_at', mockCreatedDate);
          },
          (_) => {
            const dbUser = _[0].clearedData;
            expect(dbUser).toHaveProperty('updated_at', mockUpdatedDate);
          },
          (_) => {
            const dbUser = _[0].clearedData;
            expect(dbUser).toHaveProperty('deleted_at', null);
          },
        ],
      },
    ]));

  afterAll(async () => {
    setDTDate();
    await destroyBotMockApp(appBotMock);
  });
});
