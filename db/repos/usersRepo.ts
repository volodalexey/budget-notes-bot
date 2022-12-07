/* eslint @typescript-eslint/explicit-member-accessibility : 0 */

import { DbT } from '../db';
import { users as sql } from '../sql';
import { UserModel, UserDBModel, userKeyStr } from '../models/userModel';
import { logPgUsr } from '../../logger/logger';
import { IMain } from 'pg-promise';

export class UsersRepository {
  constructor(db: DbT, pgp: IMain) {
    this.db = db;
    this.pgp = pgp;
  }

  private db: DbT;
  private pgp: IMain;

  create(): Promise<null> {
    logPgUsr(this.pgp.as.format(sql.usrCreate));
    return this.db.none(sql.usrCreate);
  }

  findById(user_id: string): Promise<UserDBModel | null> {
    const args = { id: user_id };
    logPgUsr(this.pgp.as.format(sql.usrFindById, args));
    return this.db.oneOrNone(sql.usrFindById, args);
  }

  add({ status, ...usr }: UserModel): Promise<UserDBModel> {
    const args = {
      ...usr,
      status: status && userKeyStr(status),
    };
    logPgUsr(this.pgp.as.format(sql.usrAdd, args));
    return this.db.one(sql.usrAdd, args);
  }

  update({ ...usr }: UserDBModel): Promise<UserDBModel | null> {
    const args = {
      ...usr,
    };
    logPgUsr(this.pgp.as.format(sql.usrUpdate, args));
    return this.db.oneOrNone(sql.usrUpdate, args);
  }

  deleteAll(): Promise<UserDBModel[]> {
    logPgUsr(this.pgp.as.format(sql.usrDeleteAll));
    return this.db.any(sql.usrDeleteAll);
  }

  delete(user_id: string): Promise<UserDBModel | null> {
    const args = { id: user_id };
    logPgUsr(this.pgp.as.format(sql.usrDelete, args));
    return this.db.oneOrNone(sql.usrDelete, args);
  }

  list(): Promise<UserDBModel[]> {
    logPgUsr(this.pgp.as.format(sql.usrList));
    return this.db.any(sql.usrList);
  }
}
