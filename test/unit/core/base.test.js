const FFBase = require('@/core/base');

jest.mock('events');
jest.mock('@/conf/conf', () => ({
  getFakeConf: jest.fn(() => ({})),
}));
jest.mock('@/utils/utils', () => ({
  genId: jest.fn(() => 1),
}));

describe('core/base', () => {
  let base = null;

  test('instantiation component needs to succeed', () => {
    base = new FFBase();
    expect(base).toBeInstanceOf(FFBase);
  });

  test('generateID: set id success', () => {
    base.genId();
    expect(base.id).toBe(1);
  });

  test('root: should return self', () => {
    expect(base.root()).toBe(base);
  });

  test('rootConf: should return conf', () => {
    const conf = base.rootConf();
    expect(conf).toMatchObject({});
  });

  test('get/set params', () => {
    expect(base.getParam('key')).toBe(undefined);
    base.setParam('key', 'value1');
    expect(base.getParam('key')).toBe('value1');

    expect(base.getParam('key.sub')).toBe(undefined);
    base.setParam('key.sub', 'value2');
    expect(base.getParam('key.sub')).toBe('value2');
    expect(base.getParam('key')).toMatchObject({'sub':'value2'});

    expect(base.getParam('key.sub.sub2.sub3')).toBe(undefined);
    base.setParam('key.sub.sub2.sub3', 'value3');
    expect(base.getParam('key.sub.sub2.sub3')).toBe('value3');
    expect(base.getParam('key.sub')).toMatchObject({'sub2':{'sub3':'value3'}});

    base.setParam('key.arr.0', 'av1');
    base.setParam('key.arr.1', 'av2');
    expect(base.getParam('key.arr.0')).toBe('av1');
    expect(base.getParam('key.arr')).toMatchObject(['av1', 'av2']);

    base.setParam('key.rev.1', 'av2');
    base.setParam('key.rev.0', 'av1');
    expect(base.getParam('key.rev.0')).toBe('av1');
    expect(base.getParam('key.rev')).toMatchObject(['av1', 'av2']);
  });

  test('destroy: destroy function invoke success', () => {
    base.destroy();
    expect(base.parent).toBeFalsy();
  });
});
