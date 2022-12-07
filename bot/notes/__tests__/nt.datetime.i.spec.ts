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
  DEFAULT_CTG_TYPE,
} from '../../../db/models/categoryModel';
import { checkAddSubcategory } from '../../../db/models/subcategoryModel';
import {
  composeAddNote,
  createDeletedNote,
  generateNoteCreatedTranslations,
  parseNoteNumber,
  createArchivedNote,
} from '../../../db/models/noteModel';

import { setDTDate } from '../../datetime';
import { BotCommandEnum, toCommand } from '../../helpers';
import { CommandParameterName, PARAMS_EQ } from '../../parameters';
import { AppTestConfigT } from '../../../config/config';

describe('Check notes datetime generation', () => {
  let appBotMock: AppBotMockI;
  let config: AppTestConfigT;
  let testBotMsgsRes: PreparedTestBotMessages;
  let userLangCode: LanguageEnum;
  let chatId: number;
  let userIdStr: string;

  let mockCreatedDate: Date,
    mockDeleteDate: Date,
    mockArchivedDate: Date,
    mockUpdatedDate: Date;

  beforeAll(async () => {
    appBotMock = await startBotMockApp();
    config = appBotMock.config;
    userLangCode = appBotMock.userLangCode;
    chatId = appBotMock.chatId;
    userIdStr = appBotMock.user.id;
    testBotMsgsRes = CreateMockTestBotMessageResponses({ appBotMock });
  });

  const realCtgTitle = 'realCtgTitle';
  const realSbcTitle = '😴';
  const ntNum = 34;
  const msg_addnt_real = `${realSbcTitle} ${ntNum}`;
  it(`"${msg_addnt_real}" should add new note`, () =>
    testBotMsgsRes([
      {
        toSendText: msg_addnt_real,
        prepareDB: async () => {
          mockCreatedDate = new Date();
          setDTDate(mockCreatedDate);
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
          await appBotMock.db.subcategories.add(
            { table_peer_id: chatId },
            checkAddSubcategory({
              title: realSbcTitle,
              peer_id: chatId,
              category_id: dbCategory.id,
              created_by_user_id: userIdStr,
            }),
          );
        },
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
                noteNumber: `-${ntNum}`,
                lang: userLangCode,
                timeZone: config.user.time_zone,
                categoryTitle: realCtgTitle,
                categoryType: DEFAULT_CTG_TYPE,
                subcategoryTitle: realSbcTitle,
              }),
            },
            ['futureDateMsg', 'createdFields'],
          ),
      },
      {
        toExpect: [
          (_) => {
            const dbNote = _[0].clearedData[0];
            expect(dbNote).toBeDefined();
          },
          (_) => {
            const dbNote = _[0].clearedData[0];
            expect(dbNote).toHaveProperty('created_at', mockCreatedDate);
          },
          (_) => {
            const dbNote = _[0].clearedData[0];
            expect(dbNote).toHaveProperty('created_by_user_id', userIdStr);
          },
          (_) => {
            const dbNote = _[0].clearedData[0];
            expect(dbNote).toHaveProperty('updated_at', null);
          },
          (_) => {
            const dbNote = _[0].clearedData[0];
            expect(dbNote).toHaveProperty('updated_by_user_id', null);
          },
          (_) => {
            const dbNote = _[0].clearedData[0];
            expect(dbNote).toHaveProperty('deleted_at', null);
          },
          (_) => {
            const dbNote = _[0].clearedData[0];
            expect(dbNote).toHaveProperty('deleted_by_user_id', null);
          },
          (_) => {
            const dbNote = _[0].clearedData[0];
            expect(dbNote).toHaveProperty('archived_at', null);
          },
          (_) => {
            const dbNote = _[0].clearedData[0];
            expect(dbNote).toHaveProperty('archived_by_user_id', null);
          },
        ],
      },
    ]));

  const cmd_delnt = toCommand(BotCommandEnum.delnt);
  it(`"${cmd_delnt} {{id}}" should delete note`, () =>
    testBotMsgsRes([
      {
        toSendText: (_, dbNote) => `${cmd_delnt} ${dbNote.id}`,
        prepareDB: async () => {
          mockCreatedDate = new Date();
          setDTDate(mockCreatedDate);
          await appBotMock.db.notes.deleteAll({ table_peer_id: chatId });
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
          mockDeleteDate = new Date();
          setDTDate(mockDeleteDate);
          return dbNote;
        },
        toBeMessage: (_) => {
          const ret = _[0].preparedData;
          return new ToTranslate(TrKey.NOTE_NUMBER_DELETED, userLangCode, {
            id: ret.id,
            number: parseNoteNumber(ret.note_number),
            text: ret.note_text,
          });
        },
        clearDB: () =>
          appBotMock.db.notes.listJoinCtgSbc({
            table_peer_id: chatId,
            peer_id: chatId,
            in_deleted: true,
          }),
      },
      {
        toExpect: [
          (_) => {
            const dbNote = _[0].clearedData[0];
            expect(dbNote).toBeDefined();
          },
          (_) => {
            const dbNote = _[0].clearedData[0];
            expect(dbNote).toHaveProperty('created_at', mockCreatedDate);
          },
          (_) => {
            const dbNote = _[0].clearedData[0];
            expect(dbNote).toHaveProperty('created_by_user_id', userIdStr);
          },
          (_) => {
            const dbNote = _[0].clearedData[0];
            expect(dbNote).toHaveProperty('updated_at', null);
          },
          (_) => {
            const dbNote = _[0].clearedData[0];
            expect(dbNote).toHaveProperty('updated_by_user_id', null);
          },
          (_) => {
            const dbNote = _[0].clearedData[0];
            expect(dbNote).toHaveProperty('deleted_at', mockDeleteDate);
          },
          (_) => {
            const dbNote = _[0].clearedData[0];
            expect(dbNote).toHaveProperty('deleted_by_user_id', userIdStr);
          },
          (_) => {
            const dbNote = _[0].clearedData[0];
            expect(dbNote).toHaveProperty('archived_at', null);
          },
          (_) => {
            const dbNote = _[0].clearedData[0];
            expect(dbNote).toHaveProperty('archived_by_user_id', null);
          },
        ],
      },
    ]));

  const cmd_updnt = toCommand(BotCommandEnum.updnt);
  const newNtNum = -12.3;
  it(`"${cmd_updnt} {{id}} ${newNtNum}" should be resolved as updated note number`, () =>
    testBotMsgsRes([
      {
        toSendText: (_, dbNote) =>
          `${cmd_updnt} [${CommandParameterName.ntId}${PARAMS_EQ}${dbNote.id} ${CommandParameterName.ntNumber}${PARAMS_EQ}${newNtNum}]`,
        prepareDB: async () => {
          mockCreatedDate = new Date();
          setDTDate(mockCreatedDate);
          await appBotMock.db.notes.deleteAll({ table_peer_id: chatId });
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
              note_number: 56.9,
            }),
          );
          mockUpdatedDate = new Date();
          setDTDate(mockUpdatedDate);
          return dbNote;
        },
        toBeText: (_) => `Запись с 🆔 "${_[0].preparedData.id}" обновлена
Обновленные поля:
Число "+56.9" ➡️ "-12.3"`,
        clearDB: () =>
          appBotMock.db.notes.listJoinCtgSbc({
            table_peer_id: chatId,
            peer_id: chatId,
          }),
      },
      {
        toExpect: [
          (_) => {
            const dbNote = _[0].clearedData[0];
            expect(dbNote).toBeDefined();
          },
          (_) => {
            const dbNote = _[0].clearedData[0];
            expect(dbNote).toHaveProperty('created_at', mockCreatedDate);
          },
          (_) => {
            const dbNote = _[0].clearedData[0];
            expect(dbNote).toHaveProperty('created_by_user_id', userIdStr);
          },
          (_) => {
            const dbNote = _[0].clearedData[0];
            expect(dbNote).toHaveProperty('updated_at', mockUpdatedDate);
          },
          (_) => {
            const dbNote = _[0].clearedData[0];
            expect(dbNote).toHaveProperty('updated_by_user_id', userIdStr);
          },
          (_) => {
            const dbNote = _[0].clearedData[0];
            expect(dbNote).toHaveProperty('deleted_at', null);
          },
          (_) => {
            const dbNote = _[0].clearedData[0];
            expect(dbNote).toHaveProperty('deleted_by_user_id', null);
          },
          (_) => {
            const dbNote = _[0].clearedData[0];
            expect(dbNote).toHaveProperty('archived_at', null);
          },
          (_) => {
            const dbNote = _[0].clearedData[0];
            expect(dbNote).toHaveProperty('archived_by_user_id', null);
          },
        ],
      },
    ]));

  const newNtText = '-12.3 dd';
  it(`"${cmd_updnt} {{id}} ${newNtText}" should be resolved as updated note text`, () =>
    testBotMsgsRes([
      {
        toSendText: (_, dbNote) =>
          `${cmd_updnt} [${CommandParameterName.ntId}${PARAMS_EQ}${dbNote.id} ${CommandParameterName.ntText}${PARAMS_EQ}${newNtText}]`,
        prepareDB: async () => {
          mockCreatedDate = new Date();
          setDTDate(mockCreatedDate);
          await appBotMock.db.notes.deleteAll({ table_peer_id: chatId });
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
              category_type: CategoryTypeEnum.text,
            }),
          );
          const dbNote = await appBotMock.db.notes.add(
            { table_peer_id: chatId },
            composeAddNote({
              peer_id: chatId,
              category_id: dbCategory.id,
              created_by_user_id: userIdStr,
              note_text: '56.ff9',
            }),
          );
          mockUpdatedDate = new Date();
          setDTDate(mockUpdatedDate);
          return dbNote;
        },
        toBeText: (_) => `Запись с 🆔 "${_[0].preparedData.id}" обновлена
Обновленные поля:
Текст "56.ff9" ➡️ "-12.3"`,
        clearDB: () =>
          appBotMock.db.notes.listJoinCtgSbc({
            table_peer_id: chatId,
            peer_id: chatId,
          }),
      },
      {
        toExpect: [
          (_) => {
            const dbNote = _[0].clearedData[0];
            expect(dbNote).toBeDefined();
          },
          (_) => {
            const dbNote = _[0].clearedData[0];
            expect(dbNote).toHaveProperty('created_at', mockCreatedDate);
          },
          (_) => {
            const dbNote = _[0].clearedData[0];
            expect(dbNote).toHaveProperty('created_by_user_id', userIdStr);
          },
          (_) => {
            const dbNote = _[0].clearedData[0];
            expect(dbNote).toHaveProperty('updated_at', mockUpdatedDate);
          },
          (_) => {
            const dbNote = _[0].clearedData[0];
            expect(dbNote).toHaveProperty('updated_by_user_id', userIdStr);
          },
          (_) => {
            const dbNote = _[0].clearedData[0];
            expect(dbNote).toHaveProperty('deleted_at', null);
          },
          (_) => {
            const dbNote = _[0].clearedData[0];
            expect(dbNote).toHaveProperty('deleted_by_user_id', null);
          },
          (_) => {
            const dbNote = _[0].clearedData[0];
            expect(dbNote).toHaveProperty('archived_at', null);
          },
          (_) => {
            const dbNote = _[0].clearedData[0];
            expect(dbNote).toHaveProperty('archived_by_user_id', null);
          },
        ],
      },
    ]));

  const cmd_undo_delnt = toCommand(BotCommandEnum.undodelnt);
  it(`"${cmd_undo_delnt} {{id}}" should restore note from deleted`, () =>
    testBotMsgsRes([
      {
        toSendText: (_, dbNote) => `${cmd_undo_delnt} ${dbNote.id}`,
        prepareDB: async () => {
          mockUpdatedDate = new Date();
          setDTDate(mockUpdatedDate);
          await appBotMock.db.notes.deleteAll({ table_peer_id: chatId });
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
          return dbNote;
        },
        toBeMessage: (_) => {
          const ret = _[0].preparedData;
          return new ToTranslate(TrKey.NOTE_NUMBER_UNDO_DELETED, userLangCode, {
            id: ret.id,
            number: parseNoteNumber(ret.note_number),
            text: ret.note_text,
          });
        },
        clearDB: () =>
          appBotMock.db.notes.listJoinCtgSbc({
            table_peer_id: chatId,
            peer_id: chatId,
          }),
      },
      {
        toExpect: [
          (_) => {
            const dbNote = _[0].clearedData[0];
            expect(dbNote).toBeDefined();
          },
          (_) => {
            const dbNote = _[0].clearedData[0];
            expect(dbNote).toHaveProperty('created_at', mockUpdatedDate);
          },
          (_) => {
            const dbNote = _[0].clearedData[0];
            expect(dbNote).toHaveProperty('created_by_user_id', userIdStr);
          },
          (_) => {
            const dbNote = _[0].clearedData[0];
            expect(dbNote).toHaveProperty('updated_at', mockUpdatedDate);
          },
          (_) => {
            const dbNote = _[0].clearedData[0];
            expect(dbNote).toHaveProperty('updated_by_user_id', userIdStr);
          },
          (_) => {
            const dbNote = _[0].clearedData[0];
            expect(dbNote).toHaveProperty('deleted_at', null);
          },
          (_) => {
            const dbNote = _[0].clearedData[0];
            expect(dbNote).toHaveProperty('deleted_by_user_id', null);
          },
          (_) => {
            const dbNote = _[0].clearedData[0];
            expect(dbNote).toHaveProperty('archived_at', null);
          },
          (_) => {
            const dbNote = _[0].clearedData[0];
            expect(dbNote).toHaveProperty('archived_by_user_id', null);
          },
        ],
      },
    ]));

  const cmd_archnt = toCommand(BotCommandEnum.archnt);
  it(`"${cmd_archnt} {{id}}" should archive note`, () =>
    testBotMsgsRes([
      {
        toSendText: (_, dbNote) => `${cmd_archnt} ${dbNote.id}`,
        prepareDB: async () => {
          mockCreatedDate = new Date();
          setDTDate(mockCreatedDate);
          await appBotMock.db.notes.deleteAll({ table_peer_id: chatId });
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
          mockArchivedDate = new Date();
          setDTDate(mockArchivedDate);
          return dbNote;
        },
        toBeMessage: (_) => {
          const ret = _[0].preparedData;
          return new ToTranslate(TrKey.NOTE_NUMBER_ARCHIVED, userLangCode, {
            id: ret.id,
            number: parseNoteNumber(ret.note_number),
            text: ret.note_text,
          });
        },
        clearDB: () =>
          appBotMock.db.notes.listJoinCtgSbc({
            table_peer_id: chatId,
            peer_id: chatId,
            in_archived: true,
          }),
      },
      {
        toExpect: [
          (_) => {
            const dbNote = _[0].clearedData[0];
            expect(dbNote).toBeDefined();
          },
          (_) => {
            const dbNote = _[0].clearedData[0];
            expect(dbNote).toHaveProperty('created_at', mockCreatedDate);
          },
          (_) => {
            const dbNote = _[0].clearedData[0];
            expect(dbNote).toHaveProperty('created_by_user_id', userIdStr);
          },
          (_) => {
            const dbNote = _[0].clearedData[0];
            expect(dbNote).toHaveProperty('updated_at', null);
          },
          (_) => {
            const dbNote = _[0].clearedData[0];
            expect(dbNote).toHaveProperty('updated_by_user_id', null);
          },
          (_) => {
            const dbNote = _[0].clearedData[0];
            expect(dbNote).toHaveProperty('deleted_at', null);
          },
          (_) => {
            const dbNote = _[0].clearedData[0];
            expect(dbNote).toHaveProperty('deleted_by_user_id', null);
          },
          (_) => {
            const dbNote = _[0].clearedData[0];
            expect(dbNote).toHaveProperty('archived_at', mockArchivedDate);
          },
          (_) => {
            const dbNote = _[0].clearedData[0];
            expect(dbNote).toHaveProperty('archived_by_user_id', userIdStr);
          },
        ],
      },
    ]));

  const cmd_undo_archnt = toCommand(BotCommandEnum.undoarchnt);
  it(`"${cmd_undo_archnt} {{id}}" should restore note from archived`, () =>
    testBotMsgsRes([
      {
        toSendText: (_, dbNote) => `${cmd_undo_archnt} ${dbNote.id}`,
        prepareDB: async () => {
          mockUpdatedDate = new Date();
          setDTDate(mockUpdatedDate);
          await appBotMock.db.notes.deleteAll({ table_peer_id: chatId });
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
            createArchivedNote({
              peer_id: chatId,
              category_id: dbCategory.id,
              created_by_user_id: userIdStr,
              note_number: 15.9,
            }),
          );
          return dbNote;
        },
        toBeMessage: (_) => {
          const ret = _[0].preparedData;
          return new ToTranslate(
            TrKey.NOTE_NUMBER_UNDO_ARCHIVED,
            userLangCode,
            {
              id: ret.id,
              number: parseNoteNumber(ret.note_number),
              text: ret.note_text,
            },
          );
        },
        clearDB: () =>
          appBotMock.db.notes.listJoinCtgSbc({
            table_peer_id: chatId,
            peer_id: chatId,
          }),
      },
      {
        toExpect: [
          (_) => {
            const dbNote = _[0].clearedData[0];
            expect(dbNote).toBeDefined();
          },
          (_) => {
            const dbNote = _[0].clearedData[0];
            expect(dbNote).toHaveProperty('created_at', mockUpdatedDate);
          },
          (_) => {
            const dbNote = _[0].clearedData[0];
            expect(dbNote).toHaveProperty('created_by_user_id', userIdStr);
          },
          (_) => {
            const dbNote = _[0].clearedData[0];
            expect(dbNote).toHaveProperty('updated_at', mockUpdatedDate);
          },
          (_) => {
            const dbNote = _[0].clearedData[0];
            expect(dbNote).toHaveProperty('updated_by_user_id', userIdStr);
          },
          (_) => {
            const dbNote = _[0].clearedData[0];
            expect(dbNote).toHaveProperty('deleted_at', null);
          },
          (_) => {
            const dbNote = _[0].clearedData[0];
            expect(dbNote).toHaveProperty('deleted_by_user_id', null);
          },
          (_) => {
            const dbNote = _[0].clearedData[0];
            expect(dbNote).toHaveProperty('archived_at', null);
          },
          (_) => {
            const dbNote = _[0].clearedData[0];
            expect(dbNote).toHaveProperty('archived_by_user_id', null);
          },
        ],
      },
    ]));

  afterAll(async () => {
    setDTDate();
    await destroyBotMockApp(appBotMock);
  });
});
