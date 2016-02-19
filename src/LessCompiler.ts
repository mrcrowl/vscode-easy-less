import * as less from 'less'
import * as mkpath from 'mkpath'
import * as path from 'path'
import * as extend from 'extend'
import * as fs from 'fs'

import EasyLessOptions = require("./EasyLessOptions");
import FileOptionsParser = require("./FileOptionsParser");

// compile the given less file
export function compile(lessFile: string, defaults: EasyLessOptions): Promise<void>
{
    return readFilePromise(lessFile).then(buffer =>
    {
        let content: string = buffer.toString();
        let options: EasyLessOptions = FileOptionsParser.parse(content, defaults);
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
                    let compilePromise = compile(filePath, defaults);
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
        if (typeof out === "string")
        {
            // out is set: output to the given file name
            cssRelativeFilename = out;
            if (path.extname(cssRelativeFilename) === '')
            {
                cssRelativeFilename += '.css';
            }
        }
        else
        {
            // out is not set: output to the same basename as the less file
            cssRelativeFilename = path.parse(lessFile).name + ".css";
        }

        let cssFile = path.resolve(lessPath, cssRelativeFilename);
        delete options.out;
        
        // sourceMap
        let sourceMapFilename: string;
        if (options.sourceMap)
        {
            // currently just has support for writing .map file to same directory
            let sourceMapOptions = <Less.SourceMapOption>{
                outputSourceFiles: false,
                sourceMapBasepath: lessPath,
                sourceMapFileInline: false,
                sourceMapRootpath: null,
                sourceMapURL: null
            };
            
            // options.sourceMap.sourceMapURL = options.sourceMapURL;
            // options.sourceMap.sourceMapBasepath = options.sourceMapBasepath || lessPath;
            // options.sourceMap.sourceMapRootpath = options.sourceMapRootpath;
            // options.sourceMap.outputSourceFiles = options.outputSourceFiles;
            // options.sourceMap.sourceMapFileInline = options.sourceMapFileInline;
            
            if (!sourceMapOptions.sourceMapFileInline)
            {
                sourceMapFilename = cssFile + '.map';
            }

            options.sourceMap = sourceMapOptions;
        }        
        
        // plugins
        options.plugins = [];

        // set up the parser
        return less.render(content, options).then(output =>
        {
            return writeFileContents(cssFile, output.css).then(() =>
            {
                if (output.map && sourceMapFilename)
                {
                    return writeFileContents(sourceMapFilename, output.map);
                }
            });
        });
    });
}


function resolveMainFilePaths(main: string | string[], lessPath: string, currentLessFile: string): string[]
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
   
    let resolvedMailFilePaths: string[] =  mainFiles.map(mainFile => path.resolve(lessPath, mainFile));
    if (resolvedMailFilePaths.indexOf(currentLessFile) >= 0)
    {
        return []; // avoid infinite loops
    }

    return resolvedMailFilePaths;
}

// writes a file's contents in a path where directories may or may not yet exist
function writeFileContents(filepath: string, content: any): Promise<any>
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

function readFilePromise(filename: string): Promise<Buffer>
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
