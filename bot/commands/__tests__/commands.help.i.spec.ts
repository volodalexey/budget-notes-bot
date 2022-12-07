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
  toCommand,
  BotCommandEnum,
  generateInvInstruction,
  generateHelpInstruction,
  generateFatherInstruction,
  toHelpCmdInstr,
  TrStrCom,
} from '../../helpers';
import { CommandParameterName, PARAMS_EQ } from '../../parameters';

describe('Check help command handlers', () => {
  let appBotMock: AppBotMockI;
  let testBotMsgsRes: PreparedTestBotMessages;
  let userLangCode: LanguageEnum;

  beforeAll(async () => {
    appBotMock = await startBotMockApp();
    userLangCode = appBotMock.userLangCode;
    testBotMsgsRes = CreateMockTestBotMessageResponses({ appBotMock });
  });

  const cmd_help = toCommand(BotCommandEnum.help);
  it(`"${cmd_help}" should print help instruction`, () =>
    testBotMsgsRes([
      {
        toSendText: cmd_help,
        toBeMessage: generateHelpInstruction(userLangCode),
      },
    ]));

  const cmd_help_bot_father = `${cmd_help} [${CommandParameterName.botFather}${PARAMS_EQ}t]`;
  it(`"${cmd_help_bot_father}" should print help instruction for bot father`, () =>
    testBotMsgsRes([
      {
        toSendText: cmd_help_bot_father,
        toBeMessage: generateFatherInstruction(LanguageEnum.English),
      },
    ]));

  const parameter = `${CommandParameterName.botFather}-t`;
  const cmd_help_dup_par = `${cmd_help} ${CommandParameterName.botFather}-t ${parameter} ${parameter}`;
  it(`"${cmd_help_dup_par}" should be rejected as of too many arguments`, () =>
    testBotMsgsRes([
      {
        toSendText: cmd_help_dup_par,
        toBeMessage: generateInvInstruction(
          TrKey.INVALID_HELP_CMD,
          BotCommandEnum.help,
          userLangCode,
        ),
      },
    ]));

  const cmd_help_statsw = `${cmd_help} [${
    CommandParameterName.command
  }${PARAMS_EQ}${TrStrCom(BotCommandEnum.stats)}]`;
  it(`"${cmd_help_statsw}" should print specified command help`, () =>
    testBotMsgsRes([
      {
        toSendText: cmd_help_statsw,
        toBeMessage: toHelpCmdInstr(BotCommandEnum.stats, userLangCode),
      },
    ]));

  const amb_cmd_param = `${cmd_help} ${TrStrCom(BotCommandEnum.listctg)} [${
    CommandParameterName.command
  }=${TrStrCom(BotCommandEnum.listnt)}]`;
  it(`"${amb_cmd_param}" should be rejected as of cmd parameter and command text at the same time`, () =>
    testBotMsgsRes([
      {
        toSendText: amb_cmd_param,
        toBeMessage: new ToTranslate(
          TrKey.PARAM_AMBIGUOUS_ERROR,
          userLangCode,
          {
            parName: CommandParameterName.command,
          },
        ),
      },
    ]));

  const cmdsToCheck = [
    BotCommandEnum.help,
    // categories
    BotCommandEnum.addctg,
    BotCommandEnum.listctg,
    BotCommandEnum.updctgn,
    BotCommandEnum.updctgd,
    BotCommandEnum.delctg,
    BotCommandEnum.undodelctg,
    BotCommandEnum.archctg,
    BotCommandEnum.undoarchctg,
    // subcategories
    BotCommandEnum.addsbc,
    BotCommandEnum.listsbc,
    BotCommandEnum.updsbcn,
    BotCommandEnum.updsbcd,
    BotCommandEnum.delsbc,
    BotCommandEnum.undodelsbc,
    BotCommandEnum.archsbc,
    BotCommandEnum.undoarchsbc,
    // notes
    BotCommandEnum.addnt,
    BotCommandEnum.listnt,
    BotCommandEnum.updnt,
    BotCommandEnum.trnsnt,
    BotCommandEnum.trnsnts,
    BotCommandEnum.delnt,
    BotCommandEnum.undodelnt,
    BotCommandEnum.archnt,
    BotCommandEnum.undoarchnt,
    // statistic
    BotCommandEnum.stats,
    // common
    BotCommandEnum.setlang,
    BotCommandEnum.settimezone,
    BotCommandEnum.setweekstartson,
    BotCommandEnum.settings,
  ];
  const appendToCmd = ['', '-', '--'];
  for (const cmdToCheck of cmdsToCheck) {
    for (const append of appendToCmd) {
      const cmd = `${toCommand(cmdToCheck)} ${append}help`;
      it(`"${cmd}" should print command help`, () =>
        testBotMsgsRes([
          {
            toSendText: cmd,
            toBeMessage: toHelpCmdInstr(cmdToCheck, userLangCode),
          },
        ]));
    }
  }

  afterAll(() => destroyBotMockApp(appBotMock));
});
