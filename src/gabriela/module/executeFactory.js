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
        mdl[MIDDLEWARE_TYPES.VALIDATORS],
        mdl[MIDDLEWARE_TYPES.SECURITY],
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
        if (err.message === 'done') return;
    }

    if (mdl.isHttp()) {
        let errorRan = false;

        if (mdl.hasMediators() && mdl.mediator.onError) {
            mdl.mediatorInstance.runOnError(mdl.mediator.onError, err, httpContext);

            errorRan = true;
        }

        if (mdl.isInPlugin()) {
            if (mdl.plugin.hasMediators() && mdl.plugin.mediator.onError) {
                mdl.plugin.mediatorInstance.runOnError(mdl.plugin.mediator.onError, err, httpContext);

                errorRan = true;
            }
        }

        if (!errorRan) throw new Error(err);
    } else {
        // throw error if it doesnt have any mediators
        if (!mdl.hasMediators()) throw new Error(err);

        //throw error if it has mediators but it does not have onError
        if (mdl.hasMediators() && !mdl.mediator.onError) throw new Error(err);

        mdl.mediatorInstance.runOnError(mdl.mediator.onError, err, httpContext);
    }

}

function factory(server, mdl) {
    if (mdl.isHttp()) {
        return async function(mdl, context, config) {
            const method = mdl.http.method.toLowerCase();
            const path = mdl.getFullPath();

            if (mdl.http.static) {
                server[method](path, function(req, res) {
                    const responseEvent = _getResponseEvents(mdl);
                    const staticPath = mdl.http.static.path;

                    const responseProxy = createResponseProxy(
                        req,
                        res,
                        {},
                        mdl,
                        responseEvent.onPreResponse,
                        responseEvent.onPostResponse,
                    );

                    responseProxy.sendFile(staticPath);
                });
            } else {
                server[method](path, async function(req, res) {
                    let state = {};

                    let {httpContext, middleware} = _createWorkingDataStructures(mdl, req, res);

                    const responseEvent = _getResponseEvents(mdl);

                    let responseProxy = createResponseProxy(
                        req,
                        res,
                        state,
                        mdl,
                        responseEvent.onPreResponse,
                        responseEvent.onPostResponse,
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

                    if (!responseProxy.__isFileSent) {
                        res.end();
                    }

                    if (!responseProxy.__isRedirect) {
                        state = null;
                    }

                    responseProxy = null;
                    httpContext = null;
                    middleware = null;
                });
            }
        }
    }

    return async function(mdl, context, config, state) {
        const middleware = [
            mdl[MIDDLEWARE_TYPES.INIT],
            mdl[MIDDLEWARE_TYPES.VALIDATORS],
            mdl[MIDDLEWARE_TYPES.SECURITY],
            mdl[MIDDLEWARE_TYPES.PRE_LOGIC_TRANSFORMERS],
            mdl[MIDDLEWARE_TYPES.MODULE_LOGIC],
            mdl[MIDDLEWARE_TYPES.POST_LOGIC_TRANSFORMERS],
        ];

        for (const functions of middleware) {
            await runMiddleware.call(context, ...[mdl, functions, config, state, null]);
        }
    };
}

module.exports = factory;
