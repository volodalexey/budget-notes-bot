import { TrKey } from '../../i18n/keys';
import { ToTranslate } from '../../i18n/i18n';
import {
  CommandParameterName,
  detectCMDNtListParameters,
  PARAMS_EQ,
} from '../parameters';
import { createAppTestConfig } from '../../config/config';

describe('Check notes list command parameters parser', () => {
  const {
    test: { user_language, user_time_zone },
  } = createAppTestConfig();
  const msg1 = `hoho ho1 [${CommandParameterName.limit}${PARAMS_EQ}0,1] fff... `;
  test(`${msg1} should be rejected as not valid limit number`, () => {
    const ret = detectCMDNtListParameters(msg1, user_language, user_time_zone);

    expect(ret).toStrictEqual(
      new ToTranslate(TrKey.PARAM_TYPE_INT_POS_ERROR, user_language, {
        parName: 'l',
        parValue: '0,1',
      }),
    );
  });

  const msg2 = `hoho ho [ ${CommandParameterName.skip}${PARAMS_EQ}0 ]`;
  test(`${msg2} should be rejected as not valid limit number`, () => {
    const ret = detectCMDNtListParameters(msg2, user_language, user_time_zone);

    expect(ret).toStrictEqual(
      new ToTranslate(TrKey.PARAM_TYPE_INT_POS_ERROR, user_language, {
        parName: 's',
        parValue: '0',
      }),
    );
  });

  const msg3 = `hoho ho [ ${CommandParameterName.skip}${PARAMS_EQ}4c ]`;
  test(`${msg3} should be rejected as not valid skip number`, () => {
    const ret = detectCMDNtListParameters(msg3, user_language, user_time_zone);

    expect(ret).toStrictEqual(
      new ToTranslate(TrKey.PARAM_TYPE_INT_POS_ERROR, user_language, {
        parName: 's',
        parValue: '4c',
      }),
    );
  });

  const msg4 = `hh [ ${CommandParameterName.showId}${PARAMS_EQ}456 ]`;
  it(`"${msg4}" should be rejected as not valid boolean show id flag`, () => {
    const ret = detectCMDNtListParameters(msg4, user_language, user_time_zone);

    expect(ret).toStrictEqual(
      new ToTranslate(TrKey.PARAM_TYPE_BOOL_ERROR, user_language, {
        parName: 'show_id',
        parValue: '456',
      }),
    );
  });

  const msg5 = `ad [${CommandParameterName.showDeleted}${PARAMS_EQ}hello]`;
  it(`"${msg5}" should be rejected as not valid boolean show del flag`, () => {
    const ret = detectCMDNtListParameters(msg5, user_language, user_time_zone);

    expect(ret).toStrictEqual(
      new ToTranslate(TrKey.PARAM_TYPE_BOOL_ERROR, user_language, {
        parName: 'show_del',
        parValue: 'hello',
      }),
    );
  });

  const msg6 = `[${CommandParameterName.showArchived}=hello]`;
  it(`"${msg6}" should be rejected as not valid boolean show arch flag`, () => {
    const ret = detectCMDNtListParameters(msg6, user_language, user_time_zone);

    expect(ret).toStrictEqual(
      new ToTranslate(TrKey.PARAM_TYPE_BOOL_ERROR, user_language, {
        parName: 'show_arch',
        parValue: 'hello',
      }),
    );
  });

  const msg7 = `[${CommandParameterName.skip}${PARAMS_EQ}2 ${CommandParameterName.skip}=4]`;
  it(`"${msg7}" should be rejected as of duplicated parameter`, () => {
    const ret = detectCMDNtListParameters(msg7, user_language, user_time_zone);

    expect(ret).toStrictEqual(
      new ToTranslate(TrKey.PARAM_DUPLICATE_ERROR, user_language, {
        parName: 's',
      }),
    );
  });

  const msgs_listnt_conflict = [
    {
      expectParName: CommandParameterName.query,
      expectParConflictName: [
        CommandParameterName.ctgQuery,
        CommandParameterName.sbcQuery,
        CommandParameterName.ctgQueryTitle,
        CommandParameterName.ctgQueryDescr,
        CommandParameterName.sbcQueryTitle,
        CommandParameterName.sbcQueryDescr,
        CommandParameterName.ntQueryText,
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
      expectParName: CommandParameterName.ntQueryText,
      expectParConflictName: [CommandParameterName.query],
    },
    {
      expectParName: CommandParameterName.ntQueryNumber,
      usaIdAsParVal: true,
      expectParConflictName: [
        CommandParameterName.ntQueryNumberGreaterThan,
        CommandParameterName.ntQueryNumberGreaterThanOrEq,
        CommandParameterName.ntQueryNumberLessThan,
        CommandParameterName.ntQueryNumberGreaterThan,
      ],
    },
    {
      usaIdAsParVal: true,
      expectParName: CommandParameterName.ntQueryNumberGreaterThan,
      expectParConflictName: [
        CommandParameterName.ntQueryNumberGreaterThanOrEq,
        CommandParameterName.ntQueryNumber,
      ],
    },
    {
      usaIdAsParVal: true,
      expectParName: CommandParameterName.ntQueryNumberGreaterThanOrEq,
      expectParConflictName: [
        CommandParameterName.ntQueryNumberGreaterThan,
        CommandParameterName.ntQueryNumber,
      ],
    },
    {
      usaIdAsParVal: true,
      expectParName: CommandParameterName.ntQueryNumberLessThan,
      expectParConflictName: [
        CommandParameterName.ntQueryNumberLessThanOrEq,
        CommandParameterName.ntQueryNumber,
      ],
    },
    {
      usaIdAsParVal: true,
      expectParName: CommandParameterName.ntQueryNumberLessThanOrEq,
      expectParConflictName: [
        CommandParameterName.ntQueryNumberLessThan,
        CommandParameterName.ntQueryNumber,
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
    {
      usaIdAsParVal: true,
      expectParName: CommandParameterName.ntQueryIdGreaterThan,
      expectParConflictName: [CommandParameterName.ntQueryIdGreaterThanOrEq],
    },
    {
      usaIdAsParVal: true,
      expectParName: CommandParameterName.ntQueryIdGreaterThanOrEq,
      expectParConflictName: [CommandParameterName.ntQueryIdGreaterThan],
    },
    {
      usaIdAsParVal: true,
      expectParName: CommandParameterName.ntQueryIdLessThan,
      expectParConflictName: [CommandParameterName.ntQueryIdLessThanOrEq],
    },
    {
      usaIdAsParVal: true,
      expectParName: CommandParameterName.ntQueryIdLessThanOrEq,
      expectParConflictName: [CommandParameterName.ntQueryIdLessThan],
    },
  ];
  msgs_listnt_conflict.forEach((msg_listnt_conflict, idx) => {
    for (const parConflic of msg_listnt_conflict.expectParConflictName) {
      const expectParValue = msg_listnt_conflict.usaIdAsParVal
        ? idx
        : msg_listnt_conflict.expectParName;
      const cmd = `${idx + 1 < 10 ? `0${idx + 1}` : idx + 1} [${
        msg_listnt_conflict.expectParName
      }${PARAMS_EQ}${expectParValue} ${parConflic}${PARAMS_EQ}${
        msg_listnt_conflict.usaIdAsParVal ? expectParValue : parConflic
      }]`;
      it(`"${cmd}" should be rejected as of params conflict`, () => {
        const ret = detectCMDNtListParameters(
          cmd,
          user_language,
          user_time_zone,
        );

        expect(ret).toStrictEqual(
          new ToTranslate(TrKey.PARAM_CONFLICT_ERROR, user_language, {
            parName: msg_listnt_conflict.expectParName,
            conflictParName: parConflic,
          }),
        );
      });
    }
  });

  const msg01 = `ad [${CommandParameterName.date}${PARAMS_EQ}2016.06.16 ${CommandParameterName.startDate}${PARAMS_EQ}2016.06.17]`;
  it(`"${msg01}" should be rejected as of conflict ${CommandParameterName.date} with ${CommandParameterName.startDate}`, () => {
    const ret = detectCMDNtListParameters(msg01, user_language, user_time_zone);

    expect(ret).toStrictEqual(
      new ToTranslate(TrKey.PARAM_CONFLICT_ERROR, user_language, {
        parName: CommandParameterName.date,
        conflictParName: CommandParameterName.startDate,
      }),
    );
  });

  const msg02 = `ad [${CommandParameterName.date}${PARAMS_EQ}2016.06.16 ${CommandParameterName.endDate}${PARAMS_EQ}2016.06.17]`;
  it(`"${msg02}" should be rejected as of conflict ${CommandParameterName.date} with ${CommandParameterName.endDate}`, () => {
    const ret = detectCMDNtListParameters(msg02, user_language, user_time_zone);

    expect(ret).toStrictEqual(
      new ToTranslate(TrKey.PARAM_CONFLICT_ERROR, user_language, {
        parName: CommandParameterName.date,
        conflictParName: CommandParameterName.endDate,
      }),
    );
  });

  const msg03 = `ad [${CommandParameterName.startDate}${PARAMS_EQ}2016.06.16 ${CommandParameterName.date}${PARAMS_EQ}2016.06.17]`;
  it(`"${msg03}" should be rejected as of conflict ${CommandParameterName.startDate} with ${CommandParameterName.date}`, () => {
    const ret = detectCMDNtListParameters(msg03, user_language, user_time_zone);

    expect(ret).toStrictEqual(
      new ToTranslate(TrKey.PARAM_CONFLICT_ERROR, user_language, {
        parName: CommandParameterName.startDate,
        conflictParName: CommandParameterName.date,
      }),
    );
  });

  const msg04 = `ad [${CommandParameterName.endDate}${PARAMS_EQ}2016.06.16 ${CommandParameterName.date}${PARAMS_EQ}2016.06.17]`;
  it(`"${msg04}" should be rejected as of conflict ${CommandParameterName.endDate} with ${CommandParameterName.date}`, () => {
    const ret = detectCMDNtListParameters(msg04, user_language, user_time_zone);

    expect(ret).toStrictEqual(
      new ToTranslate(TrKey.PARAM_CONFLICT_ERROR, user_language, {
        parName: CommandParameterName.endDate,
        conflictParName: CommandParameterName.date,
      }),
    );
  });

  const msg05 = `ad [${CommandParameterName.startDate}${PARAMS_EQ}2016.06.16 ${CommandParameterName.endDate}${PARAMS_EQ}2016.06.16]`;
  it(`"${msg05}" should be rejected as of ${CommandParameterName.startDate} is equal ${CommandParameterName.endDate}`, () => {
    const ret = detectCMDNtListParameters(msg05, user_language, user_time_zone);

    expect(ret).toStrictEqual(
      new ToTranslate(TrKey.PARAM_CONFLICT_BIGGER_ERROR, user_language, {
        parName: CommandParameterName.startDate,
        conflictParName: CommandParameterName.endDate,
      }),
    );
  });

  const msg06 = `ad [${CommandParameterName.startDate}${PARAMS_EQ}2016.06.16 ${CommandParameterName.endDate}${PARAMS_EQ}2016.06.15]`;
  it(`"${msg06}" should be rejected as of ${CommandParameterName.startDate} less than ${CommandParameterName.endDate}`, () => {
    const ret = detectCMDNtListParameters(msg06, user_language, user_time_zone);

    expect(ret).toStrictEqual(
      new ToTranslate(TrKey.PARAM_CONFLICT_BIGGER_ERROR, user_language, {
        parName: CommandParameterName.startDate,
        conflictParName: CommandParameterName.endDate,
      }),
    );
  });

  const msg07 = `ad [${CommandParameterName.endDate}${PARAMS_EQ}2016.06.16 ${CommandParameterName.startDate}${PARAMS_EQ}2016.06.16]`;
  it(`"${msg07}" should be rejected as of ${CommandParameterName.endDate} is equal ${CommandParameterName.startDate}`, () => {
    const ret = detectCMDNtListParameters(msg07, user_language, user_time_zone);

    expect(ret).toStrictEqual(
      new ToTranslate(TrKey.PARAM_CONFLICT_LESS_ERROR, user_language, {
        parName: CommandParameterName.endDate,
        conflictParName: CommandParameterName.startDate,
      }),
    );
  });

  const msg08 = `ad [${CommandParameterName.endDate}${PARAMS_EQ}2016.06.16 ${CommandParameterName.startDate}${PARAMS_EQ}2016.06.17]`;
  it(`"${msg08}" should be rejected as of ${CommandParameterName.endDate} bigger than ${CommandParameterName.startDate}`, () => {
    const ret = detectCMDNtListParameters(msg08, user_language, user_time_zone);

    expect(ret).toStrictEqual(
      new ToTranslate(TrKey.PARAM_CONFLICT_LESS_ERROR, user_language, {
        parName: CommandParameterName.endDate,
        conflictParName: CommandParameterName.startDate,
      }),
    );
  });

  const msgs_listnt_conflict_2 = [
    {
      expectParName: CommandParameterName.query,
      expectParConflictName: [
        CommandParameterName.ctgQuery,
        CommandParameterName.sbcQuery,
        CommandParameterName.ctgQueryTitle,
        CommandParameterName.ctgQueryDescr,
        CommandParameterName.sbcQueryTitle,
        CommandParameterName.sbcQueryDescr,
        CommandParameterName.ntQueryText,
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
      expectParName: CommandParameterName.ntQueryText,
      expectParConflictName: [CommandParameterName.query],
    },
    {
      expectParName: CommandParameterName.date,
      expectParValue: '2022.02.02',
      expectParConflictName: [
        CommandParameterName.startDate,
        CommandParameterName.endDate,
        CommandParameterName.relativeDay,
        CommandParameterName.relativeMonth,
        CommandParameterName.relativeYear,
      ],
      expectParConflictValue: ['2022.02.02', '2022.02.02', '-1', '-1', '-1'],
    },
    {
      expectParName: CommandParameterName.startDate,
      expectParValue: '2022.02.02',
      expectParConflictName: [
        CommandParameterName.date,
        CommandParameterName.relativeDay,
        CommandParameterName.relativeMonth,
        CommandParameterName.relativeYear,
      ],
      expectParConflictValue: ['2022.02.02', '-1', '-1', '-1'],
    },
    {
      expectParName: CommandParameterName.endDate,
      expectParValue: '2022.02.02',
      expectParConflictName: [
        CommandParameterName.date,
        CommandParameterName.relativeDay,
        CommandParameterName.relativeMonth,
        CommandParameterName.relativeYear,
      ],
      expectParConflictValue: ['2022.02.02', '-1', '-1', '-1'],
    },
    {
      expectParName: CommandParameterName.relativeDay,
      expectParValue: '1',
      expectParConflictName: [
        CommandParameterName.date,
        CommandParameterName.startDate,
        CommandParameterName.endDate,
        CommandParameterName.relativeMonth,
        CommandParameterName.relativeYear,
      ],
      expectParConflictValue: [
        '2022.02.02',
        '2022.02.02',
        '2022.02.02',
        '-1',
        '-1',
      ],
    },
    {
      expectParName: CommandParameterName.relativeMonth,
      expectParValue: '1',
      expectParConflictName: [
        CommandParameterName.date,
        CommandParameterName.startDate,
        CommandParameterName.endDate,
        CommandParameterName.relativeDay,
        CommandParameterName.relativeYear,
      ],
      expectParConflictValue: [
        '2022.02.02',
        '2022.02.02',
        '2022.02.02',
        '-1',
        '-1',
      ],
    },
    {
      expectParName: CommandParameterName.relativeYear,
      expectParValue: '1',
      expectParConflictName: [
        CommandParameterName.date,
        CommandParameterName.startDate,
        CommandParameterName.endDate,
        CommandParameterName.relativeDay,
        CommandParameterName.relativeMonth,
      ],
      expectParConflictValue: [
        '2022.02.02',
        '2022.02.02',
        '2022.02.02',
        '-1',
        '-1',
      ],
    },
  ];
  msgs_listnt_conflict_2.forEach(
    (
      {
        expectParName,
        expectParValue,
        expectParConflictName,
        expectParConflictValue,
      },
      idx,
    ) => {
      expectParConflictName.forEach((parConflicName, idxP) => {
        const _expectParValue = expectParValue || expectParName;
        const parConflicValue = expectParConflictValue
          ? expectParConflictValue[idxP]
          : parConflicName;
        const cmd = `${
          idx + 1 < 10 ? `0${idx + 1}` : idx + 1
        } [${expectParName}${PARAMS_EQ}${_expectParValue} ${parConflicName}${PARAMS_EQ}${parConflicValue}]`;
        it(`"${cmd}" should be rejected as of relative params conflict`, () => {
          const ret = detectCMDNtListParameters(
            cmd,
            user_language,
            user_time_zone,
          );

          expect(ret).toStrictEqual(
            new ToTranslate(TrKey.PARAM_CONFLICT_ERROR, user_language, {
              parName: expectParName,
              conflictParName: parConflicName,
            }),
          );
        });
      });
    },
  );
});
