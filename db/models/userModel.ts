import { LanguageEnum } from '../../i18n/i18n';
import { WeekStartsOn } from '../../bot/datetime';
import { printId, prinDateTime } from '../../bot/print';

import { createDefaultDTModel, DTAction, DTModel } from './commonModel';
import { UserConfigT } from '../../config/config';

export enum UserStatusEnum {
  support = 1,
  rejected,
  developer,
  unknown,
}

export function userKeyStr(key: UserStatusEnum): string {
  return UserStatusEnum[key];
}

export type InitialUserModel = {
  id: string;
  username?: string;
  first_name?: string;
  language_code?: LanguageEnum;
  week_starts_on?: WeekStartsOn;
  time_zone?: string;
  created_at?: Date;
  updated_at?: Date;
  deleted_at?: Date;
  status?: UserStatusEnum;
  quota?: number;
};

export type UserModel = Pick<
  InitialUserModel,
  Exclude<
    keyof InitialUserModel,
    'language_code' | 'week_starts_on' | 'time_zone'
  >
> & {
  language_code: LanguageEnum;
  week_starts_on: WeekStartsOn;
  time_zone: string;
};

export type UserDBModel = Pick<
  UserModel,
  Exclude<
    keyof UserModel,
    | 'first_name'
    | 'language_code'
    | 'week_starts_on'
    | 'time_zone'
    | 'created_at'
    | 'updated_at'
    | 'deleted_at'
    | 'status'
    | 'quota'
  >
> & {
  first_name: string;
  language_code: LanguageEnum;
  week_starts_on: WeekStartsOn;
  time_zone: string;
  created_at: Date;
  updated_at: Date | null;
  deleted_at: Date | null;
  status: string;
  quota: number;
};

export const DEFAULT_USER_FIRST_NAME = '--unknown_user_first_name--';
export const MAX_TIME_ZONE_LENGTH = 30;
export const DEFAULT_USER_STATUS = UserStatusEnum.unknown;
export const DEFAULT_USER_QUOTA = 1000;

function assignUsrDefaul(
  inUsr: InitialUserModel,
  config: UserConfigT,
): UserModel {
  let { first_name, language_code, week_starts_on, time_zone, status, quota } =
    inUsr;
  if (!first_name) {
    first_name = DEFAULT_USER_FIRST_NAME;
  }
  if (!language_code) {
    language_code = config.language;
  }
  if (!week_starts_on) {
    week_starts_on = config.week_starts_on;
  }
  if (!time_zone) {
    time_zone = config.time_zone;
  }
  if (!status) {
    status = DEFAULT_USER_STATUS;
  }
  if (quota === undefined) {
    quota = DEFAULT_USER_QUOTA;
  }
  return Object.assign(inUsr, {
    first_name,
    language_code,
    week_starts_on,
    time_zone,
    status,
    quota,
  });
}

export function createAddUser(
  inUsr: InitialUserModel,
  config: UserConfigT,
): UserModel {
  const dtModel = createDefaultDTModel(
    DTAction.add,
    inUsr as unknown as DTModel,
  );
  Object.assign(inUsr, dtModel);
  return assignUsrDefaul(inUsr, config);
}

export function createUpdUser(inUsr: UserDBModel): UserDBModel {
  const dtModel = createDefaultDTModel(
    DTAction.upd,
    inUsr as unknown as DTModel,
  );
  Object.assign(inUsr, dtModel);
  return inUsr;
}

export function createDelUser(inUsr: UserDBModel): UserDBModel {
  const dtModel = createDefaultDTModel(
    DTAction.del,
    inUsr as unknown as DTModel,
  );
  Object.assign(inUsr, dtModel);
  return inUsr;
}

export function printListUsers(
  users: UserDBModel[],
  timeZone: string,
  showId = true,
): string {
  const usersLines: string[] = users.map((usr): string => {
    const id = printId(usr.id, showId);
    const created_at = prinDateTime(usr.created_at, timeZone);
    const updated_at = usr.updated_at
      ? `\nupdated_at: ${prinDateTime(usr.updated_at, timeZone)}`
      : '';
    const deleted_at = usr.deleted_at
      ? `\ndeleted_at: ${prinDateTime(usr.deleted_at, timeZone)}`
      : '';
    const status = usr.status;
    const usr_line = `${id}${usr.first_name}
status: ${status}
quota: ${usr.quota}
created_at: ${created_at}${updated_at}${deleted_at}`;
    return usr_line;
  });
  return usersLines.join('\n\n').trim();
}
