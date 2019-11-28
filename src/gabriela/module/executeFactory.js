const runMiddleware = require('./middleware/runMiddleware');
const deepCopy = require('deepcopy');
const {MIDDLEWARE_TYPES, LOGGING_TYPES} = require('../misc/types');
const createResponseProxy = require('./_responseProxy');
const {convertToRestifyMethod} = require('../util/util');
const LoggingProxy = require('./../logging/loggerProxySingleton');

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
            name: mdl.http.name,
            path: mdl.http.path,
            method: mdl.http.method,
        }
    };

    const middleware = [
        mdl[MIDDLEWARE_TYPES.INIT],
        mdl[MIDDLEWARE_TYPES.SECURITY],
        mdl[MIDDLEWARE_TYPES.VALIDATORS],
        mdl[MIDDLEWARE_TYPES.PRE_LOGIC_TRANSFORMERS],
        mdl[MIDDLEWARE_TYPES.MODULE_LOGIC],
        mdl[MIDDLEWARE_TYPES.POST_LOGIC_TRANSFORMERS],
    ];

    return {
        httpContext,
        middleware
    };
}

function _handleError(err, mdl, httpContext = null) {
    if (err.internal) {
        if (err.message === 'done') {
            return;
        }
    }

    // throw error if it doesnt have any mediators
    if (!mdl.hasMediators()) throw err;

    // throw error if it has mediators but it does not have onError
    if (mdl.hasMediators() && !mdl.mediator.onError) throw err;

    mdl.mediatorInstance.runOnError(mdl.mediator.onError, err, httpContext);
}

function factory(server, mdl) {
    if (mdl.isHttp()) {
        return async function(mdl, context, config, state) {
            const method = convertToRestifyMethod(mdl.http.method.toLowerCase());
            const path = mdl.getFullPath();

            server[method](path, async function(req, res, next) {
                LoggingProxy.log(
                    LOGGING_TYPES.NOTICE,
                    `HTTP route recognized. Method: ${method.toUpperCase()}, route: ${path}, route name: ${mdl.http.name}`
                );

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

                httpContext.res = responseProxy;

                try {
                    for (const functions of middleware) {
                        await runMiddleware.call(context, ...[mdl, functions, config, state, httpContext]);
                    }
                } catch (e) {
                    _handleError(e, mdl, httpContext);
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
            mdl[MIDDLEWARE_TYPES.INIT],
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