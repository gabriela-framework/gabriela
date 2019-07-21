const callEvent = require('../events/util/callEvent');
const {HTTP_EVENTS} = require('../misc/types');

function _sendMethod(method, mdl, req, res, state, onPreResponse, onPostResponse, responseArgs) {
    try {
        if (this.__responseSent) throw new Error(`Cannot send response. Response has already been sent`);

        // handling the use case if the response is sent from onPreResponse. if this was not here
        // there would be a recursion in calling onPreResponse inifinitely. This code only handles that use case and
        // this lines of code are called only if the response is sent inside onPreResponse
        if (this.__insideSend) {
            this.__responseSent = true;

            const {code, body, headers} = responseArgs;

            res[method](code, body, headers);

            return this;
        }

        this.__insideSend = true;

        if (onPreResponse) callEvent.call(mdl.mediatorInstance, mdl, HTTP_EVENTS.ON_PRE_RESPONSE, {
            http: {req, res: this},
            state: state,
        });

        this.__insideSend = false;

        if (!this.__responseSent) {
            const {code, body, headers} = responseArgs;

            res[method](code, body, headers);
        }

        this.__responseSent = true;

        if (onPostResponse) callEvent.call(mdl.mediatorInstance, mdl, HTTP_EVENTS.ON_POST_RESPONSE, {
            http: {req, res: this},
            state: state,
        });
    } catch (e) {
        // any error can be caught with onError event
        if (mdl.hasMediators() && mdl.mediator.onError) {
            mdl.mediatorInstance.runOnError(mdl.mediator.onError, e);
        } else {
            throw e;
        }
    }
}

function factory(req, res, state, mdl, onPreResponse, onPostResponse) {
    return {
        __responseSent: false,
        __insideSend: false,

        cache(type, options) {
            return res.cache(type, options);
        },
        noCache() {
            res.noCache();

            return this;
        },
        charSet(type) {
            res.charSet(type);

            return this;
        },
        header(key, value) {
            return res.header(key, value);
        },
        json(code, body, headers) {
            _sendMethod.call(this,
                'json',
                mdl,
                req,
                res,
                state,
                onPreResponse,
                onPostResponse,
                {code, body, headers}
            );

            return this;
        },
        link(key, value) {
            return res.link(key, value);
        },
        send(code, body, headers) {
            _sendMethod.call(this,
                'send',
                mdl,
                req,
                res,
                state,
                onPreResponse,
                onPostResponse,
                {code, body, headers}
            );

            return this;
        },
        sendRaw(code, body, headers) {
            _sendMethod.call(this,
                'sendRaw',
                mdl,
                req,
                res,
                state,
                onPreResponse,
                onPostResponse,
                {code, body, headers}
            );

            return this;
        },
        set(headers) {
            res.set(headers);

            return this;
        },
        status(code) {
            return res.status(code);
        },
        redirect(param1, param2, param3) {
            return res.redirect(param1, param2, param3);
        },
    };
}

module.exports = factory;