const {getArgs} = require('../util/util');

function _callFn(fn, rootCompiler, args, context) {
    const resolvedArgs = args.map((arg) => {
        const dep = rootCompiler.compile(arg.name, rootCompiler);

        if (!dep) throw new Error(`Argument resolving error. Cannot resolve argument with name '${arg.name}'`);

        return dep;
    });

    fn.call((context) ? context : null, ...resolvedArgs);
}

function instance(rootCompiler) {
    function callEvent(fn, context) {
        const args = getArgs(fn);

        _callFn(fn, rootCompiler, args, context);
    }

    this.callEvent = callEvent;
}

function factory() {
    this.create = function(rootCompiler) {
        return new instance(rootCompiler);
    };
}

module.exports = new factory();