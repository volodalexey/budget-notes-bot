import { createAppTestConfig } from '../../config/config';
import { TrKey } from '../../i18n/keys';
import {
  parseUserDateTimeToUTC,
  parseUserDateToUTC,
  parseUserTimeToUTC,
} from '../datetime';
import {
  detectCMDParameters,
  CommandParameterName,
  CommandParseType,
  prepareQuery,
} from '../parameters';

describe('Check command parse parameter helpers', () => {
  const {
    test: { user_language, user_time_zone },
  } = createAppTestConfig();
  test('detectCMDParameters() message with date parameter', () => {
    const ret = detectCMDParameters({
      msg: 'msmg [ d=2021.02.03]ddf',
      toDetectArr: [
        {
          parName: CommandParameterName.date,
          parType: CommandParseType.date,
          errKey: TrKey.PARAM_TYPE_DATE_ERROR,
        },
      ],
      dbUserLang: user_language,
      dbUserTimeZone: user_time_zone,
    });

    expect(ret).toEqual({
      detectedParams: {
        [CommandParameterName.date]: parseUserDateToUTC(
          '2021.02.03',
          user_time_zone,
        ),
      },
      detectedDBParams: {},
      detectedRawParams: {
        [CommandParameterName.date]: '2021.02.03',
      },
      rest: 'msmg ddf',
      detectedPramsPattern: true,
      detectedPramsFound: true,
    });
  });

  test('detectCMDParameters() message with short time parameter', () => {
    const ret = detectCMDParameters({
      msg: 'msmg [ t=13:23] 1f',
      toDetectArr: [
        {
          parName: CommandParameterName.time,
          parType: CommandParseType.time,
          errKey: TrKey.PARAM_TYPE_TIME_ERROR,
        },
      ],
      dbUserLang: user_language,
      dbUserTimeZone: user_time_zone,
    });

    expect(ret).toEqual({
      detectedParams: {
        [CommandParameterName.time]: parseUserTimeToUTC(
          '13:23',
          user_time_zone,
        ),
      },
      detectedDBParams: {},
      detectedRawParams: {
        [CommandParameterName.time]: '13:23',
      },
      rest: 'msmg  1f',
      detectedPramsPattern: true,
      detectedPramsFound: true,
    });
  });

  test('detectCMDParameters() message with time parameter', () => {
    const ret = detectCMDParameters({
      msg: 'mg [ t=13:23:34] 1f',
      toDetectArr: [
        {
          parName: CommandParameterName.time,
          parType: CommandParseType.time,
          errKey: TrKey.PARAM_TYPE_TIME_ERROR,
        },
      ],
      dbUserLang: user_language,
      dbUserTimeZone: user_time_zone,
    });

    expect(ret).toEqual({
      detectedParams: {
        [CommandParameterName.time]: parseUserTimeToUTC(
          '13:23:34',
          user_time_zone,
        ),
      },
      detectedDBParams: {},
      detectedRawParams: {
        [CommandParameterName.time]: '13:23:34',
      },
      rest: 'mg  1f',
      detectedPramsPattern: true,
      detectedPramsFound: true,
    });
  });

  test('detectCMDParameters() message with date & time(short) parameter', () => {
    const ret = detectCMDParameters({
      msg: 'mg [ dt="2021.07.18 13:23"] 1f',
      toDetectArr: [
        {
          parName: CommandParameterName.datetime,
          parType: CommandParseType.datetime,
          errKey: TrKey.PARAM_TYPE_DATETIME_ERROR,
        },
      ],
      dbUserLang: user_language,
      dbUserTimeZone: user_time_zone,
    });

    expect(ret).toEqual({
      detectedParams: {
        [CommandParameterName.datetime]: parseUserDateTimeToUTC(
          '2021.07.18 13:23',
          user_time_zone,
        ),
      },
      detectedDBParams: {},
      detectedRawParams: {
        [CommandParameterName.datetime]: '"2021.07.18 13:23"',
      },
      rest: 'mg  1f',
      detectedPramsPattern: true,
      detectedPramsFound: true,
    });
  });

  test('detectCMDParameters() message with date & time parameter', () => {
    const ret = detectCMDParameters({
      msg: 'mg [ dt="2021.07.18 13:23:55"] 1f',
      toDetectArr: [
        {
          parName: CommandParameterName.datetime,
          parType: CommandParseType.datetime,
          errKey: TrKey.PARAM_TYPE_DATETIME_ERROR,
        },
      ],
      dbUserLang: user_language,
      dbUserTimeZone: user_time_zone,
    });

    expect(ret).toEqual({
      detectedParams: {
        [CommandParameterName.datetime]: parseUserDateTimeToUTC(
          '2021.07.18 13:23:55',
          user_time_zone,
        ),
      },
      detectedDBParams: {},
      detectedRawParams: {
        [CommandParameterName.datetime]: '"2021.07.18 13:23:55"',
      },
      rest: 'mg  1f',
      detectedPramsPattern: true,
      detectedPramsFound: true,
    });
  });

  test('detectCMDParameters() query asterisk placeholder for database', () => {
    const ret1 = detectCMDParameters({
      msg: 'mg [ q="some*text"] 1f',
      toDetectArr: [
        {
          parName: CommandParameterName.query,
          parType: CommandParseType.query,
          errKey: TrKey.PARAM_TYPE_QUERY_ERROR,
        },
      ],
      dbUserLang: user_language,
      dbUserTimeZone: user_time_zone,
    });

    expect(ret1).toEqual({
      detectedParams: {
        [CommandParameterName.query]: 'some*text',
      },
      detectedDBParams: {
        [CommandParameterName.query]: prepareQuery('some*text'),
      },
      detectedRawParams: {
        [CommandParameterName.query]: '"some*text"',
      },
      rest: 'mg  1f',
      detectedPramsPattern: true,
      detectedPramsFound: true,
    });

    const ret2 = detectCMDParameters({
      msg: 'mg [ q="some space ** and"] 1f',
      toDetectArr: [
        {
          parName: CommandParameterName.query,
          parType: CommandParseType.query,
          errKey: TrKey.PARAM_TYPE_QUERY_ERROR,
        },
      ],
      dbUserLang: user_language,
      dbUserTimeZone: user_time_zone,
    });

    expect(ret2).toEqual({
      detectedParams: {
        [CommandParameterName.query]: 'some space ** and',
      },
      detectedDBParams: {
        [CommandParameterName.query]: prepareQuery('some space ** and'),
      },
      detectedRawParams: {
        [CommandParameterName.query]: '"some space ** and"',
      },
      rest: 'mg  1f',
      detectedPramsPattern: true,
      detectedPramsFound: true,
    });
  });

  test('detectCMDParameters() message with positive integer parameter', () => {
    const ret = detectCMDParameters({
      msg: '[rd=+2]',
      toDetectArr: [
        {
          parName: CommandParameterName.relativeDay,
          parType: CommandParseType.int,
          errKey: TrKey.PARAM_TYPE_INT_ERROR,
        },
      ],
      dbUserLang: user_language,
      dbUserTimeZone: user_time_zone,
    });

    expect(ret).toEqual({
      detectedParams: {
        [CommandParameterName.relativeDay]: 2,
      },
      detectedDBParams: {},
      detectedRawParams: {
        [CommandParameterName.relativeDay]: '+2',
      },
      rest: '',
      detectedPramsPattern: true,
      detectedPramsFound: true,
    });
  });

  test('detectCMDParameters() message with zero integer parameter', () => {
    const ret = detectCMDParameters({
      msg: '[rd=0]',
      toDetectArr: [
        {
          parName: CommandParameterName.relativeDay,
          parType: CommandParseType.int,
          errKey: TrKey.PARAM_TYPE_INT_ERROR,
        },
      ],
      dbUserLang: user_language,
      dbUserTimeZone: user_time_zone,
    });

    expect(ret).toEqual({
      detectedParams: {
        [CommandParameterName.relativeDay]: 0,
      },
      detectedDBParams: {},
      detectedRawParams: {
        [CommandParameterName.relativeDay]: '0',
      },
      rest: '',
      detectedPramsPattern: true,
      detectedPramsFound: true,
    });
  });

  test('detectCMDParameters() message with negative integer parameter', () => {
    const ret = detectCMDParameters({
      msg: '[rd=-3]',
      toDetectArr: [
        {
          parName: CommandParameterName.relativeDay,
          parType: CommandParseType.int,
          errKey: TrKey.PARAM_TYPE_INT_ERROR,
        },
      ],
      dbUserLang: user_language,
      dbUserTimeZone: user_time_zone,
    });

    expect(ret).toEqual({
      detectedParams: {
        [CommandParameterName.relativeDay]: -3,
      },
      detectedDBParams: {},
      detectedRawParams: {
        [CommandParameterName.relativeDay]: '-3',
      },
      rest: '',
      detectedPramsPattern: true,
      detectedPramsFound: true,
    });
  });
});
