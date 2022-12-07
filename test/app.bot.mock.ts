import { Subject } from 'rxjs';
import {
  Message,
  // Airgram,
  SendMessageParams,
  ApiResponse,
  GetMessageParams,
} from 'airgram';
import { Airgram } from '../bot/airgram.mock';
import { getUnixTime } from 'date-fns';

import {
  BotSbjCtx,
  augmentBotCtxFromUpdCtx,
  augmentBotCtxFromDB,
  augmentBotCtxFromBotInfoCtx,
  subscribeToBotSubject,
  BotNextCtx,
  BotSbjNext,
  InitialBotCtxT,
  BotInfoT,
  UsernameBotCtxT,
  UpdBotCtxT,
  UpdCtxNewMessage,
  BotCtxT,
} from '../bot/bot';
import { DbT, destroyDb, DBApp, createDb, initializeDb } from '../db/db';
import { AppTestConfigT, createAppTestConfig } from '../config/config';

import {
  TestCase,
  PreparedTestBotMessages,
  Aggregate,
  obsSubscrToPr,
} from './test';
import { logTest } from '../logger/logger';
import { translateResult, LanguageEnum, ToTranslateUnion } from '../i18n/i18n';
import {
  createAddUser,
  UserStatusEnum,
  UserModel,
} from '../db/models/userModel';
import { getChatTableMap } from '../db/models/tableModel';
import { newDTDate } from '../bot/datetime';

export interface AppBotMockI {
  airgram: Airgram;
  db: DbT;
  dbApp: DBApp;
  botCtxSubject: BotSbjCtx;
  botSubjectNext: BotSbjNext;
  config: AppTestConfigT;
  user: UserModel;
  userLangCode: LanguageEnum;
  userTimeZone: string;
  chatId: number;
  bot_name: string;
}

export async function startBotMockApp(
  addUserToDB = true,
  clearDB = true,
): Promise<AppBotMockI> {
  const config = createAppTestConfig();
  const dbApp = createDb(config.db);
  await initializeDb(dbApp.db);
  const chatId = config.test.chat_id;
  await dbApp.db.categories.create({ table_peer_id: chatId });
  await dbApp.db.subcategories.create({ table_peer_id: chatId });
  await dbApp.db.notes.create({ table_peer_id: chatId });
  if (clearDB) {
    const tables = await dbApp.db.tables.list();
    const chatTableMap = getChatTableMap(tables);
    for (const { chatId } of chatTableMap.values()) {
      await dbApp.db.notes.deleteAll({ table_peer_id: chatId });
      await dbApp.db.subcategories.deleteAll({ table_peer_id: chatId });
      await dbApp.db.categories.deleteAll({ table_peer_id: chatId });
    }
    await dbApp.db.notes.deleteAll({ table_peer_id: chatId });
    await dbApp.db.subcategories.deleteAll({ table_peer_id: chatId });
    await dbApp.db.categories.deleteAll({ table_peer_id: chatId });
    await dbApp.db.users.deleteAll();
  }
  const user = createAddUser(
    {
      id: String(config.test.user_id),
      username: config.test.user_name,
      language_code: config.test.user_language,
      status: UserStatusEnum.developer,
      time_zone: config.test.user_time_zone,
      week_starts_on: config.test.user_week_starts_on,
    },
    {
      language: config.test.user_language,
      week_starts_on: config.test.user_week_starts_on,
      time_zone: config.test.user_time_zone,
    },
  );
  if (addUserToDB) {
    await dbApp.db.users.add(user);
  }
  const airgram = {
    api: {},
  } as unknown as Airgram;
  const botCtxSubject: BotSbjCtx = new Subject();
  const botSubjectNext = subscribeToBotSubject(botCtxSubject, airgram);

  return {
    airgram,
    dbApp,
    db: dbApp.db,
    config,
    botCtxSubject,
    botSubjectNext,
    user,
    userLangCode: user.language_code,
    userTimeZone: user.time_zone,
    chatId,
    bot_name: config.bot.bot_name || '',
  };
}

export async function destroyBotMockApp(
  appBotMock: AppBotMockI,
): Promise<void> {
  return destroyDb(appBotMock.dbApp);
}

