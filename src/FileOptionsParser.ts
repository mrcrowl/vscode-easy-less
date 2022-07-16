import * as Configuration from './Configuration';

const SUPPORTED_PER_FILE_OPTS = new Set<string>([
  'main',
  'out',
  'outExt',
  'sourceMap',
  'sourceMapFileInline',
  'compress',
  'relativeUrls',
  'ieCompat',
  'autoprefixer',
  'javascriptEnabled',
  'math',
]);

const MULTI_OPTS = new Set<string>(['main']);

type NonStringPrimitive = true | false | undefined | null | number;
type Primitive = string | NonStringPrimitive;

export function parse(line: string, defaults: Configuration.EasyLessOptions): Configuration.EasyLessOptions {
  // Does line start with "//"?
  const commentMatch: RegExpExecArray | null = /^\s*\/\/\s*(.+)/.exec(line);
  if (!commentMatch) {
    return defaults;
  }

  const options: { [key: string]: unknown } = { ...defaults };
  const seenKeys = new Set<string>();
  for (const item of commentMatch[1].split(',')) {
    const [key, rawValue] = splitOption(item);

    // Guard.
    if (!SUPPORTED_PER_FILE_OPTS.has(key)) continue;
    if (rawValue === undefined || rawValue === '') continue;

    // Interpret value.
    const value = parsePrimitive(rawValue);

    if (seenKeys.has(key) && MULTI_OPTS.has(key)) {
      // Handle multiple values for same key.
      const existingValue = options[key];
      if (Array.isArray(existingValue)) {
        existingValue.push(value);
      } else {
        options[key] = [existingValue, value];
      }
    } else {
      // Single value, or key doesn't allow an array.
      options[key] = value;
      seenKeys.add(key);
    }
  }

  return options as Configuration.EasyLessOptions;
}

function splitOption(item: string): [string, string] {
  const parts = item.split(':', 2);
  const key = parts[0]?.trim();
  const value = parts[1]?.trim();
  return [key, value];
}

function parsePrimitive(rawValue: string): Primitive {
  if (rawValue.match(/^(true|false|undefined|null|[0-9]+)$/)) {
    return eval(rawValue) as NonStringPrimitive;
  }

  if (isEnclosedInQuotes(rawValue)) {
    try {
      return eval(rawValue);
    } catch (e) {
      return rawValue;
    }
  }

  return rawValue;
}

const SINGLE_QUOTE = "'";
const DOUBLE_QUOTE = '"';

function isEnclosedInQuotes(value: unknown): value is string {
  return (
    typeof value === 'string' &&
    value.length > 1 &&
    ((value.startsWith(DOUBLE_QUOTE) && value.endsWith(DOUBLE_QUOTE)) ||
      (value.startsWith(SINGLE_QUOTE) && value.endsWith(SINGLE_QUOTE)))
  );
}
