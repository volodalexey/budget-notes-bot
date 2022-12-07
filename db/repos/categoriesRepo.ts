import { DbT, DbProtocolT } from '../db';
import { categories as sql } from '../sql';
import {
  CategoryModel,
  CategoryDBModel,
  CategoryAggrSbcDBModel,
} from '../models/categoryModel';
import { IMain } from 'pg-promise';
import { PREFIX } from './prefix';
import { logPgCtg } from '../../logger/logger';
import { stringOrNull } from '../../bot/helpers';
import { StrOrNumT } from './commonRepo';

export class CategoriesRepository {
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
    };
    logPgCtg(this.pgp.as.format(sql.ctgCreate, args));
    return this.db.none(sql.ctgCreate, args);
  }

  add(
    { table_peer_id }: { table_peer_id: StrOrNumT; debug?: boolean },
    { description, ...ctg }: CategoryModel,
  ): Promise<CategoryDBModel> {
    const args = {
      ctg_table: new this.pgp.helpers.TableName({
        table: `${PREFIX.CTG}${table_peer_id}`,
      }),
      ...ctg,
      description: description || null,
    };
    logPgCtg(this.pgp.as.format(sql.ctgAdd, args));
    return this.db.one(sql.ctgAdd, args);
  }

  list({
    table_peer_id,
    peer_id,
    in_deleted = false,
  }: {
    table_peer_id: StrOrNumT;
    peer_id: StrOrNumT;
    in_deleted: boolean;
  }): Promise<CategoryDBModel[]> {
    return this.db.any(sql.ctgList, {
      ctg_table: new this.pgp.helpers.TableName({
        table: `${PREFIX.CTG}${table_peer_id}`,
      }),
      peer_id: String(peer_id),
      in_deleted,
    });
  }

  txUpdate(
    { table_peer_id, db }: { table_peer_id: StrOrNumT; db: DbProtocolT },
    dbCategory: CategoryDBModel,
  ): Promise<CategoryDBModel | null> {
    return db.oneOrNone(sql.ctgUpdate, {
      ctg_table: new this.pgp.helpers.TableName({
        table: `${PREFIX.CTG}${table_peer_id}`,
      }),
      ...dbCategory,
    });
  }

  update(
    { table_peer_id }: { table_peer_id: StrOrNumT },
    dbCategory: CategoryDBModel,
  ): Promise<CategoryDBModel | null> {
    return this.txUpdate({ table_peer_id, db: this.db }, dbCategory);
  }

  deleteAll({
    table_peer_id,
    peer_id,
  }: {
    table_peer_id: StrOrNumT;
    peer_id?: StrOrNumT;
  }): Promise<CategoryDBModel[]> {
    const args = {
      ctg_table: new this.pgp.helpers.TableName({
        table: `${PREFIX.CTG}${table_peer_id}`,
      }),
      peer_id: stringOrNull(peer_id),
    };
    logPgCtg(this.pgp.as.format(sql.ctgDeleteAll, args));
    return this.db.any(sql.ctgDeleteAll, args);
  }

  find({
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
  }): Promise<CategoryDBModel[]> {
    const args = {
      ctg_table: new this.pgp.helpers.TableName({
        table: `${PREFIX.CTG}${table_peer_id}`,
      }),
      ...params,
      in_deleted,
      in_archived,
      peer_id: stringOrNull(peer_id),
    };
    logPgCtg(this.pgp.as.format(sql.ctgFind, args));
    return this.db.any(sql.ctgFind, args);
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
  }): Promise<CategoryDBModel | null> {
    const args = {
      ctg_table: new this.pgp.helpers.TableName({
        table: `${PREFIX.CTG}${table_peer_id}`,
      }),
      id,
      peer_id: String(peer_id),
      in_deleted,
      in_archived,
    };
    logPgCtg(this.pgp.as.format(sql.ctgFindOneById, args));
    return this.db.oneOrNone(sql.ctgFindOneById, args);
  }

  listJoinSbc({
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
    in_deleted?: boolean | null;
    in_archived?: boolean | null;
  }): Promise<CategoryAggrSbcDBModel[]> {
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
    logPgCtg(this.pgp.as.format(sql.ctgListJoinSbc, args));
    return this.db.any(sql.ctgListJoinSbc, args);
  }

  findJoinSbc({
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
  }): Promise<CategoryAggrSbcDBModel[]> {
    return this.db.any(sql.ctgFindJoinSbc, {
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
}
