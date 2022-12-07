import { sql } from './sql';

const triggers = {
  setTimestamp: sql('triggers/setTimestamp.pgsql'),
};

const tables = {
  tblList: sql('tables/tblList.pgsql'),
};

const categories = {
  ctgCreate: sql('categories/ctgCreate.pgsql'),
  ctgAdd: sql('categories/ctgAdd.pgsql'),
  ctgList: sql('categories/ctgList.pgsql'),
  ctgUpdate: sql('categories/ctgUpdate.pgsql'),
  ctgDeleteAll: sql('categories/ctgDeleteAll.pgsql'),
  ctgFind: sql('categories/ctgFind.pgsql'),
  ctgFindOneById: sql('categories/ctgFindOneById.pgsql'),
  ctgListJoinSbc: sql('categories/ctgListJoinSbc.pgsql'),
  ctgFindJoinSbc: sql('categories/ctgFindJoinSbc.pgsql'),
};

const subcategories = {
  sbcCreate: sql('subcategories/sbcCreate.pgsql'),
  sbcAdd: sql('subcategories/sbcAdd.pgsql'),
  sbcListJoinCtg: sql('subcategories/sbcListJoinCtg.pgsql'),
  sbcUpdate: sql('subcategories/sbcUpdate.pgsql'),
  sbcDeleteAll: sql('subcategories/sbcDeleteAll.pgsql'),
  sbcFind: sql('subcategories/sbcFind.pgsql'),
  sbcFindJoinCtg: sql('subcategories/sbcFindJoinCtg.pgsql'),
  sbcSetDeletedAllByCtgId: sql('subcategories/sbcSetDeletedAllByCtgId.pgsql'),
  sbcSetArchivedAllByCtgId: sql('subcategories/sbcSetArchivedAllByCtgId.pgsql'),
  sbcFindOneById: sql('subcategories/sbcFindOneById.pgsql'),
  sbcFindOneByIdJoinCtg: sql('subcategories/sbcFindOneByIdJoinCtg.pgsql'),
};

const users = {
  usrCreate: sql('users/usrCreate.pgsql'),
  usrFindById: sql('users/usrFindById.pgsql'),
  usrAdd: sql('users/usrAdd.pgsql'),
  usrUpdate: sql('users/usrUpdate.pgsql'),
  usrDeleteAll: sql('users/usrDeleteAll.pgsql'),
  usrDelete: sql('users/usrDelete.pgsql'),
  usrList: sql('users/usrList.pgsql'),
};

const notes = {
  ntCreate: sql('notes/ntCreate.pgsql'),
  ntAdd: sql('notes/ntAdd.pgsql'),
  ntListJoinCtgSbc: sql('notes/ntListJoinCtgSbc.pgsql'),
  ntUpdate: sql('notes/ntUpdate.pgsql'),
  ntDeleteAll: sql('notes/ntDeleteAll.pgsql'),
  ntFindJoinCtgSbc: sql('notes/ntFindJoinCtgSbc.pgsql'),
  ntSetDeletedAllByCtgId: sql('notes/ntSetDeletedAllByCtgId.pgsql'),
  ntSetDeletedAllBySbcId: sql('notes/ntSetDeletedAllBySbcId.pgsql'),
  ntSetArchivedAllByCtgId: sql('notes/ntSetArchivedAllByCtgId.pgsql'),
  ntSetArchivedAllBySbcId: sql('notes/ntSetArchivedAllBySbcId.pgsql'),
  ntBalance: sql('notes/ntBalance.pgsql'),
  ntTransfer: sql('notes/ntTransfer.pgsql'),
  ntsTransfer: sql('notes/ntsTransfer.pgsql'),
  ntFindOneById: sql('notes/ntFindOneById.pgsql'),
};

export { triggers, tables, categories, subcategories, users, notes };
