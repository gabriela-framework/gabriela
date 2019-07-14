const {GABRIELA_EVENTS} = require('../../misc/types');
const GenericMediator = require('../genericMediator');
const {hasKey} = require('../../util/util');
const {HTTP_EVENTS} = require('../../misc/types');

function _callSingleGabrielaEvent(event, rootCompiler, err) {
    const mediator = GenericMediator.create(rootCompiler);

    mediator.callEvent(event, {
        server: this,
        err: err,
    });
}

async function _runGabrielaEvents(events, rootCompiler, err) {
    for (const gEvent of GABRIELA_EVENTS) {
        if (hasKey(events, gEvent)) {
            if (gEvent === GABRIELA_EVENTS.ON_APP_STARTED) {
                try {
                    _callSingleGabrielaEvent.call(this, events[gEvent], rootCompiler, err);
                } catch (onAppStartedError) {
                    // error thrown inside middleware processing takes precendence over and error thrown inside onAppStarted
                    let resolvedError;
                    if (err) {
                        resolvedError = err;
                    } else if (onAppStartedError) {
                        resolvedError = onAppStartedError;
                        resolvedError.message = `An error has been thrown in 'onAppStarted' gabriela event with message: '${onAppStartedError.message}'. This is regarded as an unrecoverable error and the server has closed`;
                    }

                    if (events[GABRIELA_EVENTS.ON_CATCH_ERROR]) {
                        _callSingleGabrielaEvent.call(this, events[GABRIELA_EVENTS.ON_CATCH_ERROR], rootCompiler, resolvedError);
                    } else {
                        throw resolvedError;
                    }

                    this.close();
                }

                return;
            }

            _callSingleGabrielaEvent.call(this, events[gEvent], rootCompiler, err);
        }
    }
}

function _callSingleHttpEvent(event, http, rootCompiler) {
    const mediator = GenericMediator.create(rootCompiler, {enableAsyncHandling: true});

    mediator.callEvent(event);
}

function _callHttpEvents(events, http, rootCompiler) {
    for (const httpEvent of HTTP_EVENTS) {
        if (hasKey(events, httpEvent)) {
            const event = events[httpEvent];

            _callSingleHttpEvent(event, http, rootCompiler);
        }
    }
}

module.exports = {
    _callSingleGabrielaEvent,
    _runGabrielaEvents,
    _callHttpEvents,
    _callSingleHttpEvent,
};