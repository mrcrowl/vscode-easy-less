import { it, describe, expect } from 'vitest';
import { EasyLessOptions } from '../src/Configuration';
import { parse } from '../src/FileOptionsParser';

const DEFAULTS: EasyLessOptions = {
  relativeUrls: false,
  plugins: [],
};

const CASES = [
  { line: '', expected: DEFAULTS }, //
  { line: '// Regular comment', expected: DEFAULTS },
];

describe('parse', () => {
  it.each([CASES])('matches', ({ line, expected }) => {
    const options = parse(line, DEFAULTS);
    expect(options).toEqual(expected);
  });
});
