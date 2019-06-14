const Compiler = require('../dependencyInjection/compiler');

function bindCompiler(compiler, parentCompiler, mdl) {
    const c = Compiler.create();
    c.parent = parentCompiler;
    parentCompiler.addChildCompiler(mdl.name, c);

    if (mdl.dependencies) {
        for (const depInit of mdl.dependencies) {
            if (!depInit.visibility) depInit.visibility = 'module';

            if (depInit.visibility === 'module') {
                c.add(depInit);
            }
        }
    }

    return c;
}
/**
 * The dependency injection compiler has to be here. It does not have to be instantiated or created here but it has to be
 * here in order for module dependencies to be resolved.
 * @param mdl
 * @param parentCompiler
 * @returns {Array|*[]|*[]|*[]|*[]|*[]|*[]|modules|{"istanbul-lib-instrument", nyc}|string|usersListModule.moduleLogic|Function|*[]|*[]|*[]|*[]|*|{DICompiler: *, preLogicTransformers: *, validators: *, moduleLogic: *, name: *, http: *, modules: *, postLogicTransformers: *}|*|Server | usersListModule.http | {route}|factory|null|*[]|*[]|*[]|Array|*[]|*[]|*[]|*[]|*[]|*[]|*}
 */
function factory(mdl, parentCompiler) {
    mdl.compiler = bindCompiler(Compiler.create(), parentCompiler, mdl);

    const handlers = {
        set(obj, prop, value) {
            return undefined;
        },

        get(target, prop, receiver) {
            const allowed = ['preLogicTransformers', 'postLogicTransformers', 'moduleLogic', 'validators', 'compiler'];

            if (!allowed.includes(prop)) {
                throw new Error(`Module access error. Trying to access protected property '${prop}' of a module`);
            }

            return target[prop];
        }
    };

    return new Proxy(mdl, handlers);
}

module.exports = function(mdl, parentCompiler) {
    return new factory(mdl, parentCompiler);
};