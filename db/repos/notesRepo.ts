import { DbT, DbProtocolT } from '../db';
import { notes as sql } from '../sql';
import {
  NoteModel,
  NoteJoinCtgSbcDBModel,
  NoteDBModel,
  NotesBalanceDBModel,
} from '../models/noteModel';
import {
  TxSetDeleteAllByCtgParamsT,
  txSetAllByCtgId,
  SetDeleteAllByCtgParamsT,
  TxSetDeleteAllBySbcParamsT,
  txSetAllBySbcId,
  SetDeleteAllBySbcParamsT,
  TxSetArchiveAllByCtgParamsT,
  SetArchiveAllByCtgParamsT,
  TxSetArchiveAllBySbcParamsT,
  SetArchiveAllBySbcParamsT,
  StrOrNumT,
} from './commonRepo';
import { PREFIX } from './prefix';
import { IMain } from 'pg-promise';
import { logPgNt } from '../../logger/logger';
import { stringOrNull } from '../../bot/helpers';

export class NotesRepository {
  constructor(db: DbT, pgp: IMain) {
    this.db = db;
    this.pgp = pgp;
  }

  private db: DbT;
  private pgp: IMain;

  create({ table_peer_id }: { table_peer_id: StrOrNumT }): Promise<null> {
    const args = {
      ctg_table: new this.pgp.helpers.TableName({
        table: `${PREFIX.CTG}${table_peer_id}`,
      }),
      sbc_table: new this.pgp.helpers.TableName({
        table: `${PREFIX.SBC}${table_peer_id}`,
      }),
      nt_table: new this.pgp.helpers.TableName({
        table: `${PREFIX.NT}${table_peer_id}`,
      }),
    };
    logPgNt(this.pgp.as.format(sql.ntCreate, args));
    return this.db.none(sql.ntCreate, args);
  }

  add(
    { table_peer_id }: { table_peer_id: StrOrNumT },
    { note_number, note_text, subcategory_id, ...note }: NoteModel,
  ): Promise<NoteDBModel> {
    return this.db.one(sql.ntAdd, {
      nt_table: new this.pgp.helpers.TableName({
        table: `${PREFIX.NT}${table_peer_id}`,
      }),
      ...note,
      note_number: note_number || null,
      note_text: note_text || null,
      subcategory_id: subcategory_id || null,
    });
  }

