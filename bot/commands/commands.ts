import {
  addDays,
  addMonths,
  addYears,
  fromUnixTime,
  setDate,
  setMonth,
  setYear,
  subDays,
  subMonths,
  subYears,
} from 'date-fns';

import { TrKey } from '../../i18n/keys';
import {
  ToTranslate,
  parseLanguage,
  getLanguages,
  ToTranslateUnion,
} from '../../i18n/i18n';
import { MAX_TIME_ZONE_LENGTH, createUpdUser } from '../../db/models/userModel';
import { printCalcSummary, calcSummary } from '../../db/models/noteModel';
// import { encodeToken } from '../../jwt';

import { BotCtxT } from '../bot';
import {
  generateHelpInstruction,
  generateFatherInstruction,
  generateInvInstruction,
  BotCommandEnum,
  toStatisticSumm,
  toHelpCmdInstr,
  printSettings,
  TrCom,
  generateBotCmdToTranslates,
  ListHeaderPropsT,
} from '../helpers';
import {
  detectCMDStatParameters,
  detectCMDHelpParameters,
  safeSplitString,
  CommandParameterName,
  safeSplitString2,
} from '../parameters';
import {
  calcStartEndDay,
  calcStartEndMonth,
  calcStartEndYear,
  ReturnStartEndDatetime,
  tryToFindTimeZone,
  parseWeekStartsOn,
  formatDatetime,
  newDTDate,
} from '../datetime';
import { printNumber } from '../print';

export async function help({
  msgText,
  dbUserLang,
  dbUserTimeZone,
}: BotCtxT): Promise<ToTranslateUnion> {
  const msgParts = safeSplitString(msgText);
  if (msgParts.length <= 0 || msgParts.length > 3) {
    return generateInvInstruction(
      TrKey.INVALID_HELP_CMD,
      BotCommandEnum.help,
      dbUserLang,
    );
  }
  const result = detectCMDHelpParameters(msgText, dbUserLang, dbUserTimeZone);
  if (result instanceof ToTranslate) {
    return result;
  }
  const { bf, cmd } = result.detectedParams;
  if (bf) {
    return generateFatherInstruction();
  }
  const newMsgText = result.detectedPramsFound ? result.rest : msgText;

  let [, textCmd] = safeSplitString(newMsgText);
  if (cmd) {
    if (textCmd) {
      return new ToTranslate(TrKey.PARAM_AMBIGUOUS_ERROR, dbUserLang, {
        parName: CommandParameterName.command,
      });
    }
    textCmd = cmd;
  }
  if (generateBotCmdToTranslates(TrCom(textCmd)).length) {
    return toHelpCmdInstr(TrCom(textCmd), dbUserLang);
  }
  return generateHelpInstruction(dbUserLang);
}

