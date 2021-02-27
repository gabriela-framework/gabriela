var is = require('../../util/util').is;
module.exports = function _overrideExistingMiddleware(mdl, existing, type) {
    var middlewareList = mdl[type];
    for (var newIndex in middlewareList) {
        var newMiddleware = middlewareList[newIndex];
        if (is('object', newMiddleware)) {
            var existingMiddleware = existing[type];
            var found = false;
            for (var existingIndex in existingMiddleware) {
                if (newMiddleware.name === existingMiddleware[existingIndex].name) {
                    existing[type][existingIndex] = newMiddleware;
                    found = true;
                    break;
                }
            }
            if (!found) {
                existing[type].push(newMiddleware);
            }
        }
    }
};
//# sourceMappingURL=_overrideExistingMiddleware.js.map