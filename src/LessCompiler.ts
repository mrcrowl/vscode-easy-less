import fs from 'fs/promises';
import less from 'less';
import * as path from 'path';
import * as vscode from 'vscode';
import * as Configuration from './Configuration';
import { EasyLessOptions } from './Configuration';
import * as FileOptionsParser from './FileOptionsParser';
import { LessDocumentResolverPlugin } from './LessDocumentResolverPlugin';

const DEFAULT_EXT = '.css';

// compile the given less file
export async function compile(
  lessFile: string,
  content: string,
  defaults: Configuration.EasyLessOptions,
): Promise<void> {
  const options: Configuration.EasyLessOptions = FileOptionsParser.parse(content, defaults);
  const lessPath: string = path.dirname(lessFile);

  // Option `main`.
  if (options.main) {
    // ###
    // When `main` is set: compile the referenced file(s) instead.
    const mainFilePaths: string[] = resolveMainFilePaths(options.main, lessPath, lessFile);
    if (mainFilePaths && mainFilePaths.length > 0) {
      for (const filePath of mainFilePaths) {
        const mainPath: path.ParsedPath = path.parse(filePath);
        const mainRootFileInfo = Configuration.getRootFileInfo(mainPath);
        const mainDefaults = { ...defaults, rootFileInfo: mainRootFileInfo };
        const mainContent = await fs.readFile(filePath, { encoding: 'utf-8' });
        await compile(filePath, mainContent, mainDefaults);
      }
      return;
    }
  }

  // No output.
  if (options.out === null || options.out === false) {
    return;
  }

  // Option `out`
  const cssFilepath = chooseOutputFilename(options, lessFile, lessPath);
  delete options.out;

  // Option `sourceMap`.
  let sourceMapFile: string | undefined;
  if (options.sourceMap) {
    options.sourceMap = configureSourceMap(options, lessFile, cssFilepath);

    if (!options.sourceMap.sourceMapFileInline) {
      sourceMapFile = `${cssFilepath}.map`;
      options.sourceMap.sourceMapURL = `./${path.parse(sourceMapFile).base}`; // baseFilename + extension + ".map";
    }
  }

  // Option `autoprefixer`.
  options.plugins = [];
  if (options.autoprefixer) {
    const LessPluginAutoPrefix = require('less-plugin-autoprefix');
    const browsers: string[] = cleanBrowsersList(options.autoprefixer);
    const autoprefixPlugin = new LessPluginAutoPrefix({ browsers });

    options.plugins.push(autoprefixPlugin);
  }

  options.plugins.push(new LessDocumentResolverPlugin());

  // Option `px2vwOptions`.
  let px2vwOptions: typeof options.px2vwOptions;
  if (options.px2vwOptions) {
    px2vwOptions = options.px2vwOptions;
    delete options.px2vwOptions;
  }

  // Render to CSS.
  const output = await less.render(content, options);

  if (px2vwOptions) {
    const { viewportWidth } = px2vwOptions;
    output.css = output.css.replace(/[0-9\.]+px/g, value => `${parseFloat(value) / (viewportWidth / 100)}vw`);
  }
  await writeFileContents(cssFilepath, output.css);
  if (output.map && sourceMapFile) {
    await writeFileContents(sourceMapFile, output.map);
  }
}

function chooseOutputFilename(options: Configuration.EasyLessOptions, lessFile: string, lessPath: string) {
  const out: string | boolean | undefined = options.out;
  const extension: string = chooseExtension(options);
  const filenameNoExtension: string = path.parse(lessFile).name;

  let cssRelativeFilename: string;
  if (typeof out === 'string') {
    // Output to the specified file name.
    const interpolatedOut = intepolatePath(out.replace('$1', filenameNoExtension).replace('$2', extension), lessFile);

    cssRelativeFilename = interpolatedOut;

    if (isFolder(cssRelativeFilename)) {
      // Folder.
      cssRelativeFilename = `${cssRelativeFilename}${filenameNoExtension}${extension}`;
    } else if (hasNoExtension(cssRelativeFilename)) {
      // No extension, append manually.
      cssRelativeFilename = `${cssRelativeFilename}${extension}`;
    }
  } else {
    // `out` not set: output to the same basename as the less file
    cssRelativeFilename = filenameNoExtension + extension;
  }

  const cssFile = path.resolve(lessPath, cssRelativeFilename);
  return cssFile;
}

