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
  MAX_CTG_TITLE_LENGTH,
  MAX_CTG_DESC_LENGTH,
} from '../../../db/models/categoryModel';
import {
  checkAddSubcategory,
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

describe('Check catigories update command handlers', () => {
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

  const cmd_updctgn = toCommand(BotCommandEnum.updctgn);
  it(`"${cmd_updctgn}" should be rejected without arguments`, () =>
    testBotMsgsRes([
      {
        toSendText: cmd_updctgn,
        toBeMessage: generateInvInstruction(
          TrKey.INVALID_UPDN_CTG_CMD,
          BotCommandEnum.updctgn,
          userLangCode,
        ),
      },
    ]));

  const cmd_updctg_sm = `${cmd_updctgn} oldTitle`;
  it(`"${cmd_updctg_sm}" should be rejected as of lack argumets`, () =>
    testBotMsgsRes([
      {
        toSendText: cmd_updctg_sm,
        toBeMessage: generateInvInstruction(
          TrKey.INVALID_UPDN_CTG_CMD,
          BotCommandEnum.updctgn,
          userLangCode,
        ),
      },
    ]));

  const cmd_updctg_amb = `${cmd_updctgn} oldTitle newTitle newType ...`;
  it(`"${cmd_updctg_amb}" should be rejected as of too many arguments`, () =>
    testBotMsgsRes([
      {
        toSendText: cmd_updctg_amb,
        toBeMessage: generateInvInstruction(
          TrKey.INVALID_UPDN_CTG_CMD,
          BotCommandEnum.updctgn,
          userLangCode,
        ),
      },
    ]));

  const fakeCtgTitle = 'fakeCtgTitle';
  const cmd_updctg_fake_ctg = `${cmd_updctgn} ${fakeCtgTitle} newTitle`;
  it(`"${cmd_updctg_fake_ctg}" should be rejected as of not existing category`, () =>
    testBotMsgsRes([
      {
        toSendText: cmd_updctg_fake_ctg,
        prepareDB: async () => {
          await appBotMock.db.categories.deleteAll({
            table_peer_id: chatId,
            peer_id: chatId,
          });
          await appBotMock.db.categories.add(
            { table_peer_id: chatId },
            createDeletedCategory({
              title: fakeCtgTitle,
              peer_id: chatId,
              created_by_user_id: userIdStr,
            }),
          );
        },
        toBeMessage: new ToTranslate(
          TrKey.CTG_NOT_EXISTS_BY_TITLE,
          userLangCode,
          { title: fakeCtgTitle },
        ),
      },
    ]));

  const realCtgTitle = 'realCtgTitle';
  const realCtgTitle2 = 'realCtgTitle2';
  const cmd_updctgn_real_ctg = `${cmd_updctgn} ${realCtgTitle} ${realCtgTitle2}`;
  it(`"${cmd_updctgn_real_ctg}" should be rejected as of occupied category title`, () =>
    testBotMsgsRes([
      {
        toSendText: cmd_updctgn_real_ctg,
        prepareDB: async () => {
          serverNowDate = parseUserDateTimeToUTC(
            '2019.02.09 12:00',
            config.user.time_zone,
          );
          await appBotMock.db.categories.deleteAll({
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
            composeAddCategory({
              title: realCtgTitle2,
              peer_id: chatId,
              created_by_user_id: userIdStr,
              created_at: serverNowDate
                ? new Date(serverNowDate.getTime() + 1)
                : undefined,
            }),
          );
        },
        toBeMessage: new ToTranslate(TrKey.CATEGORY_EXISTS, userLangCode, {
          title: realCtgTitle2,
        }),
      },
    ]));

  const realSbcTitle = '😃';
  const cmd_updctg_real_als = `${cmd_updctgn} ${realCtgTitle} ${realSbcTitle}`;
  it(`"${cmd_updctg_real_als}" should be rejected as of occupied subcategory title`, () =>
    testBotMsgsRes([
      {
        toSendText: cmd_updctg_real_als,
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
        },
        toBeMessage: new ToTranslate(
          TrKey.TITLE_EXISTS_IN_SUBCTG,
          userLangCode,
          { title: realSbcTitle },
        ),
      },
    ]));

  const longCtgTitle = Array.from(
    { length: MAX_CTG_TITLE_LENGTH + 1 },
    (i, ind) => String(ind).slice(0, 1),
  ).join('');
  const cmd_updctgn_long_title = `${cmd_updctgn} ${realCtgTitle} ${longCtgTitle}`;
  it(`"${cmd_updctgn_long_title}" should be rejected as of too long title`, () =>
    testBotMsgsRes([
      {
        toSendText: cmd_updctgn_long_title,
        prepareDB: async () => {
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
              title: realCtgTitle,
              peer_id: chatId,
              created_by_user_id: userIdStr,
            }),
          );
        },
        toBeMessage: new ToTranslate(TrKey.CTG_TITLE_MAX_ERROR, userLangCode, {
          max: MAX_CTG_TITLE_LENGTH,
        }),
      },
    ]));

  const cmd_updctgd = toCommand(BotCommandEnum.updctgd);
  const cmd_updctgd_sm = `${cmd_updctgd}`;
  it(`"${cmd_updctgd_sm}" should be rejected without arguments`, () =>
    testBotMsgsRes([
      {
        toSendText: cmd_updctgd_sm,
        toBeMessage: generateInvInstruction(
          TrKey.INVALID_UPDD_CTG_CMD,
          BotCommandEnum.updctgd,
          userLangCode,
        ),
      },
    ]));

  const longCtgDescr = Array.from(
    { length: MAX_CTG_DESC_LENGTH + 1 },
    (i, ind) => {
      if (ind === 0) {
        return 's';
      } else if (ind === MAX_CTG_DESC_LENGTH) {
        return 'e';
      } else {
        return Math.random() > 0.5 ? String(ind).slice(0, 1) : ' ';
      }
    },
  ).join('');
  const cmd_updctgd_long_desc = `${cmd_updctgd} ${realCtgTitle} ${longCtgDescr}`;
  it(`"${cmd_updctgd_long_desc}" should be rejected as of too long description`, () =>
    testBotMsgsRes([
      {
        toSendText: cmd_updctgd_long_desc,
        prepareDB: async () => {
          await appBotMock.db.categories.deleteAll({
            table_peer_id: chatId,
            peer_id: chatId,
          });
          await appBotMock.db.categories.add(
            { table_peer_id: chatId },
            composeAddCategory({
              title: realCtgTitle,
              peer_id: chatId,
              created_by_user_id: userIdStr,
            }),
          );
        },
        toBeMessage: new ToTranslate(TrKey.CTG_DESC_MAX_ERROR, userLangCode, {
          max: MAX_CTG_DESC_LENGTH,
        }),
      },
    ]));

  it(`"${cmd_updctgn_real_ctg}" should be resolved as updated category title`, () =>
    testBotMsgsRes([
      {
        toSendText: cmd_updctgn_real_ctg,
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
              title: realCtgTitle2,
              peer_id: chatId,
              created_by_user_id: userIdStr,
              created_at: serverNowDate
                ? new Date(serverNowDate.getTime() + 1)
                : undefined,
            }),
          );
          await appBotMock.db.subcategories.add(
            { table_peer_id: chatId },
            createDeletedSubcategory({
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
          TrKey.CATEGORY_NAME_UPDATED,
          userLangCode,
          {
            oldTitle: realCtgTitle,
            newTitle: realCtgTitle2,
          },
        ),
      },
    ]));

  const newCtgDescr = 'this is new ctg desc';
  const cmd_updctgd_real_ctg = `${cmd_updctgd} ${realCtgTitle} ${newCtgDescr}`;
  it(`"${cmd_updctgd_real_ctg}" should be resolved as updated category description`, () =>
    testBotMsgsRes([
      {
        toSendText: cmd_updctgd_real_ctg,
        prepareDB: async () => {
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
              title: realCtgTitle,
              peer_id: chatId,
              created_by_user_id: userIdStr,
            }),
          );
        },
        toBeMessage: new ToTranslate(
          TrKey.CATEGORY_DESC_UPDATED,
          userLangCode,
          {
            ctgTitle: realCtgTitle,
            oldDesc: '',
            newDesc: newCtgDescr,
          },
        ),
      },
      {
        toSendText: `${cmd_updctgd} ${realCtgTitle}`,
        toBeMessage: new ToTranslate(
          TrKey.CATEGORY_DESC_UPDATED,
          userLangCode,
          {
            ctgTitle: realCtgTitle,
            oldDesc: newCtgDescr,
            newDesc: '',
          },
        ),
      },
    ]));

  const cmd_updctgn_danger = `${cmd_updctgn} ${fakeCtgTitle} ${CommandParameterName.limit}-name`;
  it(`"${cmd_updctgn_danger}" should be rejected as of danger words`, () =>
    testBotMsgsRes([
      {
        toSendText: cmd_updctgn_danger,
        toBeMessage: new ToTranslate(TrKey.ERROR_PRONE_STRING, userLangCode, {
          invTitles: generateInvalidTitles(),
        }),
      },
    ]));

  const cmd_updctgd_danger = `${cmd_updctgd} ${fakeCtgTitle} ${CommandParameterName.skip}-name`;
  it(`"${cmd_updctgd_danger}" should be rejected as of danger words`, () =>
    testBotMsgsRes([
      {
        toSendText: cmd_updctgn_danger,
        toBeMessage: new ToTranslate(TrKey.ERROR_PRONE_STRING, userLangCode, {
          invTitles: generateInvalidTitles(),
        }),
      },
      {
        toSendText: `${cmd_updctgd} ${fakeCtgTitle} fgg hfd ${CommandParameterName.showId}-name`,
        toBeMessage: new ToTranslate(TrKey.ERROR_PRONE_STRING, userLangCode, {
          invTitles: generateInvalidTitles(),
        }),
      },
      {
        toSendText: `${cmd_updctgd} ${fakeCtgTitle} name ${CommandParameterName.ctgType}-${CategoryTypeEnum.numberPositive} desc`,
        toBeMessage: new ToTranslate(TrKey.ERROR_PRONE_STRING, userLangCode, {
          invTitles: generateInvalidTitles(),
        }),
      },
    ]));

  afterAll(() => destroyBotMockApp(appBotMock));
});
