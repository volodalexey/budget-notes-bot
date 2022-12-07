import { TrKey } from '../../i18n/keys';
import { ToTranslate, ToTranslateArr, LanguageEnum } from '../../i18n/i18n';
import {
  printId,
  prinDateTime,
  printDeleted,
  printNumber,
  printArchived,
} from '../../bot/print';

import {
  createDefaultDTModel,
  DTModel,
  DTDBModel,
  DTAction,
  undoDTModel,
  UndoDTAction,
} from './commonModel';

import { CategoryTypeEnum } from './categoryModel';
import { StrOrNumT } from '../repos/commonRepo';

export const MAX_NOTE_TEXT_LENGTH = 1000;

function assignNtDefaul(inNt: NoteModel): NoteModel {
  const { created_at } = inNt;
  let { datetime } = inNt;
  if (!datetime) {
    datetime = created_at;
  }
  return Object.assign(inNt, { datetime });
}

export function composeAddNote(inNt: NoteModel): NoteModel {
  const dtModel = createDefaultDTModel(DTAction.add, inNt);
  Object.assign(inNt, dtModel);
  return assignNtDefaul(inNt);
}

export function checkUpdNote(inNt: NoteDBModel): NoteDBModel {
  const dtModel = createDefaultDTModel(DTAction.upd, inNt as NoteModel);
  Object.assign(inNt, dtModel);
  return inNt;
}

export function checkDelNote(inNt: NoteDBModel): NoteDBModel {
  const dtModel = createDefaultDTModel(DTAction.del, inNt as NoteModel);
  Object.assign(inNt, dtModel);
  return inNt;
}

export function checkArchNote(inNt: NoteDBModel): NoteDBModel {
  const dtModel = createDefaultDTModel(DTAction.arch, inNt as NoteModel);
  Object.assign(inNt, dtModel);
  return inNt;
}

export function checkUndoDelNote(inNt: NoteDBModel): NoteDBModel {
  const dtModel = createDefaultDTModel(DTAction.upd, inNt as NoteModel);
  const _undoDtModel = undoDTModel(UndoDTAction.undodel, inNt as NoteModel);
  Object.assign(inNt, dtModel, _undoDtModel);
  return inNt;
}

export function checkUndoArchNote(inNt: NoteDBModel): NoteDBModel {
  const dtModel = createDefaultDTModel(DTAction.upd, inNt as NoteModel);
  const _undoDtModel = undoDTModel(UndoDTAction.undoarch, inNt as NoteModel);
  Object.assign(inNt, dtModel, _undoDtModel);
  return inNt;
}

export function createDeletedNote(inNt: NoteModel): NoteModel {
  const dtModel = createDefaultDTModel([DTAction.add, DTAction.del], inNt);
  Object.assign(inNt, dtModel);
  return assignNtDefaul(inNt);
}

export function createArchivedNote(inNt: NoteModel): NoteModel {
  const dtModel = createDefaultDTModel([DTAction.add, DTAction.arch], inNt);
  Object.assign(inNt, dtModel);
  return assignNtDefaul(inNt);
}

type NoteT = {
  note_number?: number;
  note_text?: string;
  datetime?: Date;
  peer_id: StrOrNumT;
  category_id: number;
  subcategory_id?: number;
};

export type NoteModel = NoteT & DTModel;

export type NoteDBModel = Pick<
  NoteT,
  Exclude<keyof NoteT, 'note_number' | 'datetime'>
> & {
  id: number;
  datetime: Date;
  note_number?: string;
} & DTDBModel;

export type NoteJoinCtgSbcDBModel = NoteDBModel & {
  category_title: string;
  category_type: CategoryTypeEnum;
  category_deleted_at: Date | null;
  category_archived_at: Date | null;
  subcategory_title?: string;
  subcategory_deleted_at?: Date | null;
  subcategory_archived_at?: Date | null;
};

export interface NotesBalanceDBModel {
  balance: string;
  counted: string;
  max_datetime: Date;
  min_datetime: Date;
}

export function parseNoteNumber(note_number?: string): number {
  return Number(note_number);
}

export const MAX_DEC_POINTS = /^$|^[+-]?\d+(\.\d{0,3})?$/;
export const MIN_NUMBER = Math.ceil(Number.MIN_SAFE_INTEGER);
export const MAX_NUMBER = Math.ceil(Number.MAX_SAFE_INTEGER);

export const DEFAULT_LIST_NT_LIMIT = 10;

