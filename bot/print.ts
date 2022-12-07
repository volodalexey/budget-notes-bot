import { LanguageEnum } from '../i18n/i18n';
import { formatDatetime, get12Hours } from './datetime';

export function printId(id: string | number, showId = false): string {
  return showId ? `🆔${id} ` : '';
}

export function getOClockEmoji(hours12: string): string {
  switch (hours12) {
    case '01':
      return '🕐';
    case '02':
      return '🕑';
    case '03':
      return '🕒';
    case '04':
      return '🕓';
    case '05':
      return '🕔';
    case '06':
      return '🕕';
    case '07':
      return '🕖';
    case '08':
      return '🕗';
    case '09':
      return '🕘';
    case '10':
      return '🕙';
    case '11':
      return '🕚';
    default:
      return '🕛';
  }
}

export function prinDateTime(datetime: Date, timeZone: string): string {
  const dtSplit = formatDatetime(datetime, timeZone).split(' ');
  const hoursStr = get12Hours(datetime, timeZone);
  return `📅${dtSplit[0]}${getOClockEmoji(hoursStr)}${dtSplit[1]}`;
}

export function printDeleted(deletedAt: Date | null | undefined): string {
  return deletedAt ? '✖️' : '';
}

export function printArchived(archivedAt: Date | null | undefined): string {
  return archivedAt ? '💾' : '';
}

export function toNumberFormat(
  value?: number,
  userLangCode?: LanguageEnum,
): string {
  if (typeof value === 'number') {
    const formatter = new Intl.NumberFormat(userLangCode, {
      minimumFractionDigits: 0,
      maximumFractionDigits: 3,
    });
    return formatter.format(value) || '0';
  }
  return '';
}

export function printNumber(num?: number, userLangCode?: LanguageEnum): string {
  if (typeof num === 'number') {
    if (num > 0) {
      return `+${toNumberFormat(num, userLangCode)}`;
    } else if (num < 0) {
      return `-${toNumberFormat(Math.abs(num), userLangCode)}`;
    } else {
      return '0';
    }
  }
  return '';
}
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function printObject(obj: any): string | Record<string, any> {
  const type = typeof obj;
  if (Array.isArray(obj)) {
    return `[${obj.map((i) => printObject(i)).join(', ')}]`;
  } else if (obj !== null && type === 'object') {
    return JSON.stringify(obj);
  } else if (obj === null) {
    return 'null';
  } else if (obj === true) {
    return 'true';
  } else if (obj === false) {
    return 'false';
  } else if (type === 'string') {
    return obj;
  } else if (type === 'number') {
    return obj;
  } else {
    return `${type} ${obj}`;
  }
}
