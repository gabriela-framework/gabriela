const { MIDDLEWARE_TYPES } = require('../../misc/types');
const _overrideExistingMiddleware = require('./_overrideExistingMiddleware');
const _addNewMiddleware = require('./_addNewMiddleware');

module.exports = function _overrideMiddleware(newMdl, existing) {
    for (const type of MIDDLEWARE_TYPES) {
        if (newMdl[type] && existing[type]) {
            _overrideExistingMiddleware(newMdl, existing, type);
        } else if (newMdl[type] && !existing[type]) {
            _addNewMiddleware(newMdl, existing, type);
        }
    }
};