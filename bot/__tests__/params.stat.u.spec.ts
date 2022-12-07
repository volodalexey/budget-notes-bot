import { TrKey } from '../../i18n/keys';
import { ToTranslate } from '../../i18n/i18n';
import {
  CommandParameterName,
  detectCMDStatParameters,
  PARAMS_EQ,
} from '../parameters';
import { createAppTestConfig } from '../../config/config';

describe('Check statistic command parameters parser', () => {
  const {
    test: { user_language, user_time_zone },
  } = createAppTestConfig();
  const msg05 = `ad [${CommandParameterName.startDate}${PARAMS_EQ}2016.06.16 ${CommandParameterName.endDate}${PARAMS_EQ}2016.06.16]`;
  it(`"${msg05}" should be rejected as of ${CommandParameterName.startDate} is equal ${CommandParameterName.endDate}`, () => {
    const ret = detectCMDStatParameters(msg05, user_language, user_time_zone);

    expect(ret).toStrictEqual(
      new ToTranslate(TrKey.PARAM_CONFLICT_BIGGER_ERROR, user_language, {
        parName: CommandParameterName.startDate,
        conflictParName: CommandParameterName.endDate,
      }),
    );
  });

  const msg06 = `ad [${CommandParameterName.startDate}${PARAMS_EQ}2016.06.16 ${CommandParameterName.endDate}${PARAMS_EQ}2016.06.15]`;
  it(`"${msg06}" should be rejected as of ${CommandParameterName.startDate} less than ${CommandParameterName.endDate}`, () => {
    const ret = detectCMDStatParameters(msg06, user_language, user_time_zone);

    expect(ret).toStrictEqual(
      new ToTranslate(TrKey.PARAM_CONFLICT_BIGGER_ERROR, user_language, {
        parName: CommandParameterName.startDate,
        conflictParName: CommandParameterName.endDate,
      }),
    );
  });

  const msg07 = `ad [${CommandParameterName.endDate}${PARAMS_EQ}2016.06.16 ${CommandParameterName.startDate}${PARAMS_EQ}2016.06.16]`;
  it(`"${msg07}" should be rejected as of ${CommandParameterName.endDate} is equal ${CommandParameterName.startDate}`, () => {
    const ret = detectCMDStatParameters(msg07, user_language, user_time_zone);

    expect(ret).toStrictEqual(
      new ToTranslate(TrKey.PARAM_CONFLICT_LESS_ERROR, user_language, {
        parName: CommandParameterName.endDate,
        conflictParName: CommandParameterName.startDate,
      }),
    );
  });

  const msg08 = `ad [${CommandParameterName.endDate}${PARAMS_EQ}2016.06.16 ${CommandParameterName.startDate}${PARAMS_EQ}2016.06.17]`;
  it(`"${msg08}" should be rejected as of ${CommandParameterName.endDate} bigger than ${CommandParameterName.startDate}`, () => {
    const ret = detectCMDStatParameters(msg08, user_language, user_time_zone);

    expect(ret).toStrictEqual(
      new ToTranslate(TrKey.PARAM_CONFLICT_LESS_ERROR, user_language, {
        parName: CommandParameterName.endDate,
        conflictParName: CommandParameterName.startDate,
      }),
    );
  });

  const msg4 = `hoho ho [ ${CommandParameterName.query}${PARAMS_EQ}"" ]`;
  test(`${msg4} should be rejected as not valid query parameter`, () => {
    const ret = detectCMDStatParameters(msg4, user_language, user_time_zone);

    expect(ret).toStrictEqual(
      new ToTranslate(TrKey.PARAM_TYPE_QUERY_ERROR, user_language, {
        parName: 'q',
        parValue: '',
      }),
    );
  });

  const msgs_stat_conflict = [
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
  msgs_stat_conflict.forEach(
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
        it(`"${cmd}" should be rejected as of params conflict`, () => {
          const ret = detectCMDStatParameters(
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