export function printListNotes(
  notes: NoteJoinCtgSbcDBModel[],
  timeZone: string,
  showId = true,
): string {
  const notesParts: string[] = notes.map((el): string => {
    const dateTime = prinDateTime(el.datetime, timeZone);
    const id = printId(el.id, showId);
    const del = printDeleted(el.deleted_at);
    const arch = printArchived(el.archived_at);
    const ctg = ` ${el.category_title}${printDeleted(
      el.category_deleted_at,
    )}${printArchived(el.category_archived_at)}`;
    const sbc = el.subcategory_title
      ? ` ${el.subcategory_title}${printDeleted(
          el.subcategory_deleted_at,
        )}${printArchived(el.subcategory_archived_at)}`
      : '';
    const text = el.note_text ? ` "${el.note_text}"` : '';
    switch (el.category_type) {
      case CategoryTypeEnum.numberNegative:
      case CategoryTypeEnum.numberPositive:
        return `${del}${arch}${id}${ctg}${sbc} ${parseNoteNumber(
          el.note_number,
        )}${text} ${dateTime}`;
      case CategoryTypeEnum.text:
        return `${del}${arch}${id}${ctg}${sbc} "${el.note_text}" ${dateTime}`;
      default:
        return `❗ ${el.category_id} ${el.note_text || el.note_number}`;
    }
  });
  return notesParts.join('\n\n');
}

interface SumPN {
  totalPos: number;
  totalNeg: number;
}
type SumPNTitle = SumPN & { title: string; deletedAt: Date | null | undefined };

type SbcMap = Map<number, SumPNTitle>;
type CtgMap = Map<number, SumPNTitle & { sbcMap: SbcMap }>;
type CtgWithSbc = SumPNTitle & {
  subcategories: SumPNTitle[];
};

export type CalcSummary = SumPN & {
  categories: CtgWithSbc[];
};

export function calcSummary(notes: NoteJoinCtgSbcDBModel[]): CalcSummary {
  const mapSum: CtgMap = new Map();
  let totalPos = 0,
    totalNeg = 0;
  for (const note of notes) {
    const ctgId = note.category_id;
    let ctgSum = mapSum.get(ctgId);
    if (!ctgSum) {
      ctgSum = {
        title: note.category_title,
        totalPos: 0,
        totalNeg: 0,
        sbcMap: new Map() as SbcMap,
        deletedAt: note.category_deleted_at,
      };
      mapSum.set(ctgId, ctgSum);
    }
    const value = parseNoteNumber(note.note_number);
    if (typeof value === 'number') {
      const sbcId = note.subcategory_id;
      let sbcSum;
      if (sbcId) {
        sbcSum = ctgSum.sbcMap.get(sbcId);
        if (!sbcSum) {
          sbcSum = {
            title: note.subcategory_title || '',
            totalPos: 0,
            totalNeg: 0,
            deletedAt: note.subcategory_deleted_at,
          };
          ctgSum.sbcMap.set(sbcId, sbcSum);
        }
      }
      if (value > 0) {
        totalPos += value;
        ctgSum.totalPos += value;
        if (sbcSum) {
          sbcSum.totalPos += value;
        }
      } else if (value < 0) {
        totalNeg += value;
        ctgSum.totalNeg += value;
        if (sbcSum) {
          sbcSum.totalNeg += value;
        }
      }
    }
  }
  return {
    totalPos,
    totalNeg,
    categories: Array.from(mapSum.values()).map((ctg): CtgWithSbc => {
      return {
        title: ctg.title,
        totalPos: ctg.totalPos,
        totalNeg: ctg.totalNeg,
        subcategories: Array.from(ctg.sbcMap.values()),
        deletedAt: ctg.deletedAt,
      };
    }),
  };
}

function tryAdd(
  item: SumPN & { title?: string; deletedAt?: Date | null },
  toAdd: string[],
  itd?: string,
  userLangCode?: LanguageEnum,
): boolean {
  const ln = '\n';
  const hasPos = item.totalPos > 0;
  const hasNeg = item.totalNeg < 0;
  if (hasPos || hasNeg) {
    if (item.title) {
      toAdd.push(`${itd || ''}${printDeleted(item.deletedAt)}${item.title}:`);
    }
    const total = item.totalPos + item.totalNeg;
    if (Math.abs(total) > 0) {
      toAdd.push(` ${printNumber(total, userLangCode)}`);
    }
    if (hasPos && total !== item.totalPos) {
      toAdd.push(` (${printNumber(item.totalPos, userLangCode)})`);
    }
    if (hasNeg && total !== item.totalNeg) {
      toAdd.push(` (${printNumber(item.totalNeg, userLangCode)})`);
    }
    toAdd.push(ln);
    return true;
  }
  return false;
}

