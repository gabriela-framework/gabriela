/**
 * ModuleTree hold the tree of modules (if modules property was specified). Running a module is always async.
 *
 * @type {factory|*}
 */

const ModuleCollection = require('./moduleCollection');
const ModuleRunner = require('./moduleRunner');
const Validator = require('../misc/validators');

function instance() {
    // A collection of modules for this ModuleTree. Hold only getters and setters for saved modules. For more information,
    // check this packages comments
    const jc = ModuleCollection.create();

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

                    childState[mdl.name] = await gabriela.runModule(mdl);
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

        if (mdl.modules) {
            const moduleTree = new factory();

            this.child = moduleTree;
            moduleTree.parent = this;

            tree.push(moduleTree);

            for (const m of mdl.modules) {
                if (m.modules) this.addModule(m);

                moduleTree.addModule(m);
            }
        }

        jc.addModule(mdl);
    }

    /**
     * Runs the module in async. This is a public method only when Gabriela is created as a runner. If created as a
     * server, runs them on server startup
     * @param mdl
     * @param http
     * @returns {Promise<any>}
     */
    async function runModule(mdl, http) {
        const runner = ModuleRunner.create(mdl, http);

        let childState = (tree.length > 0) ? await runTree(tree) : null;

        await runner.run(childState);

        return runner.getResult();
    }

    // hold the parent ModuleTree
    this.parent = null;

    this.addModule = addModule;
    this.hasModule = jc.hasModule;
    this.getModule = jc.getModule;
    this.getModules = jc.getModules;
    this.removeModule = jc.removeModule;

    this.runModule = runModule;
}

function factory() {
    const inst = new instance();
    inst.constructor.name = 'ModuleTree';

    return inst;
}

module.exports = factory;