var less = require('less');
var mkpath = require('mkpath');
var path = require('path');
var fs = require('fs');
var FileOptionsParser = require("./FileOptionsParser");
// compile the given less file
function compile(lessFile, defaults) {
    return readFilePromise(lessFile).then(function (buffer) {
        var content = buffer.toString();
        var options = FileOptionsParser.parse(content, defaults);
        var lessPath = path.dirname(lessFile);
        // main is set: compile the referenced file instead
        if (options.main) {
            var mainFilePaths = resolveMainFilePaths(options.main, lessPath, lessFile);
            var lastPromise = null;
            var promiseChainer = function (lastPromise, nextPromise) { return lastPromise.then(function () { return nextPromise; }); };
            if (mainFilePaths && mainFilePaths.length > 0) {
                for (var _i = 0; _i < mainFilePaths.length; _i++) {
                    var filePath = mainFilePaths[_i];
                    var compilePromise = compile(filePath, defaults);
                    if (lastPromise) {
                        lastPromise = promiseChainer(lastPromise, compilePromise);
                    }
                    else {
                        lastPromise = compilePromise;
                    }
                }
                return lastPromise;
            }
        }
        // out 
        if (options.out === null || options.out === false) {
            // is null or false: do not compile
            return null;
        }
        var cssRelativeFilename;
        var out = options.out;
        if (typeof out === "string") {
            // out is set: output to the given file name
            cssRelativeFilename = out;
            if (path.extname(cssRelativeFilename) === '') {
                cssRelativeFilename += '.css';
            }
        }
        else {
            // out is not set: output to the same basename as the less file
            cssRelativeFilename = path.parse(lessFile).name + ".css";
        }
        var cssFile = path.resolve(lessPath, cssRelativeFilename);
        delete options.out;
        // sourceMap
        var sourceMapFilename;
        if (options.sourceMap) {
            // currently just has support for writing .map file to same directory
            var sourceMapOptions = {
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
            if (!sourceMapOptions.sourceMapFileInline) {
                sourceMapFilename = cssFile + '.map';
            }
            options.sourceMap = sourceMapOptions;
        }
        // plugins
        options.plugins = [];
        // set up the parser
        return less.render(content, options).then(function (output) {
            return writeFileContents(cssFile, output.css).then(function () {
                if (output.map && sourceMapFilename) {
                    return writeFileContents(sourceMapFilename, output.map);
                }
            });
        });
    });
}
exports.compile = compile;
function resolveMainFilePaths(main, lessPath, currentLessFile) {
    var mainFiles;
    if (typeof main === "string") {
        mainFiles = [main];
    }
    else if (Array.isArray(main)) {
        mainFiles = main;
    }
    else {
        mainFiles = [];
    }
    var resolvedMailFilePaths = mainFiles.map(function (mainFile) { return path.resolve(lessPath, mainFile); });
    if (resolvedMailFilePaths.indexOf(currentLessFile) >= 0) {
        return []; // avoid infinite loops
    }
    return resolvedMailFilePaths;
}
// writes a file's contents in a path where directories may or may not yet exist
function writeFileContents(filepath, content) {
    return new Promise(function (resolve, reject) {
        mkpath(path.dirname(filepath), function (err) {
            if (err) {
                return reject(err);
            }
            fs.writeFile(filepath, content, function (err) { return err ? reject(err) : resolve(); });
        });
    });
}
function readFilePromise(filename) {
    return new Promise(function (resolve, reject) {
        fs.readFile(filename, function (err, buffer) {
            if (err) {
                reject(err);
            }
            else {
                resolve(buffer);
            }
        });
    });
}
//# sourceMappingURL=LessCompiler.js.map