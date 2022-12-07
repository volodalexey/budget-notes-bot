import { DbT, DbProtocolT } from '../db';
import { subcategories as sql } from '../sql';
import {
  SubcategoryModel,
  SubcategoryDBModel,
  SubcategoryJoinCtgDBModel,
} from '../models/subcategoryModel';
import {
  SetDeleteAllByCtgParamsT,
  TxSetDeleteAllByCtgParamsT,
  TxSetArchiveAllByCtgParamsT,
  SetArchiveAllByCtgParamsT,
  txSetAllByCtgId,
  StrOrNumT,
} from './commonRepo';
import { PREFIX } from './prefix';
import { IMain } from 'pg-promise';
import { logPgSbc } from '../../logger/logger';
import { stringOrNull } from '../../bot/helpers';

export class SubcategoriesRepository {
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
    };
    logPgSbc(this.pgp.as.format(sql.sbcCreate, args));
    return this.db.none(sql.sbcCreate, args);
  }

  add(
    { table_peer_id }: { table_peer_id: StrOrNumT },
    { description, ...params }: SubcategoryModel,
  ): Promise<SubcategoryDBModel> {
    return this.db.one(sql.sbcAdd, {
      sbc_table: new this.pgp.helpers.TableName({
        table: `${PREFIX.SBC}${table_peer_id}`,
      }),
      ...params,
      description: description || null,
    });
  }

  listJoinCtg({
    table_peer_id,
    in_deleted = false,
    in_archived = false,

    ...params
  }: {
    table_peer_id: StrOrNumT;
    peer_id: StrOrNumT;
    limit?: number;
    offset?: number;
    query?: string;
    ctgQuery?: string;
    sbcQuery?: string;
    ctgQueryTitle?: string;
    ctgQueryDescr?: string;
    sbcQueryTitle?: string;
    sbcQueryDescr?: string;
    ctgQueryIdGreaterThan?: number;
    ctgQueryIdGreaterThanOrEq?: number;
    ctgQueryIdLessThan?: number;
    ctgQueryIdLessThanOrEq?: number;
    sbcQueryIdGreaterThan?: number;
    sbcQueryIdGreaterThanOrEq?: number;
    sbcQueryIdLessThan?: number;
    sbcQueryIdLessThanOrEq?: number;
    in_deleted?: boolean;
    in_archived?: boolean;
  }): Promise<SubcategoryJoinCtgDBModel[]> {
    const args = {
      ctg_table: new this.pgp.helpers.TableName({
        table: `${PREFIX.CTG}${table_peer_id}`,
      }),
      sbc_table: new this.pgp.helpers.TableName({
        table: `${PREFIX.SBC}${table_peer_id}`,
      }),
      ...params,
      in_deleted,
      in_archived,
    };
    logPgSbc(this.pgp.as.format(sql.sbcListJoinCtg, args));
    return this.db.any(sql.sbcListJoinCtg, args);
  }

  txUpdate(
    { table_peer_id, db }: { table_peer_id: StrOrNumT; db: DbProtocolT },
    dbSubcategory: SubcategoryDBModel,
  ): Promise<SubcategoryDBModel | null> {
    return db.oneOrNone(sql.sbcUpdate, {
      sbc_table: new this.pgp.helpers.TableName({
        table: `${PREFIX.SBC}${table_peer_id}`,
      }),
      ...dbSubcategory,
    });
  }

  update(
    { table_peer_id }: { table_peer_id: StrOrNumT },
    dbSubcategory: SubcategoryDBModel,
  ): Promise<SubcategoryDBModel | null> {
    return this.txUpdate({ table_peer_id, db: this.db }, dbSubcategory);
  }

  deleteAll({
    table_peer_id,
    peer_id,
  }: {
    table_peer_id: StrOrNumT;
    peer_id?: StrOrNumT;
  }): Promise<SubcategoryDBModel[]> {
    const args = {
      sbc_table: new this.pgp.helpers.TableName({
        table: `${PREFIX.SBC}${table_peer_id}`,
      }),
      peer_id: stringOrNull(peer_id),
    };
    logPgSbc(this.pgp.as.format(sql.sbcDeleteAll, args));
    return this.db.any(sql.sbcDeleteAll, args);
  }

  find({
    table_peer_id,
    peer_id,
    in_deleted = false,
    in_archived = false,
    ...params
  }: {
    table_peer_id: StrOrNumT;
    peer_id: StrOrNumT;
    title: string;
    in_deleted?: boolean | null;
    in_archived?: boolean | null;
  }): Promise<SubcategoryDBModel[]> {
    const args = {
      sbc_table: new this.pgp.helpers.TableName({
        table: `${PREFIX.SBC}${table_peer_id}`,
      }),
      ...params,
      peer_id: stringOrNull(peer_id),
      in_deleted,
      in_archived,
    };
    logPgSbc(this.pgp.as.format(sql.sbcFind, args));
    return this.db.any(sql.sbcFind, args);
  }

  findJoinCtg({
    table_peer_id,
    peer_id,
    in_deleted = false,
    in_archived = false,
    ...params
  }: {
    table_peer_id: StrOrNumT;
    title: string;
    peer_id: StrOrNumT;
    in_deleted?: boolean | null;
    in_archived?: boolean | null;
  }): Promise<SubcategoryJoinCtgDBModel[]> {
    return this.db.any(sql.sbcFindJoinCtg, {
      ctg_table: new this.pgp.helpers.TableName({
        table: `${PREFIX.CTG}${table_peer_id}`,
      }),
      sbc_table: new this.pgp.helpers.TableName({
        table: `${PREFIX.SBC}${table_peer_id}`,
      }),
      ...params,
      peer_id: stringOrNull(peer_id),
      in_deleted,
      in_archived,
    });
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
  }: TxSetDeleteAllByCtgParamsT): Promise<SubcategoryDBModel[]> {
    return txSetAllByCtgId<SubcategoryDBModel>({
      sql: sql.sbcSetDeletedAllByCtgId,
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
  }: SetDeleteAllByCtgParamsT): Promise<SubcategoryDBModel[]> {
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

  txSetArchivedAllByCtgId({
    t,
    dbI,
    table_peer_id,
    category_id,
    peer_id,
    archived_at,
    archived_by_user_id,
    in_archived,
  }: TxSetArchiveAllByCtgParamsT): Promise<SubcategoryDBModel[]> {
    return txSetAllByCtgId<SubcategoryDBModel>({
      sql: sql.sbcSetArchivedAllByCtgId,
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
  }: SetArchiveAllByCtgParamsT): Promise<SubcategoryDBModel[]> {
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
  }): Promise<SubcategoryDBModel | null> {
    const args = {
      sbc_table: new this.pgp.helpers.TableName({
        table: `${PREFIX.SBC}${table_peer_id}`,
      }),
      id,
      peer_id: stringOrNull(peer_id),
      in_deleted,
      in_archived,
    };
    logPgSbc(this.pgp.as.format(sql.sbcFindOneById, args));
    return this.db.oneOrNone(sql.sbcFindOneById, args);
  }

  findOneByIdJoinCtg({
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
  }): Promise<SubcategoryJoinCtgDBModel | null> {
    const args = {
      ctg_table: new this.pgp.helpers.TableName({
        table: `${PREFIX.CTG}${table_peer_id}`,
      }),
      sbc_table: new this.pgp.helpers.TableName({
        table: `${PREFIX.SBC}${table_peer_id}`,
      }),
      id,
      peer_id,
      in_deleted,
      in_archived,
    };
    logPgSbc(this.pgp.as.format(sql.sbcFindOneByIdJoinCtg, args));
    return this.db.oneOrNone(sql.sbcFindOneByIdJoinCtg, args);
  }
}
