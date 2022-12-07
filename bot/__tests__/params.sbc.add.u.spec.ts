import { TrKey } from '../../i18n/keys';
import { ToTranslate } from '../../i18n/i18n';
import {
  CommandParameterName,
  detectCMDSbcAddParams,
  PARAMS_EQ,
} from '../parameters';
import { createAppTestConfig } from '../../config/config';

describe('Check add subcategory command parameters parser', () => {
  const {
    test: { user_language, user_time_zone },
  } = createAppTestConfig();
  const realCtgTitle = 'realCtgTitle';
  const realSbcTitle = 'realSbcTitle';
  const realSbcDescr = 'real subcategory description';

  it('detectCMDCtgAddParams() message with all parameters 1', () => {
    const ret = detectCMDSbcAddParams(
      ` [${CommandParameterName.ctgTitle}${PARAMS_EQ}${realCtgTitle} ${CommandParameterName.sbcTitle}${PARAMS_EQ}${realSbcTitle} ${CommandParameterName.sbcDescription}${PARAMS_EQ}"${realSbcDescr}"]`,
      user_language,
      user_time_zone,
    );

    expect(ret).toEqual({
      detectedParams: {
        [CommandParameterName.ctgTitle]: realCtgTitle,
        [CommandParameterName.sbcTitle]: realSbcTitle,
        [CommandParameterName.sbcDescription]: realSbcDescr,
      },
      detectedDBParams: {
        [CommandParameterName.sbcDescription]: realSbcDescr,
      },
      detectedRawParams: {
        [CommandParameterName.ctgTitle]: realCtgTitle,
        [CommandParameterName.sbcTitle]: realSbcTitle,
        [CommandParameterName.sbcDescription]: `"${realSbcDescr}"`,
      },
      rest: ' ',
      detectedPramsPattern: true,
      detectedPramsFound: true,
    });
  });

  const msg1 = `[${CommandParameterName.ctgId}${PARAMS_EQ}0]`;
  test(`${msg1} should be rejected as not valid limit number`, () => {
    const ret = detectCMDSbcAddParams(msg1, user_language, user_time_zone);

    expect(ret).toStrictEqual(
      new ToTranslate(TrKey.PARAM_TYPE_INT_POS_ERROR, user_language, {
        parName: 'ctg_id',
        parValue: '0',
      }),
    );
  });

  it('detectCMDCtgAddParams() message with all parameters 2', () => {
    const ret = detectCMDSbcAddParams(
      ` [${CommandParameterName.ctgId}${PARAMS_EQ}23 ${CommandParameterName.sbcTitle}${PARAMS_EQ}${realSbcTitle} ${CommandParameterName.sbcDescription}${PARAMS_EQ}"${realSbcDescr}"]`,
      user_language,
      user_time_zone,
    );

    expect(ret).toEqual({
      detectedParams: {
        [CommandParameterName.ctgId]: 23,
        [CommandParameterName.sbcTitle]: realSbcTitle,
        [CommandParameterName.sbcDescription]: realSbcDescr,
      },
      detectedDBParams: {
        [CommandParameterName.sbcDescription]: realSbcDescr,
      },
      detectedRawParams: {
        [CommandParameterName.ctgId]: '23',
        [CommandParameterName.sbcTitle]: realSbcTitle,
        [CommandParameterName.sbcDescription]: `"${realSbcDescr}"`,
      },
      rest: ' ',
      detectedPramsPattern: true,
      detectedPramsFound: true,
    });
  });

  const msgs_addsbc_conflict = [
    {
      cmd: ` [${CommandParameterName.ctgId}${PARAMS_EQ}23 ${CommandParameterName.ctgTitle}${PARAMS_EQ}${realCtgTitle}]`,
      expectParName: CommandParameterName.ctgId,
      expectParConflictName: CommandParameterName.ctgTitle,
    },
    {
      cmd: ` [${CommandParameterName.ctgTitle}${PARAMS_EQ}${realCtgTitle} ${CommandParameterName.ctgId}${PARAMS_EQ}23]`,
      expectParName: CommandParameterName.ctgTitle,
      expectParConflictName: CommandParameterName.ctgId,
    },
  ];
  for (const msg_addsbc_conflict of msgs_addsbc_conflict) {
    it(`"${msg_addsbc_conflict.cmd}" should be rejected as of category id and title conflict`, () => {
      const ret = detectCMDSbcAddParams(
        msg_addsbc_conflict.cmd,
        user_language,
        user_time_zone,
      );

      expect(ret).toStrictEqual(
        new ToTranslate(TrKey.PARAM_CONFLICT_ERROR, user_language, {
          parName: msg_addsbc_conflict.expectParName,
          conflictParName: msg_addsbc_conflict.expectParConflictName,
        }),
      );
    });
  }
});
