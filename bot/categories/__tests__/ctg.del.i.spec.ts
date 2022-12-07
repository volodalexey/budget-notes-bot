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
  CategoryDBModel,
  generateCategoryCreatedTranslations,
  DEFAULT_CTG_TYPE,
} from '../../../db/models/categoryModel';
import {
  checkAddSubcategory,
  createDeletedSubcategory,
  printSbcTitles,
} from '../../../db/models/subcategoryModel';
import {
  composeAddNote,
  printNtIds,
  createDeletedNote,
} from '../../../db/models/noteModel';

import {
  toCommand,
  BotCommandEnum,
  generateInvInstruction,
} from '../../helpers';
import { parseUserDateTimeToUTC } from '../../datetime';
import { CommandParameterName, PARAMS_EQ } from '../../parameters';
import { AppTestConfigT } from '../../../config/config';

describe('Check Catigories delete command handlers', () => {
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

  const cmd_delctg = toCommand(BotCommandEnum.delctg);
  it(`"${cmd_delctg}" should be rejected without arguments`, () =>
    testBotMsgsRes([
      {
        toSendText: cmd_delctg,
        toBeMessage: generateInvInstruction(
          TrKey.INVALID_DEL_CTG_CMD,
          BotCommandEnum.delctg,
          userLangCode,
        ),
      },
    ]));

  const cmd_delctg_amb = `${cmd_delctg} categoryTitle ...`;
  it(`"${cmd_delctg_amb}" should be rejected as of too many arguments`, () =>
    testBotMsgsRes([
      {
        toSendText: cmd_delctg,
        toBeMessage: generateInvInstruction(
          TrKey.INVALID_DEL_CTG_CMD,
          BotCommandEnum.delctg,
          userLangCode,
        ),
      },
    ]));

  const fakeCtgTitle = 'fakeCtgTitle';
  const cmd_delctg_fake_ctg = `${cmd_delctg} ${fakeCtgTitle}`;
  it(`"${cmd_delctg_fake_ctg}" should be rejected as of not existing category`, () =>
    testBotMsgsRes([
      {
        toSendText: cmd_delctg_fake_ctg,
        prepareDB: async () => {
          await appBotMock.db.notes.deleteAll({
            table_peer_id: chatId,
            peer_id: chatId,
          });
          await appBotMock.db.categories.deleteAll({
            table_peer_id: chatId,
            peer_id: chatId,
          });
          await appBotMock.db.categories.add(
            { table_peer_id: chatId },
            createDeletedCategory({
              title: fakeCtgTitle,
              peer_id: chatId,
              created_by_user_id: userIdStr,
            }),
          );
        },
        toBeMessage: new ToTranslate(
          TrKey.CTG_NOT_EXISTS_BY_TITLE,
          userLangCode,
          { title: fakeCtgTitle },
        ),
      },
    ]));

  const realCtgTitle = 'realCtgTitle';
  const cmd_delctg_real_ctg = `${cmd_delctg} ${realCtgTitle}`;
  it(`"${cmd_delctg_real_ctg}" should be resolved as deleted category`, () =>
    testBotMsgsRes([
      {
        toSendText: cmd_delctg_real_ctg,
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
        toBeMessage: new ToTranslate(TrKey.CTG_DELETED, userLangCode, {
          title: realCtgTitle,
        }),
      },
    ]));

  const realSbcTitle = '😃';
  const realSbcTitle2 = '😃a';
  const cmd_delctg_real_sbc = `${cmd_delctg} ${realCtgTitle}`;
  it(`"${cmd_delctg_real_sbc}" should be resolved as deleted category and connected subcategories and notes`, () =>
    testBotMsgsRes([
      {
        toSendText: cmd_delctg_real_sbc,
        prepareDB: async () => {
          serverNowDate = parseUserDateTimeToUTC(
            '2019.02.09 12:00',
            config.test.user_time_zone,
          );
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
          const dbSbc1 = await appBotMock.db.subcategories.add(
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
          const dbSbc2 = await appBotMock.db.subcategories.add(
            { table_peer_id: chatId },
            checkAddSubcategory({
              title: realSbcTitle2,
              peer_id: chatId,
              category_id: dbCategory.id,
              created_by_user_id: userIdStr,
              created_at: serverNowDate
                ? new Date(serverNowDate.getTime() + 2)
                : undefined,
            }),
          );
          const dbSbc3 = await appBotMock.db.subcategories.add(
            { table_peer_id: chatId },
            createDeletedSubcategory({
              title: realSbcTitle,
              peer_id: chatId,
              category_id: dbCategory.id,
              created_by_user_id: userIdStr,
              created_at: serverNowDate
                ? new Date(serverNowDate.getTime() + 3)
                : undefined,
            }),
          );
          const dbNote1 = await appBotMock.db.notes.add(
            { table_peer_id: chatId },
            composeAddNote({
              peer_id: chatId,
              category_id: dbCategory.id,
              created_by_user_id: userIdStr,
              note_number: 15.9,
              created_at: serverNowDate
                ? new Date(serverNowDate.getTime() + 4)
                : undefined,
            }),
          );
          const dbNote2 = await appBotMock.db.notes.add(
            { table_peer_id: chatId },
            composeAddNote({
              peer_id: chatId,
              category_id: dbCategory.id,
              created_by_user_id: userIdStr,
              note_number: 15.9,
              subcategory_id: dbSbc2.id,
              created_at: serverNowDate
                ? new Date(serverNowDate.getTime() + 5)
                : undefined,
            }),
          );
          return { dbSbc1, dbSbc2, dbSbc3, dbNote1, dbNote2 };
        },
        toBeMessage: (_, { dbSbc1, dbSbc2, dbNote1, dbNote2 }) =>
          new ToTranslate(TrKey.CTG_DELETED_WITH_SBC_AND_NT, userLangCode, {
            title: realCtgTitle,
            sbcTitles: printSbcTitles([dbSbc1, dbSbc2]),
            ntIds: printNtIds([dbNote1, dbNote2]),
          }),
      },
    ]));

  const realCtgTitle2 = 'realCtgTitle2';
  const cmd_delctg_real_ctg2 = `${cmd_delctg} ${realCtgTitle2}`;
  it(`"${cmd_delctg_real_ctg2}" should be resolved as deleted category and connected subcategories`, () =>
    testBotMsgsRes([
      {
        toSendText: cmd_delctg_real_ctg2,
        prepareDB: async () => {
          serverNowDate = parseUserDateTimeToUTC(
            '2019.02.09 12:00',
            config.test.user_time_zone,
          );
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
          const dbSbc1 = await appBotMock.db.subcategories.add(
            { table_peer_id: chatId },
            checkAddSubcategory({
              title: realSbcTitle,
              peer_id: chatId,
              category_id: dbCategory2.id,
              created_by_user_id: userIdStr,
              created_at: serverNowDate
                ? new Date(serverNowDate.getTime() + 2)
                : undefined,
            }),
          );
          const dbSbc2 = await appBotMock.db.subcategories.add(
            { table_peer_id: chatId },
            checkAddSubcategory({
              title: realSbcTitle2,
              peer_id: chatId,
              category_id: dbCategory2.id,
              created_by_user_id: userIdStr,
              created_at: serverNowDate
                ? new Date(serverNowDate.getTime() + 3)
                : undefined,
            }),
          );
          const dbSbc3 = await appBotMock.db.subcategories.add(
            { table_peer_id: chatId },
            createDeletedSubcategory({
              title: realSbcTitle2,
              peer_id: chatId,
              category_id: dbCategory2.id,
              created_by_user_id: userIdStr,
              created_at: serverNowDate
                ? new Date(serverNowDate.getTime() + 4)
                : undefined,
            }),
          );
          const dbNote1 = await appBotMock.db.notes.add(
            { table_peer_id: chatId },
            createDeletedNote({
              peer_id: chatId,
              category_id: dbCategory2.id,
              created_by_user_id: userIdStr,
              note_number: 15.9,
              created_at: serverNowDate
                ? new Date(serverNowDate.getTime() + 5)
                : undefined,
            }),
          );
          return { dbSbc1, dbSbc2, dbSbc3, dbNote1 };
        },
        toBeMessage: (_, { dbSbc1, dbSbc2 }) =>
          new ToTranslate(TrKey.CTG_DELETED_WITH_SBC, userLangCode, {
            title: realCtgTitle2,
            sbcTitles: printSbcTitles([dbSbc1, dbSbc2]),
          }),
      },
    ]));

  it(`"${cmd_delctg_real_ctg}" should be resolved as deleted category and connected notes`, () =>
    testBotMsgsRes([
      {
        toSendText: cmd_delctg_real_ctg,
        prepareDB: async () => {
          serverNowDate = parseUserDateTimeToUTC(
            '2019.02.09 12:00',
            config.test.user_time_zone,
          );
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
            createDeletedSubcategory({
              title: realSbcTitle,
              peer_id: chatId,
              category_id: dbCategory1.id,
              created_by_user_id: userIdStr,
              created_at: serverNowDate
                ? new Date(serverNowDate.getTime() + 2)
                : undefined,
            }),
          );
          const dbNote1 = await appBotMock.db.notes.add(
            { table_peer_id: chatId },
            createDeletedNote({
              peer_id: chatId,
              category_id: dbCategory1.id,
              created_by_user_id: userIdStr,
              note_number: 15.9,
              created_at: serverNowDate
                ? new Date(serverNowDate.getTime() + 3)
                : undefined,
            }),
          );
          const dbNote2 = await appBotMock.db.notes.add(
            { table_peer_id: chatId },
            composeAddNote({
              peer_id: chatId,
              category_id: dbCategory1.id,
              created_by_user_id: userIdStr,
              note_text: 'dddf',
              created_at: serverNowDate
                ? new Date(serverNowDate.getTime() + 4)
                : undefined,
            }),
          );
          return { dbCategory1, dbNote1, dbNote2 };
        },
        toBeMessage: (_, { dbNote2 }) =>
          new ToTranslate(TrKey.CTG_DELETED_WITH_NT, userLangCode, {
            title: realCtgTitle,
            ntIds: printNtIds([dbNote2]),
          }),
      },
    ]));

  const cmd_delctg_amb_title = `${cmd_delctg} ${realCtgTitle} [${CommandParameterName.ctgTitle}${PARAMS_EQ}${realCtgTitle}]`;
  it(`"${cmd_delctg_amb_title}" should be rejected as of title parameter and text at the same time`, () =>
    testBotMsgsRes([
      {
        toSendText: cmd_delctg_amb_title,
        toBeMessage: new ToTranslate(
          TrKey.PARAM_AMBIGUOUS_ERROR,
          userLangCode,
          {
            parName: CommandParameterName.ctgTitle,
          },
        ),
      },
    ]));

  const cmd_delctg_amb_id = `${cmd_delctg} ${realCtgTitle} [${CommandParameterName.ctgId}${PARAMS_EQ}123]`;
  it(`"${cmd_delctg_amb_id}" should be rejected as of id parameter and text at the same time`, () =>
    testBotMsgsRes([
      {
        toSendText: cmd_delctg_amb_id,
        toBeMessage: new ToTranslate(
          TrKey.PARAM_AMBIGUOUS_ERROR,
          userLangCode,
          {
            parName: CommandParameterName.ctgId,
          },
        ),
      },
    ]));

  const cmd_delctg_unreal_param_id = `${cmd_delctg} 223 [${CommandParameterName.ctgId}${PARAMS_EQ}123]`;
  it(`"${cmd_delctg_unreal_param_id}" should be rejected as of id parameter and text-number at the same time`, () =>
    testBotMsgsRes([
      {
        toSendText: cmd_delctg_unreal_param_id,
        toBeMessage: new ToTranslate(
          TrKey.PARAM_AMBIGUOUS_ERROR,
          userLangCode,
          {
            parName: CommandParameterName.ctgId,
          },
        ),
      },
    ]));

  const fakeCtgId = 9999999999999;
  const cmd_delctg_by_fake_id = `${cmd_delctg} [${CommandParameterName.ctgId}${PARAMS_EQ}${fakeCtgId}]`;
  it(`"${cmd_delctg_by_fake_id}" should be rejected as of not existing category by id parameter`, () =>
    testBotMsgsRes([
      {
        toSendText: cmd_delctg_by_fake_id,
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
        toBeMessage: new ToTranslate(TrKey.CTG_NOT_EXISTS_BY_ID, userLangCode, {
          id: fakeCtgId,
        }),
      },
    ]));

  it(`"${cmd_delctg} [${CommandParameterName.ctgId}${PARAMS_EQ}id]" should be resolved as deleted category by id parameter`, () =>
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
          return { dbCtg };
        },
        toSendText: (_, { dbCtg }: { dbCtg: CategoryDBModel }) =>
          `${cmd_delctg} [${CommandParameterName.ctgId}${PARAMS_EQ}${dbCtg.id}]`,
        toBeMessage: (_) => {
          const ret = _[0].preparedData;
          return new ToTranslate(TrKey.CTG_DELETED, userLangCode, {
            title: (ret.dbCtg as CategoryDBModel).title,
          });
        },
      },
    ]));

  it(`should delete category by reply to response text when adding ctg`, () =>
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
        },
        toSendText: () => `${toCommand(BotCommandEnum.addctg)} ${realCtgTitle}`,
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
        toSendText: () => `${cmd_delctg}`,
        messageClosureForReply: (_) => _[0].lastMessage,
        toBeMessage: (_) => {
          return new ToTranslate(TrKey.CTG_DELETED, userLangCode, {
            title: _[0].clearedData.title,
          });
        },
      },
    ]));

  afterAll(() => destroyBotMockApp(appBotMock));
});
