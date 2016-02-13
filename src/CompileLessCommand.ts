
import * as vscode from 'vscode'
import * as less from 'less'
import * as path from 'path'
import * as fs from 'fs'
import * as extend from 'extend'

import EasyLessOptions = require("./EasyLessOptions");
import LessCompiler = require("./LessCompiler");

const ERROR_COLOR_CSS = "rgba(255,125,0,1)";
const ERROR_DURATION_MS = 10000;
const SUCCESS_DURATION_MS = 1500;

let errorMessage: vscode.StatusBarItem;

function hideErrorMessage()
{
    if (errorMessage)
    {
        errorMessage.hide();
        errorMessage = null;
    }
}

class CompileLessCommand
{
    public constructor(
        private document: vscode.TextDocument,
        private lessDiagnosticCollection: vscode.DiagnosticCollection)
    {
    }

    private getGlobalOptions(): EasyLessOptions
    {
        let lessFilenamePath: path.ParsedPath = path.parse(this.document.fileName);
        lessFilenamePath.ext = ".css";
        lessFilenamePath.base = lessFilenamePath.name + ".css";
        let cssFilename: string = path.format(lessFilenamePath);

        let configuredOptions: EasyLessOptions = vscode.workspace.getConfiguration("less").get<EasyLessOptions>("compile");
        let defaultOptions: EasyLessOptions = {
            plugins: [],
            rootFileInfo: {
                filename: lessFilenamePath.base,
                currentDirectory: lessFilenamePath.dir,
                relativeUrls: true,
                entryPath: null,
                rootpath: null,
                rootFilename: null
            }
        };
        return extend({}, defaultOptions, configuredOptions);
    }

    public execute()
    {
        hideErrorMessage();
        
        let globalOptions: EasyLessOptions = this.getGlobalOptions();
        let compilingMessage: vscode.Disposable = vscode.window.setStatusBarMessage("$(zap) Compiling less --> css");
        let startTime: number = Date.now();
        let renderPromise = LessCompiler.compile(this.document.fileName, globalOptions)
            .then(() =>
            {
                let elapsedTime: number = (Date.now() - startTime);
                compilingMessage.dispose();
                this.lessDiagnosticCollection.set(this.document.uri, []);

                vscode.window.setStatusBarMessage(`$(check) Less compiled in ${elapsedTime}ms`, SUCCESS_DURATION_MS);
            })
            .catch((error: any) =>
            {
                let message: string = error.message;
                let range: vscode.Range = new vscode.Range(0, 0, 0, 0);

                if (error.code)
                {
                    // fs errors
                    let fileSystemError = <FileSystemError>error;
                    switch (fileSystemError.code)
                    {
                        case 'EACCES':
                        case 'ENOENT':
                            message = `Cannot open file '${fileSystemError.path}'`;
                            let firstLine: vscode.TextLine = this.document.lineAt(0);
                            range = new vscode.Range(0, 0, 0, firstLine.range.end.character);
                    }
                }
                else if (error.line !== undefined && error.column !== undefined)
                {
                    // less errors, try to highlight the affected range
                    let lineIndex: number = error.line - 1;
                    let affectedLine: vscode.TextLine = this.document.lineAt(lineIndex);
                    range = new vscode.Range(lineIndex, error.column, lineIndex, affectedLine.range.end.character);
                }

                compilingMessage.dispose();
                let diagnosis = new vscode.Diagnostic(range, message, vscode.DiagnosticSeverity.Error);
                this.lessDiagnosticCollection.set(this.document.uri, [diagnosis]);
                errorMessage = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left, 0);
                errorMessage.text = "$(alert) Error compiling less (more detail in Errors and Warnings)";
                errorMessage.command = "workbench.action.showErrorsWarnings";
                errorMessage.color = ERROR_COLOR_CSS;
                errorMessage.show();
                setTimeout(hideErrorMessage, ERROR_DURATION_MS);
            });
    }
}

export = CompileLessCommand;