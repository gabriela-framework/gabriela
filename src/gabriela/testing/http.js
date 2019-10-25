const httpMocks = require('node-mocks-http');

function _assignDefaultOptions(opts) {
    opts.headers = (opts.headers) ? opts.headers : {};
}

function mockHttpExecuteFactory() {
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

function factory() {
    function get(url, options = {}) {
        _assignDefaultOptions(options);

        const request = httpMocks.createRequest({
            method: 'GET',
            url: url,
            headers: options.headers,
        });
    }

    this.get = get;
}

module.exports = new factory();
