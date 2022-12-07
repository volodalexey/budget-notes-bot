import { TrKey } from '../i18n/keys';
import {
  ToTranslateArr,
  ToTranslate,
  LanguageEnum,
  ToTranslateDArr,
  getLanguages,
  TrData,
} from '../i18n/i18n';
import { getCategoryTypes } from '../db/models/categoryModel';
import { getPackageVersion } from '../packageInfo';
import { WeekStartsOn } from './datetime';

const types = getCategoryTypes().join('|');
const languages = getLanguages().join('|');

export enum BotCommandEnum {
  start = 1,
  help,
  settings,
  webui,
  // categories
  addctg,
  listctg,
  updctgn,
  updctgd,
  delctg,
  undodelctg,
  archctg,
  undoarchctg,
  // notes
  addnt,
  appntt,
  listnt,
  delnt,
  undodelnt,
  archnt,
  undoarchnt,
  updnt,
  trnsnt,
  trnsnts,
  // subcategories
  addsbc,
  listsbc,
  updsbcn,
  updsbcd,
  delsbc,
  undodelsbc,
  archsbc,
  undoarchsbc,
  // common
  setlang,
  settimezone,
  setweekstartson,
  stats,
  // admin (must not work for regular user)
  ahelp, // adminHelp
  alu, // adminListUsers
  asud, // adminSetUserDeveloper
  asur, // adminSetUserRejected
  asuu, // adminSetUserUnknown
  adu, // adminDeleteUser
}

export function TrStrCom(cmd: BotCommandEnum): string {
  return BotCommandEnum[cmd];
}

export function TrCom(cmdStr: string | number): BotCommandEnum {
  return BotCommandEnum[cmdStr as number] as unknown as BotCommandEnum;
}

export function getBotCommands(): string[] {
  return Object.keys(BotCommandEnum).filter(
    (cmd) =>
      [
        BotCommandEnum.ahelp,
        BotCommandEnum.alu,
        BotCommandEnum.asud,
        BotCommandEnum.asur,
        BotCommandEnum.asuu,
        BotCommandEnum.adu,
      ]
        .map(TrStrCom)
        .includes(cmd) === false,
  );
}

export function toCommand(cmd: BotCommandEnum): string {
  return `/${TrStrCom(cmd)}`;
}

export function wrapCmdToTranslate(
  cmd: BotCommandEnum,
  exampleKey: TrKey,
  descriptionKey: TrKey,
  parametersKey: TrKey,
  lang?: LanguageEnum,
): ToTranslate[] {
  const cmdStr = toCommand(cmd);
  return [
    new ToTranslate(TrKey.TEXT, lang, { text: TrStrCom(cmd) }), // {{0}} - pattern example, result = listff
    new ToTranslate(TrKey.TEXT, lang, { text: cmdStr }), // {{1}} - pattern example, result = /listff
    new ToTranslate(exampleKey, lang, { cmd: cmdStr }), // {{2}} - pattern example, result = /listff ?a ?b
    new ToTranslate(descriptionKey, lang, { cmd: cmdStr }), // {{3}} - pattern example, result = list all ff's
    new ToTranslate(parametersKey, lang, {
      cmd: cmdStr,
      types,
      languages,
    }), // {{4}} - pattern example, result = optional a - ..., optional b - ...
  ];
}

