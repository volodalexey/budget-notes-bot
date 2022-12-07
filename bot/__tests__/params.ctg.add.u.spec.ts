import { CategoryTypeEnum } from '../../db/models/categoryModel';
import { TrKey } from '../../i18n/keys';
import { ToTranslate } from '../../i18n/i18n';
import {
  CommandParameterName,
  detectCMDCtgAddParams,
  PARAMS_EQ,
} from '../parameters';
import { printObject } from '../print';
import { createAppTestConfig } from '../../config/config';

describe('Check add category command parameters parser', () => {
  const {
    test: { user_language, user_time_zone },
  } = createAppTestConfig();
  const realCtgTitle = 'realCtgTitle';
  const realCtgDescr = 'real category description';

  it('detectCMDCtgAddParams() message with all parameters', () => {
    const ret = detectCMDCtgAddParams(
      ` [${CommandParameterName.ctgType}${PARAMS_EQ}${CategoryTypeEnum.numberNegative} ${CommandParameterName.ctgTitle}${PARAMS_EQ}${realCtgTitle} ${CommandParameterName.ctgDescription}${PARAMS_EQ}"${realCtgDescr}"]`,
      user_language,
      user_time_zone,
    );

    expect(ret).toEqual({
      detectedParams: {
        [CommandParameterName.ctgType]: CategoryTypeEnum.numberNegative,
        [CommandParameterName.ctgTitle]: realCtgTitle,
        [CommandParameterName.ctgDescription]: realCtgDescr,
      },
      detectedDBParams: {
        [CommandParameterName.ctgDescription]: realCtgDescr,
      },
      detectedRawParams: {
        [CommandParameterName.ctgType]: CategoryTypeEnum.numberNegative,
        [CommandParameterName.ctgTitle]: realCtgTitle,
        [CommandParameterName.ctgDescription]: `"${realCtgDescr}"`,
      },
      rest: ' ',
      detectedPramsPattern: true,
      detectedPramsFound: true,
    });
  });

  const msgs_addctg_type_failure = [
    {
      cmd: ` [${CommandParameterName.ctgType}${PARAMS_EQ}${CategoryTypeEnum.numberNegative}n]`,
      expectDateStr: '2019.02.',
    },
    {
      cmd: ` [${CommandParameterName.ctgType}${PARAMS_EQ}${CategoryTypeEnum.numberPositive}n]`,
      expectDateStr: '2019.02.',
    },
  ];
  for (const msg_addctg_type_failure of msgs_addctg_type_failure) {
    it(`"${msg_addctg_type_failure.cmd}" should be rejected as of not valid category type`, () => {
      const ret = detectCMDCtgAddParams(
        msg_addctg_type_failure.cmd,
        user_language,
        user_time_zone,
      );

      expect(ret).toStrictEqual(
        new ToTranslate(TrKey.PARAM_TYPE_STR_MATCH_ERROR, user_language, {
          parName: CommandParameterName.ctgType,
          parValues: printObject([
            CategoryTypeEnum.numberPositive,
            CategoryTypeEnum.numberNegative,
            CategoryTypeEnum.text,
          ]),
        }),
      );
    });
  }
});
