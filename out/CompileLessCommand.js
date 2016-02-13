var vscode = require('vscode');
var path = require('path');
var extend = require('extend');
var LessCompiler = require("./LessCompiler");
var ERROR_COLOR_CSS = "rgba(255,125,0,1)";
var ERROR_DURATION_MS = 10000;
var SUCCESS_DURATION_MS = 1500;
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
    CompileLessCommand.prototype.getGlobalOptions = function () {
        var lessFilenamePath = path.parse(this.document.fileName);
        lessFilenamePath.ext = ".css";
        lessFilenamePath.base = lessFilenamePath.name + ".css";
        var cssFilename = path.format(lessFilenamePath);
        var configuredOptions = vscode.workspace.getConfiguration("less").get("compile");
        var defaultOptions = {
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
    };
    CompileLessCommand.prototype.execute = function () {
        var _this = this;
        hideErrorMessage();
        var globalOptions = this.getGlobalOptions();
        var compilingMessage = vscode.window.setStatusBarMessage("$(zap) Compiling less --> css");
        var startTime = Date.now();
        var renderPromise = LessCompiler.compile(this.document.fileName, globalOptions)
            .then(function () {
            var elapsedTime = (Date.now() - startTime);
            compilingMessage.dispose();
            _this.lessDiagnosticCollection.set(_this.document.uri, []);
            vscode.window.setStatusBarMessage("$(check) Less compiled in " + elapsedTime + "ms", SUCCESS_DURATION_MS);
        })
            .catch(function (error) {
            var message = error.message;
            var range = new vscode.Range(0, 0, 0, 0);
            if (error.code) {
                // fs errors
                var fileSystemError = error;
                switch (fileSystemError.code) {
                    case 'EACCES':
                    case 'ENOENT':
                        message = "Cannot open file '" + fileSystemError.path + "'";
                        var firstLine = _this.document.lineAt(0);
                        range = new vscode.Range(0, 0, 0, firstLine.range.end.character);
                }
            }
            else if (error.line !== undefined && error.column !== undefined) {
                // less errors, try to highlight the affected range
                var lineIndex = error.line - 1;
                var affectedLine = _this.document.lineAt(lineIndex);
                range = new vscode.Range(lineIndex, error.column, lineIndex, affectedLine.range.end.character);
            }
            compilingMessage.dispose();
            var diagnosis = new vscode.Diagnostic(range, message, vscode.DiagnosticSeverity.Error);
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