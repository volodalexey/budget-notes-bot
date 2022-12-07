import { addHours, subDays, subHours, subMonths, subWeeks } from 'date-fns';

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
} from '../../../db/models/categoryModel';
import {
  checkAddSubcategory,
  createDeletedSubcategory,
} from '../../../db/models/subcategoryModel';
import {
  composeAddNote,
  createDeletedNote,
  createArchivedNote,
  DEFAULT_LIST_NT_LIMIT,
  printListNotes,
} from '../../../db/models/noteModel';

import { CommandParameterName, PARAMS_EQ } from '../../parameters';
import { toListHeader, BotCommandEnum, toCommand } from '../../helpers';
import {
  calcStartEndDay,
  setDTDate,
  parseUserDateToUTC,
  calcStartEndYear,
  parseUserDateTimeToUTC,
} from '../../datetime';
import { AppTestConfigT } from '../../../config/config';

describe('Check list notes command handlers', () => {
  let appBotMock: AppBotMockI;
  let config: AppTestConfigT;
  let testBotMsgsRes: PreparedTestBotMessages;
  let userLangCode: LanguageEnum;
  let userTimeZone: string;
  let chatId: number;
  let userIdStr: string;

  let serverNowDate;

  beforeAll(async () => {
    appBotMock = await startBotMockApp();
    config = appBotMock.config;
    userLangCode = appBotMock.userLangCode;
    userTimeZone = appBotMock.userTimeZone;
    chatId = appBotMock.chatId;
    userIdStr = appBotMock.user.id;
    testBotMsgsRes = CreateMockTestBotMessageResponses({ appBotMock });
  });

  const cmd_listnt = toCommand(BotCommandEnum.listnt);
  it(`"${cmd_listnt}" should be resolved as empty notes list`, () =>
    testBotMsgsRes([
      {
        toSendText: cmd_listnt,
        prepareDB: async () => {
          serverNowDate = parseUserDateTimeToUTC(
            '2020.07.05 15:45',
            userTimeZone,
          );
          setDTDate(serverNowDate);
        },
        toBeText: () => `(лимит "${DEFAULT_LIST_NT_LIMIT}")
(заканчивая датой "05.07.2020 15:45:00")
Нет записей`,
      },
    ]));

  const realCtgTitle = 'realCtgTitle';
  const realCtgTitle2 = 'realCtgTitle2';
  const cmd_listnt_without_del_arch = `${cmd_listnt} [${CommandParameterName.startDate}${PARAMS_EQ}2019.02.04]`;
  it(`"${cmd_listnt_without_del_arch}" should print last notes without deleted and archived notes`, () =>
    testBotMsgsRes([
      {
        toSendText: cmd_listnt_without_del_arch,
        prepareDB: async () => {
          serverNowDate = parseUserDateTimeToUTC(
            '2019.02.09 12:00',
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
          const dbNote = await appBotMock.db.notes.add(
            { table_peer_id: chatId },
            composeAddNote({
              peer_id: chatId,
              category_id: dbCategory1.id,
              created_by_user_id: userIdStr,
              note_number: 152.23,
              datetime: serverNowDate ? subDays(serverNowDate, 5) : undefined,
            }),
          );
          const dbNote2 = await appBotMock.db.notes.add(
            { table_peer_id: chatId },
            composeAddNote({
              peer_id: chatId,
              category_id: dbCategory2.id,
              created_by_user_id: userIdStr,
              note_number: -75,
              datetime: serverNowDate,
            }),
          );
          const dbNoteJoinCtgSbc = await appBotMock.db.notes.findJoinCtgSbc({
            table_peer_id: chatId,
            note_id: dbNote.id,
            peer_id: chatId,
          });
          const dbNoteJoinCtgSbc2 = await appBotMock.db.notes.findJoinCtgSbc({
            table_peer_id: chatId,
            note_id: dbNote2.id,
            peer_id: chatId,
          });
          await appBotMock.db.notes.add(
            { table_peer_id: chatId },
            createDeletedNote({
              peer_id: chatId,
              category_id: dbCategory2.id,
              created_by_user_id: userIdStr,
              note_number: -5,
              datetime: serverNowDate
                ? new Date(serverNowDate.getTime() - 4)
                : undefined,
            }),
          );
          await appBotMock.db.notes.add(
            { table_peer_id: chatId },
            createArchivedNote({
              peer_id: chatId,
              category_id: dbCategory2.id,
              created_by_user_id: userIdStr,
              note_number: -53,
              datetime: serverNowDate
                ? new Date(serverNowDate.getTime() - 5)
                : undefined,
            }),
          );
          return [dbNoteJoinCtgSbc2, dbNoteJoinCtgSbc];
        },
        toBeMessage: (_, dbNotes) =>
          toListHeader(
            {
              ntCount: dbNotes.length,
              startDateTime: '04.02.2019 00:00:00',
              endDateTime: '09.02.2019 12:00:00',
            },
            new ToTranslate(TrKey.YOUR_NOTES, userLangCode, {
              text: printListNotes(dbNotes, userTimeZone),
            }),
            userLangCode,
          ),
      },
    ]));

  const cmd_listnt_l2c = `${cmd_listnt} [${CommandParameterName.limit}${PARAMS_EQ}2]`;
  it(`"${cmd_listnt_l2c}" should print last 2 notes and notes last note by category`, () =>
    testBotMsgsRes([
      {
        toSendText: cmd_listnt_l2c,
        prepareDB: async () => {
          serverNowDate = parseUserDateTimeToUTC(
            '2019.02.09 12:00',
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
          const dbNote = await appBotMock.db.notes.add(
            { table_peer_id: chatId },
            composeAddNote({
              peer_id: chatId,
              category_id: dbCategory1.id,
              created_by_user_id: userIdStr,
              note_number: 152.23,
              datetime: serverNowDate,
            }),
          );
          const dbNote2 = await appBotMock.db.notes.add(
            { table_peer_id: chatId },
            composeAddNote({
              peer_id: chatId,
              category_id: dbCategory2.id,
              created_by_user_id: userIdStr,
              note_number: -75,
              datetime: serverNowDate
                ? new Date(serverNowDate.getTime() - 1)
                : undefined,
            }),
          );
          const dbNote3 = await appBotMock.db.notes.add(
            { table_peer_id: chatId },
            composeAddNote({
              peer_id: chatId,
              category_id: dbCategory2.id,
              created_by_user_id: userIdStr,
              note_number: 135,
              datetime: serverNowDate
                ? new Date(serverNowDate.getTime() - 2)
                : undefined,
            }),
          );
          const dbNoteJoinCtgSbc = await appBotMock.db.notes.findJoinCtgSbc({
            table_peer_id: chatId,
            note_id: dbNote.id,
            peer_id: chatId,
          });
          const dbNoteJoinCtgSbc2 = await appBotMock.db.notes.findJoinCtgSbc({
            table_peer_id: chatId,
            note_id: dbNote2.id,
            peer_id: chatId,
          });
          const dbNoteJoinCtgSbc3 = await appBotMock.db.notes.findJoinCtgSbc({
            table_peer_id: chatId,
            note_id: dbNote3.id,
            peer_id: chatId,
          });
          return { dbNoteJoinCtgSbc, dbNoteJoinCtgSbc2, dbNoteJoinCtgSbc3 };
        },
        toBeMessage: (_, { dbNoteJoinCtgSbc, dbNoteJoinCtgSbc2 }) => {
          const dbNotes = [dbNoteJoinCtgSbc, dbNoteJoinCtgSbc2];
          return toListHeader(
            {
              limitNum: 2,
              endDateTime: '09.02.2019 12:00:00',
            },
            new ToTranslate(TrKey.YOUR_NOTES, userLangCode, {
              text: printListNotes(dbNotes, userTimeZone),
            }),
            userLangCode,
          );
        },
      },
      {
        toSendText: `${cmd_listnt} [${CommandParameterName.limit}${PARAMS_EQ}1 ${CommandParameterName.query}${PARAMS_EQ}${realCtgTitle2}]`,
        toBeMessage: (_) =>
          toListHeader(
            {
              limitNum: 1,
              endDateTime: '09.02.2019 12:00:00',
              query: realCtgTitle2,
            },
            new ToTranslate(TrKey.YOUR_NOTES, userLangCode, {
              text: printListNotes(
                [_[0].preparedData.dbNoteJoinCtgSbc2],
                userTimeZone,
              ),
            }),
            userLangCode,
          ),
      },
    ]));

  const cmd_listnt_l2c_s2c = `${cmd_listnt} [${CommandParameterName.relativeMonth}${PARAMS_EQ}0 ${CommandParameterName.skip}${PARAMS_EQ}2 ${CommandParameterName.limit}${PARAMS_EQ}2]`;
  it(`"${cmd_listnt_l2c_s2c}" should print last 2 notes and skip 2 notes within current month`, () =>
    testBotMsgsRes([
      {
        toSendText: cmd_listnt_l2c_s2c,
        prepareDB: async () => {
          serverNowDate = parseUserDateTimeToUTC(
            '2019.02.09 12:00',
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
          await appBotMock.db.notes.add(
            { table_peer_id: chatId },
            composeAddNote({
              peer_id: chatId,
              category_id: dbCategory1.id,
              created_by_user_id: userIdStr,
              note_number: 11.22,
              datetime: serverNowDate
                ? new Date(serverNowDate.getTime() + 1)
                : undefined,
            }),
          );
          const dbNote = await appBotMock.db.notes.add(
            { table_peer_id: chatId },
            composeAddNote({
              peer_id: chatId,
              category_id: dbCategory1.id,
              created_by_user_id: userIdStr,
              note_number: 22.11,
              datetime: serverNowDate ? subDays(serverNowDate, 1) : undefined,
            }),
          );
          await appBotMock.db.notes.add(
            { table_peer_id: chatId },
            composeAddNote({
              peer_id: chatId,
              category_id: dbCategory2.id,
              created_by_user_id: userIdStr,
              note_number: -75.45,
              datetime: serverNowDate ? subDays(serverNowDate, 5) : undefined,
            }),
          );
          await appBotMock.db.notes.add(
            { table_peer_id: chatId },
            composeAddNote({
              peer_id: chatId,
              category_id: dbCategory2.id,
              created_by_user_id: userIdStr,
              note_number: 135,
              datetime: serverNowDate
                ? new Date(serverNowDate.getTime() + 2)
                : undefined,
            }),
          );
          const dbNote2 = await appBotMock.db.notes.add(
            { table_peer_id: chatId },
            composeAddNote({
              peer_id: chatId,
              category_id: dbCategory2.id,
              created_by_user_id: userIdStr,
              note_number: 10.0,
              datetime: serverNowDate ? subDays(serverNowDate, 2) : undefined,
            }),
          );
          const dbNoteJoinCtgSbc = await appBotMock.db.notes.findJoinCtgSbc({
            table_peer_id: chatId,
            note_id: dbNote.id,
            peer_id: chatId,
          });
          const dbNoteJoinCtgSbc2 = await appBotMock.db.notes.findJoinCtgSbc({
            table_peer_id: chatId,
            note_id: dbNote2.id,
            peer_id: chatId,
          });
          return [dbNoteJoinCtgSbc, dbNoteJoinCtgSbc2];
        },
        toBeMessage: (_, dbNotes) =>
          toListHeader(
            {
              limitNum: 2,
              skipNum: 2,
              startDateTime: '01.02.2019 00:00:00',
              endDateTime: '28.02.2019 23:59:59',
            },
            new ToTranslate(TrKey.YOUR_NOTES, userLangCode, {
              text: printListNotes(dbNotes, userTimeZone),
            }),
            userLangCode,
          ),
      },
    ]));

  const cmd_listnt_s2c_id = `${cmd_listnt} [${CommandParameterName.relativeYear}${PARAMS_EQ}0 ${CommandParameterName.skip}${PARAMS_EQ}1 ${CommandParameterName.showId}${PARAMS_EQ}t]`;
  it(`"${cmd_listnt_s2c_id}" should print last 2 notes and skip 2 notes and print deleted notes`, () =>
    testBotMsgsRes([
      {
        toSendText: cmd_listnt_s2c_id,
        prepareDB: async () => {
          serverNowDate = parseUserDateTimeToUTC(
            '2019.02.09 12:00',
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
          const dbCategory1 = await appBotMock.db.categories.add(
            { table_peer_id: chatId },
            createDeletedCategory({
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
          const dbNote = await appBotMock.db.notes.add(
            { table_peer_id: chatId },
            composeAddNote({
              peer_id: chatId,
              category_id: dbCategory2.id,
              created_by_user_id: userIdStr,
              note_number: -75.45,
              datetime: serverNowDate ? subDays(serverNowDate, 5) : undefined,
            }),
          );
          const dbNote2 = await appBotMock.db.notes.add(
            { table_peer_id: chatId },
            composeAddNote({
              peer_id: chatId,
              category_id: dbCategory1.id,
              created_by_user_id: userIdStr,
              note_number: 10.0,
              datetime: serverNowDate ? subDays(serverNowDate, 2) : undefined,
            }),
          );
          const dbNote3 = await appBotMock.db.notes.add(
            { table_peer_id: chatId },
            createDeletedNote({
              peer_id: chatId,
              category_id: dbCategory1.id,
              created_by_user_id: userIdStr,
              note_number: 22.11,
              datetime: serverNowDate ? subDays(serverNowDate, 1) : undefined,
            }),
          );
          const dbNote4 = await appBotMock.db.notes.add(
            { table_peer_id: chatId },
            createDeletedNote({
              peer_id: chatId,
              category_id: dbCategory1.id,
              created_by_user_id: userIdStr,
              note_number: 11.22,
              datetime: serverNowDate
                ? subDays(new Date(serverNowDate.getTime() - 1), 1)
                : undefined,
            }),
          );
          const dbNote5 = await appBotMock.db.notes.add(
            { table_peer_id: chatId },
            createDeletedNote({
              peer_id: chatId,
              category_id: dbCategory2.id,
              created_by_user_id: userIdStr,
              note_number: 135,
              datetime: serverNowDate
                ? new Date(serverNowDate.getTime() + 2)
                : undefined,
            }),
          );
          const dbNoteJoinCtgSbc = await appBotMock.db.notes.findJoinCtgSbc({
            table_peer_id: chatId,
            note_id: dbNote.id,
            peer_id: chatId,
          });
          const dbNoteJoinCtgSbc2 = await appBotMock.db.notes.findJoinCtgSbc({
            table_peer_id: chatId,
            note_id: dbNote2.id,
            peer_id: chatId,
          });
          const dbNoteJoinCtgSbc3 = await appBotMock.db.notes.findJoinCtgSbc({
            table_peer_id: chatId,
            note_id: dbNote3.id,
            peer_id: chatId,
            in_deleted: true,
          });
          const dbNoteJoinCtgSbc4 = await appBotMock.db.notes.findJoinCtgSbc({
            table_peer_id: chatId,
            note_id: dbNote4.id,
            peer_id: chatId,
            in_deleted: true,
          });
          const dbNoteJoinCtgSbc5 = await appBotMock.db.notes.findJoinCtgSbc({
            table_peer_id: chatId,
            note_id: dbNote5.id,
            peer_id: chatId,
            in_deleted: true,
          });
          return {
            dbNoteJoinCtgSbc,
            dbNoteJoinCtgSbc2,
            dbNoteJoinCtgSbc3,
            dbNoteJoinCtgSbc4,
            dbNoteJoinCtgSbc5,
          };
        },
        toBeMessage: (_, { dbNoteJoinCtgSbc }) =>
          toListHeader(
            {
              skipNum: 1,
              showId: true,
              ntCount: 1,
              startDateTime: '01.01.2019 00:00:00',
              endDateTime: '31.12.2019 23:59:59',
            },
            new ToTranslate(TrKey.YOUR_NOTES, userLangCode, {
              text: printListNotes([dbNoteJoinCtgSbc], userTimeZone, true),
            }),
            userLangCode,
          ),
      },
      {
        toSendText: `${cmd_listnt} [${CommandParameterName.relativeDay}${PARAMS_EQ}-1 ${CommandParameterName.showDeleted}${PARAMS_EQ}t ${CommandParameterName.skip}${PARAMS_EQ}1]`,
        toBeMessage: (_) =>
          toListHeader(
            {
              skipNum: 1,
              showDeleted: true,
              ntCount: 1,
              startDateTime: '08.02.2019 00:00:00',
              endDateTime: '08.02.2019 23:59:59',
            },
            new ToTranslate(TrKey.YOUR_NOTES, userLangCode, {
              text: printListNotes(
                [_[0].preparedData.dbNoteJoinCtgSbc4],
                userTimeZone,
              ),
            }),
            userLangCode,
          ),
      },
      {
        toSendText: `${cmd_listnt} [${CommandParameterName.showDeleted}${PARAMS_EQ}t ${CommandParameterName.query}${PARAMS_EQ}${realCtgTitle2}]`,
        toBeMessage: (_) =>
          toListHeader(
            {
              limitNum: DEFAULT_LIST_NT_LIMIT,
              showDeleted: true,
              query: realCtgTitle2,
              endDateTime: '09.02.2019 12:00:00',
            },
            new ToTranslate(TrKey.NO_NOTES, userLangCode, {
              text: printListNotes(
                [_[0].preparedData.dbNoteJoinCtgSbc5],
                userTimeZone,
              ),
            }),
            userLangCode,
          ),
      },
    ]));

  it(`"${cmd_listnt}" should print 3 notes on current day`, () =>
    testBotMsgsRes([
      {
        toSendText: `${cmd_listnt} [${CommandParameterName.endDate}${PARAMS_EQ}2019.02.09]`,
        prepareDB: async () => {
          serverNowDate = parseUserDateTimeToUTC(
            '2019.02.09 12:00',
            userTimeZone,
          );
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
          const dbNote1 = await appBotMock.db.notes.add(
            { table_peer_id: chatId },
            composeAddNote({
              peer_id: chatId,
              category_id: dbCategory2.id,
              created_by_user_id: userIdStr,
              note_number: -75.45,
              datetime: serverNowDate ? subDays(serverNowDate, 2) : undefined,
            }),
          );
          const dbNote2 = await appBotMock.db.notes.add(
            { table_peer_id: chatId },
            composeAddNote({
              peer_id: chatId,
              category_id: dbCategory2.id,
              created_by_user_id: userIdStr,
              note_number: 10.0,
              datetime: serverNowDate ? subDays(serverNowDate, 1) : undefined,
            }),
          );
          const dbNote3 = await appBotMock.db.notes.add(
            { table_peer_id: chatId },
            composeAddNote({
              peer_id: chatId,
              category_id: dbCategory1.id,
              created_by_user_id: userIdStr,
              note_number: 45,
              datetime: serverNowDate
                ? new Date(serverNowDate.getTime() + 1)
                : undefined,
            }),
          );
          const dbNote4 = await appBotMock.db.notes.add(
            { table_peer_id: chatId },
            composeAddNote({
              peer_id: chatId,
              category_id: dbCategory1.id,
              created_by_user_id: userIdStr,
              note_number: 110,
              datetime: serverNowDate
                ? new Date(serverNowDate.getTime() + 2)
                : undefined,
            }),
          );
          const dbNote5 = await appBotMock.db.notes.add(
            { table_peer_id: chatId },
            composeAddNote({
              peer_id: chatId,
              category_id: dbCategory2.id,
              created_by_user_id: userIdStr,
              note_number: 0.56,
              datetime: serverNowDate
                ? new Date(serverNowDate.getTime() + 3)
                : undefined,
            }),
          );
          const dbNoteJoinCtgSbc1 = await appBotMock.db.notes.findJoinCtgSbc({
            table_peer_id: chatId,
            note_id: dbNote1.id,
            peer_id: chatId,
          });
          const dbNoteJoinCtgSbc2 = await appBotMock.db.notes.findJoinCtgSbc({
            table_peer_id: chatId,
            note_id: dbNote2.id,
            peer_id: chatId,
          });
          const dbNoteJoinCtgSbc3 = await appBotMock.db.notes.findJoinCtgSbc({
            table_peer_id: chatId,
            note_id: dbNote3.id,
            peer_id: chatId,
          });
          const dbNoteJoinCtgSbc4 = await appBotMock.db.notes.findJoinCtgSbc({
            table_peer_id: chatId,
            note_id: dbNote4.id,
            peer_id: chatId,
          });
          const dbNoteJoinCtgSbc5 = await appBotMock.db.notes.findJoinCtgSbc({
            table_peer_id: chatId,
            note_id: dbNote5.id,
            peer_id: chatId,
          });
          return {
            dbNoteJoinCtgSbc1,
            dbNoteJoinCtgSbc2,
            dbNoteJoinCtgSbc3,
            dbNoteJoinCtgSbc4,
            dbNoteJoinCtgSbc5,
          };
        },
        toBeMessage: (_) => {
          const { endUserDateTime } = calcStartEndDay({
            timeZone: userTimeZone,
            weekStartsOn: config.test.user_week_starts_on,
          });
          const ret = Object.assign(
            {
              limitNum: DEFAULT_LIST_NT_LIMIT,
              endDateTime: endUserDateTime,
            },
            _[0].preparedData,
          );
          const printNotes = [
            ret.dbNoteJoinCtgSbc5,
            ret.dbNoteJoinCtgSbc4,
            ret.dbNoteJoinCtgSbc3,
            ret.dbNoteJoinCtgSbc2,
            ret.dbNoteJoinCtgSbc1,
          ];
          ret.ntCount = printNotes.length;
          return toListHeader(
            ret,
            new ToTranslate(TrKey.YOUR_NOTES, userLangCode, {
              text: printListNotes(printNotes, userTimeZone),
            }),
            userLangCode,
          );
        },
      },
    ]));

  const realCtgTitle3 = 'realCtgTitle3';
  const cmd_listntw_l2d = `${cmd_listnt} [${CommandParameterName.startDate}${PARAMS_EQ}2019.01.20 ${CommandParameterName.endDate}${PARAMS_EQ}2019.02.03 ${CommandParameterName.limit}${PARAMS_EQ}4]`;
  it(`"${cmd_listntw_l2d}" should print notes for days and weeks`, () =>
    testBotMsgsRes([
      {
        toSendText: cmd_listntw_l2d,
        prepareDB: async () => {
          serverNowDate = parseUserDateToUTC('2019.01.28', userTimeZone);
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
            createDeletedCategory({
              title: realCtgTitle3,
              peer_id: chatId,
              created_by_user_id: userIdStr,
            }),
          );
          await appBotMock.db.categories.add(
            { table_peer_id: chatId },
            createDeletedCategory({
              title: realCtgTitle3,
              peer_id: chatId,
              created_by_user_id: userIdStr,
            }),
          );
          const dbNote1 = await appBotMock.db.notes.add(
            { table_peer_id: chatId },
            composeAddNote({
              peer_id: chatId,
              category_id: dbCategory2.id,
              created_by_user_id: userIdStr,
              note_number: -75,
              datetime: serverNowDate ? subDays(serverNowDate, 2) : undefined,
            }),
          );
          const dbNote2 = await appBotMock.db.notes.add(
            { table_peer_id: chatId },
            composeAddNote({
              peer_id: chatId,
              category_id: dbCategory2.id,
              created_by_user_id: userIdStr,
              note_number: 15.0,
              datetime: serverNowDate ? subWeeks(serverNowDate, 1) : undefined,
            }),
          );
          const dbNote3 = await appBotMock.db.notes.add(
            { table_peer_id: chatId },
            composeAddNote({
              peer_id: chatId,
              category_id: dbCategory1.id,
              created_by_user_id: userIdStr,
              note_number: 5,
              datetime: serverNowDate ? subWeeks(serverNowDate, 2) : undefined,
            }),
          );
          const dbNote4 = await appBotMock.db.notes.add(
            { table_peer_id: chatId },
            composeAddNote({
              peer_id: chatId,
              category_id: dbCategory1.id,
              created_by_user_id: userIdStr,
              note_number: 98,
              datetime: serverNowDate
                ? new Date(serverNowDate.getTime() - 4000)
                : undefined,
            }),
          );
          const dbNote5 = await appBotMock.db.notes.add(
            { table_peer_id: chatId },
            composeAddNote({
              peer_id: chatId,
              category_id: dbCategory2.id,
              created_by_user_id: userIdStr,
              note_number: -56,
              datetime: serverNowDate
                ? new Date(serverNowDate.getTime() - 3000)
                : undefined,
            }),
          );
          const dbNote6 = await appBotMock.db.notes.add(
            { table_peer_id: chatId },
            createDeletedNote({
              peer_id: chatId,
              category_id: dbCategory3.id,
              created_by_user_id: userIdStr,
              note_number: -552,
              datetime: serverNowDate
                ? new Date(serverNowDate.getTime() - 2000)
                : undefined,
            }),
          );
          const dbNote7 = await appBotMock.db.notes.add(
            { table_peer_id: chatId },
            createDeletedNote({
              peer_id: chatId,
              category_id: dbCategory3.id,
              created_by_user_id: userIdStr,
              note_number: 25,
              datetime: serverNowDate ? subWeeks(serverNowDate, 5) : undefined,
            }),
          );
          const dbNoteJoinCtgSbc1 = await appBotMock.db.notes.findJoinCtgSbc({
            table_peer_id: chatId,
            note_id: dbNote1.id,
            peer_id: chatId,
          });
          const dbNoteJoinCtgSbc2 = await appBotMock.db.notes.findJoinCtgSbc({
            table_peer_id: chatId,
            note_id: dbNote2.id,
            peer_id: chatId,
          });
          const dbNoteJoinCtgSbc3 = await appBotMock.db.notes.findJoinCtgSbc({
            table_peer_id: chatId,
            note_id: dbNote3.id,
            peer_id: chatId,
          });
          const dbNoteJoinCtgSbc4 = await appBotMock.db.notes.findJoinCtgSbc({
            table_peer_id: chatId,
            note_id: dbNote4.id,
            peer_id: chatId,
          });
          const dbNoteJoinCtgSbc5 = await appBotMock.db.notes.findJoinCtgSbc({
            table_peer_id: chatId,
            note_id: dbNote5.id,
            peer_id: chatId,
          });
          const dbNoteJoinCtgSbc6 = await appBotMock.db.notes.findJoinCtgSbc({
            table_peer_id: chatId,
            note_id: dbNote6.id,
            peer_id: chatId,
            in_deleted: true,
          });
          const dbNoteJoinCtgSbc7 = await appBotMock.db.notes.findJoinCtgSbc({
            table_peer_id: chatId,
            note_id: dbNote7.id,
            peer_id: chatId,
            in_deleted: true,
          });
          return {
            dbNoteJoinCtgSbc1,
            dbNoteJoinCtgSbc2,
            dbNoteJoinCtgSbc3,
            dbNoteJoinCtgSbc4,
            dbNoteJoinCtgSbc5,
            dbNoteJoinCtgSbc6,
            dbNoteJoinCtgSbc7,
          };
        },
        toBeMessage: (_) => {
          const ret = Object.assign(
            {
              limitNum: 4,
              startDateTime: '20.01.2019 00:00:00',
              endDateTime: '03.02.2019 23:59:59',
            },
            _[0].preparedData,
          );
          const printNotes = [
            ret.dbNoteJoinCtgSbc5,
            ret.dbNoteJoinCtgSbc4,
            ret.dbNoteJoinCtgSbc1,
            ret.dbNoteJoinCtgSbc2,
          ];
          return toListHeader(
            ret,
            new ToTranslate(TrKey.YOUR_NOTES, userLangCode, {
              text: printListNotes(printNotes, userTimeZone),
            }),
            userLangCode,
          );
        },
      },
      {
        toSendText: `${cmd_listnt} [${CommandParameterName.date}${PARAMS_EQ}2018.12.24 ${CommandParameterName.limit}${PARAMS_EQ}1 ${CommandParameterName.query}${PARAMS_EQ}${realCtgTitle3} ${CommandParameterName.showDeleted}${PARAMS_EQ}t]`,
        toBeMessage: (_) => {
          const ret = Object.assign(
            {
              limitNum: 1,
              showDeleted: true,
              query: realCtgTitle3,
              startDateTime: '24.12.2018 00:00:00',
              endDateTime: '24.12.2018 23:59:59',
            },
            _[0].preparedData,
          );
          const printNotes = [ret.dbNoteJoinCtgSbc7];
          ret.ntCount = undefined;
          return toListHeader(
            ret,
            new ToTranslate(TrKey.YOUR_NOTES, userLangCode, {
              text: printListNotes(printNotes, userTimeZone),
            }),
            userLangCode,
          );
        },
      },
    ]));

  const realSbcTitle = 'realSbcTitle';
  const cmd_listntd_l10d_s2d_id = `${cmd_listnt} [${CommandParameterName.startDate}${PARAMS_EQ}2019.01.17 ${CommandParameterName.endDate}${PARAMS_EQ}2019.01.26 ${CommandParameterName.limit}${PARAMS_EQ}9 ${CommandParameterName.showId}${PARAMS_EQ}t]`;
  it(`"${cmd_listntd_l10d_s2d_id}" should print 2 notes exept current and previous day notes and print deleted note`, () =>
    testBotMsgsRes([
      {
        toSendText: cmd_listntd_l10d_s2d_id,
        prepareDB: async () => {
          serverNowDate = parseUserDateToUTC('2019.01.28', userTimeZone);
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
            createDeletedSubcategory({
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
              category_id: dbCategory2.id,
              created_by_user_id: userIdStr,
              note_number: 589,
              datetime: serverNowDate ? subDays(serverNowDate, 4) : undefined,
            }),
          );
          const dbNote2 = await appBotMock.db.notes.add(
            { table_peer_id: chatId },
            composeAddNote({
              peer_id: chatId,
              category_id: dbCategory2.id,
              created_by_user_id: userIdStr,
              note_number: 654,
              datetime: serverNowDate ? subDays(serverNowDate, 3) : undefined,
            }),
          );
          const dbNote3 = await appBotMock.db.notes.add(
            { table_peer_id: chatId },
            createDeletedNote({
              peer_id: chatId,
              category_id: dbCategory2.id,
              created_by_user_id: userIdStr,
              note_number: -23,
              datetime: serverNowDate ? subMonths(serverNowDate, 2) : undefined,
            }),
          );
          const dbNote4 = await appBotMock.db.notes.add(
            { table_peer_id: chatId },
            composeAddNote({
              peer_id: chatId,
              category_id: dbCategory1.id,
              created_by_user_id: userIdStr,
              note_number: 23.5,
              datetime: serverNowDate ? subDays(serverNowDate, 1) : undefined,
              subcategory_id: dbSubcategory1.id,
            }),
          );
          await appBotMock.db.notes.add(
            { table_peer_id: chatId },
            composeAddNote({
              peer_id: chatId,
              category_id: dbCategory2.id,
              created_by_user_id: userIdStr,
              note_number: 43,
              datetime: serverNowDate,
            }),
          );
          const dbNoteJoinCtgSbc1 = await appBotMock.db.notes.findJoinCtgSbc({
            table_peer_id: chatId,
            note_id: dbNote1.id,
            peer_id: chatId,
          });
          const dbNoteJoinCtgSbc2 = await appBotMock.db.notes.findJoinCtgSbc({
            table_peer_id: chatId,
            note_id: dbNote2.id,
            peer_id: chatId,
          });
          const dbNoteJoinCtgSbc3 = await appBotMock.db.notes.findJoinCtgSbc({
            table_peer_id: chatId,
            note_id: dbNote3.id,
            peer_id: chatId,
            in_deleted: true,
          });
          const dbNoteJoinCtgSbc4 = await appBotMock.db.notes.findJoinCtgSbc({
            table_peer_id: chatId,
            note_id: dbNote4.id,
            peer_id: chatId,
          });
          return {
            dbNoteJoinCtgSbc1,
            dbNoteJoinCtgSbc2,
            dbNoteJoinCtgSbc3,
            dbNoteJoinCtgSbc4,
          };
        },
        toBeMessage: (_) => {
          const ret = Object.assign(
            {
              limitNum: 9,
              showId: true,
              startDateTime: '17.01.2019 00:00:00',
              endDateTime: '26.01.2019 23:59:59',
            },
            _[0].preparedData,
          );
          const printNotes = [ret.dbNoteJoinCtgSbc2, ret.dbNoteJoinCtgSbc1];
          ret.ntCount = printNotes.length;
          return toListHeader(
            ret,
            new ToTranslate(TrKey.YOUR_NOTES, userLangCode, {
              text: printListNotes(printNotes, userTimeZone, true),
            }),
            userLangCode,
          );
        },
      },
      {
        toSendText: `${cmd_listnt} [${CommandParameterName.relativeYear}${PARAMS_EQ}-1 ${CommandParameterName.showDeleted}${PARAMS_EQ}t]`,
        toBeMessage: (_) => {
          const { startUserDateTime, endUserDateTime } = calcStartEndYear({
            timeZone: userTimeZone,
            weekStartsOn: config.test.user_week_starts_on,
            skip: 1,
          });
          const ret = Object.assign(
            {
              showDeleted: true,
              startDateTime: startUserDateTime,
              endDateTime: endUserDateTime,
            },
            _[0].preparedData,
          );
          ret.ntCount = 1;
          return toListHeader(
            ret,
            new ToTranslate(TrKey.YOUR_NOTES, userLangCode, {
              text: printListNotes([ret.dbNoteJoinCtgSbc3], userTimeZone),
            }),
            userLangCode,
          );
        },
      },
      {
        toSendText: `${cmd_listnt} [${CommandParameterName.relativeYear}${PARAMS_EQ}0 ${CommandParameterName.query}${PARAMS_EQ}${realSbcTitle}]`,
        toBeMessage: (_) => {
          const { startUserDateTime, endUserDateTime } = calcStartEndYear({
            timeZone: userTimeZone,
            weekStartsOn: config.test.user_week_starts_on,
          });
          const ret = Object.assign(
            {
              startDateTime: startUserDateTime,
              endDateTime: endUserDateTime,
              query: realSbcTitle,
            },
            _[0].preparedData,
          );
          ret.ntCount = 1;
          return toListHeader(
            ret,
            new ToTranslate(TrKey.YOUR_NOTES, userLangCode, {
              text: printListNotes([ret.dbNoteJoinCtgSbc4], userTimeZone),
            }),
            userLangCode,
          );
        },
      },
    ]));

  const desc_srch = 'glo';
  const cmd_listctg_desc = `${cmd_listnt} [${CommandParameterName.relativeDay}${PARAMS_EQ}6 ${CommandParameterName.query}${PARAMS_EQ}${desc_srch}]`;
  it(`"${cmd_listctg_desc}" should print notes found by query parameter`, () =>
    testBotMsgsRes([
      {
        toSendText: cmd_listctg_desc,
        prepareDB: async () => {
          serverNowDate = parseUserDateTimeToUTC(
            '2019.02.09 12:00',
            userTimeZone,
          );
          setDTDate(serverNowDate);
          await appBotMock.db.notes.deleteAll({ table_peer_id: chatId });
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
              description: 'no hf',
            }),
          );
          const dbCategory2 = await appBotMock.db.categories.add(
            { table_peer_id: chatId },
            composeAddCategory({
              title: realCtgTitle2,
              peer_id: chatId,
              created_by_user_id: userIdStr,
              description: 'ml f',
            }),
          );
          await appBotMock.db.categories.add(
            { table_peer_id: chatId },
            createDeletedCategory({
              title: realCtgTitle2,
              peer_id: chatId,
              created_by_user_id: userIdStr,
              description: 'no hf',
            }),
          );
          await appBotMock.db.categories.add(
            { table_peer_id: chatId },
            createDeletedCategory({
              title: realCtgTitle2,
              peer_id: chatId,
              created_by_user_id: userIdStr,
              description: 'no hf',
            }),
          );
          const dbNote1 = await appBotMock.db.notes.add(
            { table_peer_id: chatId },
            composeAddNote({
              peer_id: chatId,
              category_id: dbCategory2.id,
              created_by_user_id: userIdStr,
              note_number: 589,
              note_text: 'sdfa dsfa',
              datetime: serverNowDate ? subDays(serverNowDate, 1) : undefined,
            }),
          );
          const dbNote2 = await appBotMock.db.notes.add(
            { table_peer_id: chatId },
            composeAddNote({
              peer_id: chatId,
              category_id: dbCategory2.id,
              created_by_user_id: userIdStr,
              note_number: 654,
              note_text: 'gok glo',
              datetime: serverNowDate ? subDays(serverNowDate, 3) : undefined,
            }),
          );
          const dbNoteJoinCtgSbc1 = await appBotMock.db.notes.findJoinCtgSbc({
            table_peer_id: chatId,
            note_id: dbNote1.id,
            peer_id: chatId,
          });
          const dbNoteJoinCtgSbc2 = await appBotMock.db.notes.findJoinCtgSbc({
            table_peer_id: chatId,
            note_id: dbNote2.id,
            peer_id: chatId,
          });
          return { dbNoteJoinCtgSbc1, dbNoteJoinCtgSbc2 };
        },
        toBeMessage: (_) => {
          const ret = Object.assign(
            {
              query: desc_srch,
              startDateTime: '06.02.2019 00:00:00',
              endDateTime: '06.02.2019 23:59:59',
            },
            _[0].preparedData,
          );
          const printNotes = [ret.dbNoteJoinCtgSbc2];
          ret.ntCount = printNotes.length;
          return toListHeader(
            ret,
            new ToTranslate(TrKey.YOUR_NOTES, userLangCode, {
              text: printListNotes(printNotes, userTimeZone),
            }),
            userLangCode,
          );
        },
      },
      {
        toSendText: `${cmd_listnt} [${CommandParameterName.date}${PARAMS_EQ}2019.01.28 ${CommandParameterName.query}${PARAMS_EQ}${desc_srch}]`,
        toBeText: () => `(начиная с даты "28.01.2019 00:00:00")
(заканчивая датой "28.01.2019 23:59:59")
(шаблон поиска "glo")
Нет записей`,
      },
    ]));

  it(`"${cmd_listnt} bee" should print notes found by query text`, () =>
    testBotMsgsRes([
      {
        toSendText: `${cmd_listnt} bee [${CommandParameterName.startDate}${PARAMS_EQ}2019.02.07]`,
        prepareDB: async () => {
          serverNowDate = parseUserDateTimeToUTC(
            '2019.02.10 12:00',
            userTimeZone,
          );
          setDTDate(serverNowDate);
          await appBotMock.db.notes.deleteAll({ table_peer_id: chatId });
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
              description: 'no hf',
            }),
          );
          const dbCtg2 = await appBotMock.db.categories.add(
            { table_peer_id: chatId },
            composeAddCategory({
              title: realCtgTitle2,
              peer_id: chatId,
              created_by_user_id: userIdStr,
              description: 'ml f',
            }),
          );
          await appBotMock.db.categories.add(
            { table_peer_id: chatId },
            createDeletedCategory({
              title: realCtgTitle2,
              peer_id: chatId,
              created_by_user_id: userIdStr,
              description: 'no hf',
            }),
          );
          await appBotMock.db.categories.add(
            { table_peer_id: chatId },
            createDeletedCategory({
              title: realCtgTitle2,
              peer_id: chatId,
              created_by_user_id: userIdStr,
              description: 'no hf',
            }),
          );
          const dbNote1 = await appBotMock.db.notes.add(
            { table_peer_id: chatId },
            composeAddNote({
              peer_id: chatId,
              category_id: dbCtg2.id,
              created_by_user_id: userIdStr,
              note_number: 589,
              note_text: 'blum bee',
              datetime: serverNowDate ? subDays(serverNowDate, 1) : undefined,
            }),
          );
          const dbNote2 = await appBotMock.db.notes.add(
            { table_peer_id: chatId },
            composeAddNote({
              peer_id: chatId,
              category_id: dbCtg2.id,
              created_by_user_id: userIdStr,
              note_number: 654,
              note_text: 'bee mum',
              datetime: serverNowDate ? subDays(serverNowDate, 3) : undefined,
            }),
          );
          const dbNoteJoinCtgSbc1 = await appBotMock.db.notes.findJoinCtgSbc({
            table_peer_id: chatId,
            note_id: dbNote1.id,
            peer_id: chatId,
          });
          const dbNoteJoinCtgSbc2 = await appBotMock.db.notes.findJoinCtgSbc({
            table_peer_id: chatId,
            note_id: dbNote2.id,
            peer_id: chatId,
          });
          return { dbNoteJoinCtgSbc1, dbNoteJoinCtgSbc2 };
        },
        toBeText: (_) => `(начиная с даты "07.02.2019 00:00:00")
(заканчивая датой "10.02.2019 12:00:00")
(шаблон поиска "bee")
(количество записей "2")
Ваши записи:
🆔${_[0].preparedData.dbNoteJoinCtgSbc1.id}  realCtgTitle2 589 "blum bee" 📅09.02.2019🕛12:00:00

🆔${_[0].preparedData.dbNoteJoinCtgSbc2.id}  realCtgTitle2 654 "bee mum" 📅07.02.2019🕛12:00:00`,
      },
      {
        toSendText: `${cmd_listnt} [${CommandParameterName.startDate}${PARAMS_EQ}2019.02.07 ${CommandParameterName.query}${PARAMS_EQ}bee]`,
        toBeText: (_) => `(начиная с даты "07.02.2019 00:00:00")
(заканчивая датой "10.02.2019 12:00:00")
(шаблон поиска "bee")
(количество записей "2")
Ваши записи:
🆔${_[0].preparedData.dbNoteJoinCtgSbc1.id}  realCtgTitle2 589 "blum bee" 📅09.02.2019🕛12:00:00

🆔${_[0].preparedData.dbNoteJoinCtgSbc2.id}  realCtgTitle2 654 "bee mum" 📅07.02.2019🕛12:00:00`,
      },
    ]));

  const ntlist_amb_failures = [
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
    {
      parName: CommandParameterName.ntQueryText,
    },
  ];
  for (const ntlist_amb_failure of ntlist_amb_failures) {
    const { parName } = ntlist_amb_failure;
    const cmd = `${cmd_listnt} hoho [${parName}=hoho]`;
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

  it(`should print notes found by query (title/description/text/number) parameter`, () =>
    testBotMsgsRes([
      {
        toSendText: `${cmd_listnt} [${CommandParameterName.startDate}${PARAMS_EQ}2019.02.07 ${CommandParameterName.ctgQuery}${PARAMS_EQ}g-1]`,
        prepareDB: async () => {
          serverNowDate = parseUserDateTimeToUTC(
            '2019.02.09 12:00',
            userTimeZone,
          );
          setDTDate(serverNowDate);
          await appBotMock.db.notes.deleteAll({ table_peer_id: chatId });
          await appBotMock.db.subcategories.deleteAll({
            table_peer_id: chatId,
          });
          await appBotMock.db.categories.deleteAll({
            table_peer_id: chatId,
          });
          const dbCtg1 = await appBotMock.db.categories.add(
            { table_peer_id: chatId },
            composeAddCategory({
              title: 'ctg-1',
              description: 'ctg-descr-1',
              peer_id: chatId,
              created_by_user_id: userIdStr,
            }),
          );
          const dbSbc1 = await appBotMock.db.subcategories.add(
            { table_peer_id: chatId },
            checkAddSubcategory({
              title: 'sbc-1',
              description: 'sbc-descr-1',
              peer_id: chatId,
              category_id: dbCtg1.id,
              created_by_user_id: userIdStr,
              created_at: serverNowDate
                ? new Date(serverNowDate.getTime() + 3)
                : undefined,
            }),
          );
          const dbCtg2 = await appBotMock.db.categories.add(
            { table_peer_id: chatId },
            composeAddCategory({
              title: 'ctg-2',
              description: 'ctg-descr-2',
              peer_id: chatId,
              created_by_user_id: userIdStr,
            }),
          );
          const dbSbc2 = await appBotMock.db.subcategories.add(
            { table_peer_id: chatId },
            checkAddSubcategory({
              title: 'sbc-2',
              description: 'sbc-descr-2',
              peer_id: chatId,
              category_id: dbCtg1.id,
              created_by_user_id: userIdStr,
              created_at: serverNowDate
                ? new Date(serverNowDate.getTime() + 3)
                : undefined,
            }),
          );
          const dbNt1 = await appBotMock.db.notes.add(
            { table_peer_id: chatId },
            composeAddNote({
              peer_id: chatId,
              category_id: dbCtg1.id,
              created_by_user_id: userIdStr,
              note_number: 589,
              note_text: 'note-text-1',
              datetime: serverNowDate ? subDays(serverNowDate, 1) : undefined,
            }),
          );
          const dbNt2 = await appBotMock.db.notes.add(
            { table_peer_id: chatId },
            composeAddNote({
              peer_id: chatId,
              category_id: dbCtg2.id,
              created_by_user_id: userIdStr,
              note_number: 654,
              note_text: 'note-text-2',
              datetime: serverNowDate ? subDays(serverNowDate, 3) : undefined,
            }),
          );
          const dbNt12 = await appBotMock.db.notes.add(
            { table_peer_id: chatId },
            composeAddNote({
              peer_id: chatId,
              category_id: dbCtg1.id,
              subcategory_id: dbSbc1.id,
              created_by_user_id: userIdStr,
              note_number: -666.66,
              note_text: 'note-text-12',
              datetime: serverNowDate ? subDays(serverNowDate, 2) : undefined,
            }),
          );
          const dbNt22 = await appBotMock.db.notes.add(
            { table_peer_id: chatId },
            composeAddNote({
              peer_id: chatId,
              category_id: dbCtg2.id,
              subcategory_id: dbSbc2.id,
              created_by_user_id: userIdStr,
              note_number: 123,
              note_text: 'note-text-22',
              datetime: serverNowDate ? subDays(serverNowDate, 4) : undefined,
            }),
          );
          return {
            dbCtg1,
            dbCtg2,
            dbSbc1,
            dbSbc2,
            dbNt1,
            dbNt2,
            dbNt12,
            dbNt22,
          };
        },
        toBeText: (_) => `(начиная с даты "07.02.2019 00:00:00")
(заканчивая датой "09.02.2019 12:00:00")
(поиск по категориям "g-1")
(количество записей "2")
Ваши записи:
🆔${_[0].preparedData.dbNt1.id}  ctg-1 589 "note-text-1" 📅08.02.2019🕛12:00:00

🆔${_[0].preparedData.dbNt12.id}  ctg-1 sbc-1 -666.66 "note-text-12" 📅07.02.2019🕛12:00:00`,
      },
      {
        toSendText: `${cmd_listnt} [${CommandParameterName.startDate}${PARAMS_EQ}2019.02.05 ${CommandParameterName.ctgQuery}${PARAMS_EQ}g-2]`,
        toBeText: (_) => `(начиная с даты "05.02.2019 00:00:00")
(заканчивая датой "09.02.2019 12:00:00")
(поиск по категориям "g-2")
(количество записей "2")
Ваши записи:
🆔${_[0].preparedData.dbNt2.id}  ctg-2 654 "note-text-2" 📅06.02.2019🕛12:00:00

🆔${_[0].preparedData.dbNt22.id}  ctg-2 sbc-2 123 "note-text-22" 📅05.02.2019🕛12:00:00`,
      },
      {
        toSendText: `${cmd_listnt} [${CommandParameterName.relativeDay}${PARAMS_EQ}7 ${CommandParameterName.sbcQuery}${PARAMS_EQ}c-1]`,
        toBeText: (_) => `(начиная с даты "07.02.2019 00:00:00")
(заканчивая датой "07.02.2019 23:59:59")
(поиск по подкатегориям "c-1")
(количество записей "1")
Ваши записи:
🆔${_[0].preparedData.dbNt12.id}  ctg-1 sbc-1 -666.66 "note-text-12" 📅07.02.2019🕛12:00:00`,
      },
      {
        toSendText: `${cmd_listnt} [${CommandParameterName.startDate}${PARAMS_EQ}2019.02.05 ${CommandParameterName.ctgQueryTitle}${PARAMS_EQ}ctg]`,
        toBeText: (_) => `(начиная с даты "05.02.2019 00:00:00")
(заканчивая датой "09.02.2019 12:00:00")
(поиск по названию категорий "ctg")
(количество записей "4")
Ваши записи:
🆔${_[0].preparedData.dbNt1.id}  ctg-1 589 "note-text-1" 📅08.02.2019🕛12:00:00

🆔${_[0].preparedData.dbNt12.id}  ctg-1 sbc-1 -666.66 "note-text-12" 📅07.02.2019🕛12:00:00

🆔${_[0].preparedData.dbNt2.id}  ctg-2 654 "note-text-2" 📅06.02.2019🕛12:00:00

🆔${_[0].preparedData.dbNt22.id}  ctg-2 sbc-2 123 "note-text-22" 📅05.02.2019🕛12:00:00`,
      },
      {
        toSendText: `${cmd_listnt} [${CommandParameterName.relativeMonth}${PARAMS_EQ}0 ${CommandParameterName.ctgQueryDescr}${PARAMS_EQ}ctg-descr-2]`,
        toBeText: (_) => `(начиная с даты "01.02.2019 00:00:00")
(заканчивая датой "28.02.2019 23:59:59")
(поиск по описанию категорий "ctg-descr-2")
(количество записей "2")
Ваши записи:
🆔${_[0].preparedData.dbNt2.id}  ctg-2 654 "note-text-2" 📅06.02.2019🕛12:00:00

🆔${_[0].preparedData.dbNt22.id}  ctg-2 sbc-2 123 "note-text-22" 📅05.02.2019🕛12:00:00`,
      },
      {
        toSendText: `${cmd_listnt} [${CommandParameterName.relativeYear}${PARAMS_EQ}0 ${CommandParameterName.sbcQueryTitle}${PARAMS_EQ}ctg]`,
        toBeText: () => `(начиная с даты "01.01.2019 00:00:00")
(заканчивая датой "31.12.2019 23:59:59")
(поиск по названию подкатегорий "ctg")
Нет записей`,
      },
      {
        toSendText: `${cmd_listnt} [${CommandParameterName.startDate}${PARAMS_EQ}2019.02.05 ${CommandParameterName.endDate}${PARAMS_EQ}2019.02.06 ${CommandParameterName.ctgQueryDescr}${PARAMS_EQ}ctg-descr-2]`,
        toBeText: (_) => `(начиная с даты "05.02.2019 00:00:00")
(заканчивая датой "06.02.2019 23:59:59")
(поиск по описанию категорий "ctg-descr-2")
(количество записей "2")
Ваши записи:
🆔${_[0].preparedData.dbNt2.id}  ctg-2 654 "note-text-2" 📅06.02.2019🕛12:00:00

🆔${_[0].preparedData.dbNt22.id}  ctg-2 sbc-2 123 "note-text-22" 📅05.02.2019🕛12:00:00`,
      },
      {
        toSendText: `${cmd_listnt} [${CommandParameterName.startDate}${PARAMS_EQ}2019.02.07 ${CommandParameterName.endDate}${PARAMS_EQ}2019.02.08 ${CommandParameterName.ntQueryText}${PARAMS_EQ}-1]`,
        toBeText: (_) => `(начиная с даты "07.02.2019 00:00:00")
(заканчивая датой "08.02.2019 23:59:59")
(поиск по тексту записи "-1")
(количество записей "2")
Ваши записи:
🆔${_[0].preparedData.dbNt1.id}  ctg-1 589 "note-text-1" 📅08.02.2019🕛12:00:00

🆔${_[0].preparedData.dbNt12.id}  ctg-1 sbc-1 -666.66 "note-text-12" 📅07.02.2019🕛12:00:00`,
      },
      {
        toSendText: `${cmd_listnt} [${CommandParameterName.date}${PARAMS_EQ}2019.02.06 ${CommandParameterName.ntQueryNumber}${PARAMS_EQ}654]`,
        toBeText: (_) => `(начиная с даты "06.02.2019 00:00:00")
(заканчивая датой "06.02.2019 23:59:59")
(поиск по числу записи "654")
(количество записей "1")
Ваши записи:
🆔${_[0].preparedData.dbNt2.id}  ctg-2 654 "note-text-2" 📅06.02.2019🕛12:00:00`,
      },
      {
        toSendText: `${cmd_listnt} [${CommandParameterName.date}${PARAMS_EQ}2019.02.07 ${CommandParameterName.ntQueryNumber}${PARAMS_EQ}-666.66]`,
        toBeText: (_) => `(начиная с даты "07.02.2019 00:00:00")
(заканчивая датой "07.02.2019 23:59:59")
(поиск по числу записи "-666.66")
(количество записей "1")
Ваши записи:
🆔${_[0].preparedData.dbNt12.id}  ctg-1 sbc-1 -666.66 "note-text-12" 📅07.02.2019🕛12:00:00`,
      },
    ]));

  it(`should print notes found by number range`, () =>
    testBotMsgsRes([
      {
        toSendText: () =>
          `${cmd_listnt} [${CommandParameterName.ntQueryNumberGreaterThan}${PARAMS_EQ}350]`,
        prepareDB: async () => {
          serverNowDate = parseUserDateTimeToUTC(
            '2019.02.09 12:00',
            userTimeZone,
          );
          setDTDate(serverNowDate);
          await appBotMock.db.notes.deleteAll({ table_peer_id: chatId });
          await appBotMock.db.subcategories.deleteAll({
            table_peer_id: chatId,
          });
          await appBotMock.db.categories.deleteAll({
            table_peer_id: chatId,
          });
          const dbCtg1 = await appBotMock.db.categories.add(
            { table_peer_id: chatId },
            composeAddCategory({
              title: 'ctg-1',
              peer_id: chatId,
              created_by_user_id: userIdStr,
            }),
          );
          const dbSbc1 = await appBotMock.db.subcategories.add(
            { table_peer_id: chatId },
            checkAddSubcategory({
              title: 'sbc-1',
              peer_id: chatId,
              category_id: dbCtg1.id,
              created_by_user_id: userIdStr,
              created_at: serverNowDate
                ? new Date(serverNowDate.getTime() + 2)
                : undefined,
            }),
          );
          const dbCtg2 = await appBotMock.db.categories.add(
            { table_peer_id: chatId },
            composeAddCategory({
              title: 'ctg-2',
              peer_id: chatId,
              created_by_user_id: userIdStr,
            }),
          );
          const dbSbc2 = await appBotMock.db.subcategories.add(
            { table_peer_id: chatId },
            checkAddSubcategory({
              title: 'sbc-2',
              peer_id: chatId,
              category_id: dbCtg1.id,
              created_by_user_id: userIdStr,
              created_at: serverNowDate
                ? new Date(serverNowDate.getTime() + 3)
                : undefined,
            }),
          );
          const dbNt1 = await appBotMock.db.notes.add(
            { table_peer_id: chatId },
            composeAddNote({
              peer_id: chatId,
              category_id: dbCtg1.id,
              created_by_user_id: userIdStr,
              note_number: 100,
              note_text: 'note-text-1',
              datetime: serverNowDate ? subDays(serverNowDate, 1) : undefined,
            }),
          );
          const dbNt2 = await appBotMock.db.notes.add(
            { table_peer_id: chatId },
            composeAddNote({
              peer_id: chatId,
              category_id: dbCtg2.id,
              created_by_user_id: userIdStr,
              note_number: 200,
              note_text: 'note-text-2',
              datetime: serverNowDate ? subDays(serverNowDate, 3) : undefined,
            }),
          );
          const dbNt3 = await appBotMock.db.notes.add(
            { table_peer_id: chatId },
            composeAddNote({
              peer_id: chatId,
              category_id: dbCtg1.id,
              subcategory_id: dbSbc1.id,
              created_by_user_id: userIdStr,
              note_number: 300,
              note_text: 'note-text-3',
              datetime: serverNowDate ? subDays(serverNowDate, 2) : undefined,
            }),
          );
          const dbNt4 = await appBotMock.db.notes.add(
            { table_peer_id: chatId },
            composeAddNote({
              peer_id: chatId,
              category_id: dbCtg2.id,
              subcategory_id: dbSbc2.id,
              created_by_user_id: userIdStr,
              note_number: 400,
              note_text: 'note-text-4',
              datetime: serverNowDate ? subDays(serverNowDate, 4) : undefined,
            }),
          );
          const dbNt5 = await appBotMock.db.notes.add(
            { table_peer_id: chatId },
            composeAddNote({
              peer_id: chatId,
              category_id: dbCtg1.id,
              subcategory_id: dbSbc1.id,
              created_by_user_id: userIdStr,
              note_number: -100,
              note_text: 'note-text-5',
              datetime: serverNowDate ? subDays(serverNowDate, 5) : undefined,
            }),
          );
          const dbNt6 = await appBotMock.db.notes.add(
            { table_peer_id: chatId },
            composeAddNote({
              peer_id: chatId,
              category_id: dbCtg2.id,
              subcategory_id: dbSbc2.id,
              created_by_user_id: userIdStr,
              note_number: -200,
              note_text: 'note-text-6',
              datetime: serverNowDate ? subDays(serverNowDate, 6) : undefined,
            }),
          );
          return {
            dbCtg1,
            dbCtg2,
            dbSbc1,
            dbSbc2,
            dbNt1,
            dbNt2,
            dbNt3,
            dbNt4,
            dbNt5,
            dbNt6,
          };
        },
        toBeText: (_) => `(лимит "10")
(заканчивая датой "09.02.2019 12:00:00")
(поиск по числу записи которое больше чем "350")
(количество записей "1")
Ваши записи:
🆔${_[0].preparedData.dbNt4.id}  ctg-2 sbc-2 400 "note-text-4" 📅05.02.2019🕛12:00:00`,
      },
      {
        toSendText: () =>
          `${cmd_listnt} [${CommandParameterName.ntQueryNumberGreaterThanOrEq}${PARAMS_EQ}400]`,
        toBeText: (_) => `(лимит "10")
(заканчивая датой "09.02.2019 12:00:00")
(поиск по числу записи которое больше чем или равно "400")
(количество записей "1")
Ваши записи:
🆔${_[0].preparedData.dbNt4.id}  ctg-2 sbc-2 400 "note-text-4" 📅05.02.2019🕛12:00:00`,
      },
      {
        toSendText: () =>
          `${cmd_listnt} [${CommandParameterName.ntQueryNumberLessThan}${PARAMS_EQ}150]`,
        toBeText: (_) => `(лимит "10")
(заканчивая датой "09.02.2019 12:00:00")
(поиск по числу записи которое меньше чем "150")
(количество записей "3")
Ваши записи:
🆔${_[0].preparedData.dbNt1.id}  ctg-1 100 "note-text-1" 📅08.02.2019🕛12:00:00

🆔${_[0].preparedData.dbNt5.id}  ctg-1 sbc-1 -100 "note-text-5" 📅04.02.2019🕛12:00:00

🆔${_[0].preparedData.dbNt6.id}  ctg-2 sbc-2 -200 "note-text-6" 📅03.02.2019🕛12:00:00`,
      },
      {
        toSendText: () =>
          `${cmd_listnt} [${CommandParameterName.ntQueryNumberLessThanOrEq}${PARAMS_EQ}100 ${CommandParameterName.ntQueryNumberGreaterThanOrEq}${PARAMS_EQ}-100]`,
        toBeText: (_) => `(лимит "10")
(заканчивая датой "09.02.2019 12:00:00")
(поиск по числу записи которое больше чем или равно "-100")
(поиск по числу записи которое меньше чем или равно "100")
(количество записей "2")
Ваши записи:
🆔${_[0].preparedData.dbNt1.id}  ctg-1 100 "note-text-1" 📅08.02.2019🕛12:00:00

🆔${_[0].preparedData.dbNt5.id}  ctg-1 sbc-1 -100 "note-text-5" 📅04.02.2019🕛12:00:00`,
      },
    ]));

  it(`should print notes found by id query`, () =>
    testBotMsgsRes([
      {
        toSendText: (_) =>
          `${cmd_listnt} [${CommandParameterName.ctgQueryIdGreaterThan}${PARAMS_EQ}${_[0].preparedData.dbCtg1.id}]`,
        prepareDB: async () => {
          serverNowDate = parseUserDateTimeToUTC(
            '2019.02.09 12:00',
            userTimeZone,
          );
          setDTDate(serverNowDate);
          await appBotMock.db.notes.deleteAll({ table_peer_id: chatId });
          await appBotMock.db.subcategories.deleteAll({
            table_peer_id: chatId,
          });
          await appBotMock.db.categories.deleteAll({
            table_peer_id: chatId,
          });
          const dbCtg1 = await appBotMock.db.categories.add(
            { table_peer_id: chatId },
            composeAddCategory({
              title: 'ctg-1',
              description: 'ctg-descr-1',
              peer_id: chatId,
              created_by_user_id: userIdStr,
            }),
          );
          const dbSbc1 = await appBotMock.db.subcategories.add(
            { table_peer_id: chatId },
            checkAddSubcategory({
              title: 'sbc-1',
              description: 'sbc-descr-1',
              peer_id: chatId,
              category_id: dbCtg1.id,
              created_by_user_id: userIdStr,
              created_at: serverNowDate
                ? new Date(serverNowDate.getTime() + 3)
                : undefined,
            }),
          );
          const dbCtg2 = await appBotMock.db.categories.add(
            { table_peer_id: chatId },
            composeAddCategory({
              title: 'ctg-2',
              description: 'ctg-descr-2',
              peer_id: chatId,
              created_by_user_id: userIdStr,
            }),
          );
          const dbSbc2 = await appBotMock.db.subcategories.add(
            { table_peer_id: chatId },
            checkAddSubcategory({
              title: 'sbc-2',
              description: 'sbc-descr-2',
              peer_id: chatId,
              category_id: dbCtg1.id,
              created_by_user_id: userIdStr,
              created_at: serverNowDate
                ? new Date(serverNowDate.getTime() + 3)
                : undefined,
            }),
          );
          const dbNt1 = await appBotMock.db.notes.add(
            { table_peer_id: chatId },
            composeAddNote({
              peer_id: chatId,
              category_id: dbCtg1.id,
              created_by_user_id: userIdStr,
              note_number: 589,
              note_text: 'note-text-1',
              datetime: serverNowDate ? subDays(serverNowDate, 1) : undefined,
            }),
          );
          const dbNt2 = await appBotMock.db.notes.add(
            { table_peer_id: chatId },
            composeAddNote({
              peer_id: chatId,
              category_id: dbCtg2.id,
              created_by_user_id: userIdStr,
              note_number: 654,
              note_text: 'note-text-2',
              datetime: serverNowDate ? subDays(serverNowDate, 3) : undefined,
            }),
          );
          const dbNt12 = await appBotMock.db.notes.add(
            { table_peer_id: chatId },
            composeAddNote({
              peer_id: chatId,
              category_id: dbCtg1.id,
              subcategory_id: dbSbc1.id,
              created_by_user_id: userIdStr,
              note_number: 666,
              note_text: 'note-text-12',
              datetime: serverNowDate ? subDays(serverNowDate, 2) : undefined,
            }),
          );
          const dbNt22 = await appBotMock.db.notes.add(
            { table_peer_id: chatId },
            composeAddNote({
              peer_id: chatId,
              category_id: dbCtg2.id,
              subcategory_id: dbSbc2.id,
              created_by_user_id: userIdStr,
              note_number: 123,
              note_text: 'note-text-22',
              datetime: serverNowDate ? subDays(serverNowDate, 4) : undefined,
            }),
          );
          return {
            dbCtg1,
            dbCtg2,
            dbSbc1,
            dbSbc2,
            dbNt1,
            dbNt2,
            dbNt12,
            dbNt22,
          };
        },
        toBeText: (_) => `(лимит "10")
(заканчивая датой "09.02.2019 12:00:00")
(поиск по категориям id которых больше чем "${_[0].preparedData.dbCtg1.id}")
(количество записей "2")
Ваши записи:
🆔${_[0].preparedData.dbNt2.id}  ctg-2 654 "note-text-2" 📅06.02.2019🕛12:00:00

🆔${_[0].preparedData.dbNt22.id}  ctg-2 sbc-2 123 "note-text-22" 📅05.02.2019🕛12:00:00`,
      },
      {
        toSendText: (_) =>
          `${cmd_listnt} [${CommandParameterName.ctgQueryIdGreaterThanOrEq}${PARAMS_EQ}${_[0].preparedData.dbCtg2.id}]`,
        toBeText: (_) => `(лимит "10")
(заканчивая датой "09.02.2019 12:00:00")
(поиск по категориям id которых больше чем или равно "${_[0].preparedData.dbCtg2.id}")
(количество записей "2")
Ваши записи:
🆔${_[0].preparedData.dbNt2.id}  ctg-2 654 "note-text-2" 📅06.02.2019🕛12:00:00

🆔${_[0].preparedData.dbNt22.id}  ctg-2 sbc-2 123 "note-text-22" 📅05.02.2019🕛12:00:00`,
      },
      {
        toSendText: (_) =>
          `${cmd_listnt} [${CommandParameterName.ctgQueryIdLessThan}${PARAMS_EQ}${_[0].preparedData.dbCtg2.id}]`,
        toBeText: (_) => `(лимит "10")
(заканчивая датой "09.02.2019 12:00:00")
(поиск по категориям id которых меньше чем "${_[0].preparedData.dbCtg2.id}")
(количество записей "2")
Ваши записи:
🆔${_[0].preparedData.dbNt1.id}  ctg-1 589 "note-text-1" 📅08.02.2019🕛12:00:00

🆔${_[0].preparedData.dbNt12.id}  ctg-1 sbc-1 666 "note-text-12" 📅07.02.2019🕛12:00:00`,
      },
      {
        toSendText: (_) =>
          `${cmd_listnt} [${CommandParameterName.ctgQueryIdLessThanOrEq}${PARAMS_EQ}${_[0].preparedData.dbCtg1.id}]`,
        toBeText: (_) => `(лимит "10")
(заканчивая датой "09.02.2019 12:00:00")
(поиск по категориям id которых меньше чем или равно "${_[0].preparedData.dbCtg1.id}")
(количество записей "2")
Ваши записи:
🆔${_[0].preparedData.dbNt1.id}  ctg-1 589 "note-text-1" 📅08.02.2019🕛12:00:00

🆔${_[0].preparedData.dbNt12.id}  ctg-1 sbc-1 666 "note-text-12" 📅07.02.2019🕛12:00:00`,
      },
      {
        toSendText: (_) =>
          `${cmd_listnt} [${CommandParameterName.sbcQueryIdGreaterThan}${PARAMS_EQ}${_[0].preparedData.dbSbc1.id}]`,
        toBeText: (_) => `(лимит "10")
(заканчивая датой "09.02.2019 12:00:00")
(поиск по подкатегориям id которых больше чем "${_[0].preparedData.dbSbc1.id}")
(количество записей "1")
Ваши записи:
🆔${_[0].preparedData.dbNt22.id}  ctg-2 sbc-2 123 "note-text-22" 📅05.02.2019🕛12:00:00`,
      },
      {
        toSendText: (_) =>
          `${cmd_listnt} [${CommandParameterName.sbcQueryIdGreaterThanOrEq}${PARAMS_EQ}${_[0].preparedData.dbSbc2.id}]`,
        toBeText: (_) => `(лимит "10")
(заканчивая датой "09.02.2019 12:00:00")
(поиск по подкатегориям id которых больше чем или равно "${_[0].preparedData.dbSbc2.id}")
(количество записей "1")
Ваши записи:
🆔${_[0].preparedData.dbNt22.id}  ctg-2 sbc-2 123 "note-text-22" 📅05.02.2019🕛12:00:00`,
      },
      {
        toSendText: (_) =>
          `${cmd_listnt} [${CommandParameterName.sbcQueryIdLessThan}${PARAMS_EQ}${_[0].preparedData.dbSbc2.id}]`,
        toBeText: (_) => `(лимит "10")
(заканчивая датой "09.02.2019 12:00:00")
(поиск по подкатегориям id которых меньше чем "${_[0].preparedData.dbSbc2.id}")
(количество записей "1")
Ваши записи:
🆔${_[0].preparedData.dbNt12.id}  ctg-1 sbc-1 666 "note-text-12" 📅07.02.2019🕛12:00:00`,
      },
      {
        toSendText: (_) =>
          `${cmd_listnt} [${CommandParameterName.sbcQueryIdLessThanOrEq}${PARAMS_EQ}${_[0].preparedData.dbSbc2.id}]`,
        toBeText: (_) => `(лимит "10")
(заканчивая датой "09.02.2019 12:00:00")
(поиск по подкатегориям id которых меньше чем или равно "${_[0].preparedData.dbSbc2.id}")
(количество записей "2")
Ваши записи:
🆔${_[0].preparedData.dbNt12.id}  ctg-1 sbc-1 666 "note-text-12" 📅07.02.2019🕛12:00:00

🆔${_[0].preparedData.dbNt22.id}  ctg-2 sbc-2 123 "note-text-22" 📅05.02.2019🕛12:00:00`,
      },
      {
        toSendText: (_) =>
          `${cmd_listnt} [${CommandParameterName.ntQueryIdGreaterThan}${PARAMS_EQ}${_[0].preparedData.dbNt12.id}]`,
        toBeText: (_) => `(лимит "10")
(заканчивая датой "09.02.2019 12:00:00")
(поиск по записям id которых больше чем "${_[0].preparedData.dbNt12.id}")
(количество записей "1")
Ваши записи:
🆔${_[0].preparedData.dbNt22.id}  ctg-2 sbc-2 123 "note-text-22" 📅05.02.2019🕛12:00:00`,
      },
      {
        toSendText: (_) =>
          `${cmd_listnt} [${CommandParameterName.ntQueryIdGreaterThanOrEq}${PARAMS_EQ}${_[0].preparedData.dbNt12.id}]`,
        toBeText: (_) => `(лимит "10")
(заканчивая датой "09.02.2019 12:00:00")
(поиск по записям id которых больше чем или равно "${_[0].preparedData.dbNt12.id}")
(количество записей "2")
Ваши записи:
🆔${_[0].preparedData.dbNt12.id}  ctg-1 sbc-1 666 "note-text-12" 📅07.02.2019🕛12:00:00

🆔${_[0].preparedData.dbNt22.id}  ctg-2 sbc-2 123 "note-text-22" 📅05.02.2019🕛12:00:00`,
      },
      {
        toSendText: (_) =>
          `${cmd_listnt} [${CommandParameterName.ntQueryIdLessThan}${PARAMS_EQ}${_[0].preparedData.dbNt12.id}]`,
        toBeText: (_) => `(лимит "10")
(заканчивая датой "09.02.2019 12:00:00")
(поиск по записям id которых меньше чем "${_[0].preparedData.dbNt12.id}")
(количество записей "2")
Ваши записи:
🆔${_[0].preparedData.dbNt1.id}  ctg-1 589 "note-text-1" 📅08.02.2019🕛12:00:00

🆔${_[0].preparedData.dbNt2.id}  ctg-2 654 "note-text-2" 📅06.02.2019🕛12:00:00`,
      },
      {
        toSendText: (_) =>
          `${cmd_listnt} [${CommandParameterName.ntQueryIdLessThanOrEq}${PARAMS_EQ}${_[0].preparedData.dbNt1.id}]`,
        toBeText: (_) => `(лимит "10")
(заканчивая датой "09.02.2019 12:00:00")
(поиск по записям id которых меньше чем или равно "${_[0].preparedData.dbNt1.id}")
(количество записей "1")
Ваши записи:
🆔${_[0].preparedData.dbNt1.id}  ctg-1 589 "note-text-1" 📅08.02.2019🕛12:00:00`,
      },
    ]));

  it(`should print notes found by start/end/date`, () =>
    testBotMsgsRes([
      {
        toSendText: () =>
          `${cmd_listnt} [${CommandParameterName.date}${PARAMS_EQ}2016.01.01]`,
        prepareDB: async () => {
          serverNowDate = parseUserDateTimeToUTC(
            '2016.01.01 00:02',
            userTimeZone,
          );
          setDTDate(serverNowDate);
          await appBotMock.db.notes.deleteAll({ table_peer_id: chatId });
          await appBotMock.db.subcategories.deleteAll({
            table_peer_id: chatId,
          });
          await appBotMock.db.categories.deleteAll({
            table_peer_id: chatId,
          });
          const dbCtg1 = await appBotMock.db.categories.add(
            { table_peer_id: chatId },
            composeAddCategory({
              title: 'ctg-1',
              description: 'ctg-descr-1',
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
              title: 'sbc-1',
              description: 'sbc-descr-1',
              peer_id: chatId,
              category_id: dbCtg1.id,
              created_by_user_id: userIdStr,
              created_at: serverNowDate
                ? new Date(serverNowDate.getTime() + 1)
                : undefined,
            }),
          );
          const dbCtg2 = await appBotMock.db.categories.add(
            { table_peer_id: chatId },
            composeAddCategory({
              title: 'ctg-2',
              description: 'ctg-descr-2',
              peer_id: chatId,
              created_by_user_id: userIdStr,
              created_at: serverNowDate
                ? new Date(serverNowDate.getTime() + 2)
                : undefined,
            }),
          );
          const dbSbc2 = await appBotMock.db.subcategories.add(
            { table_peer_id: chatId },
            checkAddSubcategory({
              title: 'sbc-2',
              description: 'sbc-descr-2',
              peer_id: chatId,
              category_id: dbCtg1.id,
              created_by_user_id: userIdStr,
              created_at: serverNowDate
                ? new Date(serverNowDate.getTime() + 3)
                : undefined,
            }),
          );
          const dbNt1 = await appBotMock.db.notes.add(
            { table_peer_id: chatId },
            composeAddNote({
              peer_id: chatId,
              category_id: dbCtg1.id,
              created_by_user_id: userIdStr,
              created_at: serverNowDate
                ? new Date(serverNowDate.getTime() + 4)
                : undefined,
              note_number: 589,
              note_text: 'note-text-1',
              datetime: serverNowDate,
            }),
          );
          const dbNt2 = await appBotMock.db.notes.add(
            { table_peer_id: chatId },
            composeAddNote({
              peer_id: chatId,
              category_id: dbCtg2.id,
              created_by_user_id: userIdStr,
              created_at: serverNowDate
                ? new Date(serverNowDate.getTime() + 5)
                : undefined,
              note_number: 654,
              note_text: 'note-text-2',
              datetime: serverNowDate ? subHours(serverNowDate, 1) : undefined,
            }),
          );
          const dbNt12 = await appBotMock.db.notes.add(
            { table_peer_id: chatId },
            composeAddNote({
              peer_id: chatId,
              category_id: dbCtg1.id,
              subcategory_id: dbSbc1.id,
              created_by_user_id: userIdStr,
              created_at: serverNowDate
                ? new Date(serverNowDate.getTime() + 6)
                : undefined,
              note_number: 666,
              note_text: 'note-text-12',
              datetime: serverNowDate ? addHours(serverNowDate, 1) : undefined,
            }),
          );
          const dbNt22 = await appBotMock.db.notes.add(
            { table_peer_id: chatId },
            composeAddNote({
              peer_id: chatId,
              category_id: dbCtg2.id,
              subcategory_id: dbSbc2.id,
              created_by_user_id: userIdStr,
              created_at: serverNowDate
                ? new Date(serverNowDate.getTime() + 7)
                : undefined,
              note_number: 123,
              note_text: 'note-text-22',
              datetime: serverNowDate ? subDays(serverNowDate, 2) : undefined,
            }),
          );
          return {
            dbCtg1,
            dbCtg2,
            dbSbc1,
            dbSbc2,
            dbNt1,
            dbNt2,
            dbNt12,
            dbNt22,
          };
        },
        toBeText: (_) => `(начиная с даты "01.01.2016 00:00:00")
(заканчивая датой "01.01.2016 23:59:59")
(количество записей "2")
Ваши записи:
🆔${_[0].preparedData.dbNt12.id}  ctg-1 sbc-1 666 "note-text-12" 📅01.01.2016🕐01:02:00

🆔${_[0].preparedData.dbNt1.id}  ctg-1 589 "note-text-1" 📅01.01.2016🕛00:02:00`,
      },
      {
        toSendText: () =>
          `${cmd_listnt} [${CommandParameterName.startDate}${PARAMS_EQ}2016.01.01 ${CommandParameterName.endDate}${PARAMS_EQ}2016.01.02]`,
        toBeText: (_) => `(начиная с даты "01.01.2016 00:00:00")
(заканчивая датой "02.01.2016 23:59:59")
(количество записей "2")
Ваши записи:
🆔${_[0].preparedData.dbNt12.id}  ctg-1 sbc-1 666 "note-text-12" 📅01.01.2016🕐01:02:00

🆔${_[0].preparedData.dbNt1.id}  ctg-1 589 "note-text-1" 📅01.01.2016🕛00:02:00`,
      },
      {
        clearDB: () =>
          appBotMock.db.notes.listJoinCtgSbc({
            table_peer_id: chatId,
            peer_id: chatId,
          }),
        toSendText: `ctg-1 666 dodo [${CommandParameterName.date}${PARAMS_EQ}2016.01.01]`,
        toBeText: (_) => `Запись добавлена
Созданные поля:
Число "-666"
Текст "dodo"
Категория "ctg-1"
Дата и время "📅01.01.2016🕛00:00:00"
🆔 "${_[2].clearedData[2].id}"`,
      },
      {
        toSendText: () =>
          `${cmd_listnt} [${CommandParameterName.endDate}${PARAMS_EQ}2015.12.31]`,
        toBeText: (_) => `(лимит "10")
(заканчивая датой "31.12.2015 23:59:59")
(количество записей "2")
Ваши записи:
🆔${_[0].preparedData.dbNt2.id}  ctg-2 654 "note-text-2" 📅31.12.2015🕚23:02:00

🆔${_[0].preparedData.dbNt22.id}  ctg-2 sbc-2 123 "note-text-22" 📅30.12.2015🕛00:02:00`,
      },
      {
        toSendText: () =>
          `${cmd_listnt} [${CommandParameterName.startDate}${PARAMS_EQ}2015.12.31 ${CommandParameterName.endDate}${PARAMS_EQ}2016.01.01]`,
        toBeText: (_) => `(начиная с даты "31.12.2015 00:00:00")
(заканчивая датой "01.01.2016 23:59:59")
(количество записей "4")
Ваши записи:
🆔${_[0].preparedData.dbNt12.id}  ctg-1 sbc-1 666 "note-text-12" 📅01.01.2016🕐01:02:00

🆔${_[0].preparedData.dbNt1.id}  ctg-1 589 "note-text-1" 📅01.01.2016🕛00:02:00

🆔${_[2].clearedData[2].id}  ctg-1 -666 "dodo" 📅01.01.2016🕛00:00:00

🆔${_[0].preparedData.dbNt2.id}  ctg-2 654 "note-text-2" 📅31.12.2015🕚23:02:00`,
      },
    ]));

  afterAll(() => destroyBotMockApp(appBotMock));
});
