import { printId, printDeleted, printArchived } from '../../bot/print';
import { LanguageEnum, ToTranslate, ToTranslateArr } from '../../i18n/i18n';
import { TrKey } from '../../i18n/keys';
import { StrOrNumT } from '../repos/commonRepo';

import {
  createDefaultDTModel,
  DTModel,
  DTDBModel,
  DTAction,
  undoDTModel,
  UndoDTAction,
} from './commonModel';

export const MAX_CTG_TITLE_LENGTH = 100;
export const MAX_CTG_DESC_LENGTH = 200;

export enum CategoryTypeEnum {
  numberPositive = 'num+',
  numberNegative = 'num-',
  text = 'text',
}

export function isValidCategoryType(ctgType?: CategoryTypeEnum): boolean {
  if (ctgType) {
    return Object.values(CategoryTypeEnum).includes(ctgType);
  }
  return false;
}

export const DEFAULT_CTG_TYPE = CategoryTypeEnum.numberNegative;

function assignCtgDefaul(inCtg: CategoryModel): CategoryModel {
  let { category_type } = inCtg;
  if (!category_type) {
    category_type = DEFAULT_CTG_TYPE;
  }
  return Object.assign(inCtg, { category_type });
}

export function composeAddCategory(inCtg: CategoryModel): CategoryModel {
  const dtModel = createDefaultDTModel(DTAction.add, inCtg);
  Object.assign(inCtg, dtModel);
  return assignCtgDefaul(inCtg);
}

export function composeUpdCategory(inCtg: CategoryDBModel): CategoryDBModel {
  const dtModel = createDefaultDTModel(DTAction.upd, inCtg as CategoryModel);
  Object.assign(inCtg, dtModel);
  return inCtg;
}

export function composeDelCategory(inCtg: CategoryDBModel): CategoryDBModel {
  const dtModel = createDefaultDTModel(DTAction.del, inCtg as CategoryModel);
  Object.assign(inCtg, dtModel);
  return inCtg;
}

export function composeArchCategory(inCtg: CategoryDBModel): CategoryDBModel {
  const dtModel = createDefaultDTModel(DTAction.arch, inCtg as CategoryModel);
  Object.assign(inCtg, dtModel);
  return inCtg;
}

export function composeUndoDelCategory(
  inCtg: CategoryDBModel,
): CategoryDBModel {
  const dtModel = createDefaultDTModel(DTAction.upd, inCtg as CategoryModel);
  const _undoDtModel = undoDTModel(
    UndoDTAction.undodel,
    inCtg as CategoryModel,
  );
  Object.assign(inCtg, dtModel, _undoDtModel);
  return inCtg;
}

export function composeUndoArchCategory(
  inCtg: CategoryDBModel,
): CategoryDBModel {
  const dtModel = createDefaultDTModel(DTAction.upd, inCtg as CategoryModel);
  const _undoDtModel = undoDTModel(
    UndoDTAction.undoarch,
    inCtg as CategoryModel,
  );
  Object.assign(inCtg, dtModel, _undoDtModel);
  return inCtg;
}

export function createDeletedCategory(inCtg: CategoryModel): CategoryModel {
  const dtModel = createDefaultDTModel([DTAction.add, DTAction.del], inCtg);
  Object.assign(inCtg, dtModel);
  return assignCtgDefaul(inCtg);
}

export function createArchivedCategory(inCtg: CategoryModel): CategoryModel {
  const dtModel = createDefaultDTModel([DTAction.add, DTAction.arch], inCtg);
  Object.assign(inCtg, dtModel);
  return assignCtgDefaul(inCtg);
}

export function getCategoryTypes(): string[] {
  return Object.values(CategoryTypeEnum);
}

export type CtgT = {
  title: string;
  peer_id: StrOrNumT;
  category_type?: CategoryTypeEnum;
  description?: string;
};

export type CategoryModel = CtgT & DTModel;

export type CategoryDBModel = Pick<
  CtgT,
  Exclude<keyof CtgT, 'category_type'>
> & {
  id: number;
  category_type: CategoryTypeEnum;
} & DTDBModel;

export type CategoryAggrSbcDBModel = CategoryDBModel & {
  subcategories_ids: number[];
  subcategories_titles: (string | null)[];
  subcategories_descriptions: (string | null)[];
  subcategories_deleted_at: (Date | null)[];
  subcategories_archived_at: (Date | null)[];
};

type sbcTitles = string[];

export const DEFAULT_LIST_CTG_LIMIT = 30;

