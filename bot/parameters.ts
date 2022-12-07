import { isValid } from 'date-fns';
import { CategoryTypeEnum } from '../db/models/categoryModel';

import { TrKey } from '../i18n/keys';
import { LanguageEnum, ToTranslate } from '../i18n/i18n';
import {
  parseUserDateToUTC,
  parseUserTimeToUTC,
  parseUserDateTimeToUTC,
} from './datetime';
import { getBotCommands } from './helpers';
import { printObject } from './print';

export enum CommandParameterName {
  limit = 'l',
  skip = 's',
  showId = 'show_id',
  showDeleted = 'show_del',
  showArchived = 'show_arch',
  botFather = 'bf',
  ctgId = 'ctg_id',
  ctgType = 'ctg_type',
  ctgTitle = 'ctg_t',
  sbcId = 'sbc_id',
  sbcTitle = 'sbc_t',
  ctgDescription = 'ctg_descr',
  sbcDescription = 'sbc_descr',
  query = 'q',
  ctgQuery = 'ctg_q',
  sbcQuery = 'sbc_q',
  ctgQueryTitle = 'ctg_qt',
  sbcQueryTitle = 'sbc_qt',
  ctgQueryDescr = 'ctg_qd',
  sbcQueryDescr = 'sbc_qd',
  ntQueryText = 'nt_qt',
  ntQueryNumber = 'nt_qn',
  ntQueryNumberGreaterThan = 'nt_qn_gt',
  ntQueryNumberGreaterThanOrEq = 'nt_qn_gte',
  ntQueryNumberLessThan = 'nt_qn_lt',
  ntQueryNumberLessThanOrEq = 'nt_qn_lte',
  ctgQueryIdGreaterThan = 'ctg_qid_gt',
  ctgQueryIdGreaterThanOrEq = 'ctg_qid_gte',
  ctgQueryIdLessThan = 'ctg_qid_lt',
  ctgQueryIdLessThanOrEq = 'ctg_qid_lte',
  sbcQueryIdGreaterThan = 'sbc_qid_gt',
  sbcQueryIdGreaterThanOrEq = 'sbc_qid_gte',
  sbcQueryIdLessThan = 'sbc_qid_lt',
  sbcQueryIdLessThanOrEq = 'sbc_qid_lte',
  ntQueryIdGreaterThan = 'nt_qid_gt',
  ntQueryIdGreaterThanOrEq = 'nt_qid_gte',
  ntQueryIdLessThan = 'nt_qid_lt',
  ntQueryIdLessThanOrEq = 'nt_qid_lte',
  date = 'd',
  startDate = 's_d',
  endDate = 'e_d',
  relativeDay = 'rd',
  relativeMonth = 'rm',
  relativeYear = 'ry',
  time = 't',
  datetime = 'dt',
  command = 'cmd',
  ntId = 'nt_id',
  ntText = 'nt_t',
  ntNumber = 'nt_n',
}

export enum CommandParseType {
  bool,
  float,
  int,
  intPositive,
  str,
  date,
  time,
  datetime,
  query,
}

const SPACE_SPLITTER = /\s+/;
type TxtSplitter = RegExp | string;

export function safeSplitString(
  message: string,
  splitter: TxtSplitter = SPACE_SPLITTER,
  filterEmpty = true,
): string[] {
  let parts: Array<string> = [];
  if (typeof message === 'string') {
    parts = message.trim().split(splitter);
    if (filterEmpty) {
      parts = parts.filter((str): boolean => Boolean(str));
    }
  }
  return parts;
}

export function safeSplitString2(
  message: string,
  splitter: TxtSplitter = SPACE_SPLITTER,
  filterEmpty = true,
): string[] {
  let parts: Array<string> = [];
  if (typeof message === 'string') {
    message = message.trim();
    parts = [message];
    const matched = message.match(splitter);
    if (matched && typeof matched.index === 'number' && matched.index > -1) {
      const endParamsIdx = matched.index + matched[0].length;
      parts = [
        message.substring(0, matched.index),
        message.substring(endParamsIdx),
      ];
    }
  }
  if (filterEmpty) {
    parts = parts.filter((str): boolean => Boolean(str));
  }
  return parts;
}

function safeSplitStringRecursive(
  repeat: number,
  message: string,
  splitter: TxtSplitter = SPACE_SPLITTER,
  filterEmpty = true,
): string[] {
  let parts: Array<string> = [];
  for (let i = 1; i <= repeat; i++) {
    const [first, rest] = safeSplitString2(message, splitter, filterEmpty);
    message = rest || '';
    parts.push(first || '');
    if (i === repeat) {
      parts.push(message);
    }
  }
  if (filterEmpty) {
    parts = parts.filter((str): boolean => Boolean(str));
  }
  return parts;
}

export function safeSplitString3(
  message: string,
  splitter: TxtSplitter = SPACE_SPLITTER,
  filterEmpty?: boolean,
): string[] {
  return safeSplitStringRecursive(2, message, splitter, filterEmpty);
}

export function safeSplitString4(
  message: string,
  splitter: TxtSplitter = SPACE_SPLITTER,
  filterEmpty?: boolean,
): string[] {
  return safeSplitStringRecursive(3, message, splitter, filterEmpty);
}

export const PARAMS_EQ = '=';

