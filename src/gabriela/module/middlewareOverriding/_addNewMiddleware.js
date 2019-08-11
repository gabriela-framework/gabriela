module.exports = function _addNewMiddleware(newMdl, existing, type) {
    existing[type] = newMdl[type];
};