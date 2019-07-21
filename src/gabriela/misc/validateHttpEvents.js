const {HTTP_EVENTS} = require('./types');
const {is, hasKey} = require('../util/util');

module.exports = function validateHttpEvents(events) {
    if (is('object', events) && hasKey(events, HTTP_EVENTS.ON_PRE_RESPONSE)) {
        if (!is('function', events[HTTP_EVENTS.ON_PRE_RESPONSE])) throw new Error(`Invalid event. '${HTTP_EVENTS.ON_PRE_RESPONSE}' must be a function. Due to this error, the server cannot start.`);
    }

    if (is('object', events) && hasKey(events, HTTP_EVENTS.ON_POST_RESPONSE)) {
        if (!is('function', events[HTTP_EVENTS.ON_POST_RESPONSE])) throw new Error(`Invalid event. '${HTTP_EVENTS.ON_POST_RESPONSE}' must be a function. Due to this error, the server cannot start.`);
    }
};