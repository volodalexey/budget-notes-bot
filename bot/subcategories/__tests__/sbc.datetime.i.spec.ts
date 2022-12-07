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
  createDeletedSubcategory,
  createArchivedSubcategory,
  generateSubcategoryCreatedTranslations,
} from '../../../db/models/subcategoryModel';

import { toCommand, BotCommandEnum } from '../../helpers';
import { setDTDate } from '../../datetime';

describe('Check subcatigories datetime generation', () => {
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

  const cmd_addsbc = toCommand(BotCommandEnum.addsbc);
  const realCtgTitle = 'realCtgTitle';
  const realSbcTitle = '⛔';
  const cmd_addsbc_real_sbc = `${cmd_addsbc} ${realCtgTitle} ${realSbcTitle}`;
  it(`"${cmd_addsbc_real_sbc}" should add new subcategory`, () =>
    testBotMsgsRes([
      {
        toSendText: cmd_addsbc_real_sbc,
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
      {
        toExpect: [
          (_) => {
            const dbSubcategory = _[0].clearedData;
            expect(dbSubcategory).toBeDefined();
          },
          (_) => {
            const dbSubcategory = _[0].clearedData;
            expect(dbSubcategory).toHaveProperty('created_at', mockCreatedDate);
          },
          (_) => {
            const dbSubcategory = _[0].clearedData;
            expect(dbSubcategory).toHaveProperty(
              'created_by_user_id',
              userIdStr,
            );
          },
          (_) => {
            const dbSubcategory = _[0].clearedData;
            expect(dbSubcategory).toHaveProperty('updated_at', null);
          },
          (_) => {
            const dbSubcategory = _[0].clearedData;
            expect(dbSubcategory).toHaveProperty('updated_by_user_id', null);
          },
          (_) => {
            const dbSubcategory = _[0].clearedData;
            expect(dbSubcategory).toHaveProperty('deleted_at', null);
          },
          (_) => {
            const dbSubcategory = _[0].clearedData;
            expect(dbSubcategory).toHaveProperty('deleted_by_user_id', null);
          },
          (_) => {
            const dbSubcategory = _[0].clearedData;
            expect(dbSubcategory).toHaveProperty('archived_at', null);
          },
          (_) => {
            const dbSubcategory = _[0].clearedData;
            expect(dbSubcategory).toHaveProperty('archived_by_user_id', null);
          },
        ],
      },
    ]));

  const cmd_delsbc = toCommand(BotCommandEnum.delsbc);
  const cmd_delsbc_real_sbc = `${cmd_delsbc} ${realSbcTitle}`;
  it(`"${cmd_delsbc_real_sbc}" should delete subcategory`, () =>
    testBotMsgsRes([
      {
        toSendText: cmd_delsbc_real_sbc,
        prepareDB: async () => {
          mockCreatedDate = new Date();
          setDTDate(mockCreatedDate);
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
            }),
          );
          await appBotMock.db.subcategories.add(
            { table_peer_id: chatId },
            checkAddSubcategory({
              title: realSbcTitle,
              peer_id: chatId,
              category_id: dbCategory.id,
              created_by_user_id: userIdStr,
            }),
          );
          mockDeleteDate = new Date();
          setDTDate(mockDeleteDate);
        },
        toBeMessage: new ToTranslate(TrKey.SBC_DELETED, userLangCode, {
          title: realSbcTitle,
        }),
        clearDB: async () => {
          const dbSubcategories = await appBotMock.db.subcategories.find({
            table_peer_id: chatId,
            title: realSbcTitle,
            peer_id: chatId,
            in_deleted: true,
          });
          return dbSubcategories[0];
        },
      },
      {
        toExpect: [
          (_) => {
            const dbSubcategory = _[0].clearedData;
            expect(dbSubcategory).toBeDefined();
          },
          (_) => {
            const dbSubcategory = _[0].clearedData;
            expect(dbSubcategory).toHaveProperty('created_at', mockCreatedDate);
          },
          (_) => {
            const dbSubcategory = _[0].clearedData;
            expect(dbSubcategory).toHaveProperty(
              'created_by_user_id',
              userIdStr,
            );
          },
          (_) => {
            const dbSubcategory = _[0].clearedData;
            expect(dbSubcategory).toHaveProperty('updated_at', null);
          },
          (_) => {
            const dbSubcategory = _[0].clearedData;
            expect(dbSubcategory).toHaveProperty('updated_by_user_id', null);
          },
          (_) => {
            const dbSubcategory = _[0].clearedData;
            expect(dbSubcategory).toHaveProperty('deleted_at', mockDeleteDate);
          },
          (_) => {
            const dbSubcategory = _[0].clearedData;
            expect(dbSubcategory).toHaveProperty(
              'deleted_by_user_id',
              userIdStr,
            );
          },
          (_) => {
            const dbSubcategory = _[0].clearedData;
            expect(dbSubcategory).toHaveProperty('archived_at', null);
          },
          (_) => {
            const dbSubcategory = _[0].clearedData;
            expect(dbSubcategory).toHaveProperty('archived_by_user_id', null);
          },
        ],
      },
    ]));

  const cmd_updsbcn = toCommand(BotCommandEnum.updsbcn);
  const realSbcTitle2 = '😄';
  const cmd_updsbcn_real_sbc = `${cmd_updsbcn} ${realSbcTitle} ${realSbcTitle2}`;
  it(`"${cmd_updsbcn_real_sbc}" should be resolved as updated subcategory title`, () =>
    testBotMsgsRes([
      {
        toSendText: cmd_updsbcn_real_sbc,
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
          const dbCategory = await appBotMock.db.categories.add(
            { table_peer_id: chatId },
            composeAddCategory({
              title: realCtgTitle,
              peer_id: chatId,
              created_by_user_id: userIdStr,
            }),
          );
          await appBotMock.db.subcategories.add(
            { table_peer_id: chatId },
            checkAddSubcategory({
              title: realSbcTitle,
              peer_id: chatId,
              category_id: dbCategory.id,
              created_by_user_id: userIdStr,
            }),
          );
          mockUpdatedDate = new Date();
          setDTDate(mockUpdatedDate);
        },
        toBeMessage: new ToTranslate(TrKey.SUBCTG_NAME_UPDATED, userLangCode, {
          oldTitle: realSbcTitle,
          newTitle: realSbcTitle2,
        }),
        clearDB: async () => {
          const dbSubcategories = await appBotMock.db.subcategories.find({
            table_peer_id: chatId,
            title: realSbcTitle2,
            peer_id: chatId,
          });
          return dbSubcategories[0];
        },
      },
      {
        toExpect: [
          (_) => {
            const dbSubcategory = _[0].clearedData;
            expect(dbSubcategory).toBeDefined();
          },
          (_) => {
            const dbSubcategory = _[0].clearedData;
            expect(dbSubcategory).toHaveProperty('created_at', mockCreatedDate);
          },
          (_) => {
            const dbSubcategory = _[0].clearedData;
            expect(dbSubcategory).toHaveProperty(
              'created_by_user_id',
              userIdStr,
            );
          },
          (_) => {
            const dbSubcategory = _[0].clearedData;
            expect(dbSubcategory).toHaveProperty('updated_at', mockUpdatedDate);
          },
          (_) => {
            const dbSubcategory = _[0].clearedData;
            expect(dbSubcategory).toHaveProperty(
              'updated_by_user_id',
              userIdStr,
            );
          },
          (_) => {
            const dbSubcategory = _[0].clearedData;
            expect(dbSubcategory).toHaveProperty('deleted_at', null);
          },
          (_) => {
            const dbSubcategory = _[0].clearedData;
            expect(dbSubcategory).toHaveProperty('deleted_by_user_id', null);
          },
          (_) => {
            const dbSubcategory = _[0].clearedData;
            expect(dbSubcategory).toHaveProperty('archived_at', null);
          },
          (_) => {
            const dbSubcategory = _[0].clearedData;
            expect(dbSubcategory).toHaveProperty('archived_by_user_id', null);
          },
        ],
      },
    ]));

  const newSbcDescr = 'this is new sbc desc';
  const cmd_updsbcd = toCommand(BotCommandEnum.updsbcd);
  const cmd_updsbcd_real_ctg = `${cmd_updsbcd} ${realSbcTitle} ${newSbcDescr}`;
  it(`"${cmd_updsbcd_real_ctg}" should be resolved as updated subcategory description`, () =>
    testBotMsgsRes([
      {
        toSendText: cmd_updsbcd_real_ctg,
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
          const dbCategory = await appBotMock.db.categories.add(
            { table_peer_id: chatId },
            composeAddCategory({
              title: realCtgTitle,
              peer_id: chatId,
              created_by_user_id: userIdStr,
            }),
          );
          await appBotMock.db.subcategories.add(
            { table_peer_id: chatId },
            checkAddSubcategory({
              title: realSbcTitle,
              peer_id: chatId,
              category_id: dbCategory.id,
              created_by_user_id: userIdStr,
            }),
          );
          mockUpdatedDate = new Date();
          setDTDate(mockUpdatedDate);
        },
        toBeMessage: new ToTranslate(TrKey.SUBCTG_DESC_UPDATED, userLangCode, {
          sbcTitle: realSbcTitle,
          oldDesc: '',
          newDesc: newSbcDescr,
        }),
        clearDB: async () => {
          const dbSubcategories = await appBotMock.db.subcategories.find({
            table_peer_id: chatId,
            title: realSbcTitle,
            peer_id: chatId,
          });
          return dbSubcategories[0];
        },
      },
      {
        toExpect: [
          (_) => {
            const dbSubcategory = _[0].clearedData;
            expect(dbSubcategory).toBeDefined();
          },
          (_) => {
            const dbSubcategory = _[0].clearedData;
            expect(dbSubcategory).toHaveProperty('created_at', mockCreatedDate);
          },
          (_) => {
            const dbSubcategory = _[0].clearedData;
            expect(dbSubcategory).toHaveProperty(
              'created_by_user_id',
              userIdStr,
            );
          },
          (_) => {
            const dbSubcategory = _[0].clearedData;
            expect(dbSubcategory).toHaveProperty('updated_at', mockUpdatedDate);
          },
          (_) => {
            const dbSubcategory = _[0].clearedData;
            expect(dbSubcategory).toHaveProperty(
              'updated_by_user_id',
              userIdStr,
            );
          },
          (_) => {
            const dbSubcategory = _[0].clearedData;
            expect(dbSubcategory).toHaveProperty('deleted_at', null);
          },
          (_) => {
            const dbSubcategory = _[0].clearedData;
            expect(dbSubcategory).toHaveProperty('deleted_by_user_id', null);
          },
          (_) => {
            const dbSubcategory = _[0].clearedData;
            expect(dbSubcategory).toHaveProperty('archived_at', null);
          },
          (_) => {
            const dbSubcategory = _[0].clearedData;
            expect(dbSubcategory).toHaveProperty('archived_by_user_id', null);
          },
        ],
      },
    ]));

  const cmd_undo_delsbc = toCommand(BotCommandEnum.undodelsbc);
  const cmd_undo_delsbc_real_sbc = `${cmd_undo_delsbc} ${realSbcTitle}`;
  it(`"${cmd_undo_delsbc_real_sbc}" should be resolved as restored from deleted subcategory`, () =>
    testBotMsgsRes([
      {
        toSendText: cmd_undo_delsbc_real_sbc,
        prepareDB: async () => {
          mockUpdatedDate = new Date();
          setDTDate(mockUpdatedDate);
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
            }),
          );
          await appBotMock.db.subcategories.add(
            { table_peer_id: chatId },
            createDeletedSubcategory({
              title: realSbcTitle,
              peer_id: chatId,
              category_id: dbCategory.id,
              created_by_user_id: userIdStr,
            }),
          );
        },
        toBeMessage: new ToTranslate(TrKey.SBC_UNDO_DELETED, userLangCode, {
          title: realSbcTitle,
        }),
        clearDB: async () => {
          const dbSubcategories = await appBotMock.db.subcategories.find({
            table_peer_id: chatId,
            title: realSbcTitle,
            peer_id: chatId,
          });
          return dbSubcategories[0];
        },
      },
      {
        toExpect: [
          (_) => {
            const dbSubcategory = _[0].clearedData;
            expect(dbSubcategory).toBeDefined();
          },
          (_) => {
            const dbSubcategory = _[0].clearedData;
            expect(dbSubcategory).toHaveProperty('created_at', mockUpdatedDate);
          },
          (_) => {
            const dbSubcategory = _[0].clearedData;
            expect(dbSubcategory).toHaveProperty(
              'created_by_user_id',
              userIdStr,
            );
          },
          (_) => {
            const dbSubcategory = _[0].clearedData;
            expect(dbSubcategory).toHaveProperty('updated_at', mockUpdatedDate);
          },
          (_) => {
            const dbSubcategory = _[0].clearedData;
            expect(dbSubcategory).toHaveProperty(
              'updated_by_user_id',
              userIdStr,
            );
          },
          (_) => {
            const dbSubcategory = _[0].clearedData;
            expect(dbSubcategory).toHaveProperty('deleted_at', null);
          },
          (_) => {
            const dbSubcategory = _[0].clearedData;
            expect(dbSubcategory).toHaveProperty('deleted_by_user_id', null);
          },
          (_) => {
            const dbSubcategory = _[0].clearedData;
            expect(dbSubcategory).toHaveProperty('archived_at', null);
          },
          (_) => {
            const dbSubcategory = _[0].clearedData;
            expect(dbSubcategory).toHaveProperty('archived_by_user_id', null);
          },
        ],
      },
    ]));

  const cmd_archsbc = toCommand(BotCommandEnum.archsbc);
  const cmd_archsbc_real_sbc = `${cmd_archsbc} ${realSbcTitle}`;
  it(`"${cmd_archsbc_real_sbc}" should archive subcategory`, () =>
    testBotMsgsRes([
      {
        toSendText: cmd_archsbc_real_sbc,
        prepareDB: async () => {
          mockCreatedDate = new Date();
          setDTDate(mockCreatedDate);
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
            }),
          );
          await appBotMock.db.subcategories.add(
            { table_peer_id: chatId },
            checkAddSubcategory({
              title: realSbcTitle,
              peer_id: chatId,
              category_id: dbCategory.id,
              created_by_user_id: userIdStr,
            }),
          );
          mockArchivedDate = new Date();
          setDTDate(mockArchivedDate);
        },
        toBeMessage: new ToTranslate(TrKey.SBC_ARCHIVED, userLangCode, {
          title: realSbcTitle,
        }),
        clearDB: async () => {
          const dbSubcategories = await appBotMock.db.subcategories.find({
            table_peer_id: chatId,
            title: realSbcTitle,
            peer_id: chatId,
            in_archived: true,
          });
          return dbSubcategories[0];
        },
      },
      {
        toExpect: [
          (_) => {
            const dbSubcategory = _[0].clearedData;
            expect(dbSubcategory).toBeDefined();
          },
          (_) => {
            const dbSubcategory = _[0].clearedData;
            expect(dbSubcategory).toHaveProperty('created_at', mockCreatedDate);
          },
          (_) => {
            const dbSubcategory = _[0].clearedData;
            expect(dbSubcategory).toHaveProperty(
              'created_by_user_id',
              userIdStr,
            );
          },
          (_) => {
            const dbSubcategory = _[0].clearedData;
            expect(dbSubcategory).toHaveProperty('updated_at', null);
          },
          (_) => {
            const dbSubcategory = _[0].clearedData;
            expect(dbSubcategory).toHaveProperty('updated_by_user_id', null);
          },
          (_) => {
            const dbSubcategory = _[0].clearedData;
            expect(dbSubcategory).toHaveProperty('deleted_at', null);
          },
          (_) => {
            const dbSubcategory = _[0].clearedData;
            expect(dbSubcategory).toHaveProperty('deleted_by_user_id', null);
          },
          (_) => {
            const dbSubcategory = _[0].clearedData;
            expect(dbSubcategory).toHaveProperty(
              'archived_at',
              mockArchivedDate,
            );
          },
          (_) => {
            const dbSubcategory = _[0].clearedData;
            expect(dbSubcategory).toHaveProperty(
              'archived_by_user_id',
              userIdStr,
            );
          },
        ],
      },
    ]));

  const cmd_undo_archsbc = toCommand(BotCommandEnum.undoarchsbc);
  const cmd_undo_archsbc_real_sbc = `${cmd_undo_archsbc} ${realSbcTitle}`;
  it(`"${cmd_undo_archsbc_real_sbc}" should be resolved as restored from archived subcategory`, () =>
    testBotMsgsRes([
      {
        toSendText: cmd_undo_archsbc_real_sbc,
        prepareDB: async () => {
          mockUpdatedDate = new Date();
          setDTDate(mockUpdatedDate);
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
            }),
          );
          await appBotMock.db.subcategories.add(
            { table_peer_id: chatId },
            createArchivedSubcategory({
              title: realSbcTitle,
              peer_id: chatId,
              category_id: dbCategory.id,
              created_by_user_id: userIdStr,
            }),
          );
        },
        toBeMessage: new ToTranslate(TrKey.SBC_UNDO_ARCHIVED, userLangCode, {
          title: realSbcTitle,
        }),
        clearDB: async () => {
          const dbSubcategories = await appBotMock.db.subcategories.find({
            table_peer_id: chatId,
            title: realSbcTitle,
            peer_id: chatId,
          });
          return dbSubcategories[0];
        },
      },
      {
        toExpect: [
          (_) => {
            const dbSubcategory = _[0].clearedData;
            expect(dbSubcategory).toBeDefined();
          },
          (_) => {
            const dbSubcategory = _[0].clearedData;
            expect(dbSubcategory).toHaveProperty('created_at', mockUpdatedDate);
          },
          (_) => {
            const dbSubcategory = _[0].clearedData;
            expect(dbSubcategory).toHaveProperty(
              'created_by_user_id',
              userIdStr,
            );
          },
          (_) => {
            const dbSubcategory = _[0].clearedData;
            expect(dbSubcategory).toHaveProperty('updated_at', mockUpdatedDate);
          },
          (_) => {
            const dbSubcategory = _[0].clearedData;
            expect(dbSubcategory).toHaveProperty(
              'updated_by_user_id',
              userIdStr,
            );
          },
          (_) => {
            const dbSubcategory = _[0].clearedData;
            expect(dbSubcategory).toHaveProperty('deleted_at', null);
          },
          (_) => {
            const dbSubcategory = _[0].clearedData;
            expect(dbSubcategory).toHaveProperty('deleted_by_user_id', null);
          },
          (_) => {
            const dbSubcategory = _[0].clearedData;
            expect(dbSubcategory).toHaveProperty('archived_at', null);
          },
          (_) => {
            const dbSubcategory = _[0].clearedData;
            expect(dbSubcategory).toHaveProperty('archived_by_user_id', null);
          },
        ],
      },
    ]));

  afterAll(async () => {
    setDTDate();
    await destroyBotMockApp(appBotMock);
  });
});
