import { Message } from 'airgram';
import { Observable } from 'rxjs';

import { ToTranslateUnion } from '../i18n/i18n';
import { BotNextCtx } from '../bot/bot';
import { logTest } from '../logger/logger';

export function obsSubscrToPr<T extends BotNextCtx>(
  observable: Observable<T>,
): Promise<T> {
  return new Promise((resolve, reject) => {
    logTest('obsSubscrToPr', 'promise created');
    const subscription = observable.subscribe({
      next: (ret) => {
        logTest('obsSubscrToPr', 'observable next');
        subscription.unsubscribe();
        if (ret && ret.error) {
          reject(ret.error);
        } else {
          resolve(ret);
        }
      },
      error: (err) => {
        logTest('obsSubscrToPr', 'observable error');
        subscription.unsubscribe();
        reject(err);
      },
    });
  });
}
/* eslint-disable @typescript-eslint/no-explicit-any */
export type ToBeSend = (preparedData?: any) => string;
export type ToBeMessage = (
  preparedData?: any,
  botNext?: BotNextCtx,
) => ToTranslateUnion;

export type ToBeSendAggr = (
  aggregators: Aggregate[],
  preparedData?: any,
) => string;
export type ToBeMessageAggr = (
  aggregators: Aggregate[],
  preparedData?: any,
  clearedData?: any,
  botNext?: BotNextCtx,
) => ToTranslateUnion;
export type ToExpect = (
  aggregators: Aggregate[],
  preparedData?: any,
  clearedData?: any,
  botNext?: BotNextCtx,
) => Promise<any> | void;
export interface TestCase {
  toSendText?: ToBeSendAggr | string;
  toBeMessage?: ToBeMessageAggr | ToTranslateUnion;
  toBeText?: (aggregators: Aggregate[]) => string;
  messageClosureForReply?: (aggregators: Aggregate[]) => Message | undefined;
  prepareDB?: (aggregators: Aggregate[]) => Promise<any>;
  clearDB?: (aggregators: Aggregate[]) => Promise<any>;
  toMatch?: boolean;
  toExpect?: ToExpect | ToExpect[];
}

export interface Aggregate {
  preparedData?: any;
  clearedData?: any;
  lastMessage?: Message;
  botNext: BotNextCtx;
}
/* eslint-enable @typescript-eslint/no-explicit-any */

export type PreparedTestBotMessages = (testCases: TestCase[]) => Promise<void>;
