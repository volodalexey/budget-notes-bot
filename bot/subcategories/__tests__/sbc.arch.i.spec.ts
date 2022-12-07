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
  printListCategories,
  DEFAULT_LIST_CTG_LIMIT,
} from '../../../db/models/categoryModel';
import {
  checkAddSubcategory,
  createArchivedSubcategory,
  SubcategoryDBModel,
} from '../../../db/models/subcategoryModel';
import {
  createArchivedNote,
  composeAddNote,
  printNtIds,
} from '../../../db/models/noteModel';

import {
  toCommand,
  BotCommandEnum,
  generateInvInstruction,
  toListHeader,
} from '../../helpers';
import { parseUserDateTimeToUTC } from '../../datetime';
import { CommandParameterName, PARAMS_EQ } from '../../parameters';
import { AppTestConfigT } from '../../../config/config';

describe('Check subcategories archive command handlers', () => {
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

  const cmd_archsbc = toCommand(BotCommandEnum.archsbc);
  it(`"${cmd_archsbc}" should be rejected without arguments`, () =>
    testBotMsgsRes([
      {
        toSendText: cmd_archsbc,
        toBeMessage: generateInvInstruction(
          TrKey.INVALID_ARCH_SBC_CMD,
          BotCommandEnum.archsbc,
          userLangCode,
        ),
      },
    ]));

  const cmd_archsbc_amb = `${cmd_archsbc} sbcTitle ...`;
  it(`"${cmd_archsbc_amb}" should be rejected as of too many arguments`, () =>
    testBotMsgsRes([
      {
        toSendText: cmd_archsbc_amb,
        toBeMessage: generateInvInstruction(
          TrKey.INVALID_ARCH_SBC_CMD,
          BotCommandEnum.archsbc,
          userLangCode,
        ),
      },
    ]));

  const fakeSbcTitle = 'fakeSbcTitle';
  const cmd_archsbc_fake_sbc = `${cmd_archsbc} ${fakeSbcTitle}`;
  const realCtgTitle = 'realCtgTitle';
  const realSbcTitle = '⛔';
  it(`"${cmd_archsbc_fake_sbc}" should be rejected as of not existing subcategory`, () =>
    testBotMsgsRes([
      {
        toSendText: cmd_archsbc_fake_sbc,
        prepareDB: async () => {
          serverNowDate = parseUserDateTimeToUTC(
            '2019.02.09 12:00',
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
            createArchivedSubcategory({
              title: realSbcTitle,
              peer_id: chatId,
              category_id: dbCategory.id,
              created_by_user_id: userIdStr,
              created_at: serverNowDate
                ? new Date(serverNowDate.getTime() + 1)
                : undefined,
            }),
          );
        },
        toBeMessage: new ToTranslate(
          TrKey.SBC_NOT_EXISTS_BY_TITLE,
          userLangCode,
          { title: fakeSbcTitle },
        ),
      },
    ]));

  const cmd_archsbc_real_sbc = `${cmd_archsbc} ${realSbcTitle}`;
  it(`"${cmd_archsbc_real_sbc}" should be resolved as archived subcategory`, () =>
    testBotMsgsRes([
      {
        toSendText: cmd_archsbc_real_sbc,
        prepareDB: async () => {
          serverNowDate = parseUserDateTimeToUTC(
            '2019.02.09 12:00',
            config.user.time_zone,
          );
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
              created_at: serverNowDate
                ? new Date(serverNowDate.getTime())
                : undefined,
            }),
          );
          await appBotMock.db.subcategories.add(
            { table_peer_id: chatId },
            createArchivedSubcategory({
              title: realSbcTitle,
              peer_id: chatId,
              category_id: dbCategory.id,
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
              category_id: dbCategory.id,
              created_by_user_id: userIdStr,
              created_at: serverNowDate
                ? new Date(serverNowDate.getTime() + 2)
                : undefined,
            }),
          );
        },
        toBeMessage: new ToTranslate(TrKey.SBC_ARCHIVED, userLangCode, {
          title: realSbcTitle,
        }),
        clearDB: async () => {
          const dbCategoriesJoinSbc1 =
            await appBotMock.db.categories.findJoinSbc({
              table_peer_id: chatId,
              title: realCtgTitle,
              peer_id: chatId,
            });
          return { dbCategoryJoinSbc1: dbCategoriesJoinSbc1[0] };
        },
      },
      {
        toSendText: cmd_archsbc_real_sbc,
        toBeMessage: new ToTranslate(
          TrKey.SBC_NOT_EXISTS_BY_TITLE,
          userLangCode,
          { title: realSbcTitle },
        ),
      },
      {
        toSendText: `${toCommand(BotCommandEnum.listctg)}`,
        toBeMessage: (_) => {
          return toListHeader(
            { limitNum: DEFAULT_LIST_CTG_LIMIT, ctgCount: 1 },
            new ToTranslate(TrKey.YOUR_CATEGORIES, userLangCode, {
              text: printListCategories({
                categories: [_[0].clearedData.dbCategoryJoinSbc1],
              }),
            }),
            userLangCode,
          );
        },
      },
      {
        toSendText: `${toCommand(BotCommandEnum.listsbc)}`,
        toBeText: () => `(лимит "30")
Нет подкатегорий`,
      },
    ]));

  it(`"${cmd_archsbc_real_sbc}" should be resolved as archived subcategory`, () =>
    testBotMsgsRes([
      {
        toSendText: cmd_archsbc_real_sbc,
        prepareDB: async () => {
          serverNowDate = parseUserDateTimeToUTC(
            '2019.02.09 12:00',
            config.user.time_zone,
          );
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
              created_at: serverNowDate
                ? new Date(serverNowDate.getTime())
                : undefined,
            }),
          );
          const dbSubcategory1 = await appBotMock.db.subcategories.add(
            { table_peer_id: chatId },
            checkAddSubcategory({
              title: realSbcTitle,
              peer_id: chatId,
              category_id: dbCategory1.id,
              created_by_user_id: userIdStr,
              created_at: serverNowDate
                ? new Date(serverNowDate.getTime() + 1)
                : undefined,
            }),
          );
          const dbNote1 = await appBotMock.db.notes.add(
            { table_peer_id: chatId },
            createArchivedNote({
              peer_id: chatId,
              category_id: dbCategory1.id,
              subcategory_id: dbSubcategory1.id,
              created_by_user_id: userIdStr,
              note_number: 15.9,
              created_at: serverNowDate
                ? new Date(serverNowDate.getTime() + 2)
                : undefined,
            }),
          );
          const dbNote2 = await appBotMock.db.notes.add(
            { table_peer_id: chatId },
            composeAddNote({
              peer_id: chatId,
              category_id: dbCategory1.id,
              subcategory_id: dbSubcategory1.id,
              created_by_user_id: userIdStr,
              note_text: 'dddf',
              created_at: serverNowDate
                ? new Date(serverNowDate.getTime() + 3)
                : undefined,
            }),
          );
          const dbNote3 = await appBotMock.db.notes.add(
            { table_peer_id: chatId },
            composeAddNote({
              peer_id: chatId,
              category_id: dbCategory1.id,
              subcategory_id: dbSubcategory1.id,
              created_by_user_id: userIdStr,
              note_number: 45.1,
              created_at: serverNowDate
                ? new Date(serverNowDate.getTime() + 4)
                : undefined,
            }),
          );
          return { dbNote1, dbNote2, dbNote3 };
        },
        toBeMessage: (_, { dbNote2, dbNote3 }) =>
          new ToTranslate(TrKey.SBC_ARCHIVED_WITH_NT, userLangCode, {
            title: realSbcTitle,
            ntIds: printNtIds([dbNote2, dbNote3]),
          }),
      },
    ]));

  const cmd_archsbc_amb_title = `${cmd_archsbc} ${realSbcTitle} [${CommandParameterName.sbcTitle}${PARAMS_EQ}${realSbcTitle}]`;
  it(`"${cmd_archsbc_amb_title}" should be rejected as of title parameter and text at the same time`, () =>
    testBotMsgsRes([
      {
        toSendText: cmd_archsbc_amb_title,
        toBeMessage: new ToTranslate(
          TrKey.PARAM_AMBIGUOUS_ERROR,
          userLangCode,
          {
            parName: CommandParameterName.sbcTitle,
          },
        ),
      },
    ]));

  const cmd_archsbc_amb_id = `${cmd_archsbc} ${realSbcTitle} [${CommandParameterName.sbcId}${PARAMS_EQ}123]`;
  it(`"${cmd_archsbc_amb_id}" should be rejected as of id parameter and text at the same time`, () =>
    testBotMsgsRes([
      {
        toSendText: cmd_archsbc_amb_id,
        toBeMessage: new ToTranslate(
          TrKey.PARAM_AMBIGUOUS_ERROR,
          userLangCode,
          {
            parName: CommandParameterName.sbcId,
          },
        ),
      },
    ]));

  const cmd_archsbc_unreal_param_id = `${cmd_archsbc} 223 [${CommandParameterName.sbcId}${PARAMS_EQ}123]`;
  it(`"${cmd_archsbc_unreal_param_id}" should be rejected as of id parameter and text-number at the same time`, () =>
    testBotMsgsRes([
      {
        toSendText: cmd_archsbc_unreal_param_id,
        toBeMessage: new ToTranslate(
          TrKey.PARAM_AMBIGUOUS_ERROR,
          userLangCode,
          {
            parName: CommandParameterName.sbcId,
          },
        ),
      },
    ]));

  const fakeSbcId = 9999999999999;
  const cmd_archctg_by_fake_id = `${cmd_archsbc} [${CommandParameterName.sbcId}${PARAMS_EQ}${fakeSbcId}]`;
  it(`"${cmd_archctg_by_fake_id}" should be rejected as of not existing category by id parameter`, () =>
    testBotMsgsRes([
      {
        toSendText: cmd_archctg_by_fake_id,
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
        toBeMessage: new ToTranslate(TrKey.SBC_NOT_EXISTS_BY_ID, userLangCode, {
          id: fakeSbcId,
        }),
      },
    ]));

  it(`"${cmd_archsbc} [${CommandParameterName.sbcId}${PARAMS_EQ}id]" should be resolved as archived subcategory by id parameter`, () =>
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
          const dbSbc = await appBotMock.db.subcategories.add(
            { table_peer_id: chatId },
            checkAddSubcategory({
              title: realSbcTitle,
              peer_id: chatId,
              category_id: dbCtg.id,
              created_by_user_id: userIdStr,
            }),
          );
          return { dbSbc };
        },
        toSendText: (_, { dbSbc }: { dbSbc: SubcategoryDBModel }) =>
          `${cmd_archsbc} [${CommandParameterName.sbcId}${PARAMS_EQ}${dbSbc.id}]`,
        toBeMessage: (_) => {
          const ret = _[0].preparedData;
          return new ToTranslate(TrKey.SBC_ARCHIVED, userLangCode, {
            title: (ret.dbSbc as SubcategoryDBModel).title,
          });
        },
      },
    ]));

  afterAll(() => destroyBotMockApp(appBotMock));
});
