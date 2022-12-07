import { DbT } from '../db';
import { tables as sql } from '../sql';
import { TableDBModel } from '../models/tableModel';
import { IMain } from 'pg-promise';
import { logPgComm } from '../../logger/logger';

export class TablesRepository {
  constructor(db: DbT, pgp: IMain) {
    this.db = db;
    this.pgp = pgp;
  }

  private db: DbT;
  private pgp: IMain;

  async list({
    replaceQuotes = true,
  }: { replaceQuotes?: boolean } = {}): Promise<TableDBModel[]> {
    logPgComm(this.pgp.as.format(sql.tblList));
    const tables: Array<TableDBModel> = await this.db.any(sql.tblList);
    if (replaceQuotes) {
      return tables.map((iTableRet) => {
        iTableRet.tablename = iTableRet.tablename.replace(/"/g, '');
        return iTableRet;
      });
    }
    return tables;
  }
}
