const runMiddleware = require('./middleware/runMiddleware');
const deepCopy = require('deepcopy');
const {MIDDLEWARE_TYPES, PROTOCOLS} = require('../misc/types');
const createResponseProxy = require('./_responseProxy');

function _getResponseEvents(mdl) {
    if (mdl.hasMediators()) {
        return {
            onPreResponse: mdl.mediator.onPreResponse,
            onPostResponse: mdl.mediator.onPostResponse,
        };
    }

    return {};
}

function _createWorkingDataStructures(mdl, req) {
    const httpContext = {
        req,
        route: {
            name: mdl.http.route.name,
            path: mdl.http.route.path,
            method: mdl.http.route.method,
        }
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

function _handleError(err, mdl) {
    if (err.internal) {
        if (err.message === 'done') {
            return;
        }
    }

    // throw error if it doesnt have any mediators
    if (!mdl.hasMediators()) throw err;

    // throw error if it has mediators but it does not have onError
    if (mdl.hasMediators() && !mdl.mediator.onError) throw err;

    mdl.mediatorInstance.runOnError(mdl.mediator.onError, err);
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

                const responseProxy = createResponseProxy(
                    req,
                    res,
                    state,
                    mdl,
                    responseEvent.onPreResponse,
                    responseEvent.onPostResponse,
                    next,
                );

                /**
                 * Protocols feature does not make any sense since I have to create http request do not go into
                 * secure server
                 *
                 * TODO: Decide on the protocols feature
                 */
                if (http.route.protocols) {
                    const protocols = http.route.protocols;
                    const currentProtocol = (req.isSecure()) ? 'https' : 'http';

                    if (!protocols.includes(currentProtocol)) {
                        return responseProxy.send(400, 'Invalid protocol');
                    }
                }

                httpContext.res = responseProxy;

                try {
                    for (const functions of middleware) {
                        await runMiddleware.call(context, ...[mdl, functions, config, state, httpContext]);
                    }
                } catch (e) {
                    _handleError(e, mdl);
                }

                if (!responseProxy.__responseSent) {
                    responseProxy.send(200, deepCopy(state));
                }

                if (!responseProxy.__isRedirect) return next();
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