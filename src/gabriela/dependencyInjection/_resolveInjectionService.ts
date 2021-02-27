const {INJECTION_TYPES} = require('../misc/types');

module.exports = function _resolveInjectionService(
    compiler,
    sharedInfo,
    injectionObject,
    taskRunner,
    config
) {
    const service = injectionObject.object;
    const type = injectionObject.type;
    const args = injectionObject.args;

    if (type === INJECTION_TYPES.PROPERTY) {
        for (let [prop, dep] of Object.entries(args)) {
            service[prop] = compiler.compile(dep, compiler, config, sharedInfo);
        }
    }

    if (type === INJECTION_TYPES.METHOD) {
        for (let [method, dep] of Object.entries(args)) {
            const compilerService = compiler.compile(dep, compiler, config, sharedInfo);

            service[method](compilerService);
        }
    }

    if (type === INJECTION_TYPES.CONSTRUCTOR) {
        const dependencies = [];
        for (let [, dep] of Object.entries(args)) {
            dependencies.push(compiler.compile(dep, compiler, config, sharedInfo));
        }

        return new service(...dependencies);
    }

    taskRunner.resolve();

    return service;
};
