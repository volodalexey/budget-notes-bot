import { TrKey } from '../../i18n/keys';
import { ToTranslate } from '../../i18n/i18n';
import { BotCommandEnum, toCommand } from '../helpers';
import {
  CommandParameterName,
  detectCMDNtUpdParams,
  PARAMS_EQ,
} from '../parameters';
import { createAppTestConfig } from '../../config/config';

describe('Check update note command parameters parser', () => {
  const {
    test: { user_language, user_time_zone },
  } = createAppTestConfig();
  const cmd_updnt = toCommand(BotCommandEnum.updnt);

  const msgs_ntupd_date_failure = [
    {
      cmd: `${cmd_updnt} [${CommandParameterName.ntId}${PARAMS_EQ}66 ${CommandParameterName.date}${PARAMS_EQ}2019.02. ${CommandParameterName.time}${PARAMS_EQ}14:30]`,
      errorDateStr: '2019.02.',
    },
    {
      cmd: `${cmd_updnt} [${CommandParameterName.ntId}${PARAMS_EQ}66 ${CommandParameterName.date}${PARAMS_EQ}2019.13.1 ${CommandParameterName.time}${PARAMS_EQ}14:30]`,
      errorDateStr: '2019.13.1',
    },
    {
      cmd: `${cmd_updnt} [${CommandParameterName.ntId}${PARAMS_EQ}66 ${CommandParameterName.date}${PARAMS_EQ}2019.02.101 ${CommandParameterName.time}${PARAMS_EQ}14:30]`,
      errorDateStr: '2019.02.101',
    },
    {
      cmd: `${cmd_updnt} [${CommandParameterName.ntId}${PARAMS_EQ}66 ${CommandParameterName.date}${PARAMS_EQ}20199.02.10 ${CommandParameterName.time}${PARAMS_EQ}14:30]`,
      errorDateStr: '20199.02.10',
    },
    {
      cmd: `${cmd_updnt} [${CommandParameterName.ntId}${PARAMS_EQ}66 ${CommandParameterName.date}${PARAMS_EQ}2019.02. ${CommandParameterName.time}${PARAMS_EQ}14:30]`,
      errorDateStr: '2019.02.',
    },
    {
      cmd: `${cmd_updnt} [${CommandParameterName.ntId}${PARAMS_EQ}66 ${CommandParameterName.date}${PARAMS_EQ}2019.13.1 ${CommandParameterName.time}${PARAMS_EQ}14:30]`,
      errorDateStr: '2019.13.1',
    },
    {
      cmd: `${cmd_updnt} [${CommandParameterName.ntId}${PARAMS_EQ}66 ${CommandParameterName.date}${PARAMS_EQ}2019.02.101 ${CommandParameterName.time}${PARAMS_EQ}14:30]`,
      errorDateStr: '2019.02.101',
    },
    {
      cmd: `${cmd_updnt} [${CommandParameterName.ntId}${PARAMS_EQ}66 ${CommandParameterName.date}${PARAMS_EQ}20199.02.10 ${CommandParameterName.time}${PARAMS_EQ}14:30]`,
      errorDateStr: '20199.02.10',
    },
    {
      cmd: `${cmd_updnt} [${CommandParameterName.ntId}${PARAMS_EQ}66 ${CommandParameterName.date}${PARAMS_EQ}2019.02. ${CommandParameterName.time}${PARAMS_EQ}14:30] привет, это моя запись`,
      errorDateStr: '2019.02.',
    },
    {
      cmd: `${cmd_updnt} [${CommandParameterName.ntId}${PARAMS_EQ}66 ${CommandParameterName.date}${PARAMS_EQ}2019.13.1 ${CommandParameterName.time}${PARAMS_EQ}14:30] привет, это моя запись`,
      errorDateStr: '2019.13.1',
    },
    {
      cmd: `${cmd_updnt} [${CommandParameterName.ntId}${PARAMS_EQ}66 ${CommandParameterName.date}${PARAMS_EQ}2019.02.101 ${CommandParameterName.time}${PARAMS_EQ}14:30] привет, это моя запись`,
      errorDateStr: '2019.02.101',
    },
    {
      cmd: `${cmd_updnt} [${CommandParameterName.ntId}${PARAMS_EQ}66 ${CommandParameterName.date}${PARAMS_EQ}20199.02.10 ${CommandParameterName.time}${PARAMS_EQ}14:30] привет, это моя запись`,
      errorDateStr: '20199.02.10',
    },
    {
      cmd: `${cmd_updnt} [${CommandParameterName.ntId}${PARAMS_EQ}66 ${CommandParameterName.date}${PARAMS_EQ}2019.02. ${CommandParameterName.time}${PARAMS_EQ}14:30] привет, это моя запись`,
      errorDateStr: '2019.02.',
    },
    {
      cmd: `${cmd_updnt} [${CommandParameterName.ntId}${PARAMS_EQ}66 ${CommandParameterName.date}${PARAMS_EQ}2019.13.1 ${CommandParameterName.time}${PARAMS_EQ}14:30] привет, это моя запись`,
      errorDateStr: '2019.13.1',
    },
    {
      cmd: `${cmd_updnt} [${CommandParameterName.ntId}${PARAMS_EQ}66 ${CommandParameterName.date}${PARAMS_EQ}2019.02.101 ${CommandParameterName.time}${PARAMS_EQ}14:30] привет, это моя запись`,
      errorDateStr: '2019.02.101',
    },
    {
      cmd: `${cmd_updnt} [${CommandParameterName.ntId}${PARAMS_EQ}66 ${CommandParameterName.date}${PARAMS_EQ}20199.02.10 ${CommandParameterName.time}${PARAMS_EQ}14:30] привет, это моя запись`,
      errorDateStr: '20199.02.10',
    },
  ];
  for (const msg_addnt_date_failure of msgs_ntupd_date_failure) {
    it(`"${msg_addnt_date_failure.cmd}" should be rejected as date error`, () => {
      const ret = detectCMDNtUpdParams(
        msg_addnt_date_failure.cmd,
        user_language,
        user_time_zone,
      );

      expect(ret).toStrictEqual(
        new ToTranslate(TrKey.PARAM_TYPE_DATE_ERROR, user_language, {
          parName: 'd',
          parValue: msg_addnt_date_failure.errorDateStr,
        }),
      );
    });
  }

  const msgs_ntupd_time_failure = [
    {
      cmd: `${cmd_updnt} [${CommandParameterName.ntId}${PARAMS_EQ}66 ${CommandParameterName.date}${PARAMS_EQ}2019.02.10 ${CommandParameterName.time}${PARAMS_EQ}14:]`,
      errorTimeStr: '14:',
    },
    {
      cmd: `${cmd_updnt} [${CommandParameterName.ntId}${PARAMS_EQ}66 ${CommandParameterName.date}${PARAMS_EQ}2019.02.10 ${CommandParameterName.time}${PARAMS_EQ}14:60]`,
      errorTimeStr: '14:60',
    },
    {
      cmd: `${cmd_updnt} [${CommandParameterName.ntId}${PARAMS_EQ}66 ${CommandParameterName.date}${PARAMS_EQ}2019.02.10 ${CommandParameterName.time}${PARAMS_EQ}14:302]`,
      errorTimeStr: '14:302',
    },
    {
      cmd: `${cmd_updnt} [${CommandParameterName.ntId}${PARAMS_EQ}66 ${CommandParameterName.date}${PARAMS_EQ}2019.02.10 ${CommandParameterName.time}${PARAMS_EQ}34:30]`,
      errorTimeStr: '34:30',
    },
    {
      cmd: `${cmd_updnt} [${CommandParameterName.ntId}${PARAMS_EQ}66 ${CommandParameterName.date}${PARAMS_EQ}2019.02.10 ${CommandParameterName.time}${PARAMS_EQ}14:]`,
      errorTimeStr: '14:',
    },
    {
      cmd: `${cmd_updnt} [${CommandParameterName.ntId}${PARAMS_EQ}66 ${CommandParameterName.date}${PARAMS_EQ}2019.02.10 ${CommandParameterName.time}${PARAMS_EQ}14:60]`,
      errorTimeStr: '14:60',
    },
    {
      cmd: `${cmd_updnt} [${CommandParameterName.ntId}${PARAMS_EQ}66 ${CommandParameterName.date}${PARAMS_EQ}2019.02.10 ${CommandParameterName.time}${PARAMS_EQ}14:302]`,
      errorTimeStr: '14:302',
    },
    {
      cmd: `${cmd_updnt} [${CommandParameterName.ntId}${PARAMS_EQ}66 ${CommandParameterName.date}${PARAMS_EQ}2019.02.10 ${CommandParameterName.time}${PARAMS_EQ}34:30]`,
      errorTimeStr: '34:30',
    },
    {
      cmd: `${cmd_updnt} [${CommandParameterName.ntId}${PARAMS_EQ}66 ${CommandParameterName.date}${PARAMS_EQ}2019.02.10 ${CommandParameterName.time}${PARAMS_EQ}14:] привет, это моя запись`,
      errorTimeStr: '14:',
    },
    {
      cmd: `${cmd_updnt} [${CommandParameterName.ntId}${PARAMS_EQ}66 ${CommandParameterName.date}${PARAMS_EQ}2019.02.10 ${CommandParameterName.time}${PARAMS_EQ}14:60] привет, это моя запись`,
      errorTimeStr: '14:60',
    },
    {
      cmd: `${cmd_updnt} [${CommandParameterName.ntId}${PARAMS_EQ}66 ${CommandParameterName.date}${PARAMS_EQ}2019.02.10 ${CommandParameterName.time}${PARAMS_EQ}14:302] привет, это моя запись`,
      errorTimeStr: '14:302',
    },
    {
      cmd: `${cmd_updnt} [${CommandParameterName.ntId}${PARAMS_EQ}66 ${CommandParameterName.date}${PARAMS_EQ}2019.02.10 ${CommandParameterName.time}${PARAMS_EQ}34:30] привет, это моя запись`,
      errorTimeStr: '34:30',
    },
    {
      cmd: `${cmd_updnt} [${CommandParameterName.ntId}${PARAMS_EQ}66 ${CommandParameterName.date}${PARAMS_EQ}2019.02.10 ${CommandParameterName.time}${PARAMS_EQ}14:] привет, это моя запись`,
      errorTimeStr: '14:',
    },
    {
      cmd: `${cmd_updnt} [${CommandParameterName.ntId}${PARAMS_EQ}66 ${CommandParameterName.date}${PARAMS_EQ}2019.02.10 ${CommandParameterName.time}${PARAMS_EQ}14:60] привет, это моя запись`,
      errorTimeStr: '14:60',
    },
    {
      cmd: `${cmd_updnt} [${CommandParameterName.ntId}${PARAMS_EQ}66 ${CommandParameterName.date}${PARAMS_EQ}2019.02.10 ${CommandParameterName.time}${PARAMS_EQ}14:302] привет, это моя запись`,
      errorTimeStr: '14:302',
    },
    {
      cmd: `${cmd_updnt} [${CommandParameterName.ntId}${PARAMS_EQ}66 ${CommandParameterName.date}${PARAMS_EQ}2019.02.10 ${CommandParameterName.time}${PARAMS_EQ}34:30] привет, это моя запись`,
      errorTimeStr: '34:30',
    },
  ];
  for (const msg_addnt_time_failure of msgs_ntupd_time_failure) {
    it(`"${msg_addnt_time_failure.cmd}" should be rejected as time error`, () => {
      const ret = detectCMDNtUpdParams(
        msg_addnt_time_failure.cmd,
        user_language,
        user_time_zone,
      );

      expect(ret).toStrictEqual(
        new ToTranslate(TrKey.PARAM_TYPE_TIME_ERROR, user_language, {
          parName: 't',
          parValue: msg_addnt_time_failure.errorTimeStr,
        }),
      );
    });
  }

  const msgs_ntupd_conflict = [
    {
      cmd: `${cmd_updnt} [${CommandParameterName.ntId}${PARAMS_EQ}66 ${CommandParameterName.date}${PARAMS_EQ}2019.02.10 ${CommandParameterName.time}${PARAMS_EQ}14:00 ${CommandParameterName.datetime}${PARAMS_EQ}"2021.02.10 13:13"]`,
      expectParName: CommandParameterName.date,
      expectParConflictName: CommandParameterName.datetime,
    },
    {
      cmd: `${cmd_updnt} [${CommandParameterName.ntId}${PARAMS_EQ}66 ${CommandParameterName.time}${PARAMS_EQ}14:00 ${CommandParameterName.datetime}${PARAMS_EQ}"2021.02.10 13:13"]`,
      expectParName: CommandParameterName.time,
      expectParConflictName: CommandParameterName.datetime,
    },
  ];
  for (const msg_ntupd_conflict of msgs_ntupd_conflict) {
    it(`"${msg_ntupd_conflict.cmd}" should be rejected as of date and time conflict with datetime`, () => {
      const ret = detectCMDNtUpdParams(
        msg_ntupd_conflict.cmd,
        user_language,
        user_time_zone,
      );

      expect(ret).toStrictEqual(
        new ToTranslate(TrKey.PARAM_CONFLICT_ERROR, user_language, {
          parName: msg_ntupd_conflict.expectParName,
          conflictParName: msg_ntupd_conflict.expectParConflictName,
        }),
      );
    });
  }

  const msgs_ntupd_id_failure = [
    {
      cmd: `${cmd_updnt} [${CommandParameterName.ntId}${PARAMS_EQ}66.. ${CommandParameterName.date}${PARAMS_EQ}2019.02.10]`,
      errorIdStr: '66..',
    },
    {
      cmd: `${cmd_updnt} [${CommandParameterName.ntId}${PARAMS_EQ}66, ${CommandParameterName.date}${PARAMS_EQ}2019.02.10]`,
      errorIdStr: '66,',
    },
    {
      cmd: `${cmd_updnt} [${CommandParameterName.ntId}${PARAMS_EQ}66,, ${CommandParameterName.date}${PARAMS_EQ}2019.02.10]`,
      errorIdStr: '66,,',
    },
    {
      cmd: `${cmd_updnt} [${CommandParameterName.ntId}${PARAMS_EQ}6,4 ${CommandParameterName.date}${PARAMS_EQ}2019.02.10]`,
      errorIdStr: '6,4',
    },
    {
      cmd: `${cmd_updnt} [${CommandParameterName.ntId}${PARAMS_EQ}6.5 ${CommandParameterName.date}${PARAMS_EQ}2019.02.10]`,
      errorIdStr: '6.5',
    },
    {
      cmd: `${cmd_updnt} [${CommandParameterName.ntId}${PARAMS_EQ}-6 ${CommandParameterName.date}${PARAMS_EQ}2019.02.10]`,
      errorIdStr: '-6',
    },
  ];
  for (const msg_ntupd_id_failure of msgs_ntupd_id_failure) {
    it(`"${msg_ntupd_id_failure.cmd}" should be rejected as not id error`, () => {
      const ret = detectCMDNtUpdParams(
        msg_ntupd_id_failure.cmd,
        user_language,
        user_time_zone,
      );

      expect(ret).toStrictEqual(
        new ToTranslate(TrKey.PARAM_TYPE_INT_POS_ERROR, user_language, {
          parName: 'nt_id',
          parValue: msg_ntupd_id_failure.errorIdStr,
        }),
      );
    });
  }

  const msgs_updnt_rd_conflict = [
    {
      cmd: `realCtgTitle [${CommandParameterName.relativeDay}${PARAMS_EQ}14 ${CommandParameterName.date}${PARAMS_EQ}2021.02.10]`,
      expectParName: CommandParameterName.relativeDay,
      expectParConflictName: CommandParameterName.date,
    },
    {
      cmd: `realCtgTitle [${CommandParameterName.relativeDay}${PARAMS_EQ}14 ${CommandParameterName.datetime}${PARAMS_EQ}"2021.02.10 13:13"]`,
      expectParName: CommandParameterName.relativeDay,
      expectParConflictName: CommandParameterName.datetime,
    },
  ];
  for (const msg_updnt_conflict of msgs_updnt_rd_conflict) {
    it(`"${msg_updnt_conflict.cmd}" should be rejected as of relative day conflict with date/datetime`, () => {
      const ret = detectCMDNtUpdParams(
        msg_updnt_conflict.cmd,
        user_language,
        user_time_zone,
      );

      expect(ret).toStrictEqual(
        new ToTranslate(TrKey.PARAM_CONFLICT_ERROR, user_language, {
          parName: msg_updnt_conflict.expectParName,
          conflictParName: msg_updnt_conflict.expectParConflictName,
        }),
      );
    });
  }
});
