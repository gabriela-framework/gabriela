const runMiddleware = require('./middleware/runMiddleware');
const deepCopy = require('deepcopy');

function factory(server, mdl) {
    if (mdl.isHttp()) {
        return async function(mdl, context, config, state) {
            const {http} = mdl;
            const method = http.route.method.toLowerCase();
            const path = http.route.path;

            server[method](path, async function(req, res, next) {
                const middleware = [
                    mdl.security,
                    mdl.preLogicTransformers,
                    mdl.validators,
                    mdl.moduleLogic,
                    mdl.postLogicTransformers,
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
            mdl.security,
            mdl.preLogicTransformers,
            mdl.validators,
            mdl.moduleLogic,
            mdl.postLogicTransformers,
        ];

        for (const functions of middleware) {
            await runMiddleware.call(context, ...[mdl, functions, config, state, null]);
        }
    };
}

module.exports = factory;