import { PreparedTestBotMessages } from '../../../test/test';
import {
  startBotMockApp,
  destroyBotMockApp,
  CreateMockTestBotMessageResponses,
  AppBotMockI,
} from '../../../test/app.bot.mock';
import { TrKey } from '../../../i18n/keys';
import { LanguageEnum, ToTranslate } from '../../../i18n/i18n';
import { MAX_TIME_ZONE_LENGTH } from '../../../db/models/userModel';

import {
  toCommand,
  BotCommandEnum,
  generateInvInstruction,
} from '../../helpers';
import { tryToFindTimeZone } from '../../datetime';

describe('Check set time zone command handlers', () => {
  let appBotMock: AppBotMockI;
  let testBotMsgsRes: PreparedTestBotMessages;
  let userLangCode: LanguageEnum;
  let userTimeZone: string;

  beforeAll(async () => {
    appBotMock = await startBotMockApp();
    userLangCode = appBotMock.userLangCode;
    userTimeZone = appBotMock.userTimeZone;
    testBotMsgsRes = CreateMockTestBotMessageResponses({ appBotMock });
  });

  const cmd_settimezone = toCommand(BotCommandEnum.settimezone);
  it(`"${cmd_settimezone}" should be rejected without arguments`, () =>
    testBotMsgsRes([
      {
        toSendText: cmd_settimezone,
        toBeMessage: generateInvInstruction(
          TrKey.INVALID_SET_TIMEZONE_CMD,
          BotCommandEnum.settimezone,
          userLangCode,
          {
            timeZone: userTimeZone,
          },
        ),
      },
    ]));

  const cmd_settimezone_amb = `${cmd_settimezone} timezone ...`;
  it(`"${cmd_settimezone_amb}" should be rejected as of too many arguments`, () =>
    testBotMsgsRes([
      {
        toSendText: cmd_settimezone_amb,
        toBeMessage: generateInvInstruction(
          TrKey.INVALID_SET_TIMEZONE_CMD,
          BotCommandEnum.settimezone,
          userLangCode,
          {
            timeZone: userTimeZone,
          },
        ),
      },
    ]));

  const longTimeZone = Array.from(
    { length: MAX_TIME_ZONE_LENGTH + 1 },
    (i, ind) => String(ind).slice(0, 1),
  ).join('');
  const cmd_settimezone_len = `${cmd_settimezone} ${longTimeZone}`;
  it(`"${cmd_settimezone_len}" should be rejected as of too long time zone name`, () =>
    testBotMsgsRes([
      {
        toSendText: cmd_settimezone_len,
        toBeMessage: new ToTranslate(TrKey.TIME_ZONE_MAX_ERROR, userLangCode, {
          max: MAX_TIME_ZONE_LENGTH,
        }),
      },
    ]));

  const inv_timezone = `ddd`;
  const cmd_settimezone_inv_timezone = `${cmd_settimezone} ${inv_timezone}`;
  it(`"${cmd_settimezone_inv_timezone}" should be rejected as of invalid time zone`, () =>
    testBotMsgsRes([
      {
        toSendText: cmd_settimezone_inv_timezone,
        toBeMessage: new ToTranslate(TrKey.TIME_ZONE_FIND_ERROR, userLangCode, {
          text: inv_timezone,
        }),
      },
    ]));

  const part_tz = 'sant';
  const cmd_settimezone_ambtz = `${cmd_settimezone} ${part_tz}`;
  it(`"${cmd_settimezone_ambtz}" should be rejected as of too many time zones found`, () =>
    testBotMsgsRes([
      {
        toSendText: cmd_settimezone_ambtz,
        toBeMessage: new ToTranslate(TrKey.TIME_ZONE_AMB_ERROR, userLangCode, {
          timeZones: tryToFindTimeZone(part_tz).slice(0, 5).join('\n'),
        }),
      },
    ]));

  it(`"${cmd_settimezone} [timezone]" should change time zone`, () =>
    testBotMsgsRes([
      {
        toSendText: `${cmd_settimezone} kiev`,
        toBeMessage: new ToTranslate(TrKey.TIME_ZONE_UPDATED, userLangCode, {
          oldTimeZone: userTimeZone,
          newTimeZone: 'Europe/Kiev',
        }),
      },
      {
        toSendText: `${cmd_settimezone} mosc`,
        toBeMessage: new ToTranslate(TrKey.TIME_ZONE_UPDATED, userLangCode, {
          oldTimeZone: 'Europe/Kiev',
          newTimeZone: 'Europe/Moscow',
        }),
      },
    ]));

  afterAll(() => destroyBotMockApp(appBotMock));
});
