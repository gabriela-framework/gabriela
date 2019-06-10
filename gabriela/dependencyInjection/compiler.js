const getArgNames = require('../util/getArgNames');
const is = require('../util/is');
const Validator = require('../misc/validators');

/**
 * Compilers parent is resolved outside of this compiler.
 *
 * Depth:
 *
 * - module -> the deepest possible
 * - plugin -> between module and the root. Modules are its children
 * - framework (public) -> the root compiler. Does not have a parent. Must be self aware.
 *
 * Traversal:
 *
 * Since every dependency will be asked inside a middleware, the first compiler to be asked for a dependency is the
 * modules compiler. If he does not have it, it searches the parent which is the plugin compiler. Plugin compiler has module
 * compiler children. This is a good place to have a shared plugin dependency. The top level is the public level (which is
 * in practice, the framework root compiler). The root compiler is self aware and does not even try to search its parent.
 *
 *
 */
function factory() {
    this.parent = null;
    const children = {};

    const selfTree = {};
    const resolved = {};

    function add(init) {
        Validator.validateDICompilerInitObject(init);

        selfTree[init.name] = init;
    }

    function has(name) {
        return selfTree.hasOwnProperty(name);
    }

    function compile(name) {
        if (!is('string', name)) throw new Error(`Dependency injection error. 'compile' method expect a string as a name of a dependency that you want to compile`);

        if (resolved.hasOwnProperty(name)) return resolved[name];

        if (!selfTree.hasOwnProperty(name)) throw new Error(`Dependency injection error. ${name} not found in the dependency tree`);

        const serviceInit = selfTree[name];

        const args = getArgNames(serviceInit.init);

        const deps = [];
        if (args.length > 0) {
            for (const arg of args) {
                deps.push(this.compile(arg));
            }
        }

        const service = serviceInit.init(...deps);

        if (!service) throw new Error(`Dependency injection error. Target service ${name} cannot return a falsy value`);

        resolved[serviceInit.name] = service;

        return resolved[serviceInit.name];
    }

    function addChild(name, compiler) {
        children[name] = compiler;
    }

    this.add = add;
    this.has = has;
    this.compile = compile;
    this.addChildCompiler = addChild;
}

function instance() {
    this.create = function() {
        return new factory();
    }
}

module.exports = new instance();