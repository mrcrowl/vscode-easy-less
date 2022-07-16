import path from 'path';
import { describe, expect, it, vi } from 'vitest';
import type { TextDocument } from 'vscode';
import { EasyLessOptions, getGlobalOptions, getRootFileInfo } from '../src/Configuration';

vi.mock('vscode', () => {
  return {
    workspace: {
      getConfiguration() {
        return {
          get() {},
        };
      },
    },
  };
});

describe('getGlobalOptions', () => {
  it('characterises current behaviour', () => {
    const fakeDoc = makeTextDocument('/home/mrcrowl/dev/css/test.less');
    const expected: EasyLessOptions = {
      plugins: [],
      rootFileInfo: {
        filename: 'test.less',
        currentDirectory: '/home/mrcrowl/dev/css',
        relativeUrls: false,
        entryPath: '/home/mrcrowl/dev/css/',
        rootpath: null!,
        rootFilename: null!,
        reference: undefined!,
      },
      relativeUrls: false,
    };
    expect(getGlobalOptions(fakeDoc)).toEqual(expected);
  });
});

describe('getRootFileInfo', () => {
  it('characterises current behaviour', () => {
    const path: path.ParsedPath = {
      root: '/',
      dir: '/home/mrcrowl/dev/styles',
      base: 'style.less',
      ext: '.less',
      name: 'style',
    };

    expect(getRootFileInfo(path)).toEqual({
      filename: 'style.less',
      currentDirectory: '/home/mrcrowl/dev/styles',
      relativeUrls: false,
      entryPath: '/home/mrcrowl/dev/styles/',
      rootpath: null,
      rootFilename: null,
      reference: undefined,
    });
  });
});

function makeTextDocument(fileName: string): TextDocument {
  return {
    fileName,
    uri: null!,
  } as unknown as TextDocument;
}
