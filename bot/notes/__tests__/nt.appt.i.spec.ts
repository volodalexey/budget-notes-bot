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
} from '../../../db/models/categoryModel';
import {
  composeAddNote,
  createDeletedNote,
  MAX_NOTE_TEXT_LENGTH,
} from '../../../db/models/noteModel';

import { CommandParameterName, PARAMS_EQ } from '../../parameters';
import {
  toCommand,
  BotCommandEnum,
  generateInvInstruction,
} from '../../helpers';
import { setDTDate, parseUserDateTimeToUTC } from '../../datetime';
import { AppTestConfigT } from '../../../config/config';

describe('Check append note text command handlers', () => {
  let appBotMock: AppBotMockI;
  let config: AppTestConfigT;
  let testBotMsgsRes: PreparedTestBotMessages;
  let userLangCode: LanguageEnum;
  let chatId: number;
  let userIdStr: string;

  const fakeUserId = '666999666';
  const userFirstName = 'userFirstName';

  beforeAll(async () => {
    appBotMock = await startBotMockApp();
    config = appBotMock.config;
    userLangCode = appBotMock.userLangCode;
    chatId = appBotMock.chatId;
    userIdStr = appBotMock.user.id;
    testBotMsgsRes = CreateMockTestBotMessageResponses({ appBotMock });
  });

  const realCtgTitle = 'realCtgTitle';
  const cmd_appntt = toCommand(BotCommandEnum.appntt);

  it(`should be rejected as of lack of parameters`, () =>
    testBotMsgsRes([
      {
        toSendText: () =>
          `${cmd_appntt} [${CommandParameterName.ntId}${PARAMS_EQ}]`,
        toBeMessage: generateInvInstruction(
          TrKey.INVALID_APPNTT_CMD,
          BotCommandEnum.appntt,
          userLangCode,
        ),
      },
      {
        toSendText: () =>
          `${cmd_appntt} [${CommandParameterName.ntId}${PARAMS_EQ}111]`,
        toBeMessage: generateInvInstruction(
          TrKey.INVALID_APPNTT_CMD,
          BotCommandEnum.appntt,
          userLangCode,
        ),
      },
      {
        toSendText: () =>
          `${cmd_appntt} [${CommandParameterName.ntText}${PARAMS_EQ}"some text"]`,
        toBeMessage: generateInvInstruction(
          TrKey.INVALID_APPNTT_CMD,
          BotCommandEnum.appntt,
          userLangCode,
        ),
      },
      {
        toSendText: () =>
          `${cmd_appntt} [${CommandParameterName.ntId}${PARAMS_EQ}1]`,
        toBeText:
          () => `❗ Неправильная команда для добавления текста записи, например:
/appntt [ntId] [ntText] [nt_id=int] [nt_t=str]

nt_id (integer) - id записи
nt_t (string) - текст записи
ntId (integer) - id записи
ntText (string) - текст записи`,
      },
    ]));

  const cmd_updnt_fake_id = `${cmd_appntt} [${CommandParameterName.ntId}${PARAMS_EQ}{{id}} ${CommandParameterName.ntText}${PARAMS_EQ}"note text"]`;
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
          `${cmd_appntt} [${CommandParameterName.ntId}${PARAMS_EQ}${_[0].preparedData.otherDBNote2.id} ${CommandParameterName.ntText}${PARAMS_EQ}"note text"]`,
        toBeMessage: (_) =>
          new ToTranslate(TrKey.NOTE_NOT_EXISTS, userLangCode, {
            id: _[0].preparedData.otherDBNote2.id,
          }),
      },
      {
        toSendText: (_) =>
          `${cmd_appntt} [${CommandParameterName.ntId}${PARAMS_EQ}${_[0].preparedData.dbNote.id} ${CommandParameterName.ntText}${PARAMS_EQ}"note text"]`,
        toBeMessage: (_) =>
          new ToTranslate(TrKey.NOTE_NOT_EXISTS, userLangCode, {
            id: _[0].preparedData.dbNote.id,
          }),
      },
      {
        toSendText: (_) =>
          `${cmd_appntt} [${CommandParameterName.ntId}${PARAMS_EQ}${_[0].preparedData.otherDBNote.id} ${CommandParameterName.ntText}${PARAMS_EQ}"note text"]`,
        toBeMessage: (_) =>
          new ToTranslate(TrKey.NOTE_NOT_EXISTS, userLangCode, {
            id: _[0].preparedData.otherDBNote.id,
          }),
      },
    ]));

  const cmd_addnt_text = `${cmd_appntt} {{id}} хохо mor`;
  it(`"${cmd_addnt_text}" should be resolved as updated note text`, () =>
    testBotMsgsRes([
      {
        toSendText: (_, { dbNote1 }) =>
          cmd_addnt_text.replace('{{id}}', dbNote1.id),
        prepareDB: async () => {
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
Текст "привет" ➡️ "привет хохо mor"`,
      },
      {
        toSendText: (_) =>
          cmd_addnt_text.replace('{{id}}', _[0].preparedData.dbNote2.id),
        toBeText: (
          _,
        ) => `Запись с 🆔 "${_[0].preparedData.dbNote2.id}" обновлена
Обновленные поля:
Текст "some text" ➡️ "some text хохо mor"`,
      },
    ]));

  const longNoteText = Array.from(
    { length: MAX_NOTE_TEXT_LENGTH },
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
  const cmd_updntt_lond_text = `${cmd_appntt} [${CommandParameterName.ntId}${PARAMS_EQ}{{id}} ${CommandParameterName.ntText}${PARAMS_EQ}"${longNoteText}"]`;
  it(`"${cmd_updntt_lond_text}" should be rejected as of too long note text`, () =>
    testBotMsgsRes([
      {
        toSendText: (_, { dbNote1 }) =>
          cmd_updntt_lond_text.replace('{{id}}', dbNote1.id),
        prepareDB: async () => {
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
          count: 'привет'.length,
        }),
      },
    ]));

  const cmd_updnt_future = `${cmd_appntt} [${CommandParameterName.ntId}${PARAMS_EQ}{{id}} ${CommandParameterName.ntText}${PARAMS_EQ}LOL]`;
  it(`"${cmd_updnt_future}" should show warning for future note date`, () =>
    testBotMsgsRes([
      {
        toSendText: (_, dbNote) =>
          cmd_updnt_future.replace('{{id}}', dbNote.id),
        prepareDB: async () => {
          const serverNowDate = parseUserDateTimeToUTC(
            '2021.12.12 10:30',
            config.user.time_zone,
          );
          setDTDate(serverNowDate);
          await appBotMock.db.notes.deleteAll({ table_peer_id: chatId });
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
              category_type: CategoryTypeEnum.text,
            }),
          );
          const dbNote = await appBotMock.db.notes.add(
            { table_peer_id: chatId },
            composeAddNote({
              datetime: parseUserDateTimeToUTC(
                '2022.02.02 02:22',
                config.user.time_zone,
              ),
              peer_id: chatId,
              category_id: dbCategory.id,
              created_by_user_id: userIdStr,
              note_text: 'JJJ',
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
Текст "JJJ" ➡️ "JJJ LOL"`,
      },
    ]));

  afterAll(async () => {
    setDTDate();
    await destroyBotMockApp(appBotMock);
  });
});