export function generateBotCmdToTranslates(
  cmd: BotCommandEnum,
  lang?: LanguageEnum,
): ToTranslate[] {
  switch (cmd) {
    // categories
    case BotCommandEnum.addctg:
      return wrapCmdToTranslate(
        cmd,
        TrKey.CMD_CTG_ADD_EXAM,
        TrKey.CMD_CTG_ADD_DESC,
        TrKey.CMD_CTG_ADD_PARAM,
        lang,
      );
    case BotCommandEnum.listctg:
      return wrapCmdToTranslate(
        cmd,
        TrKey.CMD_CTG_LIST_EXAM,
        TrKey.CMD_CTG_LIST_DESC,
        TrKey.CMD_CTG_LIST_PARAM,
        lang,
      );
    case BotCommandEnum.updctgn:
      return wrapCmdToTranslate(
        cmd,
        TrKey.CMD_CTG_UPDN_EXAM,
        TrKey.CMD_CTG_UPDN_DESC,
        TrKey.CMD_CTG_UPDN_PARAM,
        lang,
      );
    case BotCommandEnum.updctgd:
      return wrapCmdToTranslate(
        cmd,
        TrKey.CMD_CTG_UPDD_EXAM,
        TrKey.CMD_CTG_UPDD_DESC,
        TrKey.CMD_CTG_UPDD_PARAM,
        lang,
      );
    case BotCommandEnum.delctg:
      return wrapCmdToTranslate(
        cmd,
        TrKey.CMD_CTG_DEL_EXAM,
        TrKey.CMD_CTG_DEL_DESC,
        TrKey.CMD_CTG_DEL_PARAM,
        lang,
      );
    case BotCommandEnum.undodelctg:
      return wrapCmdToTranslate(
        cmd,
        TrKey.CMD_UNDO_CTG_DEL_EXAM,
        TrKey.CMD_UNDO_CTG_DEL_DESC,
        TrKey.CMD_UNDO_CTG_DEL_PARAM,
        lang,
      );
    case BotCommandEnum.archctg:
      return wrapCmdToTranslate(
        cmd,
        TrKey.CMD_CTG_ARCH_EXAM,
        TrKey.CMD_CTG_ARCH_DESC,
        TrKey.CMD_CTG_ARCH_PARAM,
        lang,
      );
    case BotCommandEnum.undoarchctg:
      return wrapCmdToTranslate(
        cmd,
        TrKey.CMD_UNDO_CTG_ARCH_EXAM,
        TrKey.CMD_UNDO_CTG_ARCH_DESC,
        TrKey.CMD_UNDO_CTG_ARCH_PARAM,
        lang,
      );
    // subcategories
    case BotCommandEnum.addsbc:
      return wrapCmdToTranslate(
        cmd,
        TrKey.CMD_SBC_ADD_EXAM,
        TrKey.CMD_SBC_ADD_DESC,
        TrKey.CMD_SBC_ADD_PARAM,
        lang,
      );
    case BotCommandEnum.listsbc:
      return wrapCmdToTranslate(
        cmd,
        TrKey.CMD_SBC_LIST_EXAM,
        TrKey.CMD_SBC_LIST_DESC,
        TrKey.CMD_SBC_LIST_PARAM,
        lang,
      );
    case BotCommandEnum.updsbcn:
      return wrapCmdToTranslate(
        cmd,
        TrKey.CMD_SBC_UPDN_EXAM,
        TrKey.CMD_SBC_UPDN_DESC,
        TrKey.CMD_SBC_UPDN_PARAM,
        lang,
      );
    case BotCommandEnum.updsbcd:
      return wrapCmdToTranslate(
        cmd,
        TrKey.CMD_SBC_UPDD_EXAM,
        TrKey.CMD_SBC_UPDD_DESC,
        TrKey.CMD_SBC_UPDD_PARAM,
        lang,
      );
    case BotCommandEnum.delsbc:
      return wrapCmdToTranslate(
        cmd,
        TrKey.CMD_SBC_DEL_EXAM,
        TrKey.CMD_SBC_DEL_DESC,
        TrKey.CMD_SBC_DEL_PARAM,
        lang,
      );
    case BotCommandEnum.undodelsbc:
      return wrapCmdToTranslate(
        cmd,
        TrKey.CMD_UNDO_SBC_DEL_EXAM,
        TrKey.CMD_UNDO_SBC_DEL_DESC,
        TrKey.CMD_UNDO_SBC_DEL_PARAM,
        lang,
      );
    case BotCommandEnum.archsbc:
      return wrapCmdToTranslate(
        cmd,
        TrKey.CMD_SBC_ARCH_EXAM,
        TrKey.CMD_SBC_ARCH_DESC,
        TrKey.CMD_SBC_ARCH_PARAM,
        lang,
      );
    case BotCommandEnum.undoarchsbc:
      return wrapCmdToTranslate(
        cmd,
        TrKey.CMD_UNDO_SBC_ARCH_EXAM,
        TrKey.CMD_UNDO_SBC_ARCH_DESC,
        TrKey.CMD_UNDO_SBC_ARCH_PARAM,
        lang,
      );
    // notes
    case BotCommandEnum.addnt:
      return wrapCmdToTranslate(
        cmd,
        TrKey.CMD_NT_ADD_EXAM,
        TrKey.CMD_NT_ADD_DESC,
        TrKey.CMD_NT_ADD_PARAM,
        lang,
      );
    case BotCommandEnum.appntt:
      return wrapCmdToTranslate(
        cmd,
        TrKey.CMD_NT_APPT_EXAM,
        TrKey.CMD_NT_APPT_DESC,
        TrKey.CMD_NT_APPT_PARAM,
        lang,
      );
    case BotCommandEnum.listnt:
      return wrapCmdToTranslate(
        cmd,
        TrKey.CMD_NT_LIST_EXAM,
        TrKey.CMD_NT_LIST_DESC,
        TrKey.CMD_NT_LIST_PARAM,
        lang,
      );
    case BotCommandEnum.updnt:
      return wrapCmdToTranslate(
        cmd,
        TrKey.CMD_UPDNT_EXAM,
        TrKey.CMD_UPDNT_DESC,
        TrKey.CMD_UPDNT_PARAM,
        lang,
      );
    case BotCommandEnum.trnsnt:
      return wrapCmdToTranslate(
        cmd,
        TrKey.CMD_TRNSNT_EXAM,
        TrKey.CMD_TRNSNT_DESC,
        TrKey.CMD_TRNSNT_PARAM,
        lang,
      );
    case BotCommandEnum.trnsnts:
      return wrapCmdToTranslate(
        cmd,
        TrKey.CMD_TRNSNTS_EXAM,
        TrKey.CMD_TRNSNTS_DESC,
        TrKey.CMD_TRNSNTS_PARAM,
        lang,
      );
    case BotCommandEnum.delnt:
      return wrapCmdToTranslate(
        cmd,
        TrKey.CMD_NT_DEL_EXAM,
        TrKey.CMD_NT_DEL_DESC,
        TrKey.CMD_NT_DEL_PARAM,
        lang,
      );
    case BotCommandEnum.undodelnt:
      return wrapCmdToTranslate(
        cmd,
        TrKey.CMD_NT_UNDO_DEL_EXAM,
        TrKey.CMD_NT_UNDO_DEL_DESC,
        TrKey.CMD_NT_UNDO_DEL_PARAM,
        lang,
      );
    case BotCommandEnum.archnt:
      return wrapCmdToTranslate(
        cmd,
        TrKey.CMD_NT_ARCH_EXAM,
        TrKey.CMD_NT_ARCH_DESC,
        TrKey.CMD_NT_ARCH_PARAM,
        lang,
      );
    case BotCommandEnum.undoarchnt:
      return wrapCmdToTranslate(
        cmd,
        TrKey.CMD_NT_UNDO_ARCH_EXAM,
        TrKey.CMD_NT_UNDO_ARCH_DESC,
        TrKey.CMD_NT_UNDO_ARCH_PARAM,
        lang,
      );
    // common
    case BotCommandEnum.help:
      return wrapCmdToTranslate(
        cmd,
        TrKey.CMD_HELP_EXAM,
        TrKey.CMD_HELP_DESC,
        TrKey.CMD_HELP_PARAM,
        lang,
      );
    case BotCommandEnum.setlang:
      return wrapCmdToTranslate(
        cmd,
        TrKey.CMD_SET_LANG_EXAM,
        TrKey.CMD_SET_LANG_DESC,
        TrKey.CMD_SET_LANG_PARAM,
        lang,
      );
    case BotCommandEnum.settimezone:
      return wrapCmdToTranslate(
        cmd,
        TrKey.CMD_SET_TIMEZONE_EXAM,
        TrKey.CMD_SET_TIMEZONE_DESC,
        TrKey.CMD_SET_TIMEZONE_PARAM,
        lang,
      );
    case BotCommandEnum.setweekstartson:
      return wrapCmdToTranslate(
        cmd,
        TrKey.CMD_SET_WEEKS_STARTS_ON_EXAM,
        TrKey.CMD_SET_WEEKS_STARTS_ON_DESC,
        TrKey.CMD_SET_WEEKS_STARTS_ON_PARAM,
        lang,
      );
    case BotCommandEnum.stats:
      return wrapCmdToTranslate(
        cmd,
        TrKey.CMD_STATS_EXAM,
        TrKey.CMD_STATS_DESC,
        TrKey.CMD_STATS_PARAM,
        lang,
      );
    case BotCommandEnum.settings:
      return wrapCmdToTranslate(
        cmd,
        TrKey.CMD_SETTINGS_EXAM,
        TrKey.CMD_SETTINGS_DESC,
        TrKey.CMD_SETTINGS_PARAM,
        lang,
      );
  }
  return [];
}

