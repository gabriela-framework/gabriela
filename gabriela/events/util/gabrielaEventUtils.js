const {GABRIELA_EVENTS} = require('../../misc/types');
const GenericMediator = require('../genericMediator');
const {hasKey} = require('../../util/util');

function callSingleGabrielaEvent(event, rootCompiler, err) {
    const mediator = GenericMediator.create(rootCompiler);

    mediator.callEvent(event, {
        server: this,
        err: err,
    });
}

async function runOnAppStarted(events, rootCompiler, err) {
    if (!hasKey(events, GABRIELA_EVENTS.ON_APP_STARTED)) return;

    try {
        callSingleGabrielaEvent.call(this, events[GABRIELA_EVENTS.ON_APP_STARTED], rootCompiler, err);
    } catch (onAppStartedError) {
        // error thrown inside middleware processing takes precendence over an error thrown inside onAppStarted
        let resolvedError;
        if (err) {
            resolvedError = err;
        } else if (onAppStartedError) {
            resolvedError = onAppStartedError;
            resolvedError.message = `An error has been thrown in 'onAppStarted' gabriela event with message: '${onAppStartedError.message}'. This is regarded as an unrecoverable error and the server has closed`;
        }

        if (events[GABRIELA_EVENTS.ON_CATCH_ERROR]) {
            callSingleGabrielaEvent.call(this, events[GABRIELA_EVENTS.ON_CATCH_ERROR], rootCompiler, resolvedError);
        } else {
            throw resolvedError;
        }

        this.close();
    }
}

module.exports = {
    callSingleGabrielaEvent,
    runOnAppStarted,
};