  listJoinCtgSbc({
    table_peer_id,
    peer_id,
    limit = null,
    offset = null,
    start_datetime = null,
    end_datetime = null,
    query = undefined,
    ctgQuery = undefined,
    sbcQuery = undefined,
    ctgQueryTitle = undefined,
    ctgQueryDescr = undefined,
    sbcQueryTitle = undefined,
    sbcQueryDescr = undefined,
    ntQueryText = undefined,
    ntQueryNumber = undefined,
    ntQueryNumberGreaterThan = undefined,
    ntQueryNumberGreaterThanOrEq = undefined,
    ntQueryNumberLessThan = undefined,
    ntQueryNumberLessThanOrEq = undefined,
    ctgQueryIdGreaterThan = undefined,
    ctgQueryIdGreaterThanOrEq = undefined,
    ctgQueryIdLessThan = undefined,
    ctgQueryIdLessThanOrEq = undefined,
    sbcQueryIdGreaterThan = undefined,
    sbcQueryIdGreaterThanOrEq = undefined,
    sbcQueryIdLessThan = undefined,
    sbcQueryIdLessThanOrEq = undefined,
    ntQueryIdGreaterThan = undefined,
    ntQueryIdGreaterThanOrEq = undefined,
    ntQueryIdLessThan = undefined,
    ntQueryIdLessThanOrEq = undefined,
    in_deleted = false,
    in_archived = false,
  }: {
    table_peer_id: StrOrNumT;
    peer_id: StrOrNumT;
    limit?: number | null;
    offset?: number | null;
    start_datetime?: Date | null;
    end_datetime?: Date | null;
    query?: string;
    ctgQuery?: string;
    sbcQuery?: string;
    ctgQueryTitle?: string;
    ctgQueryDescr?: string;
    sbcQueryTitle?: string;
    sbcQueryDescr?: string;
    ntQueryText?: string;
    ntQueryNumber?: number;
    ntQueryNumberGreaterThan?: number;
    ntQueryNumberGreaterThanOrEq?: number;
    ntQueryNumberLessThan?: number;
    ntQueryNumberLessThanOrEq?: number;
    ctgQueryIdGreaterThan?: number;
    ctgQueryIdGreaterThanOrEq?: number;
    ctgQueryIdLessThan?: number;
    ctgQueryIdLessThanOrEq?: number;
    sbcQueryIdGreaterThan?: number;
    sbcQueryIdGreaterThanOrEq?: number;
    sbcQueryIdLessThan?: number;
    sbcQueryIdLessThanOrEq?: number;
    ntQueryIdGreaterThan?: number;
    ntQueryIdGreaterThanOrEq?: number;
    ntQueryIdLessThan?: number;
    ntQueryIdLessThanOrEq?: number;
    in_deleted?: boolean | null;
    in_archived?: boolean | null;
  }): Promise<NoteJoinCtgSbcDBModel[]> {
    const args = {
      table_peer_id: stringOrNull(table_peer_id),
      peer_id: stringOrNull(peer_id),
      ctg_table: new this.pgp.helpers.TableName({
        table: `${PREFIX.CTG}${table_peer_id}`,
      }),
      sbc_table: new this.pgp.helpers.TableName({
        table: `${PREFIX.SBC}${table_peer_id}`,
      }),
      nt_table: new this.pgp.helpers.TableName({
        table: `${PREFIX.NT}${table_peer_id}`,
      }),
      limit,
      offset,
      start_datetime,
      end_datetime,
      query,
      ctgQuery,
      sbcQuery,
      ctgQueryTitle,
      ctgQueryDescr,
      sbcQueryTitle,
      sbcQueryDescr,
      ntQueryText,
      ntQueryNumber,
      ntQueryNumberGreaterThan,
      ntQueryNumberGreaterThanOrEq,
      ntQueryNumberLessThan,
      ntQueryNumberLessThanOrEq,
      ctgQueryIdGreaterThan,
      ctgQueryIdGreaterThanOrEq,
      ctgQueryIdLessThan,
      ctgQueryIdLessThanOrEq,
      sbcQueryIdGreaterThan,
      sbcQueryIdGreaterThanOrEq,
      sbcQueryIdLessThan,
      sbcQueryIdLessThanOrEq,
      ntQueryIdGreaterThan,
      ntQueryIdGreaterThanOrEq,
      ntQueryIdLessThan,
      ntQueryIdLessThanOrEq,
      in_deleted,
      in_archived,
    };
    logPgNt(this.pgp.as.format(sql.ntListJoinCtgSbc, args));
    return this.db.any(sql.ntListJoinCtgSbc, args);
  }

  txUpdate(
    { table_peer_id, db }: { table_peer_id: StrOrNumT; db: DbProtocolT },
    dbCategory: NoteDBModel,
  ): Promise<NoteDBModel | null> {
    return db.oneOrNone(sql.ntUpdate, {
      nt_table: new this.pgp.helpers.TableName({
        table: `${PREFIX.NT}${table_peer_id}`,
      }),
      ...dbCategory,
    });
  }

  update(
    { table_peer_id }: { table_peer_id: StrOrNumT },
    dbNote: NoteDBModel,
  ): Promise<NoteDBModel | null> {
    return this.txUpdate({ table_peer_id, db: this.db }, dbNote);
  }

  deleteAll({
    table_peer_id,
    peer_id,
  }: {
    table_peer_id: StrOrNumT;
    peer_id?: StrOrNumT;
  }): Promise<NoteDBModel[]> {
    const args = {
      nt_table: new this.pgp.helpers.TableName({
        table: `${PREFIX.NT}${table_peer_id}`,
      }),
      peer_id: stringOrNull(peer_id),
    };
    logPgNt(this.pgp.as.format(sql.ntDeleteAll, args));
    return this.db.any(sql.ntDeleteAll, args);
  }