export function toHelpShortCmdInstr(
  cmd: BotCommandEnum,
  lang?: LanguageEnum,
): ToTranslateArr {
  return new ToTranslateArr(
    generateBotCmdToTranslates(cmd, lang),
    '{{2}} - {{3}}',
  );
}

export function toHelpCmdInstr(
  cmd: BotCommandEnum,
  lang?: LanguageEnum,
): ToTranslateArr {
  return new ToTranslateArr(
    generateBotCmdToTranslates(cmd, lang),
    '{{2}} - {{3}}\n{{4}}',
  );
}

export function toFatherCmdInstr(
  cmd: BotCommandEnum,
  lang?: LanguageEnum,
): ToTranslateArr {
  return new ToTranslateArr(
    generateBotCmdToTranslates(cmd, lang),
    '{{0}} - {{3}}',
  );
}

export function toInvCmdInstr(
  cmd: BotCommandEnum,
  lang?: LanguageEnum,
): ToTranslateArr {
  return new ToTranslateArr(
    generateBotCmdToTranslates(cmd, lang),
    '{{2}}\n{{4}}',
  );
}

export function generateHelpInstruction(lang?: LanguageEnum): ToTranslateDArr {
  return new ToTranslateDArr(
    [
      ...[
        BotCommandEnum.help,
        // categories
        BotCommandEnum.addctg,
        BotCommandEnum.listctg,
        BotCommandEnum.updctgn,
        BotCommandEnum.updctgd,
        BotCommandEnum.delctg,
        BotCommandEnum.undodelctg,
        BotCommandEnum.archctg,
        BotCommandEnum.undoarchctg,
        // subcategories
        BotCommandEnum.addsbc,
        BotCommandEnum.listsbc,
        BotCommandEnum.updsbcn,
        BotCommandEnum.updsbcd,
        BotCommandEnum.delsbc,
        BotCommandEnum.undodelsbc,
        BotCommandEnum.archsbc,
        BotCommandEnum.undoarchsbc,
        // notes
        BotCommandEnum.addnt,
        BotCommandEnum.appntt,
        BotCommandEnum.listnt,
        BotCommandEnum.updnt,
        BotCommandEnum.trnsnt,
        BotCommandEnum.trnsnts,
        BotCommandEnum.delnt,
        BotCommandEnum.undodelnt,
        BotCommandEnum.archnt,
        BotCommandEnum.undoarchnt,
        // statistic
        BotCommandEnum.stats,
        // common
        BotCommandEnum.setlang,
        BotCommandEnum.settimezone,
        BotCommandEnum.setweekstartson,
        BotCommandEnum.settings,
      ].map((cmd) => toHelpShortCmdInstr(cmd, lang)),
    ],
    undefined,
    '\n\n',
  );
}

