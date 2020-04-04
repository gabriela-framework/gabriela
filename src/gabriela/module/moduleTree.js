const ModuleRunner = require('./moduleRunner');
const Validator = require('../misc/validator');
const moduleFactory = require('./moduleFactory');
const deepCopy = require('deepcopy');
const {hasKey, is, IIterator} = require('../util/util');
const _overrideMiddleware = require('./middlewareOverriding/overrideMiddleware');
const Router = require('../router/router');

async function _runConstructedModule(mdl, tree, config, executeFactory) {
    const runner = ModuleRunner.create(mdl);

    const childState = (tree.length > 0) ? await runTree(tree) : null;

    await runner.run(childState, config, executeFactory);

    return runner.getResult();
}

function _createWorkingDataStructures() {
    class Modules extends IIterator{}
    class ConstructedModules extends IIterator{}

    return {
        modules: new Modules(),
        constructed: new ConstructedModules(),
    };
}

function instance(config, rootCompiler, sharedCompiler, exposedMediator) {
    const {modules, constructed} = _createWorkingDataStructures();

    const tree = [];

    function addModule(mdl, parentCompiler) {
        modules[mdl.name] = deepCopy(mdl);

        const buildStageArgs = {
            mdl: modules[mdl.name],
            config,
            rootCompiler,
            parentCompiler,
            sharedCompiler,
            exposedMediator,
        };

        constructed[mdl.name] = moduleFactory(buildStageArgs);
    }

    /**
     * Runs the module in async. This is a public method only when Gabriela is created as a runner. If created as a
     * server, runs them on server startup
     */
    async function runModule(name, executeFactory) {
        if (!is('string', name)) throw new Error(`Module runtime tree error. Invalid module name type. Module name must be a string`);
        if (!this.hasModule(name)) throw new Error(`Module runtime tree error. Module with name '${name}' does not exist`);

        const res = await _runConstructedModule(constructed[name], tree, config, executeFactory);

        return deepCopy(res);
    }

    async function runTree(executeFactory) {
        const keys = Object.keys(modules);

        const state = {};

        for (const name of keys) {
            const res = await this.runModule(modules[name].name, executeFactory);

            state[modules[name].name] = res;
        }

        return deepCopy(state);
    }

    function overrideModule(mdl, parentCompiler) {
        Validator.validateModule(mdl, Router);

        if (!this.hasModule(mdl.name)) {
            throw new Error(`Module overriding error. Module with name '${mdl.name}' does not exist`);
        }

        const existing = this.getModule(mdl.name);

        _overrideMiddleware(mdl, existing);

        modules[mdl.name] = deepCopy(existing);

        const buildStageArgs = {
            mdl: modules[mdl.name],
            config,
            rootCompiler,
            parentCompiler,
            sharedCompiler,
            exposedMediator,
        };

        constructed[mdl.name] = moduleFactory(buildStageArgs);
    }

    function removeModule(name) {
        if (!this.hasModule(name)) return false;

        delete constructed[name];
        delete modules[name];

        return true;
    }

    // hold the parent ModuleTree
    this.parent = null;

    this.addModule = addModule;
    this.overrideModule = overrideModule;
    this.hasModule = (name) => hasKey(modules, name);
    this.getModule = (name) => (this.hasModule(name)) ? deepCopy(modules[name]) : undefined;
    this.getModules = () => deepCopy(modules);
    this.removeModule = removeModule;
    this.runModule = runModule;
    this.runTree = runTree;
}

function factory(config, rootCompiler, sharedCompiler, exposedMediator) {
    return new instance(config, rootCompiler, sharedCompiler, exposedMediator);
}

module.exports = factory;
