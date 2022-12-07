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
  createDeletedCategory,
  createArchivedCategory,
} from '../../../db/models/categoryModel';
import {
  checkAddSubcategory,
  DEFAULT_LIST_SBC_LIMIT,
  printListSubcategories,
  createDeletedSubcategory,
  createArchivedSubcategory,
} from '../../../db/models/subcategoryModel';

import { toCommand, BotCommandEnum, toListHeader } from '../../helpers';
import { CommandParameterName, PARAMS_EQ } from '../../parameters';
import { parseUserDateTimeToUTC } from '../../datetime';
import { AppTestConfigT } from '../../../config/config';

describe('Check subcategories list command handlers', () => {
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

  const cmd_listsbc = toCommand(BotCommandEnum.listsbc);
  it(`"${cmd_listsbc}" should be resolved as empty subcategories list`, () =>
    testBotMsgsRes([
      {
        toSendText: cmd_listsbc,
        toBeText: () => `(лимит "30")
Нет подкатегорий`,
      },
    ]));

  const realCtgTitle = 'realCtgTitle';
  const realCtgTitle2 = 'realCtgTitle2';
  const realSbcTitle = '💩';
  const realSbcTitle2 = '🤖';
  it(`"${cmd_listsbc}" should print last subcategories`, () =>
    testBotMsgsRes([
      {
        toSendText: cmd_listsbc,
        prepareDB: async () => {
          serverNowDate = parseUserDateTimeToUTC(
            '2019.02.09 12:00',
            config.test.user_time_zone,
          );
          await appBotMock.db.subcategories.deleteAll({
            table_peer_id: chatId,
          });
          await appBotMock.db.categories.deleteAll({
            table_peer_id: chatId,
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
          await appBotMock.db.categories.add(
            { table_peer_id: chatId },
            composeAddCategory({
              title: realCtgTitle2,
              peer_id: chatId,
              created_by_user_id: userIdStr,
              created_at: serverNowDate
                ? new Date(serverNowDate.getTime() + 1)
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
                ? new Date(serverNowDate.getTime() + 2)
                : undefined,
            }),
          );
          await appBotMock.db.subcategories.add(
            { table_peer_id: chatId },
            checkAddSubcategory({
              title: realSbcTitle2,
              peer_id: chatId,
              category_id: dbCategory.id,
              created_by_user_id: userIdStr,
              created_at: serverNowDate
                ? new Date(serverNowDate.getTime() + 3)
                : undefined,
            }),
          );
          const dbSubcategoriesJoinCtg =
            await appBotMock.db.subcategories.findJoinCtg({
              table_peer_id: chatId,
              title: realSbcTitle,
              peer_id: chatId,
            });
          const dbSubcategoriesJoinCtg2 =
            await appBotMock.db.subcategories.findJoinCtg({
              table_peer_id: chatId,
              title: realSbcTitle2,
              peer_id: chatId,
            });
          return {
            dbSubcategoryJoinCtg2: dbSubcategoriesJoinCtg2[0],
            dbSubcategoryJoinCtg: dbSubcategoriesJoinCtg[0],
          };
        },
        toBeMessage: (_, { dbSubcategoryJoinCtg2, dbSubcategoryJoinCtg }) =>
          toListHeader(
            { limitNum: DEFAULT_LIST_SBC_LIMIT, sbcCount: 2 },
            new ToTranslate(TrKey.YOUR_SUBCATEGORIES, userLangCode, {
              text: printListSubcategories({
                subcategories: [dbSubcategoryJoinCtg2, dbSubcategoryJoinCtg],
              }),
            }),
            userLangCode,
          ),
      },
    ]));

  const realSbcTitle3 = '😁';
  const realSbcTitle4 = '🦂';
  const realSbcTitle5 = '🐍';
  const cmd_listsbc_l2c = `${cmd_listsbc} [${CommandParameterName.limit}${PARAMS_EQ}2]`;
  it(`"${cmd_listsbc_l2c}" should print last 2 subcategories and subcategories by category`, () =>
    testBotMsgsRes([
      {
        toSendText: cmd_listsbc_l2c,
        prepareDB: async () => {
          serverNowDate = parseUserDateTimeToUTC(
            '2019.02.09 12:00',
            config.test.user_time_zone,
          );
          await appBotMock.db.subcategories.deleteAll({
            table_peer_id: chatId,
          });
          await appBotMock.db.categories.deleteAll({
            table_peer_id: chatId,
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
          const dbCategory2 = await appBotMock.db.categories.add(
            { table_peer_id: chatId },
            composeAddCategory({
              title: realCtgTitle2,
              peer_id: chatId,
              created_by_user_id: userIdStr,
              created_at: serverNowDate
                ? new Date(serverNowDate.getTime() + 1)
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
                ? new Date(serverNowDate.getTime() + 2)
                : undefined,
            }),
          );
          await appBotMock.db.subcategories.add(
            { table_peer_id: chatId },
            checkAddSubcategory({
              title: realSbcTitle2,
              peer_id: chatId,
              category_id: dbCategory.id,
              created_by_user_id: userIdStr,
              created_at: serverNowDate
                ? new Date(serverNowDate.getTime() + 3)
                : undefined,
            }),
          );
          await appBotMock.db.subcategories.add(
            { table_peer_id: chatId },
            checkAddSubcategory({
              title: realSbcTitle3,
              peer_id: chatId,
              category_id: dbCategory2.id,
              created_by_user_id: userIdStr,
              created_at: serverNowDate
                ? new Date(serverNowDate.getTime() + 4)
                : undefined,
            }),
          );
          await appBotMock.db.subcategories.add(
            { table_peer_id: chatId },
            checkAddSubcategory({
              title: realSbcTitle4,
              peer_id: chatId,
              category_id: dbCategory2.id,
              created_by_user_id: userIdStr,
              created_at: serverNowDate
                ? new Date(serverNowDate.getTime() + 5)
                : undefined,
            }),
          );
          await appBotMock.db.subcategories.add(
            { table_peer_id: chatId },
            checkAddSubcategory({
              title: realSbcTitle5,
              peer_id: chatId,
              category_id: dbCategory2.id,
              created_by_user_id: userIdStr,
              created_at: serverNowDate
                ? new Date(serverNowDate.getTime() + 6)
                : undefined,
            }),
          );
          const dbSubcategoriesJoinCtg4 =
            await appBotMock.db.subcategories.findJoinCtg({
              table_peer_id: chatId,
              title: realSbcTitle4,
              peer_id: chatId,
            });
          const dbSubcategoriesJoinCtg5 =
            await appBotMock.db.subcategories.findJoinCtg({
              table_peer_id: chatId,
              title: realSbcTitle5,
              peer_id: chatId,
            });
          return {
            dbSubcategoryJoinCtg4: dbSubcategoriesJoinCtg4[0],
            dbSubcategoryJoinCtg5: dbSubcategoriesJoinCtg5[0],
          };
        },
        toBeMessage: (_, { dbSubcategoryJoinCtg4, dbSubcategoryJoinCtg5 }) =>
          toListHeader(
            { limitNum: 2 },
            new ToTranslate(TrKey.YOUR_SUBCATEGORIES, userLangCode, {
              text: printListSubcategories({
                subcategories: [dbSubcategoryJoinCtg5, dbSubcategoryJoinCtg4],
              }),
            }),
            userLangCode,
          ),
      },
      {
        toSendText: `${cmd_listsbc} [${CommandParameterName.limit}${PARAMS_EQ}1 ${CommandParameterName.query}${PARAMS_EQ}${realCtgTitle2}]`,
        toBeText: () => `(лимит "1")
(шаблон поиска "realCtgTitle2")
Ваши подкатегории:
🐍 ➡️ realCtgTitle2 num-`,
      },
    ]));

  const cmd_listsbc_l2c_s2c = `${cmd_listsbc} [${CommandParameterName.skip}${PARAMS_EQ}2 ${CommandParameterName.limit}${PARAMS_EQ}2]`;
  it(`"${cmd_listsbc_l2c_s2c}" should print last 2 subcategories and skip 2 subcategories`, () =>
    testBotMsgsRes([
      {
        toSendText: cmd_listsbc_l2c_s2c,
        prepareDB: async () => {
          serverNowDate = parseUserDateTimeToUTC(
            '2019.02.09 12:00',
            config.test.user_time_zone,
          );
          await appBotMock.db.subcategories.deleteAll({
            table_peer_id: chatId,
          });
          await appBotMock.db.categories.deleteAll({
            table_peer_id: chatId,
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
          await appBotMock.db.categories.add(
            { table_peer_id: chatId },
            composeAddCategory({
              title: realCtgTitle2,
              peer_id: chatId,
              created_by_user_id: userIdStr,
              created_at: serverNowDate
                ? new Date(serverNowDate.getTime() + 1)
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
                ? new Date(serverNowDate.getTime() + 2)
                : undefined,
            }),
          );
          await appBotMock.db.subcategories.add(
            { table_peer_id: chatId },
            checkAddSubcategory({
              title: realSbcTitle2,
              peer_id: chatId,
              category_id: dbCategory.id,
              created_by_user_id: userIdStr,
              created_at: serverNowDate
                ? new Date(serverNowDate.getTime() + 3)
                : undefined,
            }),
          );
          await appBotMock.db.subcategories.add(
            { table_peer_id: chatId },
            checkAddSubcategory({
              title: realSbcTitle3,
              peer_id: chatId,
              category_id: dbCategory.id,
              created_by_user_id: userIdStr,
              created_at: serverNowDate
                ? new Date(serverNowDate.getTime() + 4)
                : undefined,
            }),
          );
          await appBotMock.db.subcategories.add(
            { table_peer_id: chatId },
            checkAddSubcategory({
              title: realSbcTitle4,
              peer_id: chatId,
              category_id: dbCategory.id,
              created_by_user_id: userIdStr,
              created_at: serverNowDate
                ? new Date(serverNowDate.getTime() + 5)
                : undefined,
            }),
          );
          await appBotMock.db.subcategories.add(
            { table_peer_id: chatId },
            checkAddSubcategory({
              title: realSbcTitle5,
              peer_id: chatId,
              category_id: dbCategory.id,
              created_by_user_id: userIdStr,
              created_at: serverNowDate
                ? new Date(serverNowDate.getTime() + 6)
                : undefined,
            }),
          );
          const dbSubcategoriesJoinCtg2 =
            await appBotMock.db.subcategories.findJoinCtg({
              table_peer_id: chatId,
              title: realSbcTitle2,
              peer_id: chatId,
            });
          const dbSubcategoriesJoinCtg3 =
            await appBotMock.db.subcategories.findJoinCtg({
              table_peer_id: chatId,
              title: realSbcTitle3,
              peer_id: chatId,
            });
          return {
            dbSubcategoryJoinCtg3: dbSubcategoriesJoinCtg3[0],
            dbSubcategoryJoinCtg2: dbSubcategoriesJoinCtg2[0],
          };
        },
        toBeMessage: (_, { dbSubcategoryJoinCtg3, dbSubcategoryJoinCtg2 }) =>
          toListHeader(
            { limitNum: 2, skipNum: 2 },
            new ToTranslate(TrKey.YOUR_SUBCATEGORIES, userLangCode, {
              text: printListSubcategories({
                subcategories: [dbSubcategoryJoinCtg3, dbSubcategoryJoinCtg2],
              }),
            }),
            userLangCode,
          ),
      },
    ]));

  const cmd_listsbc_s2c_id = `${cmd_listsbc} [${CommandParameterName.skip}${PARAMS_EQ}2 ${CommandParameterName.showId}${PARAMS_EQ}t]`;
  it(`"${cmd_listsbc_s2c_id}" should print last 2 subcategories and skip 2 subcategories and print deleted subcategories`, () =>
    testBotMsgsRes([
      {
        toSendText: cmd_listsbc_s2c_id,
        prepareDB: async () => {
          serverNowDate = parseUserDateTimeToUTC(
            '2019.02.09 12:00',
            config.test.user_time_zone,
          );
          await appBotMock.db.subcategories.deleteAll({
            table_peer_id: chatId,
          });
          await appBotMock.db.categories.deleteAll({
            table_peer_id: chatId,
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
          const delDbCategory2 = await appBotMock.db.categories.add(
            { table_peer_id: chatId },
            createDeletedCategory({
              title: realCtgTitle,
              peer_id: chatId,
              created_by_user_id: userIdStr,
              created_at: serverNowDate
                ? new Date(serverNowDate.getTime() + 1)
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
                ? new Date(serverNowDate.getTime() + 2)
                : undefined,
            }),
          );
          await appBotMock.db.subcategories.add(
            { table_peer_id: chatId },
            checkAddSubcategory({
              title: realSbcTitle2,
              peer_id: chatId,
              category_id: dbCategory.id,
              created_by_user_id: userIdStr,
              created_at: serverNowDate
                ? new Date(serverNowDate.getTime() + 3)
                : undefined,
            }),
          );
          await appBotMock.db.subcategories.add(
            { table_peer_id: chatId },
            checkAddSubcategory({
              title: realSbcTitle3,
              peer_id: chatId,
              category_id: delDbCategory2.id,
              created_by_user_id: userIdStr,
              created_at: serverNowDate
                ? new Date(serverNowDate.getTime() + 4)
                : undefined,
            }),
          );
          await appBotMock.db.subcategories.add(
            { table_peer_id: chatId },
            createDeletedSubcategory({
              title: realSbcTitle4,
              peer_id: chatId,
              category_id: delDbCategory2.id,
              created_by_user_id: userIdStr,
              created_at: serverNowDate
                ? new Date(serverNowDate.getTime() + 5)
                : undefined,
            }),
          );
          await appBotMock.db.subcategories.add(
            { table_peer_id: chatId },
            createArchivedSubcategory({
              title: `${realSbcTitle4}arch`,
              peer_id: chatId,
              category_id: delDbCategory2.id,
              created_by_user_id: userIdStr,
              created_at: serverNowDate
                ? new Date(serverNowDate.getTime() + 6)
                : undefined,
            }),
          );
          await appBotMock.db.subcategories.add(
            { table_peer_id: chatId },
            createDeletedSubcategory({
              title: realSbcTitle5,
              peer_id: chatId,
              category_id: delDbCategory2.id,
              created_by_user_id: userIdStr,
              created_at: serverNowDate
                ? new Date(serverNowDate.getTime() + 7)
                : undefined,
            }),
          );
          const dbSubcategoriesJoinCtg =
            await appBotMock.db.subcategories.findJoinCtg({
              table_peer_id: chatId,
              title: realSbcTitle,
              peer_id: chatId,
            });
          const dbSubcategoriesJoinCtg4 =
            await appBotMock.db.subcategories.findJoinCtg({
              table_peer_id: chatId,
              title: realSbcTitle4,
              peer_id: chatId,
              in_deleted: true,
            });
          return {
            dbSubcategoryJoinCtg4: dbSubcategoriesJoinCtg4[0],
            dbSubcategoryJoinCtg: dbSubcategoriesJoinCtg[0],
          };
        },
        toBeMessage: (_, { dbSubcategoryJoinCtg }) =>
          toListHeader(
            {
              limitNum: DEFAULT_LIST_SBC_LIMIT,
              skipNum: 2,
              showId: true,
              sbcCount: 1,
            },
            new ToTranslate(TrKey.YOUR_SUBCATEGORIES, userLangCode, {
              text: printListSubcategories({
                subcategories: [dbSubcategoryJoinCtg],
                showId: true,
              }),
            }),
            userLangCode,
          ),
      },
      {
        toSendText: `${cmd_listsbc} [${CommandParameterName.showDeleted}${PARAMS_EQ}t ${CommandParameterName.skip}${PARAMS_EQ}1]`,
        toBeMessage: (_) =>
          toListHeader(
            {
              limitNum: DEFAULT_LIST_SBC_LIMIT,
              skipNum: 1,
              showDeleted: true,
              sbcCount: 1,
            },
            new ToTranslate(TrKey.YOUR_SUBCATEGORIES, userLangCode, {
              text: printListSubcategories({
                subcategories: [_[0].preparedData.dbSubcategoryJoinCtg4],
              }),
            }),
            userLangCode,
          ),
      },
      {
        toSendText: `${cmd_listsbc} [${CommandParameterName.showDeleted}${PARAMS_EQ}t ${CommandParameterName.query}${PARAMS_EQ}"${realSbcTitle4}"]`,
        toBeMessage: (_) =>
          toListHeader(
            {
              limitNum: DEFAULT_LIST_SBC_LIMIT,
              showDeleted: true,
              query: realSbcTitle4,
              sbcCount: 1,
            },
            new ToTranslate(TrKey.YOUR_SUBCATEGORIES, userLangCode, {
              text: printListSubcategories({
                subcategories: [_[0].preparedData.dbSubcategoryJoinCtg4],
              }),
            }),
            userLangCode,
          ),
      },
    ]));

  const cmd_listsbc_arch = `${cmd_listsbc} [${CommandParameterName.showArchived}${PARAMS_EQ}t]`;
  it(`"${cmd_listsbc_arch}" should print archived subcategories`, () =>
    testBotMsgsRes([
      {
        toSendText: cmd_listsbc_arch,
        prepareDB: async () => {
          serverNowDate = parseUserDateTimeToUTC(
            '2019.02.09 12:00',
            config.test.user_time_zone,
          );
          await appBotMock.db.subcategories.deleteAll({
            table_peer_id: chatId,
          });
          await appBotMock.db.categories.deleteAll({
            table_peer_id: chatId,
          });
          const dbCategory1 = await appBotMock.db.categories.add(
            { table_peer_id: chatId },
            createArchivedCategory({
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
            createArchivedSubcategory({
              title: realSbcTitle,
              peer_id: chatId,
              category_id: dbCategory1.id,
              created_by_user_id: userIdStr,
              created_at: serverNowDate
                ? new Date(serverNowDate.getTime() + 1)
                : undefined,
            }),
          );

          const dbSubcategoriesJoinCtg1 =
            await appBotMock.db.subcategories.findJoinCtg({
              table_peer_id: chatId,
              title: realSbcTitle,
              peer_id: chatId,
              in_archived: true,
            });
          return {
            dbSbcJoinCtg1: dbSubcategoriesJoinCtg1[0],
          };
        },
        toBeMessage: (_, { dbSbcJoinCtg1 }) =>
          toListHeader(
            {
              limitNum: DEFAULT_LIST_SBC_LIMIT,
              showArchived: true,
              sbcCount: 1,
            },
            new ToTranslate(TrKey.YOUR_SUBCATEGORIES, userLangCode, {
              text: printListSubcategories({
                subcategories: [dbSbcJoinCtg1],
              }),
            }),
            userLangCode,
          ),
      },
      {
        toSendText: `${cmd_listsbc}`,
        toBeText: () => `(лимит "30")
Нет подкатегорий`,
      },
    ]));

  const desc_srch = 'ss';
  const cmd_listsbc_desc = `${cmd_listsbc} [${CommandParameterName.query}${PARAMS_EQ}${desc_srch}]`;
  it(`"${cmd_listsbc_desc}" should print subcategories found by query`, () =>
    testBotMsgsRes([
      {
        toSendText: cmd_listsbc_desc,
        prepareDB: async () => {
          serverNowDate = parseUserDateTimeToUTC(
            '2019.02.09 12:00',
            config.test.user_time_zone,
          );
          await appBotMock.db.subcategories.deleteAll({
            table_peer_id: chatId,
          });
          await appBotMock.db.categories.deleteAll({
            table_peer_id: chatId,
          });
          const dbCategory1 = await appBotMock.db.categories.add(
            { table_peer_id: chatId },
            composeAddCategory({
              title: realCtgTitle,
              peer_id: chatId,
              created_by_user_id: userIdStr,
              description: 'deleted! ddd d',
              created_at: serverNowDate
                ? new Date(serverNowDate.getTime())
                : undefined,
            }),
          );
          const dbCategory2 = await appBotMock.db.categories.add(
            { table_peer_id: chatId },
            composeAddCategory({
              title: realCtgTitle2,
              peer_id: chatId,
              created_by_user_id: userIdStr,
              description: 'yo ho ho! yooo',
              created_at: serverNowDate
                ? new Date(serverNowDate.getTime() + 1)
                : undefined,
            }),
          );
          const dbSbc2 = await appBotMock.db.subcategories.add(
            { table_peer_id: chatId },
            checkAddSubcategory({
              title: realSbcTitle2,
              peer_id: chatId,
              category_id: dbCategory1.id,
              created_by_user_id: userIdStr,
              description: 'ss dd',
              created_at: serverNowDate
                ? new Date(serverNowDate.getTime() + 2)
                : undefined,
            }),
          );
          await appBotMock.db.subcategories.add(
            { table_peer_id: chatId },
            checkAddSubcategory({
              title: realSbcTitle3,
              peer_id: chatId,
              category_id: dbCategory2.id,
              created_by_user_id: userIdStr,
              description: 'asdf ss fgh',
              created_at: serverNowDate
                ? new Date(serverNowDate.getTime() + 3)
                : undefined,
            }),
          );

          const dbSubcategoriesJoinCtg2 =
            await appBotMock.db.subcategories.findJoinCtg({
              table_peer_id: chatId,
              title: realSbcTitle2,
              peer_id: chatId,
            });
          const dbSubcategoriesJoinCtg3 =
            await appBotMock.db.subcategories.findJoinCtg({
              table_peer_id: chatId,
              title: realSbcTitle3,
              peer_id: chatId,
            });
          return {
            dbSubcategoryJoinCtg2: dbSubcategoriesJoinCtg2[0],
            dbSubcategoryJoinCtg3: dbSubcategoriesJoinCtg3[0],
            dbSbc2,
          };
        },
        toBeMessage: (_, { dbSubcategoryJoinCtg2, dbSubcategoryJoinCtg3 }) =>
          toListHeader(
            { limitNum: DEFAULT_LIST_SBC_LIMIT, query: desc_srch, sbcCount: 2 },
            new ToTranslate(TrKey.YOUR_SUBCATEGORIES, userLangCode, {
              text: printListSubcategories({
                subcategories: [dbSubcategoryJoinCtg3, dbSubcategoryJoinCtg2],
              }),
            }),
            userLangCode,
          ),
      },
      {
        toSendText: `${cmd_listsbc} [${CommandParameterName.query}${PARAMS_EQ}delllleted]`,
        toBeText: () => `(лимит "30")
(шаблон поиска "delllleted")
Нет подкатегорий`,
      },
      {
        toSendText: `${cmd_listsbc} [${CommandParameterName.showId}${PARAMS_EQ}t ${CommandParameterName.query}${PARAMS_EQ}deleted]`,
        toBeText: (_) => `(лимит "30")
(показывать id)
(шаблон поиска "deleted")
(количество подкатегорий "1")
Ваши подкатегории:
🆔${_[0].preparedData.dbSbc2.id} 🤖 "ss dd" ➡️ realCtgTitle num-`,
      },
    ]));

  it(`should print category/subcategory found by query`, () =>
    testBotMsgsRes([
      {
        toSendText: `${cmd_listsbc} [${CommandParameterName.ctgQuery}${PARAMS_EQ}ho-ho-ctg]`,
        prepareDB: async () => {
          serverNowDate = parseUserDateTimeToUTC(
            '2019.02.09 12:00',
            config.test.user_time_zone,
          );
          await appBotMock.db.subcategories.deleteAll({
            table_peer_id: chatId,
          });
          await appBotMock.db.categories.deleteAll({
            table_peer_id: chatId,
          });
          const dbCategory1 = await appBotMock.db.categories.add(
            { table_peer_id: chatId },
            composeAddCategory({
              title: 'ho-ho-ctg-1',
              peer_id: chatId,
              created_by_user_id: userIdStr,
              description: 'yo ho-ho-ctg-2',
              created_at: serverNowDate
                ? new Date(serverNowDate.getTime())
                : undefined,
            }),
          );
          const dbCategory2 = await appBotMock.db.categories.add(
            { table_peer_id: chatId },
            composeAddCategory({
              title: 'ho-ho-ctg-2',
              peer_id: chatId,
              created_by_user_id: userIdStr,
              description: 'yo ho-ho-sbc-2',
              created_at: serverNowDate
                ? new Date(serverNowDate.getTime() + 1)
                : undefined,
            }),
          );
          const dbCategory3 = await appBotMock.db.categories.add(
            { table_peer_id: chatId },
            composeAddCategory({
              title: 'ho-ho-ctg-3',
              peer_id: chatId,
              created_by_user_id: userIdStr,
              created_at: serverNowDate
                ? new Date(serverNowDate.getTime() + 1)
                : undefined,
            }),
          );
          await appBotMock.db.subcategories.add(
            { table_peer_id: chatId },
            checkAddSubcategory({
              title: 'ho-ho-sbc-1',
              peer_id: chatId,
              category_id: dbCategory1.id,
              created_by_user_id: userIdStr,
              description: 'ss dd',
              created_at: serverNowDate
                ? new Date(serverNowDate.getTime() + 2)
                : undefined,
            }),
          );
          await appBotMock.db.subcategories.add(
            { table_peer_id: chatId },
            checkAddSubcategory({
              title: 'ho-ho-sbc-2',
              peer_id: chatId,
              category_id: dbCategory2.id,
              created_by_user_id: userIdStr,
              created_at: serverNowDate
                ? new Date(serverNowDate.getTime() + 3)
                : undefined,
            }),
          );
          await appBotMock.db.subcategories.add(
            { table_peer_id: chatId },
            checkAddSubcategory({
              title: 'ho-ho-sbc-3',
              peer_id: chatId,
              category_id: dbCategory3.id,
              created_by_user_id: userIdStr,
              created_at: serverNowDate
                ? new Date(serverNowDate.getTime() + 3)
                : undefined,
            }),
          );
        },
        toBeText: () => `(лимит "30")
(поиск по категориям "ho-ho-ctg")
(количество подкатегорий "3")
Ваши подкатегории:
ho-ho-sbc-2 ➡️ ho-ho-ctg-2 num-
ho-ho-sbc-3 ➡️ ho-ho-ctg-3 num-
ho-ho-sbc-1 "ss dd" ➡️ ho-ho-ctg-1 num-`,
      },
      {
        toSendText: `${cmd_listsbc} [${CommandParameterName.ctgQuery}${PARAMS_EQ}ho-ho-ctg-2]`,
        toBeText: () => `(лимит "30")
(поиск по категориям "ho-ho-ctg-2")
(количество подкатегорий "2")
Ваши подкатегории:
ho-ho-sbc-2 ➡️ ho-ho-ctg-2 num-
ho-ho-sbc-1 "ss dd" ➡️ ho-ho-ctg-1 num-`,
      },
      {
        toSendText: `${cmd_listsbc} [${CommandParameterName.sbcQuery}${PARAMS_EQ}ho-ho-sbc]`,
        toBeText: () => `(лимит "30")
(поиск по подкатегориям "ho-ho-sbc")
(количество подкатегорий "3")
Ваши подкатегории:
ho-ho-sbc-2 ➡️ ho-ho-ctg-2 num-
ho-ho-sbc-3 ➡️ ho-ho-ctg-3 num-
ho-ho-sbc-1 "ss dd" ➡️ ho-ho-ctg-1 num-`,
      },
      {
        toSendText: `${cmd_listsbc} [${CommandParameterName.sbcQuery}${PARAMS_EQ}ho-ho-sbc-2]`,
        toBeText: () => `(лимит "30")
(поиск по подкатегориям "ho-ho-sbc-2")
(количество подкатегорий "1")
Ваши подкатегории:
ho-ho-sbc-2 ➡️ ho-ho-ctg-2 num-`,
      },
    ]));

  it(`"${cmd_listsbc} ho-ho-ctg" should print categories/subcategories found by query text`, () =>
    testBotMsgsRes([
      {
        toSendText: `${cmd_listsbc} ho-ho-ctg`,
        prepareDB: async () => {
          serverNowDate = parseUserDateTimeToUTC(
            '2019.02.09 12:00',
            config.test.user_time_zone,
          );
          await appBotMock.db.subcategories.deleteAll({
            table_peer_id: chatId,
          });
          await appBotMock.db.categories.deleteAll({
            table_peer_id: chatId,
          });
          const dbCategory1 = await appBotMock.db.categories.add(
            { table_peer_id: chatId },
            composeAddCategory({
              title: 'ho-ho-ctg-1',
              peer_id: chatId,
              created_by_user_id: userIdStr,
              description: 'yo ho-ho-ctg-2',
              created_at: serverNowDate
                ? new Date(serverNowDate.getTime())
                : undefined,
            }),
          );
          const dbCategory2 = await appBotMock.db.categories.add(
            { table_peer_id: chatId },
            composeAddCategory({
              title: 'ho-ho-ctg-2',
              peer_id: chatId,
              created_by_user_id: userIdStr,
              description: 'yo ho-ho-sbc-2',
              created_at: serverNowDate
                ? new Date(serverNowDate.getTime() + 1)
                : undefined,
            }),
          );
          const dbCategory3 = await appBotMock.db.categories.add(
            { table_peer_id: chatId },
            composeAddCategory({
              title: 'ho-ho-ctg-3',
              peer_id: chatId,
              created_by_user_id: userIdStr,
              created_at: serverNowDate
                ? new Date(serverNowDate.getTime() + 1)
                : undefined,
            }),
          );
          await appBotMock.db.subcategories.add(
            { table_peer_id: chatId },
            checkAddSubcategory({
              title: 'ho-ho-sbc-1',
              peer_id: chatId,
              category_id: dbCategory1.id,
              created_by_user_id: userIdStr,
              description: 'ss dd',
              created_at: serverNowDate
                ? new Date(serverNowDate.getTime() + 2)
                : undefined,
            }),
          );
          await appBotMock.db.subcategories.add(
            { table_peer_id: chatId },
            checkAddSubcategory({
              title: 'ho-ho-sbc-2',
              peer_id: chatId,
              category_id: dbCategory2.id,
              created_by_user_id: userIdStr,
              created_at: serverNowDate
                ? new Date(serverNowDate.getTime() + 3)
                : undefined,
            }),
          );
          await appBotMock.db.subcategories.add(
            { table_peer_id: chatId },
            checkAddSubcategory({
              title: 'ho-ho-sbc-3',
              peer_id: chatId,
              category_id: dbCategory3.id,
              created_by_user_id: userIdStr,
              created_at: serverNowDate
                ? new Date(serverNowDate.getTime() + 3)
                : undefined,
            }),
          );
        },
        toBeText: () => `(лимит "30")
(шаблон поиска "ho-ho-ctg")
(количество подкатегорий "3")
Ваши подкатегории:
ho-ho-sbc-2 ➡️ ho-ho-ctg-2 num-
ho-ho-sbc-3 ➡️ ho-ho-ctg-3 num-
ho-ho-sbc-1 "ss dd" ➡️ ho-ho-ctg-1 num-`,
      },
      {
        toSendText: `${cmd_listsbc} ho-ho-sbc-2`,
        toBeText: () => `(лимит "30")
(шаблон поиска "ho-ho-sbc-2")
(количество подкатегорий "1")
Ваши подкатегории:
ho-ho-sbc-2 ➡️ ho-ho-ctg-2 num-`,
      },
    ]));

  const sbclist_amb_failures = [
    {
      parName: CommandParameterName.query,
    },
    {
      parName: CommandParameterName.ctgQuery,
    },
    {
      parName: CommandParameterName.sbcQuery,
    },
    {
      parName: CommandParameterName.ctgQueryTitle,
    },
    {
      parName: CommandParameterName.ctgQueryDescr,
    },
    {
      parName: CommandParameterName.sbcQueryTitle,
    },
    {
      parName: CommandParameterName.sbcQueryDescr,
    },
  ];
  for (const sbclist_amb_failure of sbclist_amb_failures) {
    const { parName } = sbclist_amb_failure;
    const cmd = `${cmd_listsbc} hoho [${parName}=hoho]`;
    it(`"${cmd}" should be rejected as of query parameter and text at the same time`, () =>
      testBotMsgsRes([
        {
          toSendText: cmd,
          toBeMessage: new ToTranslate(
            TrKey.PARAM_AMBIGUOUS_ERROR,
            userLangCode,
            {
              parName,
            },
          ),
        },
      ]));
  }

  it(`should print category/subcategory found by query title/description`, () =>
    testBotMsgsRes([
      {
        toSendText: `${cmd_listsbc} [${CommandParameterName.ctgQueryTitle}${PARAMS_EQ}ho-ho-ctg]`,
        prepareDB: async () => {
          serverNowDate = parseUserDateTimeToUTC(
            '2019.02.09 12:00',
            config.test.user_time_zone,
          );
          await appBotMock.db.subcategories.deleteAll({
            table_peer_id: chatId,
          });
          await appBotMock.db.categories.deleteAll({
            table_peer_id: chatId,
          });
          const dbCategory1 = await appBotMock.db.categories.add(
            { table_peer_id: chatId },
            composeAddCategory({
              title: 'ho-ho-ctg-1',
              peer_id: chatId,
              created_by_user_id: userIdStr,
              description: 'yo ho-ho-ctg-2',
              created_at: serverNowDate
                ? new Date(serverNowDate.getTime())
                : undefined,
            }),
          );
          const dbCategory2 = await appBotMock.db.categories.add(
            { table_peer_id: chatId },
            composeAddCategory({
              title: 'ho-ho-ctg-2',
              peer_id: chatId,
              created_by_user_id: userIdStr,
              description: 'yo ho-ho-sbc-2',
              created_at: serverNowDate
                ? new Date(serverNowDate.getTime() + 1)
                : undefined,
            }),
          );
          const dbCategory3 = await appBotMock.db.categories.add(
            { table_peer_id: chatId },
            composeAddCategory({
              title: 'ho-ho-ctg-3',
              peer_id: chatId,
              created_by_user_id: userIdStr,
              created_at: serverNowDate
                ? new Date(serverNowDate.getTime() + 1)
                : undefined,
            }),
          );
          await appBotMock.db.subcategories.add(
            { table_peer_id: chatId },
            checkAddSubcategory({
              title: 'ho-ho-sbc-1',
              peer_id: chatId,
              category_id: dbCategory1.id,
              created_by_user_id: userIdStr,
              description: 'yo ho-ho-ctg-...',
              created_at: serverNowDate
                ? new Date(serverNowDate.getTime() + 2)
                : undefined,
            }),
          );
          await appBotMock.db.subcategories.add(
            { table_peer_id: chatId },
            checkAddSubcategory({
              title: 'ho-ho-sbc-2',
              peer_id: chatId,
              category_id: dbCategory2.id,
              created_by_user_id: userIdStr,
              created_at: serverNowDate
                ? new Date(serverNowDate.getTime() + 3)
                : undefined,
            }),
          );
          await appBotMock.db.subcategories.add(
            { table_peer_id: chatId },
            checkAddSubcategory({
              title: 'ho-ho-sbc-3',
              peer_id: chatId,
              category_id: dbCategory3.id,
              created_by_user_id: userIdStr,
              description: 'yo ho-ho-ctg--...',
              created_at: serverNowDate
                ? new Date(serverNowDate.getTime() + 3)
                : undefined,
            }),
          );
        },
        toBeText: () => `(лимит "30")
(поиск по названию категорий "ho-ho-ctg")
(количество подкатегорий "3")
Ваши подкатегории:
ho-ho-sbc-2 ➡️ ho-ho-ctg-2 num-
ho-ho-sbc-3 "yo ho-ho-ctg--..." ➡️ ho-ho-ctg-3 num-
ho-ho-sbc-1 "yo ho-ho-ctg-..." ➡️ ho-ho-ctg-1 num-`,
      },
      {
        toSendText: `${cmd_listsbc} [${CommandParameterName.ctgQueryDescr}${PARAMS_EQ}"yo ho-ho"]`,
        toBeText: () => `(лимит "30")
(поиск по описанию категорий "yo ho-ho")
(количество подкатегорий "2")
Ваши подкатегории:
ho-ho-sbc-2 ➡️ ho-ho-ctg-2 num-
ho-ho-sbc-1 "yo ho-ho-ctg-..." ➡️ ho-ho-ctg-1 num-`,
      },
      {
        toSendText: `${cmd_listsbc} [${CommandParameterName.sbcQueryTitle}${PARAMS_EQ}ho-ho-sbc-3]`,
        toBeText: () => `(лимит "30")
(поиск по названию подкатегорий "ho-ho-sbc-3")
(количество подкатегорий "1")
Ваши подкатегории:
ho-ho-sbc-3 "yo ho-ho-ctg--..." ➡️ ho-ho-ctg-3 num-`,
      },
      {
        toSendText: `${cmd_listsbc} [${CommandParameterName.sbcQueryDescr}${PARAMS_EQ}"yo ho-ho-ctg-"]`,
        toBeText: () => `(лимит "30")
(поиск по описанию подкатегорий "yo ho-ho-ctg-")
(количество подкатегорий "2")
Ваши подкатегории:
ho-ho-sbc-3 "yo ho-ho-ctg--..." ➡️ ho-ho-ctg-3 num-
ho-ho-sbc-1 "yo ho-ho-ctg-..." ➡️ ho-ho-ctg-1 num-`,
      },
    ]));

  it(`should print category/subcategory found by query id`, () =>
    testBotMsgsRes([
      {
        toSendText: `${cmd_listsbc} [${CommandParameterName.showId}${PARAMS_EQ}t]`,
        prepareDB: async () => {
          serverNowDate = parseUserDateTimeToUTC(
            '2019.02.09 12:00',
            config.test.user_time_zone,
          );
          await appBotMock.db.subcategories.deleteAll({
            table_peer_id: chatId,
          });
          await appBotMock.db.categories.deleteAll({
            table_peer_id: chatId,
          });
          const dbCategory1 = await appBotMock.db.categories.add(
            { table_peer_id: chatId },
            composeAddCategory({
              title: 'ctg-1',
              peer_id: chatId,
              created_by_user_id: userIdStr,
              created_at: serverNowDate
                ? new Date(serverNowDate.getTime() + 3)
                : undefined,
            }),
          );
          const dbCategory2 = await appBotMock.db.categories.add(
            { table_peer_id: chatId },
            composeAddCategory({
              title: 'ctg-2',
              peer_id: chatId,
              created_by_user_id: userIdStr,
              created_at: serverNowDate
                ? new Date(serverNowDate.getTime() + 2)
                : undefined,
            }),
          );
          const dbCategory3 = await appBotMock.db.categories.add(
            { table_peer_id: chatId },
            composeAddCategory({
              title: 'ctg-3',
              peer_id: chatId,
              created_by_user_id: userIdStr,
              created_at: serverNowDate
                ? new Date(serverNowDate.getTime() + 1)
                : undefined,
            }),
          );
          const dbSubategory1 = await appBotMock.db.subcategories.add(
            { table_peer_id: chatId },
            checkAddSubcategory({
              title: 'sbc-1',
              peer_id: chatId,
              category_id: dbCategory1.id,
              created_by_user_id: userIdStr,
              created_at: serverNowDate
                ? new Date(serverNowDate.getTime() + 3)
                : undefined,
            }),
          );
          const dbSubategory2 = await appBotMock.db.subcategories.add(
            { table_peer_id: chatId },
            checkAddSubcategory({
              title: 'sbc-2',
              peer_id: chatId,
              category_id: dbCategory2.id,
              created_by_user_id: userIdStr,
              created_at: serverNowDate
                ? new Date(serverNowDate.getTime() + 2)
                : undefined,
            }),
          );
          const dbSubategory3 = await appBotMock.db.subcategories.add(
            { table_peer_id: chatId },
            checkAddSubcategory({
              title: 'sbc-3',
              peer_id: chatId,
              category_id: dbCategory3.id,
              created_by_user_id: userIdStr,
              created_at: serverNowDate
                ? new Date(serverNowDate.getTime() + 1)
                : undefined,
            }),
          );

          const dbCtg1 = await appBotMock.db.categories.findOneById({
            table_peer_id: chatId,
            peer_id: chatId,
            id: dbCategory1.id,
          });
          const dbCtg2 = await appBotMock.db.categories.findOneById({
            table_peer_id: chatId,
            peer_id: chatId,
            id: dbCategory2.id,
          });
          const dbCtg3 = await appBotMock.db.categories.findOneById({
            table_peer_id: chatId,
            peer_id: chatId,
            id: dbCategory3.id,
          });
          const dbSbc1 = await appBotMock.db.subcategories.findOneById({
            table_peer_id: chatId,
            peer_id: chatId,
            id: dbSubategory1.id,
          });
          const dbSbc2 = await appBotMock.db.subcategories.findOneById({
            table_peer_id: chatId,
            peer_id: chatId,
            id: dbSubategory2.id,
          });
          const dbSbc3 = await appBotMock.db.subcategories.findOneById({
            table_peer_id: chatId,
            peer_id: chatId,
            id: dbSubategory3.id,
          });
          return { dbCtg1, dbCtg2, dbCtg3, dbSbc1, dbSbc2, dbSbc3 };
        },
        toBeText: (_) => `(лимит "30")
(показывать id)
(количество подкатегорий "3")
Ваши подкатегории:
🆔${_[0].preparedData.dbSbc1.id} sbc-1 ➡️ ctg-1 num-
🆔${_[0].preparedData.dbSbc2.id} sbc-2 ➡️ ctg-2 num-
🆔${_[0].preparedData.dbSbc3.id} sbc-3 ➡️ ctg-3 num-`,
      },
      {
        toSendText: (_) =>
          `${cmd_listsbc} [${CommandParameterName.ctgQueryIdGreaterThan}${PARAMS_EQ}${_[0].preparedData.dbCtg2.id}]`,
        toBeText: (_) => `(лимит "30")
(поиск по категориям id которых больше чем "${_[0].preparedData.dbCtg2.id}")
(количество подкатегорий "1")
Ваши подкатегории:
sbc-3 ➡️ ctg-3 num-`,
      },
      {
        toSendText: (_) =>
          `${cmd_listsbc} [${CommandParameterName.ctgQueryIdGreaterThanOrEq}${PARAMS_EQ}${_[0].preparedData.dbCtg3.id}]`,
        toBeText: (_) => `(лимит "30")
(поиск по категориям id которых больше чем или равно "${_[0].preparedData.dbCtg3.id}")
(количество подкатегорий "1")
Ваши подкатегории:
sbc-3 ➡️ ctg-3 num-`,
      },
      {
        toSendText: (_) =>
          `${cmd_listsbc} [${CommandParameterName.ctgQueryIdLessThan}${PARAMS_EQ}${_[0].preparedData.dbCtg3.id}]`,
        toBeText: (_) => `(лимит "30")
(поиск по категориям id которых меньше чем "${_[0].preparedData.dbCtg3.id}")
(количество подкатегорий "2")
Ваши подкатегории:
sbc-1 ➡️ ctg-1 num-
sbc-2 ➡️ ctg-2 num-`,
      },
      {
        toSendText: (_) =>
          `${cmd_listsbc} [${CommandParameterName.ctgQueryIdLessThanOrEq}${PARAMS_EQ}${_[0].preparedData.dbCtg3.id}]`,
        toBeText: (_) => `(лимит "30")
(поиск по категориям id которых меньше чем или равно "${_[0].preparedData.dbCtg3.id}")
(количество подкатегорий "3")
Ваши подкатегории:
sbc-1 ➡️ ctg-1 num-
sbc-2 ➡️ ctg-2 num-
sbc-3 ➡️ ctg-3 num-`,
      },
      {
        toSendText: (_) =>
          `${cmd_listsbc} [${CommandParameterName.sbcQueryIdGreaterThan}${PARAMS_EQ}${_[0].preparedData.dbSbc2.id}]`,
        toBeText: (_) => `(лимит "30")
(поиск по подкатегориям id которых больше чем "${_[0].preparedData.dbSbc2.id}")
(количество подкатегорий "1")
Ваши подкатегории:
sbc-3 ➡️ ctg-3 num-`,
      },
      {
        toSendText: (_) =>
          `${cmd_listsbc} [${CommandParameterName.sbcQueryIdGreaterThanOrEq}${PARAMS_EQ}${_[0].preparedData.dbSbc3.id}]`,
        toBeText: (_) => `(лимит "30")
(поиск по подкатегориям id которых больше чем или равно "${_[0].preparedData.dbSbc3.id}")
(количество подкатегорий "1")
Ваши подкатегории:
sbc-3 ➡️ ctg-3 num-`,
      },
      {
        toSendText: (_) =>
          `${cmd_listsbc} [${CommandParameterName.sbcQueryIdLessThan}${PARAMS_EQ}${_[0].preparedData.dbSbc1.id}]`,
        toBeText: (_) => `(лимит "30")
(поиск по подкатегориям id которых меньше чем "${_[0].preparedData.dbSbc1.id}")
Нет подкатегорий`,
      },
      {
        toSendText: (_) =>
          `${cmd_listsbc} [${CommandParameterName.sbcQueryIdLessThanOrEq}${PARAMS_EQ}${_[0].preparedData.dbSbc1.id}]`,
        toBeText: (_) => `(лимит "30")
(поиск по подкатегориям id которых меньше чем или равно "${_[0].preparedData.dbSbc1.id}")
(количество подкатегорий "1")
Ваши подкатегории:
sbc-1 ➡️ ctg-1 num-`,
      },
    ]));

  afterAll(() => destroyBotMockApp(appBotMock));
});
