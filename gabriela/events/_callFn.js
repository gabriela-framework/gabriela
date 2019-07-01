const {hasKey} = require('../util/util');
const resolveDependencies = require('../dependencyInjection/resolveDependencies');

module.exports = function _callFn(fn, moduleOrPlugin, args, config) {
    const resolvedArgs = args.map((arg) => {
        const dep = resolveDependencies(
            moduleOrPlugin.compiler,
            moduleOrPlugin.sharedCompiler,
            arg.name,
            config,
            moduleOrPlugin.name,
            (hasKey('plugin', moduleOrPlugin)) ? moduleOrPlugin.plugin : null
        );

        if (dep) return dep;

        if (!arg.value) throw new Error(`Argument resolving error. Cannot resolve argument with name '${arg.name}'`);

        return arg.value;
    });

    fn.call(null, ...resolvedArgs);
}