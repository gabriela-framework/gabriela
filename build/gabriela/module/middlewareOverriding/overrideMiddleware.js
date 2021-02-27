var MIDDLEWARE_TYPES = require('../../misc/types').MIDDLEWARE_TYPES;
var _overrideExistingMiddleware = require('./_overrideExistingMiddleware');
var _addNewMiddleware = require('./_addNewMiddleware');
module.exports = function _overrideMiddleware(newMdl, existing) {
    for (var _i = 0, MIDDLEWARE_TYPES_1 = MIDDLEWARE_TYPES; _i < MIDDLEWARE_TYPES_1.length; _i++) {
        var type = MIDDLEWARE_TYPES_1[_i];
        if (newMdl[type] && existing[type]) {
            _overrideExistingMiddleware(newMdl, existing, type);
        }
        else if (newMdl[type] && !existing[type]) {
            _addNewMiddleware(newMdl, existing, type);
        }
    }
};
//# sourceMappingURL=overrideMiddleware.js.map