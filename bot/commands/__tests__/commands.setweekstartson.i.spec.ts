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
  toCommand,
  BotCommandEnum,
  generateInvInstruction,
} from '../../helpers';
import { AppTestConfigT } from '../../../config/config';

describe('Check set week starts on day command handlers', () => {
  let appBotMock: AppBotMockI;
  let config: AppTestConfigT;
  let testBotMsgsRes: PreparedTestBotMessages;
  let userLangCode: LanguageEnum;

  beforeAll(async () => {
    appBotMock = await startBotMockApp();
    config = appBotMock.config;
    userLangCode = appBotMock.userLangCode;
    testBotMsgsRes = CreateMockTestBotMessageResponses({ appBotMock });
  });

  const cmd_setweekstartson = toCommand(BotCommandEnum.setweekstartson);
  it(`"${cmd_setweekstartson}" should be rejected without arguments`, () =>
    testBotMsgsRes([
      {
        toSendText: cmd_setweekstartson,
        toBeMessage: generateInvInstruction(
          TrKey.INVALID_SET_WEEK_STARTS_ON_CMD,
          BotCommandEnum.setweekstartson,
          userLangCode,
          {
            weekStartsOn: config.user.week_starts_on,
          },
        ),
      },
    ]));

  const cmd_setweekstartson_amb = `${cmd_setweekstartson} title ...`;
  it(`"${cmd_setweekstartson_amb}" should be rejected as of too many arguments`, () =>
    testBotMsgsRes([
      {
        toSendText: cmd_setweekstartson_amb,
        toBeMessage: generateInvInstruction(
          TrKey.INVALID_SET_WEEK_STARTS_ON_CMD,
          BotCommandEnum.setweekstartson,
          userLangCode,
          {
            weekStartsOn: config.user.week_starts_on,
          },
        ),
      },
    ]));

  const inv_weekstartson = `df`;
  const cmd_setweekstartson_inv = `${cmd_setweekstartson} ${inv_weekstartson}`;
  it(`"${cmd_setweekstartson_inv}" should be rejected as of invalid week starts day`, () =>
    testBotMsgsRes([
      {
        toSendText: cmd_setweekstartson_inv,
        toBeMessage: new ToTranslate(
          TrKey.INVALID_WEEK_STARTS_ON,
          userLangCode,
          {
            weekStartsOn: inv_weekstartson,
          },
        ),
      },
    ]));

  const week_starts_on = '0';
  const cmd_setweekstartson_real = `${cmd_setweekstartson} ${week_starts_on}`;
  it(`"${cmd_setweekstartson_real}" should change week starts on day`, () =>
    testBotMsgsRes([
      {
        toSendText: cmd_setweekstartson_real,
        toBeMessage: new ToTranslate(
          TrKey.WEEK_STARTS_ON_UPDATED,
          userLangCode,
          {
            oldWeeksStartsOn: config.user.week_starts_on,
            newWeeksStartsOn: week_starts_on,
          },
        ),
      },
    ]));

  afterAll(() => destroyBotMockApp(appBotMock));
});
