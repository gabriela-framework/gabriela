const runMiddleware = require('./middleware/runMiddleware');
const deepCopy = require('deepcopy');
const {MIDDLEWARE_TYPES, HTTP_EVENTS} = require('../misc/types');
const callEvent = require('../events/util/callEvent');

function _createResponseProxy(res) {
    return {
        __responseSent: false,
        cache(type, options) {
            return res.cache(type, options);
        },
        noCache() {
            return res.noCache();
        },
        charSet(type) {
            return res.charSet(type);
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
            const result = res.send(code, body, headers);

            this.__responseSent = true;

            return result;
        },
        sendRaw(code, body, headers) {
            return res.sendRaw(code, body, headers);
        },
        set(name, value) {
            return res.set(name, value);
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
    const responseProxy = _createResponseProxy(res);

    const httpContext = {
        req,
        res: responseProxy,
    };

    const middleware = [
        mdl[MIDDLEWARE_TYPES.SECURITY],
        mdl[MIDDLEWARE_TYPES.PRE_LOGIC_TRANSFORMERS],
        mdl[MIDDLEWARE_TYPES.VALIDATORS],
        mdl[MIDDLEWARE_TYPES.MODULE_LOGIC],
        mdl[MIDDLEWARE_TYPES.POST_LOGIC_TRANSFORMERS],
    ];

    return {
        responseProxy,
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
                const {responseProxy, httpContext, middleware} = _createWorkingDataStructures(mdl, req, res);

                for (const functions of middleware) {
                    await runMiddleware.call(context, ...[mdl, functions, config, state, httpContext]);
                }

                const responseEvents = _getResponseEvents(mdl);

                /**
                 * If the response is sent within the middleware handling, then only emit onPostResponse event
                 * and from this request
                 */
                if (responseProxy.__responseSent) {
                    if (responseEvents.onPostResponse) callEvent.call(mdl.mediatorInstance, mdl, HTTP_EVENTS.ON_PRE_RESPONSE, {
                        http: httpContext,
                        state: state,
                    });

                    return next();
                }

                /**
                 * If the response is not sent from the middleware handling, call the onPreResponse event
                 */
                if (responseEvents.onPreResponse) callEvent.call(mdl.mediatorInstance, mdl, HTTP_EVENTS.ON_PRE_RESPONSE, {
                    http: httpContext,
                    state: state,
                });

                /**
                 * If the response is sent from inside onPreResponse event, call the onPostResponse event
                 * and exit from this request
                 */
                if (responseProxy.__responseSent) {
                    if (responseEvents.onPostResponse) callEvent.call(mdl.mediatorInstance, mdl, HTTP_EVENTS.ON_POST_RESPONSE, {
                        http: httpContext,
                        state: state,
                    });

                    return next();
                }

                /**
                 * If the response is not sent either from the middleware handling or from the onPreResponse event,
                 * automatically send the response and fire onPostResponse event. Then, exit this request
                 */
                responseProxy.send(200, deepCopy(state));

                if (responseEvents.onPostResponse) callEvent.call(mdl.mediatorInstance, mdl, HTTP_EVENTS.ON_POST_RESPONSE, {
                    http: httpContext,
                    state: state,
                });

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