  findJoinCtgSbc({
    table_peer_id,
    in_deleted = false,
    in_archived = false,
    peer_id,
    ...params
  }: {
    table_peer_id: StrOrNumT;
    note_id: number;
    peer_id: StrOrNumT;
    in_deleted?: boolean | null;
    in_archived?: boolean | null;
  }): Promise<NoteJoinCtgSbcDBModel | null> {
    const args = {
      ctg_table: new this.pgp.helpers.TableName({
        table: `${PREFIX.CTG}${table_peer_id}`,
      }),
      sbc_table: new this.pgp.helpers.TableName({
        table: `${PREFIX.SBC}${table_peer_id}`,
      }),
      nt_table: new this.pgp.helpers.TableName({
        table: `${PREFIX.NT}${table_peer_id}`,
      }),
      ...params,
      peer_id: stringOrNull(peer_id),
      in_deleted,
      in_archived,
    };
    logPgNt(this.pgp.as.format(sql.ntFindJoinCtgSbc, args));
    return this.db.oneOrNone(sql.ntFindJoinCtgSbc, args);
  }

  txSetDeletedAllByCtgId({
    t,
    dbI,
    table_peer_id,
    category_id,
    peer_id,
    deleted_at,
    deleted_by_user_id,
    in_deleted,
  }: TxSetDeleteAllByCtgParamsT): Promise<NoteDBModel[]> {
    return txSetAllByCtgId<NoteDBModel>({
      sql: sql.ntSetDeletedAllByCtgId,
      t,
      table_peer_id,
      dbI,
      category_id,
      peer_id,
      deleted_at,
      deleted_by_user_id,
      in_deleted,
    });
  }

  setDeletedAllByCtgId({
    table_peer_id,
    category_id,
    peer_id,
    deleted_at,
    deleted_by_user_id,
    in_deleted,
  }: SetDeleteAllByCtgParamsT): Promise<NoteDBModel[]> {
    return this.txSetDeletedAllByCtgId({
      t: this.db,
      dbI: this.pgp,
      table_peer_id,
      category_id,
      peer_id,
      deleted_at,
      deleted_by_user_id,
      in_deleted,
    });
  }

  txSetDeletedAllBySbcId({
    t,
    dbI,
    table_peer_id,
    subcategory_id,
    peer_id,
    deleted_at,
    deleted_by_user_id,
    in_deleted,
  }: TxSetDeleteAllBySbcParamsT): Promise<NoteDBModel[]> {
    return txSetAllBySbcId<NoteDBModel>({
      sql: sql.ntSetDeletedAllBySbcId,
      t,
      table_peer_id,
      dbI,
      subcategory_id,
      peer_id,
      deleted_at,
      deleted_by_user_id,
      in_deleted,
    });
  }

  setDeletedAllBySbcId({
    table_peer_id,
    subcategory_id,
    peer_id,
    deleted_at,
    deleted_by_user_id,
    in_deleted,
  }: SetDeleteAllBySbcParamsT): Promise<NoteDBModel[]> {
    return this.txSetDeletedAllBySbcId({
      t: this.db,
      dbI: this.pgp,
      table_peer_id,
      subcategory_id,
      peer_id,
      deleted_at,
      deleted_by_user_id,
      in_deleted,
    });
  }

  txSetArchivedAllByCtgId({
    t,
    dbI,
    table_peer_id,
    category_id,
    peer_id,
    archived_at,
    archived_by_user_id,
    in_archived,
  }: TxSetArchiveAllByCtgParamsT): Promise<NoteDBModel[]> {
    return txSetAllByCtgId<NoteDBModel>({
      sql: sql.ntSetArchivedAllByCtgId,
      t,
      dbI,
      table_peer_id,
      category_id,
      peer_id,
      archived_at,
      archived_by_user_id,
      in_archived,
    });
  }

  setArchivedAllByCtgId({
    table_peer_id,
    category_id,
    peer_id,
    archived_at,
    archived_by_user_id,
    in_archived,
  }: SetArchiveAllByCtgParamsT): Promise<NoteDBModel[]> {
    return this.txSetArchivedAllByCtgId({
      t: this.db,
      dbI: this.pgp,
      table_peer_id,
      category_id,
      peer_id,
      archived_at,
      archived_by_user_id,
      in_archived,
    });
  }

  txSetArchivedAllBySbcId({
    t,
    dbI,
    table_peer_id,
    subcategory_id,
    peer_id,
    archived_at,
    archived_by_user_id,
    in_archived,
  }: TxSetArchiveAllBySbcParamsT): Promise<NoteDBModel[]> {
    return txSetAllBySbcId<NoteDBModel>({
      sql: sql.ntSetArchivedAllBySbcId,
      t,
      dbI,
      table_peer_id,
      subcategory_id,
      peer_id,
      archived_at,
      archived_by_user_id,
      in_archived,
    });
  }

