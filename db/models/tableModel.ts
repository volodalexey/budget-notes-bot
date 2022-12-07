export type TableDBModel = {
  tablename: string;
};

function getChatId(prepend: string, tablename: string): string {
  if (tablename.startsWith(prepend)) {
    return tablename.substring(prepend.length);
  }
  return '';
}

function getCategoriesChatId(tablename: string): string {
  return getChatId('categories', tablename);
}

function getSubcategoriesChatId(tablename: string): string {
  return getChatId('subcategories', tablename);
}

function getNotesChatId(tablename: string): string {
  return getChatId('notes', tablename);
}

export type ChatTableMap = Map<
  string,
  {
    chatId: string;
    ctgTableName: string;
    sbcTableName: string;
    ntTableName: string;
  }
>;

export function getChatTableMap(tables: Array<TableDBModel>): ChatTableMap {
  const chatTableMap: ChatTableMap = new Map();
  tables.forEach((iTable) => {
    const ctgTableChatId = getCategoriesChatId(iTable.tablename);
    const sbcTableChatId = getSubcategoriesChatId(iTable.tablename);
    const ntTableChatId = getNotesChatId(iTable.tablename);
    const chatId = ctgTableChatId || sbcTableChatId || ntTableChatId;
    if (chatId) {
      if (!chatTableMap.has(chatId)) {
        if (ctgTableChatId) {
          const sbcTableRet = tables.find(
            (_iTableRet) =>
              getSubcategoriesChatId(_iTableRet.tablename) === ctgTableChatId,
          );
          const ntTableRet = tables.find(
            (_iTableRet) =>
              getNotesChatId(_iTableRet.tablename) === ctgTableChatId,
          );
          if (sbcTableRet && ntTableRet) {
            chatTableMap.set(ctgTableChatId, {
              chatId: ctgTableChatId,
              ctgTableName: iTable.tablename,
              sbcTableName: sbcTableRet.tablename,
              ntTableName: ntTableRet.tablename,
            });
          } else {
            console.error(
              `Could not find sbcTableChatId=${sbcTableChatId} or ntTableChatId=${ntTableChatId}`,
            );
          }
        } else if (sbcTableChatId) {
          const ctgTableRet = tables.find(
            (_iTableRet) =>
              getCategoriesChatId(_iTableRet.tablename) === sbcTableChatId,
          );
          const ntTableRet = tables.find(
            (_iTableRet) =>
              getNotesChatId(_iTableRet.tablename) === sbcTableChatId,
          );
          if (ctgTableRet && ntTableRet) {
            chatTableMap.set(sbcTableChatId, {
              chatId: sbcTableChatId,
              ctgTableName: ctgTableRet.tablename,
              sbcTableName: iTable.tablename,
              ntTableName: ntTableRet.tablename,
            });
          } else {
            console.error(
              `Could not find ctgTableRet=${ctgTableRet} or ntTableChatId=${ntTableChatId}`,
            );
          }
        } else {
          const ctgTableRet = tables.find(
            (_iTableRet) =>
              getCategoriesChatId(_iTableRet.tablename) === ntTableChatId,
          );
          const sbcTableRet = tables.find(
            (_iTableRet) =>
              getSubcategoriesChatId(_iTableRet.tablename) === ntTableChatId,
          );
          if (ctgTableRet && sbcTableRet) {
            chatTableMap.set(ntTableChatId, {
              chatId: ntTableChatId,
              ctgTableName: ctgTableRet.tablename,
              sbcTableName: sbcTableRet.tablename,
              ntTableName: iTable.tablename,
            });
          } else {
            console.error(
              `Could not find ctgTableRet=${ctgTableRet} or sbcTableRet=${sbcTableRet}`,
            );
          }
        }
      }
    }
  });
  return chatTableMap;
}
