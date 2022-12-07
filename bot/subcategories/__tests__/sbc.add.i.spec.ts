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
  composeAddCategory,
  DEFAULT_CTG_TYPE,
} from '../../../db/models/categoryModel';
import {
  checkAddSubcategory,
  MAX_SBC_DESC_LENGTH,
  MAX_SBC_TITLE_LENGTH,
  generateSubcategoryCreatedTranslations,
} from '../../../db/models/subcategoryModel';

import {
  toCommand,
  BotCommandEnum,
  generateInvInstruction,
} from '../../helpers';
import { parseUserDateTimeToUTC } from '../../datetime';
import { CommandParameterName, PARAMS_EQ } from '../../parameters';
import { AppTestConfigT } from '../../../config/config';

describe('Check subcategories add command handlers', () => {
  let appBotMock: AppBotMockI;
  let config: AppTestConfigT;
  let testBotMsgsRes: PreparedTestBotMessages;
  let userLangCode: LanguageEnum;
  let chatId: number;
  let userIdStr: string;

  let serverNowDate;

  beforeAll(async () => {
    appBotMock = await startBotMockApp();
    config = appBotMock.config;
    userLangCode = appBotMock.userLangCode;
    chatId = appBotMock.chatId;
    userIdStr = appBotMock.user.id;
    testBotMsgsRes = CreateMockTestBotMessageResponses({ appBotMock });
  });

  const cmd_addsbc = toCommand(BotCommandEnum.addsbc);
  it(`"${cmd_addsbc}" should be rejected without arguments`, () =>
    testBotMsgsRes([
      {
        toSendText: cmd_addsbc,
        toBeMessage: generateInvInstruction(
          TrKey.INVALID_ADD_SBC_CMD,
          BotCommandEnum.addsbc,
          userLangCode,
        ),
      },
    ]));

  const cmd_addsbc_sm = `${cmd_addsbc} ctgTitle`;
  it(`"${cmd_addsbc_sm}" should be rejected as of lack argumets`, () =>
    testBotMsgsRes([
      {
        toSendText: cmd_addsbc_sm,
        toBeMessage: generateInvInstruction(
          TrKey.INVALID_ADD_SBC_CMD,
          BotCommandEnum.addsbc,
          userLangCode,
        ),
      },
    ]));

  const fakeCtgTitle = 'fakeCtgTitle';
  const cmd_addsbc_fake_ctg = `${cmd_addsbc} ${fakeCtgTitle} title`;
  it(`"${cmd_addsbc_fake_ctg}" should be rejected as of none existing category (by category title)`, () =>
    testBotMsgsRes([
      {
        toSendText: cmd_addsbc_fake_ctg,
        prepareDB: async () => {
          await appBotMock.db.categories.deleteAll({
            table_peer_id: chatId,
            peer_id: chatId,
          });
        },
        toBeMessage: new ToTranslate(
          TrKey.CTG_NOT_EXISTS_BY_TITLE,
          userLangCode,
          { title: fakeCtgTitle },
        ),
      },
    ]));

  const realSbcTitle = '⛔';
  const cmd_addsbc_fake_ctg_id = `${cmd_addsbc} [${CommandParameterName.ctgId}${PARAMS_EQ}23 ${CommandParameterName.sbcTitle}${PARAMS_EQ}${realSbcTitle}]`;
  it(`"${cmd_addsbc_fake_ctg_id}" should be rejected as of none existing category (by category id)`, () =>
    testBotMsgsRes([
      {
        toSendText: cmd_addsbc_fake_ctg_id,
        prepareDB: async () => {
          await appBotMock.db.categories.deleteAll({
            table_peer_id: chatId,
            peer_id: chatId,
          });
        },
        toBeMessage: new ToTranslate(TrKey.CTG_NOT_EXISTS_BY_ID, userLangCode, {
          id: '23',
        }),
      },
    ]));

  const realCtgTitle = 'realCtgTitle';
  const cmd_addsbc_real_ctg = `${cmd_addsbc} ${realCtgTitle} ${realCtgTitle}`;
  it(`"${cmd_addsbc_real_ctg}" should be rejected as of already existing category`, () =>
    testBotMsgsRes([
      {
        toSendText: cmd_addsbc_real_ctg,
        prepareDB: async () => {
          await appBotMock.db.categories.deleteAll({
            table_peer_id: chatId,
            peer_id: chatId,
          });
          await appBotMock.db.categories.add(
            { table_peer_id: chatId },
            composeAddCategory({
              title: realCtgTitle,
              peer_id: chatId,
              created_by_user_id: userIdStr,
            }),
          );
        },
        toBeMessage: new ToTranslate(
          TrKey.TITLE_EXISTS_IN_CATEGORY,
          userLangCode,
          { title: realCtgTitle },
        ),
      },
    ]));

  const cmd_addsbc_real_sbc = `${cmd_addsbc} ${realCtgTitle} ${realSbcTitle}`;
  it(`"${cmd_addsbc_real_sbc}" should be rejected as of already existing subcategory`, () =>
    testBotMsgsRes([
      {
        toSendText: cmd_addsbc_real_sbc,
        prepareDB: async () => {
          serverNowDate = parseUserDateTimeToUTC(
            '2019.02.09 12:00',
            config.test.user_time_zone,
          );
          await appBotMock.db.subcategories.deleteAll({
            table_peer_id: chatId,
            peer_id: chatId,
          });
          await appBotMock.db.categories.deleteAll({
            table_peer_id: chatId,
            peer_id: chatId,
          });
          const dbCategory = await appBotMock.db.categories.add(
            { table_peer_id: chatId },
            composeAddCategory({
              title: realCtgTitle,
              peer_id: chatId,
              created_by_user_id: userIdStr,
              created_at: serverNowDate
                ? new Date(serverNowDate.getTime())
                : undefined,
            }),
          );
          await appBotMock.db.subcategories.add(
            { table_peer_id: chatId },
            checkAddSubcategory({
              title: realSbcTitle,
              peer_id: chatId,
              category_id: dbCategory.id,
              created_by_user_id: userIdStr,
              created_at: serverNowDate
                ? new Date(serverNowDate.getTime() + 1)
                : undefined,
            }),
          );
        },
        toBeMessage: new ToTranslate(TrKey.SUBCTG_EXISTS, userLangCode, {
          title: realSbcTitle,
        }),
      },
    ]));

  it(`"${cmd_addsbc_real_sbc}" should add new subcategory`, () =>
    testBotMsgsRes([
      {
        toSendText: cmd_addsbc_real_sbc,
        prepareDB: async () => {
          await appBotMock.db.subcategories.deleteAll({
            table_peer_id: chatId,
            peer_id: chatId,
          });
          await appBotMock.db.categories.deleteAll({
            table_peer_id: chatId,
            peer_id: chatId,
          });
          await appBotMock.db.categories.add(
            { table_peer_id: chatId },
            composeAddCategory({
              title: realCtgTitle,
              peer_id: chatId,
              created_by_user_id: userIdStr,
            }),
          );
        },
        clearDB: async () => {
          const dbSubcategories = await appBotMock.db.subcategories.find({
            table_peer_id: chatId,
            title: realSbcTitle,
            peer_id: chatId,
          });
          return dbSubcategories[0];
        },
        toBeMessage: (_) =>
          new ToTranslate(
            TrKey.RES_SBC_ADDED,
            userLangCode,
            {
              createdFields: generateSubcategoryCreatedTranslations({
                subcategoryId: _[0].clearedData.id,
                subcategoryTitle: _[0].clearedData.title,
                categoryType: DEFAULT_CTG_TYPE,
                categoryTitle: realCtgTitle,
                lang: userLangCode,
              }),
            },
            ['createdFields'],
          ),
      },
    ]));

  const description = 'this is subcategory description';
  const cmd_addsbc_with_desc = `${cmd_addsbc_real_sbc} ${description}`;
  it(`"${cmd_addsbc_with_desc}" should add new subcategory with description`, () =>
    testBotMsgsRes([
      {
        toSendText: cmd_addsbc_with_desc,
        prepareDB: async () => {
          await appBotMock.db.subcategories.deleteAll({
            table_peer_id: chatId,
            peer_id: chatId,
          });
          await appBotMock.db.categories.deleteAll({
            table_peer_id: chatId,
            peer_id: chatId,
          });
          await appBotMock.db.categories.add(
            { table_peer_id: chatId },
            composeAddCategory({
              title: realCtgTitle,
              peer_id: chatId,
              created_by_user_id: userIdStr,
            }),
          );
        },
        clearDB: async () => {
          const dbSubcategories = await appBotMock.db.subcategories.find({
            table_peer_id: chatId,
            title: realSbcTitle,
            peer_id: chatId,
          });
          return dbSubcategories[0];
        },
        toBeMessage: (_) =>
          new ToTranslate(
            TrKey.RES_SBC_ADDED,
            userLangCode,
            {
              createdFields: generateSubcategoryCreatedTranslations({
                subcategoryId: _[0].clearedData.id,
                subcategoryTitle: _[0].clearedData.title,
                subcategoryDescription: description,
                categoryType: DEFAULT_CTG_TYPE,
                categoryTitle: realCtgTitle,
                lang: userLangCode,
              }),
            },
            ['createdFields'],
          ),
      },
      {
        toSendText: cmd_addsbc_with_desc,
        prepareDB: async () => {
          await appBotMock.db.subcategories.deleteAll({
            table_peer_id: chatId,
            peer_id: chatId,
          });
          await appBotMock.db.categories.deleteAll({
            table_peer_id: chatId,
            peer_id: chatId,
          });
          await appBotMock.db.categories.add(
            { table_peer_id: chatId },
            composeAddCategory({
              title: realCtgTitle,
              peer_id: chatId,
              created_by_user_id: userIdStr,
            }),
          );
        },
        clearDB: async () => {
          const dbSubcategories = await appBotMock.db.subcategories.find({
            table_peer_id: chatId,
            title: realSbcTitle,
            peer_id: chatId,
          });
          return dbSubcategories[0];
        },
        toBeText: (_) => `Подкатегория добавлена
Созданные поля:
Имя "${realSbcTitle}"
Описание "this is subcategory description"
Тип категории "${DEFAULT_CTG_TYPE}"
Имя категории "${realCtgTitle}"
🆔 "${_[1].clearedData.id}"`,
      },
    ]));

  const longCtgTitle = Array.from(
    { length: MAX_SBC_TITLE_LENGTH + 1 },
    (i, ind) => String(ind).slice(0, 1),
  ).join('');
  const cmd_addsbc_long_title = `${cmd_addsbc} ${fakeCtgTitle} ${longCtgTitle}`;
  it(`"${cmd_addsbc_long_title}" should be rejected as of too long title`, () =>
    testBotMsgsRes([
      {
        toSendText: cmd_addsbc_long_title,
        toBeMessage: new ToTranslate(TrKey.SBC_TITLE_MAX_ERROR, userLangCode, {
          max: MAX_SBC_TITLE_LENGTH,
        }),
      },
    ]));

  const longSbcDescr = Array.from(
    { length: MAX_SBC_DESC_LENGTH + 1 },
    (i, ind) => {
      if (ind === 0) {
        return 's';
      } else if (ind === MAX_SBC_DESC_LENGTH) {
        return 'e';
      } else {
        return Math.random() > 0.5 ? String(ind).slice(0, 1) : ' ';
      }
    },
  ).join('');
  const cmd_addsbc_long_desc = `${cmd_addsbc} ${fakeCtgTitle} ${realSbcTitle} ${longSbcDescr}`;
  it(`"${cmd_addsbc_long_desc}" should be rejected as of too long description`, () =>
    testBotMsgsRes([
      {
        toSendText: cmd_addsbc_long_desc,
        toBeMessage: new ToTranslate(TrKey.SBC_DESC_MAX_ERROR, userLangCode, {
          max: MAX_SBC_DESC_LENGTH,
        }),
      },
    ]));

  const cmd_addsbc_with_name_param = `${cmd_addsbc} [${CommandParameterName.ctgTitle}${PARAMS_EQ}${realCtgTitle} ${CommandParameterName.sbcTitle}${PARAMS_EQ}${realSbcTitle}]`;
  it(`"${cmd_addsbc_with_name_param}" should add new subcategory with title parameter`, () =>
    testBotMsgsRes([
      {
        toSendText: cmd_addsbc_with_name_param,
        prepareDB: async () => {
          await appBotMock.db.subcategories.deleteAll({
            table_peer_id: chatId,
            peer_id: chatId,
          });
          await appBotMock.db.categories.deleteAll({
            table_peer_id: chatId,
            peer_id: chatId,
          });
          await appBotMock.db.categories.add(
            { table_peer_id: chatId },
            composeAddCategory({
              title: realCtgTitle,
              peer_id: chatId,
              created_by_user_id: userIdStr,
            }),
          );
        },
        clearDB: async () => {
          const dbSubcategories = await appBotMock.db.subcategories.find({
            table_peer_id: chatId,
            title: realSbcTitle,
            peer_id: chatId,
          });
          return dbSubcategories[0];
        },
        toBeText: (_) => `Подкатегория добавлена
Созданные поля:
Имя "${realSbcTitle}"
Тип категории "${DEFAULT_CTG_TYPE}"
Имя категории "${realCtgTitle}"
🆔 "${_[0].clearedData.id}"`,
      },
    ]));

  const cmd_addsbc_with_name_and_descr_param = `${cmd_addsbc} [${CommandParameterName.ctgTitle}${PARAMS_EQ}${realCtgTitle} ${CommandParameterName.sbcTitle}${PARAMS_EQ}${realSbcTitle} ${CommandParameterName.sbcDescription}${PARAMS_EQ}"${description}"]`;
  it(`"${cmd_addsbc_with_name_and_descr_param}" should add new subcategory with description parameter`, () =>
    testBotMsgsRes([
      {
        toSendText: cmd_addsbc_with_name_and_descr_param,
        prepareDB: async () => {
          await appBotMock.db.subcategories.deleteAll({
            table_peer_id: chatId,
            peer_id: chatId,
          });
          await appBotMock.db.categories.deleteAll({
            table_peer_id: chatId,
            peer_id: chatId,
          });
          await appBotMock.db.categories.add(
            { table_peer_id: chatId },
            composeAddCategory({
              title: realCtgTitle,
              peer_id: chatId,
              created_by_user_id: userIdStr,
            }),
          );
        },
        clearDB: async () => {
          const dbSubcategories = await appBotMock.db.subcategories.find({
            table_peer_id: chatId,
            title: realSbcTitle,
            peer_id: chatId,
          });
          return dbSubcategories[0];
        },
        toBeMessage: (_) =>
          new ToTranslate(
            TrKey.RES_SBC_ADDED,
            userLangCode,
            {
              createdFields: generateSubcategoryCreatedTranslations({
                subcategoryId: _[0].clearedData.id,
                subcategoryTitle: _[0].clearedData.title,
                subcategoryDescription: description,
                categoryType: DEFAULT_CTG_TYPE,
                categoryTitle: realCtgTitle,
                lang: userLangCode,
              }),
            },
            ['createdFields'],
          ),
      },
    ]));

  const cmd_addsbc_by_ctg_id = `${cmd_addsbc} [${CommandParameterName.ctgId}${PARAMS_EQ}{{id}} ${CommandParameterName.sbcTitle}${PARAMS_EQ}${realSbcTitle}]`;
  it(`"${cmd_addsbc_by_ctg_id}" should add new subcategory by category id parameter`, () =>
    testBotMsgsRes([
      {
        toSendText: (_, dbCtg) =>
          cmd_addsbc_by_ctg_id.replace('{{id}}', dbCtg.id),
        prepareDB: async () => {
          await appBotMock.db.subcategories.deleteAll({
            table_peer_id: chatId,
            peer_id: chatId,
          });
          await appBotMock.db.categories.deleteAll({
            table_peer_id: chatId,
            peer_id: chatId,
          });
          const dbCtg = await appBotMock.db.categories.add(
            { table_peer_id: chatId },
            composeAddCategory({
              title: realCtgTitle,
              peer_id: chatId,
              created_by_user_id: userIdStr,
            }),
          );
          return dbCtg;
        },
        clearDB: async () => {
          const dbSubcategories = await appBotMock.db.subcategories.find({
            table_peer_id: chatId,
            title: realSbcTitle,
            peer_id: chatId,
          });
          return dbSubcategories[0];
        },
        toBeText: (_) => `Подкатегория добавлена
Созданные поля:
Имя "${realSbcTitle}"
Тип категории "${DEFAULT_CTG_TYPE}"
Имя категории "${realCtgTitle}"
🆔 "${_[0].clearedData.id}"`,
      },
    ]));

  afterAll(() => destroyBotMockApp(appBotMock));
});
