import { QueryFile, IMain } from 'pg-promise';
import { stringOrNull } from '../../bot/helpers';
import { logPgComm } from '../../logger/logger';
import { DbProtocolT } from '../db';
import { PREFIX } from './prefix';

export type StrOrNumT = string | number;

type DeleteAllParamsT = {
  table_peer_id: StrOrNumT;
  deleted_at?: Date | null;
  deleted_by_user_id?: string | null;
  in_deleted?: boolean;
};

type ArchiveAllParamsT = {
  table_peer_id: StrOrNumT;
  archived_at?: Date | null;
  archived_by_user_id?: string | null;
  in_archived?: boolean;
};

type WhereCtgParamsT = {
  category_id: number;
  peer_id: StrOrNumT;
};

type WhereSbcParamsT = {
  subcategory_id: number;
  peer_id: StrOrNumT;
};

type SQLParamsT = {
  sql: QueryFile;
};

type TParamsT = {
  t: DbProtocolT;
  dbI: IMain;
};

type TxSetAllByCtgParamsT = SQLParamsT &
  TParamsT &
  WhereCtgParamsT &
  DeleteAllParamsT &
  ArchiveAllParamsT;

export type TxSetDeleteAllByCtgParamsT = TParamsT &
  WhereCtgParamsT &
  DeleteAllParamsT;

export type SetDeleteAllByCtgParamsT = WhereCtgParamsT & DeleteAllParamsT;

export type TxSetArchiveAllByCtgParamsT = TParamsT &
  WhereCtgParamsT &
  ArchiveAllParamsT;

export type SetArchiveAllByCtgParamsT = WhereCtgParamsT & ArchiveAllParamsT;

export function txSetAllByCtgId<T>({
  sql,
  t,
  dbI,
  table_peer_id,
  category_id,
  peer_id,
  deleted_at,
  deleted_by_user_id,
  in_deleted = false,
  archived_at,
  archived_by_user_id,
  in_archived = false,
}: TxSetAllByCtgParamsT): Promise<T[]> {
  const args = {
    ctg_table: new dbI.helpers.TableName({
      table: `${PREFIX.CTG}${table_peer_id}`,
    }),
    sbc_table: new dbI.helpers.TableName({
      table: `${PREFIX.SBC}${table_peer_id}`,
    }),
    nt_table: new dbI.helpers.TableName({
      table: `${PREFIX.NT}${table_peer_id}`,
    }),
    category_id,
    peer_id: stringOrNull(peer_id),
    deleted_at,
    deleted_by_user_id,
    in_deleted,
    archived_at,
    archived_by_user_id,
    in_archived,
  };
  logPgComm(dbI.as.format(sql, args));
  return t.any(sql, args);
}

type TxSetAllBySbcParamsT = SQLParamsT &
  TParamsT &
  WhereSbcParamsT &
  DeleteAllParamsT &
  ArchiveAllParamsT;

export type TxSetDeleteAllBySbcParamsT = TParamsT &
  WhereSbcParamsT &
  DeleteAllParamsT;

export type SetDeleteAllBySbcParamsT = WhereSbcParamsT & DeleteAllParamsT;

export type TxSetArchiveAllBySbcParamsT = TParamsT &
  WhereSbcParamsT &
  ArchiveAllParamsT;

export type SetArchiveAllBySbcParamsT = WhereSbcParamsT & ArchiveAllParamsT;

export function txSetAllBySbcId<T>({
  sql,
  t,
  dbI,
  table_peer_id,
  subcategory_id,
  peer_id,
  deleted_at,
  deleted_by_user_id,
  in_deleted = false,
  archived_at,
  archived_by_user_id,
  in_archived = false,
}: TxSetAllBySbcParamsT): Promise<T[]> {
  const args = {
    ctg_table: new dbI.helpers.TableName({
      table: `${PREFIX.CTG}${table_peer_id}`,
    }),
    sbc_table: new dbI.helpers.TableName({
      table: `${PREFIX.SBC}${table_peer_id}`,
    }),
    nt_table: new dbI.helpers.TableName({
      table: `${PREFIX.NT}${table_peer_id}`,
    }),
    subcategory_id,
    peer_id,
    deleted_at,
    deleted_by_user_id,
    in_deleted,
    archived_at,
    archived_by_user_id,
    in_archived,
  };
  logPgComm(dbI.as.format(sql, args));
  return t.any(sql, args);
}
