// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
var vscode = require('vscode');
var CompileLessCommand = require("./CompileLessCommand");
var LESS_EXT = ".less";
var COMPILE_COMMAND = "easyLess.compile";
var lessDiagnosticCollection;
function activate(context) {
    lessDiagnosticCollection = vscode.languages.createDiagnosticCollection();
    // compile less command
    var compileLessSub = vscode.commands.registerCommand(COMPILE_COMMAND, function () {
        var activeEditor = vscode.window.activeTextEditor;
        if (activeEditor) {
            var document = activeEditor.document;
            if (document && document.fileName.endsWith(LESS_EXT)) {
                var organise = new CompileLessCommand(document, lessDiagnosticCollection);
                organise.execute();
            }
            else {
                vscode.window.showWarningMessage("This command only works for .less files.");
            }
        }
        else {
            vscode.window.showInformationMessage("This command is only available when a .less editor is open.");
        }
    });
    // automatically compile less on save
    var didSaveEvent = vscode.workspace.onDidSaveTextDocument(function (doc) {
        if (doc.fileName.endsWith(LESS_EXT)) {
            vscode.commands.executeCommand(COMPILE_COMMAND);
        }
    });
    // dismiss less errors on file close
    var didCloseEvent = vscode.workspace.onDidCloseTextDocument(function (doc) {
        if (doc.fileName.endsWith(LESS_EXT)) {
            lessDiagnosticCollection.delete(doc.uri);
        }
    });
    context.subscriptions.push(compileLessSub);
    context.subscriptions.push(didSaveEvent);
    context.subscriptions.push(didCloseEvent);
}
exports.activate = activate;
// this method is called when your extension is deactivated
function deactivate() {
    if (lessDiagnosticCollection) {
        lessDiagnosticCollection.dispose();
    }
}
exports.deactivate = deactivate;
//# sourceMappingURL=easyLess.js.map