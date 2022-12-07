import { TrKey } from '../../i18n/keys';
import { ToTranslate } from '../../i18n/i18n';
import {
  CommandParameterName,
  detectCMDCtgListParameters,
  PARAMS_EQ,
} from '../parameters';
import { createAppTestConfig } from '../../config/config';

describe('Check categories list command parameters parser', () => {
  const {
    test: { user_language, user_time_zone },
  } = createAppTestConfig();
  const msg1 = `hoho ho1 [${CommandParameterName.limit}${PARAMS_EQ}0,1] fff... `;
  test(`${msg1} should be rejected as not valid limit number`, () => {
    const ret = detectCMDCtgListParameters(msg1, user_language, user_time_zone);

    expect(ret).toStrictEqual(
      new ToTranslate(TrKey.PARAM_TYPE_INT_POS_ERROR, user_language, {
        parName: 'l',
        parValue: '0,1',
      }),
    );
  });

  const msg2 = `hoho ho [ ${CommandParameterName.skip}${PARAMS_EQ}0 ]`;
  test(`${msg2} should be rejected as not valid skip number`, () => {
    const ret = detectCMDCtgListParameters(msg2, user_language, user_time_zone);

    expect(ret).toStrictEqual(
      new ToTranslate(TrKey.PARAM_TYPE_INT_POS_ERROR, user_language, {
        parName: 's',
        parValue: '0',
      }),
    );
  });

  const msg3 = `hoho ho [ ${CommandParameterName.skip}${PARAMS_EQ}4c ]`;
  test(`${msg3} should be rejected as not valid skip number`, () => {
    const ret = detectCMDCtgListParameters(msg3, user_language, user_time_zone);

    expect(ret).toStrictEqual(
      new ToTranslate(TrKey.PARAM_TYPE_INT_POS_ERROR, user_language, {
        parName: 's',
        parValue: '4c',
      }),
    );
  });

  const msg4 = `hh [ ${CommandParameterName.showId}${PARAMS_EQ}456 ]`;
  it(`"${msg4}" should be rejected as not valid boolean show id flag`, () => {
    const ret = detectCMDCtgListParameters(msg4, user_language, user_time_zone);

    expect(ret).toStrictEqual(
      new ToTranslate(TrKey.PARAM_TYPE_BOOL_ERROR, user_language, {
        parName: 'show_id',
        parValue: '456',
      }),
    );
  });

  const msg5 = `ad [${CommandParameterName.showDeleted}${PARAMS_EQ}hello]`;
  it(`"${msg5}" should be rejected as not valid boolean show del flag`, () => {
    const ret = detectCMDCtgListParameters(msg5, user_language, user_time_zone);

    expect(ret).toStrictEqual(
      new ToTranslate(TrKey.PARAM_TYPE_BOOL_ERROR, user_language, {
        parName: 'show_del',
        parValue: 'hello',
      }),
    );
  });

  const msg6 = `[${CommandParameterName.showArchived}=hello]`;
  it(`"${msg6}" should be rejected as not valid boolean show arch flag`, () => {
    const ret = detectCMDCtgListParameters(msg6, user_language, user_time_zone);

    expect(ret).toStrictEqual(
      new ToTranslate(TrKey.PARAM_TYPE_BOOL_ERROR, user_language, {
        parName: 'show_arch',
        parValue: 'hello',
      }),
    );
  });

  const msg7 = `[${CommandParameterName.skip}${PARAMS_EQ}2 ${CommandParameterName.skip}=4]`;
  it(`"${msg7}" should be rejected as of duplicated parameter`, () => {
    const ret = detectCMDCtgListParameters(msg7, user_language, user_time_zone);

    expect(ret).toStrictEqual(
      new ToTranslate(TrKey.PARAM_DUPLICATE_ERROR, user_language, {
        parName: 's',
      }),
    );
  });

  const msgs_list_conflict = [
    {
      expectParName: CommandParameterName.query,
      expectParConflictName: [
        CommandParameterName.ctgQuery,
        CommandParameterName.sbcQuery,
        CommandParameterName.ctgQueryTitle,
        CommandParameterName.ctgQueryDescr,
        CommandParameterName.sbcQueryTitle,
        CommandParameterName.sbcQueryDescr,
      ],
    },
    {
      expectParName: CommandParameterName.ctgQuery,
      expectParConflictName: [CommandParameterName.query],
    },
    {
      expectParName: CommandParameterName.sbcQuery,
      expectParConflictName: [CommandParameterName.query],
    },
    {
      expectParName: CommandParameterName.ctgQueryTitle,
      expectParConflictName: [
        CommandParameterName.query,
        CommandParameterName.ctgQuery,
      ],
    },
    {
      expectParName: CommandParameterName.sbcQueryTitle,
      expectParConflictName: [
        CommandParameterName.query,
        CommandParameterName.sbcQuery,
      ],
    },
    {
      expectParName: CommandParameterName.ctgQueryDescr,
      expectParConflictName: [
        CommandParameterName.query,
        CommandParameterName.ctgQuery,
      ],
    },
    {
      expectParName: CommandParameterName.sbcQueryDescr,
      expectParConflictName: [
        CommandParameterName.query,
        CommandParameterName.sbcQuery,
      ],
    },
    {
      usaIdAsParVal: true,
      expectParName: CommandParameterName.ctgQueryIdGreaterThan,
      expectParConflictName: [CommandParameterName.ctgQueryIdGreaterThanOrEq],
    },
    {
      usaIdAsParVal: true,
      expectParName: CommandParameterName.ctgQueryIdGreaterThanOrEq,
      expectParConflictName: [CommandParameterName.ctgQueryIdGreaterThan],
    },
    {
      usaIdAsParVal: true,
      expectParName: CommandParameterName.ctgQueryIdLessThan,
      expectParConflictName: [CommandParameterName.ctgQueryIdLessThanOrEq],
    },
    {
      usaIdAsParVal: true,
      expectParName: CommandParameterName.ctgQueryIdLessThanOrEq,
      expectParConflictName: [CommandParameterName.ctgQueryIdLessThan],
    },
    {
      usaIdAsParVal: true,
      expectParName: CommandParameterName.sbcQueryIdGreaterThan,
      expectParConflictName: [CommandParameterName.sbcQueryIdGreaterThanOrEq],
    },
    {
      usaIdAsParVal: true,
      expectParName: CommandParameterName.sbcQueryIdGreaterThanOrEq,
      expectParConflictName: [CommandParameterName.sbcQueryIdGreaterThan],
    },
    {
      usaIdAsParVal: true,
      expectParName: CommandParameterName.sbcQueryIdLessThan,
      expectParConflictName: [CommandParameterName.sbcQueryIdLessThanOrEq],
    },
    {
      usaIdAsParVal: true,
      expectParName: CommandParameterName.sbcQueryIdLessThanOrEq,
      expectParConflictName: [CommandParameterName.sbcQueryIdLessThan],
    },
  ];
  msgs_list_conflict.forEach((msg_list_conflict, idx) => {
    for (const parConflic of msg_list_conflict.expectParConflictName) {
      const expectParValue = msg_list_conflict.usaIdAsParVal
        ? idx
        : msg_list_conflict.expectParName;
      const cmd = `${idx + 1 < 10 ? `0${idx + 1}` : idx + 1} [${
        msg_list_conflict.expectParName
      }${PARAMS_EQ}${expectParValue} ${parConflic}${PARAMS_EQ}${
        msg_list_conflict.usaIdAsParVal ? expectParValue : parConflic
      }]`;
      it(`"${cmd}" should be rejected as of params conflict`, () => {
        const ret = detectCMDCtgListParameters(
          cmd,
          user_language,
          user_time_zone,
        );

        expect(ret).toStrictEqual(
          new ToTranslate(TrKey.PARAM_CONFLICT_ERROR, user_language, {
            parName: msg_list_conflict.expectParName,
            conflictParName: parConflic,
          }),
        );
      });
    }
  });
});
