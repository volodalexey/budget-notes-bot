import {
  subDays,
  startOfDay,
  endOfDay,
  subWeeks,
  startOfWeek,
  endOfWeek,
  subMonths,
  startOfMonth,
  endOfMonth,
  subQuarters,
  startOfQuarter,
  endOfQuarter,
  subYears,
  startOfYear,
  endOfYear,
  parse,
  isValid,
  format,
} from 'date-fns';
import { utcToZonedTime, zonedTimeToUtc } from 'date-fns-tz';
import { listTimeZones } from 'timezone-support';

const DATE_MASK = 'yyyy.MM.dd';
const DATE_REW_MASK = 'dd.MM.yyyy';
const TIME_MASK = 'HH:mm:ss';
const TIME_SHORT_MASK = 'HH:mm';
const DATE_REW_TIME_MASK = DATE_REW_MASK + ' ' + TIME_MASK;
const DATE_TIME_MASK = DATE_MASK + ' ' + TIME_MASK;
const DATE_TIME_SHORT_MASK = DATE_MASK + ' ' + TIME_SHORT_MASK;
export const DEFAULT_NOTE_CREATE_TIME = '12:00';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function formatDatetime(datetime: Date, timeZone: string): string {
  return format(datetime, DATE_REW_TIME_MASK);
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function get12Hours(datetime: Date, timeZone: string): string {
  return format(datetime, 'hh');
}

export enum WeekStartsOn {
  Sunday = 0,
  Monday,
}

export function parseWeekStartsOn(
  weekStartsOn: string | number | undefined,
  strict?: boolean,
): WeekStartsOn {
  switch (weekStartsOn) {
    case '0':
    case 0:
      return 0;
    case '1':
    case 1:
      return 1;
    case '2':
    case 2:
      return 2;
    case '3':
    case 3:
      return 3;
    case '4':
    case 4:
      return 4;
    case '5':
    case 5:
      return 5;
    case '6':
    case 6:
      return 6;
  }
  if (strict) {
    throw new Error('Can not parse week starts on');
  }
  return 1;
}

export interface ReturnStartEndDatetime {
  startUTCDateTime: Date;
  endUTCDateTime: Date;
  startUserDateTime: string;
  endUserDateTime: string;
  limit: number;
  serverNow: Date;
}

export interface UserDatetimeOptions {
  timeZone: string;
  weekStartsOn: WeekStartsOn;
  limit?: number;
  skip?: number;
  serverNow?: Date;
  userNow?: Date;
}

let MOCK_DATE: Date | undefined;
export function setDTDate(date?: Date): void {
  MOCK_DATE = date;
}

export function newDTDate(): Date {
  return MOCK_DATE || new Date();
}

export function getCurrentDate(): string {
  return format(newDTDate(), DATE_MASK);
}

export interface DOptionsI {
  weekStartsOn?: 0 | 1 | 2 | 3 | 4 | 5 | 6;
}

export function calcStartEndDatetime(
  userDatetimeOptions: UserDatetimeOptions,
  subFn: (date: Date, amount: number) => Date,
  startFn: (date: Date, options: DOptionsI) => Date,
  endFn: (date: Date, options: DOptionsI) => Date,
): ReturnStartEndDatetime {
  let { serverNow, userNow } = userDatetimeOptions;
  const { skip, timeZone, weekStartsOn } = userDatetimeOptions;
  let { limit } = userDatetimeOptions;
  let startUserDateTime;
  let endUserDateTime;
  if (!serverNow) {
    serverNow = newDTDate();
  }
  if (!userNow) {
    userNow = utcToZonedTime(serverNow, timeZone);
  }
  if (typeof limit !== 'number') {
    limit = 1;
  }
  if (typeof skip === 'number' && skip > 0) {
    const rewDateTime = subFn(userNow, skip);
    startUserDateTime = startFn(rewDateTime, { weekStartsOn });
    endUserDateTime = endFn(rewDateTime, { weekStartsOn });
    if (limit > 0) {
      if (limit > 1) {
        startUserDateTime = startFn(subFn(rewDateTime, limit - 1), {
          weekStartsOn,
        });
      } else {
        startUserDateTime = startFn(rewDateTime, { weekStartsOn });
      }
      endUserDateTime = endFn(rewDateTime, { weekStartsOn });
    }
  } else {
    if (limit > 1) {
      startUserDateTime = startFn(subFn(userNow, limit - 1), { weekStartsOn });
    } else {
      startUserDateTime = startFn(userNow, { weekStartsOn });
    }
    endUserDateTime = endFn(userNow, { weekStartsOn });
  }
  const startUTCDateTime = zonedTimeToUtc(startUserDateTime, timeZone);
  const endUTCDateTime = zonedTimeToUtc(endUserDateTime, timeZone);
  return {
    startUTCDateTime,
    endUTCDateTime,
    startUserDateTime: formatDatetime(startUserDateTime, timeZone),
    endUserDateTime: formatDatetime(endUserDateTime, timeZone),
    limit,
    serverNow,
  };
}

export function calcStartEndDay(
  userDatetimeOptions: UserDatetimeOptions,
): ReturnStartEndDatetime {
  return calcStartEndDatetime(
    userDatetimeOptions,
    subDays,
    startOfDay,
    endOfDay,
  );
}

export function calcStartEndWeek(
  userDatetimeOptions: UserDatetimeOptions,
): ReturnStartEndDatetime {
  return calcStartEndDatetime(
    userDatetimeOptions,
    subWeeks,
    startOfWeek,
    endOfWeek,
  );
}

export function calcStartEndMonth(
  userDatetimeOptions: UserDatetimeOptions,
): ReturnStartEndDatetime {
  return calcStartEndDatetime(
    userDatetimeOptions,
    subMonths,
    startOfMonth,
    endOfMonth,
  );
}

export function calcStartEndQuarter(
  userDatetimeOptions: UserDatetimeOptions,
): ReturnStartEndDatetime {
  return calcStartEndDatetime(
    userDatetimeOptions,
    subQuarters,
    startOfQuarter,
    endOfQuarter,
  );
}

export function calcStartEndYear(
  userDatetimeOptions: UserDatetimeOptions,
): ReturnStartEndDatetime {
  return calcStartEndDatetime(
    userDatetimeOptions,
    subYears,
    startOfYear,
    endOfYear,
  );
}

export function asteriskString(): string {
  return '[\\w|\\W]{0,}';
}

export function createSearchRegExp(value: string): RegExp {
  return new RegExp(
    '^' + asteriskString() + value + asteriskString() + '$',
    'i',
  );
}

export function tryToFindTimeZone(query: string): string[] {
  const searchRegExp = createSearchRegExp(query);
  const timeZones = listTimeZones().filter((tz): boolean => {
    searchRegExp.lastIndex = 0;
    return searchRegExp.test(tz);
  });
  return timeZones;
}

export function parseUserDateToUTC(
  dateStr: string,
  timeZone: string,
  initialDate?: Date,
): Date | undefined {
  const parsedDate = parse(dateStr, DATE_MASK, initialDate || newDTDate());
  if (isValid(parsedDate)) {
    return zonedTimeToUtc(parsedDate, timeZone);
  }
}

export function parseUserTimeToUTC(
  dateStr: string,
  timeZone: string,
  initialDate?: Date,
): Date | undefined {
  const parsedTime = parse(dateStr, TIME_MASK, initialDate || newDTDate());
  const parsedTimeShort = parse(
    dateStr,
    TIME_SHORT_MASK,
    initialDate || newDTDate(),
  );
  if (isValid(parsedTime)) {
    return zonedTimeToUtc(parsedTime, timeZone);
  } else if (isValid(parsedTimeShort)) {
    return zonedTimeToUtc(parsedTimeShort, timeZone);
  }
}

export function parseUserDateTimeToUTC(
  dateStr: string,
  timeZone: string,
  initialDate?: Date,
): Date | undefined {
  const parsedDatetime = parse(
    dateStr,
    DATE_TIME_MASK,
    initialDate || newDTDate(),
  );
  const parsedDatetimeShort = parse(
    dateStr,
    DATE_TIME_SHORT_MASK,
    initialDate || newDTDate(),
  );
  if (isValid(parsedDatetime)) {
    return zonedTimeToUtc(parsedDatetime, timeZone);
  } else if (isValid(parsedDatetimeShort)) {
    return zonedTimeToUtc(parsedDatetimeShort, timeZone);
  }
}