export async function setLang({
  db,
  msgText,
  fromIdStr,
  dbUserLang,
}: BotCtxT): Promise<ToTranslateUnion> {
  const msgParts = safeSplitString(msgText);
  if (msgParts.length <= 1 || msgParts.length >= 3) {
    return generateInvInstruction(
      TrKey.INVALID_SET_LANG_CMD,
      BotCommandEnum.setlang,
      dbUserLang,
      {
        languageCode: dbUserLang,
      },
    );
  }
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [command, langStr] = msgParts;

  let language;
  try {
    language = parseLanguage(langStr, true);
  } catch (err) {
    return new ToTranslate(TrKey.INVALID_LANGUAGE, dbUserLang, {
      languages: getLanguages(),
      language: langStr,
    });
  }

  const dbUser = await db.users.findById(fromIdStr);
  if (!dbUser) {
    return new ToTranslate(TrKey.UNKONWN_USER, dbUserLang);
  }
  const oldLanguage = dbUser.language_code;
  dbUser.language_code = language;
  const udpatedDBUser = await db.users.update(createUpdUser(dbUser));
  if (udpatedDBUser) {
    return new ToTranslate(TrKey.LANGUAGE_UPDATED, language, {
      oldLanguage,
      newLanguage: udpatedDBUser.language_code,
    });
  } else {
    return new ToTranslate(TrKey.USER_GONE, dbUserLang, {
      first_name: dbUser.first_name,
    });
  }
}
export async function getStatisticSumm({
  db,
  msgText,
  msgDatetimeUnix,
  peerIdStr,
  dbUserLang,
  dbUserTimeZone,
  dbUserWeekStartsOn,
}: BotCtxT): Promise<ToTranslateUnion> {
  const msgParts = safeSplitString(msgText);
  if (msgParts.length <= 0 || msgParts.length >= 6) {
    return generateInvInstruction(
      TrKey.INVALID_STATS_CMD,
      BotCommandEnum.stats,
      dbUserLang,
    );
  }

  const result = detectCMDStatParameters(msgText, dbUserLang, dbUserTimeZone);
  if (result instanceof ToTranslate) {
    return result;
  }
  const {
    q,
    ctg_q,
    sbc_q,
    ctg_qt,
    ctg_qd,
    sbc_qt,
    sbc_qd,
    nt_qt,
    d,
    s_d,
    e_d,
    rd,
    rm,
    ry,
  } = result.detectedParams;
  const { rd: rd_raw, rm: rm_raw, ry: ry_raw } = result.detectedRawParams;
  const {
    q: db_q,
    ctg_q: db_ctg_q,
    sbc_q: db_sbc_q,
    ctg_qt: db_ctg_qt,
    sbc_qt: db_sbc_qt,
    ctg_qd: db_ctg_qd,
    sbc_qd: db_sbc_qd,
    nt_qt: db_nt_qt,
  } = result.detectedDBParams;
  let query = q;
  let dbQuery = db_q;
  const newMsgText = result.detectedPramsFound ? result.rest : msgText;
  const [, splitQuery] = safeSplitString2(newMsgText);
  if (q && splitQuery) {
    return new ToTranslate(TrKey.PARAM_AMBIGUOUS_ERROR, dbUserLang, {
      parName: CommandParameterName.query,
    });
  }
  if (ctg_q && splitQuery) {
    return new ToTranslate(TrKey.PARAM_AMBIGUOUS_ERROR, dbUserLang, {
      parName: CommandParameterName.ctgQuery,
    });
  }
  if (sbc_q && splitQuery) {
    return new ToTranslate(TrKey.PARAM_AMBIGUOUS_ERROR, dbUserLang, {
      parName: CommandParameterName.sbcQuery,
    });
  }
  if (ctg_qt && splitQuery) {
    return new ToTranslate(TrKey.PARAM_AMBIGUOUS_ERROR, dbUserLang, {
      parName: CommandParameterName.ctgQueryTitle,
    });
  }
  if (ctg_qd && splitQuery) {
    return new ToTranslate(TrKey.PARAM_AMBIGUOUS_ERROR, dbUserLang, {
      parName: CommandParameterName.ctgQueryDescr,
    });
  }
  if (sbc_qt && splitQuery) {
    return new ToTranslate(TrKey.PARAM_AMBIGUOUS_ERROR, dbUserLang, {
      parName: CommandParameterName.sbcQueryTitle,
    });
  }
  if (sbc_qd && splitQuery) {
    return new ToTranslate(TrKey.PARAM_AMBIGUOUS_ERROR, dbUserLang, {
      parName: CommandParameterName.sbcQueryDescr,
    });
  }
  if (nt_qt && splitQuery) {
    return new ToTranslate(TrKey.PARAM_AMBIGUOUS_ERROR, dbUserLang, {
      parName: CommandParameterName.ntQueryText,
    });
  }
  if (splitQuery) {
    query = splitQuery;
    dbQuery = splitQuery;
  }
  let messageDate: Date = fromUnixTime(msgDatetimeUnix);
  let { startUserDateTime, startUTCDateTime, endUserDateTime, endUTCDateTime } =
    calcStartEndMonth({
      timeZone: dbUserTimeZone,
      weekStartsOn: dbUserWeekStartsOn,
      serverNow: messageDate,
    });
  if (e_d) {
    const calcResult = calcStartEndDay({
      timeZone: dbUserTimeZone,
      weekStartsOn: dbUserWeekStartsOn,
      serverNow: e_d,
    });
    startUserDateTime = calcResult.startUserDateTime;
    startUTCDateTime = calcResult.startUTCDateTime;
    endUserDateTime = calcResult.endUserDateTime;
    endUTCDateTime = calcResult.endUTCDateTime;
  }
  if (s_d) {
    const calcResult = calcStartEndDay({
      timeZone: dbUserTimeZone,
      weekStartsOn: dbUserWeekStartsOn,
      serverNow: s_d,
    });
    startUserDateTime = calcResult.startUserDateTime;
    startUTCDateTime = calcResult.startUTCDateTime;
  }
  let calcResult: ReturnStartEndDatetime | undefined;
  if (d) {
    calcResult = calcStartEndDay({
      timeZone: dbUserTimeZone,
      weekStartsOn: dbUserWeekStartsOn,
      serverNow: d,
    });
  } else if (typeof rd === 'number' && rd_raw) {
    if (rd === 0) {
      // skip current day
    } else {
      if (rd > 0 && rd_raw.startsWith('+')) {
        messageDate = addDays(messageDate, rd);
      } else if (rd < 0 && rd_raw.startsWith('-')) {
        messageDate = subDays(messageDate, Math.abs(rd));
      } else if (rd > 0) {
        const wasMonth = messageDate.getMonth();
        messageDate = setDate(messageDate, rd);
        if (wasMonth !== messageDate.getMonth()) {
          return new ToTranslate(
            TrKey.RELATIVE_DAY_OF_MONTH_ERROR,
            dbUserLang,
            {
              relativeDay: rd,
            },
          );
        }
      }
    }
    calcResult = calcStartEndDay({
      timeZone: dbUserTimeZone,
      weekStartsOn: dbUserWeekStartsOn,
      serverNow: messageDate,
    });
  } else if (typeof rm === 'number' && rm_raw) {
    if (rm === 0) {
      // skip current month
    } else {
      if (rm > 0 && rm_raw.startsWith('+')) {
        messageDate = addMonths(messageDate, rm);
      } else if (rm < 0 && rm_raw.startsWith('-')) {
        messageDate = subMonths(messageDate, Math.abs(rm));
      } else if (rm > 0) {
        const wasYear = messageDate.getFullYear();
        messageDate = setMonth(messageDate, rm - 1);
        if (wasYear !== messageDate.getFullYear()) {
          return new ToTranslate(
            TrKey.RELATIVE_MONTH_OF_YEAR_ERROR,
            dbUserLang,
            {
              relativeMonth: rm,
            },
          );
        }
      }
    }
    calcResult = calcStartEndMonth({
      timeZone: dbUserTimeZone,
      weekStartsOn: dbUserWeekStartsOn,
      serverNow: messageDate,
    });
  } else if (typeof ry === 'number' && ry_raw) {
    if (ry === 0) {
      // skip current year
    } else {
      if (ry > 0 && ry_raw.startsWith('+')) {
        messageDate = addYears(messageDate, ry);
      } else if (ry < 0 && ry_raw.startsWith('-')) {
        messageDate = subYears(messageDate, Math.abs(ry));
      } else if (ry > 0) {
        messageDate = setYear(messageDate, ry);
      }
      if (messageDate.getFullYear() < 0) {
        return new ToTranslate(TrKey.RELATIVE_YEAR_ERROR, dbUserLang, {
          relativeYear: rm,
        });
      }
    }
    calcResult = calcStartEndYear({
      timeZone: dbUserTimeZone,
      weekStartsOn: dbUserWeekStartsOn,
      serverNow: messageDate,
    });
  }
  if (calcResult) {
    startUserDateTime = calcResult.startUserDateTime;
    startUTCDateTime = calcResult.startUTCDateTime;
    endUserDateTime = calcResult.endUserDateTime;
    endUTCDateTime = calcResult.endUTCDateTime;
  }
  const serverNow = newDTDate();

  const printResult: ListHeaderPropsT = {
    query,
    ctgQuery: ctg_q,
    sbcQuery: sbc_q,
    ctgQueryTitle: ctg_qt,
    sbcQueryTitle: sbc_qt,
    ctgQueryDescr: ctg_qd,
    sbcQueryDescr: sbc_qd,
    ntQueryText: nt_qt,
    startDateTime: startUserDateTime,
    endDateTime: endUserDateTime,
  };

  const [dbNotesJoinCtgSbc, dbBalance] = await Promise.all([
    db.notes.listJoinCtgSbc({
      table_peer_id: peerIdStr,
      peer_id: peerIdStr,
      start_datetime: startUTCDateTime,
      end_datetime: endUTCDateTime,
      query: dbQuery,
      ctgQuery: db_ctg_q,
      sbcQuery: db_sbc_q,
      ctgQueryTitle: db_ctg_qt,
      sbcQueryTitle: db_sbc_qt,
      ctgQueryDescr: db_ctg_qd,
      sbcQueryDescr: db_sbc_qd,
      ntQueryText: db_nt_qt,
      in_archived: null,
    }),
    db.notes.balance({
      table_peer_id: peerIdStr,
      peer_id: peerIdStr,
      end_datetime: endUTCDateTime,
    }),
  ]);
  Object.assign(printResult, { ntCount: dbNotesJoinCtgSbc.length });
  return toStatisticSumm(
    printResult,
    Number(dbBalance.counted) > 0
      ? printCalcSummary(calcSummary(dbNotesJoinCtgSbc), dbUserLang)
      : new ToTranslate(TrKey.EMPTY_SUMMARY, dbUserLang),
    {
      balance: printNumber(Number(dbBalance.balance), dbUserLang),
      endDateTime: formatDatetime(
        serverNow > endUTCDateTime ? endUTCDateTime : serverNow,
        dbUserTimeZone,
      ),
    },
    dbUserLang,
  );
}

