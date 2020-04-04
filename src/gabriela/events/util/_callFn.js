const {hasKey} = require('../../util/util');
const resolveDependencies = require('../../dependencyInjection/resolveDependencies');

/**
 * Executes the given function (fn) with supplied argument (args).
 *
 * resolveDependencies() recursively resolves dependencies from all compilers
 * @param fn
 * @param moduleOrPlugin
 * @param args
 * @param config
 */
module.exports = function _callFn(fn, moduleOrPlugin, args, config) {
    const resolvedArgs = args.map((arg) => {
        /**
         * If arg.value already holds a non null value, it means that it is resolved either from custom
         * arguments or is one of async flow functions (next(), done() etc...)
         */
        if (arg.value) return arg.value;

        const dep = resolveDependencies(
            moduleOrPlugin.compiler,
            arg.name,
            config,
            moduleOrPlugin.name,
            (hasKey('plugin', moduleOrPlugin)) ? moduleOrPlugin.plugin : null
        );

        if (dep) return dep;

        // by this point, dependency has to be resolved. If it is not, throw error
        if (!arg.value) throw new Error(`Argument resolving error. Cannot resolve argument with name '${arg.name}'`);
    });

    // calls the functions with the list of resolved arguments
    fn.call(null, ...resolvedArgs);
};
