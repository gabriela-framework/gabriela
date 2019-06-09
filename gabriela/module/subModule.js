const Compiler = require('../dependencyInjection/compiler');
const Validator = require('../misc/validators');

/**
 * A submodule can have only the compiler holding the dependencies of the parent submodule, both resolved and unresolved.
 * @param mdl
 * @param parentCompiler
 * @returns {Array|*[]|*[]|*[]|*[]|*[]|*[]|modules|{"istanbul-lib-instrument", nyc}|string|usersListModule.moduleLogic|Function|*[]|*[]|*[]|*[]|*|{DICompiler: *, preLogicTransformers: *, validators: *, moduleLogic: *, name: *, http: *, modules: *, postLogicTransformers: *}|*|Server | usersListModule.http | {route}|factory|null|*[]|*[]|*[]|Array|*[]|*[]|*[]|*[]|*[]|*[]|*}
 */
function factory(mdl, parentCompiler) {
    Validator.moduleValidator(mdl);

    const parentCompilerTree = mdl.compiler.getSelfTree.call(this);

    const c = Compiler.create();


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
    }
}

module.exports = function(mdl, parentCompiler) {
    const inst = new factory(mdl, parentCompiler);
    inst.constructor.name = 'SubModule';

    return inst;
};