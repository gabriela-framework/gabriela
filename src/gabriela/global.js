Object.filter = function (obj, predicate) {
    var keys = Object.keys(obj);
    var newObj = {};
    keys.filter(function (key) {
        var ok = predicate.call(null, key, obj[key]);
        if (ok)
            newObj[key] = obj[key];
    });
    return newObj;
};
//# sourceMappingURL=global.js.map