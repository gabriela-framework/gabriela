var GABRIELA_EVENTS = require('./types').GABRIELA_EVENTS;
var _a = require('../util/util'), is = _a.is, hasKey = _a.hasKey;
module.exports = function validateGabrielaEvents(events) {
    if (is('object', events) && hasKey(events, GABRIELA_EVENTS.ON_APP_STARTED)) {
        if (!is('function', events[GABRIELA_EVENTS.ON_APP_STARTED]))
            throw new Error("Invalid event. '" + GABRIELA_EVENTS.ON_APP_STARTED + "' must be a function. Due to this error, the app cannot start.");
    }
    if (is('object', events) && hasKey(events, GABRIELA_EVENTS.ON_CATCH_ERROR)) {
        if (!is('function', events[GABRIELA_EVENTS.ON_CATCH_ERROR]))
            throw new Error("Invalid event. '" + GABRIELA_EVENTS.ON_CATCH_ERROR + "' must be a function. Due to this error, the app cannot start.");
    }
};
//# sourceMappingURL=validateGabrielaEvents.js.map