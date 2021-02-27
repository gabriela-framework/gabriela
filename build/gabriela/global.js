"use strict";
exports.__esModule = true;
function filterObject(obj, predicate) {
    var keys = Object.keys(obj);
    var newObj = {};
    keys.filter(function (key) {
        var ok = predicate(key, obj[key]);
        if (ok)
            newObj[key] = obj[key];
    });
    return newObj;
}
;
exports["default"] = filterObject;
//# sourceMappingURL=global.js.map