function isFolder(filename: string): filename is `${string}/` | `${string}\\` {
  const lastCharacter = filename.slice(-1);
  return lastCharacter === '/' || lastCharacter === '\\';
}

function hasNoExtension(filename: string): boolean {
  return path.extname(filename) === '';
}

function configureSourceMap(options: Configuration.EasyLessOptions, lessFile: string, cssFile: string) {
  // currently just has support for writing .map file to same directory
  const lessPath: string = path.parse(lessFile).dir;
  const cssPath: string = path.parse(cssFile).dir;
  const lessRelativeToCss: string = path.relative(cssPath, lessPath);

  const sourceMapOptions: Less.SourceMapOption = {
    outputSourceFiles: false,
    sourceMapBasepath: lessPath,
    sourceMapFileInline: options.sourceMapFileInline,
    sourceMapRootpath: lessRelativeToCss,
  };

  return sourceMapOptions;
}

function cleanBrowsersList(autoprefixOption: string | string[]): string[] {
  const browsers: string[] = Array.isArray(autoprefixOption) ? autoprefixOption : ('' + autoprefixOption).split(/,|;/);

  return browsers.map(browser => browser.trim());
}

function intepolatePath(path: string, lessFilePath: string): string {
  if (path.includes('${workspaceFolder}')) {
    const lessFileUri = vscode.Uri.file(lessFilePath);
    const workspaceFolder = vscode.workspace.getWorkspaceFolder(lessFileUri);
    if (workspaceFolder) {
      path = path.replace(/\$\{workspaceFolder\}/g, workspaceFolder.uri.fsPath);
    }
  }

  if (path.includes('${workspaceRoot}')) {
    if (vscode.workspace.rootPath) {
      path = path.replace(/\$\{workspaceRoot\}/g, vscode.workspace.rootPath);
    }
  }

  return path;
}

function resolveMainFilePaths(
  this: void,
  main: string | string[],
  lessPath: string,
  currentLessFile: string,
): string[] {
  let mainFiles: string[];
  if (typeof main === 'string') {
    mainFiles = [main];
  } else if (Array.isArray(main)) {
    mainFiles = main;
  } else {
    mainFiles = [];
  }

  const interpolatedMainFilePaths: string[] = mainFiles.map(mainFile => intepolatePath(mainFile, lessPath));
  const resolvedMainFilePaths: string[] = interpolatedMainFilePaths.map(mainFile => path.resolve(lessPath, mainFile));
  if (resolvedMainFilePaths.indexOf(currentLessFile) >= 0) {
    // ###
    return []; // avoid infinite loops
  }

  return resolvedMainFilePaths;
}

// Writes a file's contents to a path and creates directories if they don't exist.
async function writeFileContents(filepath: string, content: any): Promise<void> {
  await fs.mkdir(path.dirname(filepath), { recursive: true });
  await fs.writeFile(filepath, content.toString());
}

function chooseExtension(options: EasyLessOptions): string {
  if (options?.outExt) {
    if (options.outExt === '') {
      // Special case for no extension (no idea if anyone would really want this?).
      return '';
    }

    return ensureDotPrefixed(options.outExt) || DEFAULT_EXT; // ###
  }

  return DEFAULT_EXT;
}

function ensureDotPrefixed(extension: string): string {
  if (extension.startsWith('.')) {
    return extension;
  }

  return extension ? `.${extension}` : ''; // ###
}