export function printCalcSummary(
  in_calcSummary: CalcSummary,
  userLangCode?: LanguageEnum,
): string {
  const results: string[] = [];
  if (tryAdd(in_calcSummary, results, undefined, userLangCode)) {
    in_calcSummary.categories.forEach((ctg, ctg_idx, categories) => {
      if (
        tryAdd(
          ctg,
          results,
          ctg_idx === categories.length - 1 ? '└── ' : '├── ',
          userLangCode,
        )
      ) {
        ctg.subcategories.forEach((sbc, sbc_idx, sbcArr) => {
          const sbcTreeLine =
            sbc_idx === sbcArr.length - 1 ? '│     └── ' : '│     ├── ';
          const sbcTreeLastLine =
            sbc_idx === sbcArr.length - 1 ? '      └── ' : '        ├── ';

          tryAdd(
            sbc,
            results,
            ctg_idx === categories.length - 1 ? sbcTreeLastLine : sbcTreeLine,
            userLangCode,
          );
        });
      }
    });
    return results.join('').trim();
  }
  return '';
}

export function printNtIds(notes: NoteDBModel[]): string {
  return notes.map((el): string => printId(el.id, true)).join(', ');
}

export function generateNoteCreatedTranslations({
  noteId,
  noteNumber,
  noteText,
  noteDatetime,
  categoryType,
  categoryTitle,
  subcategoryTitle,
  lang,
  timeZone,
}: {
  noteId: number;
  noteNumber?: string;
  noteText?: string;
  noteDatetime: Date;
  categoryType: CategoryTypeEnum;
  categoryTitle?: string;
  subcategoryTitle?: string;
  lang: LanguageEnum;
  timeZone: string;
}): ToTranslateArr {
  const items: ToTranslate[] = [];
  if (
    categoryType === CategoryTypeEnum.numberPositive ||
    categoryType === CategoryTypeEnum.numberNegative
  ) {
    items.push(
      new ToTranslate(TrKey.NOTE_FIELD_NUMBER_ADDED, lang, {
        noteNumber: printNumber(parseNoteNumber(noteNumber)),
      }),
    );
  }
  if (noteText) {
    items.push(
      new ToTranslate(TrKey.NOTE_FIELD_TEXT_ADDED, lang, {
        noteText: noteText,
      }),
    );
  }
  items.push(
    new ToTranslate(TrKey.NOTE_FIELD_CATEGORY_ADDED, lang, {
      noteCategoryTitle: categoryTitle,
    }),
  );
  if (subcategoryTitle) {
    items.push(
      new ToTranslate(TrKey.NOTE_FIELD_SUBCATEGORY_ADDED, lang, {
        noteSubcategoryTitle: subcategoryTitle,
      }),
    );
  }
  items.push(
    new ToTranslate(TrKey.NOTE_FIELD_DATETIME_ADDED, lang, {
      noteDatetime: prinDateTime(noteDatetime, timeZone),
    }),
  );
  items.push(
    new ToTranslate(TrKey.NOTE_FIELD_ID_ADDED, lang, {
      noteId: noteId,
    }),
  );
  return new ToTranslateArr(items, undefined, '\n');
}

export function generateNoteUpdatedTranslations({
  oldNote,
  newNote,
  lang,
  timeZone,
}: {
  oldNote: NoteDBModel;
  newNote: NoteDBModel;
  lang: LanguageEnum;
  timeZone: string;
}): ToTranslateArr {
  const items: ToTranslate[] = [];
  if (oldNote.datetime.getTime() !== newNote.datetime.getTime()) {
    items.push(
      new ToTranslate(TrKey.NOTE_FIELD_DATETIME_UPDATED, lang, {
        oldValue: prinDateTime(oldNote.datetime, timeZone),
        newValue: prinDateTime(newNote.datetime, timeZone),
      }),
    );
  }
  if (oldNote.note_number !== newNote.note_number) {
    items.push(
      new ToTranslate(TrKey.NOTE_FIELD_NUMBER_UPDATED, lang, {
        oldValue: printNumber(parseNoteNumber(oldNote.note_number)),
        newValue: printNumber(parseNoteNumber(newNote.note_number)),
      }),
    );
  }
  if (oldNote.note_text !== newNote.note_text) {
    items.push(
      new ToTranslate(TrKey.NOTE_FIELD_TEXT_UPDATED, lang, {
        oldValue: oldNote.note_text,
        newValue: newNote.note_text,
      }),
    );
  }
  return new ToTranslateArr(items, undefined, '\n');
}
