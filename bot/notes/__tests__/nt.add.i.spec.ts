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
} from '../../../db/models/categoryModel';
import { checkAddSubcategory } from '../../../db/models/subcategoryModel';
import {
  MIN_NUMBER,
  MAX_NUMBER,
  MAX_NOTE_TEXT_LENGTH,
  generateNoteCreatedTranslations,
} from '../../../db/models/noteModel';

import { prinDateTime } from '../../print';
import { CommandParameterName, PARAMS_EQ } from '../../parameters';
import { parseUserDateTimeToUTC, setDTDate } from '../../datetime';
import {
  BotCommandEnum,
  generateInvInstruction,
  toCommand,
} from '../../helpers';

describe('Check add notes command handlers', () => {
  let appBotMock: AppBotMockI;
  let testBotMsgsRes: PreparedTestBotMessages;
  let userLangCode: LanguageEnum;
  let userTimeZone: string;
  let chatId: number;
  let userIdStr: string;

  beforeAll(async () => {
    appBotMock = await startBotMockApp();
    userLangCode = appBotMock.userLangCode;
    userTimeZone = appBotMock.userTimeZone;
    chatId = appBotMock.chatId;
    userIdStr = appBotMock.user.id;
    testBotMsgsRes = CreateMockTestBotMessageResponses({ appBotMock });
  });

  const cmd_addnt = toCommand(BotCommandEnum.addnt);
  it(`"${cmd_addnt}" should be rejected without arguments`, () =>
    testBotMsgsRes([
      {
        toSendText: cmd_addnt,
        toBeMessage: generateInvInstruction(
          TrKey.INVALID_ADD_NT_CMD,
          BotCommandEnum.addnt,
          userLangCode,
        ),
      },
    ]));

  const fakeCtgTitle = 'fakeCtgTitle';
  const fakeSbcTitle = 'fakeSbcTitle';
  for (const msg_add_nt of [
    { cmd: `${fakeCtgTitle} 35`, isSbc: false },
    { cmd: `${fakeSbcTitle} as sd as asdf s`, isSbc: true },
    { cmd: `${cmd_addnt} ${fakeCtgTitle} 35`, isSbc: false },
    { cmd: `${cmd_addnt} ${fakeSbcTitle} as sd as asdf s`, isSbc: true },
  ]) {
    it(`"${msg_add_nt.cmd}" should be rejected as none existing categories or subcategories`, () =>
      testBotMsgsRes([
        {
          toSendText: msg_add_nt.cmd,
          prepareDB: async () => {
            await appBotMock.db.categories.deleteAll({
              table_peer_id: chatId,
              peer_id: chatId,
            });
          },
          toBeMessage: new ToTranslate(
            TrKey.CATEGORY_OR_SUBCTG_NOT_EXIST,
            userLangCode,
            {
              title: msg_add_nt.isSbc ? fakeSbcTitle : fakeCtgTitle,
            },
          ),
        },
      ]));
  }

  const realCtgTitle = 'realCtgTitle';
  const realSbcTitle = '😴';

  const descrs_addnt = [
    {
      expectNum: '-15',
      cmdBase: `${realCtgTitle} 15`,
      ctgType: CategoryTypeEnum.numberNegative,
      isSbc: false,
    },
    {
      expectNum: '114',
      cmdBase: `${realSbcTitle} 114.000 this is description`,
      expectText: `this is description`,
      ctgType: CategoryTypeEnum.numberPositive,
      isSbc: true,
    },
    {
      expectNum: '-1243.269',
      cmdBase: `${realCtgTitle} -1243.269`,
      ctgType: CategoryTypeEnum.numberPositive,
      isSbc: false,
    },
    {
      expectNum: '612.412',
      cmdBase: `${realSbcTitle} +612,412 дополнительное описание`,
      expectText: `дополнительное описание`,
      ctgType: CategoryTypeEnum.numberPositive,
      isSbc: true,
    },
    {
      expectText: 'привет, это моя запись',
      cmdBase: `${realCtgTitle} привет, это моя запись`,
      ctgType: CategoryTypeEnum.text,
      isSbc: false,
    },
    {
      expectText: 'Срочно в номер!!',
      cmdBase: `${realSbcTitle} Срочно в номер!!`,
      ctgType: CategoryTypeEnum.text,
      isSbc: true,
    },
  ];
  for (const descr_addnt of descrs_addnt) {
    const { cmdBase, expectNum, expectText, ctgType, isSbc } = descr_addnt;
    for (const prepend of ['', `${cmd_addnt} `]) {
      const cmd = prepend + cmdBase;
      it(`"${cmd}" should add simple note`, () =>
        testBotMsgsRes([
          {
            toSendText: cmd,
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
                  category_type: ctgType,
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
                    noteNumber: expectNum,
                    noteText: expectText,
                    lang: userLangCode,
                    timeZone: userTimeZone,
                    categoryTitle: realCtgTitle,
                    categoryType: ctgType,
                    subcategoryTitle: isSbc ? realSbcTitle : undefined,
                  }),
                },
                ['futureDateMsg', 'createdFields'],
              ),
          },
        ]));
    }
  }

  for (const msg_add_nt of [
    { cmdBase: `${realCtgTitle} 5b`, expectNum: '5b' },
    { cmdBase: `${realSbcTitle} 5e605`, expectNum: '5e605' },
    { cmdBase: `${realSbcTitle} ц7 ыщьу вуыскшзешщт`, expectNum: 'ц7' },
  ]) {
    const { cmdBase, expectNum } = msg_add_nt;
    for (const prepend of ['', `${cmd_addnt} `]) {
      const cmd = prepend + cmdBase;
      it(`"${cmd}" should reject note as of number parse error`, () =>
        testBotMsgsRes([
          {
            toSendText: cmd,
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
            toBeMessage: new ToTranslate(
              TrKey.NOTE_NUMBER_FLOAT_ERROR,
              userLangCode,
              {
                number: expectNum,
              },
            ),
          },
        ]));
    }
  }

  for (const msg_add_nt of [
    `${realCtgTitle} ${MAX_NUMBER + 1}`,
    `${realSbcTitle} ${MIN_NUMBER - 1}`,
    `${realSbcTitle} ${MIN_NUMBER - 1} ыщьу вуыскшзешщт`,
  ]) {
    for (const prepend of ['', `${cmd_addnt} `]) {
      const cmd = prepend + msg_add_nt;
      it(`"${cmd}" should reject note as of number range error`, () =>
        testBotMsgsRes([
          {
            toSendText: cmd,
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
    }
  }

  const floatNum = '456,12358762513213598';
  const msg_addnt_float = `${realSbcTitle} ${floatNum}`;
  for (const prepend of ['', `${cmd_addnt} `]) {
    const cmd = prepend + msg_addnt_float;
    it(`"${cmd}" should reject note as of too many decimal points`, () =>
      testBotMsgsRes([
        {
          toSendText: cmd,
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
          toBeMessage: new ToTranslate(
            TrKey.NOTE_NUMBER_FLOAT_ERROR,
            userLangCode,
            {
              number: floatNum.replace(',', '.'),
            },
          ),
        },
      ]));
  }

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
  const msgs_addnt_lond_text = [
    `${realCtgTitle} 33 ${longNoteText}`,
    `${realSbcTitle} ${longNoteText}`,
  ];
  const realCtgTitle2 = 'realCtgTitle2';
  for (const msg_addnt_lond_text of msgs_addnt_lond_text) {
    for (const prepend of ['', `${cmd_addnt} `]) {
      const cmd = prepend + msg_addnt_lond_text;
      it(`"${cmd}" should be rejected as of too long note text`, () =>
        testBotMsgsRes([
          {
            toSendText: cmd,
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
              await appBotMock.db.categories.add(
                { table_peer_id: chatId },
                composeAddCategory({
                  title: realCtgTitle,
                  peer_id: chatId,
                  created_by_user_id: userIdStr,
                }),
              );
              const dbCategory2 = await appBotMock.db.categories.add(
                { table_peer_id: chatId },
                composeAddCategory({
                  title: realCtgTitle2,
                  peer_id: chatId,
                  created_by_user_id: userIdStr,
                  category_type: CategoryTypeEnum.text,
                }),
              );
              await appBotMock.db.subcategories.add(
                { table_peer_id: chatId },
                checkAddSubcategory({
                  title: realSbcTitle,
                  peer_id: chatId,
                  category_id: dbCategory2.id,
                  created_by_user_id: userIdStr,
                }),
              );
            },
            toBeMessage: new ToTranslate(
              TrKey.NOTE_TEXT_MAX_ERROR,
              userLangCode,
              {
                max: MAX_NOTE_TEXT_LENGTH,
                count: longNoteText.length,
              },
            ),
          },
        ]));
    }
  }

  const srvNowDate = `2021.12.12 10:30`;
  const nt_number = `33`;
  const almost_max_text = Array.from(
    { length: MAX_NOTE_TEXT_LENGTH + 2 - nt_number.length },
    (_, ind) => {
      if (ind === 0) {
        return 's';
      } else if (ind === MAX_NOTE_TEXT_LENGTH) {
        return 'e';
      } else {
        return Math.random() > 0.5 ? String(ind).slice(0, 1) : ' ';
      }
    },
  ).join('');
  const cmd_addnt_almost_max_text = `${realCtgTitle} ${nt_number} ${almost_max_text}`;
  for (const prepend of ['', `${cmd_addnt} `]) {
    const cmd = prepend + cmd_addnt_almost_max_text;
    it(`"${cmd}" should add note with almost full text message`, () =>
      testBotMsgsRes([
        {
          toSendText: cmd,
          prepareDB: async () => {
            const serverNowDate = parseUserDateTimeToUTC(
              srvNowDate,
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
            await appBotMock.db.categories.add(
              { table_peer_id: chatId },
              composeAddCategory({
                title: realCtgTitle,
                peer_id: chatId,
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
                  noteNumber: _[0].clearedData[0].note_number,
                  noteText: _[0].clearedData[0].note_text,
                  lang: userLangCode,
                  timeZone: userTimeZone,
                  categoryTitle: realCtgTitle,
                  categoryType: _[0].clearedData[0].category_type,
                  subcategoryTitle: _[0].clearedData[0].subcategory_title,
                }),
              },
              ['futureDateMsg', 'createdFields'],
            ),
        },
      ]));
  }

  const descrs_date_addnt = [
    {
      expectNum: '-15',
      cmdBase: `${realCtgTitle} 15 [${CommandParameterName.date}${PARAMS_EQ}2019.02.10 ${CommandParameterName.time}${PARAMS_EQ}14:30]`,
      ctgType: CategoryTypeEnum.numberNegative,
      expectText: '',
      isSbc: false,
    },
    {
      expectNum: '114',
      cmdBase: `${realSbcTitle} 114.000 [${CommandParameterName.date}${PARAMS_EQ}2019.02.10 ${CommandParameterName.time}${PARAMS_EQ}14:30] this is description`,
      expectText: `this is description`,
      ctgType: CategoryTypeEnum.numberPositive,
      isSbc: true,
    },
    {
      expectNum: '-1243.269',
      cmdBase: `${realCtgTitle} -1243.269 [${CommandParameterName.date}${PARAMS_EQ}2019.02.10 ${CommandParameterName.time}${PARAMS_EQ}14:30]`,
      ctgType: CategoryTypeEnum.numberPositive,
      isSbc: false,
    },
    {
      expectNum: '612.412',
      cmdBase: `${realSbcTitle} +612,412 [${CommandParameterName.date}${PARAMS_EQ}2019.02.10 ${CommandParameterName.time}${PARAMS_EQ}14:30] дополнительное описание`,
      expectText: `дополнительное описание`,
      ctgType: CategoryTypeEnum.numberPositive,
      isSbc: true,
    },
    {
      expectNum: '-15',
      cmdBase: `${realCtgTitle} 15 [${CommandParameterName.date}${PARAMS_EQ}2019.02.10]`,
      ctgType: CategoryTypeEnum.numberNegative,
      isSbc: false,
    },
    {
      expectNum: '114',
      cmdBase: `${realSbcTitle} 114.000 [${CommandParameterName.date}${PARAMS_EQ}2019.02.10] this is description`,
      expectText: `this is description`,
      ctgType: CategoryTypeEnum.numberPositive,
      isSbc: true,
    },
    {
      expectNum: '-1243.269',
      cmdBase: `${realCtgTitle} -1243.269 [${CommandParameterName.date}${PARAMS_EQ}2019.02.10]`,
      ctgType: CategoryTypeEnum.numberPositive,
      isSbc: false,
    },
    {
      expectNum: '612.412',
      cmdBase: `${realSbcTitle} +612,412 [${CommandParameterName.date}${PARAMS_EQ}2019.02.10] дополнительное описание`,
      expectText: `дополнительное описание`,
      ctgType: CategoryTypeEnum.numberPositive,
      isSbc: true,
    },
    {
      expectNum: '-15',
      cmdBase: `${realCtgTitle} 15 [${CommandParameterName.time}${PARAMS_EQ}14:30]`,
      ctgType: CategoryTypeEnum.numberNegative,
      isSbc: false,
    },
    {
      expectNum: '114',
      cmdBase: `${realSbcTitle} 114.000 [${CommandParameterName.time}${PARAMS_EQ}14:30] this is description`,
      expectText: `this is description`,
      ctgType: CategoryTypeEnum.numberPositive,
      isSbc: true,
    },
    {
      expectNum: '-1243.269',
      cmdBase: `${realCtgTitle} -1243.269 [${CommandParameterName.time}${PARAMS_EQ}14:30]`,
      ctgType: CategoryTypeEnum.numberPositive,
      isSbc: false,
    },
    {
      expectNum: '612.412',
      cmdBase: `${realSbcTitle} +612,412 [${CommandParameterName.time}${PARAMS_EQ}14:30] дополнительное описание`,
      expectText: `дополнительное описание`,
      ctgType: CategoryTypeEnum.numberPositive,
      isSbc: true,
    },
    {
      expectText: 'привет, это моя запись',
      cmdBase: `${realCtgTitle} [${CommandParameterName.date}${PARAMS_EQ}2019.02.10 ${CommandParameterName.time}${PARAMS_EQ}14:30] привет, это моя запись`,
      ctgType: CategoryTypeEnum.text,
      isSbc: false,
    },
    {
      expectText: 'Срочно в номер!!',
      cmdBase: `${realSbcTitle} [${CommandParameterName.date}${PARAMS_EQ}2019.02.10 ${CommandParameterName.time}${PARAMS_EQ}14:30] Срочно в номер!!`,
      ctgType: CategoryTypeEnum.text,
      isSbc: true,
    },
    {
      expectText: 'привет, это моя запись',
      cmdBase: `${realCtgTitle} [${CommandParameterName.date}${PARAMS_EQ}2019.02.10] привет, это моя запись`,
      ctgType: CategoryTypeEnum.text,
      isSbc: false,
    },
    {
      expectText: 'Срочно в номер!!',
      cmdBase: `${realSbcTitle} [${CommandParameterName.date}${PARAMS_EQ}2019.02.10] Срочно в номер!!`,
      ctgType: CategoryTypeEnum.text,
      isSbc: true,
    },
    {
      expectText: 'привет, это моя запись',
      cmdBase: `${realCtgTitle} [${CommandParameterName.time}${PARAMS_EQ}14:30] привет, это моя запись`,
      ctgType: CategoryTypeEnum.text,
      isSbc: false,
    },
    {
      expectText: 'Срочно в номер!!',
      cmdBase: `${realSbcTitle} [${CommandParameterName.time}${PARAMS_EQ}14:30] Срочно в номер!!`,
      ctgType: CategoryTypeEnum.text,
      isSbc: true,
    },
  ];
  for (const descr_addnt of descrs_date_addnt) {
    const { cmdBase, expectNum, expectText, ctgType, isSbc } = descr_addnt;
    for (const prepend of ['', `${cmd_addnt} `]) {
      const cmd = prepend + cmdBase;
      it(`"${cmd}" should add note`, () =>
        testBotMsgsRes([
          {
            toSendText: cmd,
            prepareDB: async () => {
              const serverNowDate = parseUserDateTimeToUTC(
                `2020.02.02 18:30`,
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
              const dbCategory = await appBotMock.db.categories.add(
                { table_peer_id: chatId },
                composeAddCategory({
                  title: realCtgTitle,
                  peer_id: chatId,
                  created_by_user_id: userIdStr,
                  category_type: ctgType,
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
                    noteNumber: expectNum,
                    noteText: expectText,
                    lang: userLangCode,
                    timeZone: userTimeZone,
                    categoryTitle: realCtgTitle,
                    categoryType: ctgType,
                    subcategoryTitle: isSbc ? realSbcTitle : undefined,
                  }),
                },
                ['futureDateMsg', 'createdFields'],
              ),
          },
        ]));
    }
  }

  const msgs_addnt_number_time_failure2 = [
    {
      cmdBase: `${realCtgTitle} 15 дополнительное описание [${CommandParameterName.date}${PARAMS_EQ}2019.02.10 ${CommandParameterName.time}${PARAMS_EQ}14:30]`,
      ctgType: CategoryTypeEnum.numberNegative,
      isSbc: false,
      expectNum: '-15',
      expectText: 'дополнительное описание',
    },
    {
      cmdBase: `${realCtgTitle} 15 дополнительное [${CommandParameterName.date}${PARAMS_EQ}2019.02.10 ${CommandParameterName.time}${PARAMS_EQ}14:30] описание`,
      ctgType: CategoryTypeEnum.numberNegative,
      isSbc: false,
      expectNum: '-15',
      expectText: 'дополнительное  описание',
    },
    {
      cmdBase: `${realSbcTitle} 15 дополнительное описание [${CommandParameterName.date}${PARAMS_EQ}2019.02.10 ${CommandParameterName.time}${PARAMS_EQ}14:30]`,
      ctgType: CategoryTypeEnum.numberNegative,
      isSbc: true,
      expectNum: '-15',
      expectText: 'дополнительное описание',
    },
    {
      cmdBase: `${realSbcTitle} 15 дополнительное [${CommandParameterName.date}${PARAMS_EQ}2019.02.10 ${CommandParameterName.time}${PARAMS_EQ}14:30] описание`,
      ctgType: CategoryTypeEnum.numberNegative,
      isSbc: true,
      expectNum: '-15',
      expectText: 'дополнительное  описание',
    },
  ];
  for (const msg_addnt_number_time_failure2 of msgs_addnt_number_time_failure2) {
    const { cmdBase, ctgType, isSbc, expectNum, expectText } =
      msg_addnt_number_time_failure2;
    for (const prepend of ['', `${cmd_addnt} `]) {
      const cmd = prepend + cmdBase;
      it(`"${cmd}" should add number note`, () =>
        testBotMsgsRes([
          {
            toSendText: cmd,
            prepareDB: async () => {
              const serverNowDate = parseUserDateTimeToUTC(
                `2020.02.02 11:30`,
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
              const dbCategory = await appBotMock.db.categories.add(
                { table_peer_id: chatId },
                composeAddCategory({
                  title: realCtgTitle,
                  peer_id: chatId,
                  created_by_user_id: userIdStr,
                  category_type: ctgType,
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
                    noteNumber: expectNum,
                    noteText: expectText,
                    lang: userLangCode,
                    timeZone: userTimeZone,
                    categoryTitle: realCtgTitle,
                    categoryType: ctgType,
                    subcategoryTitle: isSbc ? realSbcTitle : undefined,
                  }),
                },
                ['futureDateMsg', 'createdFields'],
              ),
          },
        ]));
    }
  }

  const msgs_addnt_text = [
    {
      cmdBase: `${realCtgTitle} привет, это моя запись [${CommandParameterName.date}${PARAMS_EQ}2019.02.10 ${CommandParameterName.time}${PARAMS_EQ}14:30]`,
      ctgType: CategoryTypeEnum.text,
      isSbc: false,
      expectText: 'привет, это моя запись',
    },
    {
      cmdBase: `${realCtgTitle} привет, это [${CommandParameterName.date}${PARAMS_EQ}2019.02.10 ${CommandParameterName.time}${PARAMS_EQ}14:30] моя запись`,
      ctgType: CategoryTypeEnum.text,
      isSbc: false,
      expectText: 'привет, это  моя запись',
    },
    {
      cmdBase: `${realSbcTitle} привет, это моя запись [${CommandParameterName.date}${PARAMS_EQ}2019.02.10 ${CommandParameterName.time}${PARAMS_EQ}14:30]`,
      ctgType: CategoryTypeEnum.text,
      isSbc: true,
      expectText: 'привет, это моя запись',
    },
    {
      cmdBase: `${realSbcTitle} привет, это [${CommandParameterName.datetime}${PARAMS_EQ}"2019.02.10 14:30"] моя запись`,
      ctgType: CategoryTypeEnum.text,
      isSbc: true,
      expectText: 'привет, это  моя запись',
    },
  ];
  for (const msg_addnt_text of msgs_addnt_text) {
    const { cmdBase, ctgType, isSbc, expectText } = msg_addnt_text;
    for (const prepend of ['', `${cmd_addnt} `]) {
      const cmd = prepend + cmdBase;
      it(`"${cmd}" should add text note with date and time parameters`, () =>
        testBotMsgsRes([
          {
            toSendText: cmd,
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
                  category_type: ctgType,
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
                    noteText: expectText,
                    lang: userLangCode,
                    timeZone: userTimeZone,
                    categoryTitle: realCtgTitle,
                    categoryType: ctgType,
                    subcategoryTitle: isSbc ? realSbcTitle : undefined,
                  }),
                },
                ['futureDateMsg', 'createdFields'],
              ),
          },
        ]));
    }
  }

  const msgs_addnt_rd = [
    {
      cmdBase: `${realCtgTitle} привет, это моя запись [${CommandParameterName.relativeDay}${PARAMS_EQ}-1]`,
      isSbc: false,
      ctgType: CategoryTypeEnum.text,
      expectText: 'привет, это моя запись',
      startDate: '2021.11.21 10:30',
      checkDate: '2021.11.20 10:30',
      futureDateMsg: false,
    },
    {
      cmdBase: `${realCtgTitle} привет2, это моя запись [${CommandParameterName.relativeDay}${PARAMS_EQ}+3 ${CommandParameterName.time}${PARAMS_EQ}14:55]`,
      isSbc: false,
      ctgType: CategoryTypeEnum.text,
      expectText: 'привет2, это моя запись',
      startDate: '2021.11.10 10:30',
      checkDate: '2021.11.13 14:55',
      futureDateMsg: true,
    },
    {
      cmdBase: `${realCtgTitle} привет3, это моя запись [${CommandParameterName.relativeDay}${PARAMS_EQ}31 ${CommandParameterName.time}${PARAMS_EQ}17:55:12]`,
      isSbc: false,
      ctgType: CategoryTypeEnum.text,
      expectText: 'привет3, это моя запись',
      startDate: '2021.12.11 10:30',
      checkDate: '2021.12.31 17:55:12',
      futureDateMsg: true,
    },
  ];
  for (const msg_addnt_rd of msgs_addnt_rd) {
    const {
      cmdBase,
      ctgType,
      isSbc,
      expectText,
      startDate,
      checkDate,
      futureDateMsg,
    } = msg_addnt_rd;
    for (const prepend of ['', `${cmd_addnt} `]) {
      const cmd = prepend + cmdBase;
      it(`"${cmd}" should add text note with ralative day parameter`, () =>
        testBotMsgsRes([
          {
            toSendText: cmd,
            prepareDB: async () => {
              const serverNowDate = parseUserDateTimeToUTC(
                startDate,
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
              const dbCategory = await appBotMock.db.categories.add(
                { table_peer_id: chatId },
                composeAddCategory({
                  title: realCtgTitle,
                  peer_id: chatId,
                  created_by_user_id: userIdStr,
                  category_type: ctgType,
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
                  futureDateMsg: futureDateMsg
                    ? new ToTranslate(
                        TrKey.NOTE_FUTURE_DATE_WARNING,
                        userLangCode,
                      )
                    : '',
                  createdFields: generateNoteCreatedTranslations({
                    noteId: _[0].clearedData[0].id,
                    noteDatetime: _[0].clearedData[0].datetime,
                    noteText: expectText,
                    lang: userLangCode,
                    timeZone: userTimeZone,
                    categoryTitle: realCtgTitle,
                    categoryType: ctgType,
                    subcategoryTitle: isSbc ? realSbcTitle : undefined,
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
                expect(dbNote).toHaveProperty(
                  'datetime',
                  parseUserDateTimeToUTC(checkDate, userTimeZone),
                );
              },
            ],
          },
        ]));
    }
  }

  const msgs_addnt_rd_failure = [
    {
      cmdBase: `${realCtgTitle} [${CommandParameterName.relativeDay}${PARAMS_EQ}0]`,
      startDate: '2021.12.12 10:30',
      rdError: '0',
    },
    {
      cmdBase: `${realCtgTitle} [${CommandParameterName.relativeDay}${PARAMS_EQ}32]`,
      startDate: '2021.11.20 10:30',
      rdError: '32',
    },
    {
      cmdBase: `${realCtgTitle} [${CommandParameterName.relativeDay}${PARAMS_EQ}29]`,
      startDate: '2022.02.10 10:30',
      rdError: '29',
    },
  ];
  for (const msg_addnt_rd_failure of msgs_addnt_rd_failure) {
    const { cmdBase, startDate, rdError } = msg_addnt_rd_failure;
    for (const prepend of ['', `${cmd_addnt} `]) {
      const cmd = prepend + cmdBase;
      it(`"${cmd}" should reject provided invalid note day of month`, () =>
        testBotMsgsRes([
          {
            toSendText: cmd,
            prepareDB: async () => {
              const serverNowDate = parseUserDateTimeToUTC(
                startDate,
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
            },
            toBeMessage: () =>
              new ToTranslate(TrKey.RELATIVE_DAY_OF_MONTH_ERROR, userLangCode, {
                relativeDay: rdError,
              }),
          },
        ]));
    }
  }

  const cmd_amb_ctg_title = `${realCtgTitle} [${CommandParameterName.ctgTitle}=${realCtgTitle}] 123`;
  for (const prepend of ['', `${cmd_addnt} `]) {
    const cmd = prepend + cmd_amb_ctg_title;
    it(`"${cmd}" should be rejected as of ctg title parameter and text at the same time`, () =>
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
          toBeMessage: new ToTranslate(
            TrKey.PARAM_AMBIGUOUS_ERROR,
            userLangCode,
            {
              parName: CommandParameterName.ctgTitle,
            },
          ),
        },
      ]));
  }

  const cmd_amb_sbc_title = `${realCtgTitle} [${CommandParameterName.sbcTitle}=${realSbcTitle}] 123`;
  for (const prepend of ['', `${cmd_addnt} `]) {
    const cmd = prepend + cmd_amb_sbc_title;
    it(`"${cmd}" should be rejected as of ctg title parameter and text at the same time`, () =>
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
          toBeMessage: new ToTranslate(
            TrKey.PARAM_AMBIGUOUS_ERROR,
            userLangCode,
            {
              parName: CommandParameterName.sbcTitle,
            },
          ),
        },
      ]));
  }

  const msgs_cmd_addnt_future = [
    {
      cmd: `${cmd_addnt} [${CommandParameterName.ctgTitle}${PARAMS_EQ}${realCtgTitle} ${CommandParameterName.relativeDay}${PARAMS_EQ}+1 ${CommandParameterName.ntNumber}${PARAMS_EQ}112]`,
      expectNum: '+112',
      expectCtgTitle: realCtgTitle,
    },
    {
      cmd: `${cmd_addnt} ${realCtgTitle} 112 [${CommandParameterName.relativeDay}${PARAMS_EQ}+1]`,
      expectNum: '+112',
      expectCtgTitle: realCtgTitle,
    },
  ];
  for (const msg_cmd_addnt_future of msgs_cmd_addnt_future) {
    const { cmd, expectNum, expectCtgTitle } = msg_cmd_addnt_future;
    it(`"${cmd}" should show warning for future note date`, () =>
      testBotMsgsRes([
        {
          toSendText: cmd,
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
            return dbCategory;
          },
          clearDB: () =>
            appBotMock.db.notes.listJoinCtgSbc({
              table_peer_id: chatId,
              peer_id: chatId,
            }),
          toBeText: (_) => `⚠ Внимание, запись имеет будущую дату!
Запись добавлена
Созданные поля:
Число "${expectNum}"
Категория "${expectCtgTitle}"
Дата и время "${prinDateTime(_[0].clearedData[0].datetime, userTimeZone)}"
🆔 "${_[0].clearedData[0].id}"`,
        },
      ]));
  }

  const msgs_addnt_full = [
    {
      cmd: `${realSbcTitle} 234 привет, это моя запись [${CommandParameterName.date}${PARAMS_EQ}2019.02.10 ${CommandParameterName.time}${PARAMS_EQ}14:30]`,
      ctgType: CategoryTypeEnum.numberPositive,
      expectCtgTitle: realCtgTitle,
      expectText: 'привет, это моя запись',
      expectNum: '+234',
      expectSbcTitle: realSbcTitle,
    },
    {
      cmd: `${realSbcTitle} 234 [${CommandParameterName.ntText}${PARAMS_EQ}"привет, это моя запись" ${CommandParameterName.date}${PARAMS_EQ}2019.02.10 ${CommandParameterName.time}${PARAMS_EQ}14:30]`,
      ctgType: CategoryTypeEnum.numberPositive,
      expectCtgTitle: realCtgTitle,
      expectText: 'привет, это моя запись',
      expectNum: '+234',
      expectSbcTitle: realSbcTitle,
    },
    {
      cmd: `${realSbcTitle} [${CommandParameterName.ntNumber}${PARAMS_EQ}234 ${CommandParameterName.ntText}${PARAMS_EQ}"привет, это моя запись" ${CommandParameterName.date}${PARAMS_EQ}2019.02.10 ${CommandParameterName.time}${PARAMS_EQ}14:30]`,
      ctgType: CategoryTypeEnum.numberPositive,
      expectCtgTitle: realCtgTitle,
      expectText: 'привет, это моя запись',
      expectNum: '+234',
      expectSbcTitle: realSbcTitle,
    },
    {
      cmd: `${cmd_addnt} [${CommandParameterName.sbcTitle}${PARAMS_EQ}${realSbcTitle} ${CommandParameterName.ntNumber}${PARAMS_EQ}234 ${CommandParameterName.ntText}${PARAMS_EQ}"привет, это моя запись" ${CommandParameterName.date}${PARAMS_EQ}2019.02.10 ${CommandParameterName.time}${PARAMS_EQ}14:30]`,
      ctgType: CategoryTypeEnum.numberPositive,
      expectCtgTitle: realCtgTitle,
      expectText: 'привет, это моя запись',
      expectNum: '+234',
      expectSbcTitle: realSbcTitle,
    },
    {
      cmd: `${cmd_addnt} [${CommandParameterName.ctgId}${PARAMS_EQ}{{ctgId}} ${CommandParameterName.ntText}${PARAMS_EQ}"привет, это моя запись" ${CommandParameterName.date}${PARAMS_EQ}2019.02.10 ${CommandParameterName.time}${PARAMS_EQ}14:30]`,
      ctgType: CategoryTypeEnum.text,
      expectCtgTitle: realCtgTitle,
      expectText: 'привет, это моя запись',
      expectNum: undefined,
      expectSbcTitle: undefined,
    },
    {
      cmd: `${cmd_addnt} [${CommandParameterName.sbcId}${PARAMS_EQ}{{sbcId}} ${CommandParameterName.ntText}${PARAMS_EQ}"привет, это моя запись" ${CommandParameterName.date}${PARAMS_EQ}2019.02.10 ${CommandParameterName.time}${PARAMS_EQ}14:30]`,
      ctgType: CategoryTypeEnum.text,
      expectCtgTitle: realCtgTitle,
      expectText: 'привет, это моя запись',
      expectNum: undefined,
      expectSbcTitle: realSbcTitle,
    },
  ];
  for (const msg_addnt_full of msgs_addnt_full) {
    const {
      cmd,
      ctgType,
      expectCtgTitle,
      expectText,
      expectNum,
      expectSbcTitle,
    } = msg_addnt_full;
    it(`"${cmd}" should add text note with date and time parameters`, () =>
      testBotMsgsRes([
        {
          toSendText: (_, { dbCtg, dbSbc }) =>
            cmd.replace('{{ctgId}}', dbCtg.id).replace('{{sbcId}}', dbSbc.id),
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
                category_type: ctgType,
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
            return { dbCtg, dbSbc };
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
                  noteText: expectText,
                  noteNumber: expectNum,
                  lang: userLangCode,
                  timeZone: userTimeZone,
                  categoryTitle: expectCtgTitle,
                  categoryType: ctgType,
                  subcategoryTitle: expectSbcTitle,
                }),
              },
              ['futureDateMsg', 'createdFields'],
            ),
        },
      ]));
  }

  afterAll(() => destroyBotMockApp(appBotMock));
});
