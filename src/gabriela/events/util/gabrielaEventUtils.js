const {GABRIELA_EVENTS} = require('../../misc/types');
const GenericMediator = require('../genericMediator');
const {hasKey} = require('../../util/util');
const {LOGGING_TYPES} = require('../../misc/types');

/**
 * Calls a single gabriela event from the generic mediator.
 * @param event
 * @param rootCompiler
 * @param err
 */
function callSingleGabrielaEvent(event, rootCompiler, err) {
    const mediator = GenericMediator.create(rootCompiler);

    if (err) return mediator.runOnError(event, this, err);

    mediator.callEvent(event, this);
}

async function runOnAppStarted(events, rootCompiler, err) {
    if (!hasKey(events, GABRIELA_EVENTS.ON_APP_STARTED)) {
        return;
    }

    /**
     * try/catch block is here because an error can be thrown from onAppStarted too.
     *
     * If the error is thrown from onAppStarted, err argument will be null. If the err argument is
     * not null, that argument takes precendence over onAppStarted throw error.
     *
     * If onCatchError event exists, that event will be called and the caller has to decide whether to
     * close the server/process or to continue.
     *
     * If onCatchError does not exist, the error is thrown.
     */
    try {
        callSingleGabrielaEvent.call(this, events[GABRIELA_EVENTS.ON_APP_STARTED], rootCompiler, err);
    } catch (eventError) {
        eventError.message = `An error has been thrown in '${GABRIELA_EVENTS.ON_APP_STARTED}' gabriela event with message: '${eventError.message}'. This is regarded as an unrecoverable error and the server has closed`;

        if (events[GABRIELA_EVENTS.ON_CATCH_ERROR]) {
            return callSingleGabrielaEvent.call(this, events[GABRIELA_EVENTS.ON_CATCH_ERROR], rootCompiler, eventError);
        }

        // CANNOT BE TESTED SINCE MOCHA WON'T LET ME CATCH THIS ERROR
        throw eventError;
    }
}

module.exports = {
    callSingleGabrielaEvent,
    runOnAppStarted,
};
