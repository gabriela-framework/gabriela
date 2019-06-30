const {getArgs} = require('../util/util');

function _callFn(fn, rootCompiler, args, context) {
    const resolvedArgs = args.map((arg) => {
        const dep = rootCompiler.compile(arg.name, rootCompiler);

        if (!dep) throw new Error(`Argument resolving error. Cannot resolve argument with name '${arg.name}'`);

        return dep;
    });

    fn.call((context) ? context : null, ...resolvedArgs);
}

function instance() {
    function callEvent(fn, rootCompiler, context) {        
        const args = getArgs(fn);

        _callFn(fn, rootCompiler, args, context);
    }

    this.callEvent = callEvent;
}

function factory() {
    this.create = function() {
        return new instance();
    };
}

module.exports = new factory();