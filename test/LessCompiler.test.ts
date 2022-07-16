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
const RENDER_RESULT = { css: CSS_CONTENTS } as Less.RenderOutput;
describe('compile: characterise existing behaviour', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it('writes css file - no options', async () => {
    vi.spyOn(less, 'render').mockResolvedValue(RENDER_RESULT);
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

  it('no compile for out: false', async () => {
    const renderSpy = vi.spyOn(less, 'render').mockResolvedValue(RENDER_RESULT);
    const mkdirSpy = vi.spyOn(fs, 'mkdir').mockResolvedValue(undefined);
    const writeFileSpy = vi.spyOn(fs, 'writeFile').mockResolvedValue(undefined);
    const result = await compile('/home/mrcrowl/styles.less', LESS_CONTENTS, { out: false });
    expect(result).toBeUndefined();
    expect(renderSpy).not.toHaveBeenCalledOnce();
    expect(mkdirSpy).not.toHaveBeenCalledOnce();
    expect(writeFileSpy).not.toHaveBeenCalledOnce();
  });
});