export function generateFatherInstruction(
  lang?: LanguageEnum,
): ToTranslateDArr {
  return new ToTranslateDArr(
    [
      // categories
      BotCommandEnum.addctg,
      BotCommandEnum.listctg,
      BotCommandEnum.updctgn,
      BotCommandEnum.updctgd,
      BotCommandEnum.delctg,
      BotCommandEnum.undodelctg,
      BotCommandEnum.archctg,
      BotCommandEnum.undoarchctg,
      // subcategories
      BotCommandEnum.addsbc,
      BotCommandEnum.listsbc,
      BotCommandEnum.updsbcn,
      BotCommandEnum.updsbcd,
      BotCommandEnum.delsbc,
      BotCommandEnum.undodelsbc,
      BotCommandEnum.archsbc,
      BotCommandEnum.undoarchsbc,
      // notes
      BotCommandEnum.addnt,
      BotCommandEnum.appntt,
      BotCommandEnum.listnt,
      BotCommandEnum.updnt,
      BotCommandEnum.trnsnt,
      BotCommandEnum.trnsnts,
      BotCommandEnum.delnt,
      BotCommandEnum.undodelnt,
      BotCommandEnum.archnt,
      BotCommandEnum.undoarchnt,
      // statistic
      BotCommandEnum.stats,
      // common
      BotCommandEnum.setlang,
      BotCommandEnum.settimezone,
      BotCommandEnum.setweekstartson,
      BotCommandEnum.settings,
      BotCommandEnum.help,
    ].map((cmd) => toFatherCmdInstr(cmd, lang)),
    undefined,
    '\n',
  );
}

