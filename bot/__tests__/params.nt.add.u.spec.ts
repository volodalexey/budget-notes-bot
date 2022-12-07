import { TrKey } from '../../i18n/keys';
import { ToTranslate } from '../../i18n/i18n';
import {
  CommandParameterName,
  detectCMDNtAddParams,
  PARAMS_EQ,
} from '../parameters';
import { createAppTestConfig } from '../../config/config';

describe('Check add note command parameters parser', () => {
  const {
    test: { user_language, user_time_zone },
  } = createAppTestConfig();
  const realCtgTitle = 'realCtgTitle';
  const realSbcTitle = '😴';

  it('detectCMDNtAddParams() message with ctg id parameters', () => {
    const ret = detectCMDNtAddParams(
      ` [${CommandParameterName.ctgId}${PARAMS_EQ}123 ${CommandParameterName.ntText}${PARAMS_EQ}"eee ddvs" ${CommandParameterName.ntNumber}${PARAMS_EQ}+222]`,
      user_language,
      user_time_zone,
    );

    expect(ret).toEqual({
      detectedParams: {
        [CommandParameterName.ctgId]: 123,
        [CommandParameterName.ntText]: 'eee ddvs',
        [CommandParameterName.ntNumber]: 222,
      },
      detectedDBParams: {
        [CommandParameterName.ntText]: 'eee ddvs',
      },
      detectedRawParams: {
        [CommandParameterName.ctgId]: '123',
        [CommandParameterName.ntText]: '"eee ddvs"',
        [CommandParameterName.ntNumber]: `+222`,
      },
      rest: ' ',
      detectedPramsPattern: true,
      detectedPramsFound: true,
    });
  });

  it('detectCMDNtAddParams() message with ctg title parameters', () => {
    const ret = detectCMDNtAddParams(
      ` [${CommandParameterName.ctgTitle}${PARAMS_EQ}${realCtgTitle} ${CommandParameterName.ntText}${PARAMS_EQ}"eee ddvs" ${CommandParameterName.ntNumber}${PARAMS_EQ}+222]`,
      user_language,
      user_time_zone,
    );

    expect(ret).toEqual({
      detectedParams: {
        [CommandParameterName.ctgTitle]: realCtgTitle,
        [CommandParameterName.ntText]: 'eee ddvs',
        [CommandParameterName.ntNumber]: 222,
      },
      detectedDBParams: {
        [CommandParameterName.ntText]: 'eee ddvs',
      },
      detectedRawParams: {
        [CommandParameterName.ctgTitle]: realCtgTitle,
        [CommandParameterName.ntText]: '"eee ddvs"',
        [CommandParameterName.ntNumber]: `+222`,
      },
      rest: ' ',
      detectedPramsPattern: true,
      detectedPramsFound: true,
    });
  });

  it('detectCMDNtAddParams() message with sbc id parameters', () => {
    const ret = detectCMDNtAddParams(
      ` [${CommandParameterName.sbcId}${PARAMS_EQ}123 ${CommandParameterName.ntText}${PARAMS_EQ}"eee ddvs" ${CommandParameterName.ntNumber}${PARAMS_EQ}+222]`,
      user_language,
      user_time_zone,
    );

    expect(ret).toEqual({
      detectedParams: {
        [CommandParameterName.sbcId]: 123,
        [CommandParameterName.ntText]: 'eee ddvs',
        [CommandParameterName.ntNumber]: 222,
      },
      detectedDBParams: {
        [CommandParameterName.ntText]: 'eee ddvs',
      },
      detectedRawParams: {
        [CommandParameterName.sbcId]: '123',
        [CommandParameterName.ntText]: '"eee ddvs"',
        [CommandParameterName.ntNumber]: `+222`,
      },
      rest: ' ',
      detectedPramsPattern: true,
      detectedPramsFound: true,
    });
  });

  it('detectCMDNtAddParams() message with sbc title parameters', () => {
    const ret = detectCMDNtAddParams(
      ` [${CommandParameterName.sbcTitle}${PARAMS_EQ}${realSbcTitle} ${CommandParameterName.ntText}${PARAMS_EQ}"eee ddvs" ${CommandParameterName.ntNumber}${PARAMS_EQ}+222]`,
      user_language,
      user_time_zone,
    );

    expect(ret).toEqual({
      detectedParams: {
        [CommandParameterName.sbcTitle]: realSbcTitle,
        [CommandParameterName.ntText]: 'eee ddvs',
        [CommandParameterName.ntNumber]: 222,
      },
      detectedDBParams: {
        [CommandParameterName.ntText]: 'eee ddvs',
      },
      detectedRawParams: {
        [CommandParameterName.sbcTitle]: realSbcTitle,
        [CommandParameterName.ntText]: '"eee ddvs"',
        [CommandParameterName.ntNumber]: `+222`,
      },
      rest: ' ',
      detectedPramsPattern: true,
      detectedPramsFound: true,
    });
  });

  const msgs_addnt_date_failure = [
    {
      cmd: `${realCtgTitle} 15 [${CommandParameterName.date}${PARAMS_EQ}2019.02. ${CommandParameterName.time}${PARAMS_EQ}14:30]`,
      expectDateStr: '2019.02.',
    },
    {
      cmd: `${realCtgTitle} 15 [${CommandParameterName.date}${PARAMS_EQ}2019.13.1 ${CommandParameterName.time}${PARAMS_EQ}14:30]`,
      expectDateStr: '2019.13.1',
    },
    {
      cmd: `${realCtgTitle} 15 [${CommandParameterName.date}${PARAMS_EQ}2019.02.101 ${CommandParameterName.time}${PARAMS_EQ}14:30]`,
      expectDateStr: '2019.02.101',
    },
    {
      cmd: `${realCtgTitle} 15 [${CommandParameterName.date}${PARAMS_EQ}20199.02.10 ${CommandParameterName.time}${PARAMS_EQ}14:30]`,
      expectDateStr: '20199.02.10',
    },
    {
      cmd: `${realSbcTitle} 15 [${CommandParameterName.date}${PARAMS_EQ}2019.02. ${CommandParameterName.time}${PARAMS_EQ}14:30]`,
      expectDateStr: '2019.02.',
    },
    {
      cmd: `${realSbcTitle} 15 [${CommandParameterName.date}${PARAMS_EQ}2019.13.1 ${CommandParameterName.time}${PARAMS_EQ}14:30]`,
      expectDateStr: '2019.13.1',
    },
    {
      cmd: `${realSbcTitle} 15 [${CommandParameterName.date}${PARAMS_EQ}2019.02.101 ${CommandParameterName.time}${PARAMS_EQ}14:30]`,
      expectDateStr: '2019.02.101',
    },
    {
      cmd: `${realSbcTitle} 15 [${CommandParameterName.date}${PARAMS_EQ}20199.02.10 ${CommandParameterName.time}${PARAMS_EQ}14:30]`,
      expectDateStr: '20199.02.10',
    },
    {
      cmd: `${realCtgTitle} [${CommandParameterName.date}${PARAMS_EQ}2019.02. ${CommandParameterName.time}${PARAMS_EQ}14:30] привет, это моя запись`,
      expectDateStr: '2019.02.',
    },
    {
      cmd: `${realCtgTitle} [${CommandParameterName.date}${PARAMS_EQ}2019.13.1 ${CommandParameterName.time}${PARAMS_EQ}14:30] привет, это моя запись`,
      expectDateStr: '2019.13.1',
    },
    {
      cmd: `${realCtgTitle} [${CommandParameterName.date}${PARAMS_EQ}2019.02.101 ${CommandParameterName.time}${PARAMS_EQ}14:30] привет, это моя запись`,
      expectDateStr: '2019.02.101',
    },
    {
      cmd: `${realCtgTitle} [${CommandParameterName.date}${PARAMS_EQ}20199.02.10 ${CommandParameterName.time}${PARAMS_EQ}14:30] привет, это моя запись`,
      expectDateStr: '20199.02.10',
    },
    {
      cmd: `${realSbcTitle} [${CommandParameterName.date}${PARAMS_EQ}2019.02. ${CommandParameterName.time}${PARAMS_EQ}14:30] привет, это моя запись`,
      expectDateStr: '2019.02.',
    },
    {
      cmd: `${realSbcTitle} [${CommandParameterName.date}${PARAMS_EQ}2019.13.1 ${CommandParameterName.time}${PARAMS_EQ}14:30] привет, это моя запись`,
      expectDateStr: '2019.13.1',
    },
    {
      cmd: `${realSbcTitle} [${CommandParameterName.date}${PARAMS_EQ}2019.02.101 ${CommandParameterName.time}${PARAMS_EQ}14:30] привет, это моя запись`,
      expectDateStr: '2019.02.101',
    },
    {
      cmd: `${realSbcTitle} [${CommandParameterName.date}${PARAMS_EQ}20199.02.10 ${CommandParameterName.time}${PARAMS_EQ}14:30] привет, это моя запись`,
      expectDateStr: '20199.02.10',
    },
  ];
  for (const msg_addnt_date_failure of msgs_addnt_date_failure) {
    it(`"${msg_addnt_date_failure.cmd}" should be rejected as date error`, () => {
      const ret = detectCMDNtAddParams(
        msg_addnt_date_failure.cmd,
        user_language,
        user_time_zone,
      );

      expect(ret).toStrictEqual(
        new ToTranslate(TrKey.PARAM_TYPE_DATE_ERROR, user_language, {
          parName: 'd',
          parValue: msg_addnt_date_failure.expectDateStr,
        }),
      );
    });
  }

  const msgs_addnt_time_failure = [
    {
      cmd: `${realCtgTitle} 15 [${CommandParameterName.date}${PARAMS_EQ}2019.02.10 ${CommandParameterName.time}${PARAMS_EQ}14:]`,
      expectTimeStr: '14:',
    },
    {
      cmd: `${realCtgTitle} 15 [${CommandParameterName.date}${PARAMS_EQ}2019.02.10 ${CommandParameterName.time}${PARAMS_EQ}14:60]`,
      expectTimeStr: '14:60',
    },
    {
      cmd: `${realCtgTitle} 15 [${CommandParameterName.date}${PARAMS_EQ}2019.02.10 ${CommandParameterName.time}${PARAMS_EQ}14:302]`,
      expectTimeStr: '14:302',
    },
    {
      cmd: `${realCtgTitle} 15 [${CommandParameterName.date}${PARAMS_EQ}2019.02.10 ${CommandParameterName.time}${PARAMS_EQ}34:30]`,
      expectTimeStr: '34:30',
    },
    {
      cmd: `${realSbcTitle} 15 [${CommandParameterName.date}${PARAMS_EQ}2019.02.10 ${CommandParameterName.time}${PARAMS_EQ}14:]`,
      expectTimeStr: '14:',
    },
    {
      cmd: `${realSbcTitle} 15 [${CommandParameterName.date}${PARAMS_EQ}2019.02.10 ${CommandParameterName.time}${PARAMS_EQ}14:60]`,
      expectTimeStr: '14:60',
    },
    {
      cmd: `${realSbcTitle} 15 [${CommandParameterName.date}${PARAMS_EQ}2019.02.10 ${CommandParameterName.time}${PARAMS_EQ}14:302]`,
      expectTimeStr: '14:302',
    },
    {
      cmd: `${realSbcTitle} 15 [${CommandParameterName.date}${PARAMS_EQ}2019.02.10 ${CommandParameterName.time}${PARAMS_EQ}34:30]`,
      expectTimeStr: '34:30',
    },
    {
      cmd: `${realCtgTitle} [${CommandParameterName.date}${PARAMS_EQ}2019.02.10 ${CommandParameterName.time}${PARAMS_EQ}14:] привет, это моя запись`,
      expectTimeStr: '14:',
    },
    {
      cmd: `${realCtgTitle} [${CommandParameterName.date}${PARAMS_EQ}2019.02.10 ${CommandParameterName.time}${PARAMS_EQ}14:60] привет, это моя запись`,
      expectTimeStr: '14:60',
    },
    {
      cmd: `${realCtgTitle} [${CommandParameterName.date}${PARAMS_EQ}2019.02.10 ${CommandParameterName.time}${PARAMS_EQ}14:302] привет, это моя запись`,
      expectTimeStr: '14:302',
    },
    {
      cmd: `${realCtgTitle} [${CommandParameterName.date}${PARAMS_EQ}2019.02.10 ${CommandParameterName.time}${PARAMS_EQ}34:30] привет, это моя запись`,
      expectTimeStr: '34:30',
    },
    {
      cmd: `${realSbcTitle} [${CommandParameterName.date}${PARAMS_EQ}2019.02.10 ${CommandParameterName.time}${PARAMS_EQ}14:] привет, это моя запись`,
      expectTimeStr: '14:',
    },
    {
      cmd: `${realSbcTitle} [${CommandParameterName.date}${PARAMS_EQ}2019.02.10 ${CommandParameterName.time}${PARAMS_EQ}14:60] привет, это моя запись`,
      expectTimeStr: '14:60',
    },
    {
      cmd: `${realSbcTitle} [${CommandParameterName.date}${PARAMS_EQ}2019.02.10 ${CommandParameterName.time}${PARAMS_EQ}14:302] привет, это моя запись`,
      expectTimeStr: '14:302',
    },
    {
      cmd: `${realSbcTitle} [${CommandParameterName.date}${PARAMS_EQ}2019.02.10 ${CommandParameterName.time}${PARAMS_EQ}34:30] привет, это моя запись`,
      expectTimeStr: '34:30',
    },
  ];
  for (const msg_addnt_time_failure of msgs_addnt_time_failure) {
    it(`"${msg_addnt_time_failure.cmd}" should be rejected as time error`, () => {
      const ret = detectCMDNtAddParams(
        msg_addnt_time_failure.cmd,
        user_language,
        user_time_zone,
      );

      expect(ret).toStrictEqual(
        new ToTranslate(TrKey.PARAM_TYPE_TIME_ERROR, user_language, {
          parName: 't',
          parValue: msg_addnt_time_failure.expectTimeStr,
        }),
      );
    });
  }

  const msgs_addnt_dt_conflict = [
    {
      cmd: `${realCtgTitle} 15 [${CommandParameterName.date}${PARAMS_EQ}2019.02.10 ${CommandParameterName.time}${PARAMS_EQ}14:00 ${CommandParameterName.datetime}${PARAMS_EQ}"2021.02.10 13:13"]`,
      expectParName: CommandParameterName.date,
      expectParConflictName: CommandParameterName.datetime,
    },
    {
      cmd: `${realCtgTitle} 15 [${CommandParameterName.time}${PARAMS_EQ}14:00 ${CommandParameterName.datetime}${PARAMS_EQ}"2021.02.10 13:13"]`,
      expectParName: CommandParameterName.time,
      expectParConflictName: CommandParameterName.datetime,
    },
  ];
  for (const msg_addnt_conflict of msgs_addnt_dt_conflict) {
    it(`"${msg_addnt_conflict.cmd}" should be rejected as of date and time conflict with datetime`, () => {
      const ret = detectCMDNtAddParams(
        msg_addnt_conflict.cmd,
        user_language,
        user_time_zone,
      );

      expect(ret).toStrictEqual(
        new ToTranslate(TrKey.PARAM_CONFLICT_ERROR, user_language, {
          parName: msg_addnt_conflict.expectParName,
          conflictParName: msg_addnt_conflict.expectParConflictName,
        }),
      );
    });
  }

  const msgs_addnt_rd_conflict = [
    {
      cmd: `${realCtgTitle} [${CommandParameterName.relativeDay}${PARAMS_EQ}14 ${CommandParameterName.date}${PARAMS_EQ}2021.02.10]`,
      expectParName: CommandParameterName.relativeDay,
      expectParConflictName: CommandParameterName.date,
    },
    {
      cmd: `${realCtgTitle} [${CommandParameterName.relativeDay}${PARAMS_EQ}14 ${CommandParameterName.datetime}${PARAMS_EQ}"2021.02.10 13:13"]`,
      expectParName: CommandParameterName.relativeDay,
      expectParConflictName: CommandParameterName.datetime,
    },
  ];
  for (const msg_addnt_conflict of msgs_addnt_rd_conflict) {
    it(`"${msg_addnt_conflict.cmd}" should be rejected as of relative day conflict with date/datetime`, () => {
      const ret = detectCMDNtAddParams(
        msg_addnt_conflict.cmd,
        user_language,
        user_time_zone,
      );

      expect(ret).toStrictEqual(
        new ToTranslate(TrKey.PARAM_CONFLICT_ERROR, user_language, {
          parName: msg_addnt_conflict.expectParName,
          conflictParName: msg_addnt_conflict.expectParConflictName,
        }),
      );
    });
  }

  const msgs_addnt_ctg_sbc_conflict = [
    {
      cmd: ` [${CommandParameterName.ctgId}${PARAMS_EQ}14 ${CommandParameterName.ctgTitle}${PARAMS_EQ}${realCtgTitle}]`,
      expectParName: CommandParameterName.ctgId,
      expectParConflictName: CommandParameterName.ctgTitle,
    },
    {
      cmd: ` [${CommandParameterName.ctgId}${PARAMS_EQ}14 ${CommandParameterName.sbcId}${PARAMS_EQ}41]`,
      expectParName: CommandParameterName.ctgId,
      expectParConflictName: CommandParameterName.sbcId,
    },
    {
      cmd: ` [${CommandParameterName.ctgId}${PARAMS_EQ}14 ${CommandParameterName.sbcTitle}${PARAMS_EQ}${realSbcTitle}]`,
      expectParName: CommandParameterName.ctgId,
      expectParConflictName: CommandParameterName.sbcTitle,
    },
    {
      cmd: ` [${CommandParameterName.ctgTitle}${PARAMS_EQ}${realCtgTitle} ${CommandParameterName.ctgId}${PARAMS_EQ}14]`,
      expectParName: CommandParameterName.ctgTitle,
      expectParConflictName: CommandParameterName.ctgId,
    },
    {
      cmd: ` [${CommandParameterName.ctgTitle}${PARAMS_EQ}${realCtgTitle} ${CommandParameterName.sbcId}${PARAMS_EQ}41]`,
      expectParName: CommandParameterName.ctgTitle,
      expectParConflictName: CommandParameterName.sbcId,
    },
    {
      cmd: ` [${CommandParameterName.ctgTitle}${PARAMS_EQ}${realCtgTitle} ${CommandParameterName.sbcTitle}${PARAMS_EQ}${realSbcTitle}]`,
      expectParName: CommandParameterName.ctgTitle,
      expectParConflictName: CommandParameterName.sbcTitle,
    },
    {
      cmd: ` [${CommandParameterName.sbcId}${PARAMS_EQ}14 ${CommandParameterName.ctgTitle}${PARAMS_EQ}${realCtgTitle}]`,
      expectParName: CommandParameterName.sbcId,
      expectParConflictName: CommandParameterName.ctgTitle,
    },
    {
      cmd: ` [${CommandParameterName.sbcId}${PARAMS_EQ}14 ${CommandParameterName.ctgId}${PARAMS_EQ}41]`,
      expectParName: CommandParameterName.sbcId,
      expectParConflictName: CommandParameterName.ctgId,
    },
    {
      cmd: ` [${CommandParameterName.sbcId}${PARAMS_EQ}14 ${CommandParameterName.sbcTitle}${PARAMS_EQ}${realSbcTitle}]`,
      expectParName: CommandParameterName.sbcId,
      expectParConflictName: CommandParameterName.sbcTitle,
    },
    {
      cmd: ` [${CommandParameterName.sbcTitle}${PARAMS_EQ}${realSbcTitle} ${CommandParameterName.ctgId}${PARAMS_EQ}14]`,
      expectParName: CommandParameterName.sbcTitle,
      expectParConflictName: CommandParameterName.ctgId,
    },
    {
      cmd: ` [${CommandParameterName.sbcTitle}${PARAMS_EQ}${realSbcTitle} ${CommandParameterName.sbcId}${PARAMS_EQ}41]`,
      expectParName: CommandParameterName.sbcTitle,
      expectParConflictName: CommandParameterName.sbcId,
    },
    {
      cmd: ` [${CommandParameterName.sbcTitle}${PARAMS_EQ}${realSbcTitle} ${CommandParameterName.ctgTitle}${PARAMS_EQ}${realCtgTitle}]`,
      expectParName: CommandParameterName.sbcTitle,
      expectParConflictName: CommandParameterName.ctgTitle,
    },
  ];
  for (const msg_do_ctg_conflict of msgs_addnt_ctg_sbc_conflict) {
    it(`"${msg_do_ctg_conflict.cmd}" should be rejected as of ctg/sbc id conflict with ctg/sbc title`, () => {
      const ret = detectCMDNtAddParams(
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
