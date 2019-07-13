const runMiddleware = require('./middleware/runMiddleware');
const deepCopy = require('deepcopy');
const {MIDDLEWARE_TYPES} = require('../misc/types');

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

                for (const functions of middleware) {
                    await runMiddleware.call(context, ...[mdl, functions, config, state, {req, res}]);
                }

                res.send(200, deepCopy(state));

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