import {
  fromUnixTime,
  addDays,
  subDays,
  setDate,
  addMonths,
  subMonths,
  setMonth,
  addYears,
  subYears,
  setYear,
} from 'date-fns';

import { BotCtxT, NextFunctionT } from '../bot';
import {
  composeAddNote,
  parseNoteNumber,
  MAX_DEC_POINTS,
  MIN_NUMBER,
  MAX_NUMBER,
  printListNotes,
  NoteModel,
  MAX_NOTE_TEXT_LENGTH,
  checkUpdNote,
  checkDelNote,
  printNtIds,
  NoteDBModel,
  checkUndoDelNote,
  checkArchNote,
  checkUndoArchNote,
  NoteJoinCtgSbcDBModel,
  generateNoteCreatedTranslations,
  generateNoteUpdatedTranslations,
  DEFAULT_LIST_NT_LIMIT,
} from '../../db/models/noteModel';
import {
  CategoryTypeEnum,
  CategoryDBModel,
} from '../../db/models/categoryModel';
import { TrKey } from '../../i18n/keys';
import { ToTranslate, LanguageEnum, ToTranslateUnion } from '../../i18n/i18n';

import {
  BotCommandEnum,
  calcLimitSkip,
  extendOrClone,
  generateInvInstruction,
  ListHeaderPropsT,
  toCommand,
  toListHeader,
} from '../helpers';
import {
  calcStartEndDay,
  ReturnStartEndDatetime,
  calcStartEndMonth,
  calcStartEndYear,
  newDTDate,
  formatDatetime,
} from '../datetime';
import {
  detectCMDNtAddParams,
  detectCMDNtListParameters,
  safeSplitString,
  safeSplitString2,
  detectCMDNtUpdParams,
  CommandParameterName,
  detectCMDNtDoParams,
  detectCMDNtAppendTextParams,
  safeSplitString3,
} from '../parameters';
import { SubcategoryJoinCtgDBModel } from '../../db/models/subcategoryModel';
import { utcToZonedTime } from 'date-fns-tz';

export function parseNote({
  peerId,
  userId,
  categoryId,
  categoryType,
  noteNumberStr,
  noteTextStr,
  subcategory,
  dbUserLang,
  messageDate,
}: {
  peerId: string;
  userId: string;
  categoryId: number;
  categoryType: CategoryTypeEnum;
  noteNumberStr?: string;
  noteTextStr?: string;
  subcategory?: { id: number };
  dbUserLang: LanguageEnum;
  messageDate?: Date;
}): ToTranslate | NoteModel {
  switch (categoryType) {
    case CategoryTypeEnum.numberNegative:
    case CategoryTypeEnum.numberPositive:
      let noteNumber: number | undefined;
      if (!noteNumberStr) {
        return new ToTranslate(TrKey.NOTE_NUMBER_FLOAT_ERROR, dbUserLang, {
          number: noteNumberStr,
        });
      }
      noteNumberStr = noteNumberStr.replace(',', '.');
      noteNumber = Number(noteNumberStr);
      if (Number.isNaN(noteNumber) || !Number.isFinite(noteNumber)) {
        return new ToTranslate(TrKey.NOTE_NUMBER_FLOAT_ERROR, dbUserLang, {
          number: noteNumberStr,
        });
      }
      if (MIN_NUMBER > noteNumber || noteNumber > MAX_NUMBER) {
        return new ToTranslate(TrKey.NOTE_NUMBER_RANGE_ERROR, dbUserLang, {
          min: MIN_NUMBER,
          max: MAX_NUMBER,
        });
      }
      MAX_DEC_POINTS.lastIndex = 0;
      if (
        !Number.isInteger(noteNumber) &&
        !MAX_DEC_POINTS.test(String(noteNumber))
      ) {
        return new ToTranslate(TrKey.NOTE_NUMBER_FLOAT_ERROR, dbUserLang, {
          number: noteNumberStr,
        });
      }
      if (categoryType === CategoryTypeEnum.numberNegative) {
        if (noteNumberStr.startsWith('+')) {
          if (noteNumber < 0) {
            noteNumber *= -1;
          }
        } else if (noteNumber > 0) {
          noteNumber *= -1;
        }
      } else if (categoryType === CategoryTypeEnum.numberPositive) {
        if (noteNumberStr.startsWith('-')) {
          if (noteNumber > 0) {
            noteNumber *= -1;
          }
        } else if (noteNumber < 0) {
          noteNumber *= -1;
        }
      }
      return composeAddNote({
        peer_id: peerId,
        category_id: categoryId,
        subcategory_id: subcategory && subcategory.id,
        created_by_user_id: userId,
        note_number: noteNumber,
        note_text: noteTextStr,
        datetime: messageDate,
      });
    case CategoryTypeEnum.text:
      if (!noteTextStr) {
        return new ToTranslate(TrKey.NOTE_TEXT_EMPTY, dbUserLang, {
          noteText: noteTextStr,
        });
      }
      return composeAddNote({
        peer_id: peerId,
        category_id: categoryId,
        subcategory_id: subcategory && subcategory.id,
        created_by_user_id: userId,
        note_text: noteTextStr,
        datetime: messageDate,
      });
  }
}

export function checkIsNumberCmd(str: string): boolean {
  return !Number.isNaN(parseNoteNumber(str.replace(',', '.')));
}