export function printListCategories({
  categories,
  showId = false,
  showDeleted = false,
  showArchived = false,
  treeView = true,
}: {
  categories: Array<CategoryAggrSbcDBModel | CategoryDBModel>;
  showId?: boolean;
  showDeleted?: boolean;
  showArchived?: boolean;
  treeView?: boolean;
}): string {
  const categoriesParts: string[] = categories.map((ctg, ctg_idx): string => {
    const id = printId(ctg.id, showId);
    const title = `${ctg.title}${printDeleted(ctg.deleted_at)}${printArchived(
      ctg.archived_at,
    )}`;
    let sbcTitles: sbcTitles = [];
    if (
      Array.isArray((ctg as CategoryAggrSbcDBModel).subcategories_deleted_at)
    ) {
      sbcTitles = (ctg as CategoryAggrSbcDBModel).subcategories_deleted_at
        .map((_, idx): string => {
          if (
            showDeleted === false &&
            (ctg as CategoryAggrSbcDBModel).subcategories_deleted_at[idx]
          ) {
            return '';
          }
          if (
            showArchived === false &&
            (ctg as CategoryAggrSbcDBModel).subcategories_archived_at[idx]
          ) {
            return '';
          }
          if (!(ctg as CategoryAggrSbcDBModel).subcategories_ids[idx]) {
            return '';
          }
          const idStr = printId(
            (ctg as CategoryAggrSbcDBModel).subcategories_ids[idx],
            showId,
          );
          const title = (ctg as CategoryAggrSbcDBModel).subcategories_titles[
            idx
          ];
          const del = printDeleted(
            (ctg as CategoryAggrSbcDBModel).subcategories_deleted_at[idx],
          );
          const arch = printArchived(
            (ctg as CategoryAggrSbcDBModel).subcategories_archived_at[idx],
          );
          const descr = (ctg as CategoryAggrSbcDBModel)
            .subcategories_descriptions[idx]
            ? ` "${
                (ctg as CategoryAggrSbcDBModel).subcategories_descriptions[idx]
              }"`
            : '';

          return `${
            treeView ? '' : '        '
          }${idStr}${title}${del}${arch}${descr}`;
        })
        .filter((str): string => str);
    }

    if (treeView) {
      sbcTitles = sbcTitles.map((sbc, sbc_idx, sbcArr): string => {
        const sbcTreeLine =
          sbc_idx === sbcArr.length - 1 ? '│     └── ' : '│     ├── ';
        const sbcTreeLastLine =
          sbc_idx === sbcArr.length - 1 ? '      └── ' : '        ├── ';

        return `${
          ctg_idx === categories.length - 1 ? sbcTreeLastLine : sbcTreeLine
        }${sbc}`;
      });
    }

    const printSbcTitles = sbcTitles.join('\n');

    const descr = ctg.description ? ` "${ctg.description}"` : '';
    const ctg_line = `${id}${title} ${ctg.category_type}${descr}`;

    const ctgTreeLine = ctg_idx === categories.length - 1 ? '└── ' : '├── ';

    if (printSbcTitles) {
      return `${treeView ? ctgTreeLine : ''}${ctg_line}\n${printSbcTitles}`;
    }

    return `${treeView ? ctgTreeLine : ''}${ctg_line}`;
  });
  return categoriesParts.join('\n').trim();
}

export function generateCategoryCreatedTranslations({
  categoryId,
  categoryType,
  categoryTitle,
  categoryDescription,
  lang,
}: {
  categoryId: number;
  categoryType: CategoryTypeEnum;
  categoryTitle: string;
  categoryDescription?: string;
  lang: LanguageEnum;
}): ToTranslateArr {
  const items: ToTranslate[] = [];
  items.push(
    new ToTranslate(TrKey.RES_CTG_ADDED_FIELD_TITLE, lang, {
      ctgTitle: categoryTitle,
    }),
  );
  items.push(
    new ToTranslate(TrKey.RES_CTG_ADDED_FIELD_TYPE, lang, {
      ctgType: categoryType,
    }),
  );
  if (categoryDescription) {
    items.push(
      new ToTranslate(TrKey.RES_CTG_ADDED_FIELD_DESCR, lang, {
        ctgDescr: categoryDescription,
      }),
    );
  }
  items.push(
    new ToTranslate(TrKey.RES_CTG_ADDED_FIELD_ID, lang, {
      ctgId: categoryId,
    }),
  );
  return new ToTranslateArr(items, undefined, '\n');
}
