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
import {
  checkAddSubcategory,
  MAX_SBC_DESC_LENGTH,
  MAX_SBC_TITLE_LENGTH,
  createDeletedSubcategory,
} from '../../../db/models/subcategoryModel';

import {
  toCommand,
  BotCommandEnum,
  generateInvInstruction,
} from '../../helpers';
import { generateInvalidTitles, CommandParameterName } from '../../parameters';
import { parseUserDateTimeToUTC } from '../../datetime';
import { AppTestConfigT } from '../../../config/config';

describe('Check subcategories update command handlers', () => {
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

  const cmd_updsbcn = toCommand(BotCommandEnum.updsbcn);
  it(`"${cmd_updsbcn}" should be rejected without arguments`, () =>
    testBotMsgsRes([
      {
        toSendText: cmd_updsbcn,
        toBeMessage: generateInvInstruction(
          TrKey.INVALID_UPDN_SBC_CMD,
          BotCommandEnum.updsbcn,
          userLangCode,
        ),
      },
    ]));

  const cmd_updsbcn_sm = `${cmd_updsbcn} ctgTitle`;
  it(`"${cmd_updsbcn_sm}" should be rejected as of lack argumets`, () =>
    testBotMsgsRes([
      {
        toSendText: cmd_updsbcn_sm,
        toBeMessage: generateInvInstruction(
          TrKey.INVALID_UPDN_SBC_CMD,
          BotCommandEnum.updsbcn,
          userLangCode,
        ),
      },
    ]));

  const cmd_updsbcn_amb = `${cmd_updsbcn} oldTitle newTitle ...`;
  it(`"${cmd_updsbcn_amb}" should be rejected as of too many arguments`, () =>
    testBotMsgsRes([
      {
        toSendText: cmd_updsbcn_amb,
        toBeMessage: generateInvInstruction(
          TrKey.INVALID_UPDN_SBC_CMD,
          BotCommandEnum.updsbcn,
          userLangCode,
        ),
      },
    ]));

  const fakeSbcTitle = 'fakeSbcTitle';
  const cmd_updsbcn_fake_sbc = `${cmd_updsbcn} ${fakeSbcTitle} newTitle`;
  const realCtgTitle = 'realCtgTitle';
  const realSbcTitle = '⛔';
  it(`"${cmd_updsbcn_fake_sbc}" should be rejected as of not existing category`, () =>
    testBotMsgsRes([
      {
        toSendText: cmd_updsbcn_fake_sbc,
        prepareDB: async () => {
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
            createDeletedSubcategory({
              title: realSbcTitle,
              peer_id: chatId,
              category_id: dbCategory.id,
              created_by_user_id: userIdStr,
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

  const realSbcTitle2 = '😄';
  const cmd_updsbcn_real_sbc = `${cmd_updsbcn} ${realSbcTitle} ${realSbcTitle2}`;
  it(`"${cmd_updsbcn_real_sbc}" should be rejected as of existing subcategory title`, () =>
    testBotMsgsRes([
      {
        toSendText: cmd_updsbcn_real_sbc,
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
            checkAddSubcategory({
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
              title: realSbcTitle2,
              peer_id: chatId,
              category_id: dbCategory.id,
              created_by_user_id: userIdStr,
              created_at: serverNowDate
                ? new Date(serverNowDate.getTime() + 2)
                : undefined,
            }),
          );
        },
        toBeMessage: new ToTranslate(TrKey.SUBCTG_EXISTS, userLangCode, {
          title: realSbcTitle2,
        }),
      },
    ]));

  const realCtgTitle2 = 'realCtgTitle2';
  const cmd_updsbcn_real_ctg = `${cmd_updsbcn} ${realSbcTitle} ${realCtgTitle2}`;
  it(`"${cmd_updsbcn_real_ctg}" should be rejected as of occupied category title`, () =>
    testBotMsgsRes([
      {
        toSendText: cmd_updsbcn_real_ctg,
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
          await appBotMock.db.categories.add(
            { table_peer_id: chatId },
            composeAddCategory({
              title: realCtgTitle2,
              peer_id: chatId,
              created_by_user_id: userIdStr,
              created_at: serverNowDate
                ? new Date(serverNowDate.getTime())
                : undefined,
            }),
          );
          const dbCategory = await appBotMock.db.categories.add(
            { table_peer_id: chatId },
            composeAddCategory({
              title: realCtgTitle,
              peer_id: chatId,
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
        toBeMessage: new ToTranslate(
          TrKey.TITLE_EXISTS_IN_CATEGORY,
          userLangCode,
          { title: realCtgTitle2 },
        ),
      },
    ]));

  const longSbcTitle = Array.from(
    { length: MAX_SBC_TITLE_LENGTH + 1 },
    (i, ind) => String(ind).slice(0, 1),
  ).join('');
  const cmd_updsbcn_long_title = `${cmd_updsbcn} ${realSbcTitle} ${longSbcTitle}`;
  it(`"${cmd_updsbcn_long_title}" should be rejected as of too long title`, () =>
    testBotMsgsRes([
      {
        toSendText: cmd_updsbcn_long_title,
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
          await appBotMock.db.categories.add(
            { table_peer_id: chatId },
            composeAddCategory({
              title: realCtgTitle2,
              peer_id: chatId,
              created_by_user_id: userIdStr,
              created_at: serverNowDate
                ? new Date(serverNowDate.getTime())
                : undefined,
            }),
          );
          const dbCategory = await appBotMock.db.categories.add(
            { table_peer_id: chatId },
            composeAddCategory({
              title: realCtgTitle,
              peer_id: chatId,
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
        toBeMessage: new ToTranslate(TrKey.SBC_TITLE_MAX_ERROR, userLangCode, {
          max: MAX_SBC_TITLE_LENGTH,
        }),
      },
    ]));

  const cmd_updsbcd = toCommand(BotCommandEnum.updsbcd);
  const cmd_updsbcd_sm = `${cmd_updsbcd}`;
  it(`"${cmd_updsbcd_sm}" should be rejected without arguments`, () =>
    testBotMsgsRes([
      {
        toSendText: cmd_updsbcd_sm,
        toBeMessage: generateInvInstruction(
          TrKey.INVALID_UPDD_SBC_CMD,
          BotCommandEnum.updsbcd,
          userLangCode,
        ),
      },
    ]));

  const longSbcDescr = Array.from(
    { length: MAX_SBC_DESC_LENGTH + 1 },
    (i, ind) => {
      if (ind === 0) {
        return 's';
      } else if (ind === MAX_SBC_DESC_LENGTH) {
        return 'e';
      } else {
        return Math.random() > 0.5 ? String(ind).slice(0, 1) : ' ';
      }
    },
  ).join('');
  const cmd_updsbcd_long_desc = `${cmd_updsbcd} ${realSbcTitle} ${longSbcDescr}`;
  it(`"${cmd_updsbcd_long_desc}" should be rejected as of too long description`, () =>
    testBotMsgsRes([
      {
        toSendText: cmd_updsbcd_long_desc,
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
          await appBotMock.db.categories.add(
            { table_peer_id: chatId },
            composeAddCategory({
              title: realCtgTitle2,
              peer_id: chatId,
              created_by_user_id: userIdStr,
              created_at: serverNowDate
                ? new Date(serverNowDate.getTime())
                : undefined,
            }),
          );
          const dbCategory = await appBotMock.db.categories.add(
            { table_peer_id: chatId },
            composeAddCategory({
              title: realCtgTitle,
              peer_id: chatId,
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
        toBeMessage: new ToTranslate(TrKey.SBC_DESC_MAX_ERROR, userLangCode, {
          max: MAX_SBC_DESC_LENGTH,
        }),
      },
    ]));

  it(`"${cmd_updsbcn_real_sbc}" should be resolved as updated subcategory title`, () =>
    testBotMsgsRes([
      {
        toSendText: cmd_updsbcn_real_sbc,
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
          await appBotMock.db.categories.add(
            { table_peer_id: chatId },
            createDeletedCategory({
              title: realCtgTitle,
              peer_id: chatId,
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
          await appBotMock.db.subcategories.add(
            { table_peer_id: chatId },
            createDeletedSubcategory({
              title: realSbcTitle2,
              peer_id: chatId,
              category_id: dbCategory.id,
              created_by_user_id: userIdStr,
              created_at: serverNowDate
                ? new Date(serverNowDate.getTime() + 3)
                : undefined,
            }),
          );
        },
        toBeMessage: new ToTranslate(TrKey.SUBCTG_NAME_UPDATED, userLangCode, {
          oldTitle: realSbcTitle,
          newTitle: realSbcTitle2,
        }),
      },
      {
        toSendText: `${cmd_updsbcn} ${realSbcTitle2} ${fakeSbcTitle}`,
        toBeMessage: new ToTranslate(TrKey.SUBCTG_NAME_UPDATED, userLangCode, {
          oldTitle: realSbcTitle2,
          newTitle: fakeSbcTitle,
        }),
      },
      {
        toSendText: `${cmd_updsbcn} ${realSbcTitle2} ${fakeSbcTitle}`,
        toBeMessage: new ToTranslate(
          TrKey.SBC_NOT_EXISTS_BY_TITLE,
          userLangCode,
          { title: realSbcTitle2 },
        ),
      },
    ]));

  const newSbcDescr = 'this is new sbc desc';
  const cmd_updsbcd_real_ctg = `${cmd_updsbcd} ${realSbcTitle} ${newSbcDescr}`;
  it(`"${cmd_updsbcd_real_ctg}" should be resolved as updated category description`, () =>
    testBotMsgsRes([
      {
        toSendText: cmd_updsbcd_real_ctg,
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
          await appBotMock.db.categories.add(
            { table_peer_id: chatId },
            composeAddCategory({
              title: realCtgTitle2,
              peer_id: chatId,
              created_by_user_id: userIdStr,
              created_at: serverNowDate
                ? new Date(serverNowDate.getTime())
                : undefined,
            }),
          );
          const dbCategory = await appBotMock.db.categories.add(
            { table_peer_id: chatId },
            composeAddCategory({
              title: realCtgTitle,
              peer_id: chatId,
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
        toBeMessage: new ToTranslate(TrKey.SUBCTG_DESC_UPDATED, userLangCode, {
          sbcTitle: realSbcTitle,
          oldDesc: '',
          newDesc: newSbcDescr,
        }),
      },
      {
        toSendText: `${cmd_updsbcd} ${realSbcTitle}`,
        toBeMessage: new ToTranslate(TrKey.SUBCTG_DESC_UPDATED, userLangCode, {
          sbcTitle: realSbcTitle,
          oldDesc: newSbcDescr,
          newDesc: '',
        }),
      },
    ]));

  const cmd_updsbcn_danger = `${cmd_updsbcn} ${fakeSbcTitle} ${CommandParameterName.limit}-name`;
  it(`"${cmd_updsbcn_danger}" should be rejected as of danger words`, () =>
    testBotMsgsRes([
      {
        toSendText: cmd_updsbcn_danger,
        toBeMessage: new ToTranslate(TrKey.ERROR_PRONE_STRING, userLangCode, {
          invTitles: generateInvalidTitles(),
        }),
      },
    ]));

  const cmd_updsbcd_danger = `${cmd_updsbcd} ${fakeSbcTitle} ${CommandParameterName.skip}-name`;
  it(`"${cmd_updsbcd_danger}" should be rejected as of danger words`, () =>
    testBotMsgsRes([
      {
        toSendText: cmd_updsbcn_danger,
        toBeMessage: new ToTranslate(TrKey.ERROR_PRONE_STRING, userLangCode, {
          invTitles: generateInvalidTitles(),
        }),
      },
      {
        toSendText: `${cmd_updsbcd} ${fakeSbcTitle} fgg hfd ${CommandParameterName.showDeleted}-name`,
        toBeMessage: new ToTranslate(TrKey.ERROR_PRONE_STRING, userLangCode, {
          invTitles: generateInvalidTitles(),
        }),
      },
      {
        toSendText: `${cmd_updsbcd} ${fakeSbcTitle} name ${CommandParameterName.ctgType}-${CategoryTypeEnum.numberPositive} desc`,
        toBeMessage: new ToTranslate(TrKey.ERROR_PRONE_STRING, userLangCode, {
          invTitles: generateInvalidTitles(),
        }),
      },
    ]));

  afterAll(() => destroyBotMockApp(appBotMock));
});
