import { ReplyMarkupUnion, InlineKeyboardButton } from 'airgram';
import i18next from 'i18next';

import enTranslations from './en';
import ruTranslations from './ru';
import { TrKey, TrStrKey } from './keys';

export enum LanguageEnum {
  English = 'en',
  Russian = 'ru',
}

export function TrLanguage(language: string, strict?: boolean): LanguageEnum {
  switch (language) {
    case 'ru':
      return LanguageEnum.Russian;
  }
  if (strict) {
    throw new Error('Can not parse week starts on');
  }
  return LanguageEnum.English;
}

i18next.init(
  {
    // debug: true,
    returnNull: false,
    lng: LanguageEnum.English,
    resources: {
      [LanguageEnum.English]: {
        translation: enTranslations,
      },
      [LanguageEnum.Russian]: {
        translation: ruTranslations,
      },
    },
  },
  (err) => {
    if (err) {
      throw err;
    }
  },
);

export function parseLanguage(
  language: string | undefined,
  strict?: boolean,
): LanguageEnum {
  switch (language) {
    case LanguageEnum.English:
      return LanguageEnum.English;
    case LanguageEnum.Russian:
      return LanguageEnum.Russian;
  }
  if (strict) {
    throw new Error('Can not parse language');
  }
  return LanguageEnum.English;
}

export function getLanguages(): string[] {
  return Object.values(LanguageEnum);
}

export function getTranslations(language: LanguageEnum): TranslationDic {
  switch (language) {
    case LanguageEnum.English:
      return enTranslations;
    case LanguageEnum.Russian:
      return ruTranslations;
  }
  return enTranslations;
}

export interface TrData {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [index: string]: any;
}
export interface TranslationDic {
  [index: string]: string;
}
// button
export enum KeyboardButtonEnum {
  url = 'keyboardButtonUrl',
  callback = 'keyboardButtonCallback',
}
export interface TrKeyboardButtonUrl {
  _: KeyboardButtonEnum.url;
  key: TrKey;
  url: string;
}
export interface TrKeyboardButtonCallback {
  _: KeyboardButtonEnum.callback;
  key: TrKey;
  callback_data: string;
}
export type TrKeyboardButtonUnion =
  | TrKeyboardButtonCallback
  | TrKeyboardButtonUrl;
// row
export enum KeyboardButtonRowEnum {
  row = 'keyboardButtonRow',
}
export interface TrKeyboardButtonRow {
  _: KeyboardButtonRowEnum.row;
  buttons: TrKeyboardButtonUnion[];
}
export type TrKeyboardButtonRowUnion = TrKeyboardButtonRow;
// markup
export enum ReplyInlineMarkupEnum {
  markup = 'replyInlineMarkup',
}
export interface TrReplyInlineMarkup {
  _: ReplyInlineMarkupEnum.markup;
  rows: TrKeyboardButtonRowUnion[];
}
type TrReplyMarkupUnion = TrReplyInlineMarkup;
export interface TrReplOptions {
  flags?: number;
  replyMarkup?: TrReplyMarkupUnion;
}
export type TrOutReplOptions = ReplyMarkupUnion;
export class ToTranslate {
  constructor(
    public key: TrKey,
    public language?: LanguageEnum,
    public data?: TrData,
    public dataTrKeys?: string[],
    public replOptions?: TrReplOptions,
  ) {}
}
export class ToTranslateArr {
  constructor(
    public items: ToTranslate[],
    public pattern?: string,
    public join?: string,
    public replOptions?: TrReplOptions,
  ) {}
}
export class ToTranslateDArr {
  constructor(
    public items: ToTranslateArr[],
    public pattern?: string,
    public join?: string,
    public replOptions?: TrReplOptions,
  ) {}
}
export type ToTranslateUnion = ToTranslate | ToTranslateArr | ToTranslateDArr;

export interface TrObject {
  key: TrKey;
  language: LanguageEnum;
  data: TrData;
}

