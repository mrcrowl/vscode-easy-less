import { beforeEach, describe, expect, it, vi } from 'vitest';
import { compile } from '../src/LessCompiler';
import fs from 'fs/promises';
import less from 'less';

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

  it('writes css file - default options', async () => {
    vi.spyOn(less, 'render').mockResolvedValue(RENDER_RESULT);
    const mkdirSpy = vi.spyOn(fs, 'mkdir').mockResolvedValue(undefined);
    const writeFileSpy = vi.spyOn(fs, 'writeFile').mockResolvedValue(undefined);

    const options = {};
    await compile('/home/mrcrowl/styles.less', LESS_CONTENTS, options);

    expect(mkdirSpy).toHaveBeenCalledOnce();
    expect(mkdirSpy.mock.lastCall).toEqual(['/home/mrcrowl', { recursive: true }]);
    expect(writeFileSpy).toHaveBeenCalledOnce();
    expect(writeFileSpy.mock.lastCall).toEqual(['/home/mrcrowl/styles.css', CSS_CONTENTS]);
  });

  describe('out', () => {
    it('no compile for out: false', async () => {
      const renderSpy = vi.spyOn(less, 'render').mockResolvedValue(RENDER_RESULT);
      const mkdirSpy = vi.spyOn(fs, 'mkdir').mockResolvedValue(undefined);
      const writeFileSpy = vi.spyOn(fs, 'writeFile').mockResolvedValue(undefined);

      const options = { out: false };
      await compile('/home/mrcrowl/styles.less', LESS_CONTENTS, options);

      expect(renderSpy).not.toHaveBeenCalledOnce();
      expect(mkdirSpy).not.toHaveBeenCalledOnce();
      expect(writeFileSpy).not.toHaveBeenCalledOnce();
    });

    it('should output to a specific filename (no extension)', async () => {
      vi.spyOn(less, 'render').mockResolvedValue(RENDER_RESULT);
      const mkdirSpy = vi.spyOn(fs, 'mkdir').mockResolvedValue(undefined);
      const writeFileSpy = vi.spyOn(fs, 'writeFile').mockResolvedValue(undefined);

      const options = { out: '/home/mrcrowl/dist/styles' };
      const result = await compile('/home/mrcrowl/styles.less', LESS_CONTENTS, options);

      expect(result).toBeUndefined();
      expect(mkdirSpy).toHaveBeenCalledOnce();
      expect(mkdirSpy.mock.lastCall).toEqual(['/home/mrcrowl/dist', { recursive: true }]);
      expect(writeFileSpy).toHaveBeenCalledOnce();
      expect(writeFileSpy.mock.lastCall).toEqual(['/home/mrcrowl/dist/styles.css', CSS_CONTENTS]);
    });

    it('should output to a specific filename (with extension)', async () => {
      vi.spyOn(less, 'render').mockResolvedValue(RENDER_RESULT);
      const mkdirSpy = vi.spyOn(fs, 'mkdir').mockResolvedValue(undefined);
      const writeFileSpy = vi.spyOn(fs, 'writeFile').mockResolvedValue(undefined);

      const options = { out: '/home/mrcrowl/dist/styles.css' };
      const result = await compile('/home/mrcrowl/styles.less', LESS_CONTENTS, options);

      expect(result).toBeUndefined();
      expect(mkdirSpy).toHaveBeenCalledOnce();
      expect(mkdirSpy.mock.lastCall).toEqual(['/home/mrcrowl/dist', { recursive: true }]);
      expect(writeFileSpy).toHaveBeenCalledOnce();
      expect(writeFileSpy.mock.lastCall).toEqual(['/home/mrcrowl/dist/styles.css', CSS_CONTENTS]);
    });

    it('should output to a specific folder (macOS/linux)', async () => {
      vi.spyOn(less, 'render').mockResolvedValue(RENDER_RESULT);
      const mkdirSpy = vi.spyOn(fs, 'mkdir').mockResolvedValue(undefined);
      const writeFileSpy = vi.spyOn(fs, 'writeFile').mockResolvedValue(undefined);

      const options = { out: '/home/mrcrowl/dist/' };
      const result = await compile('/home/mrcrowl/styles.less', LESS_CONTENTS, options);

      expect(result).toBeUndefined();
      expect(mkdirSpy).toHaveBeenCalledOnce();
      expect(mkdirSpy.mock.lastCall).toEqual(['/home/mrcrowl/dist', { recursive: true }]);
      expect(writeFileSpy).toHaveBeenCalledOnce();
      expect(writeFileSpy.mock.lastCall).toEqual(['/home/mrcrowl/dist/styles.css', CSS_CONTENTS]);
    });

    it('should output with a specific extension (dot prefixed)', async () => {
      vi.spyOn(less, 'render').mockResolvedValue(RENDER_RESULT);
      const mkdirSpy = vi.spyOn(fs, 'mkdir').mockResolvedValue(undefined);
      const writeFileSpy = vi.spyOn(fs, 'writeFile').mockResolvedValue(undefined);

      const options = { out: '/home/mrcrowl/dist/', outExt: '.wxss' };
      const result = await compile('/home/mrcrowl/styles.less', LESS_CONTENTS, options);

      expect(result).toBeUndefined();
      expect(mkdirSpy).toHaveBeenCalledOnce();
      expect(mkdirSpy.mock.lastCall).toEqual(['/home/mrcrowl/dist', { recursive: true }]);
      expect(writeFileSpy).toHaveBeenCalledOnce();
      expect(writeFileSpy.mock.lastCall).toEqual(['/home/mrcrowl/dist/styles.wxss', CSS_CONTENTS]);
    });

    it('should output with a specific extension (no dot)', async () => {
      vi.spyOn(less, 'render').mockResolvedValue(RENDER_RESULT);
      const mkdirSpy = vi.spyOn(fs, 'mkdir').mockResolvedValue(undefined);
      const writeFileSpy = vi.spyOn(fs, 'writeFile').mockResolvedValue(undefined);

      const options = { out: '/home/mrcrowl/dist/', outExt: 'wxss' };
      const result = await compile('/home/mrcrowl/styles.less', LESS_CONTENTS, options);

      expect(result).toBeUndefined();
      expect(mkdirSpy).toHaveBeenCalledOnce();
      expect(mkdirSpy.mock.lastCall).toEqual(['/home/mrcrowl/dist', { recursive: true }]);
      expect(writeFileSpy).toHaveBeenCalledOnce();
      expect(writeFileSpy.mock.lastCall).toEqual(['/home/mrcrowl/dist/styles.wxss', CSS_CONTENTS]);
    });
  });
});
