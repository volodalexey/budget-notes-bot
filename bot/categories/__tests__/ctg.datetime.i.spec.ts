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
  DEFAULT_CTG_TYPE,
  composeAddCategory,
  createDeletedCategory,
  createArchivedCategory,
  generateCategoryCreatedTranslations,
} from '../../../db/models/categoryModel';

import { BotCommandEnum, toCommand } from '../../helpers';
import { setDTDate } from '../../datetime';

describe('Check catigories datetime generation', () => {
  let appBotMock: AppBotMockI;
  let testBotMsgsRes: PreparedTestBotMessages;
  let userLangCode: LanguageEnum;
  let chatId: number;
  let userIdStr: string;

  let mockCreatedDate: Date,
    mockDeleteDate: Date,
    mockArchivedDate: Date,
    mockUpdatedDate: Date;

  beforeAll(async () => {
    appBotMock = await startBotMockApp();
    userLangCode = appBotMock.userLangCode;
    chatId = appBotMock.chatId;
    userIdStr = appBotMock.user.id;
    testBotMsgsRes = CreateMockTestBotMessageResponses({ appBotMock });
  });

  const cmd_addctg = toCommand(BotCommandEnum.addctg);
  const realCtgTitle = 'realCtgTitle';
  const cmd_addctg_real_ctg = `${cmd_addctg} ${realCtgTitle}`;
  it(`"${cmd_addctg_real_ctg}" should add new category`, () =>
    testBotMsgsRes([
      {
        toSendText: cmd_addctg_real_ctg,
        prepareDB: async () => {
          mockCreatedDate = new Date();
          setDTDate(mockCreatedDate);
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
            title: realCtgTitle,
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
                categoryTitle: realCtgTitle,
                lang: userLangCode,
              }),
            },
            ['createdFields'],
          ),
      },
      {
        toExpect: [
          (_) => {
            const dbCategory = _[0].clearedData;
            expect(dbCategory).toBeDefined();
          },
          (_) => {
            const dbCategory = _[0].clearedData;
            expect(dbCategory).toHaveProperty('created_at', mockCreatedDate);
          },
          (_) => {
            const dbCategory = _[0].clearedData;
            expect(dbCategory).toHaveProperty('created_by_user_id', userIdStr);
          },
          (_) => {
            const dbCategory = _[0].clearedData;
            expect(dbCategory).toHaveProperty('updated_at', null);
          },
          (_) => {
            const dbCategory = _[0].clearedData;
            expect(dbCategory).toHaveProperty('updated_by_user_id', null);
          },
          (_) => {
            const dbCategory = _[0].clearedData;
            expect(dbCategory).toHaveProperty('deleted_at', null);
          },
          (_) => {
            const dbCategory = _[0].clearedData;
            expect(dbCategory).toHaveProperty('deleted_by_user_id', null);
          },
          (_) => {
            const dbCategory = _[0].clearedData;
            expect(dbCategory).toHaveProperty('archived_at', null);
          },
          (_) => {
            const dbCategory = _[0].clearedData;
            expect(dbCategory).toHaveProperty('archived_by_user_id', null);
          },
        ],
      },
    ]));

  const cmd_delctg = toCommand(BotCommandEnum.delctg);
  const cmd_delctg_real_ctg = `${cmd_delctg} ${realCtgTitle}`;
  it(`"${cmd_delctg_real_ctg}" should delete category`, () =>
    testBotMsgsRes([
      {
        toSendText: cmd_delctg_real_ctg,
        prepareDB: async () => {
          mockCreatedDate = new Date();
          setDTDate(mockCreatedDate);
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
          mockDeleteDate = new Date();
          setDTDate(mockDeleteDate);
        },
        toBeMessage: new ToTranslate(TrKey.CTG_DELETED, userLangCode, {
          title: realCtgTitle,
        }),
        clearDB: async () => {
          const dbCategories = await appBotMock.db.categories.find({
            table_peer_id: chatId,
            title: realCtgTitle,
            peer_id: chatId,
            in_deleted: true,
          });
          return dbCategories[0];
        },
      },
      {
        toExpect: [
          (_) => {
            const dbCategory = _[0].clearedData;
            expect(dbCategory).toBeDefined();
          },
          (_) => {
            const dbCategory = _[0].clearedData;
            expect(dbCategory).toHaveProperty('created_at', mockCreatedDate);
          },
          (_) => {
            const dbCategory = _[0].clearedData;
            expect(dbCategory).toHaveProperty('created_by_user_id', userIdStr);
          },
          (_) => {
            const dbCategory = _[0].clearedData;
            expect(dbCategory).toHaveProperty('updated_at', null);
          },
          (_) => {
            const dbCategory = _[0].clearedData;
            expect(dbCategory).toHaveProperty('updated_by_user_id', null);
          },
          (_) => {
            const dbCategory = _[0].clearedData;
            expect(dbCategory).toHaveProperty('deleted_at', mockDeleteDate);
          },
          (_) => {
            const dbCategory = _[0].clearedData;
            expect(dbCategory).toHaveProperty('deleted_by_user_id', userIdStr);
          },
          (_) => {
            const dbCategory = _[0].clearedData;
            expect(dbCategory).toHaveProperty('archived_at', null);
          },
          (_) => {
            const dbCategory = _[0].clearedData;
            expect(dbCategory).toHaveProperty('archived_by_user_id', null);
          },
        ],
      },
    ]));

  const cmd_updctgn = toCommand(BotCommandEnum.updctgn);
  const realCtgTitle2 = 'realCtgTitle2';
  const cmd_updctgn_real_ctg = `${cmd_updctgn} ${realCtgTitle} ${realCtgTitle2}`;
  it(`"${cmd_updctgn_real_ctg}" should be resolved as updated category title`, () =>
    testBotMsgsRes([
      {
        toSendText: cmd_updctgn_real_ctg,
        prepareDB: async () => {
          mockCreatedDate = new Date();
          setDTDate(mockCreatedDate);
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
          mockUpdatedDate = new Date();
          setDTDate(mockUpdatedDate);
        },
        toBeMessage: new ToTranslate(
          TrKey.CATEGORY_NAME_UPDATED,
          userLangCode,
          {
            oldTitle: realCtgTitle,
            newTitle: realCtgTitle2,
          },
        ),
        clearDB: async () => {
          const dbCategories = await appBotMock.db.categories.find({
            table_peer_id: chatId,
            title: realCtgTitle2,
            peer_id: chatId,
          });
          return dbCategories[0];
        },
      },
      {
        toExpect: [
          (_) => {
            const dbCategory = _[0].clearedData;
            expect(dbCategory).toBeDefined();
          },
          (_) => {
            const dbCategory = _[0].clearedData;
            expect(dbCategory).toHaveProperty('created_at', mockCreatedDate);
          },
          (_) => {
            const dbCategory = _[0].clearedData;
            expect(dbCategory).toHaveProperty('created_by_user_id', userIdStr);
          },
          (_) => {
            const dbCategory = _[0].clearedData;
            expect(dbCategory).toHaveProperty('updated_at', mockUpdatedDate);
          },
          (_) => {
            const dbCategory = _[0].clearedData;
            expect(dbCategory).toHaveProperty('updated_by_user_id', userIdStr);
          },
          (_) => {
            const dbCategory = _[0].clearedData;
            expect(dbCategory).toHaveProperty('deleted_at', null);
          },
          (_) => {
            const dbCategory = _[0].clearedData;
            expect(dbCategory).toHaveProperty('deleted_by_user_id', null);
          },
          (_) => {
            const dbCategory = _[0].clearedData;
            expect(dbCategory).toHaveProperty('archived_at', null);
          },
          (_) => {
            const dbCategory = _[0].clearedData;
            expect(dbCategory).toHaveProperty('archived_by_user_id', null);
          },
        ],
      },
    ]));

  const newCtgDescr = 'this is new ctg desc <img />';
  const cmd_updctgd = toCommand(BotCommandEnum.updctgd);
  const cmd_updctgd_real_ctg = `${cmd_updctgd} ${realCtgTitle} ${newCtgDescr}`;
  it(`"${cmd_updctgd_real_ctg}" should be resolved as updated category description`, () =>
    testBotMsgsRes([
      {
        toSendText: cmd_updctgd_real_ctg,
        prepareDB: async () => {
          mockCreatedDate = new Date();
          setDTDate(mockCreatedDate);
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
          mockUpdatedDate = new Date();
          setDTDate(mockUpdatedDate);
        },
        toBeMessage: new ToTranslate(
          TrKey.CATEGORY_DESC_UPDATED,
          userLangCode,
          {
            ctgTitle: realCtgTitle,
            oldDesc: '',
            newDesc: newCtgDescr,
          },
        ),
        clearDB: async () => {
          const dbCategories = await appBotMock.db.categories.find({
            table_peer_id: chatId,
            title: realCtgTitle,
            peer_id: chatId,
          });
          return dbCategories[0];
        },
      },
      {
        toExpect: [
          (_) => {
            const dbCategory = _[0].clearedData;
            expect(dbCategory).toBeDefined();
          },
          (_) => {
            const dbCategory = _[0].clearedData;
            expect(dbCategory).toHaveProperty('created_at', mockCreatedDate);
          },
          (_) => {
            const dbCategory = _[0].clearedData;
            expect(dbCategory).toHaveProperty('created_by_user_id', userIdStr);
          },
          (_) => {
            const dbCategory = _[0].clearedData;
            expect(dbCategory).toHaveProperty('updated_at', mockUpdatedDate);
          },
          (_) => {
            const dbCategory = _[0].clearedData;
            expect(dbCategory).toHaveProperty('updated_by_user_id', userIdStr);
          },
          (_) => {
            const dbCategory = _[0].clearedData;
            expect(dbCategory).toHaveProperty('deleted_at', null);
          },
          (_) => {
            const dbCategory = _[0].clearedData;
            expect(dbCategory).toHaveProperty('deleted_by_user_id', null);
          },
          (_) => {
            const dbCategory = _[0].clearedData;
            expect(dbCategory).toHaveProperty('archived_at', null);
          },
          (_) => {
            const dbCategory = _[0].clearedData;
            expect(dbCategory).toHaveProperty('archived_by_user_id', null);
          },
        ],
      },
    ]));

  const cmd_undo_delctg = toCommand(BotCommandEnum.undodelctg);
  const cmd_undo_delctg_real_ctg = `${cmd_undo_delctg} ${realCtgTitle}`;
  it(`"${cmd_undo_delctg_real_ctg}" should be resolved as restored from deleted category`, () =>
    testBotMsgsRes([
      {
        toSendText: cmd_undo_delctg_real_ctg,
        prepareDB: async () => {
          await appBotMock.db.categories.deleteAll({
            table_peer_id: chatId,
            peer_id: chatId,
          });
          mockUpdatedDate = new Date();
          setDTDate(mockUpdatedDate);
          await appBotMock.db.categories.add(
            { table_peer_id: chatId },
            createDeletedCategory({
              title: realCtgTitle,
              peer_id: chatId,
              created_by_user_id: userIdStr,
            }),
          );
        },
        toBeMessage: new ToTranslate(TrKey.CTG_UNDO_DELETED, userLangCode, {
          title: realCtgTitle,
        }),
        clearDB: async () => {
          const dbCategories = await appBotMock.db.categories.find({
            table_peer_id: chatId,
            title: realCtgTitle,
            peer_id: chatId,
          });
          return dbCategories[0];
        },
      },
      {
        toExpect: [
          (_) => {
            const dbCategory = _[0].clearedData;
            expect(dbCategory).toBeDefined();
          },
          (_) => {
            const dbCategory = _[0].clearedData;
            expect(dbCategory).toHaveProperty('created_by_user_id', userIdStr);
          },
          (_) => {
            const dbCategory = _[0].clearedData;
            expect(dbCategory).toHaveProperty('updated_at', mockUpdatedDate);
          },
          (_) => {
            const dbCategory = _[0].clearedData;
            expect(dbCategory).toHaveProperty('updated_by_user_id', userIdStr);
          },
          (_) => {
            const dbCategory = _[0].clearedData;
            expect(dbCategory).toHaveProperty('deleted_at', null);
          },
          (_) => {
            const dbCategory = _[0].clearedData;
            expect(dbCategory).toHaveProperty('deleted_by_user_id', null);
          },
          (_) => {
            const dbCategory = _[0].clearedData;
            expect(dbCategory).toHaveProperty('archived_at', null);
          },
          (_) => {
            const dbCategory = _[0].clearedData;
            expect(dbCategory).toHaveProperty('archived_by_user_id', null);
          },
        ],
      },
    ]));

  const cmd_archctg = toCommand(BotCommandEnum.archctg);
  const cmd_archctg_real_ctg = `${cmd_archctg} ${realCtgTitle}`;
  it(`"${cmd_archctg_real_ctg}" should archive category`, () =>
    testBotMsgsRes([
      {
        toSendText: cmd_archctg_real_ctg,
        prepareDB: async () => {
          mockCreatedDate = new Date();
          setDTDate(mockCreatedDate);
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
          mockArchivedDate = new Date();
          setDTDate(mockArchivedDate);
        },
        toBeMessage: new ToTranslate(TrKey.CTG_ARCHIVED, userLangCode, {
          title: realCtgTitle,
        }),
        clearDB: async () => {
          const dbCategories = await appBotMock.db.categories.find({
            table_peer_id: chatId,
            title: realCtgTitle,
            peer_id: chatId,
            in_archived: true,
          });
          return dbCategories[0];
        },
      },
      {
        toExpect: [
          (_) => {
            const dbCategory = _[0].clearedData;
            expect(dbCategory).toBeDefined();
          },
          (_) => {
            const dbCategory = _[0].clearedData;
            expect(dbCategory).toHaveProperty('created_at', mockCreatedDate);
          },
          (_) => {
            const dbCategory = _[0].clearedData;
            expect(dbCategory).toHaveProperty('created_by_user_id', userIdStr);
          },
          (_) => {
            const dbCategory = _[0].clearedData;
            expect(dbCategory).toHaveProperty('updated_at', null);
          },
          (_) => {
            const dbCategory = _[0].clearedData;
            expect(dbCategory).toHaveProperty('updated_by_user_id', null);
          },
          (_) => {
            const dbCategory = _[0].clearedData;
            expect(dbCategory).toHaveProperty('deleted_at', null);
          },
          (_) => {
            const dbCategory = _[0].clearedData;
            expect(dbCategory).toHaveProperty('deleted_by_user_id', null);
          },
          (_) => {
            const dbCategory = _[0].clearedData;
            expect(dbCategory).toHaveProperty('archived_at', mockArchivedDate);
          },
          (_) => {
            const dbCategory = _[0].clearedData;
            expect(dbCategory).toHaveProperty('archived_by_user_id', userIdStr);
          },
        ],
      },
    ]));

  const cmd_undo_archctg = toCommand(BotCommandEnum.undoarchctg);
  const cmd_undo_archctg_real_ctg = `${cmd_undo_archctg} ${realCtgTitle}`;
  it(`"${cmd_undo_archctg_real_ctg}" should be resolved as restored from archived category`, () =>
    testBotMsgsRes([
      {
        toSendText: cmd_undo_archctg_real_ctg,
        prepareDB: async () => {
          await appBotMock.db.categories.deleteAll({
            table_peer_id: chatId,
            peer_id: chatId,
          });
          mockUpdatedDate = new Date();
          setDTDate(mockUpdatedDate);
          await appBotMock.db.categories.add(
            { table_peer_id: chatId },
            createArchivedCategory({
              title: realCtgTitle,
              peer_id: chatId,
              created_by_user_id: userIdStr,
            }),
          );
        },
        toBeMessage: new ToTranslate(TrKey.CTG_UNDO_ARCHIVED, userLangCode, {
          title: realCtgTitle,
        }),
        clearDB: async () => {
          const dbCategories = await appBotMock.db.categories.find({
            table_peer_id: chatId,
            title: realCtgTitle,
            peer_id: chatId,
          });
          return dbCategories[0];
        },
      },
      {
        toExpect: [
          (_) => {
            const dbCategory = _[0].clearedData;
            expect(dbCategory).toBeDefined();
          },
          (_) => {
            const dbCategory = _[0].clearedData;
            expect(dbCategory).toHaveProperty('created_by_user_id', userIdStr);
          },
          (_) => {
            const dbCategory = _[0].clearedData;
            expect(dbCategory).toHaveProperty('updated_at', mockUpdatedDate);
          },
          (_) => {
            const dbCategory = _[0].clearedData;
            expect(dbCategory).toHaveProperty('updated_by_user_id', userIdStr);
          },
          (_) => {
            const dbCategory = _[0].clearedData;
            expect(dbCategory).toHaveProperty('deleted_at', null);
          },
          (_) => {
            const dbCategory = _[0].clearedData;
            expect(dbCategory).toHaveProperty('deleted_by_user_id', null);
          },
          (_) => {
            const dbCategory = _[0].clearedData;
            expect(dbCategory).toHaveProperty('archived_at', null);
          },
          (_) => {
            const dbCategory = _[0].clearedData;
            expect(dbCategory).toHaveProperty('archived_by_user_id', null);
          },
        ],
      },
    ]));

  afterAll(async () => {
    setDTDate();
    await destroyBotMockApp(appBotMock);
  });
});
