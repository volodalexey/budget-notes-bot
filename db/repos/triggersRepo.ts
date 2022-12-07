import { triggers as sql } from '../sql';
import { DbT } from '../db';

export class TriggersRepository {
  constructor(db: DbT) {
    this.db = db;
  }

  private db: DbT;

  setTimestamp(): Promise<null> {
    return this.db.none(sql.setTimestamp);
  }
}
