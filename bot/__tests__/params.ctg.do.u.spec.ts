import { TrKey } from '../../i18n/keys';
import { ToTranslate } from '../../i18n/i18n';
import {
  CommandParameterName,
  detectCMDCtgDoParams,
  PARAMS_EQ,
} from '../parameters';
import { createAppTestConfig } from '../../config/config';

describe('Check do category command parameters parser', () => {
  const {
    test: { user_language, user_time_zone },
  } = createAppTestConfig();
  const realCtgTitle = 'realCtgTitle';

  const msgs_do_ctg_conflict = [
    {
      cmd: ` [${CommandParameterName.ctgId}${PARAMS_EQ}14 ${CommandParameterName.ctgTitle}${PARAMS_EQ}${realCtgTitle}]`,
      expectParName: CommandParameterName.ctgId,
      expectParConflictName: CommandParameterName.ctgTitle,
    },
    {
      cmd: ` [${CommandParameterName.ctgTitle}${PARAMS_EQ}${realCtgTitle} ${CommandParameterName.ctgId}${PARAMS_EQ}15]`,
      expectParName: CommandParameterName.ctgTitle,
      expectParConflictName: CommandParameterName.ctgId,
    },
  ];
  for (const msg_do_ctg_conflict of msgs_do_ctg_conflict) {
    it(`"${msg_do_ctg_conflict.cmd}" should be rejected as of ctg id conflict ctg title`, () => {
      const ret = detectCMDCtgDoParams(
        msg_do_ctg_conflict.cmd,
        user_language,
        user_time_zone,
      );

      expect(ret).toStrictEqual(
        new ToTranslate(TrKey.PARAM_CONFLICT_ERROR, user_language, {
          parName: msg_do_ctg_conflict.expectParName,
          conflictParName: msg_do_ctg_conflict.expectParConflictName,
        }),
      );
    });
  }
});
