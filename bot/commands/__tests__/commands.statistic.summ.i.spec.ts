import { subDays, subHours, subYears } from 'date-fns';

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
  CategoryTypeEnum,
  composeAddCategory,
  createDeletedCategory,
} from '../../../db/models/categoryModel';
import { checkAddSubcategory } from '../../../db/models/subcategoryModel';
import {
  calcSummary,
  composeAddNote,
  printCalcSummary,
  createDeletedNote,
  createArchivedNote,
} from '../../../db/models/noteModel';

import {
  setDTDate,
  formatDatetime,
  calcStartEndDay,
  newDTDate,
  parseUserDateTimeToUTC,
  calcStartEndMonth,
} from '../../datetime';
import {
  toStatisticSumm,
  BotCommandEnum,
  toCommand,
  generateInvInstruction,
} from '../../helpers';
import { CommandParameterName, PARAMS_EQ } from '../../parameters';
import { printNumber } from '../../print';
import { AppTestConfigT } from '../../../config/config';

describe('Check list notes command handlers', () => {
  let appBotMock: AppBotMockI;
  let config: AppTestConfigT;
  let testBotMsgsRes: PreparedTestBotMessages;
  let userLangCode: LanguageEnum;
  let userTimeZone: string;
  let chatId: number;
  let userIdStr: string;

  const mockDate = new Date();
  setDTDate(mockDate);
  let serverNowDate: Date | undefined;

  beforeAll(async () => {
    appBotMock = await startBotMockApp();
    config = appBotMock.config;
    userLangCode = appBotMock.userLangCode;
    userTimeZone = appBotMock.userTimeZone;
    chatId = appBotMock.chatId;
    userIdStr = appBotMock.user.id;
    testBotMsgsRes = CreateMockTestBotMessageResponses({ appBotMock });
  });

  const cmd_stats = toCommand(BotCommandEnum.stats);
  it(`"${cmd_stats}" should be resolved as empty summary`, () =>
    testBotMsgsRes([
      {
        toSendText: cmd_stats,
        prepareDB: () => {
          serverNowDate = parseUserDateTimeToUTC(
            '2019.02.10 10:00',
            userTimeZone,
          );
          setDTDate(serverNowDate);
          return Promise.resolve();
        },
        toBeText: () => `(начиная с даты "01.02.2019 00:00:00")
(заканчивая датой "28.02.2019 23:59:59")
Статистика отсутствует
Баланс до 10.02.2019 10:00:00 является 0`,
      },
    ]));

  const cmd_statsd_amb = `${cmd_stats} 2 3 4 5 6`;
  it(`"${cmd_statsd_amb}" should be rejected as of too many arguments`, () =>
    testBotMsgsRes([
      {
        toSendText: cmd_statsd_amb,
        toBeMessage: generateInvInstruction(
          TrKey.INVALID_STATS_CMD,
          BotCommandEnum.stats,
          userLangCode,
        ),
      },
    ]));

  const cmd_statsw_amb = `${cmd_stats} 2 3 4 5 6`;
  it(`"${cmd_statsw_amb}" should be rejected as of too many arguments`, () =>
    testBotMsgsRes([
      {
        toSendText: cmd_statsw_amb,
        toBeMessage: generateInvInstruction(
          TrKey.INVALID_STATS_CMD,
          BotCommandEnum.stats,
          userLangCode,
        ),
      },
    ]));

  const cmd_statsm_amb = `${cmd_stats} 2 3 4 5 6`;
  it(`"${cmd_statsm_amb}" should be rejected as of too many arguments`, () =>
    testBotMsgsRes([
      {
        toSendText: cmd_statsm_amb,
        toBeMessage: generateInvInstruction(
          TrKey.INVALID_STATS_CMD,
          BotCommandEnum.stats,
          userLangCode,
        ),
      },
    ]));

  const cmd_statsq_amb = `${cmd_stats} 2 3 4 5 6`;
  it(`"${cmd_statsq_amb}" should be rejected as of too many arguments`, () =>
    testBotMsgsRes([
      {
        toSendText: cmd_statsq_amb,
        toBeMessage: generateInvInstruction(
          TrKey.INVALID_STATS_CMD,
          BotCommandEnum.stats,
          userLangCode,
        ),
      },
    ]));

  const cmd_statsy_amb = `${cmd_stats} 2 3 4 5 6`;
  it(`"${cmd_statsy_amb}" should be rejected as of too many arguments`, () =>
    testBotMsgsRes([
      {
        toSendText: cmd_statsy_amb,
        toBeMessage: generateInvInstruction(
          TrKey.INVALID_STATS_CMD,
          BotCommandEnum.stats,
          userLangCode,
        ),
      },
    ]));

  const realCtgTitle = 'realCtgTitle';
  const realCtgTitle2 = 'realCtgTitle2';

  it(`"${cmd_stats}" should print statistic for current day and week`, () =>
    testBotMsgsRes([
      {
        toSendText: cmd_stats,
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
              category_type: CategoryTypeEnum.numberPositive,
              created_at: serverNowDate
                ? new Date(serverNowDate.getTime() + 1)
                : undefined,
            }),
          );
          const dbNote1 = await appBotMock.db.notes.add(
            { table_peer_id: chatId },
            composeAddNote({
              peer_id: chatId,
              category_id: dbCategory1.id,
              created_by_user_id: userIdStr,
              note_number: -145,
              datetime: serverNowDate
                ? new Date(serverNowDate.getTime() - 1)
                : undefined,
            }),
          );
          const dbNote2 = await appBotMock.db.notes.add(
            { table_peer_id: chatId },
            createDeletedNote({
              peer_id: chatId,
              category_id: dbCategory1.id,
              created_by_user_id: userIdStr,
              note_number: -110,
              datetime: serverNowDate
                ? new Date(serverNowDate.getTime() - 2)
                : undefined,
            }),
          );
          const dbNote3 = await appBotMock.db.notes.add(
            { table_peer_id: chatId },
            createArchivedNote({
              peer_id: chatId,
              category_id: dbCategory2.id,
              created_by_user_id: userIdStr,
              note_number: 0.56,
              datetime: serverNowDate
                ? new Date(serverNowDate.getTime() - 3)
                : undefined,
            }),
          );
          const dbNote4 = await appBotMock.db.notes.add(
            { table_peer_id: chatId },
            composeAddNote({
              peer_id: chatId,
              category_id: dbCategory2.id,
              created_by_user_id: userIdStr,
              note_number: 10.0,
              datetime: serverNowDate ? subDays(serverNowDate, 1) : undefined,
            }),
          );
          const dbNote5 = await appBotMock.db.notes.add(
            { table_peer_id: chatId },
            composeAddNote({
              peer_id: chatId,
              category_id: dbCategory2.id,
              created_by_user_id: userIdStr,
              note_number: 75.45,
              datetime: serverNowDate ? subDays(serverNowDate, 2) : undefined,
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
            in_deleted: true,
          });
          const dbNoteJoinCtgSbc3 = await appBotMock.db.notes.findJoinCtgSbc({
            table_peer_id: chatId,
            note_id: dbNote3.id,
            peer_id: chatId,
            in_archived: true,
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
          const { startUserDateTime, endUserDateTime } = calcStartEndMonth({
            timeZone: userTimeZone,
            weekStartsOn: config.user.week_starts_on,
          });
          const ret = Object.assign(
            {
              startDateTime: startUserDateTime,
              endDateTime: endUserDateTime,
            },
            _[0].preparedData,
          );
          const printNotes = [
            ret.dbNoteJoinCtgSbc1,
            ret.dbNoteJoinCtgSbc3,
            ret.dbNoteJoinCtgSbc4,
            ret.dbNoteJoinCtgSbc5,
          ];
          ret.ntCount = printNotes.length;
          const text = printCalcSummary(calcSummary(printNotes), userLangCode);
          return toStatisticSumm(
            ret,
            text,
            {
              balance: printNumber(Number('-58.99'), userLangCode),
              endDateTime: formatDatetime(newDTDate(), userTimeZone),
            },
            userLangCode,
          );
        },
      },
      {
        toSendText: `${cmd_stats} [${CommandParameterName.relativeDay}${PARAMS_EQ}-1]`,
        toBeMessage: (_) => {
          const { startUserDateTime, endUserDateTime, endUTCDateTime } =
            calcStartEndDay({
              timeZone: userTimeZone,
              weekStartsOn: config.user.week_starts_on,
              serverNow: serverNowDate ? subDays(serverNowDate, 1) : undefined,
            });
          const ret = Object.assign(
            {
              startDateTime: startUserDateTime,
              endDateTime: endUserDateTime,
            },
            _[0].preparedData,
          );
          const printNotes = [ret.dbNoteJoinCtgSbc4];
          ret.ntCount = printNotes.length;
          const text = printCalcSummary(calcSummary(printNotes));
          return toStatisticSumm(
            ret,
            text,
            {
              balance: printNumber(Number('+85.45'), userLangCode),
              endDateTime: formatDatetime(endUTCDateTime, userTimeZone),
            },
            userLangCode,
          );
        },
      },
      {
        toSendText: `${cmd_stats} [${CommandParameterName.startDate}${PARAMS_EQ}2019.02.04 ${CommandParameterName.query}${PARAMS_EQ}${realCtgTitle2}]`,
        toBeMessage: (_) => {
          const ret = Object.assign(
            {
              query: realCtgTitle2,
              startDateTime: '04.02.2019 00:00:00',
              endDateTime: '28.02.2019 23:59:59',
            },
            _[0].preparedData,
          );
          const printNotes = [
            ret.dbNoteJoinCtgSbc5,
            ret.dbNoteJoinCtgSbc4,
            ret.dbNoteJoinCtgSbc3,
          ];
          ret.ntCount = printNotes.length;
          const text = printCalcSummary(calcSummary(printNotes), userLangCode);
          return toStatisticSumm(
            ret,
            text,
            {
              balance: printNumber(Number('-58.99'), userLangCode),
              endDateTime: serverNowDate
                ? formatDatetime(serverNowDate, userTimeZone)
                : '',
            },
            userLangCode,
          );
        },
      },
    ]));

  it(`"${cmd_stats}" should print balance for previous month`, () =>
    testBotMsgsRes([
      {
        toSendText: `${cmd_stats} [${CommandParameterName.skip}${PARAMS_EQ}2 ${CommandParameterName.relativeMonth}${PARAMS_EQ}-1]`,
        prepareDB: async () => {
          serverNowDate = parseUserDateTimeToUTC(
            '2019.01.09 12:00',
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
              category_type: CategoryTypeEnum.numberPositive,
              created_at: serverNowDate
                ? new Date(serverNowDate.getTime() + 1)
                : undefined,
            }),
          );
          const dbNote5 = await appBotMock.db.notes.add(
            { table_peer_id: chatId },
            composeAddNote({
              peer_id: chatId,
              category_id: dbCategory2.id,
              created_by_user_id: userIdStr,
              note_number: 75.45,
              datetime: serverNowDate ? subDays(serverNowDate, 4) : undefined,
            }),
          );
          const dbNote4 = await appBotMock.db.notes.add(
            { table_peer_id: chatId },
            composeAddNote({
              peer_id: chatId,
              category_id: dbCategory2.id,
              created_by_user_id: userIdStr,
              note_number: 10.0,
              datetime: serverNowDate ? subDays(serverNowDate, 2) : undefined,
            }),
          );
          const dbNote1 = await appBotMock.db.notes.add(
            { table_peer_id: chatId },
            composeAddNote({
              peer_id: chatId,
              category_id: dbCategory1.id,
              created_by_user_id: userIdStr,
              note_number: -145,
              datetime: serverNowDate ? subDays(serverNowDate, 6) : undefined,
            }),
          );
          const dbNote2 = await appBotMock.db.notes.add(
            { table_peer_id: chatId },
            createDeletedNote({
              peer_id: chatId,
              category_id: dbCategory1.id,
              created_by_user_id: userIdStr,
              note_number: -110,
            }),
          );
          const dbNote3 = await appBotMock.db.notes.add(
            { table_peer_id: chatId },
            createArchivedNote({
              peer_id: chatId,
              category_id: dbCategory2.id,
              created_by_user_id: userIdStr,
              note_number: 0.56,
              datetime: serverNowDate ? subDays(serverNowDate, 7) : undefined,
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
            in_deleted: true,
          });
          const dbNoteJoinCtgSbc3 = await appBotMock.db.notes.findJoinCtgSbc({
            table_peer_id: chatId,
            note_id: dbNote3.id,
            peer_id: chatId,
            in_archived: true,
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
          const ret = Object.assign(
            {
              startDateTime: '01.12.2018 00:00:00',
              endDateTime: '31.12.2018 23:59:59',
            },
            _[0].preparedData,
          );
          return toStatisticSumm(
            ret,
            new ToTranslate(TrKey.EMPTY_SUMMARY, userLangCode),
            {
              balance: '0',
              endDateTime: '31.12.2018 23:59:59',
            },
            userLangCode,
          );
        },
      },
    ]));

  const desc_srch = 'glo';
  const cmd_listctg_desc = `${cmd_stats} [${CommandParameterName.endDate}${PARAMS_EQ}2019.02.07 ${CommandParameterName.query}${PARAMS_EQ}${desc_srch}]`;
  it(`"${cmd_listctg_desc}" should print statistic found by description`, () =>
    testBotMsgsRes([
      {
        toSendText: cmd_listctg_desc,
        prepareDB: async () => {
          serverNowDate = parseUserDateTimeToUTC(
            '2019.02.08 11:00',
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
              description: 'ml f',
              created_at: serverNowDate
                ? new Date(serverNowDate.getTime() + 1)
                : undefined,
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
              datetime: serverNowDate ? subDays(serverNowDate, 2) : undefined,
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
              datetime: serverNowDate ? subDays(serverNowDate, 1) : undefined,
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
              startDateTime: '07.02.2019 00:00:00',
              endDateTime: '07.02.2019 23:59:59',
            },
            _[0].preparedData,
          );
          const printNotes = [ret.dbNoteJoinCtgSbc2];
          ret.ntCount = printNotes.length;
          const text = printCalcSummary(calcSummary(printNotes));
          return toStatisticSumm(
            ret,
            text,
            {
              balance: printNumber(Number('+1243'), userLangCode),
              endDateTime: '07.02.2019 23:59:59',
            },
            userLangCode,
          );
        },
      },
      {
        toSendText: `${cmd_stats} [ ${CommandParameterName.relativeDay}${PARAMS_EQ}+1]`,
        toBeMessage: (_) => {
          const ret = Object.assign(
            {
              startDateTime: '09.02.2019 00:00:00',
              endDateTime: '09.02.2019 23:59:59',
            },
            _[0].preparedData,
          );
          return toStatisticSumm(
            ret,
            '',
            {
              balance: printNumber(Number('+1243'), userLangCode),
              endDateTime: serverNowDate
                ? formatDatetime(serverNowDate, userTimeZone)
                : '',
            },
            userLangCode,
          );
        },
      },
    ]));

  const realSbcTitle2 = 'realSbcTitle2';
  it(`should print statistic (for previous year) found by query description with wildcard`, () =>
    testBotMsgsRes([
      {
        toSendText: `${cmd_stats} [${CommandParameterName.relativeYear}${PARAMS_EQ}-1 ${CommandParameterName.query}${PARAMS_EQ}*FA]`,
        prepareDB: async () => {
          serverNowDate = parseUserDateTimeToUTC(
            '2019.02.08 11:00',
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
              created_at: serverNowDate
                ? subYears(new Date(serverNowDate.getTime()), 1)
                : undefined,
            }),
          );
          const dbCtg1 = await appBotMock.db.categories.add(
            { table_peer_id: chatId },
            composeAddCategory({
              title: realCtgTitle2,
              peer_id: chatId,
              created_by_user_id: userIdStr,
              description: 'ml f',
              created_at: serverNowDate
                ? subYears(new Date(serverNowDate.getTime() + 1), 1)
                : undefined,
            }),
          );
          const dbSbc1 = await appBotMock.db.subcategories.add(
            { table_peer_id: chatId },
            checkAddSubcategory({
              category_id: dbCtg1.id,
              title: realSbcTitle2,
              peer_id: chatId,
              created_by_user_id: userIdStr,
              description: 'sbcfd  dsa',
              created_at: serverNowDate
                ? subYears(new Date(serverNowDate.getTime() + 2), 1)
                : undefined,
            }),
          );
          const dbNote1 = await appBotMock.db.notes.add(
            { table_peer_id: chatId },
            composeAddNote({
              peer_id: chatId,
              category_id: dbCtg1.id,
              created_by_user_id: userIdStr,
              note_number: 589,
              note_text: 'sdfa dsfa',
              datetime: serverNowDate
                ? subYears(subHours(serverNowDate, 1), 1)
                : undefined,
            }),
          );
          const dbNote2 = await appBotMock.db.notes.add(
            { table_peer_id: chatId },
            composeAddNote({
              peer_id: chatId,
              category_id: dbCtg1.id,
              created_by_user_id: userIdStr,
              note_number: 654,
              note_text: 'gok glo',
              datetime: serverNowDate
                ? subYears(subHours(serverNowDate, 3), 1)
                : undefined,
            }),
          );
          const dbNote3 = await appBotMock.db.notes.add(
            { table_peer_id: chatId },
            composeAddNote({
              peer_id: chatId,
              category_id: dbCtg1.id,
              subcategory_id: dbSbc1.id,
              created_by_user_id: userIdStr,
              note_number: 6,
              note_text: 'gok glo2',
              datetime: serverNowDate
                ? subYears(subHours(serverNowDate, 4), 1)
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
          return {
            dbCtg1,
            dbSbc1,
            dbNoteJoinCtgSbc1,
            dbNoteJoinCtgSbc2,
            dbNoteJoinCtgSbc3,
          };
        },
        toBeText: (_) => `(начиная с даты "01.01.2018 00:00:00")
(заканчивая датой "31.12.2018 23:59:59")
(шаблон поиска "*FA")
(количество записей "1")
Всего: +589
└── ${_[0].preparedData.dbCtg1.title}: +589
Баланс до 31.12.2018 23:59:59 является ${printNumber(
          Number('+1249'),
          userLangCode,
        )}`,
      },
      {
        toSendText: `${cmd_stats} [${CommandParameterName.date}${PARAMS_EQ}2018.02.08 ${CommandParameterName.ctgQuery}${PARAMS_EQ}"ml"]`,
        toBeText: (_) => `(начиная с даты "08.02.2018 00:00:00")
(заканчивая датой "08.02.2018 23:59:59")
(поиск по категориям "ml")
(количество записей "3")
Всего: ${printNumber(Number('+1249'), userLangCode)}
└── ${_[0].preparedData.dbCtg1.title}: ${printNumber(
          Number('+1249'),
          userLangCode,
        )}
      └── ${_[0].preparedData.dbSbc1.title}: +6
Баланс до 08.02.2018 23:59:59 является ${printNumber(
          Number('+1249'),
          userLangCode,
        )}`,
      },
      {
        toSendText: `${cmd_stats} [${CommandParameterName.relativeYear}${PARAMS_EQ}-1 ${CommandParameterName.ctgQueryTitle}${PARAMS_EQ}"realCtgTitle2"]`,
        toBeText: (_) => `(начиная с даты "01.01.2018 00:00:00")
(заканчивая датой "31.12.2018 23:59:59")
(поиск по названию категорий "realCtgTitle2")
(количество записей "3")
Всего: ${printNumber(Number('+1249'), userLangCode)}
└── ${_[0].preparedData.dbCtg1.title}: +1${String.fromCharCode(160)}249
      └── ${_[0].preparedData.dbSbc1.title}: +6
Баланс до 31.12.2018 23:59:59 является +1${String.fromCharCode(160)}249`,
      },
      {
        toSendText: `${cmd_stats} [${CommandParameterName.relativeMonth}${PARAMS_EQ}-1 ${CommandParameterName.ctgQueryDescr}${PARAMS_EQ}"l*f"]`,
        prepareDB: async () => {
          serverNowDate = parseUserDateTimeToUTC(
            '2018.03.12 11:00',
            userTimeZone,
          );
          setDTDate(serverNowDate);
        },
        toBeText: (_) => `(начиная с даты "01.02.2018 00:00:00")
(заканчивая датой "28.02.2018 23:59:59")
(поиск по описанию категорий "l*f")
(количество записей "3")
Всего: ${printNumber(Number('+1249'), userLangCode)}
└── ${_[0].preparedData.dbCtg1.title}: +1${String.fromCharCode(160)}249
      └── ${_[0].preparedData.dbSbc1.title}: +6
Баланс до 28.02.2018 23:59:59 является ${printNumber(
          Number('+1249'),
          userLangCode,
        )}`,
      },
      {
        toSendText: `${cmd_stats} [${CommandParameterName.startDate}${PARAMS_EQ}2018.02.02 ${CommandParameterName.sbcQuery}${PARAMS_EQ}"realSbcTitle2"]`,
        prepareDB: async () => {
          serverNowDate = parseUserDateTimeToUTC(
            '2018.03.12 11:00',
            userTimeZone,
          );
          setDTDate(serverNowDate);
        },
        toBeText: (_) => `(начиная с даты "02.02.2018 00:00:00")
(заканчивая датой "31.03.2018 23:59:59")
(поиск по подкатегориям "realSbcTitle2")
(количество записей "1")
Всего: +6
└── ${_[0].preparedData.dbCtg1.title}: +6
      └── ${_[0].preparedData.dbSbc1.title}: +6
Баланс до 12.03.2018 11:00:00 является ${printNumber(
          Number('+1249'),
          userLangCode,
        )}`,
      },
      {
        toSendText: `${cmd_stats} [ ${CommandParameterName.sbcQueryTitle}${PARAMS_EQ}"realSbcTitle2"]`,
        toBeText: () => `(начиная с даты "01.03.2018 00:00:00")
(заканчивая датой "31.03.2018 23:59:59")
(поиск по названию подкатегорий "realSbcTitle2")
Баланс до 12.03.2018 11:00:00 является ${printNumber(
          Number('+1249'),
          userLangCode,
        )}`,
      },
      {
        toSendText: `${cmd_stats} [${CommandParameterName.endDate}${PARAMS_EQ}2018.02.08 ${CommandParameterName.sbcQueryDescr}${PARAMS_EQ}"fd*ds"]`,
        toBeText: (_) => `(начиная с даты "08.02.2018 00:00:00")
(заканчивая датой "08.02.2018 23:59:59")
(поиск по описанию подкатегорий "fd*ds")
(количество записей "1")
Всего: +6
└── ${_[0].preparedData.dbCtg1.title}: +6
      └── ${_[0].preparedData.dbSbc1.title}: +6
Баланс до 08.02.2018 23:59:59 является ${printNumber(
          Number('+1249'),
          userLangCode,
        )}`,
      },
      {
        toSendText: `${cmd_stats} [${CommandParameterName.startDate}${PARAMS_EQ}2018.02.08 ${CommandParameterName.endDate}${PARAMS_EQ}2018.02.09 ${CommandParameterName.ntQueryText}${PARAMS_EQ}"k*"]`,
        toBeText: (_) => `(начиная с даты "08.02.2018 00:00:00")
(заканчивая датой "09.02.2018 23:59:59")
(поиск по тексту записи "k*")
(количество записей "2")
Всего: +660
└── ${_[0].preparedData.dbCtg1.title}: +660
      └── ${_[0].preparedData.dbSbc1.title}: +6
Баланс до 09.02.2018 23:59:59 является ${printNumber(
          Number('+1249'),
          userLangCode,
        )}`,
      },
    ]));

  it(`should print statistic with negative and positive numbers`, () =>
    testBotMsgsRes([
      {
        toSendText: `${cmd_stats} [${CommandParameterName.relativeMonth}${PARAMS_EQ}3]`,
        prepareDB: async () => {
          serverNowDate = parseUserDateTimeToUTC(
            '2019.03.11 16:20',
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
              title: realCtgTitle2,
              peer_id: chatId,
              created_by_user_id: userIdStr,
              created_at: serverNowDate
                ? subYears(new Date(serverNowDate.getTime() + 1), 1)
                : undefined,
            }),
          );
          const dbCtg2 = await appBotMock.db.categories.add(
            { table_peer_id: chatId },
            composeAddCategory({
              title: realCtgTitle,
              peer_id: chatId,
              created_by_user_id: userIdStr,
              created_at: serverNowDate
                ? subYears(new Date(serverNowDate.getTime() + 1), 1)
                : undefined,
            }),
          );
          await appBotMock.db.notes.add(
            { table_peer_id: chatId },
            composeAddNote({
              peer_id: chatId,
              category_id: dbCtg1.id,
              created_by_user_id: userIdStr,
              note_number: +45.12,
              datetime: serverNowDate ? subDays(serverNowDate, 1) : undefined,
            }),
          );
          await appBotMock.db.notes.add(
            { table_peer_id: chatId },
            composeAddNote({
              peer_id: chatId,
              category_id: dbCtg1.id,
              created_by_user_id: userIdStr,
              note_number: -345.38,
              datetime: serverNowDate ? subDays(serverNowDate, 3) : undefined,
            }),
          );
          await appBotMock.db.notes.add(
            { table_peer_id: chatId },
            composeAddNote({
              peer_id: chatId,
              category_id: dbCtg1.id,
              created_by_user_id: userIdStr,
              note_number: 324,
              datetime: serverNowDate ? subDays(serverNowDate, 4) : undefined,
            }),
          );
          await appBotMock.db.notes.add(
            { table_peer_id: chatId },
            composeAddNote({
              peer_id: chatId,
              category_id: dbCtg2.id,
              created_by_user_id: userIdStr,
              note_number: 303,
              datetime: serverNowDate ? subHours(serverNowDate, 4) : undefined,
            }),
          );
        },
        toBeText: () => `(начиная с даты "01.03.2019 00:00:00")
(заканчивая датой "31.03.2019 23:59:59")
(количество записей "4")
Всего: ${printNumber(Number('+326.74'), userLangCode)} (${printNumber(
          Number('+672.12'),
          userLangCode,
        )}) (${printNumber(Number('-345.38'), userLangCode)})
├── realCtgTitle: +303
└── ${realCtgTitle2}: ${printNumber(
          Number('+23.74'),
          userLangCode,
        )} (${printNumber(Number('+369.12'), userLangCode)}) (${printNumber(
          Number('-345.38'),
          userLangCode,
        )})
Баланс до 11.03.2019 16:20:00 является ${printNumber(
          Number('+326.74'),
          userLangCode,
        )}`,
      },
    ]));

  afterAll(async () => {
    setDTDate();
    await destroyBotMockApp(appBotMock);
  });
});
