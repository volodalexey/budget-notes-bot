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
import { composeAddCategory } from '../../../db/models/categoryModel';
import {
  composeAddNote,
  createDeletedNote,
  parseNoteNumber,
} from '../../../db/models/noteModel';

import {
  toCommand,
  BotCommandEnum,
  generateInvInstruction,
} from '../../helpers';
import { AppTestConfigT } from '../../../config/config';

describe('Check undo delete note command handlers', () => {
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

  const cmd_undo_delnt = toCommand(BotCommandEnum.undodelnt);
  it(`"${cmd_undo_delnt}" should be rejected without arguments`, () =>
    testBotMsgsRes([
      {
        toSendText: cmd_undo_delnt,
        toBeMessage: generateInvInstruction(
          TrKey.INVALID_UNDO_DEL_NOTE_CMD,
          BotCommandEnum.undodelnt,
          userLangCode,
        ),
      },
    ]));

  const cmd_undo_delnt_amb = `${cmd_undo_delnt} a ...`;
  it(`"${cmd_undo_delnt_amb}" should be rejected as of too many arguments`, () =>
    testBotMsgsRes([
      {
        toSendText: cmd_undo_delnt_amb,
        toBeMessage: generateInvInstruction(
          TrKey.INVALID_UNDO_DEL_NOTE_CMD,
          BotCommandEnum.undodelnt,
          userLangCode,
        ),
      },
    ]));

  const cmd_undo_delnt_fake_id = `${cmd_undo_delnt} fakeNoteId`;
  const realCtgTitle = 'realCtgTitle';
  it(`"${cmd_undo_delnt_fake_id}" should be rejected as of errors: not existing note, not visible note for current user`, () =>
    testBotMsgsRes([
      {
        toSendText: (_, { dbNote }) => `${cmd_undo_delnt} ${dbNote.id}`,
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
            composeAddNote({
              peer_id: chatId,
              category_id: dbCategory.id,
              created_by_user_id: userIdStr,
              note_number: 15.9,
            }),
          );
          const otherDBNote = await appBotMock.db.notes.add(
            { table_peer_id: chatId },
            createDeletedNote({
              peer_id: chatId + 'd',
              category_id: dbCategory.id,
              created_by_user_id: fakeUserId,
              note_number: 56,
            }),
          );
          const otherDBNote2 = await appBotMock.db.notes.add(
            { table_peer_id: chatId },
            createDeletedNote({
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
          `${cmd_undo_delnt} ${_[0].preparedData.otherDBNote.id}`,
        toBeMessage: (_) =>
          new ToTranslate(TrKey.NOTE_NOT_EXISTS, userLangCode, {
            id: _[0].preparedData.otherDBNote.id,
          }),
      },
      {
        toSendText: (_) =>
          `${cmd_undo_delnt} ${_[0].preparedData.otherDBNote2.id}`,
        toBeMessage: (_) =>
          new ToTranslate(TrKey.NOTE_NOT_EXISTS, userLangCode, {
            id: _[0].preparedData.otherDBNote2.id,
          }),
      },
    ]));

  it(`"${cmd_undo_delnt} id" should be resolved as restored from deleted note`, () =>
    testBotMsgsRes([
      {
        toSendText: (_, { dbNote1 }) => `${cmd_undo_delnt} ${dbNote1.id}`,
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
            }),
          );
          const dbNote1 = await appBotMock.db.notes.add(
            { table_peer_id: chatId },
            createDeletedNote({
              peer_id: chatId,
              category_id: dbCategory.id,
              created_by_user_id: userIdStr,
              note_number: 15.9,
            }),
          );
          const dbNote2 = await appBotMock.db.notes.add(
            { table_peer_id: chatId },
            createDeletedNote({
              peer_id: chatId,
              category_id: dbCategory.id,
              created_by_user_id: userIdStr,
              note_text: 'Йухуууу!',
            }),
          );
          return { dbNote1, dbNote2 };
        },
        toBeMessage: (_) => {
          const ret = _[0].preparedData;
          return new ToTranslate(TrKey.NOTE_NUMBER_UNDO_DELETED, userLangCode, {
            id: ret.dbNote1.id,
            number: parseNoteNumber(ret.dbNote1.note_number),
            text: ret.dbNote1.note_text,
          });
        },
      },
      {
        toSendText: (_) => `${cmd_undo_delnt} ${_[0].preparedData.dbNote2.id}`,
        toBeMessage: (_) => {
          const ret = _[0].preparedData;
          return new ToTranslate(TrKey.NOTE_TEXT_UNDO_DELETED, userLangCode, {
            id: ret.dbNote2.id,
            text: ret.dbNote2.note_text,
          });
        },
      },
    ]));

  afterAll(() => destroyBotMockApp(appBotMock));
});
