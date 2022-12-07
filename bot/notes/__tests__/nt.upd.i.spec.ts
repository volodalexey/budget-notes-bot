import { PreparedTestBotMessages } from '../../../test/test';
import {
  startBotMockApp,
  destroyBotMockApp,
  CreateMockTestBotMessageResponses,
  AppBotMockI,
} from '../../../test/app.bot.mock';
import { TrKey } from '../../../i18n/keys';
import { LanguageEnum, ToTranslate } from '../../../i18n/i18n';
import { createAddUser } from '../../../db/models/userModel';
import {
  composeAddCategory,
  CategoryTypeEnum,
  DEFAULT_CTG_TYPE,
} from '../../../db/models/categoryModel';
import {
  composeAddNote,
  createDeletedNote,
  MIN_NUMBER,
  MAX_NUMBER,
  generateNoteUpdatedTranslations,
  MAX_NOTE_TEXT_LENGTH,
  generateNoteCreatedTranslations,
} from '../../../db/models/noteModel';

import { prinDateTime } from '../../print';
import { CommandParameterName, PARAMS_EQ } from '../../parameters';
import {
  toCommand,
  BotCommandEnum,
  generateInvInstruction,
} from '../../helpers';
import { setDTDate, parseUserDateTimeToUTC, newDTDate } from '../../datetime';
import { subHours } from 'date-fns';
import { checkAddSubcategory } from '../../../db/models/subcategoryModel';
import { AppTestConfigT } from '../../../config/config';

