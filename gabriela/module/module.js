const Compiler = require('../dependencyInjection/compiler');
const Validator = require('../misc/validators');

/**
 * The dependency injection compiler has to be here. It does not have to be instantiated or created here but it has to be
 * here in order for module dependencies to be resolved.
 * @param mdl
 * @param parentCompiler
 * @returns {Array|*[]|*[]|*[]|*[]|*[]|*[]|modules|{"istanbul-lib-instrument", nyc}|string|usersListModule.moduleLogic|Function|*[]|*[]|*[]|*[]|*|{DICompiler: *, preLogicTransformers: *, validators: *, moduleLogic: *, name: *, http: *, modules: *, postLogicTransformers: *}|*|Server | usersListModule.http | {route}|factory|null|*[]|*[]|*[]|Array|*[]|*[]|*[]|*[]|*[]|*[]|*}
 */
function factory(mdl, parentCompiler) {
    Validator.moduleValidator(mdl);

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

    const t = mdl.preLogicTransformers;
    const v = mdl.validators;
    const p = mdl.postLogicTransformers;
    const e = mdl.moduleLogic;
    const n = mdl.name;
    const j = mdl.modules;
    const http = mdl.http;

    return {
        get preLogicTransformers() {
            return t;
        },

        get postLogicTransformers() {
            return p;
        },

        get validators() {
            return v;
        },

        get moduleLogic() {
            return e;
        },

        get name() {
            return n;
        },

        get modules() {
            return j;
        },

        get http() {
            return http;
        },

        get compiler() {
            return c;
        }
    }
}

module.exports = function(mdl, parentCompiler) {
    const inst = new factory(mdl, parentCompiler);
    inst.constructor.name = 'Module';

    return inst;
};