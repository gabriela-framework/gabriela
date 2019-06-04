function factory(mdl) {
    const t = mdl.preLogicTransformers;
    const v = mdl.validators;
    const p = mdl.postLogicTransformers;
    const e = mdl.moduleLogic;
    const n = mdl.name;
    const j = mdl.modules;

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
        }
    }
}

module.exports = factory;