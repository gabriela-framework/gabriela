const {INJECTION_TYPES} = require('../misc/types');

module.exports = function _resolveInjectionService(compiler, injectionObject, taskRunner, config) {
    const service = injectionObject.object;
    const type = injectionObject.type;
    const args = injectionObject.args;

    if (type === INJECTION_TYPES.PROPERTY) {
        for (let [prop, dep] of Object.entries(args)) {
            service[prop] = compiler.compile(dep, compiler, config);
        }
    }

    if (type === INJECTION_TYPES.METHOD) {
        for (let [method, dep] of Object.entries(args)) {
            const compilerService = compiler.compile(dep, compiler, config);

            service[method](compilerService);
        }
    }

    taskRunner.resolve();

    return service;
};