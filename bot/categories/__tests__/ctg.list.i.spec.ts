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
  DEFAULT_LIST_CTG_LIMIT,
  printListCategories,
  createDeletedCategory,
  createArchivedCategory,
} from '../../../db/models/categoryModel';
import {
  checkAddSubcategory,
  createDeletedSubcategory,
  createArchivedSubcategory,
} from '../../../db/models/subcategoryModel';

import { toCommand, BotCommandEnum, toListHeader } from '../../helpers';
import { CommandParameterName, PARAMS_EQ } from '../../parameters';
import { parseUserDateTimeToUTC } from '../../datetime';
import { AppTestConfigT } from '../../../config/config';

describe('Check catigories list command handlers', () => {
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

  const cmd_listctg = toCommand(BotCommandEnum.listctg);
  it(`"${cmd_listctg}" should be resolved as empty categories list`, () =>
    testBotMsgsRes([
      {
        toSendText: cmd_listctg,
        toBeText: () => `(лимит "30")
Нет категорий`,
      },
    ]));

  const realCtgTitle = 'realCtgTitle';
  const realCtgTitle2 = 'realCtgTitle2';
  const realSbcTitle = '💩';
  const realSbcTitle2 = '🤖';
  it(`"${cmd_listctg}" should print last categories`, () =>
    testBotMsgsRes([
      {
        toSendText: cmd_listctg,
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
          const dbCategoriesJoinSbc1 =
            await appBotMock.db.categories.findJoinSbc({
              table_peer_id: chatId,
              title: realCtgTitle,
              peer_id: chatId,
            });
          const dbCategoriesJoinSbc2 =
            await appBotMock.db.categories.findJoinSbc({
              table_peer_id: chatId,
              title: realCtgTitle2,
              peer_id: chatId,
            });
          return {
            dbCategoryJoinSbc1: dbCategoriesJoinSbc1[0],
            dbCategoryJoinSbc2: dbCategoriesJoinSbc2[0],
          };
        },
        toBeMessage: (_, { dbCategoryJoinSbc1, dbCategoryJoinSbc2 }) =>
          toListHeader(
            { limitNum: DEFAULT_LIST_CTG_LIMIT, ctgCount: 2 },
            new ToTranslate(TrKey.YOUR_CATEGORIES, userLangCode, {
              text: printListCategories({
                categories: [dbCategoryJoinSbc2, dbCategoryJoinSbc1],
              }),
            }),
            userLangCode,
          ),
      },
    ]));

  const cmd_listctg_l2c = `${cmd_listctg} [${CommandParameterName.limit}${PARAMS_EQ}2]`;
  it(`"${cmd_listctg_l2c}" should print last 2 categories and categories by category`, () =>
    testBotMsgsRes([
      {
        toSendText: cmd_listctg_l2c,
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
          await appBotMock.db.categories.add(
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
          const dbCategoriesJoinSbc1 =
            await appBotMock.db.categories.findJoinSbc({
              table_peer_id: chatId,
              title: realCtgTitle,
              peer_id: chatId,
            });
          const dbCategoriesJoinSbc2 =
            await appBotMock.db.categories.findJoinSbc({
              table_peer_id: chatId,
              title: realCtgTitle2,
              peer_id: chatId,
            });
          return {
            dbCategoryJoinSbc1: dbCategoriesJoinSbc1[0],
            dbCategoryJoinSbc2: dbCategoriesJoinSbc2[0],
          };
        },
        toBeMessage: (_, { dbCategoryJoinSbc2, dbCategoryJoinSbc1 }) =>
          toListHeader(
            { limitNum: 2 },
            new ToTranslate(TrKey.YOUR_CATEGORIES, userLangCode, {
              text: printListCategories({
                categories: [dbCategoryJoinSbc2, dbCategoryJoinSbc1],
              }),
            }),
            userLangCode,
          ),
      },
      {
        toSendText: `${cmd_listctg} [${CommandParameterName.limit}${PARAMS_EQ}1 ${CommandParameterName.query}${PARAMS_EQ}${realCtgTitle2}]`,
        toBeMessage: (_) =>
          toListHeader(
            { limitNum: 1, query: realCtgTitle2 },
            new ToTranslate(TrKey.YOUR_CATEGORIES, userLangCode, {
              text: printListCategories({
                categories: [_[0].preparedData.dbCategoryJoinSbc2],
              }),
            }),
            userLangCode,
          ),
      },
    ]));

  const fakeCtgTitle = 'fakeCtgTitle';
  const fakeCtgTitle2 = 'fakeCtgTitle2';
  const search_query = 'CtgTitle';
  const cmd_listctg_search = `${cmd_listctg} [${CommandParameterName.query}${PARAMS_EQ}${search_query}]`;
  it(`"${cmd_listctg_search}" should print categories which name contains partial search pattern`, () =>
    testBotMsgsRes([
      {
        toSendText: cmd_listctg_search,
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
          await appBotMock.db.categories.add(
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
          await appBotMock.db.categories.add(
            { table_peer_id: chatId },
            composeAddCategory({
              title: fakeCtgTitle,
              peer_id: chatId,
              created_by_user_id: userIdStr,
              created_at: serverNowDate
                ? new Date(serverNowDate.getTime() + 2)
                : undefined,
            }),
          );
          const dbCategory = await appBotMock.db.categories.add(
            { table_peer_id: chatId },
            composeAddCategory({
              title: fakeCtgTitle2,
              peer_id: chatId,
              created_by_user_id: userIdStr,
              created_at: serverNowDate
                ? new Date(serverNowDate.getTime() + 3)
                : undefined,
            }),
          );
          await appBotMock.db.subcategories.add(
            { table_peer_id: chatId },
            checkAddSubcategory({
              title: realCtgTitle + 'kkkkkk',
              peer_id: chatId,
              category_id: dbCategory.id,
              created_by_user_id: userIdStr,
              description: 'ss dd',
              created_at: serverNowDate
                ? new Date(serverNowDate.getTime() + 4)
                : undefined,
            }),
          );
          const dbCategoriesJoinSbc1 =
            await appBotMock.db.categories.findJoinSbc({
              table_peer_id: chatId,
              title: realCtgTitle,
              peer_id: chatId,
            });
          const dbCategoriesJoinSbc2 =
            await appBotMock.db.categories.findJoinSbc({
              table_peer_id: chatId,
              title: realCtgTitle2,
              peer_id: chatId,
            });
          const dbCategoriesJoinSbc3 =
            await appBotMock.db.categories.findJoinSbc({
              table_peer_id: chatId,
              title: fakeCtgTitle2,
              peer_id: chatId,
            });
          const dbCategoriesJoinSbc4 =
            await appBotMock.db.categories.findJoinSbc({
              table_peer_id: chatId,
              title: fakeCtgTitle,
              peer_id: chatId,
            });
          return {
            dbCategoryJoinSbc1: dbCategoriesJoinSbc1[0],
            dbCategoryJoinSbc2: dbCategoriesJoinSbc2[0],
            dbCategoryJoinSbc3: dbCategoriesJoinSbc3[0],
            dbCategoryJoinSbc4: dbCategoriesJoinSbc4[0],
          };
        },
        toBeMessage: (
          _,
          {
            dbCategoryJoinSbc3,
            dbCategoryJoinSbc4,
            dbCategoryJoinSbc2,
            dbCategoryJoinSbc1,
          },
        ) =>
          toListHeader(
            {
              limitNum: DEFAULT_LIST_CTG_LIMIT,
              query: search_query,
              ctgCount: 4,
            },
            new ToTranslate(TrKey.YOUR_CATEGORIES, userLangCode, {
              text: printListCategories({
                categories: [
                  dbCategoryJoinSbc3,
                  dbCategoryJoinSbc4,
                  dbCategoryJoinSbc2,
                  dbCategoryJoinSbc1,
                ],
              }),
            }),
            userLangCode,
          ),
      },
    ]));

  const realCtgTitle3 = 'realCtgTitle3';
  const realCtgTitle4 = 'realCtgTitle4';
  const realCtgTitle5 = 'realCtgTitle5';
  const cmd_listctg_l2c_s2c = `${cmd_listctg} [${CommandParameterName.skip}${PARAMS_EQ}2 ${CommandParameterName.limit}${PARAMS_EQ}2]`;
  it(`"${cmd_listctg_l2c_s2c}" should print last 2 categories and skip 2 categories`, () =>
    testBotMsgsRes([
      {
        toSendText: cmd_listctg_l2c_s2c,
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
          await appBotMock.db.categories.add(
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
          await appBotMock.db.categories.add(
            { table_peer_id: chatId },
            composeAddCategory({
              title: realCtgTitle3,
              peer_id: chatId,
              created_by_user_id: userIdStr,
              created_at: serverNowDate
                ? new Date(serverNowDate.getTime() + 2)
                : undefined,
            }),
          );
          await appBotMock.db.categories.add(
            { table_peer_id: chatId },
            composeAddCategory({
              title: realCtgTitle4,
              peer_id: chatId,
              created_by_user_id: userIdStr,
              created_at: serverNowDate
                ? new Date(serverNowDate.getTime() + 3)
                : undefined,
            }),
          );
          await appBotMock.db.categories.add(
            { table_peer_id: chatId },
            composeAddCategory({
              title: realCtgTitle5,
              peer_id: chatId,
              created_by_user_id: userIdStr,
              created_at: serverNowDate
                ? new Date(serverNowDate.getTime() + 4)
                : undefined,
            }),
          );

          const dbCategoriesJoinSbc1 =
            await appBotMock.db.categories.findJoinSbc({
              table_peer_id: chatId,
              title: realCtgTitle,
              peer_id: chatId,
            });
          const dbCategoriesJoinSbc2 =
            await appBotMock.db.categories.findJoinSbc({
              table_peer_id: chatId,
              title: realCtgTitle2,
              peer_id: chatId,
            });
          const dbCategoriesJoinSbc3 =
            await appBotMock.db.categories.findJoinSbc({
              table_peer_id: chatId,
              title: realCtgTitle3,
              peer_id: chatId,
            });
          return {
            dbCategoryJoinSbc1: dbCategoriesJoinSbc1[0],
            dbCategoryJoinSbc2: dbCategoriesJoinSbc2[0],
            dbCategoryJoinSbc3: dbCategoriesJoinSbc3[0],
          };
        },
        toBeMessage: (_, { dbCategoryJoinSbc2, dbCategoryJoinSbc3 }) =>
          toListHeader(
            { limitNum: 2, skipNum: 2 },
            new ToTranslate(TrKey.YOUR_CATEGORIES, userLangCode, {
              text: printListCategories({
                categories: [dbCategoryJoinSbc3, dbCategoryJoinSbc2],
              }),
            }),
            userLangCode,
          ),
      },
    ]));

  const realSbcTitle3 = '🙃';
  const realSbcTitle4 = '❤️';
  const realSbcTitle5 = '🤖❤️';
  const cmd_listctg_s2c_id = `${cmd_listctg} [${CommandParameterName.skip}${PARAMS_EQ}3 ${CommandParameterName.showId}${PARAMS_EQ}t]`;
  it(`"${cmd_listctg_s2c_id}" should print last 2 categories and skip 2 categories and print deleted categories`, () =>
    testBotMsgsRes([
      {
        toSendText: cmd_listctg_s2c_id,
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
          await appBotMock.db.categories.add(
            { table_peer_id: chatId },
            createDeletedCategory({
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
            createArchivedCategory({
              title: realCtgTitle,
              peer_id: chatId,
              created_by_user_id: userIdStr,
              created_at: serverNowDate
                ? new Date(serverNowDate.getTime() + 1)
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
                ? new Date(serverNowDate.getTime() + 2)
                : undefined,
            }),
          );
          await appBotMock.db.categories.add(
            { table_peer_id: chatId },
            composeAddCategory({
              title: realCtgTitle3,
              peer_id: chatId,
              created_by_user_id: userIdStr,
              created_at: serverNowDate
                ? new Date(serverNowDate.getTime() + 3)
                : undefined,
            }),
          );
          await appBotMock.db.categories.add(
            { table_peer_id: chatId },
            composeAddCategory({
              title: realCtgTitle4,
              peer_id: chatId,
              created_by_user_id: userIdStr,
              created_at: serverNowDate
                ? new Date(serverNowDate.getTime() + 4)
                : undefined,
            }),
          );
          await appBotMock.db.categories.add(
            { table_peer_id: chatId },
            composeAddCategory({
              title: realCtgTitle5,
              peer_id: chatId,
              created_by_user_id: userIdStr,
              created_at: serverNowDate
                ? new Date(serverNowDate.getTime() + 5)
                : undefined,
            }),
          );
          await appBotMock.db.subcategories.add(
            { table_peer_id: chatId },
            createDeletedSubcategory({
              title: realSbcTitle2,
              peer_id: chatId,
              category_id: dbCategory2.id,
              created_by_user_id: userIdStr,
              created_at: serverNowDate
                ? new Date(serverNowDate.getTime() + 6)
                : undefined,
            }),
          );
          await appBotMock.db.subcategories.add(
            { table_peer_id: chatId },
            createDeletedSubcategory({
              title: realSbcTitle3,
              peer_id: chatId,
              category_id: dbCategory2.id,
              created_by_user_id: userIdStr,
              created_at: serverNowDate
                ? new Date(serverNowDate.getTime() + 7)
                : undefined,
            }),
          );
          await appBotMock.db.subcategories.add(
            { table_peer_id: chatId },
            createDeletedSubcategory({
              title: realSbcTitle4,
              peer_id: chatId,
              category_id: dbCategory2.id,
              created_by_user_id: userIdStr,
              created_at: serverNowDate
                ? new Date(serverNowDate.getTime() + 8)
                : undefined,
            }),
          );
          await appBotMock.db.subcategories.add(
            { table_peer_id: chatId },
            createDeletedSubcategory({
              title: realSbcTitle5,
              peer_id: chatId,
              category_id: dbCategory2.id,
              created_by_user_id: userIdStr,
              created_at: serverNowDate
                ? new Date(serverNowDate.getTime() + 9)
                : undefined,
            }),
          );

          const dbCategoriesJoinSbc1 =
            await appBotMock.db.categories.findJoinSbc({
              table_peer_id: chatId,
              title: realCtgTitle,
              peer_id: chatId,
              in_deleted: true,
            });
          const dbCategoriesJoinSbc2 =
            await appBotMock.db.categories.findJoinSbc({
              table_peer_id: chatId,
              title: realCtgTitle2,
              peer_id: chatId,
            });
          const dbCategoriesJoinSbc3 =
            await appBotMock.db.categories.findJoinSbc({
              table_peer_id: chatId,
              title: realCtgTitle3,
              peer_id: chatId,
            });
          const dbCategoriesJoinSbc4 =
            await appBotMock.db.categories.findJoinSbc({
              table_peer_id: chatId,
              title: realCtgTitle4,
              peer_id: chatId,
            });
          const dbCategoriesJoinSbc5 =
            await appBotMock.db.categories.findJoinSbc({
              table_peer_id: chatId,
              title: realCtgTitle5,
              peer_id: chatId,
            });
          return {
            dbCategoryJoinSbc1: dbCategoriesJoinSbc1[0],
            dbCategoryJoinSbc2: dbCategoriesJoinSbc2[0],
            dbCategoryJoinSbc3: dbCategoriesJoinSbc3[0],
            dbCategoryJoinSbc4: dbCategoriesJoinSbc4[0],
            dbCategoryJoinSbc5: dbCategoriesJoinSbc5[0],
          };
        },
        toBeMessage: (_, { dbCategoryJoinSbc2 }) =>
          toListHeader(
            {
              limitNum: DEFAULT_LIST_CTG_LIMIT,
              skipNum: 3,
              showId: true,
              ctgCount: 1,
            },
            new ToTranslate(TrKey.YOUR_CATEGORIES, userLangCode, {
              text: printListCategories({
                categories: [dbCategoryJoinSbc2],
                showId: true,
              }),
            }),
            userLangCode,
          ),
      },
      {
        toSendText: `${cmd_listctg} [${CommandParameterName.showDeleted}${PARAMS_EQ}t]`,
        toBeMessage: (_) =>
          toListHeader(
            {
              limitNum: DEFAULT_LIST_CTG_LIMIT,
              showDeleted: true,
              ctgCount: 1,
            },
            new ToTranslate(TrKey.YOUR_CATEGORIES, userLangCode, {
              text: printListCategories({
                categories: [_[0].preparedData.dbCategoryJoinSbc1],
              }),
            }),
            userLangCode,
          ),
      },
      {
        toSendText: `${cmd_listctg} [${CommandParameterName.showDeleted}${PARAMS_EQ}t ${CommandParameterName.query}${PARAMS_EQ}"${realCtgTitle}"]`,
        toBeMessage: (_) =>
          toListHeader(
            {
              limitNum: DEFAULT_LIST_CTG_LIMIT,
              showDeleted: true,
              query: realCtgTitle,
              ctgCount: 1,
            },
            new ToTranslate(TrKey.YOUR_CATEGORIES, userLangCode, {
              text: printListCategories({
                categories: [_[0].preparedData.dbCategoryJoinSbc1],
              }),
            }),
            userLangCode,
          ),
      },
    ]));

  const cmd_listctg_arch = `${cmd_listctg} [${CommandParameterName.showArchived}${PARAMS_EQ}t]`;
  it(`"${cmd_listctg_arch}" should print archived categories`, () =>
    testBotMsgsRes([
      {
        toSendText: cmd_listctg_arch,
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

          const dbCategoriesJoinSbc1 =
            await appBotMock.db.categories.findJoinSbc({
              table_peer_id: chatId,
              title: realCtgTitle,
              peer_id: chatId,
              in_archived: true,
            });
          return {
            dbCtgJoinSbc1: dbCategoriesJoinSbc1[0],
          };
        },
        toBeMessage: (_, { dbCtgJoinSbc1 }) =>
          toListHeader(
            {
              limitNum: DEFAULT_LIST_CTG_LIMIT,
              showArchived: true,
              ctgCount: 1,
            },
            new ToTranslate(TrKey.YOUR_CATEGORIES, userLangCode, {
              text: printListCategories({
                categories: [dbCtgJoinSbc1],
                showArchived: true,
              }),
            }),
            userLangCode,
          ),
      },
      {
        toSendText: `${cmd_listctg}`,
        toBeText: () => `(лимит "30")
Нет категорий`,
      },
    ]));

  const desc_srch = 'HO*HO!';
  const cmd_listctg_desc = `${cmd_listctg} [${CommandParameterName.query}${PARAMS_EQ}${desc_srch}]`;
  it(`"${cmd_listctg_desc}" should print categories found by description`, () =>
    testBotMsgsRes([
      {
        toSendText: cmd_listctg_desc,
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
            createDeletedCategory({
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
              description: 'yo ho  ho! yooo',
              created_at: serverNowDate
                ? new Date(serverNowDate.getTime() + 1)
                : undefined,
            }),
          );
          await appBotMock.db.subcategories.add(
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
              created_at: serverNowDate
                ? new Date(serverNowDate.getTime() + 3)
                : undefined,
            }),
          );

          const dbCategoriesJoinSbc1 =
            await appBotMock.db.categories.findJoinSbc({
              table_peer_id: chatId,
              title: realCtgTitle,
              peer_id: chatId,
              in_deleted: true,
            });
          const dbCategoriesJoinSbc2 =
            await appBotMock.db.categories.findJoinSbc({
              table_peer_id: chatId,
              title: realCtgTitle2,
              peer_id: chatId,
            });
          return {
            dbCategoryJoinSbc1: dbCategoriesJoinSbc1[0],
            dbCategoryJoinSbc2: dbCategoriesJoinSbc2[0],
          };
        },
        toBeMessage: (_, { dbCategoryJoinSbc2 }) =>
          toListHeader(
            { limitNum: DEFAULT_LIST_CTG_LIMIT, query: desc_srch, ctgCount: 1 },
            new ToTranslate(TrKey.YOUR_CATEGORIES, userLangCode, {
              text: printListCategories({
                categories: [dbCategoryJoinSbc2],
              }),
            }),
            userLangCode,
          ),
      },
      {
        toSendText: `${cmd_listctg} [${CommandParameterName.query}${PARAMS_EQ}deleted]`,
        toBeText: () => `(лимит "30")
(шаблон поиска "deleted")
Нет категорий`,
      },
    ]));

  const cmd_listctg_ctgq = `${cmd_listctg} [${CommandParameterName.ctgQuery}${PARAMS_EQ}ho-ho-ctg]`;
  it(`"${cmd_listctg_ctgq}" should print category/subcategory found by query`, () =>
    testBotMsgsRes([
      {
        toSendText: cmd_listctg_ctgq,
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
(количество категорий "3")
Ваши категории:
├── ho-ho-ctg-2 num- "yo ho-ho-sbc-2"
│     └── ho-ho-sbc-2
├── ho-ho-ctg-3 num-
│     └── ho-ho-sbc-3
└── ho-ho-ctg-1 num- "yo ho-ho-ctg-2"
      └── ho-ho-sbc-1 "ss dd"`,
      },
      {
        toSendText: `${cmd_listctg} [${CommandParameterName.ctgQuery}${PARAMS_EQ}ho-ho-ctg-2]`,
        toBeText: () => `(лимит "30")
(поиск по категориям "ho-ho-ctg-2")
(количество категорий "2")
Ваши категории:
├── ho-ho-ctg-2 num- "yo ho-ho-sbc-2"
│     └── ho-ho-sbc-2
└── ho-ho-ctg-1 num- "yo ho-ho-ctg-2"
      └── ho-ho-sbc-1 "ss dd"`,
      },
      {
        toSendText: `${cmd_listctg} [${CommandParameterName.sbcQuery}${PARAMS_EQ}ho-ho-sbc]`,
        toBeText: () => `(лимит "30")
(поиск по подкатегориям "ho-ho-sbc")
(количество категорий "3")
Ваши категории:
├── ho-ho-ctg-2 num- "yo ho-ho-sbc-2"
│     └── ho-ho-sbc-2
├── ho-ho-ctg-3 num-
│     └── ho-ho-sbc-3
└── ho-ho-ctg-1 num- "yo ho-ho-ctg-2"
      └── ho-ho-sbc-1 "ss dd"`,
      },
      {
        toSendText: `${cmd_listctg} [${CommandParameterName.sbcQuery}${PARAMS_EQ}ho-ho-sbc-2]`,
        toBeText: () => `(лимит "30")
(поиск по подкатегориям "ho-ho-sbc-2")
(количество категорий "1")
Ваши категории:
└── ho-ho-ctg-2 num- "yo ho-ho-sbc-2"
      └── ho-ho-sbc-2`,
      },
    ]));

  it(`"${cmd_listctg} ho-ho-ctg" should print categories/subcategories found by query text`, () =>
    testBotMsgsRes([
      {
        toSendText: `${cmd_listctg} ho-ho-ctg`,
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
(количество категорий "3")
Ваши категории:
├── ho-ho-ctg-2 num- "yo ho-ho-sbc-2"
│     └── ho-ho-sbc-2
├── ho-ho-ctg-3 num-
│     └── ho-ho-sbc-3
└── ho-ho-ctg-1 num- "yo ho-ho-ctg-2"
      └── ho-ho-sbc-1 "ss dd"`,
      },
      {
        toSendText: `${cmd_listctg} ho-ho-sbc-2`,
        toBeText: () => `(лимит "30")
(шаблон поиска "ho-ho-sbc-2")
(количество категорий "1")
Ваши категории:
└── ho-ho-ctg-2 num- "yo ho-ho-sbc-2"
      └── ho-ho-sbc-2`,
      },
    ]));

  const ctglist_amb_failures = [
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
  for (const ctglist_amb_failure of ctglist_amb_failures) {
    const { parName } = ctglist_amb_failure;
    const cmd = `${cmd_listctg} hoho [${parName}=hoho]`;
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
        toSendText: `${cmd_listctg} [${CommandParameterName.ctgQueryTitle}${PARAMS_EQ}ho-ho-ctg]`,
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
(количество категорий "3")
Ваши категории:
├── ho-ho-ctg-2 num- "yo ho-ho-sbc-2"
│     └── ho-ho-sbc-2
├── ho-ho-ctg-3 num-
│     └── ho-ho-sbc-3 "yo ho-ho-ctg--..."
└── ho-ho-ctg-1 num- "yo ho-ho-ctg-2"
      └── ho-ho-sbc-1 "yo ho-ho-ctg-..."`,
      },
      {
        toSendText: `${cmd_listctg} [${CommandParameterName.ctgQueryDescr}${PARAMS_EQ}"yo ho-ho"]`,
        toBeText: () => `(лимит "30")
(поиск по описанию категорий "yo ho-ho")
(количество категорий "2")
Ваши категории:
├── ho-ho-ctg-2 num- "yo ho-ho-sbc-2"
│     └── ho-ho-sbc-2
└── ho-ho-ctg-1 num- "yo ho-ho-ctg-2"
      └── ho-ho-sbc-1 "yo ho-ho-ctg-..."`,
      },
      {
        toSendText: `${cmd_listctg} [${CommandParameterName.sbcQueryTitle}${PARAMS_EQ}ho-ho-sbc-3]`,
        toBeText: () => `(лимит "30")
(поиск по названию подкатегорий "ho-ho-sbc-3")
(количество категорий "1")
Ваши категории:
└── ho-ho-ctg-3 num-
      └── ho-ho-sbc-3 "yo ho-ho-ctg--..."`,
      },
      {
        toSendText: `${cmd_listctg} [${CommandParameterName.sbcQueryDescr}${PARAMS_EQ}"yo ho-ho-ctg-"]`,
        toBeText: () => `(лимит "30")
(поиск по описанию подкатегорий "yo ho-ho-ctg-")
(количество категорий "2")
Ваши категории:
├── ho-ho-ctg-3 num-
│     └── ho-ho-sbc-3 "yo ho-ho-ctg--..."
└── ho-ho-ctg-1 num- "yo ho-ho-ctg-2"
      └── ho-ho-sbc-1 "yo ho-ho-ctg-..."`,
      },
    ]));

  it(`should print category/subcategory found by query id`, () =>
    testBotMsgsRes([
      {
        toSendText: `${cmd_listctg} [${CommandParameterName.showId}${PARAMS_EQ}t]`,
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
(количество категорий "3")
Ваши категории:
├── 🆔${_[0].preparedData.dbCtg1.id} ctg-1 num-
│     └── 🆔${_[0].preparedData.dbSbc1.id} sbc-1
├── 🆔${_[0].preparedData.dbCtg2.id} ctg-2 num-
│     └── 🆔${_[0].preparedData.dbSbc2.id} sbc-2
└── 🆔${_[0].preparedData.dbCtg3.id} ctg-3 num-
      └── 🆔${_[0].preparedData.dbSbc3.id} sbc-3`,
      },
      {
        toSendText: (_) =>
          `${cmd_listctg} [${CommandParameterName.ctgQueryIdGreaterThan}${PARAMS_EQ}${_[0].preparedData.dbCtg2.id}]`,
        toBeText: (_) => `(лимит "30")
(поиск по категориям id которых больше чем "${_[0].preparedData.dbCtg2.id}")
(количество категорий "1")
Ваши категории:
└── ctg-3 num-
      └── sbc-3`,
      },
      {
        toSendText: (_) =>
          `${cmd_listctg} [${CommandParameterName.ctgQueryIdGreaterThanOrEq}${PARAMS_EQ}${_[0].preparedData.dbCtg3.id}]`,
        toBeText: (_) => `(лимит "30")
(поиск по категориям id которых больше чем или равно "${_[0].preparedData.dbCtg3.id}")
(количество категорий "1")
Ваши категории:
└── ctg-3 num-
      └── sbc-3`,
      },
      {
        toSendText: (_) =>
          `${cmd_listctg} [${CommandParameterName.ctgQueryIdLessThan}${PARAMS_EQ}${_[0].preparedData.dbCtg3.id}]`,
        toBeText: (_) => `(лимит "30")
(поиск по категориям id которых меньше чем "${_[0].preparedData.dbCtg3.id}")
(количество категорий "2")
Ваши категории:
├── ctg-1 num-
│     └── sbc-1
└── ctg-2 num-
      └── sbc-2`,
      },
      {
        toSendText: (_) =>
          `${cmd_listctg} [${CommandParameterName.ctgQueryIdLessThanOrEq}${PARAMS_EQ}${_[0].preparedData.dbCtg3.id}]`,
        toBeText: (_) => `(лимит "30")
(поиск по категориям id которых меньше чем или равно "${_[0].preparedData.dbCtg3.id}")
(количество категорий "3")
Ваши категории:
├── ctg-1 num-
│     └── sbc-1
├── ctg-2 num-
│     └── sbc-2
└── ctg-3 num-
      └── sbc-3`,
      },
      {
        toSendText: (_) =>
          `${cmd_listctg} [${CommandParameterName.sbcQueryIdGreaterThan}${PARAMS_EQ}${_[0].preparedData.dbSbc2.id}]`,
        toBeText: (_) => `(лимит "30")
(поиск по подкатегориям id которых больше чем "${_[0].preparedData.dbSbc2.id}")
(количество категорий "1")
Ваши категории:
└── ctg-3 num-
      └── sbc-3`,
      },
      {
        toSendText: (_) =>
          `${cmd_listctg} [${CommandParameterName.sbcQueryIdGreaterThanOrEq}${PARAMS_EQ}${_[0].preparedData.dbSbc3.id}]`,
        toBeText: (_) => `(лимит "30")
(поиск по подкатегориям id которых больше чем или равно "${_[0].preparedData.dbSbc3.id}")
(количество категорий "1")
Ваши категории:
└── ctg-3 num-
      └── sbc-3`,
      },
      {
        toSendText: (_) =>
          `${cmd_listctg} [${CommandParameterName.sbcQueryIdLessThan}${PARAMS_EQ}${_[0].preparedData.dbSbc1.id}]`,
        toBeText: (_) => `(лимит "30")
(поиск по подкатегориям id которых меньше чем "${_[0].preparedData.dbSbc1.id}")
Нет категорий`,
      },
      {
        toSendText: (_) =>
          `${cmd_listctg} [${CommandParameterName.sbcQueryIdLessThanOrEq}${PARAMS_EQ}${_[0].preparedData.dbSbc1.id}]`,
        toBeText: (_) => `(лимит "30")
(поиск по подкатегориям id которых меньше чем или равно "${_[0].preparedData.dbSbc1.id}")
(количество категорий "1")
Ваши категории:
└── ctg-1 num-
      └── sbc-1`,
      },
    ]));

  afterAll(() => destroyBotMockApp(appBotMock));
});