describe('Check update notes command handlers', () => {
  let appBotMock: AppBotMockI;
  let config: AppTestConfigT;
  let testBotMsgsRes: PreparedTestBotMessages;
  let userLangCode: LanguageEnum;
  let userTimeZone: string;
  let chatId: number;
  let userIdStr: string;

  const fakeUserId = '666999666';
  const userFirstName = 'userFirstName';
  let serverNowDate;

  let mockCreatedDate;

  beforeAll(async () => {
    appBotMock = await startBotMockApp();
    config = appBotMock.config;
    userLangCode = appBotMock.userLangCode;
    userTimeZone = appBotMock.userTimeZone;
    chatId = appBotMock.chatId;
    userIdStr = appBotMock.user.id;
    testBotMsgsRes = CreateMockTestBotMessageResponses({ appBotMock });
  });

  const realCtgTitle = 'realCtgTitle';
  const realSbcTitle = 'realSbcTitle';
  const cmd_updnt = toCommand(BotCommandEnum.updnt);

  it(`should be rejected as of lack of parameters`, () =>
    testBotMsgsRes([
      {
        toSendText: () =>
          `${cmd_updnt} [${CommandParameterName.ntId}${PARAMS_EQ}]`,
        toBeMessage: generateInvInstruction(
          TrKey.INVALID_UPDNT_CMD,
          BotCommandEnum.updnt,
          userLangCode,
        ),
      },
    ]));

  const cmd_updnt_fake_id = `${cmd_updnt} [${CommandParameterName.ntId}${PARAMS_EQ}{{id}} ${CommandParameterName.date}${PARAMS_EQ}2022.02.02]`;
  it(`"${cmd_updnt_fake_id}" should be rejected as of errors: not existing note, not visible note for current user`, () =>
    testBotMsgsRes([
      {
        toSendText: (_, { dbNote }) =>
          cmd_updnt_fake_id.replace('{{id}}', dbNote.id),
        prepareDB: async () => {
          await appBotMock.db.users.delete(fakeUserId);
          await appBotMock.db.users.add(
            createAddUser(
              {
                id: fakeUserId,
                username: config.test.user_name,
                first_name: userFirstName,
                language_code: userLangCode,
              },
              {
                language: config.test.user_language,
                week_starts_on: config.test.user_week_starts_on,
                time_zone: config.test.user_time_zone,
              },
            ),
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
            }),
          );
          const dbNote = await appBotMock.db.notes.add(
            { table_peer_id: chatId },
            createDeletedNote({
              peer_id: chatId,
              category_id: dbCategory.id,
              created_by_user_id: userIdStr,
              note_number: 15.9,
            }),
          );
          const otherDBNote = await appBotMock.db.notes.add(
            { table_peer_id: chatId },
            composeAddNote({
              peer_id: chatId + 'd',
              category_id: dbCategory.id,
              created_by_user_id: fakeUserId,
              note_number: 56,
            }),
          );
          const otherDBNote2 = await appBotMock.db.notes.add(
            { table_peer_id: chatId },
            composeAddNote({
              peer_id: chatId + 'd',
              category_id: dbCategory.id,
              created_by_user_id: userIdStr,
              note_number: 25,
            }),
          );
          return { dbNote, otherDBNote, otherDBNote2 };
        },
        toBeMessage: (_, { dbNote }) =>
          new ToTranslate(TrKey.NOTE_NOT_EXISTS, userLangCode, {
            id: dbNote.id,
          }),
      },
      {
        toSendText: (_) =>
          `${cmd_updnt} [${CommandParameterName.ntId}${PARAMS_EQ}${_[0].preparedData.otherDBNote2.id} ${CommandParameterName.ntNumber}${PARAMS_EQ}205]`,
        toBeMessage: (_) =>
          new ToTranslate(TrKey.NOTE_NOT_EXISTS, userLangCode, {
            id: _[0].preparedData.otherDBNote2.id,
          }),
      },
      {
        toSendText: (_) =>
          `${cmd_updnt} [${CommandParameterName.ntId}${PARAMS_EQ}${_[0].preparedData.dbNote.id} ${CommandParameterName.ntNumber}${PARAMS_EQ}11]`,
        toBeMessage: (_) =>
          new ToTranslate(TrKey.NOTE_NOT_EXISTS, userLangCode, {
            id: _[0].preparedData.dbNote.id,
          }),
      },
      {
        toSendText: (_) =>
          `${cmd_updnt} [${CommandParameterName.ntId}${PARAMS_EQ}${_[0].preparedData.otherDBNote.id} ${CommandParameterName.ntNumber}${PARAMS_EQ}485]`,
        toBeMessage: (_) =>
          new ToTranslate(TrKey.NOTE_NOT_EXISTS, userLangCode, {
            id: _[0].preparedData.otherDBNote.id,
          }),
      },
    ]));

  it(`should be rejected note as of errors: number range`, () =>
    testBotMsgsRes([
      {
        toSendText: (_) =>
          `${cmd_updnt} [${CommandParameterName.ntId}${PARAMS_EQ}${
            _[0].preparedData
          } ${CommandParameterName.ntNumber}${PARAMS_EQ}${MAX_NUMBER + 1}]`,
        prepareDB: async () => {
          await appBotMock.db.notes.deleteAll({ table_peer_id: chatId });
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
          const dbNote = await appBotMock.db.notes.add(
            { table_peer_id: chatId },
            composeAddNote({
              peer_id: chatId,
              category_id: dbCategory.id,
              created_by_user_id: userIdStr,
              note_number: 15.9,
            }),
          );
          return dbNote.id;
        },
        toBeMessage: new ToTranslate(
          TrKey.NOTE_NUMBER_RANGE_ERROR,
          userLangCode,
          {
            min: MIN_NUMBER,
            max: MAX_NUMBER,
          },
        ),
      },
      {
        toSendText: (_) =>
          `${cmd_updnt} [${CommandParameterName.ntId}${PARAMS_EQ}${
            _[0].preparedData
          } ${CommandParameterName.ntNumber}${PARAMS_EQ}${MIN_NUMBER - 1}]`,
        toBeMessage: new ToTranslate(
          TrKey.NOTE_NUMBER_RANGE_ERROR,
          userLangCode,
          {
            min: MIN_NUMBER,
            max: MAX_NUMBER,
          },
        ),
      },
    ]));

  it(`"${cmd_updnt} id -86.9" should be resolved as updated note`, () =>
    testBotMsgsRes([
      {
        toSendText: (_, dbNote) =>
          `${cmd_updnt} [${CommandParameterName.ntId}${PARAMS_EQ}${dbNote.id} ${CommandParameterName.ntNumber}${PARAMS_EQ}-86.9]`,
        prepareDB: async () => {
          await appBotMock.db.notes.deleteAll({ table_peer_id: chatId });
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
              note_number: 56.9,
            }),
          );
          return dbNote;
        },
        clearDB: async (_) => {
          const dbNote = await appBotMock.db.notes.findOneById({
            id: _[0].preparedData.id,
            table_peer_id: chatId,
            peer_id: chatId,
          });
          return dbNote;
        },
        toBeMessage: (_) =>
          new ToTranslate(
            TrKey.NOTE_UPDATED,
            userLangCode,
            {
              id: _[0].preparedData.id,
              futureDateMsg: '',
              updatedFields: generateNoteUpdatedTranslations({
                oldNote: _[0].preparedData,
                newNote: _[0].clearedData,
                lang: userLangCode,
                timeZone: userTimeZone,
              }),
            },
            ['updatedFields'],
          ),
      },
    ]));

  it(`"${cmd_updnt} id хохо" should be resolved as updated note text`, () =>
    testBotMsgsRes([
      {
        toSendText: (_, { dbNote1 }) =>
          `${cmd_updnt} [${CommandParameterName.ntId}${PARAMS_EQ}${dbNote1.id} ${CommandParameterName.ntText}${PARAMS_EQ}"хохо ахаха фваоп опы в фы!!"]`,
        prepareDB: async () => {
          await appBotMock.db.notes.deleteAll({
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
              category_type: CategoryTypeEnum.text,
            }),
          );
          const dbNote1 = await appBotMock.db.notes.add(
            { table_peer_id: chatId },
            composeAddNote({
              peer_id: chatId,
              category_id: dbCategory1.id,
              created_by_user_id: userIdStr,
              note_text: 'привет',
            }),
          );
          const dbCategory2 = await appBotMock.db.categories.add(
            { table_peer_id: chatId },
            composeAddCategory({
              title: realCtgTitle,
              peer_id: chatId,
              created_by_user_id: userIdStr,
              category_type: CategoryTypeEnum.numberPositive,
            }),
          );
          const dbNote2 = await appBotMock.db.notes.add(
            { table_peer_id: chatId },
            composeAddNote({
              peer_id: chatId,
              category_id: dbCategory2.id,
              created_by_user_id: userIdStr,
              note_text: 'some text',
              note_number: 456,
            }),
          );
          return { dbCategory1, dbNote1, dbCategory2, dbNote2 };
        },
        clearDB: async (_) => {
          const dbNote = await appBotMock.db.notes.findOneById({
            id: _[0].preparedData.dbNote1.id,
            table_peer_id: chatId,
            peer_id: chatId,
          });
          return dbNote;
        },
        toBeText: (
          _,
        ) => `Запись с 🆔 "${_[0].preparedData.dbNote1.id}" обновлена
Обновленные поля:
Текст "привет" ➡️ "хохо ахаха фваоп опы в фы!!"`,
      },
      {
        toSendText: (_) =>
          `${cmd_updnt} [${CommandParameterName.ntId}${PARAMS_EQ}${_[0].preparedData.dbNote2.id} ${CommandParameterName.ntText}${PARAMS_EQ}"jkkd kdkd"]`,
        toBeText: (
          _,
        ) => `Запись с 🆔 "${_[0].preparedData.dbNote2.id}" обновлена
Обновленные поля:
Текст "some text" ➡️ "jkkd kdkd"`,
      },
    ]));

  const longNoteText = Array.from(
    { length: MAX_NOTE_TEXT_LENGTH + 1 },
    (i, ind) => {
      if (ind === 0) {
        return 's';
      } else if (ind === MAX_NOTE_TEXT_LENGTH) {
        return 'e';
      } else {
        return Math.random() > 0.5 ? String(ind).slice(0, 1) : ' ';
      }
    },
  ).join('');
  const cmd_updntt_lond_text = `${cmd_updnt} [${CommandParameterName.ntId}${PARAMS_EQ}id ${CommandParameterName.ntText}${PARAMS_EQ}"${longNoteText}"]`;
  it(`"${cmd_updntt_lond_text}" should be rejected as of too long note text`, () =>
    testBotMsgsRes([
      {
        toSendText: (_, { dbNote1 }) =>
          cmd_updntt_lond_text.replace('=id', `=${dbNote1.id}`),
        prepareDB: async () => {
          await appBotMock.db.notes.deleteAll({
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
          const dbNote1 = await appBotMock.db.notes.add(
            { table_peer_id: chatId },
            composeAddNote({
              peer_id: chatId,
              category_id: dbCategory1.id,
              created_by_user_id: userIdStr,
              note_number: 345,
              note_text: 'привет',
            }),
          );
          return { dbNote1 };
        },
        toBeMessage: new ToTranslate(TrKey.NOTE_TEXT_MAX_ERROR, userLangCode, {
          max: MAX_NOTE_TEXT_LENGTH,
          count: longNoteText.length,
        }),
      },
    ]));

  const cmd_updnt_date = `${cmd_updnt} [${CommandParameterName.ntId}${PARAMS_EQ}{{ntId}} ${CommandParameterName.date}${PARAMS_EQ}2019.01.13]`;
  it(`"${cmd_updnt_date} id date" should be resolved as updated note date`, () =>
    testBotMsgsRes([
      {
        toSendText: (_, dbNote) =>
          cmd_updnt_date.replace('{{ntId}}', dbNote.id),
        prepareDB: async () => {
          await appBotMock.db.notes.deleteAll({ table_peer_id: chatId });
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
              datetime: new Date(2021, 4, 15, 13, 33, 42),
              peer_id: chatId,
              category_id: dbCategory.id,
              created_by_user_id: userIdStr,
              note_number: 365,
            }),
          );
          return dbNote;
        },
        clearDB: () =>
          appBotMock.db.notes.listJoinCtgSbc({
            table_peer_id: chatId,
            peer_id: chatId,
          }),
        toBeText: (_) => `Запись с 🆔 "${_[0].preparedData.id}" обновлена
Обновленные поля:
Дата "📅15.05.2021🕐13:33:42" ➡️ "📅13.01.2019🕐13:33:42"`,
        toExpect: [
          (_) => {
            const dbNote = _[0].clearedData[0];
            expect(dbNote).toBeDefined();
          },
          (_) => {
            const dbNote = _[0].clearedData[0];
            expect(dbNote).toHaveProperty(
              'datetime',
              parseUserDateTimeToUTC('2019.01.13 13:33:42', userTimeZone),
            );
          },
        ],
      },
    ]));

  const newDateTime = '2019.04.01 23:23';
  const cmd_updnt_date_and_time = `${cmd_updnt} [${CommandParameterName.ntId}${PARAMS_EQ}{{ntId}} ${CommandParameterName.datetime}${PARAMS_EQ}"${newDateTime}"]`;
  it(`"${cmd_updnt_date_and_time} id date" should be resolved as updated note date and time`, () =>
    testBotMsgsRes([
      {
        toSendText: (_, dbNote) =>
          cmd_updnt_date_and_time.replace('{{ntId}}', dbNote.id),
        prepareDB: async () => {
          mockCreatedDate = new Date();
          setDTDate(mockCreatedDate);
          await appBotMock.db.notes.deleteAll({ table_peer_id: chatId });
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
              datetime: new Date(2021, 2, 25, 10, 13, 4),
              peer_id: chatId,
              category_id: dbCategory.id,
              created_by_user_id: userIdStr,
              note_number: 235,
            }),
          );
          return dbNote;
        },
        clearDB: () =>
          appBotMock.db.notes.listJoinCtgSbc({
            table_peer_id: chatId,
            peer_id: chatId,
          }),
        toBeText: (_) => `Запись с 🆔 "${_[0].preparedData.id}" обновлена
Обновленные поля:
Дата "📅25.03.2021🕙10:13:04" ➡️ "📅01.04.2019🕚23:23:00"`,
        toExpect: [
          (_) => {
            const dbNote = _[0].clearedData[0];
            expect(dbNote).toBeDefined();
          },
          (_) => {
            const dbNote = _[0].clearedData[0];
            expect(dbNote).toHaveProperty(
              'datetime',
              parseUserDateTimeToUTC(newDateTime, userTimeZone),
            );
          },
        ],
      },
    ]));

  const cmd_updnt_time = `${cmd_updnt} [${CommandParameterName.ntId}${PARAMS_EQ}{{id}} ${CommandParameterName.time}${PARAMS_EQ}15:04]`;
  it(`"${cmd_updnt_time}" should be resolved as updated note time`, () =>
    testBotMsgsRes([
      {
        toSendText: (_, dbNote) => cmd_updnt_time.replace('{{id}}', dbNote.id),
        prepareDB: async () => {
          await appBotMock.db.notes.deleteAll({ table_peer_id: chatId });
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
              datetime: new Date(2021, 5, 3, 11, 5),
              peer_id: chatId,
              category_id: dbCategory.id,
              created_by_user_id: userIdStr,
              note_number: 235,
            }),
          );
          return dbNote;
        },
        clearDB: () =>
          appBotMock.db.notes.listJoinCtgSbc({
            table_peer_id: chatId,
            peer_id: chatId,
          }),
        toBeText: (_) => `Запись с 🆔 "${_[0].preparedData.id}" обновлена
Обновленные поля:
Дата "📅03.06.2021🕚11:05:00" ➡️ "${prinDateTime(
          _[0].clearedData[0].datetime,
          userTimeZone,
        )}"`,
        toExpect: [
          (_) => {
            const dbNote = _[0].clearedData[0];
            expect(dbNote).toBeDefined();
          },
          (_) => {
            const dbNote = _[0].clearedData[0];
            expect(dbNote).toHaveProperty(
              'datetime',
              new Date(2021, 5, 3, 15, 4),
            );
          },
        ],
      },
    ]));

  const msgs_updnt_rd = [
    {
      cmd: `${cmd_updnt} [${CommandParameterName.ntId}${PARAMS_EQ}{{id}} ${CommandParameterName.relativeDay}${PARAMS_EQ}-1]`,
      startDate: '2021.11.21 10:30',
      checkDate: '2021.11.20 10:30',
    },
    {
      cmd: `${cmd_updnt} [${CommandParameterName.ntId}${PARAMS_EQ}{{id}} ${CommandParameterName.relativeDay}${PARAMS_EQ}+3 ${CommandParameterName.time}${PARAMS_EQ}14:55]`,
      startDate: '2021.11.23 10:30',
      checkDate: '2021.11.26 14:55',
    },
    {
      cmd: `${cmd_updnt} [${CommandParameterName.ntId}${PARAMS_EQ}{{id}} ${CommandParameterName.relativeDay}${PARAMS_EQ}31 ${CommandParameterName.time}${PARAMS_EQ}17:55:12]`,
      startDate: '2021.12.11 10:30',
      checkDate: '2021.12.31 17:55:12',
    },
  ];
  for (const msg_addnt_rd of msgs_updnt_rd) {
    const { cmd, startDate, checkDate } = msg_addnt_rd;

    it(`"${cmd}" should update note with ralative day parameter`, () => {
      const parsedStartDate = parseUserDateTimeToUTC(
        startDate,
        userTimeZone,
      ) as Date;
      const parsedCheckDate = parseUserDateTimeToUTC(
        checkDate,
        userTimeZone,
      ) as Date;
      return testBotMsgsRes([
        {
          toSendText: (_, dbNote) => cmd.replace('{{id}}', dbNote.id),
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
                datetime: parsedStartDate,
                peer_id: chatId,
                category_id: dbCategory.id,
                created_by_user_id: userIdStr,
                note_number: 235,
              }),
            );
            return dbNote;
          },
          clearDB: () =>
            appBotMock.db.notes.listJoinCtgSbc({
              table_peer_id: chatId,
              peer_id: chatId,
            }),
          toBeText: (_) => `Запись с 🆔 "${_[0].preparedData.id}" обновлена
Обновленные поля:
Дата "${prinDateTime(parsedStartDate, userTimeZone)}" ➡️ "${prinDateTime(
            parsedCheckDate,
            userTimeZone,
          )}"`,
        },
        {
          toExpect: [
            (_) => {
              const dbNote = _[0].clearedData[0];
              expect(dbNote).toBeDefined();
            },
            (_) => {
              const dbNote = _[0].clearedData[0];
              expect(dbNote).toHaveProperty('datetime', parsedCheckDate);
            },
          ],
        },
      ]);
    });
  }

  const msgs_updnt_rd_failure = [
    {
      cmd: `${cmd_updnt} [${CommandParameterName.ntId}${PARAMS_EQ}{{id}} ${CommandParameterName.relativeDay}${PARAMS_EQ}0]`,
      startDate: '2021.12.12 10:30',
      rdError: '0',
    },
    {
      cmd: `${cmd_updnt} [${CommandParameterName.ntId}${PARAMS_EQ}{{id}} ${CommandParameterName.relativeDay}${PARAMS_EQ}32]`,
      startDate: '2021.11.20 10:30',
      rdError: '32',
    },
    {
      cmd: `${cmd_updnt} [${CommandParameterName.ntId}${PARAMS_EQ}{{id}} ${CommandParameterName.relativeDay}${PARAMS_EQ}29]`,
      startDate: '2022.02.10 10:30',
      rdError: '29',
    },
  ];
  for (const msg_addnt_rd_failure of msgs_updnt_rd_failure) {
    const { cmd, startDate, rdError } = msg_addnt_rd_failure;
    it(`"${cmd}" should reject provided invalid note day of month`, () => {
      const parsedStartDate = parseUserDateTimeToUTC(
        startDate,
        userTimeZone,
      ) as Date;
      return testBotMsgsRes([
        {
          toSendText: (_, dbNote) => cmd.replace('{{id}}', dbNote.id),
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
                datetime: parsedStartDate,
                peer_id: chatId,
                category_id: dbCategory.id,
                created_by_user_id: userIdStr,
                note_number: 235,
              }),
            );
            return dbNote;
          },
          toBeMessage: () =>
            new ToTranslate(TrKey.RELATIVE_DAY_OF_MONTH_ERROR, userLangCode, {
              relativeDay: rdError,
            }),
        },
      ]);
    });
  }

  const cmd_updnt_future = `${cmd_updnt} [${CommandParameterName.ntId}${PARAMS_EQ}{{id}} ${CommandParameterName.relativeDay}${PARAMS_EQ}+1]`;
  it(`"${cmd_updnt_future}" should show warning for future note date`, () =>
    testBotMsgsRes([
      {
        toSendText: (_, dbNote) =>
          cmd_updnt_future.replace('{{id}}', dbNote.id),
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
              datetime: newDTDate(),
              peer_id: chatId,
              category_id: dbCategory.id,
              created_by_user_id: userIdStr,
              note_number: 235,
            }),
          );
          return dbNote;
        },
        clearDB: () =>
          appBotMock.db.notes.listJoinCtgSbc({
            table_peer_id: chatId,
            peer_id: chatId,
          }),
        toBeText: (_) => `⚠ Внимание, запись имеет будущую дату!
Запись с 🆔 "${_[0].preparedData.id}" обновлена
Обновленные поля:
Дата "${prinDateTime(
          _[0].preparedData.datetime,
          userTimeZone,
        )}" ➡️ "${prinDateTime(_[0].clearedData[0].datetime, userTimeZone)}"`,
      },
    ]));

  const cmd_updnt_amb_err = `${cmd_updnt} 123 [${CommandParameterName.ntId}=123]`;
  it(`"${cmd_updnt_amb_err}" should be rejected as of name parameter and text at the same time`, () =>
    testBotMsgsRes([
      {
        toSendText: cmd_updnt_amb_err,
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
            parName: CommandParameterName.ntId,
          },
        ),
      },
    ]));

  const cmd_updnt_number_text = `${cmd_updnt} {{id}} +123`;
  it(`"${cmd_updnt_number_text}" should be resolved as updated note number by text`, () =>
    testBotMsgsRes([
      {
        toSendText: (_, dbNote) =>
          cmd_updnt_number_text.replace('{{id}}', dbNote.id),
        prepareDB: async () => {
          serverNowDate = parseUserDateTimeToUTC(
            '2020.07.09 16:16',
            userTimeZone,
          );
          setDTDate(serverNowDate);
          await appBotMock.db.notes.deleteAll({ table_peer_id: chatId });
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
              datetime: serverNowDate ? subHours(serverNowDate, 2) : undefined,
              peer_id: chatId,
              category_id: dbCategory.id,
              created_by_user_id: userIdStr,
              note_number: -123,
            }),
          );
          return dbNote;
        },
        clearDB: () =>
          appBotMock.db.notes.listJoinCtgSbc({
            table_peer_id: chatId,
            peer_id: chatId,
          }),
        toBeText: (_) => `Запись с 🆔 "${_[0].preparedData.id}" обновлена
Обновленные поля:
Число "-123" ➡️ "+123"`,
      },
    ]));

  const cmd_updnt_text_text = `${cmd_updnt} {{id}} ho ho sf a`;
  it(`"${cmd_updnt_text_text}" should be resolved as updated note number by text`, () =>
    testBotMsgsRes([
      {
        toSendText: (_, dbNote) =>
          cmd_updnt_text_text.replace('{{id}}', dbNote.id),
        prepareDB: async () => {
          serverNowDate = parseUserDateTimeToUTC(
            '2020.07.09 16:16',
            userTimeZone,
          );
          setDTDate(serverNowDate);
          await appBotMock.db.notes.deleteAll({ table_peer_id: chatId });
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
              category_type: CategoryTypeEnum.text,
            }),
          );
          const dbNote = await appBotMock.db.notes.add(
            { table_peer_id: chatId },
            composeAddNote({
              datetime: serverNowDate ? subHours(serverNowDate, 2) : undefined,
              peer_id: chatId,
              category_id: dbCategory.id,
              created_by_user_id: userIdStr,
              note_text: 'dom sadk',
            }),
          );
          return dbNote;
        },
        clearDB: () =>
          appBotMock.db.notes.listJoinCtgSbc({
            table_peer_id: chatId,
            peer_id: chatId,
          }),
        toBeText: (_) => `Запись с 🆔 "${_[0].preparedData.id}" обновлена
Обновленные поля:
Текст "dom sadk" ➡️ "ho ho sf a"`,
      },
    ]));

  it(`should update note by reply to response text when adding nt`, () =>
    testBotMsgsRes([
      {
        prepareDB: async () => {
          serverNowDate = parseUserDateTimeToUTC(
            '2022.07.08 15:15',
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
          return { dbCtg, dbSbc };
        },
        toSendText: () => `${realCtgTitle} 154.15`,
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
                noteNumber: '-154.15',
                lang: userLangCode,
                timeZone: userTimeZone,
                categoryTitle: realCtgTitle,
                categoryType: DEFAULT_CTG_TYPE,
              }),
            },
            ['futureDateMsg', 'createdFields'],
          ),
      },
      {
        toSendText: () => `${cmd_updnt} +154.15`,
        messageClosureForReply: (_) => _[0].lastMessage,
        clearDB: () =>
          appBotMock.db.notes.listJoinCtgSbc({
            table_peer_id: chatId,
            peer_id: chatId,
          }),
        toBeMessage: (_) =>
          new ToTranslate(
            TrKey.NOTE_UPDATED,
            userLangCode,
            {
              id: _[0].clearedData[0].id,
              futureDateMsg: '',
              updatedFields: generateNoteUpdatedTranslations({
                oldNote: _[0].clearedData[0],
                newNote: _[1].clearedData[0],
                lang: userLangCode,
                timeZone: userTimeZone,
              }),
            },
            ['futureDateMsg', 'updatedFields'],
          ),
      },
    ]));

  afterAll(async () => {
    setDTDate();
    await destroyBotMockApp(appBotMock);
  });
});