const paramsPattern = /\[([^\]]*\=[^\]]*)+\]/;
const eachParamsPattern =
  /[^=|^\[|^\]|^\s]+\=([^=|^\[|^\]|^\s|^\"]+|("[^=|^\[|^\]|^\"]*"){1})/g;

function asteriskString(): string {
  return '([[:alnum:]_]|[^[:alnum:]_])*';
}

function cleanValue(str: string): string {
  return str.replace(/\*+/g, asteriskString());
}

export function prepareQuery(str: string): string {
  return cleanValue(str);
}

type RawParam = {
  key: string;
  value: string;
};

export function detectRawParams(msg: string): {
  rawParams: RawParam[];
  restParts: string[];
  detectedPramsPattern: boolean;
} {
  const restParts: Array<string> = [];
  const rawParams: Array<RawParam> = [];
  const matched = msg.match(paramsPattern);
  let detectedPramsPattern = false;
  if (matched && typeof matched.index === 'number' && matched.index > -1) {
    detectedPramsPattern = true;
    const paramsMsg = matched[1];
    const endParamsIdx = matched.index + paramsMsg.length + 2;
    restParts.push(msg.substring(0, matched.index));
    restParts.push(msg.substring(endParamsIdx));
    const paramsMatched = paramsMsg.match(eachParamsPattern);
    if (Array.isArray(paramsMatched)) {
      paramsMatched.map((paramsMatch) => {
        const eqSplitted = safeSplitString2(paramsMatch, PARAMS_EQ);
        if (Array.isArray(eqSplitted)) {
          rawParams.push({ key: eqSplitted[0], value: eqSplitted[1] });
        }
      });
    }
  }
  return { rawParams, restParts, detectedPramsPattern };
}

export function getErrorProneStrings(): string[] {
  return [
    CommandParameterName.limit,
    CommandParameterName.skip,
    CommandParameterName.showId,
    CommandParameterName.showDeleted,
    CommandParameterName.showArchived,
    CommandParameterName.query,
    CommandParameterName.ctgType,
    CommandParameterName.date,
    CommandParameterName.time,
  ].map((cpName): string => `${cpName}-`);
}

export function hasErrorProneString(msgParts: string[]): boolean {
  const errorProneStrings = getErrorProneStrings();
  return Boolean(
    msgParts.filter((msgPart): boolean => {
      return Boolean(
        errorProneStrings.filter((cmdErr): boolean =>
          msgPart.startsWith(cmdErr),
        ).length,
      );
    }).length,
  );
}

export function generateInvalidTitles(): string {
  return getErrorProneStrings().join(', ');
}

export interface CommandParameter {
  valueType: CommandParseType;
  possibleValues?: string[];
  errorKey: TrKey;
  errorLang: LanguageEnum;
}

class CombinedDBValue {
  constructor(public parsedValue: string, public dbValue: string) {}
}

function tryDetectParameter({
  parName,
  parValue,
  detectParameter,
  dbUserTimeZone,
  rawParams,
}: {
  parName: string;
  parValue: string;
  detectParameter: CommandParameter;
  dbUserTimeZone: string;
  rawParams: Array<RawParam>;
}): ToTranslate | number | boolean | string | Date | CombinedDBValue {
  const findRawParam = (cpn: CommandParameterName): RawParam | undefined =>
    rawParams.find((rawPar) => rawPar.key === cpn);
  switch (detectParameter.valueType) {
    case CommandParseType.int: {
      const numValue = Number(parValue);
      if (
        Number.isNaN(numValue) ||
        !Number.isFinite(numValue) ||
        !Number.isSafeInteger(numValue)
      ) {
        return new ToTranslate(
          detectParameter.errorKey,
          detectParameter.errorLang,
          {
            parName,
            parValue,
          },
        );
      }
      return numValue;
    }
    case CommandParseType.intPositive: {
      const numValue = Number(parValue);
      let error = false;
      if (!Number.isSafeInteger(numValue)) {
        error = true;
      } else if (numValue < 1) {
        error = true;
      }
      if (error) {
        return new ToTranslate(
          detectParameter.errorKey,
          detectParameter.errorLang,
          {
            parName,
            parValue,
          },
        );
      }
      return numValue;
    }
    case CommandParseType.float: {
      parValue = parValue.replace(',', '.');
      const numValue = Number(parValue);
      if (Number.isNaN(numValue) || !Number.isFinite(numValue)) {
        return new ToTranslate(
          detectParameter.errorKey,
          detectParameter.errorLang,
          {
            parName,
            parValue,
          },
        );
      }
      return numValue;
    }
    case CommandParseType.bool:
      if (!['t', 'f'].includes(parValue)) {
        return new ToTranslate(
          detectParameter.errorKey,
          detectParameter.errorLang,
          {
            parName,
            parValue,
          },
        );
      }
      return parValue === 't';
    case CommandParseType.str:
      if (
        detectParameter.possibleValues &&
        !detectParameter.possibleValues.includes(parValue)
      ) {
        return new ToTranslate(
          detectParameter.errorKey,
          detectParameter.errorLang,
          {
            parName,
            parValues: printObject(detectParameter.possibleValues),
          },
        );
      } else if (!parValue) {
        return new ToTranslate(
          detectParameter.errorKey,
          detectParameter.errorLang,
          {
            parName,
            parValue,
          },
        );
      }
      return parValue;
    case CommandParseType.query:
      if (parValue.startsWith('"') && parValue.endsWith('"')) {
        parValue = parValue.substring(1, parValue.length - 1);
      }
      if (!parValue) {
        return new ToTranslate(
          detectParameter.errorKey,
          detectParameter.errorLang,
          {
            parName,
            parValue,
          },
        );
      }
      return new CombinedDBValue(parValue, prepareQuery(parValue));
    case CommandParseType.date: {
      const timeRawParam = findRawParam(CommandParameterName.time);
      let parsedDate = parseUserDateToUTC(parValue, dbUserTimeZone);
      if (timeRawParam) {
        const parsedTime = parseUserTimeToUTC(
          timeRawParam.value,
          dbUserTimeZone,
        );
        if (parsedTime && isValid(parsedTime)) {
          parsedDate = parseUserDateTimeToUTC(
            `${parValue} ${timeRawParam.value}`,
            dbUserTimeZone,
          );
        }
      }
      if (parsedDate && isValid(parsedDate)) {
        return parsedDate;
      } else {
        return new ToTranslate(
          detectParameter.errorKey,
          detectParameter.errorLang,
          {
            parName,
            parValue,
          },
        );
      }
    }
    case CommandParseType.time: {
      const dateRawParam = findRawParam(CommandParameterName.date);
      let parsedTime = parseUserTimeToUTC(parValue, dbUserTimeZone);
      if (dateRawParam) {
        const parsedDate = parseUserTimeToUTC(
          dateRawParam.value,
          dbUserTimeZone,
        );
        if (parsedDate && isValid(parsedDate)) {
          parsedTime = parseUserDateTimeToUTC(
            `${dateRawParam.value} ${parValue}`,
            dbUserTimeZone,
          );
        }
      }
      if (parsedTime && isValid(parsedTime)) {
        return parsedTime;
      } else {
        return new ToTranslate(
          detectParameter.errorKey,
          detectParameter.errorLang,
          {
            parName,
            parValue,
          },
        );
      }
    }
    case CommandParseType.datetime: {
      if (parValue.startsWith('"') && parValue.endsWith('"')) {
        parValue = parValue.substring(1, parValue.length - 1);
      }
      const parsedDate = parseUserDateTimeToUTC(parValue, dbUserTimeZone);
      if (parsedDate && isValid(parsedDate)) {
        return parsedDate;
      } else {
        return new ToTranslate(
          detectParameter.errorKey,
          detectParameter.errorLang,
          {
            parName,
            parValue,
          },
        );
      }
    }
    default:
      throw new Error('Unrecognized parameter type provided');
  }
}

export type DetectedParameters = {
  [key in CommandParameterName]: string | number | boolean | Date;
};

export type DetectedRawParameters = {
  [key in CommandParameterName]: string | undefined;
};

export interface ToDetect {
  parName: CommandParameterName;
  parType: CommandParseType;
  errKey: TrKey;
  possibleValues?: string[];
  conflictWith?: Array<CommandParameterName>;
  biggerThan?: Array<CommandParameterName>;
  lessThan?: Array<CommandParameterName>;
}

type CommonDetectedParams = {
  detectedParams: DetectedParameters;
  detectedDBParams: DetectedParameters;
  detectedRawParams: DetectedRawParameters;
  rest: string;
  detectedPramsPattern: boolean;
  detectedPramsFound: boolean;
};

export function detectCMDParameters({
  msg,
  toDetectArr,
  dbUserLang,
  dbUserTimeZone,
}: {
  msg: string;
  toDetectArr: ToDetect[];
  dbUserLang: LanguageEnum;
  dbUserTimeZone: string;
}): CommonDetectedParams | ToTranslate {
  const { rawParams, restParts, detectedPramsPattern } = detectRawParams(msg);
  const detectedParams: DetectedParameters = {} as DetectedParameters;
  const detectedDBParams: DetectedParameters = {} as DetectedParameters;
  const detectedRawParams: DetectedRawParameters = {} as DetectedRawParameters;
  let detectedPramsFound = false;
  for (const rawParameter of rawParams) {
    const toDetect = toDetectArr.find(
      (td): boolean => td.parName === rawParameter.key,
    );
    if (toDetect) {
      const result = tryDetectParameter({
        parName: rawParameter.key,
        parValue: rawParameter.value,
        detectParameter: {
          valueType: toDetect.parType,
          errorLang: dbUserLang,
          errorKey: toDetect.errKey,
          possibleValues: toDetect.possibleValues,
        },
        dbUserTimeZone,
        rawParams,
      });
      if (result instanceof ToTranslate) {
        return result;
      }
      if (detectedParams[toDetect.parName] !== undefined) {
        return new ToTranslate(TrKey.PARAM_DUPLICATE_ERROR, dbUserLang, {
          parName: rawParameter.key,
        });
      }
      if (result instanceof CombinedDBValue) {
        detectedParams[toDetect.parName] = result.parsedValue;
        detectedDBParams[toDetect.parName] = result.dbValue;
      } else {
        detectedParams[toDetect.parName] = result;
      }
      detectedRawParams[toDetect.parName] = rawParameter.value;
      detectedPramsFound = true;
    }
  }
  for (const rawParameter of rawParams) {
    const toDetect = toDetectArr.find(
      (td): boolean => td.parName === rawParameter.key,
    );
    if (toDetect) {
      if (Array.isArray(toDetect.conflictWith)) {
        const conflictParName = toDetect.conflictWith.find(
          (conflictParName) => detectedRawParams[conflictParName],
        );
        if (conflictParName) {
          return new ToTranslate(TrKey.PARAM_CONFLICT_ERROR, dbUserLang, {
            parName: rawParameter.key,
            conflictParName,
          });
        }
      }
      if (Array.isArray(toDetect.biggerThan)) {
        const conflictParName = toDetect.biggerThan.find(
          (parName) => detectedParams[parName],
        );
        if (
          typeof conflictParName !== 'undefined' &&
          detectedParams[toDetect.parName] <= detectedParams[conflictParName]
        ) {
          return new ToTranslate(TrKey.PARAM_CONFLICT_LESS_ERROR, dbUserLang, {
            parName: rawParameter.key,
            conflictParName,
          });
        }
      }
      if (Array.isArray(toDetect.lessThan)) {
        const conflictParName = toDetect.lessThan.find(
          (parName) => detectedParams[parName],
        );
        if (
          typeof conflictParName !== 'undefined' &&
          detectedParams[toDetect.parName] >= detectedParams[conflictParName]
        ) {
          return new ToTranslate(
            TrKey.PARAM_CONFLICT_BIGGER_ERROR,
            dbUserLang,
            {
              parName: rawParameter.key,
              conflictParName,
            },
          );
        }
      }
    }
  }
  return {
    detectedParams,
    detectedDBParams,
    detectedRawParams,
    rest: rawParams.length ? restParts.join('') : msg,
    detectedPramsFound,
    detectedPramsPattern,
  };
}

type NtListCommonDetectedParams = {
  [CommandParameterName.limit]?: number;
  [CommandParameterName.skip]?: number;
  [CommandParameterName.date]?: Date;
  [CommandParameterName.startDate]?: Date;
  [CommandParameterName.endDate]?: Date;
  [CommandParameterName.showId]?: boolean;
  [CommandParameterName.showDeleted]?: boolean;
  [CommandParameterName.showArchived]?: boolean;
  [CommandParameterName.query]?: string;
  [CommandParameterName.ctgQuery]?: string;
  [CommandParameterName.sbcQuery]?: string;
  [CommandParameterName.ctgQueryTitle]?: string;
  [CommandParameterName.sbcQueryTitle]?: string;
  [CommandParameterName.ctgQueryDescr]?: string;
  [CommandParameterName.sbcQueryDescr]?: string;
  [CommandParameterName.ntQueryText]?: string;
  [CommandParameterName.ntQueryNumber]?: number;
  [CommandParameterName.ntQueryNumberGreaterThan]?: number;
  [CommandParameterName.ntQueryNumberGreaterThanOrEq]?: number;
  [CommandParameterName.ntQueryNumberLessThan]?: number;
  [CommandParameterName.ntQueryNumberLessThanOrEq]?: number;
  [CommandParameterName.ctgQueryIdGreaterThan]?: number;
  [CommandParameterName.ctgQueryIdGreaterThanOrEq]?: number;
  [CommandParameterName.ctgQueryIdLessThan]?: number;
  [CommandParameterName.ctgQueryIdLessThanOrEq]?: number;
  [CommandParameterName.sbcQueryIdGreaterThan]?: number;
  [CommandParameterName.sbcQueryIdGreaterThanOrEq]?: number;
  [CommandParameterName.sbcQueryIdLessThan]?: number;
  [CommandParameterName.sbcQueryIdLessThanOrEq]?: number;
  [CommandParameterName.ntQueryIdGreaterThan]?: number;
  [CommandParameterName.ntQueryIdGreaterThanOrEq]?: number;
  [CommandParameterName.ntQueryIdLessThan]?: number;
  [CommandParameterName.ntQueryIdLessThanOrEq]?: number;
  [CommandParameterName.relativeDay]?: number;
  [CommandParameterName.relativeMonth]?: number;
  [CommandParameterName.relativeYear]?: number;
};

type NtListDetectedParams = Pick<
  CommonDetectedParams,
  Exclude<keyof CommonDetectedParams, 'detectedParams' | 'detectedDBParams'>
> & {
  detectedParams: NtListCommonDetectedParams;
  detectedDBParams: NtListCommonDetectedParams;
};

export function detectCMDNtListParameters(
  msg: string,
  dbUserLang: LanguageEnum,
  dbUserTimeZone: string,
): NtListDetectedParams | ToTranslate {
  return detectCMDParameters({
    msg,
    toDetectArr: [
      {
        parName: CommandParameterName.limit,
        parType: CommandParseType.intPositive,
        errKey: TrKey.PARAM_TYPE_INT_POS_ERROR,
      },
      {
        parName: CommandParameterName.skip,
        parType: CommandParseType.intPositive,
        errKey: TrKey.PARAM_TYPE_INT_POS_ERROR,
      },
      {
        parName: CommandParameterName.date,
        parType: CommandParseType.date,
        errKey: TrKey.PARAM_TYPE_DATETIME_ERROR,
        conflictWith: [
          CommandParameterName.startDate,
          CommandParameterName.endDate,
          CommandParameterName.relativeDay,
          CommandParameterName.relativeMonth,
          CommandParameterName.relativeYear,
        ],
      },
      {
        parName: CommandParameterName.startDate,
        parType: CommandParseType.date,
        errKey: TrKey.PARAM_TYPE_DATETIME_ERROR,
        conflictWith: [
          CommandParameterName.date,
          CommandParameterName.relativeDay,
          CommandParameterName.relativeMonth,
          CommandParameterName.relativeYear,
        ],
        lessThan: [CommandParameterName.endDate],
      },
      {
        parName: CommandParameterName.endDate,
        parType: CommandParseType.date,
        errKey: TrKey.PARAM_TYPE_DATETIME_ERROR,
        conflictWith: [
          CommandParameterName.date,
          CommandParameterName.relativeDay,
          CommandParameterName.relativeMonth,
          CommandParameterName.relativeYear,
        ],
        biggerThan: [CommandParameterName.startDate],
      },
      {
        parName: CommandParameterName.showId,
        parType: CommandParseType.bool,
        errKey: TrKey.PARAM_TYPE_BOOL_ERROR,
      },
      {
        parName: CommandParameterName.showDeleted,
        parType: CommandParseType.bool,
        errKey: TrKey.PARAM_TYPE_BOOL_ERROR,
      },
      {
        parName: CommandParameterName.showArchived,
        parType: CommandParseType.bool,
        errKey: TrKey.PARAM_TYPE_BOOL_ERROR,
      },
      {
        parName: CommandParameterName.query,
        parType: CommandParseType.query,
        errKey: TrKey.PARAM_TYPE_QUERY_ERROR,
        conflictWith: [
          CommandParameterName.ctgQuery,
          CommandParameterName.sbcQuery,
          CommandParameterName.ctgQueryTitle,
          CommandParameterName.ctgQueryDescr,
          CommandParameterName.sbcQueryTitle,
          CommandParameterName.sbcQueryDescr,
          CommandParameterName.ntQueryText,
        ],
      },
      {
        parName: CommandParameterName.ctgQuery,
        parType: CommandParseType.query,
        errKey: TrKey.PARAM_TYPE_QUERY_ERROR,
        conflictWith: [CommandParameterName.query],
      },
      {
        parName: CommandParameterName.sbcQuery,
        parType: CommandParseType.query,
        errKey: TrKey.PARAM_TYPE_QUERY_ERROR,
        conflictWith: [CommandParameterName.query],
      },
      {
        parName: CommandParameterName.ctgQueryTitle,
        parType: CommandParseType.query,
        errKey: TrKey.PARAM_TYPE_QUERY_ERROR,
        conflictWith: [
          CommandParameterName.query,
          CommandParameterName.ctgQuery,
        ],
      },
      {
        parName: CommandParameterName.sbcQueryTitle,
        parType: CommandParseType.query,
        errKey: TrKey.PARAM_TYPE_QUERY_ERROR,
        conflictWith: [
          CommandParameterName.query,
          CommandParameterName.sbcQuery,
        ],
      },
      {
        parName: CommandParameterName.ctgQueryDescr,
        parType: CommandParseType.query,
        errKey: TrKey.PARAM_TYPE_QUERY_ERROR,
        conflictWith: [
          CommandParameterName.query,
          CommandParameterName.ctgQuery,
        ],
      },
      {
        parName: CommandParameterName.sbcQueryDescr,
        parType: CommandParseType.query,
        errKey: TrKey.PARAM_TYPE_QUERY_ERROR,
        conflictWith: [
          CommandParameterName.query,
          CommandParameterName.sbcQuery,
        ],
      },
      {
        parName: CommandParameterName.ntQueryText,
        parType: CommandParseType.query,
        errKey: TrKey.PARAM_TYPE_QUERY_ERROR,
        conflictWith: [CommandParameterName.query],
      },
      {
        parName: CommandParameterName.ntQueryNumber,
        parType: CommandParseType.float,
        errKey: TrKey.PARAM_TYPE_FLOAT_ERROR,
        conflictWith: [
          CommandParameterName.ntQueryNumberGreaterThan,
          CommandParameterName.ntQueryNumberGreaterThanOrEq,
          CommandParameterName.ntQueryNumberLessThan,
          CommandParameterName.ntQueryNumberGreaterThan,
        ],
      },
      {
        parName: CommandParameterName.ntQueryNumberGreaterThan,
        parType: CommandParseType.float,
        errKey: TrKey.PARAM_TYPE_FLOAT_ERROR,
        conflictWith: [
          CommandParameterName.ntQueryNumberGreaterThanOrEq,
          CommandParameterName.ntQueryNumber,
        ],
      },
      {
        parName: CommandParameterName.ntQueryNumberGreaterThanOrEq,
        parType: CommandParseType.float,
        errKey: TrKey.PARAM_TYPE_FLOAT_ERROR,
        conflictWith: [
          CommandParameterName.ntQueryNumberGreaterThan,
          CommandParameterName.ntQueryNumber,
        ],
      },
      {
        parName: CommandParameterName.ntQueryNumberLessThan,
        parType: CommandParseType.float,
        errKey: TrKey.PARAM_TYPE_FLOAT_ERROR,
        conflictWith: [
          CommandParameterName.ntQueryNumberLessThanOrEq,
          CommandParameterName.ntQueryNumber,
        ],
      },
      {
        parName: CommandParameterName.ntQueryNumberLessThanOrEq,
        parType: CommandParseType.float,
        errKey: TrKey.PARAM_TYPE_FLOAT_ERROR,
        conflictWith: [
          CommandParameterName.ntQueryNumberLessThan,
          CommandParameterName.ntQueryNumber,
        ],
      },
      {
        parName: CommandParameterName.ctgQueryIdGreaterThan,
        parType: CommandParseType.intPositive,
        errKey: TrKey.PARAM_TYPE_INT_POS_ERROR,
        conflictWith: [CommandParameterName.ctgQueryIdGreaterThanOrEq],
      },
      {
        parName: CommandParameterName.ctgQueryIdGreaterThanOrEq,
        parType: CommandParseType.intPositive,
        errKey: TrKey.PARAM_TYPE_INT_POS_ERROR,
        conflictWith: [CommandParameterName.ctgQueryIdGreaterThan],
      },
      {
        parName: CommandParameterName.ctgQueryIdLessThan,
        parType: CommandParseType.intPositive,
        errKey: TrKey.PARAM_TYPE_INT_POS_ERROR,
        conflictWith: [CommandParameterName.ctgQueryIdLessThanOrEq],
      },
      {
        parName: CommandParameterName.ctgQueryIdLessThanOrEq,
        parType: CommandParseType.intPositive,
        errKey: TrKey.PARAM_TYPE_INT_POS_ERROR,
        conflictWith: [CommandParameterName.ctgQueryIdLessThan],
      },
      {
        parName: CommandParameterName.sbcQueryIdGreaterThan,
        parType: CommandParseType.intPositive,
        errKey: TrKey.PARAM_TYPE_INT_POS_ERROR,
        conflictWith: [CommandParameterName.sbcQueryIdGreaterThanOrEq],
      },
      {
        parName: CommandParameterName.sbcQueryIdGreaterThanOrEq,
        parType: CommandParseType.intPositive,
        errKey: TrKey.PARAM_TYPE_INT_POS_ERROR,
        conflictWith: [CommandParameterName.sbcQueryIdGreaterThan],
      },
      {
        parName: CommandParameterName.sbcQueryIdLessThan,
        parType: CommandParseType.intPositive,
        errKey: TrKey.PARAM_TYPE_INT_POS_ERROR,
        conflictWith: [CommandParameterName.sbcQueryIdLessThanOrEq],
      },
      {
        parName: CommandParameterName.sbcQueryIdLessThanOrEq,
        parType: CommandParseType.intPositive,
        errKey: TrKey.PARAM_TYPE_INT_POS_ERROR,
        conflictWith: [CommandParameterName.sbcQueryIdLessThan],
      },
      {
        parName: CommandParameterName.ntQueryIdGreaterThan,
        parType: CommandParseType.intPositive,
        errKey: TrKey.PARAM_TYPE_INT_POS_ERROR,
        conflictWith: [CommandParameterName.ntQueryIdGreaterThanOrEq],
      },
      {
        parName: CommandParameterName.ntQueryIdGreaterThanOrEq,
        parType: CommandParseType.intPositive,
        errKey: TrKey.PARAM_TYPE_INT_POS_ERROR,
        conflictWith: [CommandParameterName.ntQueryIdGreaterThan],
      },
      {
        parName: CommandParameterName.ntQueryIdLessThan,
        parType: CommandParseType.intPositive,
        errKey: TrKey.PARAM_TYPE_INT_POS_ERROR,
        conflictWith: [CommandParameterName.ntQueryIdLessThanOrEq],
      },
      {
        parName: CommandParameterName.ntQueryIdLessThanOrEq,
        parType: CommandParseType.intPositive,
        errKey: TrKey.PARAM_TYPE_INT_POS_ERROR,
        conflictWith: [CommandParameterName.ntQueryIdLessThan],
      },
      {
        parName: CommandParameterName.relativeDay,
        parType: CommandParseType.int,
        errKey: TrKey.PARAM_TYPE_INT_ERROR,
        conflictWith: [
          CommandParameterName.date,
          CommandParameterName.startDate,
          CommandParameterName.endDate,
          CommandParameterName.relativeMonth,
          CommandParameterName.relativeYear,
        ],
      },
      {
        parName: CommandParameterName.relativeMonth,
        parType: CommandParseType.int,
        errKey: TrKey.PARAM_TYPE_INT_ERROR,
        conflictWith: [
          CommandParameterName.date,
          CommandParameterName.startDate,
          CommandParameterName.endDate,
          CommandParameterName.relativeDay,
          CommandParameterName.relativeYear,
        ],
      },
      {
        parName: CommandParameterName.relativeYear,
        parType: CommandParseType.int,
        errKey: TrKey.PARAM_TYPE_INT_ERROR,
        conflictWith: [
          CommandParameterName.date,
          CommandParameterName.startDate,
          CommandParameterName.endDate,
          CommandParameterName.relativeDay,
          CommandParameterName.relativeMonth,
        ],
      },
    ],
    dbUserLang,
    dbUserTimeZone,
  }) as NtListDetectedParams | ToTranslate;
}

type StatCommonDetectedParams = {
  [CommandParameterName.query]?: string;
  [CommandParameterName.ctgQuery]?: string;
  [CommandParameterName.sbcQuery]?: string;
  [CommandParameterName.ctgQueryTitle]?: string;
  [CommandParameterName.sbcQueryTitle]?: string;
  [CommandParameterName.ctgQueryDescr]?: string;
  [CommandParameterName.sbcQueryDescr]?: string;
  [CommandParameterName.ntQueryText]?: string;
  [CommandParameterName.date]?: Date;
  [CommandParameterName.startDate]?: Date;
  [CommandParameterName.endDate]?: Date;
  [CommandParameterName.relativeDay]?: number;
  [CommandParameterName.relativeMonth]?: number;
  [CommandParameterName.relativeYear]?: number;
};

type StatDetectedParams = Pick<
  CommonDetectedParams,
  Exclude<keyof CommonDetectedParams, 'detectedParams'>
> & {
  detectedParams: StatCommonDetectedParams;
  detectedDBParams: StatCommonDetectedParams;
};

export function detectCMDStatParameters(
  msg: string,
  dbUserLang: LanguageEnum,
  dbUserTimeZone: string,
): StatDetectedParams | ToTranslate {
  return detectCMDParameters({
    msg,
    toDetectArr: [
      {
        parName: CommandParameterName.query,
        parType: CommandParseType.query,
        errKey: TrKey.PARAM_TYPE_QUERY_ERROR,
        conflictWith: [
          CommandParameterName.ctgQuery,
          CommandParameterName.sbcQuery,
          CommandParameterName.ctgQueryTitle,
          CommandParameterName.ctgQueryDescr,
          CommandParameterName.sbcQueryTitle,
          CommandParameterName.sbcQueryDescr,
          CommandParameterName.ntQueryText,
        ],
      },
      {
        parName: CommandParameterName.ctgQuery,
        parType: CommandParseType.query,
        errKey: TrKey.PARAM_TYPE_QUERY_ERROR,
        conflictWith: [CommandParameterName.query],
      },
      {
        parName: CommandParameterName.sbcQuery,
        parType: CommandParseType.query,
        errKey: TrKey.PARAM_TYPE_QUERY_ERROR,
        conflictWith: [CommandParameterName.query],
      },
      {
        parName: CommandParameterName.ctgQueryTitle,
        parType: CommandParseType.query,
        errKey: TrKey.PARAM_TYPE_QUERY_ERROR,
        conflictWith: [
          CommandParameterName.query,
          CommandParameterName.ctgQuery,
        ],
      },
      {
        parName: CommandParameterName.sbcQueryTitle,
        parType: CommandParseType.query,
        errKey: TrKey.PARAM_TYPE_QUERY_ERROR,
        conflictWith: [
          CommandParameterName.query,
          CommandParameterName.sbcQuery,
        ],
      },
      {
        parName: CommandParameterName.ctgQueryDescr,
        parType: CommandParseType.query,
        errKey: TrKey.PARAM_TYPE_QUERY_ERROR,
        conflictWith: [
          CommandParameterName.query,
          CommandParameterName.ctgQuery,
        ],
      },
      {
        parName: CommandParameterName.sbcQueryDescr,
        parType: CommandParseType.query,
        errKey: TrKey.PARAM_TYPE_QUERY_ERROR,
        conflictWith: [
          CommandParameterName.query,
          CommandParameterName.sbcQuery,
        ],
      },
      {
        parName: CommandParameterName.ntQueryText,
        parType: CommandParseType.query,
        errKey: TrKey.PARAM_TYPE_QUERY_ERROR,
        conflictWith: [CommandParameterName.query],
      },
      {
        parName: CommandParameterName.date,
        parType: CommandParseType.date,
        errKey: TrKey.PARAM_TYPE_DATETIME_ERROR,
        conflictWith: [
          CommandParameterName.startDate,
          CommandParameterName.endDate,
          CommandParameterName.relativeDay,
          CommandParameterName.relativeMonth,
          CommandParameterName.relativeYear,
        ],
      },
      {
        parName: CommandParameterName.startDate,
        parType: CommandParseType.date,
        errKey: TrKey.PARAM_TYPE_DATETIME_ERROR,
        conflictWith: [
          CommandParameterName.date,
          CommandParameterName.relativeDay,
          CommandParameterName.relativeMonth,
          CommandParameterName.relativeYear,
        ],
        lessThan: [CommandParameterName.endDate],
      },
      {
        parName: CommandParameterName.endDate,
        parType: CommandParseType.date,
        errKey: TrKey.PARAM_TYPE_DATETIME_ERROR,
        conflictWith: [
          CommandParameterName.date,
          CommandParameterName.relativeDay,
          CommandParameterName.relativeMonth,
          CommandParameterName.relativeYear,
        ],
        biggerThan: [CommandParameterName.startDate],
      },
      {
        parName: CommandParameterName.relativeDay,
        parType: CommandParseType.int,
        errKey: TrKey.PARAM_TYPE_INT_ERROR,
        conflictWith: [
          CommandParameterName.date,
          CommandParameterName.startDate,
          CommandParameterName.endDate,
          CommandParameterName.relativeMonth,
          CommandParameterName.relativeYear,
        ],
      },
      {
        parName: CommandParameterName.relativeMonth,
        parType: CommandParseType.int,
        errKey: TrKey.PARAM_TYPE_INT_ERROR,
        conflictWith: [
          CommandParameterName.date,
          CommandParameterName.startDate,
          CommandParameterName.endDate,
          CommandParameterName.relativeDay,
          CommandParameterName.relativeYear,
        ],
      },
      {
        parName: CommandParameterName.relativeYear,
        parType: CommandParseType.int,
        errKey: TrKey.PARAM_TYPE_INT_ERROR,
        conflictWith: [
          CommandParameterName.date,
          CommandParameterName.startDate,
          CommandParameterName.endDate,
          CommandParameterName.relativeDay,
          CommandParameterName.relativeMonth,
        ],
      },
    ],
    dbUserLang,
    dbUserTimeZone,
  }) as StatDetectedParams | ToTranslate;
}

type HelpDetectedParams = Pick<
  CommonDetectedParams,
  Exclude<keyof CommonDetectedParams, 'detectedParams'>
> & {
  detectedParams: {
    [CommandParameterName.botFather]?: boolean;
    [CommandParameterName.command]?: string;
  };
};

export function detectCMDHelpParameters(
  msg: string,
  dbUserLang: LanguageEnum,
  dbUserTimeZone: string,
): HelpDetectedParams | ToTranslate {
  return detectCMDParameters({
    msg,
    toDetectArr: [
      {
        parName: CommandParameterName.botFather,
        parType: CommandParseType.bool,
        errKey: TrKey.PARAM_TYPE_BOOL_ERROR,
      },
      {
        parName: CommandParameterName.command,
        parType: CommandParseType.str,
        errKey: TrKey.PARAM_TYPE_STR_MATCH_ERROR,
        possibleValues: getBotCommands(),
      },
    ],
    dbUserLang,
    dbUserTimeZone,
  }) as HelpDetectedParams | ToTranslate;
}

type NtAddDetectedParams = Pick<
  CommonDetectedParams,
  Exclude<keyof CommonDetectedParams, 'detectedParams'>
> & {
  detectedParams: {
    [CommandParameterName.date]?: Date;
    [CommandParameterName.time]?: Date;
    [CommandParameterName.datetime]?: Date;
    [CommandParameterName.relativeDay]?: number;
    [CommandParameterName.ntNumber]?: number;
    [CommandParameterName.ntText]?: string;
    [CommandParameterName.ctgId]?: number;
    [CommandParameterName.ctgTitle]?: string;
    [CommandParameterName.sbcId]?: number;
    [CommandParameterName.sbcTitle]?: string;
  };
};

export function detectCMDNtAddParams(
  msg: string,
  dbUserLang: LanguageEnum,
  dbUserTimeZone: string,
): NtAddDetectedParams | ToTranslate {
  return detectCMDParameters({
    msg,
    toDetectArr: [
      {
        parName: CommandParameterName.date,
        parType: CommandParseType.date,
        errKey: TrKey.PARAM_TYPE_DATE_ERROR,
        conflictWith: [
          CommandParameterName.datetime,
          CommandParameterName.relativeDay,
        ],
      },
      {
        parName: CommandParameterName.time,
        parType: CommandParseType.time,
        errKey: TrKey.PARAM_TYPE_TIME_ERROR,
        conflictWith: [CommandParameterName.datetime],
      },
      {
        parName: CommandParameterName.datetime,
        parType: CommandParseType.datetime,
        errKey: TrKey.PARAM_TYPE_DATETIME_ERROR,
        conflictWith: [
          CommandParameterName.date,
          CommandParameterName.time,
          CommandParameterName.relativeDay,
        ],
      },
      {
        parName: CommandParameterName.relativeDay,
        parType: CommandParseType.int,
        errKey: TrKey.PARAM_TYPE_INT_ERROR,
        conflictWith: [
          CommandParameterName.date,
          CommandParameterName.datetime,
        ],
      },
      {
        parName: CommandParameterName.ntNumber,
        parType: CommandParseType.float,
        errKey: TrKey.PARAM_TYPE_FLOAT_ERROR,
      },
      {
        parName: CommandParameterName.ntText,
        parType: CommandParseType.query,
        errKey: TrKey.PARAM_TYPE_QUERY_ERROR,
      },
      {
        parName: CommandParameterName.ctgId,
        parType: CommandParseType.intPositive,
        errKey: TrKey.PARAM_TYPE_INT_POS_ERROR,
        conflictWith: [
          CommandParameterName.ctgTitle,
          CommandParameterName.sbcId,
          CommandParameterName.sbcTitle,
        ],
      },
      {
        parName: CommandParameterName.ctgTitle,
        parType: CommandParseType.str,
        errKey: TrKey.PARAM_TYPE_STR_ERROR,
        conflictWith: [
          CommandParameterName.ctgId,
          CommandParameterName.sbcId,
          CommandParameterName.sbcTitle,
        ],
      },
      {
        parName: CommandParameterName.sbcId,
        parType: CommandParseType.intPositive,
        errKey: TrKey.PARAM_TYPE_INT_POS_ERROR,
        conflictWith: [
          CommandParameterName.sbcTitle,
          CommandParameterName.ctgId,
          CommandParameterName.ctgTitle,
        ],
      },
      {
        parName: CommandParameterName.sbcTitle,
        parType: CommandParseType.str,
        errKey: TrKey.PARAM_TYPE_STR_ERROR,
        conflictWith: [
          CommandParameterName.sbcId,
          CommandParameterName.ctgId,
          CommandParameterName.ctgTitle,
        ],
      },
    ],
    dbUserLang,
    dbUserTimeZone,
  }) as NtAddDetectedParams | ToTranslate;
}

type NtUpdDetectedParams = Pick<
  CommonDetectedParams,
  Exclude<keyof CommonDetectedParams, 'detectedParams'>
> & {
  detectedParams: {
    [CommandParameterName.ntId]: number;
    [CommandParameterName.date]?: Date;
    [CommandParameterName.time]?: Date;
    [CommandParameterName.datetime]?: Date;
    [CommandParameterName.relativeDay]?: number;
    [CommandParameterName.ntNumber]?: number;
    [CommandParameterName.ntText]?: string;
  };
};

export function detectCMDNtUpdParams(
  msg: string,
  dbUserLang: LanguageEnum,
  dbUserTimeZone: string,
): NtUpdDetectedParams | ToTranslate {
  return detectCMDParameters({
    msg,
    toDetectArr: [
      {
        parName: CommandParameterName.ntId,
        parType: CommandParseType.intPositive,
        errKey: TrKey.PARAM_TYPE_INT_POS_ERROR,
      },
      {
        parName: CommandParameterName.date,
        parType: CommandParseType.date,
        errKey: TrKey.PARAM_TYPE_DATE_ERROR,
        conflictWith: [
          CommandParameterName.datetime,
          CommandParameterName.relativeDay,
        ],
      },
      {
        parName: CommandParameterName.time,
        parType: CommandParseType.time,
        errKey: TrKey.PARAM_TYPE_TIME_ERROR,
        conflictWith: [CommandParameterName.datetime],
      },
      {
        parName: CommandParameterName.datetime,
        parType: CommandParseType.datetime,
        errKey: TrKey.PARAM_TYPE_DATETIME_ERROR,
        conflictWith: [
          CommandParameterName.date,
          CommandParameterName.time,
          CommandParameterName.relativeDay,
        ],
      },
      {
        parName: CommandParameterName.relativeDay,
        parType: CommandParseType.int,
        errKey: TrKey.PARAM_TYPE_INT_ERROR,
        conflictWith: [
          CommandParameterName.date,
          CommandParameterName.datetime,
        ],
      },
      {
        parName: CommandParameterName.ntNumber,
        parType: CommandParseType.float,
        errKey: TrKey.PARAM_TYPE_FLOAT_ERROR,
      },
      {
        parName: CommandParameterName.ntText,
        parType: CommandParseType.query,
        errKey: TrKey.PARAM_TYPE_QUERY_ERROR,
      },
    ],
    dbUserLang,
    dbUserTimeZone,
  }) as NtUpdDetectedParams | ToTranslate;
}

type CtgAddDetectedParams = Pick<
  CommonDetectedParams,
  Exclude<keyof CommonDetectedParams, 'detectedParams'>
> & {
  detectedParams: {
    [CommandParameterName.ctgType]?: CategoryTypeEnum;
    [CommandParameterName.ctgTitle]?: string;
    [CommandParameterName.ctgDescription]?: string;
  };
};

export function detectCMDCtgAddParams(
  msg: string,
  dbUserLang: LanguageEnum,
  dbUserTimeZone: string,
): CtgAddDetectedParams | ToTranslate {
  return detectCMDParameters({
    msg,
    toDetectArr: [
      {
        parName: CommandParameterName.ctgType,
        parType: CommandParseType.str,
        errKey: TrKey.PARAM_TYPE_STR_MATCH_ERROR,
        possibleValues: [
          CategoryTypeEnum.numberPositive,
          CategoryTypeEnum.numberNegative,
          CategoryTypeEnum.text,
        ],
      },
      {
        parName: CommandParameterName.ctgTitle,
        parType: CommandParseType.str,
        errKey: TrKey.PARAM_TYPE_STR_ERROR,
      },
      {
        parName: CommandParameterName.ctgDescription,
        parType: CommandParseType.query,
        errKey: TrKey.PARAM_TYPE_QUERY_ERROR,
      },
    ],
    dbUserLang,
    dbUserTimeZone,
  }) as CtgAddDetectedParams | ToTranslate;
}

type CtgDoDetectedParams = Pick<
  CommonDetectedParams,
  Exclude<keyof CommonDetectedParams, 'detectedParams'>
> & {
  detectedParams: {
    [CommandParameterName.ctgId]?: number;
    [CommandParameterName.ctgTitle]?: string;
  };
};

export function detectCMDCtgDoParams(
  msg: string,
  dbUserLang: LanguageEnum,
  dbUserTimeZone: string,
): CtgDoDetectedParams | ToTranslate {
  return detectCMDParameters({
    msg,
    toDetectArr: [
      {
        parName: CommandParameterName.ctgId,
        parType: CommandParseType.intPositive,
        errKey: TrKey.PARAM_TYPE_INT_POS_ERROR,
        conflictWith: [CommandParameterName.ctgTitle],
      },
      {
        parName: CommandParameterName.ctgTitle,
        parType: CommandParseType.str,
        errKey: TrKey.PARAM_TYPE_STR_ERROR,
        conflictWith: [CommandParameterName.ctgId],
      },
    ],
    dbUserLang,
    dbUserTimeZone,
  }) as CtgDoDetectedParams | ToTranslate;
}

type SbcDoDetectedParams = Pick<
  CommonDetectedParams,
  Exclude<keyof CommonDetectedParams, 'detectedParams'>
> & {
  detectedParams: {
    [CommandParameterName.sbcId]?: number;
    [CommandParameterName.sbcTitle]?: string;
  };
};

export function detectCMDSbcDoParams(
  msg: string,
  dbUserLang: LanguageEnum,
  dbUserTimeZone: string,
): SbcDoDetectedParams | ToTranslate {
  return detectCMDParameters({
    msg,
    toDetectArr: [
      {
        parName: CommandParameterName.sbcId,
        parType: CommandParseType.intPositive,
        errKey: TrKey.PARAM_TYPE_INT_POS_ERROR,
        conflictWith: [CommandParameterName.sbcTitle],
      },
      {
        parName: CommandParameterName.sbcTitle,
        parType: CommandParseType.str,
        errKey: TrKey.PARAM_TYPE_STR_ERROR,
        conflictWith: [CommandParameterName.sbcId],
      },
    ],
    dbUserLang,
    dbUserTimeZone,
  }) as SbcDoDetectedParams | ToTranslate;
}

type SbcAddDetectedParams = Pick<
  CommonDetectedParams,
  Exclude<keyof CommonDetectedParams, 'detectedParams'>
> & {
  detectedParams: {
    [CommandParameterName.ctgId]?: number;
    [CommandParameterName.ctgTitle]?: string;
    [CommandParameterName.sbcTitle]?: string;
    [CommandParameterName.sbcDescription]?: string;
  };
};

export function detectCMDSbcAddParams(
  msg: string,
  dbUserLang: LanguageEnum,
  dbUserTimeZone: string,
): SbcAddDetectedParams | ToTranslate {
  return detectCMDParameters({
    msg,
    toDetectArr: [
      {
        parName: CommandParameterName.ctgId,
        parType: CommandParseType.intPositive,
        errKey: TrKey.PARAM_TYPE_INT_POS_ERROR,
        conflictWith: [CommandParameterName.ctgTitle],
      },
      {
        parName: CommandParameterName.ctgTitle,
        parType: CommandParseType.str,
        errKey: TrKey.PARAM_TYPE_STR_ERROR,
        conflictWith: [CommandParameterName.ctgId],
      },
      {
        parName: CommandParameterName.sbcTitle,
        parType: CommandParseType.str,
        errKey: TrKey.PARAM_TYPE_STR_ERROR,
      },
      {
        parName: CommandParameterName.sbcDescription,
        parType: CommandParseType.query,
        errKey: TrKey.PARAM_TYPE_QUERY_ERROR,
      },
    ],
    dbUserLang,
    dbUserTimeZone,
  }) as SbcAddDetectedParams | ToTranslate;
}

type NtDoDetectedParams = Pick<
  CommonDetectedParams,
  Exclude<keyof CommonDetectedParams, 'detectedParams'>
> & {
  detectedParams: {
    [CommandParameterName.ntId]?: number;
  };
};

export function detectCMDNtDoParams(
  msg: string,
  dbUserLang: LanguageEnum,
  dbUserTimeZone: string,
): NtDoDetectedParams | ToTranslate {
  return detectCMDParameters({
    msg,
    toDetectArr: [
      {
        parName: CommandParameterName.ntId,
        parType: CommandParseType.intPositive,
        errKey: TrKey.PARAM_TYPE_INT_POS_ERROR,
      },
    ],
    dbUserLang,
    dbUserTimeZone,
  }) as NtDoDetectedParams | ToTranslate;
}

type CtgListCommonDetectedParams = {
  [CommandParameterName.limit]?: number;
  [CommandParameterName.skip]?: number;
  [CommandParameterName.showId]?: boolean;
  [CommandParameterName.showDeleted]?: boolean;
  [CommandParameterName.showArchived]?: boolean;
  [CommandParameterName.query]?: string;
  [CommandParameterName.ctgQuery]?: string;
  [CommandParameterName.sbcQuery]?: string;
  [CommandParameterName.ctgQueryTitle]?: string;
  [CommandParameterName.sbcQueryTitle]?: string;
  [CommandParameterName.ctgQueryDescr]?: string;
  [CommandParameterName.sbcQueryDescr]?: string;
  [CommandParameterName.ctgQueryIdGreaterThan]?: number;
  [CommandParameterName.ctgQueryIdGreaterThanOrEq]?: number;
  [CommandParameterName.ctgQueryIdLessThan]?: number;
  [CommandParameterName.ctgQueryIdLessThanOrEq]?: number;
  [CommandParameterName.sbcQueryIdGreaterThan]?: number;
  [CommandParameterName.sbcQueryIdGreaterThanOrEq]?: number;
  [CommandParameterName.sbcQueryIdLessThan]?: number;
  [CommandParameterName.sbcQueryIdLessThanOrEq]?: number;
};

type NtAppendTextDetectedParams = Pick<
  CommonDetectedParams,
  Exclude<keyof CommonDetectedParams, 'detectedParams'>
> & {
  detectedParams: {
    [CommandParameterName.ntId]: number;
    [CommandParameterName.ntText]?: string;
  };
};

export function detectCMDNtAppendTextParams(
  msg: string,
  dbUserLang: LanguageEnum,
  dbUserTimeZone: string,
): NtAppendTextDetectedParams | ToTranslate {
  return detectCMDParameters({
    msg,
    toDetectArr: [
      {
        parName: CommandParameterName.ntId,
        parType: CommandParseType.intPositive,
        errKey: TrKey.PARAM_TYPE_INT_POS_ERROR,
      },
      {
        parName: CommandParameterName.ntText,
        parType: CommandParseType.query,
        errKey: TrKey.PARAM_TYPE_QUERY_ERROR,
      },
    ],
    dbUserLang,
    dbUserTimeZone,
  }) as NtAppendTextDetectedParams | ToTranslate;
}

type CtgListDetectedParams = Pick<
  CommonDetectedParams,
  Exclude<keyof CommonDetectedParams, 'detectedParams' | 'detectedDBParams'>
> & {
  detectedParams: CtgListCommonDetectedParams;
  detectedDBParams: CtgListCommonDetectedParams;
};

export function detectCMDCtgListParameters(
  msg: string,
  dbUserLang: LanguageEnum,
  dbUserTimeZone: string,
): CtgListDetectedParams | ToTranslate {
  return detectCMDParameters({
    msg,
    toDetectArr: [
      {
        parName: CommandParameterName.limit,
        parType: CommandParseType.intPositive,
        errKey: TrKey.PARAM_TYPE_INT_POS_ERROR,
      },
      {
        parName: CommandParameterName.skip,
        parType: CommandParseType.intPositive,
        errKey: TrKey.PARAM_TYPE_INT_POS_ERROR,
      },
      {
        parName: CommandParameterName.showId,
        parType: CommandParseType.bool,
        errKey: TrKey.PARAM_TYPE_BOOL_ERROR,
      },
      {
        parName: CommandParameterName.showDeleted,
        parType: CommandParseType.bool,
        errKey: TrKey.PARAM_TYPE_BOOL_ERROR,
      },
      {
        parName: CommandParameterName.showArchived,
        parType: CommandParseType.bool,
        errKey: TrKey.PARAM_TYPE_BOOL_ERROR,
      },
      {
        parName: CommandParameterName.query,
        parType: CommandParseType.query,
        errKey: TrKey.PARAM_TYPE_QUERY_ERROR,
        conflictWith: [
          CommandParameterName.ctgQuery,
          CommandParameterName.sbcQuery,
          CommandParameterName.ctgQueryTitle,
          CommandParameterName.ctgQueryDescr,
          CommandParameterName.sbcQueryTitle,
          CommandParameterName.sbcQueryDescr,
        ],
      },
      {
        parName: CommandParameterName.ctgQuery,
        parType: CommandParseType.query,
        errKey: TrKey.PARAM_TYPE_QUERY_ERROR,
        conflictWith: [CommandParameterName.query],
      },
      {
        parName: CommandParameterName.sbcQuery,
        parType: CommandParseType.query,
        errKey: TrKey.PARAM_TYPE_QUERY_ERROR,
        conflictWith: [CommandParameterName.query],
      },
      {
        parName: CommandParameterName.ctgQueryTitle,
        parType: CommandParseType.query,
        errKey: TrKey.PARAM_TYPE_QUERY_ERROR,
        conflictWith: [
          CommandParameterName.query,
          CommandParameterName.ctgQuery,
        ],
      },
      {
        parName: CommandParameterName.sbcQueryTitle,
        parType: CommandParseType.query,
        errKey: TrKey.PARAM_TYPE_QUERY_ERROR,
        conflictWith: [
          CommandParameterName.query,
          CommandParameterName.sbcQuery,
        ],
      },
      {
        parName: CommandParameterName.ctgQueryDescr,
        parType: CommandParseType.query,
        errKey: TrKey.PARAM_TYPE_QUERY_ERROR,
        conflictWith: [
          CommandParameterName.query,
          CommandParameterName.ctgQuery,
        ],
      },
      {
        parName: CommandParameterName.sbcQueryDescr,
        parType: CommandParseType.query,
        errKey: TrKey.PARAM_TYPE_QUERY_ERROR,
        conflictWith: [
          CommandParameterName.query,
          CommandParameterName.sbcQuery,
        ],
      },
      {
        parName: CommandParameterName.ctgQueryIdGreaterThan,
        parType: CommandParseType.intPositive,
        errKey: TrKey.PARAM_TYPE_INT_POS_ERROR,
        conflictWith: [CommandParameterName.ctgQueryIdGreaterThanOrEq],
      },
      {
        parName: CommandParameterName.ctgQueryIdGreaterThanOrEq,
        parType: CommandParseType.intPositive,
        errKey: TrKey.PARAM_TYPE_INT_POS_ERROR,
        conflictWith: [CommandParameterName.ctgQueryIdGreaterThan],
      },
      {
        parName: CommandParameterName.ctgQueryIdLessThan,
        parType: CommandParseType.intPositive,
        errKey: TrKey.PARAM_TYPE_INT_POS_ERROR,
        conflictWith: [CommandParameterName.ctgQueryIdLessThanOrEq],
      },
      {
        parName: CommandParameterName.ctgQueryIdLessThanOrEq,
        parType: CommandParseType.intPositive,
        errKey: TrKey.PARAM_TYPE_INT_POS_ERROR,
        conflictWith: [CommandParameterName.ctgQueryIdLessThan],
      },
      {
        parName: CommandParameterName.sbcQueryIdGreaterThan,
        parType: CommandParseType.intPositive,
        errKey: TrKey.PARAM_TYPE_INT_POS_ERROR,
        conflictWith: [CommandParameterName.sbcQueryIdGreaterThanOrEq],
      },
      {
        parName: CommandParameterName.sbcQueryIdGreaterThanOrEq,
        parType: CommandParseType.intPositive,
        errKey: TrKey.PARAM_TYPE_INT_POS_ERROR,
        conflictWith: [CommandParameterName.sbcQueryIdGreaterThan],
      },
      {
        parName: CommandParameterName.sbcQueryIdLessThan,
        parType: CommandParseType.intPositive,
        errKey: TrKey.PARAM_TYPE_INT_POS_ERROR,
        conflictWith: [CommandParameterName.sbcQueryIdLessThanOrEq],
      },
      {
        parName: CommandParameterName.sbcQueryIdLessThanOrEq,
        parType: CommandParseType.intPositive,
        errKey: TrKey.PARAM_TYPE_INT_POS_ERROR,
        conflictWith: [CommandParameterName.sbcQueryIdLessThan],
      },
    ],
    dbUserLang,
    dbUserTimeZone,
  }) as CtgListDetectedParams | ToTranslate;
}

type SbcListCommonDetectedParams = {
  [CommandParameterName.limit]?: number;
  [CommandParameterName.skip]?: number;
  [CommandParameterName.showId]?: boolean;
  [CommandParameterName.showDeleted]?: boolean;
  [CommandParameterName.showArchived]?: boolean;
  [CommandParameterName.query]?: string;
  [CommandParameterName.ctgQuery]?: string;
  [CommandParameterName.sbcQuery]?: string;
  [CommandParameterName.ctgQueryTitle]?: string;
  [CommandParameterName.sbcQueryTitle]?: string;
  [CommandParameterName.ctgQueryDescr]?: string;
  [CommandParameterName.sbcQueryDescr]?: string;
  [CommandParameterName.ctgQueryIdGreaterThan]?: number;
  [CommandParameterName.ctgQueryIdGreaterThanOrEq]?: number;
  [CommandParameterName.ctgQueryIdLessThan]?: number;
  [CommandParameterName.ctgQueryIdLessThanOrEq]?: number;
  [CommandParameterName.sbcQueryIdGreaterThan]?: number;
  [CommandParameterName.sbcQueryIdGreaterThanOrEq]?: number;
  [CommandParameterName.sbcQueryIdLessThan]?: number;
  [CommandParameterName.sbcQueryIdLessThanOrEq]?: number;
};

type SbcListDetectedParams = Pick<
  CommonDetectedParams,
  Exclude<keyof CommonDetectedParams, 'detectedParams' | 'detectedDBParams'>
> & {
  detectedParams: SbcListCommonDetectedParams;
  detectedDBParams: SbcListCommonDetectedParams;
};

export function detectCMDSbcListParameters(
  msg: string,
  dbUserLang: LanguageEnum,
  dbUserTimeZone: string,
): SbcListDetectedParams | ToTranslate {
  return detectCMDParameters({
    msg,
    toDetectArr: [
      {
        parName: CommandParameterName.limit,
        parType: CommandParseType.intPositive,
        errKey: TrKey.PARAM_TYPE_INT_POS_ERROR,
      },
      {
        parName: CommandParameterName.skip,
        parType: CommandParseType.intPositive,
        errKey: TrKey.PARAM_TYPE_INT_POS_ERROR,
      },
      {
        parName: CommandParameterName.showId,
        parType: CommandParseType.bool,
        errKey: TrKey.PARAM_TYPE_BOOL_ERROR,
      },
      {
        parName: CommandParameterName.showDeleted,
        parType: CommandParseType.bool,
        errKey: TrKey.PARAM_TYPE_BOOL_ERROR,
      },
      {
        parName: CommandParameterName.showArchived,
        parType: CommandParseType.bool,
        errKey: TrKey.PARAM_TYPE_BOOL_ERROR,
      },
      {
        parName: CommandParameterName.query,
        parType: CommandParseType.query,
        errKey: TrKey.PARAM_TYPE_QUERY_ERROR,
        conflictWith: [
          CommandParameterName.ctgQuery,
          CommandParameterName.sbcQuery,
          CommandParameterName.ctgQueryTitle,
          CommandParameterName.ctgQueryDescr,
          CommandParameterName.sbcQueryTitle,
          CommandParameterName.sbcQueryDescr,
        ],
      },
      {
        parName: CommandParameterName.ctgQuery,
        parType: CommandParseType.query,
        errKey: TrKey.PARAM_TYPE_QUERY_ERROR,
        conflictWith: [CommandParameterName.query],
      },
      {
        parName: CommandParameterName.sbcQuery,
        parType: CommandParseType.query,
        errKey: TrKey.PARAM_TYPE_QUERY_ERROR,
        conflictWith: [CommandParameterName.query],
      },
      {
        parName: CommandParameterName.ctgQueryTitle,
        parType: CommandParseType.query,
        errKey: TrKey.PARAM_TYPE_QUERY_ERROR,
        conflictWith: [
          CommandParameterName.query,
          CommandParameterName.ctgQuery,
        ],
      },
      {
        parName: CommandParameterName.sbcQueryTitle,
        parType: CommandParseType.query,
        errKey: TrKey.PARAM_TYPE_QUERY_ERROR,
        conflictWith: [
          CommandParameterName.query,
          CommandParameterName.sbcQuery,
        ],
      },
      {
        parName: CommandParameterName.ctgQueryDescr,
        parType: CommandParseType.query,
        errKey: TrKey.PARAM_TYPE_QUERY_ERROR,
        conflictWith: [
          CommandParameterName.query,
          CommandParameterName.ctgQuery,
        ],
      },
      {
        parName: CommandParameterName.sbcQueryDescr,
        parType: CommandParseType.query,
        errKey: TrKey.PARAM_TYPE_QUERY_ERROR,
        conflictWith: [
          CommandParameterName.query,
          CommandParameterName.sbcQuery,
        ],
      },
      {
        parName: CommandParameterName.ctgQueryIdGreaterThan,
        parType: CommandParseType.intPositive,
        errKey: TrKey.PARAM_TYPE_INT_POS_ERROR,
        conflictWith: [CommandParameterName.ctgQueryIdGreaterThanOrEq],
      },
      {
        parName: CommandParameterName.ctgQueryIdGreaterThanOrEq,
        parType: CommandParseType.intPositive,
        errKey: TrKey.PARAM_TYPE_INT_POS_ERROR,
        conflictWith: [CommandParameterName.ctgQueryIdGreaterThan],
      },
      {
        parName: CommandParameterName.ctgQueryIdLessThan,
        parType: CommandParseType.intPositive,
        errKey: TrKey.PARAM_TYPE_INT_POS_ERROR,
        conflictWith: [CommandParameterName.ctgQueryIdLessThanOrEq],
      },
      {
        parName: CommandParameterName.ctgQueryIdLessThanOrEq,
        parType: CommandParseType.intPositive,
        errKey: TrKey.PARAM_TYPE_INT_POS_ERROR,
        conflictWith: [CommandParameterName.ctgQueryIdLessThan],
      },
      {
        parName: CommandParameterName.sbcQueryIdGreaterThan,
        parType: CommandParseType.intPositive,
        errKey: TrKey.PARAM_TYPE_INT_POS_ERROR,
        conflictWith: [CommandParameterName.sbcQueryIdGreaterThanOrEq],
      },
      {
        parName: CommandParameterName.sbcQueryIdGreaterThanOrEq,
        parType: CommandParseType.intPositive,
        errKey: TrKey.PARAM_TYPE_INT_POS_ERROR,
        conflictWith: [CommandParameterName.sbcQueryIdGreaterThan],
      },
      {
        parName: CommandParameterName.sbcQueryIdLessThan,
        parType: CommandParseType.intPositive,
        errKey: TrKey.PARAM_TYPE_INT_POS_ERROR,
        conflictWith: [CommandParameterName.sbcQueryIdLessThanOrEq],
      },
      {
        parName: CommandParameterName.sbcQueryIdLessThanOrEq,
        parType: CommandParseType.intPositive,
        errKey: TrKey.PARAM_TYPE_INT_POS_ERROR,
        conflictWith: [CommandParameterName.sbcQueryIdLessThan],
      },
    ],
    dbUserLang,
    dbUserTimeZone,
  }) as SbcListDetectedParams | ToTranslate;
}
