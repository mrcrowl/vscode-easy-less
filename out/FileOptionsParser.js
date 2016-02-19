var extend = require('extend');
var SUPPORTED_PER_FILE_OPTS = {
    "main": true,
    "out": true,
    "sourceMap": true,
    "compress": true,
};
var ARRAY_OPTS = {
    "main": true,
};
function parse(line, defaults) {
    // does line start with a comment?: //
    var commentMatch = /^\s*\/\/\s*(.+)/.exec(line);
    if (!commentMatch) {
        return defaults;
    }
    var options = extend({}, defaults);
    var optionLine = commentMatch[1];
    var seenKeys = {};
    for (var _i = 0, _a = optionLine.split(','); _i < _a.length; _i++) {
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
        if (seenKeys[key] === true && ARRAY_OPTS[key]) {
            var existingValue = options[key];
            if (!Array.isArray(existingValue)) {
                existingValue = options[key] = [existingValue];
            }
            existingValue.push(value);
        }
        else {
            options[key] = value;
            seenKeys[key] = true;
        }
    }
    return options;
}
exports.parse = parse;
//# sourceMappingURL=FileOptionsParser.js.map