import { TrKey } from '../../i18n/keys';
import { ToTranslate, ToTranslateUnion } from '../../i18n/i18n';
import {
  createUpdUser,
  printListUsers,
  UserStatusEnum,
  userKeyStr,
  createDelUser,
} from '../../db/models/userModel';
import { AppConfigT } from '../../config/config';

import { BotCtxT, NextFunctionT } from '../bot';
import { safeSplitString2 } from '../parameters';
import { prinDateTime } from '../print';
import { BotCommandEnum, toCommand } from '../helpers';

function isNotAdmin(config: AppConfigT, fromIdNum: number): boolean {
  return !config.admin || config.admin.user_id !== fromIdNum;
}

export async function adminHelp(
  { fromIdNum, dbUserLang, config }: BotCtxT,
  next: NextFunctionT,
): Promise<ToTranslateUnion | void> {
  if (isNotAdmin(config, fromIdNum)) {
    return next();
  }

  return new ToTranslate(TrKey.TEXT, dbUserLang, {
    text: `
${toCommand(BotCommandEnum.ahelp)} help
${toCommand(BotCommandEnum.alu)} list users  
${toCommand(BotCommandEnum.asud)} set user developer status
${toCommand(BotCommandEnum.asur)} set user rejected status
${toCommand(BotCommandEnum.asuu)} set user unknown status
${toCommand(BotCommandEnum.adu)} delete user
`,
  });
}

export async function adminListUsers(
  { db, fromIdNum, dbUserLang, dbUserTimeZone, config }: BotCtxT,
  next: NextFunctionT,
): Promise<ToTranslateUnion | undefined | void> {
  if (isNotAdmin(config, fromIdNum)) {
    return next();
  }

  const dbUsers = await db.users.list();

  if (dbUsers.length === 0) {
    return new ToTranslate(TrKey.NO_USERS, dbUserLang);
  }

  return new ToTranslate(TrKey.YOUR_USERS, dbUserLang, {
    text: printListUsers(dbUsers, dbUserTimeZone),
  });
}

async function adminSetUserStatus(
  status: UserStatusEnum,
  botCtx: BotCtxT,
  next: NextFunctionT,
): Promise<ToTranslateUnion | void> {
  const { db, fromIdNum, dbUserLang, msgText, config } = botCtx;
  if (isNotAdmin(config, fromIdNum)) {
    return next();
  }
  const msgParts = safeSplitString2(msgText);
  const [, userIdStr] = msgParts;

  const dbUser = await db.users.findById(userIdStr);
  if (!dbUser) {
    return new ToTranslate(TrKey.UNKONWN_USER, dbUserLang);
  }
  dbUser.status = userKeyStr(status);
  const updatedDBUser = await db.users.update(createUpdUser(dbUser));
  if (updatedDBUser) {
    return new ToTranslate(TrKey.TEXT, dbUserLang, {
      text: `${updatedDBUser.id} - ${updatedDBUser.status}`,
    });
  } else {
    return new ToTranslate(TrKey.USER_GONE, dbUserLang, {
      first_name: dbUser.first_name,
    });
  }
}

export async function adminSetUserDeveloper(
  botCtx: BotCtxT,
  next: NextFunctionT,
): Promise<ToTranslateUnion | void> {
  return adminSetUserStatus(UserStatusEnum.developer, botCtx, next);
}

export async function adminSetUserRejected(
  botCtx: BotCtxT,
  next: NextFunctionT,
): Promise<ToTranslateUnion | void> {
  return adminSetUserStatus(UserStatusEnum.rejected, botCtx, next);
}

export async function adminSetUserUnknown(
  botCtx: BotCtxT,
  next: NextFunctionT,
): Promise<ToTranslateUnion | void> {
  return adminSetUserStatus(UserStatusEnum.unknown, botCtx, next);
}

export async function adminDeleteUser(
  { db, fromIdNum, dbUserLang, dbUserTimeZone, msgText, config }: BotCtxT,
  next: NextFunctionT,
): Promise<ToTranslateUnion | void> {
  if (isNotAdmin(config, fromIdNum)) {
    return next();
  }
  const msgParts = safeSplitString2(msgText);
  const [, userIdStr] = msgParts;

  const dbUser = await db.users.findById(userIdStr);
  if (!dbUser) {
    return new ToTranslate(TrKey.UNKONWN_USER, dbUserLang);
  }
  const updatedDBUser = await db.users.update(createDelUser(dbUser));
  if (updatedDBUser) {
    return new ToTranslate(TrKey.TEXT, dbUserLang, {
      text: `${updatedDBUser.id} - ${
        updatedDBUser.deleted_at &&
        prinDateTime(updatedDBUser.deleted_at, dbUserTimeZone)
      }`,
    });
  } else {
    return new ToTranslate(TrKey.USER_GONE, dbUserLang, {
      first_name: dbUser.first_name,
    });
  }
}