function mockMessage({
  msgId,
  date,
  botId,
  chatId,
  text = '',
}: {
  msgId: number;
  date: number;
  botId: number;
  chatId: number;
  text?: string;
}): Message {
  return {
    _: 'message',
    replyToMessageId: msgId,
    id: date,
    date: date,
    senderId: {
      _: 'messageSenderUser',
      userId: botId,
    },
    chatId,
    content: {
      _: 'messageText',
      text: {
        _: 'formattedText',
        text: text,
        entities: [],
      },
    },
    isOutgoing: false,
    isPinned: false,
    canBeEdited: true,
    canBeForwarded: true,
    canBeSaved: true,
    canBeDeletedOnlyForSelf: false,
    canBeDeletedForAllUsers: true,
    canGetStatistics: true,
    canGetMessageThread: false,
    canGetViewers: true,
    canGetMediaTimestampLinks: true,
    hasTimestampedMedia: false,
    isChannelPost: false,
    containsUnreadMention: false,
    editDate: date,
    replyInChatId: chatId,
    messageThreadId: 0,
    ttl: 0,
    ttlExpiresIn: 0,
    viaBotUserId: botId,
    authorSignature: '',
    mediaAlbumId: '',
    restrictionReason: '',
  };
}

export async function handleBotResponse({
  text,
  appBotMock,
  closureMessage,
}: {
  text: string;
  appBotMock: AppBotMockI;
  closureMessage?: Message;
}): Promise<Message> {
  logTest('handleBotResponse()', 'start');
  const {
    config: { test: testConfig },
  } = appBotMock;

  const { bot_id, user_id, chat_id } = testConfig;

  const sentDateNum = getUnixTime(newDTDate());
  const message = {
    _: 'message',
    replyToMessageId: closureMessage ? closureMessage.id : 0, // truthy value for transformIdCommand() to start work
    id: sentDateNum,
    date: sentDateNum,
    senderId: { _: 'messageSenderUser', userId: user_id },
    chatId: appBotMock.chatId,
    content: {
      _: 'messageText',
      text: {
        _: 'formattedText',
        text,
      },
    },
  };
  let promiseResolve: (
    value: Message,
  ) => Promise<ApiResponse<SendMessageParams, Message>>;
  const retPromise: Promise<Message> = new Promise((resolve): void => {
    promiseResolve = resolve as (
      value: Message,
    ) => Promise<ApiResponse<SendMessageParams, Message>>;
  });
  function sendMessage(
    params?: SendMessageParams,
  ): Promise<ApiResponse<SendMessageParams, Message>> {
    logTest('sendMessage()', 'try to reply as a bot');
    const replyDateNum = Date.now();
    if (
      params &&
      params.inputMessageContent &&
      params.inputMessageContent._ === 'inputMessageText' &&
      params.inputMessageContent.text
    ) {
      return promiseResolve(
        mockMessage({
          msgId: message.id, // bot replies to user message
          date: replyDateNum,
          botId: bot_id,
          chatId: params.chatId || chat_id,
          text: params.inputMessageContent.text.text,
        }),
      );
    }
    throw new Error('Params for sendMessage is not provided');
  }
  function getClosureMessage(): Promise<
    ApiResponse<GetMessageParams, Message>
  > {
    logTest('getMessage()', 'mock get message from chat as a bot', text);
    return Promise.resolve({
      response: mockMessage({
        msgId: 0,
        date: 0,
        botId: 0,
        chatId: 0,
        text:
          closureMessage && closureMessage.content._ === 'messageText'
            ? closureMessage.content.text.text
            : '',
      }),
    } as unknown as ApiResponse<GetMessageParams, Message>);
  }
  appBotMock.airgram.api.sendMessage = sendMessage;
  appBotMock.airgram.api.getMessage = getClosureMessage;
  const ctx = {
    update: {
      message,
    },
    airgram: appBotMock.airgram,
    reply: sendMessage,
  } as unknown as UpdCtxNewMessage;
  const botInfo = {
    id: testConfig.bot_id,
    is_bot: true,
    first_name: appBotMock.config.bot.bot_name,
    username: appBotMock.config.bot.bot_name,
  } as BotInfoT;
  const botCtx = {};
  if (await augmentBotCtxFromBotInfoCtx(botCtx as InitialBotCtxT, botInfo)) {
    if (await augmentBotCtxFromUpdCtx(botCtx as UsernameBotCtxT, ctx)) {
      if (
        await augmentBotCtxFromDB(
          botCtx as UpdBotCtxT,
          appBotMock.dbApp,
          appBotMock.config,
        )
      ) {
        logTest('handleBotResponse()', 'botCtx generated');
        appBotMock.botCtxSubject.next({
          botCtx: botCtx as BotCtxT,
        });
        return retPromise;
      } else {
        throw new Error('Unable to generate UpdBotCtxT');
      }
    } else {
      throw new Error('Unable to generate UsernameBotCtxT');
    }
  } else {
    throw new Error('Unable to generate InitialBotCtxT');
  }
}

