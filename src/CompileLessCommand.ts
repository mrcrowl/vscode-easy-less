
import * as vscode from 'vscode'
import * as less from 'less'
import * as path from 'path'
import * as fs from 'fs'

const ERROR_COLOR_CSS = "rgba(255,125,0,1)";
const ERROR_DURATION_MS = 10000;
const SUCCESS_DURATION_MS = 1500;
const CSS_EXT = ".css";

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

    public execute()
    {
        let lessFilenamePath: path.ParsedPath = path.parse(this.document.fileName);
        lessFilenamePath.ext = CSS_EXT;
        lessFilenamePath.base = lessFilenamePath.name + CSS_EXT;
        let cssFilename: string = path.format(lessFilenamePath);

        let options: Less.Options = {
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

        hideErrorMessage();
        let compilingMessage: vscode.Disposable = vscode.window.setStatusBarMessage("$(zap) Compiling less --> css");
        let documentText: string = this.document.getText();
        let startTime: number = Date.now();
        let renderPromise = less.render(documentText, options).then((renderOutput: Less.RenderOutput) =>
        {
            // output css
            fs.writeFile(cssFilename, renderOutput.css);
            let elapsedTime: number = (Date.now() - startTime);
            compilingMessage.dispose();
            this.lessDiagnosticCollection.set(this.document.uri, []);

            vscode.window.setStatusBarMessage(`$(check) Less compiled in ${elapsedTime}ms`, SUCCESS_DURATION_MS);
        });

        renderPromise.catch((error: Less.RenderError) =>
        {
            // compile error
            compilingMessage.dispose();
            let lineIndex: number = error.line - 1;
            let affectedLine: vscode.TextLine = this.document.lineAt(lineIndex);
            let range: vscode.Range = error.line ? new vscode.Range(lineIndex, error.column, lineIndex, affectedLine.range.end.character) : null;
            let diagnosis = new vscode.Diagnostic(range, error.message, vscode.DiagnosticSeverity.Error);
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