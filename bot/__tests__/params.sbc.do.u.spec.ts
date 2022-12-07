import { TrKey } from '../../i18n/keys';
import { ToTranslate } from '../../i18n/i18n';
import {
  CommandParameterName,
  detectCMDSbcDoParams,
  PARAMS_EQ,
} from '../parameters';
import { createAppTestConfig } from '../../config/config';

describe('Check do subcategory command parameters parser', () => {
  const {
    test: { user_language, user_time_zone },
  } = createAppTestConfig();
  const realsbcTitle = 'realsbcTitle';

  const msgs_do_sbc_conflict = [
    {
      cmd: ` [${CommandParameterName.sbcId}${PARAMS_EQ}14 ${CommandParameterName.sbcTitle}${PARAMS_EQ}${realsbcTitle}]`,
      expectParName: CommandParameterName.sbcId,
      expectParConflictName: CommandParameterName.sbcTitle,
    },
    {
      cmd: ` [${CommandParameterName.sbcTitle}${PARAMS_EQ}${realsbcTitle} ${CommandParameterName.sbcId}${PARAMS_EQ}15]`,
      expectParName: CommandParameterName.sbcTitle,
      expectParConflictName: CommandParameterName.sbcId,
    },
  ];
  for (const msg_do_sbc_conflict of msgs_do_sbc_conflict) {
    it(`"${msg_do_sbc_conflict.cmd}" should be rejected as of sbc id conflict sbc title`, () => {
      const ret = detectCMDSbcDoParams(
        msg_do_sbc_conflict.cmd,
        user_language,
        user_time_zone,
      );

      expect(ret).toStrictEqual(
        new ToTranslate(TrKey.PARAM_CONFLICT_ERROR, user_language, {
          parName: msg_do_sbc_conflict.expectParName,
          conflictParName: msg_do_sbc_conflict.expectParConflictName,
        }),
      );
    });
  }
});
