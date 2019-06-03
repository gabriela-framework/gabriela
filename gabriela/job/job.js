function factory(job) {
    const t = job.preLogicTransformers;
    const v = job.validators;
    const p = job.postLogicTransformers;
    const e = job.jobLogic;
    const n = job.name;
    const j = job.jobs;

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

        get jobLogic() {
            return e;
        },

        get name() {
            return n;
        },

        get jobs() {
            return j;
        }
    }
}

module.exports = factory;