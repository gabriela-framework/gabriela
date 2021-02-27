var HTTP_EVENTS = require('./types').HTTP_EVENTS;
var _a = require('../util/util'), is = _a.is, hasKey = _a.hasKey;
module.exports = function validateHttpEvents(events) {
    if (is('object', events) && hasKey(events, HTTP_EVENTS.ON_PRE_RESPONSE)) {
        if (!is('function', events[HTTP_EVENTS.ON_PRE_RESPONSE]))
            throw new Error("Invalid event. '" + HTTP_EVENTS.ON_PRE_RESPONSE + "' must be a function. Due to this error, the app cannot start.");
    }
    if (is('object', events) && hasKey(events, HTTP_EVENTS.ON_POST_RESPONSE)) {
        if (!is('function', events[HTTP_EVENTS.ON_POST_RESPONSE]))
            throw new Error("Invalid event. '" + HTTP_EVENTS.ON_POST_RESPONSE + "' must be a function. Due to this error, the app cannot start.");
    }
};
//# sourceMappingURL=validateHttpEvents.js.map