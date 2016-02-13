import * as less from 'less'
import * as mkpath from 'mkpath'
import * as path from 'path'
import * as extend from 'extend'
import * as fs from 'fs'

import EasyLessOptions = require("./EasyLessOptions");

const SUPPORTED_PER_FILE_OPTS = {
    "main": true,
    "out": true,
    "sourceMap": true,
    "compress": true,
};

// compile the given less file
export function compile(lessFile: string, defaults: EasyLessOptions): Promise<void>
{
    return readFilePromise(lessFile).then(buffer =>
    {
        let content: string = buffer.toString();
        let options: EasyLessOptions = parseFileOptions(content, defaults);
        let lessPath: string = path.dirname(lessFile);

        // main is set: compile the referenced file instead
        if (options.main)
        {
            let mainLessFile = path.resolve(lessPath, options.main);
            if (mainLessFile != lessFile)
            {
                return compile(mainLessFile, defaults);
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

function parseFileOptions(content: string, defaults: EasyLessOptions): EasyLessOptions
{
    let options: EasyLessOptions = extend({}, defaults);
    let firstLine: string = content.substr(0, content.indexOf('\n'));
    let match: RegExpExecArray = /^\s*\/\/\s*(.+)/.exec(firstLine);

    if (match) 
    {
        for (let item of match[1].split(',')) // string[]
        {
            let i: number = item.indexOf(':');
            if (i < 0)
            {
                continue;
            }
            let key: string = item.substr(0, i).trim();
            if (!SUPPORTED_PER_FILE_OPTS.hasOwnProperty(key))
            {
                continue;
            }

            let value: string = item.substr(i + 1).trim();
            if (value.match(/^(true|false|undefined|null|[0-9]+)$/))
            {
                value = eval(value);
            }
            options[key] = value;
        }
    }

    return options;
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
