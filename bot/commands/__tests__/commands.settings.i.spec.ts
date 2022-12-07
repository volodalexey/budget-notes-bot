import { PreparedTestBotMessages } from '../../../test/test';
import {
  startBotMockApp,
  destroyBotMockApp,
  CreateMockTestBotMessageResponses,
  AppBotMockI,
} from '../../../test/app.bot.mock';

import { toCommand, BotCommandEnum, printSettings } from '../../helpers';
import { UserDBModel } from '../../../db/models/userModel';
import { parseWeekStartsOn } from '../../datetime';

describe('Check help command handlers', () => {
  let appBotMock: AppBotMockI;
  let testBotMsgsRes: PreparedTestBotMessages;

  beforeAll(async () => {
    appBotMock = await startBotMockApp();
    testBotMsgsRes = CreateMockTestBotMessageResponses({ appBotMock });
  });

  const cmd_settings = toCommand(BotCommandEnum.settings);
  it(`"${cmd_settings}" should print user settings`, () =>
    testBotMsgsRes([
      {
        toSendText: cmd_settings,
        prepareDB: async () => {
          const dbUser = await appBotMock.db.users.findById(appBotMock.user.id);
          return dbUser;
        },
        toBeMessage: (_, dbUser: UserDBModel) =>
          printSettings({
            dbUserLang: dbUser.language_code,
            userId: dbUser.id,
            peerId: String(appBotMock.chatId),
            quota: dbUser.quota,
            languageCode: dbUser.language_code,
            timeZone: dbUser.time_zone,
            weekStartsOn: parseWeekStartsOn(dbUser.week_starts_on, true),
          }),
      },
    ]));

  afterAll(() => destroyBotMockApp(appBotMock));
});
