/**
 * ModuleTree hold the tree of modules (if modules property was specified). Running a module is always async.
 *
 * @type {factory|*}
 */

const ModuleRunner = require('./moduleRunner');
const is = require('../util/is');
const Validator = require('../misc/validator');
const moduleFactory = require('./moduleFactory');
const deepCopy = require('deepcopy');
const { middlewareTypes } = require('../misc/types');

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

function overrideMiddleware(mdl, existing) {
    for (const type of middlewareTypes) {
        if (mdl[type]) {
            const middlewareList = mdl[type];

            for (const newIndex in middlewareList) {
                const newMiddleware = middlewareList[newIndex];

                if (is('object', newMiddleware)) {
                    if (!existing[type]) {
                        existing[type] = mdl[type];
                    }

                    const existingMiddleware = existing[type];

                    let found = false;
                    for (const existingIndex in existingMiddleware) {
                        if (newMiddleware.name === existingMiddleware[existingIndex].name) {
                            existing[type][existingIndex] = newMiddleware;

                            found = true;

                            break;
                        }
                    }

                    if (!found) {
                        existing[type].push(newMiddleware);
                    }
                }
            }
        }
    }
}

function instance() {
    const modules = {};
    // A simple array that hold instances of this object (ModuleTree) with if 'modules' property is specified.
    // Otherwise, it is always empty
    const tree = [];
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
    async function runModule(name, rootCompiler, parentCompiler) {
        if (!is('string', name)) throw new Error(`Module runtime tree error. Invalid module name type. Module name must be a string`);
        if (!this.hasModule(name)) throw new Error(`Module runtime tree error. Module with name '${name}' does not exist`);

        const mdl = this.getModule(name);
        const constructedModule = moduleFactory(mdl, rootCompiler, parentCompiler);

        return await runConstructedModule(constructedModule);
    }

    async function runConstructedModule(mdl) {
        const runner = ModuleRunner.create(mdl);

        let childState = (tree.length > 0) ? await runTree(tree) : null;

        await runner.run(childState);

        return runner.getResult();
    }

    // hold the parent ModuleTree
    this.parent = null;
    this.child = null;

    this.addModule = addModule;
    this.overrideModule = function(mdl) {
        Validator.moduleValidator(mdl);

        if (!this.hasModule(mdl.name)) {
            throw new Error(`Module overriding error. Module with name '${mdl.name}' does not exist`);
        }

        const existing = this.getModule(mdl.name);

        overrideMiddleware(mdl, existing);

        modules[mdl.name] = deepCopy(existing);
    };

    this.hasModule = (name) => modules.hasOwnProperty(name);
    this.getModule = (name) => (this.hasModule(name)) ? deepCopy(modules[name]) : undefined;
    this.getModules = () => deepCopy(modules);
    this.removeModule = (name) => {
        if (!this.hasModule(name)) return false;

        delete modules[name];

        return true;
    };

    this.runModule = runModule;
    this.runConstructedModule = runConstructedModule;
}

function factory() {
    return new instance();
}

module.exports = factory;