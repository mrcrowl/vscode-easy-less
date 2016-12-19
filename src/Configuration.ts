
import * as vscode from 'vscode';
import * as path from 'path';
import * as less from 'less';
import * as extend from 'extend';

export function getGlobalOptions(filename: string): EasyLessOptions {
    let lessFilenamePath: path.ParsedPath = path.parse(filename);

    let configuredOptions: EasyLessOptions = vscode.workspace.getConfiguration("less").get<EasyLessOptions>("compile");
    let defaultOptions: EasyLessOptions = {
        plugins: [],
        rootFileInfo: getRootFileInfo(lessFilenamePath)
    };
    return extend({}, defaultOptions, configuredOptions);
}

export function getRootFileInfo(parsedPath: path.ParsedPath): Less.RootFileInfo {
    parsedPath.ext = ".css";
    parsedPath.base = parsedPath.name + ".css";

    return {
        filename: parsedPath.base,
        currentDirectory: parsedPath.dir,
        relativeUrls: true,
        entryPath: null,
        rootpath: null,
        rootFilename: null
    }
}

export interface EasyLessOptions extends Less.Options {
    main?: string | string[];
    out?: string | boolean;
    sourceMap?: any;
    // sourceMapURL?: string;
    // sourceMapBasepath?: string;
    // sourceMapRootpath?: string;
    // outputSourceFiles?: boolean;
    // sourceMapFileInline?: boolean;
    // sourceMapFilename?: string;
}