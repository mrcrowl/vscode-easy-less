import * as less from 'less'
import * as mkpath from 'mkpath'
import * as path from 'path'
import * as extend from 'extend'
import * as fs from 'fs'
import * as vscode from 'vscode';
import { EasyLessOptions } from "./Configuration";

import Configuration = require("./Configuration");
import FileOptionsParser = require("./FileOptionsParser");
import { LessDocumentResolverPlugin } from "./LessDocumentResolverPlugin";
import { Uri } from 'vscode'

const DEFAULT_EXT = ".css";

// compile the given less file
export async function compile(lessFile: string, content: string, defaults: Configuration.EasyLessOptions): Promise<void>
{
    const options: Configuration.EasyLessOptions = FileOptionsParser.parse(content, defaults);
    const lessPath: string = path.dirname(lessFile);

    // main is set: compile the referenced file instead
    if (options.main)
    {
        const mainFilePaths: string[] = resolveMainFilePaths(options.main, lessPath, lessFile);
        if (mainFilePaths && mainFilePaths.length > 0)
        {
            for (const filePath of mainFilePaths)
            {
                const mainPath: path.ParsedPath = path.parse(filePath);
                const mainRootFileInfo = Configuration.getRootFileInfo(mainPath);
                const mainDefaults = extend({}, defaults, { rootFileInfo: mainRootFileInfo });
                const mainContent = await readFilePromise(filePath, "utf-8");
                await compile(filePath, mainContent, mainDefaults);
            }
            return;
        }
    }

    // out
    if (options.out === null || options.out === false)
    {
        // is null or false: do not compile
        return;
    }

    const out: string | boolean | undefined = options.out;
    const extension: string = chooseExtension(options);
    const baseFilename: string = path.parse(lessFile).name;

    let cssRelativeFilename: string;
    if (typeof out === "string") 
    {
        // out is set: output to the given file name
        // check whether is a folder first
        const interpolatedOut = intepolatePath(out, lessFile);

        cssRelativeFilename = interpolatedOut;
        const lastCharacter = cssRelativeFilename.slice(-1);
        if (lastCharacter === '/' || lastCharacter === '\\')
        {
            cssRelativeFilename += baseFilename + extension;
        }
        else if (path.extname(cssRelativeFilename) === '')
        {
            cssRelativeFilename += extension;
        }
    }
    else
    {
        // out is not set: output to the same basename as the less file
        cssRelativeFilename = baseFilename + extension;
    }

    const cssFile = path.resolve(lessPath, cssRelativeFilename);
    delete options.out;

    // sourceMap
    let sourceMapFile: string | undefined;
    if (options.sourceMap)
    {
        // currently just has support for writing .map file to same directory
        const lessPath: string = path.parse(lessFile).dir;
        const cssPath: string = path.parse(cssFile).dir;
        const lessRelativeToCss: string = path.relative(cssPath, lessPath);

        const sourceMapOptions = <Less.SourceMapOption>{
            outputSourceFiles: false,
            sourceMapBasepath: lessPath,
            sourceMapFileInline: options.sourceMapFileInline,
            sourceMapRootpath: lessRelativeToCss,
        };

        if (!sourceMapOptions.sourceMapFileInline)
        {
            sourceMapFile = cssFile + '.map';
            const sourceMapFilename = path.parse(sourceMapFile).base;
            sourceMapOptions.sourceMapURL = "./" + sourceMapFilename; // baseFilename + extension + ".map";
        }

        options.sourceMap = sourceMapOptions;
    }

    // plugins
    options.plugins = [];
    if (options.autoprefixer)
    {
        const LessPluginAutoPrefix = require('less-plugin-autoprefix');
        const browsers: string[] = cleanBrowsersList(options.autoprefixer);
        const autoprefixPlugin = new LessPluginAutoPrefix({ browsers });

        options.plugins.push(autoprefixPlugin);
    }

    options.plugins.push(new LessDocumentResolverPlugin());

    // set up the parser
    const output = await less.render(content, options);
    await writeFileContents(cssFile, output.css);
    if (output.map && sourceMapFile)
    {
        await writeFileContents(sourceMapFile, output.map);
    }
}

function cleanBrowsersList(autoprefixOption: string | string[]): string[]
{
    const browsers: string[] = Array.isArray(autoprefixOption) ?
        autoprefixOption :
        ("" + autoprefixOption).split(/,|;/);

    return browsers.map(browser => browser.trim());
}

function intepolatePath(this: void, path: string, lessFilePath: string): string
{
    if (path.includes("${workspaceFolder}"))
    {
        const lessFileUri = Uri.file(lessFilePath);
        const workspaceFolder = vscode.workspace.getWorkspaceFolder(lessFileUri);
        if (workspaceFolder) {
            path = path.replace(/\$\{workspaceFolder\}/g, workspaceFolder.uri.fsPath);
        }
    }

    if (path.includes("${workspaceRoot}"))
    {
        if (vscode.workspace.rootPath)
        {
            path = path.replace(/\$\{workspaceRoot\}/g, vscode.workspace.rootPath);
        }
    }

    return path;
}

function resolveMainFilePaths(this: void, main: string | string[], lessPath: string, currentLessFile: string): string[]
{
    let mainFiles: string[];
    if (typeof main === "string")
    {
        mainFiles = [main];
    }
    else if (Array.isArray(main))
    {
        mainFiles = main;
    }
    else
    {
        mainFiles = [];
    }

    const interpolatedMainFilePaths: string[] = mainFiles.map(mainFile => intepolatePath(mainFile, lessPath));
    const resolvedMainFilePaths: string[] = interpolatedMainFilePaths.map(mainFile => path.resolve(lessPath, mainFile));
    if (resolvedMainFilePaths.indexOf(currentLessFile) >= 0)
    {
        return []; // avoid infinite loops
    }

    return resolvedMainFilePaths;
}

// writes a file's contents in a path where directories may or may not yet exist
function writeFileContents(this: void, filepath: string, content: any): Promise<any>
{
    return new Promise((resolve, reject) =>
    {
        mkpath(path.dirname(filepath), err =>
        {
            if (err)
            {
                return reject(err);
            }

            fs.writeFile(filepath, content, err =>
            {
                if (err)
                {
                    reject(err)
                }
                else
                {
                    resolve()
                }
            });
        });
    });
}

function readFilePromise(this: void, filename: string, encoding: string): Promise<string> 
{
    return new Promise((resolve, reject) =>
    {
        fs.readFile(filename, encoding, (err: any, data: string) =>
        {
            if (err) 
            {
                reject(err)
            }
            else
            {
                resolve(data);
            }
        });
    });
}

function chooseExtension(this: void, options: EasyLessOptions): string
{
    if (options && options.outExt)
    {
        if (options.outExt === "")
        {
            // special case for no extension (no idea if anyone would really want this?)
            return "";
        }

        return ensureDotPrefixed(options.outExt) || DEFAULT_EXT;
    }

    return DEFAULT_EXT;
}

function ensureDotPrefixed(this: void, extension: string): string
{
    if (extension.startsWith("."))
    {
        return extension;
    }

    return extension ? `.${extension}` : "";
}