export async function setTimeZone({
  db,
  msgText,
  fromIdStr,
  dbUserLang,
  dbUserTimeZone,
}: BotCtxT): Promise<ToTranslateUnion> {
  const msgParts = safeSplitString(msgText);

  if (msgParts.length <= 1 || msgParts.length >= 3) {
    return generateInvInstruction(
      TrKey.INVALID_SET_TIMEZONE_CMD,
      BotCommandEnum.settimezone,
      dbUserLang,
      {
        timeZone: dbUserTimeZone,
      },
    );
  }
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [command, timeZoneStr] = msgParts;
  if (timeZoneStr.length > MAX_TIME_ZONE_LENGTH) {
    return new ToTranslate(TrKey.TIME_ZONE_MAX_ERROR, dbUserLang, {
      max: MAX_TIME_ZONE_LENGTH,
    });
  }

  const timeZones = tryToFindTimeZone(timeZoneStr);
  const tzLength = timeZones.length;
  if (tzLength === 1) {
    const timeZone = timeZones[0];
    const dbUser = await db.users.findById(fromIdStr);
    if (!dbUser) {
      return new ToTranslate(TrKey.UNKONWN_USER, dbUserLang);
    }
    const oldTimeZone = dbUser.time_zone;
    dbUser.time_zone = timeZone;
    const updatedDBUser = await db.users.update(createUpdUser(dbUser));
    if (updatedDBUser) {
      return new ToTranslate(TrKey.TIME_ZONE_UPDATED, dbUserLang, {
        oldTimeZone,
        newTimeZone: updatedDBUser.time_zone,
      });
    } else {
      return new ToTranslate(TrKey.USER_GONE, dbUserLang, {
        first_name: dbUser.first_name,
      });
    }
  } else if (tzLength < 1) {
    return new ToTranslate(TrKey.TIME_ZONE_FIND_ERROR, dbUserLang, {
      text: timeZoneStr,
    });
  } else {
    return new ToTranslate(TrKey.TIME_ZONE_AMB_ERROR, dbUserLang, {
      timeZones: timeZones.slice(0, 5).join('\n'),
    });
  }
}

