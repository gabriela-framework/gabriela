/**
 * ModuleTree hold the tree of modules (if modules property was specified). Running a module is always async.
 *
 * @type {factory|*}
 */

const ModuleRunner = require('./moduleRunner');
const is = require('../util/is');
const Validator = require('../misc/validators');
const moduleFactory = require('./moduleFactory');
const deepCopy = require('deepcopy');

function instance() {
    const modules = {};
    // A simple array that hold instances of this object (ModuleTree) with if 'modules' property is specified.
    // Otherwise, it is always empty
    const tree = [];

    /**
     * Recursive function that runs a tree of modules if 'modules' property was added with submodules of this module.
     *
     * @param tree
     * @returns {Promise<null>}
     */
    async function runTree(tree) {
        let childState = null;
        if (tree.length > 0) {
            for (let a = 0; a < tree.length; a++) {
                const gabriela = tree[a];
                const modules = gabriela.getModules();

                for (const moduleName in modules) {
                    if (!childState) childState = {};

                    const mdl = modules[moduleName];

                    childState[mdl.name] = await gabriela.runModule(mdl.name);
                }
            }
        }

        return childState;
    }

    /**
     * Recursive functions that adds modules to the tree if 'modules' property was specified with a list of sub modules
     * @param mdl
     */
    function addModule(mdl) {
        Validator.moduleValidator(mdl);

        modules[mdl.name] = deepCopy(mdl);
    }

    /**
     * Runs the module in async. This is a public method only when Gabriela is created as a runner. If created as a
     * server, runs them on server startup
     */
    async function runModule(name, rootCompiler) {
        if (!is('string', name)) throw new Error(`Module tree error. Invalid module name. Module name must be a string`);
        if (!this.hasModule(name)) throw new Error(`Module tree error. Module with name '${name}' does not exist`);

        const mdl = this.getModule(name);

        const runner = ModuleRunner.create(moduleFactory(mdl, rootCompiler));

        let childState = (tree.length > 0) ? await runTree(tree) : null;

        await runner.run(childState);

        return runner.getResult();
    }

    // hold the parent ModuleTree
    this.parent = null;
    this.child = null;

    this.addModule = addModule;

    this.hasModule = (name) => modules.hasOwnProperty(name);
    this.getModule = (name) => (this.hasModule(name)) ? deepCopy(modules[name]) : undefined;
    this.getModules = () => deepCopy(modules);
    this.removeModule = (name) => {
        if (!this.hasModule(name)) return false;

        delete modules[name];

        return true;
    };

    this.runModule = runModule;
}

function factory() {
    return new instance();
}

module.exports = factory;