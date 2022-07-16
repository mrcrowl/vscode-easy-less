import { beforeEach, describe, expect, it, vi } from 'vitest';
import { compile } from '../src/LessCompiler';
import fs from 'fs/promises';
import less from 'less';
import { Uri, workspace } from 'vscode';
import type { WorkspaceFolder } from 'vscode';

vi.mock('fs/promises');
vi.mock('less');
vi.mock('vscode', () => {
  return {
    Uri: { file: vi.fn() },
    workspace: { getWorkspaceFolder: vi.fn() },
  };
});

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

    it('should interpolate the workspace workspaceFolder', async () => {
      vi.spyOn(less, 'render').mockResolvedValue(RENDER_RESULT);
      const mkdirSpy = vi.spyOn(fs, 'mkdir').mockResolvedValue(undefined);
      const writeFileSpy = vi.spyOn(fs, 'writeFile').mockResolvedValue(undefined);

      vi.spyOn(Uri, 'file').mockReturnValue({} as Uri);

      const workspaceFolder = { uri: { fsPath: '/home/abc/dev/project' } } as WorkspaceFolder;
      vi.spyOn(workspace, 'getWorkspaceFolder').mockReturnValue(workspaceFolder);

      const options = { out: '${workspaceFolder}/test.css' }; // Intentionally NOT a template string here.
      const WORKSPACE_FOLDER = '/home/abc/dev/project';
      const result = await compile(`${WORKSPACE_FOLDER}/css/test.less`, LESS_CONTENTS, options);

      expect(result).toBeUndefined();
      expect(mkdirSpy).toHaveBeenCalledOnce();
      expect(mkdirSpy.mock.lastCall).toEqual([`${WORKSPACE_FOLDER}`, { recursive: true }]);
      expect(writeFileSpy).toHaveBeenCalledOnce();
      expect(writeFileSpy.mock.lastCall).toEqual([`${WORKSPACE_FOLDER}/test.css`, CSS_CONTENTS]);
    });
  });
});
