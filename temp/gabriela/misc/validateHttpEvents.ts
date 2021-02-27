import {HTTP_EVENTS} from "./AppTypes";
import {is, hasKey} from "../util/Util";

export default function validateHttpEvents(events: AppEvents) {
    if (is('object', events) && hasKey<AppEvents>(events, HTTP_EVENTS.ON_PRE_RESPONSE)) {
        if (!is('function', events[HTTP_EVENTS.ON_PRE_RESPONSE])) throw new Error(`Invalid event. '${HTTP_EVENTS.ON_PRE_RESPONSE}' must be a function. Due to this error, the app cannot start.`);
    }

    if (is('object', events) && hasKey<AppEvents>(events, HTTP_EVENTS.ON_POST_RESPONSE)) {
        if (!is('function', events[HTTP_EVENTS.ON_POST_RESPONSE])) throw new Error(`Invalid event. '${HTTP_EVENTS.ON_POST_RESPONSE}' must be a function. Due to this error, the app cannot start.`);
    }
}
