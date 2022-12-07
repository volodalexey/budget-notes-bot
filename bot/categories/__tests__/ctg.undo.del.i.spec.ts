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
import { parseUserDateTimeToUTC, setDTDate } from '../../datetime';
import { CommandParameterName, PARAMS_EQ } from '../../parameters';
import { AppTestConfigT } from '../../../config/config';

describe('Check Catigories undo delete command handlers', () => {
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

  const cmd_undo_delctg = toCommand(BotCommandEnum.undodelctg);
  it(`"${cmd_undo_delctg}" should be rejected without arguments`, () =>
    testBotMsgsRes([
      {
        toSendText: cmd_undo_delctg,
        toBeMessage: generateInvInstruction(
          TrKey.INVALID_UNDO_DEL_CTG_CMD,
          BotCommandEnum.undodelctg,
          userLangCode,
        ),
      },
    ]));

  const cmd_undo_delctg_amb = `${cmd_undo_delctg} categoryTitle ...`;
  it(`"${cmd_undo_delctg_amb}" should be rejected as of too many arguments`, () =>
    testBotMsgsRes([
      {
        toSendText: cmd_undo_delctg,
        toBeMessage: generateInvInstruction(
          TrKey.INVALID_UNDO_DEL_CTG_CMD,
          BotCommandEnum.undodelctg,
          userLangCode,
        ),
      },
    ]));

  const fakeCtgTitle = 'fakeCtgTitle';
  const realCtgTitle = 'realCtgTitle';
  const cmd_undo_delctg_fake_ctg = `${cmd_undo_delctg} ${fakeCtgTitle}`;
  it(`"${cmd_undo_delctg_fake_ctg}" should be rejected as of not existing deleted category`, () =>
    testBotMsgsRes([
      {
        toSendText: cmd_undo_delctg_fake_ctg,
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
          TrKey.CTG_NOT_EXISTS_BY_TITLE,
          userLangCode,
          { title: fakeCtgTitle },
        ),
      },
    ]));

  it(`"${cmd_undo_delctg_fake_ctg}" should be rejected as of already active category with the same name`, () =>
    testBotMsgsRes([
      {
        toSendText: cmd_undo_delctg_fake_ctg,
        prepareDB: async () => {
          serverNowDate = parseUserDateTimeToUTC(
            '2019.04.09 12:00',
            config.user.time_zone,
          );
          await appBotMock.db.categories.deleteAll({
            table_peer_id: chatId,
            peer_id: chatId,
          });
          await appBotMock.db.categories.add(
            { table_peer_id: chatId },
            composeAddCategory({
              title: fakeCtgTitle,
              peer_id: chatId,
              created_by_user_id: userIdStr,
              created_at: serverNowDate
                ? new Date(serverNowDate.getTime())
                : undefined,
            }),
          );
          await appBotMock.db.categories.add(
            { table_peer_id: chatId },
            createDeletedCategory({
              title: fakeCtgTitle,
              peer_id: chatId,
              created_by_user_id: userIdStr,
              created_at: serverNowDate
                ? new Date(serverNowDate.getTime() + 1)
                : undefined,
            }),
          );
        },
        toBeMessage: new ToTranslate(TrKey.CATEGORY_EXISTS, userLangCode, {
          title: fakeCtgTitle,
        }),
      },
    ]));

  it(`"${cmd_undo_delctg_fake_ctg}" should be rejected as of already active subcategory with the same name`, () =>
    testBotMsgsRes([
      {
        toSendText: cmd_undo_delctg_fake_ctg,
        prepareDB: async () => {
          serverNowDate = parseUserDateTimeToUTC(
            '2019.04.09 12:00',
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
            checkAddSubcategory({
              title: fakeCtgTitle,
              peer_id: chatId,
              category_id: dbCategory.id,
              created_by_user_id: userIdStr,
              created_at: serverNowDate
                ? new Date(serverNowDate.getTime() + 1)
                : undefined,
            }),
          );
          await appBotMock.db.categories.add(
            { table_peer_id: chatId },
            createDeletedCategory({
              title: fakeCtgTitle,
              peer_id: chatId,
              created_by_user_id: userIdStr,
              created_at: serverNowDate
                ? new Date(serverNowDate.getTime() + 2)
                : undefined,
            }),
          );
        },
        toBeMessage: new ToTranslate(TrKey.SUBCTG_EXISTS, userLangCode, {
          title: fakeCtgTitle,
        }),
        clearDB: () =>
          appBotMock.db.subcategories.deleteAll({
            table_peer_id: chatId,
            peer_id: chatId,
          }),
      },
    ]));

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
          serverNowDate = parseUserDateTimeToUTC(
            '2019.04.09 12:00',
            config.user.time_zone,
          );
          setDTDate(serverNowDate);
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
          serverNowDate = parseUserDateTimeToUTC(
            '2019.03.09 12:00',
            config.user.time_zone,
          );
          setDTDate(serverNowDate);
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
          serverNowDate = parseUserDateTimeToUTC(
            '2019.02.09 12:00',
            config.user.time_zone,
          );
          setDTDate(serverNowDate);
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
          serverNowDate = parseUserDateTimeToUTC(
            '2019.09.09 12:00',
            config.user.time_zone,
          );
          setDTDate(serverNowDate);
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
            expect(dbCategory).toHaveProperty(
              'created_at',
              parseUserDateTimeToUTC('2019.04.09 12:00', config.user.time_zone),
            );
          },
          (_) => {
            const dbCategory = _[0].clearedData;
            expect(dbCategory).toHaveProperty('created_by_user_id', userIdStr);
          },
          (_) => {
            const dbCategory = _[0].clearedData;
            expect(dbCategory).toHaveProperty(
              'updated_at',
              parseUserDateTimeToUTC('2019.09.09 12:00', config.user.time_zone),
            );
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
        ],
      },
    ]));

  const realSbcTitle = '😃';
  const realSbcTitle2 = '😃a';
  const cmd_undo_delctg_real_sbc = `${cmd_undo_delctg} ${realCtgTitle}`;
  it(`"${cmd_undo_delctg_real_sbc}" should be resolved as restored from deleted category and connected subcategories and notes`, () =>
    testBotMsgsRes([
      {
        toSendText: cmd_undo_delctg_real_sbc,
        prepareDB: async () => {
          serverNowDate = parseUserDateTimeToUTC(
            '2019.02.09 12:00',
            config.user.time_zone,
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
            createDeletedCategory({
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
          const dbSbc2 = await appBotMock.db.subcategories.add(
            { table_peer_id: chatId },
            createDeletedSubcategory({
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
            checkAddSubcategory({
              title: realSbcTitle,
              peer_id: chatId,
              category_id: dbCategory.id,
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
              category_id: dbCategory.id,
              created_by_user_id: userIdStr,
              note_number: 15.9,
              created_at: serverNowDate
                ? new Date(serverNowDate.getTime() + 5)
                : undefined,
            }),
          );
          const dbNote2 = await appBotMock.db.notes.add(
            { table_peer_id: chatId },
            createDeletedNote({
              peer_id: chatId,
              category_id: dbCategory.id,
              created_by_user_id: userIdStr,
              note_number: 15.9,
              subcategory_id: dbSbc2.id,
              created_at: serverNowDate
                ? new Date(serverNowDate.getTime() + 6)
                : undefined,
            }),
          );
          const dbNote3 = await appBotMock.db.notes.add(
            { table_peer_id: chatId },
            composeAddNote({
              peer_id: chatId,
              category_id: dbCategory.id,
              created_by_user_id: userIdStr,
              note_number: 56,
              subcategory_id: dbSbc2.id,
              created_at: serverNowDate
                ? new Date(serverNowDate.getTime() + 7)
                : undefined,
            }),
          );
          return { dbSbc1, dbSbc2, dbSbc3, dbNote1, dbNote2, dbNote3 };
        },
        toBeMessage: (_, { dbSbc1, dbSbc2, dbNote1, dbNote2 }) =>
          new ToTranslate(
            TrKey.CTG_UNDO_DELETED_WITH_SBC_AND_NT,
            userLangCode,
            {
              title: realCtgTitle,
              sbcTitles: printSbcTitles([dbSbc1, dbSbc2]),
              ntIds: printNtIds([dbNote1, dbNote2]),
            },
          ),
      },
    ]));

  const realCtgTitle2 = 'realCtgTitle2';
  const cmd_undo_delctg_real_ctg2 = `${cmd_undo_delctg} ${realCtgTitle2}`;
  it(`"${cmd_undo_delctg_real_ctg2}" should be resolved as restored from deleted category and connected subcategories`, () =>
    testBotMsgsRes([
      {
        toSendText: cmd_undo_delctg_real_ctg2,
        prepareDB: async () => {
          serverNowDate = parseUserDateTimeToUTC(
            '2019.02.09 12:00',
            config.user.time_zone,
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
            createDeletedCategory({
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
            createDeletedCategory({
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
            createDeletedSubcategory({
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
            createDeletedSubcategory({
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
            checkAddSubcategory({
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
            composeAddNote({
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
          new ToTranslate(TrKey.CTG_UNDO_DELETED_WITH_SBC, userLangCode, {
            title: realCtgTitle2,
            sbcTitles: printSbcTitles([dbSbc1, dbSbc2]),
          }),
      },
    ]));

  it(`"${cmd_undo_delctg_real_ctg}" should be resolved as restored from deleted category and connected notes`, () =>
    testBotMsgsRes([
      {
        toSendText: cmd_undo_delctg_real_ctg,
        prepareDB: async () => {
          serverNowDate = parseUserDateTimeToUTC(
            '2019.02.09 12:00',
            config.user.time_zone,
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
            createDeletedCategory({
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
              category_id: dbCategory1.id,
              created_by_user_id: userIdStr,
              created_at: serverNowDate
                ? new Date(serverNowDate.getTime() + 2)
                : undefined,
            }),
          );
          const dbNote1 = await appBotMock.db.notes.add(
            { table_peer_id: chatId },
            composeAddNote({
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
            createDeletedNote({
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
          new ToTranslate(TrKey.CTG_UNDO_DELETED_WITH_NT, userLangCode, {
            title: realCtgTitle,
            ntIds: printNtIds([dbNote2]),
          }),
      },
    ]));

  const cmd_undo_delctg_amb_title = `${cmd_undo_delctg} ${realCtgTitle} [${CommandParameterName.ctgTitle}${PARAMS_EQ}${realCtgTitle}]`;
  it(`"${cmd_undo_delctg_amb_title}" should be rejected as of title parameter and text at the same time`, () =>
    testBotMsgsRes([
      {
        toSendText: cmd_undo_delctg_amb_title,
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
        toBeMessage: new ToTranslate(
          TrKey.PARAM_AMBIGUOUS_ERROR,
          userLangCode,
          {
            parName: CommandParameterName.ctgTitle,
          },
        ),
      },
    ]));

  const cmd_undo_delctg_amb_id = `${cmd_undo_delctg} ${realCtgTitle} [${CommandParameterName.ctgId}${PARAMS_EQ}123]`;
  it(`"${cmd_undo_delctg_amb_id}" should be rejected as of id parameter and text at the same time`, () =>
    testBotMsgsRes([
      {
        toSendText: cmd_undo_delctg_amb_id,
        toBeMessage: new ToTranslate(
          TrKey.PARAM_AMBIGUOUS_ERROR,
          userLangCode,
          {
            parName: CommandParameterName.ctgId,
          },
        ),
      },
    ]));

  const cmd_undo_delctg_unreal_param_id = `${cmd_undo_delctg} 223 [${CommandParameterName.ctgId}${PARAMS_EQ}123]`;
  it(`"${cmd_undo_delctg_unreal_param_id}" should be rejected as of id parameter and text-number at the same time`, () =>
    testBotMsgsRes([
      {
        toSendText: cmd_undo_delctg_unreal_param_id,
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
  const cmd_undo_delctg_by_fake_id = `${cmd_undo_delctg} [${CommandParameterName.ctgId}${PARAMS_EQ}${fakeCtgId}]`;
  it(`"${cmd_undo_delctg_by_fake_id}" should be rejected as of not existing category by id parameter`, () =>
    testBotMsgsRes([
      {
        toSendText: cmd_undo_delctg_by_fake_id,
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

  it(`"${cmd_undo_delctg} [${CommandParameterName.ctgId}${PARAMS_EQ}id]" should be resolved as restored from deleted category by id parameter`, () =>
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
            createDeletedCategory({
              title: realCtgTitle,
              peer_id: chatId,
              created_by_user_id: userIdStr,
            }),
          );
          return { dbCtg };
        },
        toSendText: (_, { dbCtg }: { dbCtg: CategoryDBModel }) =>
          `${cmd_undo_delctg} [${CommandParameterName.ctgId}${PARAMS_EQ}${dbCtg.id}]`,
        toBeMessage: (_) => {
          const ret = _[0].preparedData;
          return new ToTranslate(TrKey.CTG_UNDO_DELETED, userLangCode, {
            title: (ret.dbCtg as CategoryDBModel).title,
          });
        },
      },
    ]));

  afterAll(() => destroyBotMockApp(appBotMock));
});
