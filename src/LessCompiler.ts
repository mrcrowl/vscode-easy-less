import * as less from 'less'
import * as mkpath from 'mkpath'
import * as path from 'path'
import * as extend from 'extend'
import * as fs from 'fs'
import * as vscode from 'vscode';

import Configuration = require("./Configuration");
import FileOptionsParser = require("./FileOptionsParser");

// compile the given less file
export function compile(lessFile: string, defaults: Configuration.EasyLessOptions): Promise<void>
{
    return readFilePromise(lessFile).then(buffer =>
    {
        let content: string = buffer.toString();
        let options: Configuration.EasyLessOptions = FileOptionsParser.parse(content, defaults);
        let lessPath: string = path.dirname(lessFile);

        // main is set: compile the referenced file instead
        if (options.main)
        {
            let mainFilePaths: string[] = resolveMainFilePaths(options.main, lessPath, lessFile);
            let lastPromise: Promise<void> = null;
            let promiseChainer = (lastPromise: Promise<void>, nextPromise: Promise<void>) => lastPromise.then(() => nextPromise);
            if (mainFilePaths && mainFilePaths.length > 0)
            {
                for (let filePath of mainFilePaths)
                {
                    let mainPath: path.ParsedPath = path.parse(filePath);
                    let mainRootFileInfo = Configuration.getRootFileInfo(mainPath);
                    let mainDefaults = extend({}, defaults, { rootFileInfo: mainRootFileInfo });
                    let compilePromise = compile(filePath, mainDefaults);

                    if (lastPromise)
                    {
                        lastPromise = promiseChainer(lastPromise, compilePromise);
                    }
                    else
                    {
                        lastPromise = compilePromise;
                    }
                }
                return lastPromise;
            }
        }

        // out 
        if (options.out === null || options.out === false)
        {
            // is null or false: do not compile
            return null;
        }

        let cssRelativeFilename: string;
        let out: string | boolean = options.out;
        let baseFilename: string = path.parse(lessFile).name;

        if (typeof out === "string")
        {
            // out is set: output to the given file name
            // check whether is a folder first
            let interpolatedOut = intepolatePath(out);

            cssRelativeFilename = interpolatedOut;
            let lastCharacter = cssRelativeFilename.slice(-1);
            if (lastCharacter === '/' || lastCharacter === '\\')
            {
                cssRelativeFilename += baseFilename + ".css";
            }
            else if (path.extname(cssRelativeFilename) === '')
            {
                cssRelativeFilename += '.css';
            }
        }
        else
        {
            // out is not set: output to the same basename as the less file
            cssRelativeFilename = baseFilename + ".css";
        }

        let cssFile = path.resolve(lessPath, cssRelativeFilename);
        delete options.out;

        // sourceMap
        let sourceMapFile: string;
        if (options.sourceMap)
        {
            // currently just has support for writing .map file to same directory
            let sourceMapOptions = <Less.SourceMapOption>{
                outputSourceFiles: false,
                sourceMapBasepath: lessPath,
                sourceMapFileInline: options.sourceMapFileInline,
                sourceMapRootpath: null,
            };

            if (!sourceMapOptions.sourceMapFileInline)
            {
                sourceMapFile = cssFile + '.map';
                sourceMapOptions.sourceMapURL = "./" + baseFilename + ".css.map";
            }

            options.sourceMap = sourceMapOptions;

            // options.sourceMap.sourceMapURL = options.sourceMapURL;
            // options.sourceMap.sourceMapBasepath = options.sourceMapBasepath || lessPath;
            // options.sourceMap.sourceMapRootpath = options.sourceMapRootpath;
            // options.sourceMap.outputSourceFiles = options.outputSourceFiles;
        }

        // plugins
        options.plugins = [];

        // set up the parser
        return less.render(content, options).then(output =>
        {
            return writeFileContents(cssFile, output.css).then(() =>
            {
                if (output.map && sourceMapFile)
                {
                    return writeFileContents(sourceMapFile, output.map);
                }
            });
        });
    });
}

function intepolatePath(this: void, path: string): string
{
    return (<string>path).replace(/\$\{workspaceRoot\}/g, vscode.workspace.rootPath);
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

    let interpolatedMainFilePaths: string[] = mainFiles.map(mainFile => intepolatePath(mainFile));
    let resolvedMainFilePaths: string[] = interpolatedMainFilePaths.map(mainFile => path.resolve(lessPath, mainFile));
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

            fs.writeFile(filepath, content, err => err ? reject(err) : resolve());
        });
    });
}

function readFilePromise(this: void, filename: string): Promise<Buffer>
{
    return new Promise((resolve, reject) =>
    {
        fs.readFile(filename, (err: any, buffer: Buffer) => 
        {
            if (err)
            {
                reject(err)
            }
            else
            {
                resolve(buffer);
            }
        });
    });
}
