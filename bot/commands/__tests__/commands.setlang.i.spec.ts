import { PreparedTestBotMessages } from '../../../test/test';
import {
  startBotMockApp,
  destroyBotMockApp,
  CreateMockTestBotMessageResponses,
  AppBotMockI,
} from '../../../test/app.bot.mock';
import { TrKey } from '../../../i18n/keys';
import { LanguageEnum, ToTranslate, getLanguages } from '../../../i18n/i18n';

import {
  toCommand,
  BotCommandEnum,
  generateInvInstruction,
} from '../../helpers';

describe('Check set language command handlers', () => {
  let appBotMock: AppBotMockI;
  let testBotMsgsRes: PreparedTestBotMessages;
  let userLangCode: LanguageEnum;

  beforeAll(async () => {
    appBotMock = await startBotMockApp();
    userLangCode = appBotMock.userLangCode;
    testBotMsgsRes = CreateMockTestBotMessageResponses({ appBotMock });
  });

  const cmd_setlang = toCommand(BotCommandEnum.setlang);
  it(`"${cmd_setlang}" should be rejected without arguments`, () =>
    testBotMsgsRes([
      {
        toSendText: cmd_setlang,
        toBeMessage: generateInvInstruction(
          TrKey.INVALID_SET_LANG_CMD,
          BotCommandEnum.setlang,
          userLangCode,
          {
            languageCode: userLangCode,
          },
        ),
      },
    ]));

  const cmd_setlang_amb = `${cmd_setlang} new lang ...`;
  it(`"${cmd_setlang_amb}" should be rejected as of too many arguments`, () =>
    testBotMsgsRes([
      {
        toSendText: cmd_setlang_amb,
        toBeMessage: generateInvInstruction(
          TrKey.INVALID_SET_LANG_CMD,
          BotCommandEnum.setlang,
          userLangCode,
          {
            languageCode: userLangCode,
          },
        ),
      },
    ]));

  const inv_language = `${LanguageEnum.Russian}ddd`;
  const cmd_setlang_inv_lang = `${cmd_setlang} ${inv_language}`;
  it(`"${cmd_setlang_inv_lang}" should be rejected as of invalid language`, () =>
    testBotMsgsRes([
      {
        toSendText: cmd_setlang_inv_lang,
        toBeMessage: new ToTranslate(TrKey.INVALID_LANGUAGE, userLangCode, {
          languages: getLanguages(),
          language: inv_language,
        }),
      },
    ]));

  const cmd_setlang_real = `${cmd_setlang} ${LanguageEnum.English}`;
  it(`"${cmd_setlang_real}" should change language`, () =>
    testBotMsgsRes([
      {
        toSendText: cmd_setlang_real,
        toBeMessage: new ToTranslate(
          TrKey.LANGUAGE_UPDATED,
          LanguageEnum.English,
          {
            oldLanguage: userLangCode,
            newLanguage: LanguageEnum.English,
          },
        ),
      },
    ]));

  afterAll(() => destroyBotMockApp(appBotMock));
});
