import {
  composeAddCategory,
  printListCategories,
  DEFAULT_CTG_TYPE,
  DEFAULT_LIST_CTG_LIMIT,
  MAX_CTG_TITLE_LENGTH,
  MAX_CTG_DESC_LENGTH,
  composeUpdCategory,
  composeDelCategory,
  composeUndoDelCategory,
  CategoryDBModel,
  composeArchCategory,
  composeUndoArchCategory,
  generateCategoryCreatedTranslations,
} from '../../db/models/categoryModel';
import { TrKey } from '../../i18n/keys';
import { ToTranslate, ToTranslateUnion } from '../../i18n/i18n';
import {
  printSbcTitles,
  SubcategoryDBModel,
} from '../../db/models/subcategoryModel';
import { printNtIds, NoteDBModel } from '../../db/models/noteModel';

import { BotCtxT } from '../bot';
import {
  generateInvInstruction,
  BotCommandEnum,
  toListHeader,
  calcLimitSkip,
} from '../helpers';
import {
  detectCMDCtgListParameters,
  safeSplitString,
  detectCMDCtgAddParams,
  safeSplitString3,
  generateInvalidTitles,
  hasErrorProneString,
  CommandParameterName,
  detectCMDCtgDoParams,
  safeSplitString2,
} from '../parameters';
import { newDTDate } from '../datetime';
import { DbProtocolT } from '../../db/db';