function tRepl(
  replOptions?: TrReplOptions,
  data?: TrData,
): TrOutReplOptions | undefined {
  if (replOptions && replOptions.replyMarkup && data) {
    if (replOptions.replyMarkup._ === ReplyInlineMarkupEnum.markup) {
      const rows: InlineKeyboardButton[][] = [];
      for (const trRow of replOptions.replyMarkup.rows) {
        const buttons: InlineKeyboardButton[] = [];
        for (const trBtn of trRow.buttons) {
          const { key, _ } = trBtn;
          switch (_) {
            case KeyboardButtonEnum.url:
              buttons.push({
                _: 'inlineKeyboardButton',
                text: String(i18next.t(TrStrKey(key), data)),
                type: {
                  _: 'inlineKeyboardButtonTypeUrl',
                  url: (trBtn as TrKeyboardButtonUrl).url,
                },
              });
              break;
            case KeyboardButtonEnum.callback:
              buttons.push({
                _: 'inlineKeyboardButton',
                text: String(i18next.t(TrStrKey(key), data)),
                type: {
                  _: 'inlineKeyboardButtonTypeCallback',
                  data: (trBtn as TrKeyboardButtonCallback).callback_data,
                },
              });
              break;
          }
        }
        rows.push(buttons);
      }
      return { _: 'replyMarkupInlineKeyboard', rows };
    }
  }
}

export interface TrResult {
  text: string;
  outReplOptions?: TrOutReplOptions;
}

export function t(toTranslate: ToTranslate): TrResult {
  const { key, language, dataTrKeys, replOptions } = toTranslate;
  let { data } = toTranslate;
  if (typeof data !== 'object') {
    data = {};
  }
  data.lng = language;
  data.interpolation = { escapeValue: false };
  if (Array.isArray(dataTrKeys)) {
    for (const dataTrKey of dataTrKeys) {
      const keyData = data[dataTrKey];
      if (
        keyData instanceof ToTranslate ||
        keyData instanceof ToTranslateArr ||
        keyData instanceof ToTranslateDArr
      ) {
        data[dataTrKey] = translateResult(data[dataTrKey]).text; // eslint-disable-line @typescript-eslint/no-use-before-define
      }
    }
  }
  const outReplOptions = tRepl(replOptions, data);
  return { text: String(i18next.t(TrStrKey(key), data)), outReplOptions };
}

export function interpolateData(str: string, data: TrData): string {
  return Object.keys(data).reduce((str, key) => {
    const value = data[key];
    const strKey = new RegExp(`\\{\\{${key}\\}\\}`, 'g');
    return typeof value === 'string'
      ? str.replace(strKey, value || '')
      : str.replace(strKey, (value && JSON.stringify(value)) || '');
  }, str);
}

function assignTextsPattern(
  trResults: TrResult[],
  pattern?: string,
  join = '',
): string {
  const texts = trResults.map((trR) => trR.text).filter(Boolean);
  if (pattern) {
    return interpolateData(
      pattern,
      Object.assign({}, texts), // https://stackoverflow.com/a/36388401/5431545
    );
  }
  return texts.join(join);
}

function unwrapToTranslateArr(toTranslateArr: ToTranslateArr): TrResult {
  const texts = toTranslateArr.items
    .map((item) => t(item))
    .filter((out) => out.text.length);
  return {
    text: assignTextsPattern(
      texts,
      toTranslateArr.pattern,
      toTranslateArr.join,
    ),
  };
}

function unwrapToTranslateDArr(toTranslateDArr: ToTranslateDArr): TrResult {
  const texts = toTranslateDArr.items.map((item) => unwrapToTranslateArr(item));
  return {
    text: assignTextsPattern(
      texts,
      toTranslateDArr.pattern,
      toTranslateDArr.join,
    ),
  };
}

export function translateResult(toTranslateUnion: ToTranslateUnion): TrResult {
  if (toTranslateUnion instanceof ToTranslateArr) {
    return unwrapToTranslateArr(toTranslateUnion);
  } else if (toTranslateUnion instanceof ToTranslateDArr) {
    return unwrapToTranslateDArr(toTranslateUnion);
  }
  return t(toTranslateUnion);
}
