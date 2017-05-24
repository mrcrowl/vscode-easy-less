// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import CompileLessCommand = require("./CompileLessCommand");

const LESS_EXT = ".less";
const COMPILE_COMMAND = "easyLess.compile";

let lessDiagnosticCollection: vscode.DiagnosticCollection;

export function activate(context: vscode.ExtensionContext)
{
    lessDiagnosticCollection = vscode.languages.createDiagnosticCollection();

    // compile less command
    const compileLessSub = vscode.commands.registerCommand(COMPILE_COMMAND, (document?: vscode.TextDocument) =>
    {
        // if no document argument given, use the active text editor
        if (!document)
        {
            const activeEditor: vscode.TextEditor = vscode.window.activeTextEditor;
            if (activeEditor)
            {
                document = activeEditor.document;
            }
            else
            {
                vscode.window.showInformationMessage("This command is only available when a .less editor is open.");
                return;
            }
        }

        if (document.fileName.endsWith(LESS_EXT))
        {
            const organise = new CompileLessCommand(document, lessDiagnosticCollection);
            organise.execute();
        }
        else
        {
            vscode.window.showWarningMessage("This command only works for .less files.");
        }
    });

    // automatically compile less on save
    const willSaveEvent = vscode.workspace.onWillSaveTextDocument(e =>
    {
        if (e.document.fileName.endsWith(LESS_EXT))
        {
            vscode.commands.executeCommand(COMPILE_COMMAND, e.document);
        }
    });

    // dismiss less errors on file close
    const didCloseEvent = vscode.workspace.onDidCloseTextDocument((doc: vscode.TextDocument) =>
    {
        if (doc.fileName.endsWith(LESS_EXT))
        {
            lessDiagnosticCollection.delete(doc.uri);
        }
    })

    context.subscriptions.push(compileLessSub);
    context.subscriptions.push(willSaveEvent);
    context.subscriptions.push(didCloseEvent);
}

// this method is called when your extension is deactivated
export function deactivate()
{
    if (lessDiagnosticCollection)
    {
        lessDiagnosticCollection.dispose();
    }
}
