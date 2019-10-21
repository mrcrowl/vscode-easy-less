
import * as vscode from 'vscode';
import * as path from 'path';
import * as less from 'less';
import * as extend from 'extend';

export function getGlobalOptions(filename: string): EasyLessOptions {
    const lessFilenamePath: path.ParsedPath = path.parse(filename);
    const defaultOptions: EasyLessOptions = {
        plugins: [],
        rootFileInfo: getRootFileInfo(lessFilenamePath),
        relativeUrls: false
    };

    const configuredOptions: EasyLessOptions = vscode.workspace.getConfiguration("less").get<EasyLessOptions>("compile");
    return extend({}, defaultOptions, configuredOptions);
}

export function getRootFileInfo(parsedPath: path.ParsedPath): Less.RootFileInfo {
    parsedPath.ext = ".less";
    parsedPath.base = parsedPath.name + ".less";

    return {
        filename: parsedPath.base,
        currentDirectory: parsedPath.dir,
        relativeUrls: false,
        entryPath: parsedPath.dir + "/",
        rootpath: null,
        rootFilename: null
    }
}

export interface EasyLessOptions extends Less.Options {
    main?: string | string[];
    out?: string | boolean;
    outExt?: string;
    sourceMap?: any;
    relativeUrls?: boolean;
    sourceMapFileInline?: boolean;
    autoprefixer?: string | string[];
    javascriptEnabled?: boolean;
    // sourceMapURL?: string;
    // sourceMapBasepath?: string;
    // sourceMapRootpath?: string;
    // outputSourceFiles?: boolean;
    // sourceMapFilename?: string;
}