const runMiddleware = require('./middleware/runMiddleware');

function factory(mdl) {
    if (mdl.http) {
    }

    return async function(mdl, context, args) {
        const middleware = [
            mdl.security,
            mdl.preLogicTransformers,
            mdl.validators,
            mdl.moduleLogic,
            mdl.postLogicTransformers,
        ];

        for (const functions of middleware) {
            await runMiddleware.call(context, ...[mdl, functions, ...args]);
        }
    }
}

module.exports = factory;