async function runMockTestCase({
  testCase,
  appBotMock,
  aggregators,
}: {
  testCase: TestCase;
  appBotMock: AppBotMockI;
  aggregators: Aggregate[];
}): Promise<void> {
  const now = Date.now();
  const nowId = Array.from(String(now)).reverse().join('');
  const {
    prepareDB,
    toSendText,
    messageClosureForReply,
    clearDB,
    toBeMessage,
    toBeText,
    toMatch,
    toExpect,
  } = testCase;
  logTest(nowId, 'run-mock-test-case', 'start');
  let preparedData,
    clearedData,
    botNext,
    lastMessage: Message | undefined,
    lastMessageText: string | undefined;
  if (prepareDB) {
    logTest(nowId, 'run-mock-test-case', 'prepareDB() start');
    preparedData = await prepareDB(aggregators);
    logTest(nowId, 'run-mock-test-case', 'prepareDB() done');
  }

  const aggregator: Aggregate = { preparedData, botNext: {} as BotNextCtx };
  aggregators.push(aggregator);

  let tSend;
  if (typeof toSendText === 'function') {
    logTest(nowId, 'run-mock-test-case', 'toSendText()');
    tSend = toSendText(aggregators, preparedData);
  } else if (toSendText) {
    tSend = toSendText;
  }
  if (tSend) {
    logTest(nowId, 'run-mock-test-case', 'tSend', tSend);

    const closureMessage =
      typeof messageClosureForReply === 'function'
        ? messageClosureForReply(aggregators)
        : undefined;
    const all = await Promise.all([
      // subscribe to bot response (convert observable to promise)
      obsSubscrToPr(appBotMock.botSubjectNext).then((res) => {
        logTest(nowId, 'run-mock-test-case', 'bot sent response resolved');
        return res;
      }),
      // subscribe to user send
      handleBotResponse({ text: tSend, appBotMock, closureMessage }).then(
        (res) => {
          logTest(nowId, 'run-mock-test-case', 'user sent message resolved');
          return res;
        },
      ),
    ]);
    botNext = all[0];
    aggregator.botNext = botNext;
    lastMessage = all[1];
    lastMessageText =
      lastMessage.content._ === 'messageText'
        ? lastMessage.content.text.text
        : 'error:lastMessageText';
    aggregator.lastMessage = lastMessage;
    logTest(
      nowId,
      'run-mock-test-case',
      'getLastChatMessage()',
      lastMessageText,
    );
  }

  if (typeof clearDB === 'function') {
    logTest(nowId, 'run-mock-test-case', 'clearDB() start');
    clearedData = await clearDB(aggregators);
    logTest(nowId, 'run-mock-test-case', 'clearDB() done');
    aggregator.clearedData = clearedData;
  }

  let tIn;
  if (typeof toBeMessage === 'function') {
    logTest(nowId, 'run-mock-test-case', 'toBeMessage()');
    tIn = toBeMessage(aggregators, preparedData, clearedData, botNext);
  } else if (toBeMessage) {
    tIn = toBeMessage;
  }
  if (tIn || typeof toBeText === 'function') {
    const resText =
      (toBeText && toBeText(aggregators)) ||
      translateResult(tIn as ToTranslateUnion).text.trim();
    if (toMatch) {
      expect(lastMessageText).toMatch(resText);
    } else {
      expect(lastMessageText).toBe(resText);
    }
  }
  if (Array.isArray(toExpect)) {
    for (const toExpectOne of toExpect) {
      await toExpectOne(aggregators, preparedData, clearedData, botNext);
    }
  } else if (toExpect) {
    await toExpect(aggregators, preparedData, clearedData, botNext);
  }

  logTest(nowId, 'run-mock-test-case', 'expect() done');
}

async function testBotMockMsgResponses({
  appBotMock,
  testCases,
}: {
  appBotMock: AppBotMockI;
  testCases: TestCase[];
}): Promise<void> {
  const assertionsCount = testCases.reduce(
    (sum: number, cur: TestCase): number => {
      if (Array.isArray(cur.toExpect)) {
        sum += cur.toExpect.length;
      } else if (cur.toExpect) {
        sum += 1;
      }
      if (cur.toBeMessage || cur.toBeText) {
        sum += 1;
      }
      return sum;
    },
    0,
  );
  expect.assertions(assertionsCount);
  logTest('assertionsCount', assertionsCount);
  const aggregators: Aggregate[] = [];

  for (const testCase of testCases) {
    await runMockTestCase({
      appBotMock,
      testCase,
      aggregators,
    });
  }
}

export function CreateMockTestBotMessageResponses({
  appBotMock,
}: {
  appBotMock: AppBotMockI;
}): PreparedTestBotMessages {
  return (testCases: TestCase[]): Promise<void> =>
    testBotMockMsgResponses({
      appBotMock,
      testCases,
    });
}
