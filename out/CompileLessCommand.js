var vscode = require('vscode');
var less = require('less');
var path = require('path');
var fs = require('fs');
var ERROR_COLOR_CSS = "rgba(255,125,0,1)";
var ERROR_DURATION_MS = 10000;
var SUCCESS_DURATION_MS = 1500;
var CSS_EXT = ".css";
var errorMessage;
function hideErrorMessage() {
    if (errorMessage) {
        errorMessage.hide();
        errorMessage = null;
    }
}
var CompileLessCommand = (function () {
    function CompileLessCommand(document, lessDiagnosticCollection) {
        this.document = document;
        this.lessDiagnosticCollection = lessDiagnosticCollection;
    }
    CompileLessCommand.prototype.execute = function () {
        var _this = this;
        var lessFilenamePath = path.parse(this.document.fileName);
        lessFilenamePath.ext = CSS_EXT;
        lessFilenamePath.base = lessFilenamePath.name + CSS_EXT;
        var cssFilename = path.format(lessFilenamePath);
        var options = {
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
        var compilingMessage = vscode.window.setStatusBarMessage("$(zap) Compiling less --> css");
        var documentText = this.document.getText();
        var startTime = Date.now();
        var renderPromise = less.render(documentText, options).then(function (renderOutput) {
            // output css
            fs.writeFile(cssFilename, renderOutput.css);
            var elapsedTime = (Date.now() - startTime);
            compilingMessage.dispose();
            _this.lessDiagnosticCollection.set(_this.document.uri, []);
            vscode.window.setStatusBarMessage("$(check) Less compiled in " + elapsedTime + "ms", SUCCESS_DURATION_MS);
        });
        renderPromise.catch(function (error) {
            // compile error
            compilingMessage.dispose();
            var lineIndex = error.line - 1;
            var affectedLine = _this.document.lineAt(lineIndex);
            var range = error.line ? new vscode.Range(lineIndex, error.column, lineIndex, affectedLine.range.end.character) : null;
            var diagnosis = new vscode.Diagnostic(range, error.message, vscode.DiagnosticSeverity.Error);
            _this.lessDiagnosticCollection.set(_this.document.uri, [diagnosis]);
            errorMessage = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left, 0);
            errorMessage.text = "$(alert) Error compiling less (more detail in Errors and Warnings)";
            errorMessage.command = "workbench.action.showErrorsWarnings";
            errorMessage.color = ERROR_COLOR_CSS;
            errorMessage.show();
            setTimeout(hideErrorMessage, ERROR_DURATION_MS);
        });
    };
    return CompileLessCommand;
})();
module.exports = CompileLessCommand;
//# sourceMappingURL=CompileLessCommand.js.map