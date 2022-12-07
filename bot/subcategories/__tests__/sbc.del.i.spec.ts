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
  printListCategories,
  DEFAULT_LIST_CTG_LIMIT,
  DEFAULT_CTG_TYPE,
} from '../../../db/models/categoryModel';
import {
  checkAddSubcategory,
  createDeletedSubcategory,
  generateSubcategoryCreatedTranslations,
  SubcategoryDBModel,
} from '../../../db/models/subcategoryModel';
import {
  createDeletedNote,
  composeAddNote,
  printNtIds,
} from '../../../db/models/noteModel';

import {
  toCommand,
  BotCommandEnum,
  generateInvInstruction,
  toListHeader,
} from '../../helpers';
import { parseUserDateTimeToUTC } from '../../datetime';
import { CommandParameterName, PARAMS_EQ } from '../../parameters';
import { AppTestConfigT } from '../../../config/config';

describe('Check subcategories delete command handlers', () => {
  let appBotMock: AppBotMockI;
  let config: AppTestConfigT;
  let testBotMsgsRes: PreparedTestBotMessages;
  let userLangCode: LanguageEnum;
  let chatId: number;
  let userIdStr: string;

  let serverNowDate: Date | undefined;

  beforeAll(async () => {
    appBotMock = await startBotMockApp();
    config = appBotMock.config;
    userLangCode = appBotMock.userLangCode;
    chatId = appBotMock.chatId;
    userIdStr = appBotMock.user.id;
    testBotMsgsRes = CreateMockTestBotMessageResponses({ appBotMock });
  });

  const cmd_delsbc = toCommand(BotCommandEnum.delsbc);
  it(`"${cmd_delsbc}" should be rejected without arguments`, () =>
    testBotMsgsRes([
      {
        toSendText: cmd_delsbc,
        toBeMessage: generateInvInstruction(
          TrKey.INVALID_DEL_SBC_CMD,
          BotCommandEnum.delsbc,
          userLangCode,
        ),
      },
    ]));

  const cmd_delsbc_amb = `${cmd_delsbc} sbcTitle ...`;
  it(`"${cmd_delsbc_amb}" should be rejected as of too many arguments`, () =>
    testBotMsgsRes([
      {
        toSendText: cmd_delsbc_amb,
        toBeMessage: generateInvInstruction(
          TrKey.INVALID_DEL_SBC_CMD,
          BotCommandEnum.delsbc,
          userLangCode,
        ),
      },
    ]));

  const fakeSbcTitle = 'fakeSbcTitle';
  const cmd_delsbc_fake_sbc = `${cmd_delsbc} ${fakeSbcTitle}`;
  const realCtgTitle = 'realCtgTitle';
  const realSbcTitle = '⛔';
  it(`"${cmd_delsbc_fake_sbc}" should be rejected as of not existing subcategory`, () =>
    testBotMsgsRes([
      {
        toSendText: cmd_delsbc_fake_sbc,
        prepareDB: async () => {
          serverNowDate = parseUserDateTimeToUTC(
            '2019.02.09 12:00',
            config.user.time_zone,
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
            createDeletedSubcategory({
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
        toBeMessage: new ToTranslate(
          TrKey.SBC_NOT_EXISTS_BY_TITLE,
          userLangCode,
          { title: fakeSbcTitle },
        ),
      },
    ]));

  const cmd_delsbc_real_sbc = `${cmd_delsbc} ${realSbcTitle}`;
  it(`"${cmd_delsbc_real_sbc}" should be resolved as deleted subcategory`, () =>
    testBotMsgsRes([
      {
        toSendText: cmd_delsbc_real_sbc,
        prepareDB: async () => {
          serverNowDate = parseUserDateTimeToUTC(
            '2019.02.09 12:00',
            config.user.time_zone,
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
          await appBotMock.db.subcategories.add(
            { table_peer_id: chatId },
            createDeletedSubcategory({
              title: realSbcTitle,
              peer_id: chatId,
              category_id: dbCategory.id,
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
        },
        toBeMessage: new ToTranslate(TrKey.SBC_DELETED, userLangCode, {
          title: realSbcTitle,
        }),
        clearDB: async () => {
          const dbCategoriesJoinSbc1 =
            await appBotMock.db.categories.findJoinSbc({
              table_peer_id: chatId,
              title: realCtgTitle,
              peer_id: chatId,
            });
          return { dbCategoryJoinSbc1: dbCategoriesJoinSbc1[0] };
        },
      },
      {
        toSendText: cmd_delsbc_real_sbc,
        toBeMessage: new ToTranslate(
          TrKey.SBC_NOT_EXISTS_BY_TITLE,
          userLangCode,
          { title: realSbcTitle },
        ),
      },
      {
        toSendText: `${toCommand(BotCommandEnum.listctg)}`,
        toBeMessage: (_) => {
          return toListHeader(
            { limitNum: DEFAULT_LIST_CTG_LIMIT, ctgCount: 1 },
            new ToTranslate(TrKey.YOUR_CATEGORIES, userLangCode, {
              text: printListCategories({
                categories: [_[0].clearedData.dbCategoryJoinSbc1],
              }),
            }),
            userLangCode,
          );
        },
      },
      {
        toSendText: `${toCommand(BotCommandEnum.listsbc)}`,
        toBeText: () => `(лимит "30")
Нет подкатегорий`,
      },
    ]));

  it(`"${cmd_delsbc_real_sbc}" should be resolved as deleted subcategory`, () =>
    testBotMsgsRes([
      {
        toSendText: cmd_delsbc_real_sbc,
        prepareDB: async () => {
          serverNowDate = parseUserDateTimeToUTC(
            '2019.02.09 12:00',
            config.user.time_zone,
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
              created_at: serverNowDate
                ? new Date(serverNowDate.getTime())
                : undefined,
            }),
          );
          const dbSubcategory1 = await appBotMock.db.subcategories.add(
            { table_peer_id: chatId },
            checkAddSubcategory({
              title: realSbcTitle,
              peer_id: chatId,
              category_id: dbCategory1.id,
              created_by_user_id: userIdStr,
              created_at: serverNowDate
                ? new Date(serverNowDate.getTime() + 1)
                : undefined,
            }),
          );
          const dbNote1 = await appBotMock.db.notes.add(
            { table_peer_id: chatId },
            createDeletedNote({
              peer_id: chatId,
              category_id: dbCategory1.id,
              subcategory_id: dbSubcategory1.id,
              created_by_user_id: userIdStr,
              note_number: 15.9,
              created_at: serverNowDate
                ? new Date(serverNowDate.getTime() + 2)
                : undefined,
            }),
          );
          const dbNote2 = await appBotMock.db.notes.add(
            { table_peer_id: chatId },
            composeAddNote({
              peer_id: chatId,
              category_id: dbCategory1.id,
              subcategory_id: dbSubcategory1.id,
              created_by_user_id: userIdStr,
              note_text: 'dddf',
              created_at: serverNowDate
                ? new Date(serverNowDate.getTime() + 3)
                : undefined,
            }),
          );
          const dbNote3 = await appBotMock.db.notes.add(
            { table_peer_id: chatId },
            composeAddNote({
              peer_id: chatId,
              category_id: dbCategory1.id,
              subcategory_id: dbSubcategory1.id,
              created_by_user_id: userIdStr,
              note_number: 45.1,
              created_at: serverNowDate
                ? new Date(serverNowDate.getTime() + 4)
                : undefined,
            }),
          );
          return { dbNote1, dbNote2, dbNote3 };
        },
        toBeMessage: (_, { dbNote2, dbNote3 }) =>
          new ToTranslate(TrKey.SBC_DELETED_WITH_NT, userLangCode, {
            title: realSbcTitle,
            ntIds: printNtIds([dbNote2, dbNote3]),
          }),
      },
    ]));

  const cmd_delsbc_amb_title = `${cmd_delsbc} ${realSbcTitle} [${CommandParameterName.sbcTitle}${PARAMS_EQ}${realSbcTitle}]`;
  it(`"${cmd_delsbc_amb_title}" should be rejected as of title parameter and text at the same time`, () =>
    testBotMsgsRes([
      {
        toSendText: cmd_delsbc_amb_title,
        toBeMessage: new ToTranslate(
          TrKey.PARAM_AMBIGUOUS_ERROR,
          userLangCode,
          {
            parName: CommandParameterName.sbcTitle,
          },
        ),
      },
    ]));

  const cmd_delsbc_amb_id = `${cmd_delsbc} ${realSbcTitle} [${CommandParameterName.sbcId}${PARAMS_EQ}123]`;
  it(`"${cmd_delsbc_amb_id}" should be rejected as of id parameter and text at the same time`, () =>
    testBotMsgsRes([
      {
        toSendText: cmd_delsbc_amb_id,
        toBeMessage: new ToTranslate(
          TrKey.PARAM_AMBIGUOUS_ERROR,
          userLangCode,
          {
            parName: CommandParameterName.sbcId,
          },
        ),
      },
    ]));

  const cmd_delsbc_unreal_param_id = `${cmd_delsbc} 223 [${CommandParameterName.sbcId}${PARAMS_EQ}123]`;
  it(`"${cmd_delsbc_unreal_param_id}" should be rejected as of id parameter and text-number at the same time`, () =>
    testBotMsgsRes([
      {
        toSendText: cmd_delsbc_unreal_param_id,
        toBeMessage: new ToTranslate(
          TrKey.PARAM_AMBIGUOUS_ERROR,
          userLangCode,
          {
            parName: CommandParameterName.sbcId,
          },
        ),
      },
    ]));

  const fakeSbcId = 9999999999999;
  const cmd_delsbc_by_fake_id = `${cmd_delsbc} [${CommandParameterName.sbcId}${PARAMS_EQ}${fakeSbcId}]`;
  it(`"${cmd_delsbc_by_fake_id}" should be rejected as of not existing subcategory by id parameter`, () =>
    testBotMsgsRes([
      {
        toSendText: cmd_delsbc_by_fake_id,
        prepareDB: async () => {
          await appBotMock.db.notes.deleteAll({
            table_peer_id: chatId,
            peer_id: chatId,
          });
          await appBotMock.db.subcategories.deleteAll({
            table_peer_id: chatId,
            peer_id: chatId,
          });
          await appBotMock.db.categories.deleteAll({
            table_peer_id: chatId,
            peer_id: chatId,
          });
        },
        toBeMessage: new ToTranslate(TrKey.SBC_NOT_EXISTS_BY_ID, userLangCode, {
          id: fakeSbcId,
        }),
      },
    ]));

  it(`"${cmd_delsbc} [${CommandParameterName.sbcId}${PARAMS_EQ}id]" should be resolved as deleted subcategory by id parameter`, () =>
    testBotMsgsRes([
      {
        prepareDB: async () => {
          await appBotMock.db.notes.deleteAll({
            table_peer_id: chatId,
            peer_id: chatId,
          });
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
          const dbSbc = await appBotMock.db.subcategories.add(
            { table_peer_id: chatId },
            checkAddSubcategory({
              title: realSbcTitle,
              peer_id: chatId,
              category_id: dbCtg.id,
              created_by_user_id: userIdStr,
              created_at: serverNowDate
                ? new Date(serverNowDate.getTime() + 1)
                : undefined,
            }),
          );
          return { dbSbc };
        },
        toSendText: (_, { dbSbc }: { dbSbc: SubcategoryDBModel }) =>
          `${cmd_delsbc} [${CommandParameterName.sbcId}${PARAMS_EQ}${dbSbc.id}]`,
        toBeMessage: (_) => {
          const ret = _[0].preparedData;
          return new ToTranslate(TrKey.SBC_DELETED, userLangCode, {
            title: (ret.dbSbc as SubcategoryDBModel).title,
          });
        },
      },
    ]));

  it(`should delete subcategory by reply to response text when adding sbc`, () =>
    testBotMsgsRes([
      {
        prepareDB: async () => {
          await appBotMock.db.notes.deleteAll({
            table_peer_id: chatId,
            peer_id: chatId,
          });
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
        toSendText: (_) =>
          `${toCommand(BotCommandEnum.addsbc)} [${
            CommandParameterName.ctgId
          }${PARAMS_EQ}${_[0].preparedData.id} ${
            CommandParameterName.sbcTitle
          }${PARAMS_EQ}${realSbcTitle}]`,
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
                subcategoryDescription: _[0].clearedData.description,
                categoryType: DEFAULT_CTG_TYPE,
                categoryTitle: realCtgTitle,
                lang: userLangCode,
              }),
            },
            ['createdFields'],
          ),
      },
      {
        toSendText: () => `${cmd_delsbc}`,
        messageClosureForReply: (_) => _[0].lastMessage,
        toBeMessage: (_) => {
          return new ToTranslate(TrKey.SBC_DELETED, userLangCode, {
            title: _[0].clearedData.title,
          });
        },
      },
    ]));

  afterAll(() => destroyBotMockApp(appBotMock));
});
