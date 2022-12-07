import { printId, printDeleted, printArchived } from '../../bot/print';

import {
  createDefaultDTModel,
  DTModel,
  DTDBModel,
  DTAction,
  UndoDTAction,
  undoDTModel,
} from './commonModel';

import { CategoryTypeEnum } from './categoryModel';
import { LanguageEnum, ToTranslate, ToTranslateArr } from '../../i18n/i18n';
import { TrKey } from '../../i18n/keys';
import { StrOrNumT } from '../repos/commonRepo';

export const MAX_SBC_TITLE_LENGTH = 100;
export const MAX_SBC_DESC_LENGTH = 200;

export function checkAddSubcategory(inSbc: SubcategoryModel): SubcategoryModel {
  const dtModel = createDefaultDTModel(DTAction.add, inSbc);
  Object.assign(inSbc, dtModel);
  return inSbc;
}

export function checkUpdSubcategory(
  inSbc: SubcategoryDBModel,
): SubcategoryDBModel {
  const dtModel = createDefaultDTModel(DTAction.upd, inSbc as SubcategoryModel);
  Object.assign(inSbc, dtModel);
  return inSbc;
}

export function checkDelSubcategory(
  inSbc: SubcategoryDBModel,
): SubcategoryDBModel {
  const dtModel = createDefaultDTModel(DTAction.del, inSbc as SubcategoryModel);
  Object.assign(inSbc, dtModel);
  return inSbc;
}

export function checkArchSubcategory(
  inSbc: SubcategoryDBModel,
): SubcategoryDBModel {
  const dtModel = createDefaultDTModel(
    DTAction.arch,
    inSbc as SubcategoryModel,
  );
  Object.assign(inSbc, dtModel);
  return inSbc;
}

export function checkUndoDelSubcategory(
  inSbc: SubcategoryDBModel,
): SubcategoryDBModel {
  const dtModel = createDefaultDTModel(DTAction.upd, inSbc as SubcategoryModel);
  const _undoDtModel = undoDTModel(
    UndoDTAction.undodel,
    inSbc as SubcategoryModel,
  );
  Object.assign(inSbc, dtModel, _undoDtModel);
  return inSbc;
}

export function checkUndoArchSubcategory(
  inSbc: SubcategoryDBModel,
): SubcategoryDBModel {
  const dtModel = createDefaultDTModel(DTAction.upd, inSbc as SubcategoryModel);
  const _undoDtModel = undoDTModel(
    UndoDTAction.undoarch,
    inSbc as SubcategoryModel,
  );
  Object.assign(inSbc, dtModel, _undoDtModel);
  return inSbc;
}

export function createDeletedSubcategory(
  inSbc: SubcategoryModel,
): SubcategoryModel {
  const dtModel = createDefaultDTModel([DTAction.add, DTAction.del], inSbc);
  Object.assign(inSbc, dtModel);
  return inSbc;
}

export function createArchivedSubcategory(
  inSbc: SubcategoryModel,
): SubcategoryModel {
  const dtModel = createDefaultDTModel([DTAction.add, DTAction.arch], inSbc);
  Object.assign(inSbc, dtModel);
  return inSbc;
}

type SbcT = {
  title: string;
  description?: string;
  peer_id: StrOrNumT;
  category_id: number;
};

export type SubcategoryModel = SbcT & DTModel;

export type SubcategoryDBModel = SbcT & {
  id: number;
} & DTDBModel;

export type SubcategoryJoinCtgDBModel = SubcategoryDBModel & {
  category_title: string;
  category_description?: string;
  category_type: CategoryTypeEnum;
  category_deleted_at: Date | null;
  category_archived_at: Date | null;
};

export const DEFAULT_LIST_SBC_LIMIT = 30;

export function printListSubcategories({
  subcategories,
  showId = false,
}: {
  subcategories: SubcategoryJoinCtgDBModel[];
  showId?: boolean;
}): string {
  const subcategoriesParts: string[] = subcategories.map((el): string => {
    const id = printId(el.id, showId);
    const title = `${el.title}${printDeleted(el.deleted_at)}${printArchived(
      el.archived_at,
    )}`;
    const ctg = `${el.category_title}${printDeleted(
      el.category_deleted_at,
    )}${printArchived(el.category_archived_at)}`;
    const descr = el.description ? ` "${el.description}"` : '';
    return `${id}${title}${descr} ➡️ ${ctg} ${el.category_type}`;
  });
  return subcategoriesParts.join('\n');
}

export function printSbcTitles(subcategories: SubcategoryDBModel[]): string {
  return subcategories.map((el): string => el.title).join(', ');
}

export function generateSubcategoryCreatedTranslations({
  subcategoryId,
  subcategoryTitle,
  subcategoryDescription,
  categoryType,
  categoryTitle,
  lang,
}: {
  subcategoryId: number;
  subcategoryTitle: string;
  subcategoryDescription?: string;
  categoryType: CategoryTypeEnum;
  categoryTitle: string;
  lang: LanguageEnum;
}): ToTranslateArr {
  const items: ToTranslate[] = [];
  items.push(
    new ToTranslate(TrKey.RES_SBC_ADDED_FIELD_TITLE, lang, {
      sbcTitle: subcategoryTitle,
    }),
  );
  if (subcategoryDescription) {
    items.push(
      new ToTranslate(TrKey.RES_SBC_ADDED_FIELD_DESCR, lang, {
        sbcDescr: subcategoryDescription,
      }),
    );
  }
  items.push(
    new ToTranslate(TrKey.RES_SBC_ADDED_FIELD_CTG_TYPE, lang, {
      ctgType: categoryType,
    }),
  );
  items.push(
    new ToTranslate(TrKey.RES_SBC_ADDED_FIELD_CTG_TITLE, lang, {
      ctgTitle: categoryTitle,
    }),
  );
  items.push(
    new ToTranslate(TrKey.RES_SBC_ADDED_FIELD_ID, lang, {
      sbcId: subcategoryId,
    }),
  );
  return new ToTranslateArr(items, undefined, '\n');
}
