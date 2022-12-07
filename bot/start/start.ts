import { TrKey } from '../../i18n/keys';
import { ToTranslate, ToTranslateUnion } from '../../i18n/i18n';
import {
  createAddUser,
  userKeyStr,
  UserStatusEnum,
  createUpdUser,
} from '../../db/models/userModel';

import { BotCtxT } from '../bot';
import { toCommand, BotCommandEnum } from '../helpers';

const cmdStart = toCommand(BotCommandEnum.start);

export async function startOrCheck({
  db,
  fromIdStr,
  fromUserName,
  fromFirstName,
  msgText,
  config,
  peerIdStr,
}: BotCtxT): Promise<ToTranslateUnion | undefined> {
  let dbUser = await db.users.findById(fromIdStr);
  if (!dbUser) {
    dbUser = await db.users.add(
      createAddUser(
        {
          id: fromIdStr,
          username: fromUserName,
          first_name: fromFirstName,
        },
        config.user,
      ),
    );
  }
  if (!config.admin) {
    throw new Error('[admin_section] is not specified in config!');
  }
  if (dbUser.quota <= 0) {
    return new ToTranslate(TrKey.USER_QUOTA_REACHED, dbUser.language_code);
  } else if (
    !(
      dbUser.status === userKeyStr(UserStatusEnum.developer) ||
      dbUser.status === userKeyStr(UserStatusEnum.support)
    )
  ) {
    dbUser.quota -= 1;
    await db.users.update(createUpdUser(dbUser));
  }
  await db.categories.create({ table_peer_id: peerIdStr });
  await db.subcategories.create({ table_peer_id: peerIdStr });
  await db.notes.create({ table_peer_id: peerIdStr });
  if (msgText === cmdStart) {
    return new ToTranslate(TrKey.YOU_ARE_ALLOWED_TO_USE, dbUser.language_code);
  }
}
