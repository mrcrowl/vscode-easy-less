var less = require('less');
var mkpath = require('mkpath');
var path = require('path');
var extend = require('extend');
var fs = require('fs');
var SUPPORTED_PER_FILE_OPTS = {
    "main": true,
    "out": true,
    "sourceMap": true,
    "compress": true,
};
// compile the given less file
function compile(lessFile, defaults) {
    return readFilePromise(lessFile).then(function (buffer) {
        var content = buffer.toString();
        var options = parseFileOptions(content, defaults);
        var lessPath = path.dirname(lessFile);
        // main is set: compile the referenced file instead
        if (options.main) {
            var mainLessFile = path.resolve(lessPath, options.main);
            if (mainLessFile != lessFile) {
                return compile(mainLessFile, defaults);
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
function parseFileOptions(content, defaults) {
    var options = extend({}, defaults);
    var firstLine = content.substr(0, content.indexOf('\n'));
    var match = /^\s*\/\/\s*(.+)/.exec(firstLine);
    if (match) {
        for (var _i = 0, _a = match[1].split(','); _i < _a.length; _i++) {
            var item = _a[_i];
            var i = item.indexOf(':');
            if (i < 0) {
                continue;
            }
            var key = item.substr(0, i).trim();
            if (!SUPPORTED_PER_FILE_OPTS.hasOwnProperty(key)) {
                continue;
            }
            var value = item.substr(i + 1).trim();
            if (value.match(/^(true|false|undefined|null|[0-9]+)$/)) {
                value = eval(value);
            }
            options[key] = value;
        }
    }
    return options;
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