import {
  checkAddSubcategory,
  printListSubcategories,
  DEFAULT_LIST_SBC_LIMIT,
  MAX_SBC_TITLE_LENGTH,
  MAX_SBC_DESC_LENGTH,
  checkUpdSubcategory,
  checkDelSubcategory,
  SubcategoryDBModel,
  checkUndoDelSubcategory,
  checkArchSubcategory,
  checkUndoArchSubcategory,
  generateSubcategoryCreatedTranslations,
} from '../../db/models/subcategoryModel';
import { CategoryDBModel } from '../../db/models/categoryModel';
import { printNtIds, NoteDBModel } from '../../db/models/noteModel';
import { TrKey } from '../../i18n/keys';
import { ToTranslate, ToTranslateUnion } from '../../i18n/i18n';

import { BotCtxT } from '../bot';
import {
  generateInvInstruction,
  BotCommandEnum,
  calcLimitSkip,
  toListHeader,
} from '../helpers';
import {
  detectCMDSbcListParameters,
  safeSplitString,
  hasErrorProneString,
  generateInvalidTitles,
  safeSplitString4,
  safeSplitString3,
  detectCMDSbcAddParams,
  CommandParameterName,
  detectCMDSbcDoParams,
  safeSplitString2,
} from '../parameters';
import { newDTDate } from '../datetime';
import { DbProtocolT } from '../../db/db';

export async function addSubcategory({
  db,
  msgText,
  fromIdStr,
  peerIdStr,
  dbUserLang,
  dbUserTimeZone,
}: BotCtxT): Promise<ToTranslateUnion> {
  const result = detectCMDSbcAddParams(msgText, dbUserLang, dbUserTimeZone);
  if (result instanceof ToTranslate) return result;
  const { ctg_id, ctg_t, sbc_t, sbc_descr } = result.detectedParams;
  const newMsgText = result.detectedPramsFound ? result.rest : msgText;
  const msgParts4 = safeSplitString4(newMsgText);
  let [, ctgTitle, sbcTitle, sbcDescription] = msgParts4;

  if (ctg_t) {
    if (sbcTitle) {
      return new ToTranslate(TrKey.PARAM_AMBIGUOUS_ERROR, dbUserLang, {
        parName: CommandParameterName.ctgTitle,
      });
    }
    ctgTitle = ctg_t;
  }
  if (sbc_t) {
    if (sbcTitle) {
      return new ToTranslate(TrKey.PARAM_AMBIGUOUS_ERROR, dbUserLang, {
        parName: CommandParameterName.sbcTitle,
      });
    }
    sbcTitle = sbc_t;
  }
  if ((!ctg_id && !ctgTitle) || ((ctg_id || ctgTitle) && !sbcTitle)) {
    return generateInvInstruction(
      TrKey.INVALID_ADD_SBC_CMD,
      BotCommandEnum.addsbc,
      dbUserLang,
    );
  }
  if (sbc_descr) {
    if (sbcDescription) {
      return new ToTranslate(TrKey.PARAM_AMBIGUOUS_ERROR, dbUserLang, {
        parName: CommandParameterName.sbcDescription,
      });
    }
    sbcDescription = sbc_descr;
  }
  if (sbcTitle.length > MAX_SBC_TITLE_LENGTH) {
    return new ToTranslate(TrKey.SBC_TITLE_MAX_ERROR, dbUserLang, {
      max: MAX_SBC_TITLE_LENGTH,
    });
  }

  if (sbcDescription && sbcDescription.length > MAX_SBC_DESC_LENGTH) {
    return new ToTranslate(TrKey.SBC_DESC_MAX_ERROR, dbUserLang, {
      max: MAX_SBC_DESC_LENGTH,
    });
  }
  let existingDBCategory: CategoryDBModel | null = null;
  if (ctg_id) {
    existingDBCategory = await db.categories.findOneById({
      table_peer_id: peerIdStr,
      id: ctg_id,
      peer_id: peerIdStr,
    });
    if (!existingDBCategory) {
      return new ToTranslate(TrKey.CTG_NOT_EXISTS_BY_ID, dbUserLang, {
        id: ctg_id,
      });
    }
  } else {
    const existingDBCategories = await db.categories.find({
      table_peer_id: peerIdStr,
      title: ctgTitle,
      peer_id: peerIdStr,
    });
    if (!existingDBCategories.length) {
      return new ToTranslate(TrKey.CTG_NOT_EXISTS_BY_TITLE, dbUserLang, {
        title: ctgTitle,
      });
    }
    existingDBCategory = existingDBCategories[0];
  }

  const existingDBSbcCategories = await db.categories.find({
    table_peer_id: peerIdStr,
    title: sbcTitle,
    peer_id: peerIdStr,
  });
  if (existingDBSbcCategories.length) {
    return new ToTranslate(TrKey.TITLE_EXISTS_IN_CATEGORY, dbUserLang, {
      title: ctgTitle,
    });
  }
  const existingDBSubcategories = await db.subcategories.find({
    table_peer_id: peerIdStr,
    title: sbcTitle,
    peer_id: peerIdStr,
  });
  if (existingDBSubcategories.length) {
    return new ToTranslate(TrKey.SUBCTG_EXISTS, dbUserLang, {
      title: sbcTitle,
    });
  }

  const dbSbc = await db.subcategories.add(
    { table_peer_id: peerIdStr },
    checkAddSubcategory({
      title: sbcTitle,
      peer_id: peerIdStr,
      category_id: existingDBCategory.id,
      created_by_user_id: fromIdStr,
      description: sbcDescription,
    }),
  );
  if (dbSbc) {
    return new ToTranslate(
      TrKey.RES_SBC_ADDED,
      dbUserLang,
      {
        createdFields: generateSubcategoryCreatedTranslations({
          subcategoryId: dbSbc.id,
          subcategoryTitle: dbSbc.title,
          subcategoryDescription: dbSbc.description,
          categoryType: existingDBCategory.category_type,
          categoryTitle: existingDBCategory.title,
          lang: dbUserLang,
        }),
      },
      ['createdFields'],
    );
  } else {
    return new ToTranslate(TrKey.SUBCTG_GONE, dbUserLang, { title: sbcTitle });
  }
}

