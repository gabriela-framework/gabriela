const getArgNames = require('../util/getArgNames');
const is = require('../util/is');
const Validator = require('../misc/validators');

function factory() {
    const tree = {};
    const resolved = {};

    function add(init) {
        Validator.validateDICompilerInitObject(init);

        tree[init.name] = init;
    }

    function compile(name) {
        if (!is('string', name)) throw new Error(`Dependency injection error. 'compile' method expect a string as a name of a dependency that you want to compile`);

        if (resolved.hasOwnProperty(name)) return resolved[name];

        if (!tree.hasOwnProperty(name)) throw new Error(`Dependency injection error. ${name} not found in the dependency tree`);

        const serviceInit = tree[name];

        const args = getArgNames(serviceInit.init);

        const deps = [];
        if (args.length > 0) {
            for (const arg of args) {
                deps.push(this.compile(arg));
            }
        }

        const service = serviceInit.init(...deps);

        if (!service) throw new Error(`Dependency injection error. Target service ${name} cannot be a falsy value`);

        resolved[serviceInit.name] = service;

        return resolved[serviceInit.name];
    }

    this.add = add;
    this.compile = compile;
}

function instance() {
    this.create = function() {
        return new factory();
    }
}

module.exports = new instance();