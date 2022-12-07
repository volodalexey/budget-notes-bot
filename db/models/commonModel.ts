import { newDTDate } from '../../bot/datetime';

export enum DTAction {
  add,
  upd,
  del,
  arch,
}

export enum UndoDTAction {
  undodel,
  undoarch,
}

export interface DTModel {
  created_by_user_id: string;
  created_at?: Date;
  updated_by_user_id?: string;
  updated_at?: Date;
  deleted_by_user_id?: string;
  deleted_at?: Date;
  archived_by_user_id?: string;
  archived_at?: Date;
}

export interface UndoDTModel {
  deleted_by_user_id: string | null;
  deleted_at: Date | null;
  archived_by_user_id: string | null;
  archived_at: Date | null;
}

export interface DTDBModel {
  created_by_user_id: string;
  created_at: Date;
  updated_by_user_id: string | null;
  updated_at: Date | null;
  deleted_by_user_id: string | null;
  deleted_at: Date | null;
  archived_by_user_id: string | null;
  archived_at: Date | null;
}

export function createDefaultDTModel(
  actions: DTAction | DTAction[],
  {
    created_by_user_id,
    created_at,
    updated_by_user_id,
    updated_at,
    deleted_by_user_id,
    deleted_at,
    archived_by_user_id,
    archived_at,
  }: DTModel,
): DTModel {
  if (!Array.isArray(actions)) {
    actions = [actions];
  }
  const newDate = newDTDate();
  if (!created_at) {
    if (actions.includes(DTAction.add)) {
      created_at = newDate;
    } else {
      throw new Error('Empty created_at field for add action!');
    }
  }
  if (actions.includes(DTAction.upd)) {
    if (!updated_at) {
      updated_at = newDate;
    }
    if (!updated_by_user_id) {
      updated_by_user_id = created_by_user_id;
    }
  }
  if (actions.includes(DTAction.del)) {
    if (!deleted_at) {
      deleted_at = newDate;
    }
    if (!deleted_by_user_id) {
      deleted_by_user_id = created_by_user_id;
    }
  }
  if (actions.includes(DTAction.arch)) {
    if (!archived_at) {
      archived_at = newDate;
    }
    if (!archived_by_user_id) {
      archived_by_user_id = created_by_user_id;
    }
  }
  return {
    created_by_user_id,
    created_at,
    updated_by_user_id,
    updated_at,
    deleted_by_user_id,
    deleted_at,
    archived_by_user_id,
    archived_at,
  };
}

export function undoDTModel(
  actions: UndoDTAction | UndoDTAction[],
  { deleted_at, deleted_by_user_id, archived_at, archived_by_user_id }: DTModel,
): UndoDTModel {
  if (!Array.isArray(actions)) {
    actions = [actions];
  }
  const isUndoDel = actions.includes(UndoDTAction.undodel);
  const isUndoArch = actions.includes(UndoDTAction.undoarch);
  /* eslint-disable @typescript-eslint/no-explicit-any */
  return {
    deleted_at: isUndoDel ? null : (deleted_at as any),
    deleted_by_user_id: isUndoDel ? null : (deleted_by_user_id as any),
    archived_at: isUndoArch ? null : (archived_at as any),
    archived_by_user_id: isUndoArch ? null : (archived_by_user_id as any),
  };
  /* eslint-enable @typescript-eslint/no-explicit-any */
}
