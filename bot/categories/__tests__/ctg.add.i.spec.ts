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
  MAX_CTG_DESC_LENGTH,
  CategoryTypeEnum,
  MAX_CTG_TITLE_LENGTH,
  DEFAULT_CTG_TYPE,
  composeAddCategory,
  getCategoryTypes,
  generateCategoryCreatedTranslations,
} from '../../../db/models/categoryModel';
import { checkAddSubcategory } from '../../../db/models/subcategoryModel';

import {
  toCommand,
  BotCommandEnum,
  generateInvInstruction,
} from '../../helpers';
import { CommandParameterName, PARAMS_EQ } from '../../parameters';
import { parseUserDateTimeToUTC } from '../../datetime';
import { printObject } from '../../print';
import { AppTestConfigT } from '../../../config/config';

describe('Check catigories add command handlers', () => {
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

  const cmd_addctg = toCommand(BotCommandEnum.addctg);
  it(`"${cmd_addctg}" should be rejected without arguments`, () =>
    testBotMsgsRes([
      {
        toSendText: cmd_addctg,
        toBeMessage: generateInvInstruction(
          TrKey.INVALID_ADD_CTG_CMD,
          BotCommandEnum.addctg,
          userLangCode,
        ),
      },
    ]));

  const cmd_addctg_params = `${cmd_addctg} [${CommandParameterName.ctgType}${PARAMS_EQ}${CategoryTypeEnum.text}]`;
  it(`"${cmd_addctg_params}" should be rejected without category name`, () =>
    testBotMsgsRes([
      {
        toSendText: cmd_addctg_params,
        toBeMessage: generateInvInstruction(
          TrKey.INVALID_ADD_CTG_CMD,
          BotCommandEnum.addctg,
          userLangCode,
        ),
      },
    ]));

  const cmd_addctg_empty_type = `${cmd_addctg} [${CommandParameterName.ctgType}${PARAMS_EQ}""]`;
  it(`"${cmd_addctg_empty_type}" should be rejected as of empty category type`, () =>
    testBotMsgsRes([
      {
        toSendText: cmd_addctg_empty_type,
        toBeMessage: new ToTranslate(
          TrKey.PARAM_TYPE_STR_MATCH_ERROR,
          userLangCode,
          {
            parName: CommandParameterName.ctgType,
            parValues: printObject(getCategoryTypes()),
          },
        ),
      },
    ]));

  const realCtgTitle = 'realCtgTitle';
  const cmd_addctg_real_ctg = `${cmd_addctg} ${realCtgTitle}`;
  it(`"${cmd_addctg_real_ctg}" should be rejected as of already existing category`, () =>
    testBotMsgsRes([
      {
        toSendText: cmd_addctg_real_ctg,
        prepareDB: async () => {
          await appBotMock.db.categories.deleteAll({
            table_peer_id: chatId,
            peer_id: chatId,
          });
          const category = composeAddCategory({
            title: realCtgTitle,
            peer_id: chatId,
            created_by_user_id: userIdStr,
          });
          await appBotMock.db.categories.add(
            { table_peer_id: chatId },
            category,
          );
        },
        toBeMessage: new ToTranslate(TrKey.CATEGORY_EXISTS, userLangCode, {
          title: realCtgTitle,
        }),
      },
    ]));

  const inv_type = `${CategoryTypeEnum.numberPositive}ddd`;
  const cmd_addctg_ctg_inv_type = `${cmd_addctg} ${realCtgTitle} [${CommandParameterName.ctgType}${PARAMS_EQ}${inv_type}]`;
  it(`"${cmd_addctg_ctg_inv_type}" should be rejected as of invalid category type`, () =>
    testBotMsgsRes([
      {
        toSendText: cmd_addctg_ctg_inv_type,
        toBeMessage: new ToTranslate(
          TrKey.PARAM_TYPE_STR_MATCH_ERROR,
          userLangCode,
          {
            parName: CommandParameterName.ctgType,
            parValues: printObject(getCategoryTypes()),
          },
        ),
      },
    ]));

  const realSbcTitle = '😃';
  const cmd_addctg_real_als = `${cmd_addctg} ${realSbcTitle}`;
  it(`"${cmd_addctg_real_als}" should be rejected as of already existing subcategory`, () =>
    testBotMsgsRes([
      {
        toSendText: cmd_addctg_real_als,
        prepareDB: async () => {
          serverNowDate = parseUserDateTimeToUTC(
            '2019.02.09 12:00',
            config.test.user_time_zone,
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

  const descs_addctg_real_1 = [
    { cmdBase: cmd_addctg_real_ctg },
    { cmdBase: cmd_addctg_real_ctg, type: CategoryTypeEnum.numberPositive },
    { cmdBase: cmd_addctg, name: 'DDD', type: CategoryTypeEnum.numberNegative },
    {
      cmdBase: cmd_addctg_real_ctg,
      type: CategoryTypeEnum.text,
      description: 'Hoh ho 2',
    },
    {
      cmdBase: cmd_addctg,
      name: realCtgTitle,
      type: CategoryTypeEnum.text,
      descriptionWord: 'OneWordDescription',
    },
  ];
  for (const desc_addctg_real of descs_addctg_real_1) {
    const { cmdBase, name, type, description, descriptionWord } =
      desc_addctg_real;
    const cmd = type
      ? `${cmdBase} [${CommandParameterName.ctgType}${PARAMS_EQ}${type} ${
          name ? `${CommandParameterName.ctgTitle}${PARAMS_EQ}${name}` : ''
        } ${
          description
            ? `${CommandParameterName.ctgDescription}${PARAMS_EQ}"${description}"`
            : ''
        }
        ${
          descriptionWord
            ? `${CommandParameterName.ctgDescription}${PARAMS_EQ}${descriptionWord}`
            : ''
        }]`
      : cmdBase;
    it(`"${cmd}" should add new category`, () =>
      testBotMsgsRes([
        {
          toSendText: cmd,
          prepareDB: async () => {
            await appBotMock.db.subcategories.deleteAll({
              table_peer_id: chatId,
              peer_id: chatId,
            });
            await appBotMock.db.categories.deleteAll({
              table_peer_id: chatId,
              peer_id: chatId,
            });
          },
          clearDB: async () => {
            const dbCategories = await appBotMock.db.categories.find({
              table_peer_id: chatId,
              title: name ? name : realCtgTitle,
              peer_id: chatId,
            });
            return dbCategories[0];
          },
          toBeText: (_) => `Категория добавлена
Созданные поля:
Имя "${name ? name : realCtgTitle}"
Тип "${type ? type : DEFAULT_CTG_TYPE}"${
            description || descriptionWord
              ? `\nОписание "${description || descriptionWord}"`
              : ''
          }
🆔 "${_[0].clearedData.id}"`,
        },
      ]));
  }
  const description = 'this is category description';
  type DescrParam = {
    paramName: CommandParameterName;
    paramValue: string | CategoryTypeEnum;
  };
  const descs_addctg_real_2 = [
    { cmdBase: cmd_addctg_real_ctg, cmdDescr: '', params: [] },
    {
      cmdBase: cmd_addctg_real_ctg,
      cmdDescr: '',
      params: [
        {
          paramName: CommandParameterName.ctgType,
          paramValue: CategoryTypeEnum.numberPositive,
        },
      ],
    },
    {
      cmdBase: cmd_addctg,
      cmdDescr: '',
      params: [
        {
          paramName: CommandParameterName.ctgType,
          paramValue: CategoryTypeEnum.numberNegative,
        },
        { paramName: CommandParameterName.ctgTitle, paramValue: realCtgTitle },
      ],
    },
    {
      cmdBase: cmd_addctg_real_ctg,
      cmdDescr: '',
      params: [
        {
          paramName: CommandParameterName.ctgType,
          paramValue: CategoryTypeEnum.text,
        },
        {
          paramName: CommandParameterName.ctgDescription,
          paramValue: description,
        },
      ],
    },
  ];
  for (const desc_addctg_real of descs_addctg_real_2) {
    const cmd = `${desc_addctg_real.cmdBase} ${
      desc_addctg_real.params.length
        ? `[ ${desc_addctg_real.params
            .map(
              (par: DescrParam) =>
                `${par.paramName}${PARAMS_EQ}${
                  par.paramName === CommandParameterName.ctgDescription
                    ? `"${par.paramValue}"`
                    : par.paramValue
                }`,
            )
            .join(' ')} ]`
        : ''
    }`;
    const ctgTypeParam = desc_addctg_real.params.find(
      (par) => par.paramName === CommandParameterName.ctgType,
    ) as DescrParam;
    const ctgDescr = desc_addctg_real.params.find(
      (par) => par.paramName === CommandParameterName.ctgDescription,
    )?.paramValue;
    it(`"${cmd}" should be resolved as new category`, () =>
      testBotMsgsRes([
        {
          toSendText: cmd,
          prepareDB: async () => {
            await appBotMock.db.subcategories.deleteAll({
              table_peer_id: chatId,
              peer_id: chatId,
            });
            await appBotMock.db.categories.deleteAll({
              table_peer_id: chatId,
              peer_id: chatId,
            });
          },
          clearDB: async () => {
            const dbCategories = await appBotMock.db.categories.find({
              table_peer_id: chatId,
              title: realCtgTitle,
              peer_id: chatId,
            });
            return dbCategories[0];
          },
          toBeMessage: (_) =>
            new ToTranslate(
              TrKey.RES_CTG_ADDED,
              userLangCode,
              {
                createdFields: generateCategoryCreatedTranslations({
                  categoryId: _[0].clearedData.id,
                  categoryType: ctgTypeParam
                    ? (ctgTypeParam.paramValue as CategoryTypeEnum)
                    : DEFAULT_CTG_TYPE,
                  categoryTitle: realCtgTitle,
                  categoryDescription: ctgDescr,
                  lang: userLangCode,
                }),
              },
              ['createdFields'],
            ),
        },
      ]));
  }

  const amb_name_cmd = `${cmd_addctg} ${realCtgTitle} [${CommandParameterName.ctgTitle}=${realCtgTitle}]`;
  it(`"${amb_name_cmd}" should be rejected as of name parameter and text at the same time`, () =>
    testBotMsgsRes([
      {
        toSendText: amb_name_cmd,
        prepareDB: async () => {
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
            parName: CommandParameterName.ctgTitle,
          },
        ),
      },
    ]));

  const amb_descr_cmd = `${cmd_addctg} ${description} [${CommandParameterName.ctgDescription}="${description}"]`;
  it(`"${amb_descr_cmd}" should be rejected as of description parameter and text at the same time`, () =>
    testBotMsgsRes([
      {
        toSendText: amb_descr_cmd,
        prepareDB: async () => {
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
            parName: CommandParameterName.ctgDescription,
          },
        ),
      },
    ]));

  const longCtgTitle = Array.from(
    { length: MAX_CTG_TITLE_LENGTH + 1 },
    (i, ind) => String(ind).slice(0, 1),
  ).join('');
  const cmd_addctg_long_title = `${cmd_addctg} ${longCtgTitle}`;
  it(`"${cmd_addctg_long_title}" should be rejected as of too long title`, () =>
    testBotMsgsRes([
      {
        toSendText: cmd_addctg_long_title,
        toBeMessage: new ToTranslate(TrKey.CTG_TITLE_MAX_ERROR, userLangCode, {
          max: MAX_CTG_TITLE_LENGTH,
        }),
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
  const cmd_addctg_long_desc = `${cmd_addctg} ${realCtgTitle} ${longCtgDescr}`;
  it(`"${cmd_addctg_long_desc}" should be rejected as of too long description`, () =>
    testBotMsgsRes([
      {
        toSendText: cmd_addctg_long_desc,
        toBeMessage: new ToTranslate(TrKey.CTG_DESC_MAX_ERROR, userLangCode, {
          max: MAX_CTG_DESC_LENGTH,
        }),
      },
    ]));

  afterAll(() => destroyBotMockApp(appBotMock));
});