export function generateInvInstruction(
  invKey: TrKey,
  cmd: BotCommandEnum,
  lang?: LanguageEnum,
  data?: TrData,
): ToTranslateDArr {
  return new ToTranslateDArr(
    [
      new ToTranslateArr([new ToTranslate(invKey, lang, data)]),
      toInvCmdInstr(cmd, lang),
    ],
    undefined,
    '\n',
  );
}

export function toCmdRegExp(cmd: BotCommandEnum, full?: boolean): RegExp {
  return new RegExp(`^/${cmd}${full ? '$' : ''}`);
}

export function toNumber(el: string): number {
  return parseInt(el.replace(/\D/g, ''));
}
export function calcUID(chat_id: string, user_id: string): string {
  return `${chat_id}-${user_id}`;
}

// pattern for command with bot name
const cmdPattern = /^(\/[a-z]{3,})@([A-Za-z0-9_-]{3,})\s?(.{0,})?$/;

export type checkCommandHasBotNameT = string[];

export function checkCommandHasBotName(
  msgText: string,
): checkCommandHasBotNameT | false {
  const matched = msgText.match(cmdPattern);
  if (Array.isArray(matched) && matched.length >= 3) {
    return matched;
  }

  return false;
}

// https://stackoverflow.com/a/45138005/5431545
const EMOJI_UNICODE =
  /[\u{1f300}-\u{1f5ff}\u{1f900}-\u{1f9ff}\u{1f600}-\u{1f64f}\u{1f680}-\u{1f6ff}\u{2600}-\u{26ff}\u{2700}-\u{27bf}\u{1f1e6}-\u{1f1ff}\u{1f191}-\u{1f251}\u{1f004}\u{1f0cf}\u{1f170}-\u{1f171}\u{1f17e}-\u{1f17f}\u{1f18e}\u{3030}\u{2b50}\u{2b55}\u{2934}-\u{2935}\u{2b05}-\u{2b07}\u{2b1b}-\u{2b1c}\u{3297}\u{3299}\u{303d}\u{00a9}\u{00ae}\u{2122}\u{23f3}\u{24c2}\u{23e9}-\u{23ef}\u{25b6}\u{23f8}-\u{23fa}]/gu;

export function hasEmoji(str: string): boolean {
  EMOJI_UNICODE.lastIndex = 0;
  return EMOJI_UNICODE.test(str);
}

export function splitEmoji(str: string): RegExpExecArray | null {
  EMOJI_UNICODE.lastIndex = 0;
  return EMOJI_UNICODE.exec(str);
}

// https://thekevinscott.com/emojis-in-javascript/
const TEN_BITS = Number.parseInt('1111111111', 2);
function u(codeUnit: number): string {
  return '\\u' + codeUnit.toString(16).toUpperCase();
}
export function toUTF16(emoji: string): string {
  let codePoint = emoji.codePointAt(0);
  if (!codePoint) {
    return '';
  }

  if (codePoint <= 0xffff) {
    return u(codePoint);
  }
  codePoint -= 0x10000;

  // Shift right to get to most significant 10 bits
  const leadSurrogate = 0xd800 + (codePoint >> 10);

  // Mask to get least significant 10 bits
  const tailSurrogate = 0xdc00 + (codePoint & TEN_BITS);

  return u(leadSurrogate) + u(tailSurrogate);
}

