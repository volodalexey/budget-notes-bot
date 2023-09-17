import {
  ApiResponse,
  GetMessageParams,
  Message,
  MessageUnion,
  SendMessageParams,
  TextEntity,
  UpdateContext,
  UpdateNewMessage,
  UserUnion,
} from 'airgram';
import { Update as Td$Update } from 'tdlib-types';
import { ExtendedConfig } from 'airgram/Airgram';
import { Client } from 'tdl';
import { TDLib } from 'tdl-tdlib-addon';
import { logMsg, logTdLib } from '../logger/logger';

// TODO temp new type
type UserNames = {
  _: string;
  active_usernames: Array<string>;
  disabled_usernames: Array<string>;
  editable_username: string;
};

// This is mock for real Airgram until it will support tdlib 1.8.6+
// https://github.com/airgram/airgram/issues/221
export class Airgram {
  private client!: Client;
  private auth!: Auth;
  constructor(config: ExtendedConfig) {
    this.client = new Client(new TDLib(config.command), {
      apiId: config.apiId,
      apiHash: config.apiHash,
      databaseDirectory: config.databaseDirectory,
      verbosityLevel: config.logVerbosityLevel,
    });

    this.client.on('error', logMsg);
  }

  get api() {
    return {
      getMessage: async (
        params?: GetMessageParams,
      ): Promise<ApiResponse<GetMessageParams, MessageUnion>> => {
        const response = await this.client.invoke({
          _: 'getMessage',
          chat_id: params?.chatId,
          message_id: params?.messageId,
        });
        return { response } as unknown as ApiResponse<
          GetMessageParams,
          MessageUnion
        >;
      },
      getMe: async (): Promise<ApiResponse<never, UserUnion>> => {
        const response = await this.client.invoke({
          _: 'getMe',
        });
        logTdLib('getMe:response', response);
        return {
          response: {
            _: response._,
            id: response.id,
            username:
              (response as unknown as { usernames: UserNames }).usernames &&
              (response as unknown as { usernames: UserNames }).usernames._ ===
                'usernames'
                ? (response as unknown as { usernames: UserNames }).usernames
                    .active_usernames[0]
                : 'test_mock_username',
            firstName: response.first_name,
          } as UserUnion,
        } as unknown as ApiResponse<never, UserUnion>;
      },
      sendMessage: async (
        params?: SendMessageParams,
      ): Promise<ApiResponse<SendMessageParams, Message>> => {
        const response = await this.client.invoke({
          _: 'sendMessage',
          chat_id: params?.chatId,
          reply_markup: params?.replyMarkup,
          reply_to_message_id: params?.replyToMessageId,
          input_message_content: params?.inputMessageContent,
        });
        return { response } as unknown as ApiResponse<
          SendMessageParams,
          Message
        >;
      },
    };
  }

  use(auth: Auth) {
    this.auth = auth;
    return this.client.loginAsBot(this.auth.config.token);
  }

  on(
    eventType: 'updateNewMessage',
    handler: (context: UpdateContext<UpdateNewMessage>) => void,
  ) {
    this.client.on('update', (ctx: Td$Update) => {
      if (
        ctx._ === 'updateNewMessage' &&
        ctx.message.sender_id._ === 'messageSenderUser' &&
        ctx.message.content._ === 'messageText'
      ) {
        logTdLib('updateNewMessage', ctx, ctx.message.content.text);
        handler({
          update: {
            _: ctx._,
            message: {
              id: ctx.message.id,
              date: ctx.message.date,
              senderId: {
                _: ctx.message.sender_id._,
                userId: ctx.message.sender_id.user_id,
              },
              content: {
                _: ctx.message.content._,
                text: {
                  _: ctx.message.content.text._,
                  text: ctx.message.content.text.text,
                  entities: ctx.message.content.text.entities as TextEntity[],
                },
              },
              replyToMessageId: ctx.message.reply_to_message_id,
              chatId: ctx.message.chat_id,
            } as Message,
          } as UpdateNewMessage,
          airgram: this as Airgram,
        } as unknown as UpdateContext<UpdateNewMessage>);
      }
      //   handler(ctx as unknown as UpdateContext<UpdateNewMessage>);
    });
  }

  destroy() {
    return this.client.close();
  }
}

export class Auth {
  constructor(public config: { token: string }) {}
}
export {};