export async function setWeekStartsOn({
  db,
  msgText,
  fromIdStr,
  dbUserLang,
  dbUserWeekStartsOn,
}: BotCtxT): Promise<ToTranslateUnion> {
  const msgParts = safeSplitString(msgText);
  if (msgParts.length <= 1 || msgParts.length >= 3) {
    return generateInvInstruction(
      TrKey.INVALID_SET_WEEK_STARTS_ON_CMD,
      BotCommandEnum.setweekstartson,
      dbUserLang,
      {
        weekStartsOn: dbUserWeekStartsOn,
      },
    );
  }
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [command, weekStartsOnStr] = msgParts;

  let weekStartsOn;
  try {
    weekStartsOn = parseWeekStartsOn(weekStartsOnStr, true);
  } catch (err) {
    return new ToTranslate(TrKey.INVALID_WEEK_STARTS_ON, dbUserLang, {
      weekStartsOn: weekStartsOnStr,
    });
  }

  const dbUser = await db.users.findById(fromIdStr);
  if (!dbUser) {
    return new ToTranslate(TrKey.UNKONWN_USER, dbUserLang);
  }
  const oldWeeksStartsOn = dbUser.week_starts_on;
  dbUser.week_starts_on = weekStartsOn;
  const updatedDBUser = await db.users.update(createUpdUser(dbUser));
  if (updatedDBUser) {
    return new ToTranslate(TrKey.WEEK_STARTS_ON_UPDATED, dbUserLang, {
      oldWeeksStartsOn,
      newWeeksStartsOn: updatedDBUser.week_starts_on,
    });
  } else {
    return new ToTranslate(TrKey.USER_GONE, dbUserLang, {
      first_name: dbUser.first_name,
    });
  }
}

export async function getSettings({
  fromIdStr,
  peerIdStr,
  dbUserLang,
  dbUserWeekStartsOn,
  dbUserTimeZone,
  dbUser,
}: BotCtxT): Promise<ToTranslateUnion> {
  return printSettings({
    dbUserLang,
    userId: fromIdStr,
    peerId: peerIdStr,
    quota: dbUser && dbUser.quota,
    languageCode: dbUserLang,
    timeZone: dbUserTimeZone,
    weekStartsOn: dbUserWeekStartsOn,
  });
}