export function calcLimitSkip(
  defaultLimit: number,
  limit?: number,
  skip?: number,
): [number, number | undefined] {
  return [
    typeof limit === 'number' && limit > 0 ? limit : defaultLimit,
    typeof skip === 'number' && skip > 0 ? skip : undefined,
  ];
}

export type ListHeaderPropsT = {
  limitNum?: number;
  skipNum?: number;
  showId?: boolean;
  showDeleted?: boolean;
  showArchived?: boolean;
  startDateTime?: string;
  endDateTime?: string;
  query?: string;
  ctgQuery?: string;
  sbcQuery?: string;
  ctgQueryTitle?: string;
  sbcQueryTitle?: string;
  ctgQueryDescr?: string;
  sbcQueryDescr?: string;
  ntQueryText?: string;
  ntQueryNumber?: string | number;
  ntQueryNumberGreaterThan?: string | number;
  ntQueryNumberGreaterThanOrEq?: string | number;
  ntQueryNumberLessThan?: string | number;
  ntQueryNumberLessThanOrEq?: string | number;
  ctgQueryIdGreaterThan?: string | number;
  ctgQueryIdGreaterThanOrEq?: string | number;
  ctgQueryIdLessThan?: string | number;
  ctgQueryIdLessThanOrEq?: string | number;
  sbcQueryIdGreaterThan?: string | number;
  sbcQueryIdGreaterThanOrEq?: string | number;
  sbcQueryIdLessThan?: string | number;
  sbcQueryIdLessThanOrEq?: string | number;
  ntQueryIdGreaterThan?: string | number;
  ntQueryIdGreaterThanOrEq?: string | number;
  ntQueryIdLessThan?: string | number;
  ntQueryIdLessThanOrEq?: string | number;
  ctgCount?: number;
  sbcCount?: number;
  ntCount?: number;
};

