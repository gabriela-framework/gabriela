/**
 * ModuleTree hold the tree of modules (if modules property was specified). Running a module is always async.
 *
 * @type {factory|*}
 */

const ModuleCollection = require('../misc/collection');
const ModuleRunner = require('./moduleRunner');
const is = require('../util/is');

function instance() {
    // A collection of modules for this ModuleTree. Hold only getters and setters for saved modules. For more information,
    // check this packages comments
    const jc = (function(jc) {
        return {
            addModule: jc.add,
            getModule: jc.get,
            getModules: jc.getAll,
            hasModule: jc.has,
            removeModule: jc.remove,
        }
    }(ModuleCollection.create()));

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
        // Todo: Handle submodules in a way that they only inherit the dependencies of their parent module and no other
/*        if (mdl.modules) {
            const subModulesTree = new factory();

            this.child = subModulesTree;
            subModulesTree.parent = this;

            tree.push(subModulesTree);

            for (const m of mdl.modules) {

                if (m.modules) addModule(subModuleFactory(m));

                subModulesTree.addModule(subModuleFactory(m));
            }
        }*/

        jc.addModule(mdl);
    }

    /**
     * Runs the module in async. This is a public method only when Gabriela is created as a runner. If created as a
     * server, runs them on server startup
     * @param name {string}
     * @param http {object}
     * @returns {Promise<any>}
     */
    async function runModule(name, http) {
        if (!is('string', name)) throw new Error(`Module tree error. Invalid module name. Module name must be a string`);
        if (!jc.hasModule(name)) throw new Error(`Module tree error. Module with name '${name}' does not exist`);

        const mdl = jc.getModule(name);

        const runner = ModuleRunner.create(mdl, http);

        let childState = (tree.length > 0) ? await runTree(tree) : null;

        await runner.run(childState);

        return runner.getResult();
    }

    // hold the parent ModuleTree
    this.parent = null;
    this.child = null;

    this.addModule = addModule;
    this.hasModule = jc.hasModule;
    this.getModule = jc.getModule;
    this.getModules = jc.getModules;
    this.removeModule = jc.removeModule;

    this.runModule = runModule;
}

function factory() {
    return new instance();
}

module.exports = factory;