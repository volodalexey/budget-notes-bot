import {
  safeSplitString,
  safeSplitString2,
  safeSplitString3,
  safeSplitString4,
  detectRawParams,
} from '../parameters';

describe('Check split message and raw params helpers', () => {
  const emptyMessage = '       ';
  const oneWordMessage = '😄fg';
  const fullMessage = ' sadf   sfd d r😄dasfsadf fff... ';

  test('splitMessage() full message', () => {
    const msgParts = safeSplitString(fullMessage);

    expect(msgParts).toEqual(['sadf', 'sfd', 'd', 'r😄dasfsadf', 'fff...']);
  });

  test('splitMessage() empty message', () => {
    const msgParts = safeSplitString(emptyMessage);

    expect(msgParts).toEqual([]);
  });

  test('splitMessage() one word message', () => {
    const msgParts = safeSplitString(oneWordMessage);

    expect(msgParts).toEqual(['😄fg']);
  });

  test('splitMessage2() full message', () => {
    const msgParts = safeSplitString2(fullMessage);

    expect(msgParts).toEqual(['sadf', 'sfd d r😄dasfsadf fff...']);
  });

  test('splitMessage2() empty message', () => {
    const msgParts = safeSplitString2(emptyMessage);

    expect(msgParts).toEqual([]);
  });

  test('splitMessage2() one word message', () => {
    const msgParts = safeSplitString2(oneWordMessage);

    expect(msgParts).toEqual(['😄fg']);
  });

  test('splitMessage3() full message', () => {
    const msgParts = safeSplitString3(fullMessage);

    expect(msgParts).toEqual(['sadf', 'sfd', 'd r😄dasfsadf fff...']);
  });

  test('splitMessage3() empty message', () => {
    const msgParts = safeSplitString3(emptyMessage);

    expect(msgParts).toEqual([]);
  });

  test('splitMessage3() one word message', () => {
    const msgParts = safeSplitString3(oneWordMessage);

    expect(msgParts).toEqual(['😄fg']);
  });

  test('splitMessage4() full message', () => {
    const msgParts = safeSplitString4(fullMessage);

    expect(msgParts).toEqual(['sadf', 'sfd', 'd', 'r😄dasfsadf fff...']);
  });

  test('splitMessage4() empty message', () => {
    const msgParts = safeSplitString4(emptyMessage);

    expect(msgParts).toEqual([]);
  });

  test('splitMessage4() one word message', () => {
    const msgParts = safeSplitString4(oneWordMessage);

    expect(msgParts).toEqual(['😄fg']);
  });

  const messageWithoutParams = ' sadf   sfd d [d] [[d]] [[casdc]] fff... ';
  test('detectRawParams() message without raw params', () => {
    const ret = detectRawParams(messageWithoutParams);

    expect(ret.rawParams).toEqual([]);
  });

  const messageWithSpaceParams = ' sadf d [ a=1  b=2  ] 123... ';
  test('detectRawParams() message with space between start/end raw params', () => {
    const ret = detectRawParams(messageWithSpaceParams);

    expect(ret.rawParams).toEqual([
      { key: 'a', value: '1' },
      { key: 'b', value: '2' },
    ]);
    expect(ret.restParts).toEqual([' sadf d ', ' 123... ']);
  });

  const messageWithParams =
    ' sadf   sfd d [d=b b=12+ 23==43 multi="mulf to 45 fr"] fff... ';
  test('detectRawParams() message with space raw params', () => {
    const ret = detectRawParams(messageWithParams);

    expect(ret.rawParams).toEqual([
      { key: 'd', value: 'b' },
      { key: 'b', value: '12+' },
      { key: 'multi', value: '"mulf to 45 fr"' },
    ]);
    expect(ret.restParts).toEqual([' sadf   sfd d ', ' fff... ']);
  });

  const messageWithSymbolParams = ' sadf d [ t=num+  v=num-  ] 123... ';
  test('detectRawParams() message with +- raw params', () => {
    const ret = detectRawParams(messageWithSymbolParams);

    expect(ret.rawParams).toEqual([
      { key: 't', value: 'num+' },
      { key: 'v', value: 'num-' },
    ]);
    expect(ret.restParts).toEqual([' sadf d ', ' 123... ']);
  });

  const messageWithDecimalParams = ' ee d [ tr=35.6  tx=34,56  ]';
  test('detectRawParams() message with decimal raw params', () => {
    const ret = detectRawParams(messageWithDecimalParams);

    expect(ret.rawParams).toEqual([
      { key: 'tr', value: '35.6' },
      { key: 'tx', value: '34,56' },
    ]);
    expect(ret.restParts).toEqual([' ee d ', '']);
  });

  const messageWithEmojiParams = 'msmg[ em=😁 em2=📱🦍 ]ddf';
  test('detectRawParams() message with emoji raw params', () => {
    const ret = detectRawParams(messageWithEmojiParams);

    expect(ret.rawParams).toEqual([
      { key: 'em', value: '😁' },
      { key: 'em2', value: '📱🦍' },
    ]);
    expect(ret.restParts).toEqual(['msmg', 'ddf']);
  });
});
