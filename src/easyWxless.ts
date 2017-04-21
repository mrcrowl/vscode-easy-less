// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import CompileLessCommand = require("./CompileLessCommand");

const LESS_EXT = ".less";
const COMPILE_COMMAND = "easyWxless.compile";

let lessDiagnosticCollection;

export function activate(context: vscode.ExtensionContext)
{
    lessDiagnosticCollection = vscode.languages.createDiagnosticCollection();
    
    // compile less command
    let compileLessSub = vscode.commands.registerCommand(COMPILE_COMMAND, () =>
    {
        let activeEditor: vscode.TextEditor = vscode.window.activeTextEditor;
        if (activeEditor)
        {
            let document: vscode.TextDocument = activeEditor.document;
            if (document && document.fileName.endsWith(LESS_EXT))
            {
                let organise = new CompileLessCommand(document, lessDiagnosticCollection);
                organise.execute();
            }
            else
            {
                vscode.window.showWarningMessage("This command only works for .less files.");
            }
        }
        else
        {
            vscode.window.showInformationMessage("This command is only available when a .less editor is open.");
        }
    });
    
    // automatically compile less on save
    let didSaveEvent = vscode.workspace.onDidSaveTextDocument((doc: vscode.TextDocument) =>
    {
        if (doc.fileName.endsWith(LESS_EXT))
        {
            vscode.commands.executeCommand(COMPILE_COMMAND);
        }
    });
    
    // dismiss less errors on file close
    let didCloseEvent = vscode.workspace.onDidCloseTextDocument((doc: vscode.TextDocument) =>
    {
        if (doc.fileName.endsWith(LESS_EXT))
        {
            lessDiagnosticCollection.delete(doc.uri);
        }
    })

    context.subscriptions.push(compileLessSub);
    context.subscriptions.push(didSaveEvent);
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