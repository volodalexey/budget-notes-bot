import { PreparedTestBotMessages } from '../../test/test';

import {
  startBotMockApp,
  destroyBotMockApp,
  CreateMockTestBotMessageResponses,
  AppBotMockI,
} from '../../test/app.bot.mock';
import { TrKey } from '../../i18n/keys';
import { LanguageEnum, ToTranslate } from '../../i18n/i18n';
import {
  DEFAULT_CTG_TYPE,
  generateCategoryCreatedTranslations,
} from '../../db/models/categoryModel';
import { toCommand, BotCommandEnum } from '../helpers';
import { TestConfigT } from '../../config/config';

describe('Check bot name in command', () => {
  let appBotMock: AppBotMockI;
  let testBotMsgsRes: PreparedTestBotMessages;
  let userLangCode: LanguageEnum;
  let chatId: number;
  let botName: string;

  beforeAll(async () => {
    appBotMock = await startBotMockApp();
    botName = (appBotMock.config.test as TestConfigT).bot_name;
    userLangCode = appBotMock.userLangCode;
    chatId = appBotMock.chatId;
    testBotMsgsRes = CreateMockTestBotMessageResponses({ appBotMock });
  });

  const listctg = toCommand(BotCommandEnum.listctg);
  it(`${listctg}@ should be rejected as unhandled message`, () =>
    testBotMsgsRes([
      {
        toSendText: `${listctg}@`,
        toBeMessage: new ToTranslate(TrKey.UNHANDLED_MESSAGE, userLangCode),
      },
    ]));

  it(`${listctg}@fake_bot_name should be rejected as unhandled message`, () => {
    const fakeBotName = `${botName}fake`;
    return testBotMsgsRes([
      {
        toSendText: `${listctg}@${fakeBotName}`,
        toBeMessage: new ToTranslate(TrKey.UNHANDLED_MESSAGE, userLangCode),
      },
    ]);
  });

  const addctg = toCommand(BotCommandEnum.addctg);
  const ctgTitle = 'CtgTitle';
  it(`${listctg}@fake_bot_name ${ctgTitle} should be rejected as unhandled message`, () => {
    const fakeBotName = `${botName}fake`;
    return testBotMsgsRes([
      {
        toSendText: `${addctg}@${fakeBotName} ${ctgTitle}`,
        prepareDB: async () => {
          await appBotMock.db.categories.deleteAll({
            table_peer_id: chatId,
            peer_id: chatId,
          });
        },
        toBeMessage: new ToTranslate(TrKey.UNHANDLED_MESSAGE, userLangCode),
      },
    ]);
  });

  it(`${listctg}@bot_name should be resolved as empty categories list`, () => {
    return testBotMsgsRes([
      {
        toSendText: `${listctg}@${botName}`,
        prepareDB: async () => {
          await appBotMock.db.categories.deleteAll({
            table_peer_id: chatId,
            peer_id: chatId,
          });
        },
        toBeText: () => `(лимит "30")
Нет категорий`,
      },
    ]);
  });

  it(`${addctg}@bot_name ${ctgTitle} should be resolved as new category`, () => {
    return testBotMsgsRes([
      {
        toSendText: `${addctg}@${botName} ${ctgTitle}`,
        prepareDB: async () => {
          await appBotMock.db.subcategories.deleteAll({
            table_peer_id: chatId,
            peer_id: chatId,
          });
          await appBotMock.db.categories.deleteAll({
            table_peer_id: chatId,
            peer_id: chatId,
          });
        },
        clearDB: async () => {
          const dbCategories = await appBotMock.db.categories.find({
            table_peer_id: chatId,
            title: ctgTitle,
            peer_id: chatId,
          });
          return dbCategories[0];
        },
        toBeMessage: (_) =>
          new ToTranslate(
            TrKey.RES_CTG_ADDED,
            userLangCode,
            {
              createdFields: generateCategoryCreatedTranslations({
                categoryId: _[0].clearedData.id,
                categoryType: DEFAULT_CTG_TYPE,
                categoryTitle: ctgTitle,
                lang: userLangCode,
              }),
            },
            ['createdFields'],
          ),
      },
    ]);
  });

  afterAll(() => destroyBotMockApp(appBotMock));
});