export async function listSubcategories({
  db,
  peerIdStr,
  dbUserLang,
  dbUserTimeZone,
  msgText,
}: BotCtxT): Promise<ToTranslateUnion> {
  const result = detectCMDSbcListParameters(
    msgText,
    dbUserLang,
    dbUserTimeZone,
  );
  if (result instanceof ToTranslate) {
    return result;
  }
  const {
    l,
    s,
    q,
    ctg_q,
    sbc_q,
    ctg_qt,
    sbc_qt,
    ctg_qd,
    sbc_qd,
    ctg_qid_gt,
    ctg_qid_gte,
    ctg_qid_lt,
    ctg_qid_lte,
    sbc_qid_gt,
    sbc_qid_gte,
    sbc_qid_lt,
    sbc_qid_lte,
    show_id,
    show_del,
    show_arch,
  } = result.detectedParams;
  const {
    q: db_q,
    ctg_q: db_ctg_q,
    sbc_q: db_sbc_q,
    ctg_qt: db_ctg_qt,
    sbc_qt: db_sbc_qt,
    ctg_qd: db_ctg_qd,
    sbc_qd: db_sbc_qd,
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
  if (splitQuery) {
    query = splitQuery;
    dbQuery = splitQuery;
  }

  const [limitNum, skipNum] = calcLimitSkip(DEFAULT_LIST_SBC_LIMIT, l, s);
  Object.assign(result, { limitNum, skipNum, query: q });
  const subcategories = await db.subcategories.listJoinCtg({
    table_peer_id: peerIdStr,
    peer_id: peerIdStr,
    limit: limitNum,
    offset: skipNum,
    in_deleted: show_del,
    in_archived: show_arch,
    query: dbQuery,
    ctgQuery: db_ctg_q,
    sbcQuery: db_sbc_q,
    ctgQueryTitle: db_ctg_qt,
    sbcQueryTitle: db_sbc_qt,
    ctgQueryDescr: db_ctg_qd,
    sbcQueryDescr: db_sbc_qd,
    ctgQueryIdGreaterThan: ctg_qid_gt,
    ctgQueryIdGreaterThanOrEq: ctg_qid_gte,
    ctgQueryIdLessThan: ctg_qid_lt,
    ctgQueryIdLessThanOrEq: ctg_qid_lte,
    sbcQueryIdGreaterThan: sbc_qid_gt,
    sbcQueryIdGreaterThanOrEq: sbc_qid_gte,
    sbcQueryIdLessThan: sbc_qid_lt,
    sbcQueryIdLessThanOrEq: sbc_qid_lte,
  });

  return toListHeader(
    {
      limitNum,
      skipNum,
      query,
      ctgQuery: ctg_q,
      sbcQuery: sbc_q,
      ctgQueryTitle: ctg_qt,
      sbcQueryTitle: sbc_qt,
      ctgQueryDescr: ctg_qd,
      sbcQueryDescr: sbc_qd,
      ctgQueryIdGreaterThan: ctg_qid_gt,
      ctgQueryIdGreaterThanOrEq: ctg_qid_gte,
      ctgQueryIdLessThan: ctg_qid_lt,
      ctgQueryIdLessThanOrEq: ctg_qid_lte,
      sbcQueryIdGreaterThan: sbc_qid_gt,
      sbcQueryIdGreaterThanOrEq: sbc_qid_gte,
      sbcQueryIdLessThan: sbc_qid_lt,
      sbcQueryIdLessThanOrEq: sbc_qid_lte,
      showId: show_id,
      showDeleted: show_del,
      showArchived: show_arch,
      sbcCount:
        limitNum !== subcategories.length ? subcategories.length : undefined,
    },
    subcategories.length === 0
      ? new ToTranslate(TrKey.NO_SUBCATEGORIES, dbUserLang)
      : new ToTranslate(TrKey.YOUR_SUBCATEGORIES, dbUserLang, {
          text: printListSubcategories({
            subcategories,
            showId: show_id,
          }),
        }),
    dbUserLang,
  );
}

export async function updateSubcategoryName({
  db,
  msgText,
  peerIdStr,
  dbUserLang,
  fromIdStr,
}: BotCtxT): Promise<ToTranslateUnion> {
  const msgParts = safeSplitString(msgText);
  if (msgParts.length <= 2 || msgParts.length >= 4) {
    return generateInvInstruction(
      TrKey.INVALID_UPDN_SBC_CMD,
      BotCommandEnum.updsbcn,
      dbUserLang,
    );
  }
  const [, oldTitle, newTitle] = msgParts;
  if (newTitle.length > MAX_SBC_TITLE_LENGTH) {
    return new ToTranslate(TrKey.SBC_TITLE_MAX_ERROR, dbUserLang, {
      max: MAX_SBC_TITLE_LENGTH,
    });
  }
  if (hasErrorProneString(msgParts)) {
    return new ToTranslate(TrKey.ERROR_PRONE_STRING, dbUserLang, {
      invTitles: generateInvalidTitles(),
    });
  }

  const [beforeDBSubcategories, afterDBSubcategories, existingDBCategories] =
    await Promise.all([
      db.subcategories.find({
        table_peer_id: peerIdStr,
        title: oldTitle,
        peer_id: peerIdStr,
      }),
      db.subcategories.find({
        table_peer_id: peerIdStr,
        title: newTitle,
        peer_id: peerIdStr,
      }),
      db.categories.find({
        table_peer_id: peerIdStr,
        title: newTitle,
        peer_id: peerIdStr,
      }),
    ]);

  if (!beforeDBSubcategories.length) {
    return new ToTranslate(TrKey.SBC_NOT_EXISTS_BY_TITLE, dbUserLang, {
      title: oldTitle,
    });
  }
  if (afterDBSubcategories.length) {
    return new ToTranslate(TrKey.SUBCTG_EXISTS, dbUserLang, {
      title: newTitle,
    });
  }
  if (existingDBCategories.length) {
    return new ToTranslate(TrKey.TITLE_EXISTS_IN_CATEGORY, dbUserLang, {
      title: newTitle,
    });
  }
  const beforeDBSbc = beforeDBSubcategories[0];
  const oldSbcTitle = beforeDBSbc.title;
  beforeDBSbc.title = newTitle;
  beforeDBSbc.updated_by_user_id = fromIdStr;
  const updatedDBSbc = await db.subcategories.update(
    { table_peer_id: peerIdStr },
    checkUpdSubcategory(beforeDBSbc),
  );

  if (updatedDBSbc) {
    return new ToTranslate(TrKey.SUBCTG_NAME_UPDATED, dbUserLang, {
      oldTitle: oldSbcTitle,
      newTitle: updatedDBSbc.title,
    });
  } else {
    return new ToTranslate(TrKey.SUBCTG_GONE, dbUserLang, { title: oldTitle });
  }
}

export async function updateSubcategoryDesc({
  db,
  msgText,
  peerIdStr,
  dbUserLang,
  fromIdStr,
}: BotCtxT): Promise<ToTranslateUnion> {
  const msgParts = safeSplitString3(msgText);
  if (msgParts.length <= 1) {
    return generateInvInstruction(
      TrKey.INVALID_UPDD_SBC_CMD,
      BotCommandEnum.updsbcd,
      dbUserLang,
    );
  }
  const [, sbcTitle, newDescription] = msgParts;
  if (newDescription && newDescription.length > MAX_SBC_DESC_LENGTH) {
    return new ToTranslate(TrKey.SBC_DESC_MAX_ERROR, dbUserLang, {
      max: MAX_SBC_DESC_LENGTH,
    });
  }
  if (hasErrorProneString(safeSplitString(msgText))) {
    return new ToTranslate(TrKey.ERROR_PRONE_STRING, dbUserLang, {
      invTitles: generateInvalidTitles(),
    });
  }

  const dbSubcategories = await db.subcategories.find({
    table_peer_id: peerIdStr,
    title: sbcTitle,
    peer_id: peerIdStr,
  });

  if (!dbSubcategories.length) {
    return new ToTranslate(TrKey.SBC_NOT_EXISTS_BY_TITLE, dbUserLang, {
      title: sbcTitle,
    });
  }
  const dbSubcategory = dbSubcategories[0];
  const oldDesc = dbSubcategory.description;
  dbSubcategory.description = newDescription || '';
  dbSubcategory.updated_by_user_id = fromIdStr;
  const updatedDBSubcategory = await db.subcategories.update(
    { table_peer_id: peerIdStr },
    checkUpdSubcategory(dbSubcategory),
  );

  if (updatedDBSubcategory) {
    return new ToTranslate(TrKey.SUBCTG_DESC_UPDATED, dbUserLang, {
      sbcTitle,
      oldDesc,
      newDesc: updatedDBSubcategory.description,
    });
  } else {
    return new ToTranslate(TrKey.SUBCTG_GONE, dbUserLang, { title: sbcTitle });
  }
}

async function doSubcategory(
  {
    invCmdTrKey,
    cmd,
    in_deleted,
    in_archived,
    prepareUpdate,
    updateNotes,
    updAllTrKey,
    updSbcTrKey,
  }: {
    invCmdTrKey: TrKey;
    cmd: BotCommandEnum;
    in_deleted?: boolean;
    in_archived?: boolean;
    prepareUpdate: (
      dbSubcategory: SubcategoryDBModel,
      fromIdStr: string,
    ) => SubcategoryDBModel;
    updateNotes: (
      t: DbProtocolT,
      subcategory_id: number,
      peer_id: string,
    ) => Promise<NoteDBModel[]>;
    updAllTrKey: TrKey;
    updSbcTrKey: TrKey;
  },
  { db, msgText, peerIdStr, dbUserLang, dbUserTimeZone, fromIdStr }: BotCtxT,
): Promise<ToTranslateUnion> {
  const result = detectCMDSbcDoParams(msgText, dbUserLang, dbUserTimeZone);
  if (result instanceof ToTranslate) return result;
  const newMsgText = result.detectedPramsFound ? result.rest : msgText;
  const msgParts = safeSplitString(newMsgText);
  if (msgParts.length >= 3) {
    return generateInvInstruction(invCmdTrKey, cmd, dbUserLang);
  }
  const { sbc_id, sbc_t } = result.detectedParams;
  let [, title] = msgParts;
  if (sbc_t) {
    if (title) {
      return new ToTranslate(TrKey.PARAM_AMBIGUOUS_ERROR, dbUserLang, {
        parName: CommandParameterName.sbcTitle,
      });
    }
    title = sbc_t;
  }
  if (!sbc_id && !title) {
    return generateInvInstruction(invCmdTrKey, cmd, dbUserLang);
  }
  // restore from archived or deleted (only one active name is allowed)
  if (in_archived || in_deleted) {
    const [activeDBCategories, activeDBSubcategories] = await Promise.all([
      db.categories.find({
        table_peer_id: peerIdStr,
        title,
        peer_id: peerIdStr,
      }),
      db.subcategories.find({
        table_peer_id: peerIdStr,
        title,
        peer_id: peerIdStr,
      }),
    ]);
    if (activeDBCategories.length) {
      return new ToTranslate(TrKey.CATEGORY_EXISTS, dbUserLang, { title });
    }
    if (activeDBSubcategories.length) {
      return new ToTranslate(TrKey.SUBCTG_EXISTS, dbUserLang, { title });
    }
  }

  let dbSubcategory: SubcategoryDBModel | null = null;
  if (sbc_id) {
    if (title) {
      return new ToTranslate(TrKey.PARAM_AMBIGUOUS_ERROR, dbUserLang, {
        parName: CommandParameterName.sbcId,
      });
    }
    dbSubcategory = await db.subcategories.findOneById({
      id: sbc_id,
      table_peer_id: peerIdStr,
      peer_id: peerIdStr,
      in_deleted,
      in_archived,
    });
    if (!dbSubcategory) {
      return new ToTranslate(TrKey.SBC_NOT_EXISTS_BY_ID, dbUserLang, {
        id: sbc_id,
      });
    }
    title = dbSubcategory.title;
  } else {
    const dbSubcategories = await db.subcategories.find({
      table_peer_id: peerIdStr,
      title,
      peer_id: peerIdStr,
      in_deleted,
      in_archived,
    });
    if (!dbSubcategories.length) {
      return new ToTranslate(TrKey.SBC_NOT_EXISTS_BY_TITLE, dbUserLang, {
        title,
      });
    }
    dbSubcategory = dbSubcategories[0];
  }
  const toTranslateUnion = await db.tx(async (t): Promise<ToTranslateUnion> => {
    const updatedDBSubcategory = await db.subcategories.txUpdate(
      { table_peer_id: peerIdStr, db: t },
      prepareUpdate(dbSubcategory as SubcategoryDBModel, fromIdStr),
    );
    if (!updatedDBSubcategory) {
      return new ToTranslate(TrKey.SUBCTG_GONE, dbUserLang, { title });
    }
    const updatedDBNotes = await updateNotes(
      t,
      updatedDBSubcategory.id,
      peerIdStr,
    );

    if (updatedDBNotes.length) {
      return new ToTranslate(updAllTrKey, dbUserLang, {
        title,
        ntIds: printNtIds(updatedDBNotes),
      });
    } else {
      return new ToTranslate(updSbcTrKey, dbUserLang, { title });
    }
  });

  return toTranslateUnion;
}

export async function deleteSubcategory(
  botCtx: BotCtxT,
): Promise<ToTranslateUnion> {
  const { fromIdStr, db, dbI, peerIdStr } = botCtx;
  return doSubcategory(
    {
      invCmdTrKey: TrKey.INVALID_DEL_SBC_CMD,
      cmd: BotCommandEnum.delsbc,
      prepareUpdate: (dbSubcategory): SubcategoryDBModel => {
        dbSubcategory.deleted_by_user_id = fromIdStr;
        return checkDelSubcategory(dbSubcategory);
      },
      updateNotes: (t, subcategory_id, peer_id): Promise<NoteDBModel[]> =>
        db.notes.txSetDeletedAllBySbcId({
          t,
          dbI,
          table_peer_id: peerIdStr,
          subcategory_id,
          peer_id,
          deleted_at: newDTDate(),
          deleted_by_user_id: fromIdStr,
        }),
      updAllTrKey: TrKey.SBC_DELETED_WITH_NT,
      updSbcTrKey: TrKey.SBC_DELETED,
    },
    botCtx,
  );
}

export async function undoDeleteSubcategory(
  botCtx: BotCtxT,
): Promise<ToTranslateUnion> {
  const { fromIdStr, db, dbI, peerIdStr } = botCtx;
  return doSubcategory(
    {
      in_deleted: true,
      invCmdTrKey: TrKey.INVALID_UNDO_DEL_SBC_CMD,
      cmd: BotCommandEnum.undodelsbc,
      prepareUpdate: (dbSubcategory): SubcategoryDBModel => {
        dbSubcategory.updated_by_user_id = fromIdStr;
        return checkUndoDelSubcategory(dbSubcategory);
      },
      updateNotes: (t, subcategory_id, peer_id): Promise<NoteDBModel[]> =>
        db.notes.txSetDeletedAllBySbcId({
          t,
          dbI,
          table_peer_id: peerIdStr,
          subcategory_id,
          peer_id,
          deleted_at: null,
          deleted_by_user_id: null,
          in_deleted: true,
        }),
      updAllTrKey: TrKey.SBC_UNDO_DELETED_WITH_NT,
      updSbcTrKey: TrKey.SBC_UNDO_DELETED,
    },
    botCtx,
  );
}

export async function archiveSubcategory(
  botCtx: BotCtxT,
): Promise<ToTranslateUnion> {
  const { fromIdStr, db, dbI, peerIdStr } = botCtx;
  return doSubcategory(
    {
      invCmdTrKey: TrKey.INVALID_ARCH_SBC_CMD,
      cmd: BotCommandEnum.archsbc,
      prepareUpdate: (dbSubcategory): SubcategoryDBModel => {
        dbSubcategory.archived_by_user_id = fromIdStr;
        return checkArchSubcategory(dbSubcategory);
      },
      updateNotes: (t, subcategory_id, peer_id): Promise<NoteDBModel[]> =>
        db.notes.txSetArchivedAllBySbcId({
          t,
          dbI,
          table_peer_id: peerIdStr,
          subcategory_id,
          peer_id,
          archived_at: newDTDate(),
          archived_by_user_id: fromIdStr,
        }),
      updAllTrKey: TrKey.SBC_ARCHIVED_WITH_NT,
      updSbcTrKey: TrKey.SBC_ARCHIVED,
    },
    botCtx,
  );
}

export async function undoArchiveSubcategory(
  botCtx: BotCtxT,
): Promise<ToTranslateUnion> {
  const { fromIdStr, db, dbI, peerIdStr } = botCtx;
  return doSubcategory(
    {
      in_archived: true,
      invCmdTrKey: TrKey.INVALID_UNDO_ARCH_SBC_CMD,
      cmd: BotCommandEnum.undoarchsbc,
      prepareUpdate: (dbSubcategory): SubcategoryDBModel => {
        dbSubcategory.archived_by_user_id = fromIdStr;
        return checkUndoArchSubcategory(dbSubcategory);
      },
      updateNotes: (t, subcategory_id, peer_id): Promise<NoteDBModel[]> =>
        db.notes.txSetArchivedAllBySbcId({
          t,
          dbI,
          table_peer_id: peerIdStr,
          subcategory_id,
          peer_id,
          archived_at: null,
          archived_by_user_id: null,
          in_archived: true,
        }),
      updAllTrKey: TrKey.SBC_UNDO_ARCHIVED_WITH_NT,
      updSbcTrKey: TrKey.SBC_UNDO_ARCHIVED,
    },
    botCtx,
  );
}
