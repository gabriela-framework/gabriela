function factory(mdl) {
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
        }
    }
}

module.exports = function(mdl) {
    const inst = new factory(mdl);
    inst.constructor.name = 'Module';

    return inst;
}