  setArchivedAllBySbcId({
    table_peer_id,
    subcategory_id,
    peer_id,
    archived_at,
    archived_by_user_id,
    in_archived,
  }: SetArchiveAllBySbcParamsT): Promise<NoteDBModel[]> {
    return this.txSetArchivedAllBySbcId({
      t: this.db,
      dbI: this.pgp,
      table_peer_id,
      subcategory_id,
      peer_id,
      archived_at,
      archived_by_user_id,
      in_archived,
    });
  }

  balance({
    table_peer_id,
    start_datetime = null,
    end_datetime = null,
    in_deleted = false,
    in_archived = null,
    ...params
  }: {
    table_peer_id: StrOrNumT;
    peer_id: StrOrNumT;
    start_datetime?: Date | null;
    end_datetime?: Date | null;
    in_deleted?: boolean | null;
    in_archived?: boolean | null;
  }): Promise<NotesBalanceDBModel> {
    const args = {
      ctg_table: new this.pgp.helpers.TableName({
        table: `${PREFIX.CTG}${table_peer_id}`,
      }),
      sbc_table: new this.pgp.helpers.TableName({
        table: `${PREFIX.SBC}${table_peer_id}`,
      }),
      nt_table: new this.pgp.helpers.TableName({
        table: `${PREFIX.NT}${table_peer_id}`,
      }),
      ...params,
      start_datetime,
      end_datetime,
      in_deleted,
      in_archived,
    };
    logPgNt(this.pgp.as.format(sql.ntBalance, args));
    return this.db.one(sql.ntBalance, args);
  }

  transferNotes({
    table_peer_id,
    peer_id,
    updated_by_user_id,
    updated_at,
    from_category_id,
    from_subcategory_id,
    to_category_id,
    to_subcategory_id,
    in_deleted = false,
  }: {
    table_peer_id: StrOrNumT;
    peer_id: StrOrNumT;
    updated_by_user_id: string;
    updated_at: Date;
    from_category_id?: number;
    from_subcategory_id?: number;
    to_category_id: number | null;
    to_subcategory_id: number | null;
    in_deleted?: boolean;
  }): Promise<NoteDBModel[]> {
    return this.db.any(sql.ntsTransfer, {
      nt_table: new this.pgp.helpers.TableName({
        table: `${PREFIX.NT}${table_peer_id}`,
      }),
      peer_id: stringOrNull(peer_id),
      from_category_id,
      from_subcategory_id,
      in_deleted,
      updated_by_user_id,
      updated_at,
      to_category_id,
      to_subcategory_id,
    });
  }

  transferNote({
    table_peer_id,
    note_id,
    peer_id,
    updated_by_user_id,
    updated_at,
    from_category_id,
    from_subcategory_id,
    to_category_id,
    to_subcategory_id,
    in_deleted = false,
  }: {
    table_peer_id: StrOrNumT;
    note_id: number;
    peer_id: StrOrNumT;
    updated_by_user_id: string;
    updated_at: Date;
    from_category_id?: number;
    from_subcategory_id?: number;
    to_category_id: number | null;
    to_subcategory_id: number | null;
    in_deleted?: boolean;
  }): Promise<NoteDBModel | null> {
    return this.db.oneOrNone(sql.ntTransfer, {
      nt_table: new this.pgp.helpers.TableName({
        table: `${PREFIX.NT}${table_peer_id}`,
      }),
      peer_id: stringOrNull(peer_id),
      from_category_id,
      from_subcategory_id,
      in_deleted,
      updated_by_user_id,
      updated_at,
      to_category_id,
      to_subcategory_id,
      note_id,
    });
  }

  findOneById({
    table_peer_id,
    id,
    peer_id,
    in_deleted = false,
    in_archived = false,
  }: {
    table_peer_id: StrOrNumT;
    id: number;
    peer_id: StrOrNumT;
    in_deleted?: boolean | null;
    in_archived?: boolean | null;
  }): Promise<NoteDBModel | null> {
    return this.db.oneOrNone(sql.ntFindOneById, {
      nt_table: new this.pgp.helpers.TableName({
        table: `${PREFIX.NT}${table_peer_id}`,
      }),
      id,
      peer_id: stringOrNull(peer_id),
      in_deleted,
      in_archived,
    });
  }
}
