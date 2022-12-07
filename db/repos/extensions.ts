import { TriggersRepository } from './triggersRepo';
import { TablesRepository } from './tablesRepo';
import { CategoriesRepository } from './categoriesRepo';
import { SubcategoriesRepository } from './subcategoriesRepo';
import { UsersRepository } from './usersRepo';
import { NotesRepository } from './notesRepo';

export interface ExtensionsI {
  triggers: TriggersRepository;
  tables: TablesRepository;
  categories: CategoriesRepository;
  subcategories: SubcategoriesRepository;
  users: UsersRepository;
  notes: NotesRepository;
}
