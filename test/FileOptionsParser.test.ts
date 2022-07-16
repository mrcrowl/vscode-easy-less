import { it, describe, expect } from 'vitest';
import { EasyLessOptions } from '../src/Configuration';
import { parse } from '../src/FileOptionsParser';

const DEFAULTS: EasyLessOptions = {
  relativeUrls: false,
  plugins: [],
  out: false,
};

describe('parse', () => {
  it('ignores blank line', () => {
    expect(parse('', DEFAULTS)).toEqual(DEFAULTS);
  });

  it('ignores non-comment', () => {
    expect(parse('function foo() {', DEFAULTS)).toEqual(DEFAULTS);
  });

  it('ignores regular comment', () => {
    expect(parse('// TODO: fix bug', DEFAULTS)).toEqual(DEFAULTS);
  });

  it('parses single option (overriding default)', () => {
    expect(parse('// out: true', DEFAULTS)).toEqual({ ...DEFAULTS, out: true });
  });

  it('parses multiple options', () => {
    expect(parse('// out: true, main: false, sourceMap: true', DEFAULTS)).toEqual({
      ...DEFAULTS,
      main: false,
      out: true,
      sourceMap: true,
    });
  });

  it('ignores whitespace', () => {
    const expected = {
      ...DEFAULTS,
      out: true,
      main: true,
      sourceMap: true,
    };
    expect(parse('//out:true,main:true,sourceMap:true', DEFAULTS)).toEqual(expected);
    expect(parse('//   out : true,main:  true ,    sourceMap:true     ', DEFAULTS)).toEqual(expected);
  });

  it('ignores unknown options', () => {
    const expected = { ...DEFAULTS, main: true, out: true };
    expect(parse('// main: true, foo: "hello", bar: 123, out: true', DEFAULTS)).toEqual(expected);
  });

  it('ignores missing values', () => {
    expect(parse('// javascriptEnabled:, out: true', DEFAULTS)).toEqual({ ...DEFAULTS, out: true });
  });

  it('parses null, undefined, true, false', () => {
    expect(parse('// main: null', DEFAULTS)).toEqual({ ...DEFAULTS, main: null });
    expect(parse('// main: undefined', DEFAULTS)).toEqual({ ...DEFAULTS, main: undefined });
    expect(parse('// main: true', DEFAULTS)).toEqual({ ...DEFAULTS, main: true });
    expect(parse('// main: false', DEFAULTS)).toEqual({ ...DEFAULTS, main: false });
  });

  it('parses strings without quotes', () => {
    expect(parse('// main: a.less', DEFAULTS)).toEqual({ ...DEFAULTS, main: 'a.less' });
  });

  it('parses integers', () => {
    expect(parse('// javascriptEnabled: 1', DEFAULTS)).toEqual({ ...DEFAULTS, javascriptEnabled: 1 });
  });

  it('parses strings with quotes', () => {
    expect(parse(`// main: "a.less"`, DEFAULTS)).toEqual({ ...DEFAULTS, main: 'a.less' });
    expect(parse(`// main: 'a.less'`, DEFAULTS)).toEqual({ ...DEFAULTS, main: 'a.less' });
    expect(parse(`// main: '`, DEFAULTS)).toEqual({ ...DEFAULTS, main: "'" });
    expect(parse(`// main: "`, DEFAULTS)).toEqual({ ...DEFAULTS, main: '"' });

    // prettier-ignore
    expect(parse(`// main: 'a\\'.less'`, DEFAULTS)).toEqual({ ...DEFAULTS, main: "a'.less" });
    // prettier-ignore
    expect(parse(`// main: 'a\\".less'`, DEFAULTS)).toEqual({ ...DEFAULTS, main: 'a".less' });
    // prettier-ignore
    expect(parse(`// main: "a\\'.less"`, DEFAULTS)).toEqual({ ...DEFAULTS, main: "a'.less" });
    // prettier-ignore
    expect(parse(`// main: "a\\".less"`, DEFAULTS)).toEqual({ ...DEFAULTS, main: 'a".less' });
  });

  it('parses repeat values as array', () => {
    expect(parse('// main: a.less, main: b.less', DEFAULTS)).toEqual({ ...DEFAULTS, main: ['a.less', 'b.less'] });
    expect(parse('// main: "a.less", main: "b.less"', DEFAULTS)).toEqual({ ...DEFAULTS, main: ['a.less', 'b.less'] });
  });
});
