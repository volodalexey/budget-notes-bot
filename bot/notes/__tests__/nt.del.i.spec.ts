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
  DEFAULT_CTG_TYPE,
} from '../../../db/models/categoryModel';
import {
  composeAddNote,
  createDeletedNote,
  generateNoteCreatedTranslations,
  parseNoteNumber,
} from '../../../db/models/noteModel';

import {
  toCommand,
  BotCommandEnum,
  generateInvInstruction,
} from '../../helpers';
import { CommandParameterName, PARAMS_EQ } from '../../parameters';
import { printNumber } from '../../print';
import { AppTestConfigT } from '../../../config/config';

describe('Check delete note command handlers', () => {
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

  const cmd_delnt = toCommand(BotCommandEnum.delnt);
  it(`"${cmd_delnt}" should be rejected without arguments`, () =>
    testBotMsgsRes([
      {
        toSendText: cmd_delnt,
        toBeMessage: generateInvInstruction(
          TrKey.INVALID_DEL_NOTE_CMD,
          BotCommandEnum.delnt,
          userLangCode,
        ),
      },
    ]));

  const cmd_delnt_amb = `${cmd_delnt} a ...`;
  it(`"${cmd_delnt_amb}" should be rejected as of too many arguments`, () =>
    testBotMsgsRes([
      {
        toSendText: cmd_delnt_amb,
        toBeMessage: generateInvInstruction(
          TrKey.INVALID_DEL_NOTE_CMD,
          BotCommandEnum.delnt,
          userLangCode,
        ),
      },
    ]));

  const cmd_delnt_fake_id = `${cmd_delnt} fakeNoteId`;
  const realCtgTitle = 'realCtgTitle';
  it(`"${cmd_delnt_fake_id}" should be rejected as of errors: not existing note, not visible note for current user`, () =>
    testBotMsgsRes([
      {
        toSendText: (_, { dbNote }) => `${cmd_delnt} ${dbNote.id}`,
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
        toSendText: (_) => `${cmd_delnt} ${_[0].preparedData.otherDBNote.id}`,
        toBeMessage: (_) =>
          new ToTranslate(TrKey.NOTE_NOT_EXISTS, userLangCode, {
            id: _[0].preparedData.otherDBNote.id,
          }),
      },
      {
        toSendText: (_) => `${cmd_delnt} ${_[0].preparedData.otherDBNote2.id}`,
        toBeMessage: (_) =>
          new ToTranslate(TrKey.NOTE_NOT_EXISTS, userLangCode, {
            id: _[0].preparedData.otherDBNote2.id,
          }),
      },
    ]));

  it(`"${cmd_delnt} id" should be resolved as deleted note`, () =>
    testBotMsgsRes([
      {
        toSendText: (_, { dbNote1 }) => `${cmd_delnt} ${dbNote1.id}`,
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
            composeAddNote({
              peer_id: chatId,
              category_id: dbCategory.id,
              created_by_user_id: userIdStr,
              note_number: 15.9,
            }),
          );
          const dbNote2 = await appBotMock.db.notes.add(
            { table_peer_id: chatId },
            composeAddNote({
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
          return new ToTranslate(TrKey.NOTE_NUMBER_DELETED, userLangCode, {
            id: ret.dbNote1.id,
            number: parseNoteNumber(ret.dbNote1.note_number),
            text: ret.dbNote1.note_text,
          });
        },
      },
      {
        toSendText: (_) => `${cmd_delnt} ${_[0].preparedData.dbNote2.id}`,
        toBeMessage: (_) => {
          const ret = _[0].preparedData;
          return new ToTranslate(TrKey.NOTE_TEXT_DELETED, userLangCode, {
            id: ret.dbNote2.id,
            text: ret.dbNote2.note_text,
          });
        },
      },
    ]));

  const cmd_delnt_amb_id = `${cmd_delnt} {{txt}} [${CommandParameterName.ntId}${PARAMS_EQ}123]`;
  it(`"${cmd_delnt_amb_id}" should be rejected as of id parameter and text at the same time`, () =>
    testBotMsgsRes([
      {
        toSendText: cmd_delnt_amb_id.replace('{{txt}}', realCtgTitle),
        toBeMessage: new ToTranslate(
          TrKey.PARAM_AMBIGUOUS_ERROR,
          userLangCode,
          {
            parName: CommandParameterName.ntId,
          },
        ),
      },
      {
        toSendText: cmd_delnt_amb_id.replace('{{txt}}', '321'),
        toBeMessage: new ToTranslate(
          TrKey.PARAM_AMBIGUOUS_ERROR,
          userLangCode,
          {
            parName: CommandParameterName.ntId,
          },
        ),
      },
    ]));

  it(`should delete note by reply to response text when adding nt`, () =>
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
          `${toCommand(BotCommandEnum.addnt)} [${
            CommandParameterName.ctgId
          }${PARAMS_EQ}${_[0].preparedData.id} ${
            CommandParameterName.ntNumber
          }${PARAMS_EQ}312]`,
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
                noteNumber: '-312',
                lang: userLangCode,
                timeZone: config.user.time_zone,
                categoryTitle: realCtgTitle,
                categoryType: DEFAULT_CTG_TYPE,
              }),
            },
            ['futureDateMsg', 'createdFields'],
          ),
      },
      {
        toSendText: () => `${cmd_delnt}`,
        messageClosureForReply: (_) => _[0].lastMessage,
        toBeMessage: (_) =>
          new ToTranslate(TrKey.NOTE_NUMBER_DELETED, userLangCode, {
            id: _[0].clearedData[0].id,
            number: printNumber(Number(_[0].clearedData[0].note_number)),
            text: '',
          }),
      },
    ]));

  afterAll(() => destroyBotMockApp(appBotMock));
});
