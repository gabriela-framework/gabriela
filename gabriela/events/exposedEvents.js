const {hasKey} = require('../util/util');
const resolveDependencies = require('../dependencyInjection/resolveDependencies');

function _callFn(compiler, args) {
    const resolvedArgs = args.map((arg) => {
        let dep;

        if (compiler.has(arg.name)) {
            dep = compiler.compile(name, compiler);
        }

        if (dep) return dep;

        if (!arg.value) throw new Error(`Argument resolving error. Cannot resolve argument with name '${arg.name}'`);

        return arg.value;
    });

    fn.call(null, ...resolvedArgs);
}

function factory(compiler) {
    const definitions = {};

    function add(definition) {
        definitions[definition.name] = definition;
    }

    function has(name) {
        return hasKey(definitions, name);
    }

    function once(name) {

    }

    this.add = add;
    this.has = has;
}

module.exports = factory;