export function toListHeader(
  headerData: ListHeaderPropsT,
  toTranslate: ToTranslate | ToTranslateArr,
  lang?: LanguageEnum,
): ToTranslateDArr {
  return new ToTranslateDArr(
    [
      new ToTranslateArr(
        [
          headerData.limitNum !== undefined
            ? new ToTranslate(TrKey.LIST_HEADER_LIMIT, lang, headerData)
            : undefined,
          headerData.skipNum !== undefined
            ? new ToTranslate(TrKey.LIST_HEADER_SKIP, lang, headerData)
            : undefined,
          headerData.showId !== undefined
            ? new ToTranslate(TrKey.LIST_HEADER_SHOW_ID, lang, headerData)
            : undefined,
          headerData.showDeleted !== undefined
            ? new ToTranslate(TrKey.LIST_HEADER_SHOW_DEL, lang, headerData)
            : undefined,
          headerData.showArchived !== undefined
            ? new ToTranslate(TrKey.LIST_HEADER_SHOW_ARCH, lang, headerData)
            : undefined,
          headerData.startDateTime !== undefined
            ? new ToTranslate(TrKey.LIST_HEADER_START_DT, lang, headerData)
            : undefined,
          headerData.endDateTime !== undefined
            ? new ToTranslate(TrKey.LIST_HEADER_END_DT, lang, headerData)
            : undefined,
          headerData.query !== undefined
            ? new ToTranslate(TrKey.LIST_HEADER_QUERY, lang, headerData)
            : undefined,
          headerData.ctgQuery !== undefined
            ? new ToTranslate(TrKey.LIST_HEADER_CTG_QUERY, lang, headerData)
            : undefined,
          headerData.sbcQuery !== undefined
            ? new ToTranslate(TrKey.LIST_HEADER_SBC_QUERY, lang, headerData)
            : undefined,
          headerData.ctgQueryTitle !== undefined
            ? new ToTranslate(
                TrKey.LIST_HEADER_CTG_QUERY_TITLE,
                lang,
                headerData,
              )
            : undefined,
          headerData.ctgQueryDescr !== undefined
            ? new ToTranslate(
                TrKey.LIST_HEADER_CTG_QUERY_DESCR,
                lang,
                headerData,
              )
            : undefined,
          headerData.sbcQueryTitle !== undefined
            ? new ToTranslate(
                TrKey.LIST_HEADER_SBC_QUERY_TITLE,
                lang,
                headerData,
              )
            : undefined,
          headerData.sbcQueryDescr !== undefined
            ? new ToTranslate(
                TrKey.LIST_HEADER_SBC_QUERY_DESCR,
                lang,
                headerData,
              )
            : undefined,
          headerData.ntQueryText !== undefined
            ? new ToTranslate(TrKey.LIST_HEADER_NT_QUERY_TEXT, lang, headerData)
            : undefined,
          headerData.ntQueryNumber !== undefined
            ? new ToTranslate(
                TrKey.LIST_HEADER_NT_QUERY_NUMBER,
                lang,
                headerData,
              )
            : undefined,
          headerData.ntQueryNumberGreaterThan !== undefined
            ? new ToTranslate(
                TrKey.LIST_HEADER_NT_NUMBER_GREATER_THAN,
                lang,
                headerData,
              )
            : undefined,
          headerData.ntQueryNumberGreaterThanOrEq !== undefined
            ? new ToTranslate(
                TrKey.LIST_HEADER_NT_NUMBER_GREATER_THAN_OR_EQUAL,
                lang,
                headerData,
              )
            : undefined,
          headerData.ntQueryNumberLessThan !== undefined
            ? new ToTranslate(
                TrKey.LIST_HEADER_NT_NUMBER_LESS_THAN,
                lang,
                headerData,
              )
            : undefined,
          headerData.ntQueryNumberLessThanOrEq !== undefined
            ? new ToTranslate(
                TrKey.LIST_HEADER_NT_NUMBER_LESS_THAN_OR_EQUAL,
                lang,
                headerData,
              )
            : undefined,
          headerData.ctgQueryIdGreaterThan !== undefined
            ? new ToTranslate(
                TrKey.LIST_HEADER_CTG_ID_GREATER_THAN,
                lang,
                headerData,
              )
            : undefined,
          headerData.ctgQueryIdGreaterThanOrEq !== undefined
            ? new ToTranslate(
                TrKey.LIST_HEADER_CTG_ID_GREATER_THAN_OR_EQUAL,
                lang,
                headerData,
              )
            : undefined,
          headerData.ctgQueryIdLessThan !== undefined
            ? new ToTranslate(
                TrKey.LIST_HEADER_CTG_ID_LESS_THAN,
                lang,
                headerData,
              )
            : undefined,
          headerData.ctgQueryIdLessThanOrEq !== undefined
            ? new ToTranslate(
                TrKey.LIST_HEADER_CTG_ID_LESS_THAN_OR_EQUAL,
                lang,
                headerData,
              )
            : undefined,
          headerData.sbcQueryIdGreaterThan !== undefined
            ? new ToTranslate(
                TrKey.LIST_HEADER_SBC_ID_GREATER_THAN,
                lang,
                headerData,
              )
            : undefined,
          headerData.sbcQueryIdGreaterThanOrEq !== undefined
            ? new ToTranslate(
                TrKey.LIST_HEADER_SBC_ID_GREATER_THAN_OR_EQUAL,
                lang,
                headerData,
              )
            : undefined,
          headerData.sbcQueryIdLessThan !== undefined
            ? new ToTranslate(
                TrKey.LIST_HEADER_SBC_ID_LESS_THAN,
                lang,
                headerData,
              )
            : undefined,
          headerData.sbcQueryIdLessThanOrEq !== undefined
            ? new ToTranslate(
                TrKey.LIST_HEADER_SBC_ID_LESS_THAN_OR_EQUAL,
                lang,
                headerData,
              )
            : undefined,
          headerData.ntQueryIdGreaterThan !== undefined
            ? new ToTranslate(
                TrKey.LIST_HEADER_NT_ID_GREATER_THAN,
                lang,
                headerData,
              )
            : undefined,
          headerData.ntQueryIdGreaterThanOrEq !== undefined
            ? new ToTranslate(
                TrKey.LIST_HEADER_NT_ID_GREATER_THAN_OR_EQUAL,
                lang,
                headerData,
              )
            : undefined,
          headerData.ntQueryIdLessThan !== undefined
            ? new ToTranslate(
                TrKey.LIST_HEADER_NT_ID_LESS_THAN,
                lang,
                headerData,
              )
            : undefined,
          headerData.ntQueryIdLessThanOrEq !== undefined
            ? new ToTranslate(
                TrKey.LIST_HEADER_NT_ID_LESS_THAN_OR_EQUAL,
                lang,
                headerData,
              )
            : undefined,
          typeof headerData.ctgCount === 'number' && headerData.ctgCount > 0
            ? new ToTranslate(TrKey.LIST_HEADER_CTG_COUNT, lang, headerData)
            : undefined,
          typeof headerData.sbcCount === 'number' && headerData.sbcCount > 0
            ? new ToTranslate(TrKey.LIST_HEADER_SBC_COUNT, lang, headerData)
            : undefined,
          typeof headerData.ntCount === 'number' && headerData.ntCount > 0
            ? new ToTranslate(TrKey.LIST_HEADER_NT_COUNT, lang, headerData)
            : undefined,
        ].filter(Boolean) as ToTranslate[],
        undefined,
        '\n',
      ),
      toTranslate instanceof ToTranslateArr
        ? toTranslate
        : new ToTranslateArr([toTranslate]),
    ],
    undefined,
    '\n',
  );
}

