const deepCopy = require('deepcopy');
const PluginRunner = require('./pluginRunner');
const pluginFactory = require('./pluginFactory');

const {is, hasKey, IIterator} = require('../util/util');

function _createWorkingDataStructures() {
    class Plugins extends IIterator{}
    class ConstructedPlugins extends IIterator{}

    return {
        plugins: new Plugins(),
        constructed: new ConstructedPlugins(),
    };
}

async function _runConstructedPlugin(pluginModel, config, executeFactory) {
    const pluginRunner = PluginRunner.create(pluginModel);

    return await pluginRunner.run(config, executeFactory);
}

function instance(config, rootCompiler, sharedCompiler, exposedMediator) {
    const {plugins, constructed} = _createWorkingDataStructures();

    function addPlugin(plugin) {
        plugins[plugin.name] = deepCopy(plugin);

        constructed[plugin.name] = pluginFactory(plugins[plugin.name], config, rootCompiler, sharedCompiler, exposedMediator);
    }

    function hasPlugin(name) {
        return hasKey(plugins, name);
    }

    function getPlugin(name) {
        if (!hasPlugin(name)) return undefined;

        return deepCopy(plugins[name]);
    }

    function getPlugins() {
        return deepCopy(plugins);
    }

    function removePlugin(name) {
        if (!is('string', name)) throw new Error(`Plugin tree error. Invalid module name. Module name must be a string`);
        if (!this.hasPlugin(name)) throw new Error(`Plugin tree error. Plugin with name '${name}' does not exist`);

        delete plugins[name];
        delete constructed[name];

        return false;
    }

    async function runPlugin(name, executeFactory) {
        if (!is('string', name)) throw new Error(`Plugin tree runtime error. Invalid plugin name type. Plugin name must be a string`);
        if (!this.hasPlugin(name)) throw new Error(`Plugin tree runtime error. Plugin with name '${name}' does not exist`);

        if (name) {
            const pluginModel = constructed[name];

            return await _runConstructedPlugin(pluginModel, config, executeFactory);
        }
    }

    async function runTree(executeFactory) {
        const keys = Object.keys(plugins);

        for (const name of keys) {
            await this.runPlugin(plugins[name].name, executeFactory);
        }
    }

    this.addPlugin = addPlugin;
    this.hasPlugin = hasPlugin;
    this.getPlugin = getPlugin;
    this.getPlugins = getPlugins;
    this.removePlugin = removePlugin;
    this.runPlugin = runPlugin;
    this.runTree = runTree;
}

function factory(config, rootCompiler, sharedCompiler, exposedMediator) {
    return new instance(config, rootCompiler, sharedCompiler, exposedMediator);
}

module.exports = factory;