export async function addNote(
  {
    db,
    msgText,
    peerIdStr,
    fromIdStr,
    dbUserLang,
    msgDatetimeUnix,
    dbUserTimeZone,
  }: BotCtxT,
  next: NextFunctionT,
): Promise<ToTranslateUnion | undefined | void> {
  const cmd_addnt = toCommand(BotCommandEnum.addnt);
  const cmd_addnt_space = `${cmd_addnt} `;
  const hasCmd = msgText.startsWith(cmd_addnt);
  if (msgText.startsWith('/') && !hasCmd) {
    return next();
  }
  if (safeSplitString2(msgText).length <= 1) {
    if (hasCmd) {
      return generateInvInstruction(
        TrKey.INVALID_ADD_NT_CMD,
        BotCommandEnum.addnt,
        dbUserLang,
      );
    }
    return next();
  }
  if (hasCmd) {
    msgText = msgText.replace(cmd_addnt_space, '');
  }

  const result = detectCMDNtAddParams(msgText, dbUserLang, dbUserTimeZone);
  if (result instanceof ToTranslate) {
    return result;
  }
  const newMsgText = result.detectedPramsFound ? result.rest : msgText;

  const [ctgOrSbcTitle, rest2] = safeSplitString2(newMsgText);

  const { ctg_id, ctg_t, sbc_id, sbc_t, dt, d, t, rd, nt_n, nt_t } =
    result.detectedParams;
  const { nt_n: nt_n_raw } = result.detectedRawParams;
  const { rd: rd_raw } = result.detectedRawParams;
  if (ctg_t) {
    if (ctgOrSbcTitle) {
      return new ToTranslate(TrKey.PARAM_AMBIGUOUS_ERROR, dbUserLang, {
        parName: CommandParameterName.ctgTitle,
      });
    }
  } else if (sbc_t) {
    if (ctgOrSbcTitle) {
      return new ToTranslate(TrKey.PARAM_AMBIGUOUS_ERROR, dbUserLang, {
        parName: CommandParameterName.sbcTitle,
      });
    }
  }

  const hasRelativeParam = typeof rd === 'number' && rd_raw;
  let messageDate: Date = fromUnixTime(msgDatetimeUnix);
  if (dt || d || (t && !hasRelativeParam)) {
    messageDate = (dt || d || t) as Date;
  } else if (typeof rd === 'number' && rd_raw) {
    if (rd === 0) {
      return new ToTranslate(TrKey.RELATIVE_DAY_OF_MONTH_ERROR, dbUserLang, {
        relativeDay: rd,
      });
    }
    let msgDate = messageDate;
    if (t) {
      msgDate = new Date(
        msgDate.getFullYear(),
        msgDate.getMonth(),
        msgDate.getDate(),
        t.getHours(),
        t.getMinutes(),
        t.getSeconds(),
      );
    }
    if (rd > 0 && rd_raw.startsWith('+')) {
      messageDate = addDays(msgDate, rd);
    } else if (rd < 0 && rd_raw.startsWith('-')) {
      messageDate = subDays(msgDate, Math.abs(rd));
    } else if (rd > 0) {
      const wasMonth = msgDate.getMonth();
      messageDate = setDate(msgDate, rd);
      if (wasMonth !== messageDate.getMonth()) {
        return new ToTranslate(TrKey.RELATIVE_DAY_OF_MONTH_ERROR, dbUserLang, {
          relativeDay: rd,
        });
      }
    }
  }

  let categoryId: number | undefined;
  let categoryType: CategoryTypeEnum | undefined;
  let categoryTitle: string | undefined;
  let subcategoryId: number | undefined;
  let subcategoryTitle: string | undefined;
  if (ctg_id) {
    const dbCtg = await db.categories.findOneById({
      table_peer_id: peerIdStr,
      id: ctg_id,
      peer_id: peerIdStr,
    });
    if (!dbCtg) {
      return new ToTranslate(TrKey.CTG_NOT_EXISTS_BY_ID, dbUserLang, {
        id: ctg_id,
      });
    }
    categoryId = dbCtg.id;
    categoryType = dbCtg.category_type;
    categoryTitle = dbCtg.title;
  } else if (ctg_t) {
    const dbCategories = await db.categories.find({
      table_peer_id: peerIdStr,
      title: ctg_t,
      peer_id: peerIdStr,
    });
    const dbCtg = dbCategories[0];
    if (!dbCtg) {
      return new ToTranslate(TrKey.CTG_NOT_EXISTS_BY_TITLE, dbUserLang, {
        id: ctg_id,
      });
    }
    categoryId = dbCtg.id;
    categoryType = dbCtg.category_type;
    categoryTitle = dbCtg.title;
  } else if (sbc_id) {
    const dbSbcJoinCtg = await db.subcategories.findOneByIdJoinCtg({
      table_peer_id: peerIdStr,
      id: sbc_id,
      peer_id: peerIdStr,
    });
    if (!dbSbcJoinCtg) {
      return new ToTranslate(TrKey.SBC_NOT_EXISTS_BY_ID, dbUserLang, {
        id: sbc_id,
      });
    }
    categoryId = dbSbcJoinCtg.category_id;
    categoryType = dbSbcJoinCtg.category_type;
    categoryTitle = dbSbcJoinCtg.category_title;
    subcategoryId = dbSbcJoinCtg.id;
    subcategoryTitle = dbSbcJoinCtg.title;
  } else if (sbc_t) {
    const dbSubcategoriesJoinCategory = await db.subcategories.findJoinCtg({
      table_peer_id: peerIdStr,
      title: sbc_t,
      peer_id: peerIdStr,
    });
    const dbSbcJoinCtg = dbSubcategoriesJoinCategory[0];
    if (!dbSbcJoinCtg) {
      return new ToTranslate(TrKey.SBC_NOT_EXISTS_BY_TITLE, dbUserLang, {
        id: ctg_id,
      });
    }
    categoryId = dbSbcJoinCtg.category_id;
    categoryType = dbSbcJoinCtg.category_type;
    categoryTitle = dbSbcJoinCtg.category_title;
    subcategoryId = dbSbcJoinCtg.id;
    subcategoryTitle = dbSbcJoinCtg.title;
  } else {
    const [dbCategories, dbSubcategoriesJoinCategory] = await Promise.all([
      db.categories.find({
        table_peer_id: peerIdStr,
        title: ctgOrSbcTitle,
        peer_id: peerIdStr,
      }),
      db.subcategories.findJoinCtg({
        table_peer_id: peerIdStr,
        title: ctgOrSbcTitle,
        peer_id: peerIdStr,
      }),
    ]);
    const dbCtg = dbCategories[0];
    const dbSbcJoinCtg = dbSubcategoriesJoinCategory[0];
    if (dbCtg) {
      categoryId = dbCtg.id;
      categoryType = dbCtg.category_type;
      categoryTitle = dbCtg.title;
    } else if (dbSbcJoinCtg) {
      categoryId = dbSbcJoinCtg.category_id;
      categoryType = dbSbcJoinCtg.category_type;
      categoryTitle = dbSbcJoinCtg.category_title;
      subcategoryId = dbSbcJoinCtg.id;
      subcategoryTitle = dbSbcJoinCtg.title;
    }
  }

  if (categoryId && categoryType) {
    const isTextCategory = categoryType === CategoryTypeEnum.text;
    let noteText = isTextCategory ? rest2 : safeSplitString2(rest2)[1];
    let noteNumberRegular = isTextCategory
      ? undefined
      : safeSplitString2(rest2)[0];
    if (nt_t) {
      if (noteText) {
        return new ToTranslate(TrKey.PARAM_AMBIGUOUS_ERROR, dbUserLang, {
          parName: CommandParameterName.ntText,
        });
      }
      noteText = nt_t;
    }
    if (typeof nt_n === 'number' && nt_n_raw) {
      if (noteNumberRegular) {
        return new ToTranslate(TrKey.PARAM_AMBIGUOUS_ERROR, dbUserLang, {
          parName: CommandParameterName.ntNumber,
        });
      }
      noteNumberRegular = nt_n_raw;
    }
    if (noteText && noteText.length > MAX_NOTE_TEXT_LENGTH) {
      return new ToTranslate(TrKey.NOTE_TEXT_MAX_ERROR, dbUserLang, {
        max: MAX_NOTE_TEXT_LENGTH,
        count: noteText.length,
      });
    }
    let noteNumber: number | undefined;
    if (isTextCategory) {
      if (!noteText) {
        return new ToTranslate(TrKey.NOTE_TEXT_EMPTY, dbUserLang, {
          noteText: noteText,
        });
      }
    } else {
      if (!noteNumberRegular) {
        return new ToTranslate(TrKey.NOTE_NUMBER_FLOAT_ERROR, dbUserLang, {
          number: noteNumberRegular,
        });
      }
      noteNumberRegular = noteNumberRegular.replace(',', '.');
      noteNumber = Number(noteNumberRegular);
      if (Number.isNaN(noteNumber) || !Number.isFinite(noteNumber)) {
        return new ToTranslate(TrKey.NOTE_NUMBER_FLOAT_ERROR, dbUserLang, {
          number: noteNumberRegular,
        });
      }
      if (MIN_NUMBER > noteNumber || noteNumber > MAX_NUMBER) {
        return new ToTranslate(TrKey.NOTE_NUMBER_RANGE_ERROR, dbUserLang, {
          min: MIN_NUMBER,
          max: MAX_NUMBER,
        });
      }
      MAX_DEC_POINTS.lastIndex = 0;
      if (
        !Number.isInteger(noteNumber) &&
        !MAX_DEC_POINTS.test(String(noteNumber))
      ) {
        return new ToTranslate(TrKey.NOTE_NUMBER_FLOAT_ERROR, dbUserLang, {
          number: noteNumberRegular,
        });
      }
      if (categoryType === CategoryTypeEnum.numberNegative) {
        if (noteNumberRegular.startsWith('+')) {
          if (noteNumber < 0) {
            noteNumber *= -1;
          }
        } else if (noteNumber > 0) {
          noteNumber *= -1;
        }
      } else if (categoryType === CategoryTypeEnum.numberPositive) {
        if (noteNumberRegular.startsWith('-')) {
          if (noteNumber > 0) {
            noteNumber *= -1;
          }
        } else if (noteNumber < 0) {
          noteNumber *= -1;
        }
      }
    }
    const composedNote = composeAddNote({
      peer_id: peerIdStr,
      category_id: categoryId,
      subcategory_id: subcategoryId,
      created_by_user_id: fromIdStr,
      note_number: noteNumber,
      note_text: noteText,
      datetime: messageDate,
    });
    const dbNote = await db.notes.add(
      { table_peer_id: peerIdStr },
      composedNote,
    );
    const serverNow = newDTDate();
    return new ToTranslate(
      TrKey.NOTE_ADDED,
      dbUserLang,
      {
        id: dbNote.id,
        futureDateMsg:
          dbNote.datetime > serverNow
            ? new ToTranslate(TrKey.NOTE_FUTURE_DATE_WARNING, dbUserLang)
            : '',
        createdFields: generateNoteCreatedTranslations({
          noteId: dbNote.id,
          noteDatetime: dbNote.datetime,
          noteNumber: dbNote.note_number,
          noteText: dbNote.note_text,
          lang: dbUserLang,
          timeZone: dbUserTimeZone,
          categoryTitle,
          categoryType,
          subcategoryTitle,
        }),
      },
      ['futureDateMsg', 'createdFields'],
    );
  } else {
    return new ToTranslate(TrKey.CATEGORY_OR_SUBCTG_NOT_EXIST, dbUserLang, {
      title: ctgOrSbcTitle,
    });
  }
}