export function toStatisticSumm(
  headerData: Record<string, unknown>,
  textOrToTranslate: string | ToTranslate,
  balanceObj: {
    endDateTime: string;
    balance: string;
  },
  lang?: LanguageEnum,
): ToTranslateDArr {
  const toTranslateArr = [
    new ToTranslate(TrKey.CALC_BALANCE, lang, {
      endDateTime: balanceObj.endDateTime,
      balance: balanceObj.balance,
    }),
  ];
  if (textOrToTranslate) {
    if (typeof textOrToTranslate === 'string') {
      toTranslateArr.unshift(
        new ToTranslate(TrKey.CALC_SUMMARY, lang, {
          text: textOrToTranslate,
        }),
      );
    } else {
      toTranslateArr.unshift(textOrToTranslate);
    }
  }
  return toListHeader(
    headerData,
    new ToTranslateArr(toTranslateArr, undefined, '\n'),
    lang,
  );
}

export function printSettings({
  dbUserLang,
  userId,
  peerId,
  quota,
  languageCode,
  timeZone,
  weekStartsOn,
}: {
  dbUserLang: LanguageEnum;
  userId: string;
  peerId: string;
  quota?: number;
  languageCode: LanguageEnum;
  timeZone: string;
  weekStartsOn: WeekStartsOn;
}): ToTranslate {
  return new ToTranslate(TrKey.SETTINGS, dbUserLang, {
    botVersion: getPackageVersion(),
    userId,
    peerId,
    quota,
    languageCode,
    timeZone,
    weekStartsOn,
  });
}
/* eslint-disable @typescript-eslint/no-explicit-any */
export function extendOrClone<T>(to: any, from: any): T {
  if (from) {
    if (typeof from === 'object') {
      Object.keys(from).forEach((key) => {
        const value = from[key];
        if (Array.isArray(value)) {
          to[key] = value.map((v) => extendOrClone({}, v));
        } else if (value instanceof Date) {
          to[key] = new Date(value.getTime());
        } else if (
          typeof value === 'object' &&
          !(value instanceof RegExp) &&
          value !== null
        ) {
          to[key] = {};
          extendOrClone(to[key], value);
        } else {
          to[key] = value;
        }
      });
    } else {
      return from;
    }
  }

  return to;
}
/* eslint-enable @typescript-eslint/no-explicit-any */
export function stringOrNull(toCheck: string | number | null | undefined) {
  if (['string', 'number'].includes(typeof toCheck)) {
    return String(toCheck);
  }
  return null;
}
