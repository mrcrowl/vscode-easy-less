import { beforeEach, describe, expect, it, vi } from 'vitest';
import { compile } from '../src/LessCompiler';
import fs from 'fs/promises';
import less from 'less';
import { executionAsyncId } from 'async_hooks';

vi.mock('fs/promises');
vi.mock('less');
vi.mock('vscode');

const CSS_CONTENTS = '.thing.sub { background-color: hotpink }';
const LESS_CONTENTS = `{ .thing { &.sub { background-color: hotpink; } } }`;

describe('compile: characterise existing behaviour', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it('writes css file - no options', async () => {
    vi.spyOn(less, 'render').mockImplementationOnce(async () => {
      return {
        css: CSS_CONTENTS,
      } as Less.RenderOutput;
    });
    const mkdirSpy = vi.spyOn(fs, 'mkdir').mockResolvedValue(undefined);
    const writeFileSpy = vi.spyOn(fs, 'writeFile').mockResolvedValue(undefined);
    const result = await compile('/home/mrcrowl/styles.less', LESS_CONTENTS, {});
    expect(result).toBeUndefined();
    expect(mkdirSpy).toHaveBeenCalledOnce();
    expect(mkdirSpy.mock.lastCall).toContain('/home/mrcrowl');
    expect(writeFileSpy).toHaveBeenCalledOnce();
    expect(writeFileSpy.mock.lastCall).toContain('/home/mrcrowl/styles.css');
    expect(writeFileSpy.mock.lastCall).toContain(CSS_CONTENTS);
  });

  // it('exits early', async () => {
  //   const result = compile('', LESS_CONTENTS, { out: null! });
  //   expect(result).();
  // });
});
