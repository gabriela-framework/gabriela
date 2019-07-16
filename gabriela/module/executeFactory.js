const runMiddleware = require('./middleware/runMiddleware');
const deepCopy = require('deepcopy');
const {MIDDLEWARE_TYPES, HTTP_EVENTS} = require('../misc/types');
const callEvent = require('../events/util/callEvent');

function _createResponseProxy(req, res, state, mdl, onPreResponse, onPostResponse) {
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
            return res.json(code, body, headers);
        },
        link(key, value) {
            return res.link(key, value);
        },
        send(code, body, headers) {
            try {
                if (this.__responseSent) throw new Error(`Cannot send response. Response has already been sent`);

                // handling the use case if the response is sent from onPreResponse. if this was not here
                // there would be a recursion in calling onPreResponse inifinitely. This code only handles that use case and
                // this lines of code are called only if the response is sent inside onPreResponse
                if (this.__insideSend) {
                    this.__responseSent = true;

                    res.send(code, body, headers);

                    return this;
                }

                this.__insideSend = true;

                if (onPreResponse) callEvent.call(mdl.mediatorInstance, mdl, HTTP_EVENTS.ON_PRE_RESPONSE, {
                    http: {req, res: this},
                    state: state,
                });

                this.__insideSend = false;

                if (!this.__responseSent) res.send(code, body, headers);

                this.__responseSent = true;

                if (onPostResponse) callEvent.call(mdl.mediatorInstance, mdl, HTTP_EVENTS.ON_POST_RESPONSE, {
                    http: {req, res: this},
                    state: state,
                });

                return this;
            } catch (e) {
                // any error can be caught with onError event
                if (mdl.hasMediators() && mdl.mediator.onError) {
                    mdl.mediatorInstance.runOnError(mdl.mediator.onError, e);
                } else {
                    throw e;
                }
            }
        },
        sendRaw(code, body, headers) {
            res.sendRaw(code, body, headers);

            return this;
        },
        set(name, value) {
            res.set(name, value);

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

function _getResponseEvents(mdl) {
    if (mdl.hasMediators()) {
        return {
            onPreResponse: mdl.mediator.onPreResponse,
            onPostResponse: mdl.mediator.onPostResponse,
        };
    }

    return {};
}

function _createWorkingDataStructures(mdl, req, res) {
    const httpContext = {
        req,
    };

    const middleware = [
        mdl[MIDDLEWARE_TYPES.SECURITY],
        mdl[MIDDLEWARE_TYPES.PRE_LOGIC_TRANSFORMERS],
        mdl[MIDDLEWARE_TYPES.VALIDATORS],
        mdl[MIDDLEWARE_TYPES.MODULE_LOGIC],
        mdl[MIDDLEWARE_TYPES.POST_LOGIC_TRANSFORMERS],
    ];

    return {
        httpContext,
        middleware
    };
}

function factory(server, mdl) {
    if (mdl.isHttp()) {
        return async function(mdl, context, config, state) {
            const {http} = mdl;
            const method = http.route.method.toLowerCase();
            const path = http.route.path;

            server[method](path, async function(req, res, next) {
                const {httpContext, middleware} = _createWorkingDataStructures(mdl, req, res);
                const responseEvent = _getResponseEvents(mdl);

                const responseProxy = _createResponseProxy(
                    req,
                    res,
                    state,
                    mdl,
                    responseEvent.onPreResponse,
                    responseEvent.onPostResponse,
                );

                httpContext.res = responseProxy;

                for (const functions of middleware) {
                    await runMiddleware.call(context, ...[mdl, functions, config, state, httpContext]);
                }

                if (!responseProxy.__responseSent) {
                    responseProxy.send(200, deepCopy(state));
                }

                return next();
            });
        }
    }

    return async function(mdl, context, config, state) {
        const middleware = [
            mdl[MIDDLEWARE_TYPES.SECURITY],
            mdl[MIDDLEWARE_TYPES.PRE_LOGIC_TRANSFORMERS],
            mdl[MIDDLEWARE_TYPES.VALIDATORS],
            mdl[MIDDLEWARE_TYPES.MODULE_LOGIC],
            mdl[MIDDLEWARE_TYPES.POST_LOGIC_TRANSFORMERS],
        ];

        for (const functions of middleware) {
            await runMiddleware.call(context, ...[mdl, functions, config, state, null]);
        }
    };
}

module.exports = factory;