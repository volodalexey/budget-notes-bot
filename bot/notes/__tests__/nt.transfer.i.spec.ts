import { subDays } from 'date-fns';

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
  generateNoteCreatedTranslations,
} from '../../../db/models/noteModel';

import {
  toCommand,
  BotCommandEnum,
  generateInvInstruction,
} from '../../helpers';
import { newDTDate, parseUserDateTimeToUTC, setDTDate } from '../../datetime';

describe('Check transfer note command handlers', () => {
  let appBotMock: AppBotMockI;
  let testBotMsgsRes: PreparedTestBotMessages;
  let userLangCode: LanguageEnum;
  let userTimeZone: string;
  let chatId: number;
  let userIdStr: string;

  let serverNowDate;

  beforeAll(async () => {
    appBotMock = await startBotMockApp();
    userLangCode = appBotMock.userLangCode;
    userTimeZone = appBotMock.userTimeZone;
    chatId = appBotMock.chatId;
    userIdStr = appBotMock.user.id;
    testBotMsgsRes = CreateMockTestBotMessageResponses({ appBotMock });
  });

  const cmd_trnsnt = toCommand(BotCommandEnum.trnsnt);
  it(`"${cmd_trnsnt}" should be rejected without arguments`, () =>
    testBotMsgsRes([
      {
        toSendText: cmd_trnsnt,
        toBeMessage: generateInvInstruction(
          TrKey.INVALID_TRNSNT_CMD,
          BotCommandEnum.trnsnt,
          userLangCode,
        ),
      },
    ]));

  const cmd_trnsnt_sm = `${cmd_trnsnt} id`;
  it(`"${cmd_trnsnt_sm}" should be rejected as of lack argumets`, () =>
    testBotMsgsRes([
      {
        toSendText: cmd_trnsnt_sm,
        toBeMessage: generateInvInstruction(
          TrKey.INVALID_TRNSNT_CMD,
          BotCommandEnum.trnsnt,
          userLangCode,
        ),
      },
    ]));

  const cmd_trnsnt_amb = `${cmd_trnsnt} id newCtg ...`;
  it(`"${cmd_trnsnt_amb}" should be rejected as of too many arguments`, () =>
    testBotMsgsRes([
      {
        toSendText: cmd_trnsnt_amb,
        toBeMessage: generateInvInstruction(
          TrKey.INVALID_TRNSNT_CMD,
          BotCommandEnum.trnsnt,
          userLangCode,
        ),
      },
    ]));

  const realCtgTitle = 'realCtgTitle';
  const realCtgTitle2 = 'realCtgTitle2';

  const fakeCtgTitle = 'fakeCtgTitle';
  const cmd_trnsnt_inv_ctg = `${cmd_trnsnt} id ${fakeCtgTitle}`;
  it(`"${cmd_trnsnt_inv_ctg}" should be rejected as not existing category title`, () =>
    testBotMsgsRes([
      {
        toSendText: (_, { dbNote }) =>
          `${cmd_trnsnt} ${dbNote.id} ${fakeCtgTitle}`,
        prepareDB: async () => {
          await appBotMock.db.notes.deleteAll({
            table_peer_id: chatId,
            peer_id: chatId,
          });
          await appBotMock.db.subcategories.deleteAll({
            table_peer_id: chatId,
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

          const dbNote = await appBotMock.db.notes.add(
            { table_peer_id: chatId },
            composeAddNote({
              peer_id: chatId,
              category_id: dbCategory.id,
              created_by_user_id: userIdStr,
              note_number: 15.9,
            }),
          );

          return { dbNote };
        },
        toBeMessage: new ToTranslate(
          TrKey.CATEGORY_OR_SUBCTG_NOT_EXIST,
          userLangCode,
          {
            title: fakeCtgTitle,
          },
        ),
      },
    ]));

  const fakeSbcTitle = 'fakeSbcTitle';
  const cmd_trnsnt_inv_sbc = `${cmd_trnsnt} id ${fakeSbcTitle}`;
  it(`"${cmd_trnsnt_inv_sbc}" should be rejected as not existing subcategory title`, () =>
    testBotMsgsRes([
      {
        toSendText: (_, { dbNote }) =>
          `${cmd_trnsnt} ${dbNote.id} ${fakeSbcTitle}`,
        prepareDB: async () => {
          await appBotMock.db.notes.deleteAll({
            table_peer_id: chatId,
            peer_id: chatId,
          });
          await appBotMock.db.subcategories.deleteAll({
            table_peer_id: chatId,
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

          const dbNote = await appBotMock.db.notes.add(
            { table_peer_id: chatId },
            composeAddNote({
              peer_id: chatId,
              category_id: dbCategory.id,
              created_by_user_id: userIdStr,
              note_number: 15.9,
            }),
          );

          return { dbNote };
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

  const realSbcTitle = '😴';
  const cmd_trnsnt_inv_type = `${cmd_trnsnt} id ${realSbcTitle}`;
  it(`"${cmd_trnsnt_inv_type}" should be rejected as change note category type from number to text`, () =>
    testBotMsgsRes([
      {
        toSendText: (_, { dbNote }) =>
          `${cmd_trnsnt} ${dbNote.id} ${realSbcTitle}`,
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
          const dbCategory = await appBotMock.db.categories.add(
            { table_peer_id: chatId },
            composeAddCategory({
              title: realCtgTitle,
              peer_id: chatId,
              created_by_user_id: userIdStr,
              category_type: CategoryTypeEnum.numberPositive,
            }),
          );
          const dbNote = await appBotMock.db.notes.add(
            { table_peer_id: chatId },
            composeAddNote({
              peer_id: chatId,
              category_id: dbCategory.id,
              created_by_user_id: userIdStr,
              note_number: 15.9,
            }),
          );
          const dbCategory2 = await appBotMock.db.categories.add(
            { table_peer_id: chatId },
            composeAddCategory({
              title: realCtgTitle2,
              peer_id: chatId,
              created_by_user_id: userIdStr,
              category_type: CategoryTypeEnum.text,
            }),
          );
          await appBotMock.db.subcategories.add(
            { table_peer_id: chatId },
            checkAddSubcategory({
              title: realSbcTitle,
              peer_id: chatId,
              created_by_user_id: userIdStr,
              category_id: dbCategory2.id,
            }),
          );

          return { dbNote };
        },
        toBeMessage: new ToTranslate(
          TrKey.CTG_TYPE_TRANSFER_ERROR,
          userLangCode,
        ),
      },
    ]));

  const realSbcTitle2 = '😃';
  const cmd_trnsnt_ctg_to_ctg = `${cmd_trnsnt} id ${realCtgTitle2}`;
  it(`"${cmd_trnsnt_ctg_to_ctg}" should transfer note from category to category`, () =>
    testBotMsgsRes([
      {
        toSendText: (_, { dbNote1 }) =>
          `${cmd_trnsnt} ${dbNote1.id} ${realCtgTitle2}`,
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
          await appBotMock.db.categories.add(
            { table_peer_id: chatId },
            composeAddCategory({
              title: realCtgTitle2,
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
          return { dbNote1 };
        },
        toBeMessage: (_) => {
          const ret = _[0].preparedData;
          return new ToTranslate(
            TrKey.TRANSFERED_NOTES_FROM_CTG_TO_CTG,
            userLangCode,
            {
              fromTitle: realCtgTitle,
              toTitle: realCtgTitle2,
              ntIds: ret.dbNote1.id,
            },
          );
        },
      },
    ]));

  const cmd_trnsnt_ctg_to_sbc = `${cmd_trnsnt} id ${realSbcTitle}`;
  it(`"${cmd_trnsnt_ctg_to_sbc}" should transfer note from category to subcategory (same category)`, () =>
    testBotMsgsRes([
      {
        toSendText: (_, { dbNote1 }) =>
          `${cmd_trnsnt} ${dbNote1.id} ${realSbcTitle}`,
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
          return { dbNote1 };
        },
        toBeMessage: (_) => {
          const ret = _[0].preparedData;
          return new ToTranslate(
            TrKey.TRANSFERED_NOTES_FROM_CTG_TO_SBC,
            userLangCode,
            {
              fromTitle: realCtgTitle,
              toTitle: realSbcTitle,
              ntIds: ret.dbNote1.id,
            },
          );
        },
      },
    ]));

  const cmd_trnsnt_sbc_to_ctg = `${cmd_trnsnt} id ${realCtgTitle}`;
  it(`"${cmd_trnsnt_sbc_to_ctg}" should transfer note from subcategory to category (same category)`, () =>
    testBotMsgsRes([
      {
        toSendText: (_, { dbNote1 }) =>
          `${cmd_trnsnt} ${dbNote1.id} ${realCtgTitle}`,
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
          const dbNote1 = await appBotMock.db.notes.add(
            { table_peer_id: chatId },
            composeAddNote({
              peer_id: chatId,
              category_id: dbCategory1.id,
              created_by_user_id: userIdStr,
              subcategory_id: dbSubcategory1.id,
              note_number: -75,
              datetime: subDays(serverNowDate, 2),
            }),
          );
          return { dbNote1 };
        },
        toBeMessage: (_) => {
          const ret = _[0].preparedData;
          return new ToTranslate(
            TrKey.TRANSFERED_NOTES_FROM_SBC_TO_CTG,
            userLangCode,
            {
              fromTitle: realSbcTitle,
              toTitle: realCtgTitle,
              ntIds: ret.dbNote1.id,
            },
          );
        },
      },
    ]));

  const cmd_trnsnt_sbc_to_sbc = `${cmd_trnsnt} id ${realSbcTitle2}`;
  it(`"${cmd_trnsnt_sbc_to_sbc}" should transfer note from subcategory to subcategory (another category)`, () =>
    testBotMsgsRes([
      {
        toSendText: (_, { dbNote1 }) =>
          `${cmd_trnsnt} ${dbNote1.id} ${realSbcTitle2}`,
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
          const dbSubcategory1 = await appBotMock.db.subcategories.add(
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
          const dbNote1 = await appBotMock.db.notes.add(
            { table_peer_id: chatId },
            composeAddNote({
              peer_id: chatId,
              category_id: dbCategory1.id,
              created_by_user_id: userIdStr,
              subcategory_id: dbSubcategory1.id,
              note_number: -75,
              datetime: subDays(serverNowDate, 2),
            }),
          );
          return { dbNote1 };
        },
        toBeMessage: (_) => {
          const ret = _[0].preparedData;
          return new ToTranslate(
            TrKey.TRANSFERED_NOTES_FROM_SBC_TO_SBC,
            userLangCode,
            {
              fromTitle: realSbcTitle,
              toTitle: realSbcTitle2,
              ntIds: ret.dbNote1.id,
            },
          );
        },
      },
    ]));

  const cmd_trnsnt_ctg_to_sbc_an = `${cmd_trnsnt} id ${realSbcTitle2}`;
  it(`"${cmd_trnsnt_ctg_to_sbc_an}" should transfer note from category to subcategory (another category)`, () =>
    testBotMsgsRes([
      {
        toSendText: (_, { dbNote1 }) =>
          `${cmd_trnsnt} ${dbNote1.id} ${realSbcTitle2}`,
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
          await appBotMock.db.subcategories.add(
            { table_peer_id: chatId },
            checkAddSubcategory({
              title: realSbcTitle2,
              peer_id: chatId,
              created_by_user_id: userIdStr,
              category_id: dbCategory2.id,
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
          return { dbNote1 };
        },
        toBeMessage: (_) => {
          const ret = _[0].preparedData;
          return new ToTranslate(
            TrKey.TRANSFERED_NOTES_FROM_CTG_TO_SBC,
            userLangCode,
            {
              fromTitle: realCtgTitle,
              toTitle: realSbcTitle2,
              ntIds: ret.dbNote1.id,
            },
          );
        },
      },
    ]));

  it(`should transfer note by reply to response text when adding nt`, () =>
    testBotMsgsRes([
      {
        prepareDB: async () => {
          serverNowDate = parseUserDateTimeToUTC(
            '2022.07.08 16:15',
            userTimeZone,
          );
          setDTDate(serverNowDate);
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
          const dbCtg2 = await appBotMock.db.categories.add(
            { table_peer_id: chatId },
            composeAddCategory({
              title: realCtgTitle2,
              peer_id: chatId,
              created_by_user_id: userIdStr,
            }),
          );
          return { dbCtg, dbSbc, dbCtg2 };
        },
        toSendText: () => `${realSbcTitle} 18.66`,
        clearDB: () =>
          appBotMock.db.notes.listJoinCtgSbc({
            table_peer_id: chatId,
            peer_id: chatId,
          }),
        toBeMessage: (_) =>
          new ToTranslate(
            TrKey.NOTE_ADDED,
            userLangCode,
            {
              id: _[0].clearedData[0].id,
              futureDateMsg: '',
              createdFields: generateNoteCreatedTranslations({
                noteId: _[0].clearedData[0].id,
                noteDatetime: _[0].clearedData[0].datetime,
                noteNumber: '-18.66',
                lang: userLangCode,
                timeZone: userTimeZone,
                categoryTitle: realCtgTitle,
                categoryType: _[0].preparedData.dbCtg.category_type,
                subcategoryTitle: realSbcTitle,
              }),
            },
            ['futureDateMsg', 'createdFields'],
          ),
      },
      {
        toSendText: () => `${cmd_trnsnt} ${realCtgTitle2}`,
        messageClosureForReply: (_) => _[0].lastMessage,
        clearDB: () =>
          appBotMock.db.notes.listJoinCtgSbc({
            table_peer_id: chatId,
            peer_id: chatId,
          }),
        toBeMessage: (_) =>
          new ToTranslate(
            TrKey.TRANSFERED_NOTES_FROM_SBC_TO_CTG,
            userLangCode,
            {
              fromTitle: realSbcTitle,
              toTitle: realCtgTitle2,
              ntIds: _[1].clearedData[0].id,
            },
          ),
      },
    ]));

  afterAll(async () => {
    setDTDate();
    await destroyBotMockApp(appBotMock);
  });
});
