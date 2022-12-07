import { TrKey } from '../../i18n/keys';
import { ToTranslate } from '../../i18n/i18n';
import { BotCommandEnum, getBotCommands, TrStrCom } from '../helpers';
import {
  CommandParameterName,
  detectCMDHelpParameters,
  PARAMS_EQ,
} from '../parameters';
import { printObject } from '../print';
import { createAppTestConfig } from '../../config/config';

describe('Check help command parameters parser', () => {
  const {
    test: { user_language, user_time_zone },
  } = createAppTestConfig();
  const msg1 = `hoho ho1 [${CommandParameterName.botFather}${PARAMS_EQ}hello] fff... `;
  test(`${msg1} should be rejected as not valid boolean show del flag`, () => {
    const ret = detectCMDHelpParameters(msg1, user_language, user_time_zone);

    expect(ret).toStrictEqual(
      new ToTranslate(TrKey.PARAM_TYPE_BOOL_ERROR, user_language, {
        parName: 'bf',
        parValue: 'hello',
      }),
    );
  });

  const msg2 = ` [${CommandParameterName.command}${PARAMS_EQ}${TrStrCom(
    BotCommandEnum.listnt,
  )}-]`;
  it(`"${msg2}" should be rejected as not valid command`, () => {
    const ret = detectCMDHelpParameters(msg2, user_language, user_time_zone);

    expect(ret).toStrictEqual(
      new ToTranslate(TrKey.PARAM_TYPE_STR_MATCH_ERROR, user_language, {
        parName: 'cmd',
        parValues: printObject(getBotCommands()),
      }),
    );
  });
});
