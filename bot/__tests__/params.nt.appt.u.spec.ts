import { TrKey } from '../../i18n/keys';
import { ToTranslate } from '../../i18n/i18n';
import { BotCommandEnum, toCommand } from '../helpers';
import {
  CommandParameterName,
  detectCMDNtAppendTextParams,
  PARAMS_EQ,
} from '../parameters';
import { createAppTestConfig } from '../../config/config';

describe('Check append note text command parameters parser', () => {
  const {
    test: { user_language, user_time_zone },
  } = createAppTestConfig();
  const cmd_appntt = toCommand(BotCommandEnum.appntt);

  const msgs_appntt_id_failure = [
    {
      cmd: `${cmd_appntt} [${CommandParameterName.ntId}${PARAMS_EQ}66..]`,
      errorIdStr: '66..',
    },
    {
      cmd: `${cmd_appntt} [${CommandParameterName.ntId}${PARAMS_EQ}66,]`,
      errorIdStr: '66,',
    },
    {
      cmd: `${cmd_appntt} [${CommandParameterName.ntId}${PARAMS_EQ}66,,]`,
      errorIdStr: '66,,',
    },
    {
      cmd: `${cmd_appntt} [${CommandParameterName.ntId}${PARAMS_EQ}6,4]`,
      errorIdStr: '6,4',
    },
    {
      cmd: `${cmd_appntt} [${CommandParameterName.ntId}${PARAMS_EQ}6.5]`,
      errorIdStr: '6.5',
    },
    {
      cmd: `${cmd_appntt} [${CommandParameterName.ntId}${PARAMS_EQ}-6]`,
      errorIdStr: '-6',
    },
  ];
  for (const msg_appntt_id_failure of msgs_appntt_id_failure) {
    it(`"${msg_appntt_id_failure.cmd}" should be rejected as note id error`, () => {
      const ret = detectCMDNtAppendTextParams(
        msg_appntt_id_failure.cmd,
        user_language,
        user_time_zone,
      );

      expect(ret).toStrictEqual(
        new ToTranslate(TrKey.PARAM_TYPE_INT_POS_ERROR, user_language, {
          parName: 'nt_id',
          parValue: msg_appntt_id_failure.errorIdStr,
        }),
      );
    });
  }

  const cmd_appntt_text_failure = `${cmd_appntt} [ ${CommandParameterName.ntText}${PARAMS_EQ}"" ]`;
  test(`${cmd_appntt_text_failure} should be rejected as not valid note text parameter`, () => {
    const ret = detectCMDNtAppendTextParams(
      cmd_appntt_text_failure,
      user_language,
      user_time_zone,
    );

    expect(ret).toStrictEqual(
      new ToTranslate(TrKey.PARAM_TYPE_QUERY_ERROR, user_language, {
        parName: 'nt_t',
        parValue: '',
      }),
    );
  });
});