export async function listNotes({
  db,
  peerIdStr,
  msgText,
  msgDatetimeUnix,
  dbUserLang,
  dbUserTimeZone,
  dbUserWeekStartsOn,
}: BotCtxT): Promise<ToTranslateUnion> {
  const result = detectCMDNtListParameters(msgText, dbUserLang, dbUserTimeZone);
  if (result instanceof ToTranslate) {
    return result;
  }
  const {
    q,
    ctg_q,
    sbc_q,
    ctg_qt,
    sbc_qt,
    ctg_qd,
    sbc_qd,
    nt_qt,
    nt_qn,
    nt_qn_gt,
    nt_qn_gte,
    nt_qn_lt,
    nt_qn_lte,
    ctg_qid_gt,
    ctg_qid_gte,
    ctg_qid_lt,
    ctg_qid_lte,
    sbc_qid_gt,
    sbc_qid_gte,
    sbc_qid_lt,
    sbc_qid_lte,
    nt_qid_gt,
    nt_qid_gte,
    nt_qid_lt,
    nt_qid_lte,
    show_del,
    show_arch,
    show_id,
    d,
    e_d,
    s_d,
    rd,
    rm,
    ry,
  } = result.detectedParams;
  let { l, s } = result.detectedParams;
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
  const hasRelativeDay = typeof rd === 'number' && rd_raw;
  const hasRelativeMonth = typeof rm === 'number' && rm_raw;
  const hasRelativeYear = typeof ry === 'number' && ry_raw;
  if (
    s_d ||
    e_d ||
    d ||
    hasRelativeDay ||
    hasRelativeMonth ||
    hasRelativeYear
  ) {
    // skip
  } else {
    // if no date specified, list last 10 notes
    [l, s] = calcLimitSkip(DEFAULT_LIST_NT_LIMIT, l, s);
  }

  let messageDate: Date = fromUnixTime(msgDatetimeUnix);
  let startUserDateTime: string | undefined;
  let startUTCDateTime: Date | undefined;
  let endUserDateTime: string | undefined;
  let endUTCDateTime: Date | undefined;
  if (e_d) {
    const calcResult = calcStartEndDay({
      timeZone: dbUserTimeZone,
      weekStartsOn: dbUserWeekStartsOn,
      serverNow: e_d,
    });
    endUserDateTime = calcResult.endUserDateTime;
    endUTCDateTime = calcResult.endUTCDateTime;
    // if start date is not specified, enable notes limit
    if (!s_d) {
      [l] = calcLimitSkip(DEFAULT_LIST_NT_LIMIT, l);
    }
  }
  if (!(e_d || hasRelativeDay || hasRelativeMonth || hasRelativeYear)) {
    // by default list notes to the server date
    endUTCDateTime = newDTDate();
    endUserDateTime = formatDatetime(
      utcToZonedTime(endUTCDateTime, dbUserTimeZone),
      dbUserTimeZone,
    );
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
  } else if (hasRelativeDay) {
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
  } else if (hasRelativeMonth) {
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
  } else if (hasRelativeYear) {
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

  const printResult: ListHeaderPropsT = {
    showId: show_id,
    showDeleted: show_del,
    showArchived: show_arch,
    query,
    ctgQuery: ctg_q,
    sbcQuery: sbc_q,
    ctgQueryTitle: ctg_qt,
    sbcQueryTitle: sbc_qt,
    ctgQueryDescr: ctg_qd,
    sbcQueryDescr: sbc_qd,
    ntQueryText: nt_qt,
    ntQueryNumber: nt_qn,
    ntQueryNumberGreaterThan: nt_qn_gt,
    ntQueryNumberGreaterThanOrEq: nt_qn_gte,
    ntQueryNumberLessThan: nt_qn_lt,
    ntQueryNumberLessThanOrEq: nt_qn_lte,
    ctgQueryIdGreaterThan: ctg_qid_gt,
    ctgQueryIdGreaterThanOrEq: ctg_qid_gte,
    ctgQueryIdLessThan: ctg_qid_lt,
    ctgQueryIdLessThanOrEq: ctg_qid_lte,
    sbcQueryIdGreaterThan: sbc_qid_gt,
    sbcQueryIdGreaterThanOrEq: sbc_qid_gte,
    sbcQueryIdLessThan: sbc_qid_lt,
    sbcQueryIdLessThanOrEq: sbc_qid_lte,
    ntQueryIdGreaterThan: nt_qid_gt,
    ntQueryIdGreaterThanOrEq: nt_qid_gte,
    ntQueryIdLessThan: nt_qid_lt,
    ntQueryIdLessThanOrEq: nt_qid_lte,
    startDateTime: startUserDateTime,
    endDateTime: endUserDateTime,
    limitNum: l,
    skipNum: s,
  };

  const notes = await db.notes.listJoinCtgSbc({
    limit: l,
    offset: s,
    table_peer_id: peerIdStr,
    peer_id: peerIdStr,
    start_datetime: startUTCDateTime,
    end_datetime: endUTCDateTime,
    in_deleted: show_del,
    in_archived: show_arch,
    query: dbQuery,
    ctgQuery: db_ctg_q,
    sbcQuery: db_sbc_q,
    ctgQueryTitle: db_ctg_qt,
    sbcQueryTitle: db_sbc_qt,
    ctgQueryDescr: db_ctg_qd,
    sbcQueryDescr: db_sbc_qd,
    ntQueryText: db_nt_qt,
    ntQueryNumber: nt_qn,
    ntQueryNumberGreaterThan: nt_qn_gt,
    ntQueryNumberGreaterThanOrEq: nt_qn_gte,
    ntQueryNumberLessThan: nt_qn_lt,
    ntQueryNumberLessThanOrEq: nt_qn_lte,
    ctgQueryIdGreaterThan: ctg_qid_gt,
    ctgQueryIdGreaterThanOrEq: ctg_qid_gte,
    ctgQueryIdLessThan: ctg_qid_lt,
    ctgQueryIdLessThanOrEq: ctg_qid_lte,
    sbcQueryIdGreaterThan: sbc_qid_gt,
    sbcQueryIdGreaterThanOrEq: sbc_qid_gte,
    sbcQueryIdLessThan: sbc_qid_lt,
    sbcQueryIdLessThanOrEq: sbc_qid_lte,
    ntQueryIdGreaterThan: nt_qid_gt,
    ntQueryIdGreaterThanOrEq: nt_qid_gte,
    ntQueryIdLessThan: nt_qid_lt,
    ntQueryIdLessThanOrEq: nt_qid_lte,
  });
  Object.assign(printResult, {
    ntCount: printResult.limitNum !== notes.length ? notes.length : undefined,
  });

  return toListHeader(
    printResult,
    notes.length === 0
      ? new ToTranslate(TrKey.NO_NOTES, dbUserLang)
      : new ToTranslate(TrKey.YOUR_NOTES, dbUserLang, {
          text: printListNotes(notes, dbUserTimeZone, show_id),
        }),
    dbUserLang,
  );
}

async function doNote(
  {
    invCmdTrKey,
    cmd,
    in_deleted,
    in_archived,
    prepareUpdate,
    updNtNumTrKey,
    updNtTxtTrKey,
  }: {
    invCmdTrKey: TrKey;
    cmd: BotCommandEnum;
    in_deleted?: boolean;
    in_archived?: boolean;
    prepareUpdate: (dbNote: NoteDBModel, fromIdStr: string) => NoteDBModel;
    updNtNumTrKey: TrKey;
    updNtTxtTrKey: TrKey;
  },
  { db, msgText, peerIdStr, dbUserLang, dbUserTimeZone, fromIdStr }: BotCtxT,
): Promise<ToTranslateUnion> {
  const result = detectCMDNtDoParams(msgText, dbUserLang, dbUserTimeZone);
  if (result instanceof ToTranslate) return result;
  const newMsgText = result.detectedPramsFound ? result.rest : msgText;
  const msgParts = safeSplitString(newMsgText);
  if (msgParts.length >= 3) {
    return generateInvInstruction(invCmdTrKey, cmd, dbUserLang);
  }
  const { nt_id } = result.detectedParams;
  const [, idStr] = msgParts;
  let idNum = Number(idStr);
  if (nt_id) {
    if (idStr) {
      return new ToTranslate(TrKey.PARAM_AMBIGUOUS_ERROR, dbUserLang, {
        parName: CommandParameterName.ntId,
      });
    }
    idNum = nt_id;
  }
  if (!Number.isFinite(idNum)) {
    return generateInvInstruction(invCmdTrKey, cmd, dbUserLang);
  }

  const dbNote = await db.notes.findJoinCtgSbc({
    table_peer_id: peerIdStr,
    note_id: idNum,
    peer_id: peerIdStr,
    in_deleted,
    in_archived,
  });
  if (!dbNote) {
    return new ToTranslate(TrKey.NOTE_NOT_EXISTS, dbUserLang, { id: idNum });
  }
  const updatedDBNote = await db.notes.update(
    { table_peer_id: peerIdStr },
    prepareUpdate(dbNote, fromIdStr),
  );
  if (!updatedDBNote) {
    return new ToTranslate(TrKey.NOTE_GONE, dbUserLang, { id: idNum });
  } else {
    if (dbNote.note_number) {
      return new ToTranslate(updNtNumTrKey, dbUserLang, {
        id: idNum,
        number: parseNoteNumber(dbNote.note_number),
        text: dbNote.note_text,
      });
    } else {
      return new ToTranslate(updNtTxtTrKey, dbUserLang, {
        id: idNum,
        text: dbNote.note_text,
      });
    }
  }
}

export async function deleteNote(botCtx: BotCtxT): Promise<ToTranslateUnion> {
  const { fromIdStr } = botCtx;
  return doNote(
    {
      invCmdTrKey: TrKey.INVALID_DEL_NOTE_CMD,
      cmd: BotCommandEnum.delnt,
      prepareUpdate: (dbNote): NoteDBModel => {
        dbNote.deleted_by_user_id = fromIdStr;
        return checkDelNote(dbNote);
      },
      updNtNumTrKey: TrKey.NOTE_NUMBER_DELETED,
      updNtTxtTrKey: TrKey.NOTE_TEXT_DELETED,
    },
    botCtx,
  );
}

export async function undoDeleteNote(
  botCtx: BotCtxT,
): Promise<ToTranslateUnion> {
  const { fromIdStr } = botCtx;
  return doNote(
    {
      in_deleted: true,
      invCmdTrKey: TrKey.INVALID_UNDO_DEL_NOTE_CMD,
      cmd: BotCommandEnum.undodelnt,
      prepareUpdate: (dbNote): NoteDBModel => {
        dbNote.updated_by_user_id = fromIdStr;
        return checkUndoDelNote(dbNote);
      },
      updNtNumTrKey: TrKey.NOTE_NUMBER_UNDO_DELETED,
      updNtTxtTrKey: TrKey.NOTE_TEXT_UNDO_DELETED,
    },
    botCtx,
  );
}

export async function archiveNote(botCtx: BotCtxT): Promise<ToTranslateUnion> {
  const { fromIdStr } = botCtx;
  return doNote(
    {
      invCmdTrKey: TrKey.INVALID_ARCH_NOTE_CMD,
      cmd: BotCommandEnum.archnt,
      prepareUpdate: (dbNote): NoteDBModel => {
        dbNote.archived_by_user_id = fromIdStr;
        return checkArchNote(dbNote);
      },
      updNtNumTrKey: TrKey.NOTE_NUMBER_ARCHIVED,
      updNtTxtTrKey: TrKey.NOTE_TEXT_ARCHIVED,
    },
    botCtx,
  );
}

export async function undoArchiveNote(
  botCtx: BotCtxT,
): Promise<ToTranslateUnion> {
  const { fromIdStr } = botCtx;
  return doNote(
    {
      in_archived: true,
      invCmdTrKey: TrKey.INVALID_UNDO_ARCH_NOTE_CMD,
      cmd: BotCommandEnum.undoarchnt,
      prepareUpdate: (dbNote): NoteDBModel => {
        dbNote.archived_by_user_id = fromIdStr;
        return checkUndoArchNote(dbNote);
      },
      updNtNumTrKey: TrKey.NOTE_NUMBER_UNDO_ARCHIVED,
      updNtTxtTrKey: TrKey.NOTE_TEXT_UNDO_ARCHIVED,
    },
    botCtx,
  );
}

export async function updateNote({
  db,
  msgText,
  dbUserLang,
  peerIdStr,
  fromIdStr,
  dbUserTimeZone,
}: BotCtxT): Promise<ToTranslateUnion> {
  const result = detectCMDNtUpdParams(msgText, dbUserLang, dbUserTimeZone);
  if (result instanceof ToTranslate) {
    return result;
  }
  const { nt_id, d, t, rd, dt, nt_n, nt_t } = result.detectedParams;
  const newMsgText = result.detectedPramsFound ? result.rest : msgText;
  const [, strNtId, numOrText] = safeSplitString3(newMsgText);
  let ntId = Number(strNtId);
  if (result.detectedPramsFound && ntId) {
    return new ToTranslate(TrKey.PARAM_AMBIGUOUS_ERROR, dbUserLang, {
      parName: CommandParameterName.ntId,
    });
  }
  if (nt_id) {
    ntId = nt_id;
  }
  if (!ntId) {
    return generateInvInstruction(
      TrKey.INVALID_UPDNT_CMD,
      BotCommandEnum.updnt,
      dbUserLang,
    );
  }
  const { rd: rd_raw, nt_n: nt_n_raw } = result.detectedRawParams;
  const hasRelativeParam = typeof rd === 'number' && rd_raw;
  const dbNote = await db.notes.findJoinCtgSbc({
    table_peer_id: peerIdStr,
    note_id: ntId,
    peer_id: peerIdStr,
  });
  if (!dbNote) {
    return new ToTranslate(TrKey.NOTE_NOT_EXISTS, dbUserLang, { id: ntId });
  }
  let ntNum: number | undefined;
  let ntNumRaw: string | undefined;
  let ntText: string | undefined;
  if (numOrText) {
    if (
      dbNote.category_type === CategoryTypeEnum.numberNegative ||
      dbNote.category_type === CategoryTypeEnum.numberPositive
    ) {
      ntNum = Number(numOrText);
      ntNumRaw = numOrText;
    } else {
      ntText = numOrText;
    }
  }
  if (nt_n_raw) {
    ntNum = nt_n;
    ntNumRaw = nt_n_raw;
  }
  if (nt_t) {
    ntText = nt_t;
  }
  if (!(d || t || typeof rd === 'number' || dt || ntNum || ntText)) {
    return generateInvInstruction(
      TrKey.INVALID_UPDNT_CMD,
      BotCommandEnum.updnt,
      dbUserLang,
    );
  }

  const oldNote = extendOrClone<NoteJoinCtgSbcDBModel>({}, dbNote);
  if (dt || d || (t && !hasRelativeParam)) {
    if (dt) {
      dbNote.datetime = dt;
    } else if (d && !t) {
      dbNote.datetime = new Date(
        d.getFullYear(),
        d.getMonth(),
        d.getDate(),
        dbNote.datetime.getHours(),
        dbNote.datetime.getMinutes(),
        dbNote.datetime.getSeconds(),
      );
    } else if (t && !d) {
      dbNote.datetime = new Date(
        dbNote.datetime.getFullYear(),
        dbNote.datetime.getMonth(),
        dbNote.datetime.getDate(),
        t.getHours(),
        t.getMinutes(),
        t.getSeconds(),
      );
    }
  } else if (typeof rd === 'number' && rd_raw) {
    if (rd === 0) {
      return new ToTranslate(TrKey.RELATIVE_DAY_OF_MONTH_ERROR, dbUserLang, {
        relativeDay: rd,
      });
    }
    if (t) {
      dbNote.datetime = new Date(
        dbNote.datetime.getFullYear(),
        dbNote.datetime.getMonth(),
        dbNote.datetime.getDate(),
        t.getHours(),
        t.getMinutes(),
        t.getSeconds(),
      );
    }
    if (rd > 0 && rd_raw.startsWith('+')) {
      dbNote.datetime = addDays(dbNote.datetime, rd);
    } else if (rd < 0 && rd_raw.startsWith('-')) {
      dbNote.datetime = subDays(dbNote.datetime, Math.abs(rd));
    } else if (rd > 0) {
      const wasMonth = dbNote.datetime.getMonth();
      dbNote.datetime = setDate(dbNote.datetime, rd);
      if (wasMonth !== dbNote.datetime.getMonth()) {
        return new ToTranslate(TrKey.RELATIVE_DAY_OF_MONTH_ERROR, dbUserLang, {
          relativeDay: rd,
        });
      }
    }
  }
  if (ntText) {
    if (ntText.length > MAX_NOTE_TEXT_LENGTH) {
      return new ToTranslate(TrKey.NOTE_TEXT_MAX_ERROR, dbUserLang, {
        max: MAX_NOTE_TEXT_LENGTH,
        count: ntText.length,
      });
    }
    dbNote.note_text = ntText;
  }
  if (typeof ntNum === 'number') {
    if (MIN_NUMBER > ntNum || ntNum > MAX_NUMBER) {
      return new ToTranslate(TrKey.NOTE_NUMBER_RANGE_ERROR, dbUserLang, {
        min: MIN_NUMBER,
        max: MAX_NUMBER,
      });
    }
    MAX_DEC_POINTS.lastIndex = 0;
    if (!Number.isInteger(ntNum) && !MAX_DEC_POINTS.test(String(ntNum))) {
      return new ToTranslate(TrKey.NOTE_NUMBER_FLOAT_ERROR, dbUserLang, {
        number: ntNum,
      });
    }
    let noteNumber = ntNum;
    if (dbNote.category_type === CategoryTypeEnum.numberNegative && ntNumRaw) {
      if (ntNumRaw.startsWith('+')) {
        if (noteNumber < 0) {
          noteNumber *= -1;
        }
      } else if (noteNumber > 0) {
        noteNumber *= -1;
      }
    } else if (
      dbNote.category_type === CategoryTypeEnum.numberPositive &&
      ntNumRaw
    ) {
      if (ntNumRaw.startsWith('-')) {
        if (noteNumber > 0) {
          noteNumber *= -1;
        }
      } else if (noteNumber < 0) {
        noteNumber *= -1;
      }
    }
    dbNote.note_number = String(noteNumber);
  }
  dbNote.updated_by_user_id = fromIdStr;
  const updatedDBNote = await db.notes.update(
    { table_peer_id: peerIdStr },
    checkUpdNote(dbNote),
  );
  if (updatedDBNote) {
    const serverNow = newDTDate();
    return new ToTranslate(
      TrKey.NOTE_UPDATED,
      dbUserLang,
      {
        id: updatedDBNote.id,
        futureDateMsg:
          updatedDBNote.datetime > serverNow
            ? new ToTranslate(TrKey.NOTE_FUTURE_DATE_WARNING, dbUserLang)
            : '',
        updatedFields: generateNoteUpdatedTranslations({
          oldNote,
          newNote: updatedDBNote,
          lang: dbUserLang,
          timeZone: dbUserTimeZone,
        }),
      },
      ['futureDateMsg', 'updatedFields'],
    );
  } else {
    return new ToTranslate(TrKey.NOTE_GONE, dbUserLang, { id: dbNote.id });
  }
}

export async function transferNotes({
  db,
  msgText,
  dbUserLang,
  peerIdStr,
  fromIdStr,
}: BotCtxT): Promise<ToTranslateUnion> {
  const msgParts = safeSplitString(msgText);
  if (msgParts.length <= 2 || msgParts.length >= 4) {
    return generateInvInstruction(
      TrKey.INVALID_TRNSNTS_CMD,
      BotCommandEnum.trnsnts,
      dbUserLang,
    );
  }
  const [, fromCtgOrSbc, toCtgOrSbc] = msgParts;
  if (fromCtgOrSbc === toCtgOrSbc) {
    return new ToTranslate(TrKey.EQUAL_TRANSFER_CTG_OR_SBC, dbUserLang, {
      title: fromCtgOrSbc,
    });
  }
  const [fromDBCategories, fromDBSubcategoriesJoinCategory] = await Promise.all(
    [
      db.categories.find({
        table_peer_id: peerIdStr,
        title: fromCtgOrSbc,
        peer_id: peerIdStr,
      }),
      db.subcategories.findJoinCtg({
        table_peer_id: peerIdStr,
        title: fromCtgOrSbc,
        peer_id: peerIdStr,
      }),
    ],
  );
  if (!(fromDBCategories.length || fromDBSubcategoriesJoinCategory.length)) {
    return new ToTranslate(TrKey.CATEGORY_OR_SUBCTG_NOT_EXIST, dbUserLang, {
      title: fromCtgOrSbc,
    });
  }
  const fromDBCategory = fromDBCategories[0];
  const fromDBSbcJoinCategory = fromDBSubcategoriesJoinCategory[0];
  let fromCtgType: CategoryTypeEnum | undefined;
  if (fromDBSbcJoinCategory) {
    fromCtgType = fromDBSbcJoinCategory.category_type;
  } else if (fromDBCategory) {
    fromCtgType = fromDBCategory.category_type;
  }

  const [toDBCategories, toDBSubcategoriesJoinCategory] = await Promise.all([
    db.categories.find({
      table_peer_id: peerIdStr,
      title: toCtgOrSbc,
      peer_id: peerIdStr,
    }),
    db.subcategories.findJoinCtg({
      table_peer_id: peerIdStr,
      title: toCtgOrSbc,
      peer_id: peerIdStr,
    }),
  ]);
  if (!(toDBCategories.length || toDBSubcategoriesJoinCategory.length)) {
    return new ToTranslate(TrKey.CATEGORY_OR_SUBCTG_NOT_EXIST, dbUserLang, {
      title: toCtgOrSbc,
    });
  }
  const toDBCategory = (toDBCategories as CategoryDBModel[])[0];
  const toDBSbcJoinCategory = (
    toDBSubcategoriesJoinCategory as SubcategoryJoinCtgDBModel[]
  )[0];
  let toCtgType: CategoryTypeEnum | undefined;
  if (toDBSbcJoinCategory) {
    toCtgType = toDBSbcJoinCategory.category_type;
  } else if (toDBCategory) {
    toCtgType = toDBCategory.category_type;
  }
  if (fromCtgType && toCtgType) {
    // TS workaround
    const textCtgTypesLen = [fromCtgType, toCtgType].filter(
      (ctgType): boolean => ctgType === CategoryTypeEnum.text,
    ).length;
    if (textCtgTypesLen === 1) {
      return new ToTranslate(TrKey.CTG_TYPE_TRANSFER_ERROR, dbUserLang);
    }

    const updatedDBNotes = await db.notes.transferNotes({
      table_peer_id: peerIdStr,
      updated_by_user_id: fromIdStr,
      updated_at: newDTDate(),
      peer_id: peerIdStr,
      from_category_id: (fromDBCategory && fromDBCategory.id) || undefined,
      from_subcategory_id:
        (fromDBSbcJoinCategory && fromDBSbcJoinCategory.id) || undefined,
      to_category_id:
        (toDBCategory && toDBCategory.id) ||
        (toDBSbcJoinCategory && toDBSbcJoinCategory.category_id),
      to_subcategory_id: toDBSbcJoinCategory && toDBSbcJoinCategory.id,
    });
    if (updatedDBNotes.length) {
      const ntIds = printNtIds(updatedDBNotes);
      if (fromDBCategory) {
        if (toDBCategory) {
          return new ToTranslate(
            TrKey.TRANSFERED_NOTES_FROM_CTG_TO_CTG,
            dbUserLang,
            {
              fromTitle: fromDBCategory.title,
              toTitle: toDBCategory.title,
              ntIds,
            },
          );
        } else if (toDBSbcJoinCategory) {
          return new ToTranslate(
            TrKey.TRANSFERED_NOTES_FROM_CTG_TO_SBC,
            dbUserLang,
            {
              fromTitle: fromDBCategory.title,
              toTitle: toDBSbcJoinCategory.title,
              ntIds,
            },
          );
        }
      } else if (fromDBSbcJoinCategory) {
        if (toDBCategory) {
          return new ToTranslate(
            TrKey.TRANSFERED_NOTES_FROM_SBC_TO_CTG,
            dbUserLang,
            {
              fromTitle: fromDBSbcJoinCategory.title,
              toTitle: toDBCategory.title,
              ntIds,
            },
          );
        } else if (toDBSbcJoinCategory) {
          return new ToTranslate(
            TrKey.TRANSFERED_NOTES_FROM_SBC_TO_SBC,
            dbUserLang,
            {
              fromTitle: fromDBSbcJoinCategory.title,
              toTitle: toDBSbcJoinCategory.title,
              ntIds,
            },
          );
        }
      }
    }
  }

  return new ToTranslate(TrKey.NO_NOTES, dbUserLang);
}

export async function transferNote({
  db,
  msgText,
  dbUserLang,
  peerIdStr,
  fromIdStr,
}: BotCtxT): Promise<ToTranslateUnion> {
  const msgParts = safeSplitString(msgText);
  if (msgParts.length !== 3) {
    return generateInvInstruction(
      TrKey.INVALID_TRNSNT_CMD,
      BotCommandEnum.trnsnt,
      dbUserLang,
    );
  }
  const [, idStr, toCtgOrSbc] = msgParts;
  const idNum = Number(idStr);

  const dbNote = await db.notes.findJoinCtgSbc({
    table_peer_id: peerIdStr,
    note_id: idNum,
    peer_id: peerIdStr,
  });
  if (!dbNote) {
    return new ToTranslate(TrKey.NOTE_NOT_EXISTS, dbUserLang, { id: idStr });
  }

  const [toDBCategories, toDBSubcategoriesJoinCategory] = await Promise.all([
    db.categories.find({
      table_peer_id: peerIdStr,
      title: toCtgOrSbc,
      peer_id: peerIdStr,
    }),
    db.subcategories.findJoinCtg({
      table_peer_id: peerIdStr,
      title: toCtgOrSbc,
      peer_id: peerIdStr,
    }),
  ]);

  if (!(toDBCategories.length || toDBSubcategoriesJoinCategory.length)) {
    return new ToTranslate(TrKey.CATEGORY_OR_SUBCTG_NOT_EXIST, dbUserLang, {
      title: toCtgOrSbc,
    });
  }

  const toDBCategory = (toDBCategories as CategoryDBModel[])[0];
  const toDBSbcJoinCategory = (
    toDBSubcategoriesJoinCategory as SubcategoryJoinCtgDBModel[]
  )[0];
  let toCtgType: CategoryTypeEnum | undefined;
  if (toDBSbcJoinCategory) {
    toCtgType = toDBSbcJoinCategory.category_type;
  } else if (toDBCategory) {
    toCtgType = toDBCategory.category_type;
  }

  if (toCtgType) {
    const textCtgTypesLen = [dbNote.category_type, toCtgType].filter(
      (ctgType): boolean => ctgType === CategoryTypeEnum.text,
    ).length;
    if (textCtgTypesLen === 1) {
      return new ToTranslate(TrKey.CTG_TYPE_TRANSFER_ERROR, dbUserLang);
    }

    const updatedDBNote = await db.notes.transferNote({
      table_peer_id: peerIdStr,
      note_id: idNum,
      peer_id: peerIdStr,
      updated_by_user_id: fromIdStr,
      updated_at: newDTDate(),
      from_category_id: dbNote.category_id,
      from_subcategory_id: dbNote.subcategory_id,
      to_category_id:
        (toDBCategory && toDBCategory.id) ||
        (toDBSbcJoinCategory && toDBSbcJoinCategory.category_id),
      to_subcategory_id: toDBSbcJoinCategory && toDBSbcJoinCategory.id,
    });

    if (updatedDBNote) {
      const ntIds = updatedDBNote.id;
      if (dbNote.subcategory_id) {
        if (toDBCategory) {
          return new ToTranslate(
            TrKey.TRANSFERED_NOTES_FROM_SBC_TO_CTG,
            dbUserLang,
            {
              fromTitle: dbNote.subcategory_title,
              toTitle: toDBCategory.title,
              ntIds,
            },
          );
        } else if (toDBSbcJoinCategory) {
          return new ToTranslate(
            TrKey.TRANSFERED_NOTES_FROM_SBC_TO_SBC,
            dbUserLang,
            {
              fromTitle: dbNote.subcategory_title,
              toTitle: toDBSbcJoinCategory.title,
              ntIds,
            },
          );
        }
      } else {
        if (toDBCategory) {
          return new ToTranslate(
            TrKey.TRANSFERED_NOTES_FROM_CTG_TO_CTG,
            dbUserLang,
            {
              fromTitle: dbNote.category_title,
              toTitle: toDBCategory.title,
              ntIds,
            },
          );
        } else if (toDBSbcJoinCategory) {
          return new ToTranslate(
            TrKey.TRANSFERED_NOTES_FROM_CTG_TO_SBC,
            dbUserLang,
            {
              fromTitle: dbNote.category_title,
              toTitle: toDBSbcJoinCategory.title,
              ntIds,
            },
          );
        }
      }
    }
    return new ToTranslate(TrKey.NO_NOTES, dbUserLang);
  }

  return new ToTranslate(TrKey.NO_NOTES, dbUserLang);
}

export async function appendNoteText({
  db,
  msgText,
  dbUserLang,
  dbUserTimeZone,
  peerIdStr,
  fromIdStr,
}: BotCtxT): Promise<ToTranslateUnion> {
  const msgParts = safeSplitString2(msgText);
  if (msgParts.length < 2) {
    return generateInvInstruction(
      TrKey.INVALID_APPNTT_CMD,
      BotCommandEnum.appntt,
      dbUserLang,
    );
  }
  const result = detectCMDNtAppendTextParams(
    msgParts[1],
    dbUserLang,
    dbUserTimeZone,
  );
  if (result instanceof ToTranslate) {
    return result;
  }
  const newMsgText = result.detectedPramsFound ? result.rest : msgParts[1];

  const { nt_id, nt_t } = result.detectedParams;
  const [idStr, ntTextStr] = safeSplitString2(newMsgText);
  let idNum = Number(idStr);
  let ntText = ntTextStr;
  if (nt_id) {
    if (idStr) {
      return new ToTranslate(TrKey.PARAM_AMBIGUOUS_ERROR, dbUserLang, {
        parName: CommandParameterName.ntId,
      });
    }
    idNum = nt_id;
  }
  if (!Number.isFinite(idNum)) {
    return generateInvInstruction(
      TrKey.INVALID_APPNTT_CMD,
      BotCommandEnum.appntt,
      dbUserLang,
    );
  }
  if (nt_t) {
    if (ntText) {
      return new ToTranslate(TrKey.PARAM_AMBIGUOUS_ERROR, dbUserLang, {
        parName: CommandParameterName.ntId,
      });
    }
    ntText = nt_t;
  }
  if (!idNum || !ntText) {
    return generateInvInstruction(
      TrKey.INVALID_APPNTT_CMD,
      BotCommandEnum.appntt,
      dbUserLang,
    );
  }

  const dbNote = await db.notes.findJoinCtgSbc({
    table_peer_id: peerIdStr,
    note_id: idNum,
    peer_id: peerIdStr,
  });
  if (!dbNote) {
    return new ToTranslate(TrKey.NOTE_NOT_EXISTS, dbUserLang, { id: idNum });
  }
  const oldNote = extendOrClone<NoteJoinCtgSbcDBModel>({}, dbNote);
  dbNote.updated_by_user_id = fromIdStr;
  dbNote.note_text = `${oldNote.note_text} ${ntText}`;

  if (dbNote.note_text.length > MAX_NOTE_TEXT_LENGTH) {
    return new ToTranslate(TrKey.NOTE_TEXT_MAX_ERROR, dbUserLang, {
      max: MAX_NOTE_TEXT_LENGTH,
      count: (oldNote.note_text || '').length,
    });
  }

  const updatedDBNote = await db.notes.update(
    { table_peer_id: peerIdStr },
    checkUpdNote(dbNote),
  );
  if (updatedDBNote) {
    const serverNow = newDTDate();
    return new ToTranslate(
      TrKey.NOTE_UPDATED,
      dbUserLang,
      {
        id: updatedDBNote.id,
        futureDateMsg:
          updatedDBNote.datetime > serverNow
            ? new ToTranslate(TrKey.NOTE_FUTURE_DATE_WARNING, dbUserLang)
            : '',
        updatedFields: generateNoteUpdatedTranslations({
          oldNote,
          newNote: updatedDBNote,
          lang: dbUserLang,
          timeZone: dbUserTimeZone,
        }),
      },
      ['futureDateMsg', 'updatedFields'],
    );
  } else {
    return new ToTranslate(TrKey.NOTE_GONE, dbUserLang, { id: dbNote.id });
  }
}
