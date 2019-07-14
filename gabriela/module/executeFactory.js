const runMiddleware = require('./middleware/runMiddleware');
const deepCopy = require('deepcopy');
const {MIDDLEWARE_TYPES} = require('../misc/types');

function _createResponseProxy(res) {
    return {
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

            return res.send(code, body, headers);

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

function factory(server, mdl) {
    if (mdl.isHttp()) {
        return async function(mdl, context, config, state) {
            const {http} = mdl;
            const method = http.route.method.toLowerCase();
            const path = http.route.path;

            server[method](path, async function(req, res, next) {
                const middleware = [
                    mdl[MIDDLEWARE_TYPES.SECURITY],
                    mdl[MIDDLEWARE_TYPES.PRE_LOGIC_TRANSFORMERS],
                    mdl[MIDDLEWARE_TYPES.VALIDATORS],
                    mdl[MIDDLEWARE_TYPES.MODULE_LOGIC],
                    mdl[MIDDLEWARE_TYPES.POST_LOGIC_TRANSFORMERS],
                ];

                const responseProxy = _createResponseProxy(res);

                const http = {
                    req,
                    res: responseProxy,
                };

                for (const functions of middleware) {
                    await runMiddleware.call(context, ...[mdl, functions, config, state, http]);
                }

                responseProxy.send(200, deepCopy(state));

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