export async function addCategory({
  db,
  msgText,
  peerIdStr,
  fromIdStr,
  dbUserLang,
  dbUserTimeZone,
}: BotCtxT): Promise<ToTranslateUnion> {
  const msgParts = safeSplitString(msgText);
  if (msgParts.length <= 1) {
    return generateInvInstruction(
      TrKey.INVALID_ADD_CTG_CMD,
      BotCommandEnum.addctg,
      dbUserLang,
    );
  }
  const result = detectCMDCtgAddParams(msgText, dbUserLang, dbUserTimeZone);
  if (result instanceof ToTranslate) return result;
  const { ctg_type, ctg_t, ctg_descr } = result.detectedParams;
  const type = ctg_type || DEFAULT_CTG_TYPE;
  const newMsgText = result.detectedPramsFound ? result.rest : msgText;

  let [, title, description] = safeSplitString3(newMsgText);
  if (ctg_t) {
    if (title) {
      return new ToTranslate(TrKey.PARAM_AMBIGUOUS_ERROR, dbUserLang, {
        parName: CommandParameterName.ctgTitle,
      });
    }
    title = ctg_t;
  }
  if (ctg_descr) {
    if (description) {
      return new ToTranslate(TrKey.PARAM_AMBIGUOUS_ERROR, dbUserLang, {
        parName: CommandParameterName.ctgDescription,
      });
    }
    description = ctg_descr;
  }
  if (!title) {
    return generateInvInstruction(
      TrKey.INVALID_ADD_CTG_CMD,
      BotCommandEnum.addctg,
      dbUserLang,
    );
  }

  if (title.length > MAX_CTG_TITLE_LENGTH) {
    return new ToTranslate(TrKey.CTG_TITLE_MAX_ERROR, dbUserLang, {
      max: MAX_CTG_TITLE_LENGTH,
    });
  }

  if (description && description.length > MAX_CTG_DESC_LENGTH) {
    return new ToTranslate(TrKey.CTG_DESC_MAX_ERROR, dbUserLang, {
      max: MAX_CTG_DESC_LENGTH,
    });
  }

  const newCategory = composeAddCategory({
    title,
    peer_id: peerIdStr,
    created_by_user_id: fromIdStr,
    category_type: type,
    description,
  });

  const [existingDBCategories, existingDBSubcategories] = await Promise.all([
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

  if (existingDBCategories.length) {
    return new ToTranslate(TrKey.CATEGORY_EXISTS, dbUserLang, { title });
  }
  if (existingDBSubcategories.length) {
    return new ToTranslate(TrKey.TITLE_EXISTS_IN_SUBCTG, dbUserLang, { title });
  }

  const newDBCategory = await db.categories.add(
    { table_peer_id: peerIdStr },
    newCategory,
  );
  if (newDBCategory) {
    return new ToTranslate(
      TrKey.RES_CTG_ADDED,
      dbUserLang,
      {
        createdFields: generateCategoryCreatedTranslations({
          categoryId: newDBCategory.id,
          categoryType: newDBCategory.category_type,
          categoryTitle: newDBCategory.title,
          categoryDescription: newDBCategory.description,
          lang: dbUserLang,
        }),
      },
      ['createdFields'],
    );
  } else {
    return new ToTranslate(TrKey.CATEGORY_GONE, dbUserLang, { title });
  }
}

export async function listCategories({
  db,
  peerIdStr,
  dbUserLang,
  dbUserTimeZone,
  msgText,
}: BotCtxT): Promise<ToTranslateUnion> {
  const result = detectCMDCtgListParameters(
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

  const [limitNum, skipNum] = calcLimitSkip(DEFAULT_LIST_CTG_LIMIT, l, s);
  const dbCategoriesJoinSbc = await db.categories.listJoinSbc({
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
      ctgCount:
        limitNum !== dbCategoriesJoinSbc.length
          ? dbCategoriesJoinSbc.length
          : undefined,
    },
    dbCategoriesJoinSbc.length === 0
      ? new ToTranslate(TrKey.NO_CATEGORIES, dbUserLang)
      : new ToTranslate(TrKey.YOUR_CATEGORIES, dbUserLang, {
          text: printListCategories({
            categories: dbCategoriesJoinSbc,
            showId: show_id,
            showDeleted: show_del,
            showArchived: show_arch,
          }),
        }),
    dbUserLang,
  );
}

export async function updateCategoryName({
  db,
  msgText,
  peerIdStr,
  dbUserLang,
  fromIdStr,
}: BotCtxT): Promise<ToTranslateUnion> {
  const msgParts = safeSplitString(msgText);
  if (msgParts.length <= 2 || msgParts.length >= 4) {
    return generateInvInstruction(
      TrKey.INVALID_UPDN_CTG_CMD,
      BotCommandEnum.updctgn,
      dbUserLang,
    );
  }
  const [, oldTitle, newTitle] = msgParts;
  if (newTitle.length > MAX_CTG_TITLE_LENGTH) {
    return new ToTranslate(TrKey.CTG_TITLE_MAX_ERROR, dbUserLang, {
      max: MAX_CTG_TITLE_LENGTH,
    });
  }
  if (hasErrorProneString(msgParts)) {
    return new ToTranslate(TrKey.ERROR_PRONE_STRING, dbUserLang, {
      invTitles: generateInvalidTitles(),
    });
  }

  const [beforeCategories, afterCategories, existingDBSubcategories] =
    await Promise.all([
      db.categories.find({
        table_peer_id: peerIdStr,
        title: oldTitle,
        peer_id: peerIdStr,
      }),
      db.categories.find({
        table_peer_id: peerIdStr,
        title: newTitle,
        peer_id: peerIdStr,
      }),
      db.subcategories.find({
        table_peer_id: peerIdStr,
        title: newTitle,
        peer_id: peerIdStr,
      }),
    ]);

  if (!beforeCategories.length) {
    return new ToTranslate(TrKey.CTG_NOT_EXISTS_BY_TITLE, dbUserLang, {
      title: oldTitle,
    });
  }
  if (afterCategories.length) {
    return new ToTranslate(TrKey.CATEGORY_EXISTS, dbUserLang, {
      title: newTitle,
    });
  }
  if (existingDBSubcategories.length) {
    return new ToTranslate(TrKey.TITLE_EXISTS_IN_SUBCTG, dbUserLang, {
      title: newTitle,
    });
  }
  const beforeCategory = beforeCategories[0];
  const oldCtgTitle = beforeCategory.title;
  beforeCategory.title = newTitle;
  beforeCategory.updated_by_user_id = fromIdStr;
  const updatedDBCategory = await db.categories.update(
    { table_peer_id: peerIdStr },
    composeUpdCategory(beforeCategory),
  );

  if (updatedDBCategory) {
    return new ToTranslate(TrKey.CATEGORY_NAME_UPDATED, dbUserLang, {
      oldTitle: oldCtgTitle,
      newTitle: updatedDBCategory.title,
    });
  } else {
    return new ToTranslate(TrKey.CATEGORY_GONE, dbUserLang, {
      title: oldTitle,
    });
  }
}

export async function updateCategoryDesc({
  db,
  msgText,
  peerIdStr,
  dbUserLang,
  fromIdStr,
}: BotCtxT): Promise<ToTranslateUnion> {
  const msgParts = safeSplitString3(msgText);
  if (msgParts.length <= 1) {
    return generateInvInstruction(
      TrKey.INVALID_UPDD_CTG_CMD,
      BotCommandEnum.updctgd,
      dbUserLang,
    );
  }
  const [, ctgTitle, newDescription] = msgParts;
  if (newDescription && newDescription.length > MAX_CTG_DESC_LENGTH) {
    return new ToTranslate(TrKey.CTG_DESC_MAX_ERROR, dbUserLang, {
      max: MAX_CTG_DESC_LENGTH,
    });
  }
  if (hasErrorProneString(safeSplitString(msgText))) {
    return new ToTranslate(TrKey.ERROR_PRONE_STRING, dbUserLang, {
      invTitles: generateInvalidTitles(),
    });
  }

  const dbCategories = await db.categories.find({
    table_peer_id: peerIdStr,
    title: ctgTitle,
    peer_id: peerIdStr,
  });

  if (!dbCategories.length) {
    return new ToTranslate(TrKey.CTG_NOT_EXISTS_BY_TITLE, dbUserLang, {
      title: ctgTitle,
    });
  }
  const dbCategory = dbCategories[0];
  const oldDesc = dbCategory.description;
  dbCategory.description = newDescription || '';
  dbCategory.updated_by_user_id = fromIdStr;
  const updatedDBCategory = await db.categories.update(
    { table_peer_id: peerIdStr },
    composeUpdCategory(dbCategory),
  );

  if (updatedDBCategory) {
    return new ToTranslate(TrKey.CATEGORY_DESC_UPDATED, dbUserLang, {
      ctgTitle,
      oldDesc,
      newDesc: updatedDBCategory.description,
    });
  } else {
    return new ToTranslate(TrKey.CATEGORY_GONE, dbUserLang, {
      title: ctgTitle,
    });
  }
}

async function doCategory(
  {
    invCmdTrKey,
    cmd,
    in_deleted,
    in_archived,
    prepareUpdate,
    updateSubcategories,
    updateNotes,
    updAllTrKey,
    updSbcTrKey,
    updNtTrKey,
    updCtgTrKey,
  }: {
    invCmdTrKey: TrKey;
    cmd: BotCommandEnum;
    in_deleted?: boolean;
    in_archived?: boolean;
    prepareUpdate: (
      dbCategory: CategoryDBModel,
      fromIdStr: string,
    ) => CategoryDBModel;
    updateSubcategories: (
      t: DbProtocolT,
      category_id: number,
      peer_id: string,
    ) => Promise<SubcategoryDBModel[]>;
    updateNotes: (
      t: DbProtocolT,
      category_id: number,
      peer_id: string,
    ) => Promise<NoteDBModel[]>;
    updAllTrKey: TrKey;
    updSbcTrKey: TrKey;
    updNtTrKey: TrKey;
    updCtgTrKey: TrKey;
  },
  { db, msgText, peerIdStr, dbUserLang, dbUserTimeZone, fromIdStr }: BotCtxT,
): Promise<ToTranslateUnion> {
  const result = detectCMDCtgDoParams(msgText, dbUserLang, dbUserTimeZone);
  if (result instanceof ToTranslate) return result;
  const newMsgText = result.detectedPramsFound ? result.rest : msgText;
  const msgParts = safeSplitString(newMsgText);
  if (msgParts.length >= 3) {
    return generateInvInstruction(invCmdTrKey, cmd, dbUserLang);
  }
  const { ctg_id, ctg_t } = result.detectedParams;
  let [, title] = msgParts;
  if (ctg_t) {
    if (title) {
      return new ToTranslate(TrKey.PARAM_AMBIGUOUS_ERROR, dbUserLang, {
        parName: CommandParameterName.ctgTitle,
      });
    }
    title = ctg_t;
  }
  if (!ctg_id && !title) {
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

  let dbCategory: CategoryDBModel | null = null;
  if (ctg_id) {
    if (title) {
      return new ToTranslate(TrKey.PARAM_AMBIGUOUS_ERROR, dbUserLang, {
        parName: CommandParameterName.ctgId,
      });
    }
    dbCategory = await db.categories.findOneById({
      id: ctg_id,
      table_peer_id: peerIdStr,
      peer_id: peerIdStr,
      in_deleted,
      in_archived,
    });
    if (!dbCategory) {
      return new ToTranslate(TrKey.CTG_NOT_EXISTS_BY_ID, dbUserLang, {
        id: ctg_id,
      });
    }
    title = dbCategory.title;
  } else {
    const dbCategories = await db.categories.find({
      table_peer_id: peerIdStr,
      title,
      peer_id: peerIdStr,
      in_deleted,
      in_archived,
    });
    if (!dbCategories.length) {
      return new ToTranslate(TrKey.CTG_NOT_EXISTS_BY_TITLE, dbUserLang, {
        title,
      });
    }
    dbCategory = dbCategories[0];
  }

  const toTranslateUnion = await db.tx(async (t): Promise<ToTranslateUnion> => {
    const updatedDBCategory = await db.categories.txUpdate(
      { table_peer_id: peerIdStr, db: t },
      prepareUpdate(dbCategory as CategoryDBModel, fromIdStr),
    );
    if (!updatedDBCategory) {
      return new ToTranslate(TrKey.CATEGORY_GONE, dbUserLang, { title });
    }
    const updatedDBSubcategories = await updateSubcategories(
      t,
      updatedDBCategory.id,
      peerIdStr,
    );
    const updatedDBNotes = await updateNotes(
      t,
      updatedDBCategory.id,
      peerIdStr,
    );

    if (updatedDBSubcategories.length && updatedDBNotes.length) {
      return new ToTranslate(updAllTrKey, dbUserLang, {
        title,
        sbcTitles: printSbcTitles(updatedDBSubcategories),
        ntIds: printNtIds(updatedDBNotes),
      });
    } else if (updatedDBSubcategories.length) {
      return new ToTranslate(updSbcTrKey, dbUserLang, {
        title,
        sbcTitles: printSbcTitles(updatedDBSubcategories),
      });
    } else if (updatedDBNotes.length) {
      return new ToTranslate(updNtTrKey, dbUserLang, {
        title,
        ntIds: printNtIds(updatedDBNotes),
      });
    } else {
      return new ToTranslate(updCtgTrKey, dbUserLang, { title });
    }
  });

  return toTranslateUnion;
}

export function deleteCategory(botCtx: BotCtxT): Promise<ToTranslateUnion> {
  const { fromIdStr, db, dbI, peerIdStr } = botCtx;
  return doCategory(
    {
      invCmdTrKey: TrKey.INVALID_DEL_CTG_CMD,
      cmd: BotCommandEnum.delctg,
      prepareUpdate: (dbCategory): CategoryDBModel => {
        dbCategory.deleted_by_user_id = fromIdStr;
        return composeDelCategory(dbCategory);
      },
      updateSubcategories: (
        t,
        category_id,
        peer_id,
      ): Promise<SubcategoryDBModel[]> =>
        db.subcategories.txSetDeletedAllByCtgId({
          t,
          dbI,
          table_peer_id: peerIdStr,
          category_id,
          peer_id,
          deleted_at: newDTDate(),
          deleted_by_user_id: fromIdStr,
        }),
      updateNotes: (t, category_id, peer_id): Promise<NoteDBModel[]> =>
        db.notes.txSetDeletedAllByCtgId({
          t,
          dbI,
          table_peer_id: peerIdStr,
          category_id,
          peer_id,
          deleted_at: newDTDate(),
          deleted_by_user_id: fromIdStr,
        }),
      updAllTrKey: TrKey.CTG_DELETED_WITH_SBC_AND_NT,
      updSbcTrKey: TrKey.CTG_DELETED_WITH_SBC,
      updNtTrKey: TrKey.CTG_DELETED_WITH_NT,
      updCtgTrKey: TrKey.CTG_DELETED,
    },
    botCtx,
  );
}

export function undoDeleteCategory(botCtx: BotCtxT): Promise<ToTranslateUnion> {
  const { fromIdStr, db, dbI, peerIdStr } = botCtx;
  return doCategory(
    {
      in_deleted: true,
      invCmdTrKey: TrKey.INVALID_UNDO_DEL_CTG_CMD,
      cmd: BotCommandEnum.undodelctg,
      prepareUpdate: (dbCategory): CategoryDBModel => {
        dbCategory.updated_by_user_id = fromIdStr;
        return composeUndoDelCategory(dbCategory);
      },
      updateSubcategories: (
        t,
        category_id,
        peer_id,
      ): Promise<SubcategoryDBModel[]> =>
        db.subcategories.txSetDeletedAllByCtgId({
          t,
          dbI,
          table_peer_id: peerIdStr,
          category_id,
          peer_id,
          deleted_at: null,
          deleted_by_user_id: null,
          in_deleted: true,
        }),
      updateNotes: (t, category_id, peer_id): Promise<NoteDBModel[]> =>
        db.notes.txSetDeletedAllByCtgId({
          t,
          dbI,
          table_peer_id: peerIdStr,
          category_id,
          peer_id,
          deleted_at: null,
          deleted_by_user_id: null,
          in_deleted: true,
        }),
      updAllTrKey: TrKey.CTG_UNDO_DELETED_WITH_SBC_AND_NT,
      updSbcTrKey: TrKey.CTG_UNDO_DELETED_WITH_SBC,
      updNtTrKey: TrKey.CTG_UNDO_DELETED_WITH_NT,
      updCtgTrKey: TrKey.CTG_UNDO_DELETED,
    },
    botCtx,
  );
}

export function archiveCategory(botCtx: BotCtxT): Promise<ToTranslateUnion> {
  const { fromIdStr, db, dbI, peerIdStr } = botCtx;
  return doCategory(
    {
      invCmdTrKey: TrKey.INVALID_ARCH_CTG_CMD,
      cmd: BotCommandEnum.archctg,
      prepareUpdate: (dbCategory): CategoryDBModel => {
        dbCategory.archived_by_user_id = fromIdStr;
        return composeArchCategory(dbCategory);
      },
      updateSubcategories: (
        t,
        category_id,
        peer_id,
      ): Promise<SubcategoryDBModel[]> =>
        db.subcategories.txSetArchivedAllByCtgId({
          t,
          dbI,
          table_peer_id: peerIdStr,
          category_id,
          peer_id,
          archived_at: newDTDate(),
          archived_by_user_id: fromIdStr,
        }),
      updateNotes: (t, category_id, peer_id): Promise<NoteDBModel[]> =>
        db.notes.txSetArchivedAllByCtgId({
          t,
          dbI,
          table_peer_id: peerIdStr,
          category_id,
          peer_id,
          archived_at: newDTDate(),
          archived_by_user_id: fromIdStr,
        }),
      updAllTrKey: TrKey.CTG_ARCHIVED_WITH_SBC_AND_NT,
      updSbcTrKey: TrKey.CTG_ARCHIVED_WITH_SBC,
      updNtTrKey: TrKey.CTG_ARCHIVED_WITH_NT,
      updCtgTrKey: TrKey.CTG_ARCHIVED,
    },
    botCtx,
  );
}

export function undoArchiveCategory(
  botCtx: BotCtxT,
): Promise<ToTranslateUnion> {
  const { fromIdStr, db, dbI, peerIdStr } = botCtx;
  return doCategory(
    {
      in_archived: true,
      invCmdTrKey: TrKey.INVALID_UNDO_ARCH_CTG_CMD,
      cmd: BotCommandEnum.undoarchctg,
      prepareUpdate: (dbCategory): CategoryDBModel => {
        dbCategory.archived_by_user_id = fromIdStr;
        return composeUndoArchCategory(dbCategory);
      },
      updateSubcategories: (
        t,
        category_id,
        peer_id,
      ): Promise<SubcategoryDBModel[]> =>
        db.subcategories.txSetArchivedAllByCtgId({
          t,
          dbI,
          table_peer_id: peerIdStr,
          category_id,
          peer_id,
          archived_at: null,
          archived_by_user_id: null,
          in_archived: true,
        }),
      updateNotes: (t, category_id, peer_id): Promise<NoteDBModel[]> =>
        db.notes.txSetArchivedAllByCtgId({
          t,
          dbI,
          table_peer_id: peerIdStr,
          category_id,
          peer_id,
          archived_at: null,
          archived_by_user_id: null,
          in_archived: true,
        }),
      updAllTrKey: TrKey.CTG_UNDO_ARCHIVED_WITH_SBC_AND_NT,
      updSbcTrKey: TrKey.CTG_UNDO_ARCHIVED_WITH_SBC,
      updNtTrKey: TrKey.CTG_UNDO_ARCHIVED_WITH_NT,
      updCtgTrKey: TrKey.CTG_UNDO_ARCHIVED,
    },
    botCtx,
  );
}
