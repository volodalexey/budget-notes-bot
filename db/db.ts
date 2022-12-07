import pgPromise, {
  IMain,
  IDatabase,
  IInitOptions,
  IBaseProtocol,
} from 'pg-promise';

import { ExtensionsI } from './repos/extensions';
import { TriggersRepository } from './repos/triggersRepo';
import { TablesRepository } from './repos/tablesRepo';
import { UsersRepository } from './repos/usersRepo';
import { CategoriesRepository } from './repos/categoriesRepo';
import { SubcategoriesRepository } from './repos/subcategoriesRepo';
import { NotesRepository } from './repos/notesRepo';
import { IConnectionParameters } from 'pg-promise/typescript/pg-subset';

export type DbT = IDatabase<ExtensionsI> & ExtensionsI;
export type DbProtocolT = IBaseProtocol<ExtensionsI>;
export interface DBApp {
  db: DbT;
  pgp: IMain;
}

const dbCache: Map<string, DBApp> = new Map();
export function createDb(config: IConnectionParameters): DBApp {
  const dbKey = JSON.stringify(config, Object.keys(config).sort());
  let dbApp = dbCache.get(dbKey);
  if (dbApp) {
    return dbApp;
  }
  const initOptions: IInitOptions<ExtensionsI> = {
    extend(obj: DbT): void {
      obj.triggers = new TriggersRepository(obj);
      obj.tables = new TablesRepository(obj, pgp);
      obj.categories = new CategoriesRepository(obj, pgp);
      obj.subcategories = new SubcategoriesRepository(obj, pgp);
      obj.notes = new NotesRepository(obj, pgp);
      obj.users = new UsersRepository(obj, pgp);
    },
  };

  const pgp: IMain = pgPromise(initOptions);
  dbApp = { pgp, db: pgp(config) };
  dbCache.set(dbKey, dbApp);
  return dbApp;
}

export async function initializeDb(db: DbT): Promise<void> {
  await db.triggers.setTimestamp();
  await db.users.create();
}

export async function destroyDb(dbApp: DBApp): Promise<void> {
  for (const [_dbKey, _dbApp] of dbCache.entries()) {
    if (_dbApp === dbApp) {
      dbCache.delete(_dbKey);
      await dbApp.db.$pool.end();
    }
  }
}
