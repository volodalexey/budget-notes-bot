import { AppConfigT, createAppConfig } from '../../config/config';
import { createDb, DbT, destroyDb, initializeDb, DBApp } from '../db';

describe('Check DB', () => {
  let config: AppConfigT;
  let dbApp: DBApp;
  let db: DbT;

  beforeAll(() => {
    config = createAppConfig();
    dbApp = createDb(config.db);
    db = dbApp.db;

    return initializeDb(db);
  });

  test('DB was created and initialized with config', () => {
    expect(db).toBeDefined();
  });

  test('DB contains initialized repositories', () => {
    expect(db).toHaveProperty('triggers');
    expect(db).toHaveProperty('categories');
    expect(db).toHaveProperty('subcategories');
    expect(db).toHaveProperty('users');
    expect(db).toHaveProperty('notes');
  });

  afterAll(() => {
    destroyDb(dbApp);
  });
});
