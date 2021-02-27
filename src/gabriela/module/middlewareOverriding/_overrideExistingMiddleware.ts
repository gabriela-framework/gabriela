const {is} = require('../../util/util');

module.exports = function _overrideExistingMiddleware(mdl, existing, type) {
    const middlewareList = mdl[type];

    for (const newIndex in middlewareList) {
        const newMiddleware = middlewareList[newIndex];

        if (is('object', newMiddleware)) {
            const existingMiddleware = existing[type];

            let found = false;
            for (const existingIndex in existingMiddleware) {
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