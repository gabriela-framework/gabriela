const runMiddleware = require('./middleware/runMiddleware');
const deepCopy = require('deepcopy');
const {MIDDLEWARE_TYPES} = require('../misc/types');
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

                const responseProxy = createResponseProxy(
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