import { subDays, subWeeks, subMonths } from 'date-fns';

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
  CategoryTypeEnum,
} from '../../../db/models/categoryModel';
import { checkAddSubcategory } from '../../../db/models/subcategoryModel';
import {
  composeAddNote,
  createDeletedNote,
  printNtIds,
} from '../../../db/models/noteModel';

import {
  toCommand,
  BotCommandEnum,
  generateInvInstruction,
} from '../../helpers';
import { newDTDate, setDTDate } from '../../datetime';

describe('Check transfer notes command handlers', () => {
  let appBotMock: AppBotMockI;
  let testBotMsgsRes: PreparedTestBotMessages;
  let userLangCode: LanguageEnum;
  let chatId: number;
  let userIdStr: string;

  let serverNowDate: Date | undefined;

  beforeAll(async () => {
    appBotMock = await startBotMockApp();
    userLangCode = appBotMock.userLangCode;
    chatId = appBotMock.chatId;
    userIdStr = appBotMock.user.id;
    testBotMsgsRes = CreateMockTestBotMessageResponses({ appBotMock });
  });

  const cmd_trnsnts = toCommand(BotCommandEnum.trnsnts);
  it(`"${cmd_trnsnts}" should be rejected without arguments`, () =>
    testBotMsgsRes([
      {
        toSendText: cmd_trnsnts,
        toBeMessage: generateInvInstruction(
          TrKey.INVALID_TRNSNTS_CMD,
          BotCommandEnum.trnsnts,
          userLangCode,
        ),
      },
    ]));

  const cmd_trnsnt_sm = `${cmd_trnsnts} ctgTitle`;
  it(`"${cmd_trnsnt_sm}" should be rejected as of lack argumets`, () =>
    testBotMsgsRes([
      {
        toSendText: cmd_trnsnt_sm,
        toBeMessage: generateInvInstruction(
          TrKey.INVALID_TRNSNTS_CMD,
          BotCommandEnum.trnsnts,
          userLangCode,
        ),
      },
    ]));

  const cmd_trnsnt_amb = `${cmd_trnsnts} oldCtg newCtg ...`;
  it(`"${cmd_trnsnt_amb}" should be rejected as of too many arguments`, () =>
    testBotMsgsRes([
      {
        toSendText: cmd_trnsnt_amb,
        toBeMessage: generateInvInstruction(
          TrKey.INVALID_TRNSNTS_CMD,
          BotCommandEnum.trnsnts,
          userLangCode,
        ),
      },
    ]));

  const cmd_trnsnt_equal = `${cmd_trnsnts} oldCtg oldCtg`;
  it(`"${cmd_trnsnt_equal}" should be rejected as of equal arguments`, () =>
    testBotMsgsRes([
      {
        toSendText: cmd_trnsnt_equal,
        toBeMessage: new ToTranslate(
          TrKey.EQUAL_TRANSFER_CTG_OR_SBC,
          userLangCode,
          {
            title: 'oldCtg',
          },
        ),
      },
    ]));

  const fakeCtgTitle = 'fakeCtgTitle';
  const cmd_trnsnt_inv_ctg = `${cmd_trnsnts} ${fakeCtgTitle} newCtg`;
  it(`"${cmd_trnsnt_inv_ctg}" should be rejected as not existing category title`, () =>
    testBotMsgsRes([
      {
        toSendText: cmd_trnsnt_inv_ctg,
        prepareDB: () =>
          appBotMock.db.categories.deleteAll({ table_peer_id: chatId }),
        toBeMessage: new ToTranslate(
          TrKey.CATEGORY_OR_SUBCTG_NOT_EXIST,
          userLangCode,
          {
            title: fakeCtgTitle,
          },
        ),
      },
    ]));

  const realCtgTitle = 'realCtgTitle';
  const fakeSbcTitle = 'fakeSbcTitle';
  const cmd_trnsnt_inv_sbc = `${cmd_trnsnts} ${realCtgTitle} ${fakeSbcTitle}`;
  it(`"${cmd_trnsnt_inv_sbc}" should be rejected as not existing subcategory title`, () =>
    testBotMsgsRes([
      {
        toSendText: cmd_trnsnt_inv_sbc,
        prepareDB: async () => {
          await appBotMock.db.subcategories.deleteAll({
            table_peer_id: chatId,
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
        toBeMessage: new ToTranslate(
          TrKey.CATEGORY_OR_SUBCTG_NOT_EXIST,
          userLangCode,
          {
            title: fakeSbcTitle,
          },
        ),
      },
    ]));

  const realCtgTitle2 = 'realCtgTitle2';
  const realSbcTitle2 = '😴';
  const cmd_trnsnt_inv_type = `${cmd_trnsnts} ${realCtgTitle} ${realSbcTitle2}`;
  it(`"${cmd_trnsnt_inv_type}" should be rejected as change notes category type from text to number`, () =>
    testBotMsgsRes([
      {
        toSendText: cmd_trnsnt_inv_type,
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
              category_type: CategoryTypeEnum.text,
            }),
          );
          const dbCategory2 = await appBotMock.db.categories.add(
            { table_peer_id: chatId },
            composeAddCategory({
              title: realCtgTitle2,
              peer_id: chatId,
              created_by_user_id: userIdStr,
              category_type: CategoryTypeEnum.numberPositive,
            }),
          );
          await appBotMock.db.subcategories.add(
            { table_peer_id: chatId },
            checkAddSubcategory({
              title: realSbcTitle2,
              peer_id: chatId,
              created_by_user_id: userIdStr,
              category_id: dbCategory2.id,
            }),
          );
        },
        toBeMessage: new ToTranslate(
          TrKey.CTG_TYPE_TRANSFER_ERROR,
          userLangCode,
        ),
      },
    ]));

  const realSbcTitle = '😃';
  const cmd_trnsnt_empty = `${cmd_trnsnts} ${realSbcTitle} ${realCtgTitle}`;
  it(`"${cmd_trnsnt_empty}" should not detect any notes to transfer`, () =>
    testBotMsgsRes([
      {
        toSendText: cmd_trnsnt_empty,
        prepareDB: async () => {
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
              category_type: CategoryTypeEnum.numberNegative,
            }),
          );
          const dbCategory2 = await appBotMock.db.categories.add(
            { table_peer_id: chatId },
            composeAddCategory({
              title: realCtgTitle2,
              peer_id: chatId,
              created_by_user_id: userIdStr,
              category_type: CategoryTypeEnum.numberPositive,
            }),
          );
          await appBotMock.db.subcategories.add(
            { table_peer_id: chatId },
            checkAddSubcategory({
              title: realSbcTitle,
              peer_id: chatId,
              created_by_user_id: userIdStr,
              category_id: dbCategory1.id,
            }),
          );
          await appBotMock.db.subcategories.add(
            { table_peer_id: chatId },
            checkAddSubcategory({
              title: realSbcTitle2,
              peer_id: chatId,
              created_by_user_id: userIdStr,
              category_id: dbCategory2.id,
            }),
          );
        },
        toBeMessage: new ToTranslate(TrKey.NO_NOTES, userLangCode),
      },
    ]));

  const realCtgTitle3 = 'realCtgTitle3';
  const cmd_trnsnt_ctg_to_ctg = `${cmd_trnsnts} ${realCtgTitle} ${realCtgTitle2}`;
  it(`"${cmd_trnsnt_ctg_to_ctg}" should transfer notes from category to category`, () =>
    testBotMsgsRes([
      {
        toSendText: cmd_trnsnt_ctg_to_ctg,
        prepareDB: async () => {
          serverNowDate = newDTDate();
          setDTDate(serverNowDate);
          await appBotMock.db.notes.deleteAll({ table_peer_id: chatId });
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
            }),
          );
          const dbCategory2 = await appBotMock.db.categories.add(
            { table_peer_id: chatId },
            composeAddCategory({
              title: realCtgTitle2,
              peer_id: chatId,
              created_by_user_id: userIdStr,
            }),
          );
          const dbCategory3 = await appBotMock.db.categories.add(
            { table_peer_id: chatId },
            composeAddCategory({
              title: realCtgTitle3,
              peer_id: chatId,
              created_by_user_id: userIdStr,
            }),
          );
          const dbNote1 = await appBotMock.db.notes.add(
            { table_peer_id: chatId },
            composeAddNote({
              peer_id: chatId,
              category_id: dbCategory1.id,
              created_by_user_id: userIdStr,
              note_number: -75,
              datetime: subDays(serverNowDate, 2),
            }),
          );
          const dbNote2 = await appBotMock.db.notes.add(
            { table_peer_id: chatId },
            composeAddNote({
              peer_id: chatId,
              category_id: dbCategory1.id,
              created_by_user_id: userIdStr,
              note_number: 15.0,
              datetime: subWeeks(serverNowDate, 1),
            }),
          );
          const dbNote3 = await appBotMock.db.notes.add(
            { table_peer_id: chatId },
            composeAddNote({
              peer_id: chatId,
              category_id: dbCategory2.id,
              created_by_user_id: userIdStr,
              note_number: 5,
              datetime: subMonths(serverNowDate, 2),
            }),
          );
          const dbNote4 = await appBotMock.db.notes.add(
            { table_peer_id: chatId },
            composeAddNote({
              peer_id: chatId,
              category_id: dbCategory2.id,
              created_by_user_id: userIdStr,
              note_number: 98,
              datetime: new Date(serverNowDate.getTime() - 4000),
            }),
          );
          const dbNote5 = await appBotMock.db.notes.add(
            { table_peer_id: chatId },
            composeAddNote({
              peer_id: chatId,
              category_id: dbCategory3.id,
              created_by_user_id: userIdStr,
              note_number: -56,
              datetime: new Date(serverNowDate.getTime() - 3000),
            }),
          );
          const dbNote6 = await appBotMock.db.notes.add(
            { table_peer_id: chatId },
            createDeletedNote({
              peer_id: chatId,
              category_id: dbCategory3.id,
              created_by_user_id: userIdStr,
              note_number: -552,
              datetime: new Date(serverNowDate.getTime() - 2000),
            }),
          );
          return { dbNote1, dbNote2, dbNote3, dbNote4, dbNote5, dbNote6 };
        },
        toBeMessage: (_) => {
          const ret = _[0].preparedData;
          return new ToTranslate(
            TrKey.TRANSFERED_NOTES_FROM_CTG_TO_CTG,
            userLangCode,
            {
              fromTitle: realCtgTitle,
              toTitle: realCtgTitle2,
              ntIds: printNtIds([ret.dbNote1, ret.dbNote2]),
            },
          );
        },
      },
    ]));

  const cmd_trnsnt_ctg_to_sbc = `${cmd_trnsnts} ${realCtgTitle2} ${realSbcTitle}`;
  it(`"${cmd_trnsnt_ctg_to_sbc}" should transfer notes from category to subcategory`, () =>
    testBotMsgsRes([
      {
        toSendText: cmd_trnsnt_ctg_to_sbc,
        prepareDB: async () => {
          serverNowDate = newDTDate();
          setDTDate(serverNowDate);
          await appBotMock.db.notes.deleteAll({ table_peer_id: chatId });
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
            }),
          );
          await appBotMock.db.subcategories.add(
            { table_peer_id: chatId },
            checkAddSubcategory({
              title: realSbcTitle,
              peer_id: chatId,
              created_by_user_id: userIdStr,
              category_id: dbCategory1.id,
            }),
          );
          const dbCategory2 = await appBotMock.db.categories.add(
            { table_peer_id: chatId },
            composeAddCategory({
              title: realCtgTitle2,
              peer_id: chatId,
              created_by_user_id: userIdStr,
            }),
          );
          const dbSubcategory2 = await appBotMock.db.subcategories.add(
            { table_peer_id: chatId },
            checkAddSubcategory({
              title: realSbcTitle2,
              peer_id: chatId,
              created_by_user_id: userIdStr,
              category_id: dbCategory2.id,
            }),
          );
          const dbCategory3 = await appBotMock.db.categories.add(
            { table_peer_id: chatId },
            composeAddCategory({
              title: realCtgTitle3,
              peer_id: chatId,
              created_by_user_id: userIdStr,
            }),
          );
          const dbNote1 = await appBotMock.db.notes.add(
            { table_peer_id: chatId },
            composeAddNote({
              peer_id: chatId,
              category_id: dbCategory1.id,
              created_by_user_id: userIdStr,
              note_number: -75,
              datetime: subDays(serverNowDate, 2),
            }),
          );
          const dbNote2 = await appBotMock.db.notes.add(
            { table_peer_id: chatId },
            composeAddNote({
              peer_id: chatId,
              category_id: dbCategory1.id,
              created_by_user_id: userIdStr,
              note_number: 15.0,
              datetime: subWeeks(serverNowDate, 1),
            }),
          );
          const dbNote3 = await appBotMock.db.notes.add(
            { table_peer_id: chatId },
            composeAddNote({
              peer_id: chatId,
              category_id: dbCategory2.id,
              created_by_user_id: userIdStr,
              note_number: 5,
              datetime: subMonths(serverNowDate, 2),
            }),
          );
          const dbNote4 = await appBotMock.db.notes.add(
            { table_peer_id: chatId },
            composeAddNote({
              peer_id: chatId,
              category_id: dbCategory2.id,
              created_by_user_id: userIdStr,
              note_number: 98,
              subcategory_id: dbSubcategory2.id,
              datetime: new Date(serverNowDate.getTime() - 4000),
            }),
          );
          const dbNote5 = await appBotMock.db.notes.add(
            { table_peer_id: chatId },
            composeAddNote({
              peer_id: chatId,
              category_id: dbCategory3.id,
              created_by_user_id: userIdStr,
              note_number: -56,
              datetime: new Date(serverNowDate.getTime() - 3000),
            }),
          );
          const dbNote6 = await appBotMock.db.notes.add(
            { table_peer_id: chatId },
            createDeletedNote({
              peer_id: chatId,
              category_id: dbCategory3.id,
              created_by_user_id: userIdStr,
              note_number: -552,
              datetime: new Date(serverNowDate.getTime() - 2000),
            }),
          );
          return { dbNote1, dbNote2, dbNote3, dbNote4, dbNote5, dbNote6 };
        },
        toBeMessage: (_) => {
          const ret = _[0].preparedData;
          return new ToTranslate(
            TrKey.TRANSFERED_NOTES_FROM_CTG_TO_SBC,
            userLangCode,
            {
              fromTitle: realCtgTitle2,
              toTitle: realSbcTitle,
              ntIds: printNtIds([ret.dbNote4, ret.dbNote3]),
            },
          );
        },
      },
    ]));

  const realSbcTitle3 = 'realSbcTitle3';
  const cmd_trnsnt_sbc_to_ctg = `${cmd_trnsnts} ${realSbcTitle3} ${realCtgTitle3}`;
  it(`"${cmd_trnsnt_sbc_to_ctg}" should transfer notes from subcategory to category`, () =>
    testBotMsgsRes([
      {
        toSendText: cmd_trnsnt_sbc_to_ctg,
        prepareDB: async () => {
          serverNowDate = newDTDate();
          setDTDate(serverNowDate);
          await appBotMock.db.notes.deleteAll({ table_peer_id: chatId });
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
            }),
          );
          const dbSubcategory1 = await appBotMock.db.subcategories.add(
            { table_peer_id: chatId },
            checkAddSubcategory({
              title: realSbcTitle,
              peer_id: chatId,
              created_by_user_id: userIdStr,
              category_id: dbCategory1.id,
            }),
          );
          const dbCategory2 = await appBotMock.db.categories.add(
            { table_peer_id: chatId },
            composeAddCategory({
              title: realCtgTitle2,
              peer_id: chatId,
              created_by_user_id: userIdStr,
            }),
          );
          const dbSubcategory2 = await appBotMock.db.subcategories.add(
            { table_peer_id: chatId },
            checkAddSubcategory({
              title: realSbcTitle2,
              peer_id: chatId,
              created_by_user_id: userIdStr,
              category_id: dbCategory2.id,
            }),
          );
          const dbCategory3 = await appBotMock.db.categories.add(
            { table_peer_id: chatId },
            composeAddCategory({
              title: realCtgTitle3,
              peer_id: chatId,
              created_by_user_id: userIdStr,
            }),
          );
          const dbSubcategory3 = await appBotMock.db.subcategories.add(
            { table_peer_id: chatId },
            checkAddSubcategory({
              title: realSbcTitle3,
              peer_id: chatId,
              created_by_user_id: userIdStr,
              category_id: dbCategory3.id,
            }),
          );
          const dbNote1 = await appBotMock.db.notes.add(
            { table_peer_id: chatId },
            composeAddNote({
              peer_id: chatId,
              category_id: dbCategory1.id,
              created_by_user_id: userIdStr,
              note_number: -75,
              subcategory_id: dbSubcategory1.id,
              datetime: subDays(serverNowDate, 2),
            }),
          );
          const dbNote2 = await appBotMock.db.notes.add(
            { table_peer_id: chatId },
            createDeletedNote({
              peer_id: chatId,
              category_id: dbCategory1.id,
              created_by_user_id: userIdStr,
              note_number: 15.0,
              subcategory_id: dbSubcategory1.id,
              datetime: subWeeks(serverNowDate, 1),
            }),
          );
          const dbNote3 = await appBotMock.db.notes.add(
            { table_peer_id: chatId },
            composeAddNote({
              peer_id: chatId,
              category_id: dbCategory2.id,
              created_by_user_id: userIdStr,
              note_number: 5,
              datetime: subMonths(serverNowDate, 2),
            }),
          );
          const dbNote4 = await appBotMock.db.notes.add(
            { table_peer_id: chatId },
            composeAddNote({
              peer_id: chatId,
              category_id: dbCategory2.id,
              created_by_user_id: userIdStr,
              note_number: 98,
              subcategory_id: dbSubcategory2.id,
              datetime: new Date(serverNowDate.getTime() - 4000),
            }),
          );
          const dbNote5 = await appBotMock.db.notes.add(
            { table_peer_id: chatId },
            composeAddNote({
              peer_id: chatId,
              category_id: dbCategory3.id,
              created_by_user_id: userIdStr,
              note_number: -56,
              subcategory_id: dbSubcategory3.id,
              datetime: new Date(serverNowDate.getTime() - 3000),
            }),
          );
          const dbNote6 = await appBotMock.db.notes.add(
            { table_peer_id: chatId },
            createDeletedNote({
              peer_id: chatId,
              category_id: dbCategory3.id,
              created_by_user_id: userIdStr,
              note_number: -552,
              subcategory_id: dbSubcategory3.id,
              datetime: new Date(serverNowDate.getTime() - 2000),
            }),
          );
          return {
            dbNote1,
            dbNote2,
            dbNote3,
            dbNote4,
            dbNote5,
            dbNote6,
            dbCategory3,
          };
        },
        toBeMessage: (_) => {
          const ret = _[0].preparedData;
          return new ToTranslate(
            TrKey.TRANSFERED_NOTES_FROM_SBC_TO_CTG,
            userLangCode,
            {
              fromTitle: realSbcTitle3,
              toTitle: realCtgTitle3,
              ntIds: printNtIds([ret.dbNote5]),
            },
          );
        },
        clearDB: async (_) => {
          const ret = _[0].preparedData;
          const dbNoteJoinCtgSbc = await appBotMock.db.notes.findJoinCtgSbc({
            table_peer_id: chatId,
            note_id: ret.dbNote5.id,
            peer_id: chatId,
          });
          return { dbNoteJoinCtgSbc };
        },
        toExpect: [
          (_) => {
            const ret = _[0].clearedData;
            expect(ret.dbNoteJoinCtgSbc).toBeDefined();
          },
          (_) => {
            const ret = _[0].clearedData;
            expect(ret.dbNoteJoinCtgSbc).toHaveProperty(
              'updated_at',
              serverNowDate,
            );
          },
          (_) => {
            const ret = _[0].clearedData;
            expect(ret.dbNoteJoinCtgSbc).toHaveProperty(
              'updated_by_user_id',
              userIdStr,
            );
          },
          (_) => {
            const pre = _[0].preparedData;
            const ret = _[0].clearedData;
            expect(ret.dbNoteJoinCtgSbc).toHaveProperty(
              'category_id',
              pre.dbCategory3.id,
            );
          },
          (_) => {
            const ret = _[0].clearedData;
            expect(ret.dbNoteJoinCtgSbc).toHaveProperty('subcategory_id', null);
          },
        ],
      },
    ]));

  const cmd_trnsnt_sbc_to_sbc = `${cmd_trnsnts} ${realSbcTitle2} ${realSbcTitle3}`;
  it(`"${cmd_trnsnt_sbc_to_sbc}" should transfer notes from subcategory to category`, () =>
    testBotMsgsRes([
      {
        toSendText: cmd_trnsnt_sbc_to_sbc,
        prepareDB: async () => {
          serverNowDate = newDTDate();
          setDTDate(serverNowDate);
          await appBotMock.db.notes.deleteAll({ table_peer_id: chatId });
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
            }),
          );
          const dbSubcategory1 = await appBotMock.db.subcategories.add(
            { table_peer_id: chatId },
            checkAddSubcategory({
              title: realSbcTitle,
              peer_id: chatId,
              created_by_user_id: userIdStr,
              category_id: dbCategory1.id,
            }),
          );
          const dbCategory2 = await appBotMock.db.categories.add(
            { table_peer_id: chatId },
            composeAddCategory({
              title: realCtgTitle2,
              peer_id: chatId,
              created_by_user_id: userIdStr,
            }),
          );
          const dbSubcategory2 = await appBotMock.db.subcategories.add(
            { table_peer_id: chatId },
            checkAddSubcategory({
              title: realSbcTitle2,
              peer_id: chatId,
              created_by_user_id: userIdStr,
              category_id: dbCategory2.id,
            }),
          );
          const dbCategory3 = await appBotMock.db.categories.add(
            { table_peer_id: chatId },
            composeAddCategory({
              title: realCtgTitle3,
              peer_id: chatId,
              created_by_user_id: userIdStr,
            }),
          );
          await appBotMock.db.subcategories.add(
            { table_peer_id: chatId },
            checkAddSubcategory({
              title: realSbcTitle3,
              peer_id: chatId,
              created_by_user_id: userIdStr,
              category_id: dbCategory3.id,
            }),
          );
          const dbNote1 = await appBotMock.db.notes.add(
            { table_peer_id: chatId },
            composeAddNote({
              peer_id: chatId,
              category_id: dbCategory1.id,
              created_by_user_id: userIdStr,
              note_number: -75,
              subcategory_id: dbSubcategory1.id,
              datetime: subDays(serverNowDate, 2),
            }),
          );
          const dbNote2 = await appBotMock.db.notes.add(
            { table_peer_id: chatId },
            createDeletedNote({
              peer_id: chatId,
              category_id: dbCategory1.id,
              created_by_user_id: userIdStr,
              note_number: 15.0,
              subcategory_id: dbSubcategory1.id,
              datetime: subWeeks(serverNowDate, 1),
            }),
          );
          const dbNote3 = await appBotMock.db.notes.add(
            { table_peer_id: chatId },
            composeAddNote({
              peer_id: chatId,
              category_id: dbCategory2.id,
              created_by_user_id: userIdStr,
              note_number: 5,
              datetime: subMonths(serverNowDate, 2),
            }),
          );
          const dbNote4 = await appBotMock.db.notes.add(
            { table_peer_id: chatId },
            composeAddNote({
              peer_id: chatId,
              category_id: dbCategory2.id,
              created_by_user_id: userIdStr,
              note_number: 98,
              subcategory_id: dbSubcategory2.id,
              datetime: new Date(serverNowDate.getTime() - 4000),
            }),
          );
          const dbNote5 = await appBotMock.db.notes.add(
            { table_peer_id: chatId },
            composeAddNote({
              peer_id: chatId,
              category_id: dbCategory3.id,
              created_by_user_id: userIdStr,
              note_number: -56,
              datetime: new Date(serverNowDate.getTime() - 3000),
            }),
          );
          const dbNote6 = await appBotMock.db.notes.add(
            { table_peer_id: chatId },
            createDeletedNote({
              peer_id: chatId,
              category_id: dbCategory3.id,
              created_by_user_id: userIdStr,
              note_number: -552,
              datetime: new Date(serverNowDate.getTime() - 2000),
            }),
          );
          return { dbNote1, dbNote2, dbNote3, dbNote4, dbNote5, dbNote6 };
        },
        toBeMessage: (_) => {
          const ret = _[0].preparedData;
          return new ToTranslate(
            TrKey.TRANSFERED_NOTES_FROM_SBC_TO_SBC,
            userLangCode,
            {
              fromTitle: realSbcTitle2,
              toTitle: realSbcTitle3,
              ntIds: printNtIds([ret.dbNote4]),
            },
          );
        },
      },
    ]));

  afterAll(async () => {
    setDTDate();
    await destroyBotMockApp(appBotMock);
  });
});
