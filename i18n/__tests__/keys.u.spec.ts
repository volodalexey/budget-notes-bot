import en, { generate as enGenerate } from '../en';
import ru, { generate as ruGenerate } from '../ru';
import { TrKey, TrStrKey } from '../keys';

describe('Check translation keys', () => {
  interface Obj {
    [index: string]: number;
  }
  const enObject: Obj = {};
  const ruObject: Obj = {};
  const avoidKeys = [
    TrKey.NOTE_FIELD_ID_ADDED,
    TrKey.RES_CTG_ADDED_FIELD_ID,
    TrKey.RES_SBC_ADDED_FIELD_ID,
  ].map(TrStrKey);
  function createGenerator(
    object: Obj,
    generate: (TransformFunc: (key: TrKey) => string) => {
      [index: string]: string;
    },
  ): () => { [index: string]: string } {
    return () =>
      generate((key: TrKey) => {
        const strKey = TrStrKey(key);
        if (object[strKey]) {
          object[strKey] += 1;
        } else {
          object[strKey] = 1;
        }
        return strKey;
      });
  }
  const enGenerator = createGenerator(enObject, enGenerate);
  enGenerator();
  const ruGenerator = createGenerator(ruObject, ruGenerate);
  ruGenerator();

  const newLineSpace = /\n[ ]+/;

  test('unique translation en keys', () => {
    Object.keys(enObject).forEach((key) => {
      expect(enObject).toHaveProperty(key, 1);
    });
  });

  test('unique translation ru keys', () => {
    Object.keys(ruObject).forEach((key) => {
      expect(ruObject).toHaveProperty(key, 1);
    });
  });

  test('ru usage equal to en', () => {
    Object.keys(ruObject).forEach((key) => {
      expect(enObject).toHaveProperty(key, 1);
    });
  });

  test('en usage equal to ru', () => {
    Object.keys(enObject).forEach((key) => {
      expect(ruObject).toHaveProperty(key, 1);
    });
  });

  test('ru translations copy pasta in en', () => {
    Object.entries(ru).forEach(([key, value]) => {
      if (value && !(avoidKeys.includes(key) || value.startsWith('{{'))) {
        expect(value).not.toBe(en[key]);
      }
    });
  });

  test('en translations copy pasta in ru', () => {
    Object.entries(en).forEach(([key, value]) => {
      if (value && !(avoidKeys.includes(key) || value.startsWith('{{'))) {
        expect(value).not.toBe(ru[key]);
      }
    });
  });

  test('en translations new line starts with space', () => {
    Object.entries(en).forEach(([, value]) => {
      expect(value).toEqual(expect.not.stringMatching(newLineSpace));
    });
  });

  test('ru translations new line starts with space', () => {
    Object.entries(ru).forEach(([, value]) => {
      expect(value).toEqual(expect.not.stringMatching(newLineSpace));
    });
  });

  test('match keys order en with ru', () => {
    expect(Object.keys(enObject)).toEqual(Object.keys(ruObject));
  });

  test('unused outdated keys', () => {
    expect(
      Object.keys(enObject).filter((key) =>
        typeof en[key] === 'string' ? false : true,
      ),
    ).toEqual([]);
  });
});
