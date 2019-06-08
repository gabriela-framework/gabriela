const getArgNames = require('../util/getArgNames');
const is = require('../util/is');

function factory() {
    const tree = {};
    const resolved = {};

    function add(init) {
        if (!is('object', init)) throw new Error(`Dependency injection error. 'init' dependency value must be an object`);
        if (!is('string', init.name)) throw new Error(`Dependency injection error. Init object 'name' property must be a string`);
        if (!is('function', init.init)) throw new Error(`Dependency injection error. Init object 'init' property must be a function`);
        if (init.visibility) {
            if (!is('string', init.visibility)) throw new Error(`Dependency injection error. 'visibility' property needs to be either 'module', 'plugin' or 'public'. If not specified, it is 'module' by default`);

            const visibilities = ['module', 'plugin', 'public'];

            if (!visibilities.includes(init.visibility)) {
                throw new Error(`Dependency injection error. 'visibility' property needs to be either 'module', 'plugin' or 'public'. If not specified, it is 'module' by default`);
            }
        }

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