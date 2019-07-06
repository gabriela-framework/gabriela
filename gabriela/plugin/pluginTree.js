const deepCopy = require('deepcopy');
const Validator = require('../misc/validator');
const PluginRunner = require('./pluginRunner');
const pluginFactory = require('./pluginFactory');

const {is, hasKey} = require('../util/util');

async function _runConstructedPlugin(pluginModel, config) {
    const pluginRunner = PluginRunner.create(pluginModel);

    return await pluginRunner.run(config);
}

async function _runPluginTree(plugins, config, rootCompiler, sharedCompiler) {
    for (const item of plugins) {
        const itemModel = pluginFactory(item, config, rootCompiler, sharedCompiler);

        if (itemModel.hasPlugins()) {
            await _runPluginTree(itemModel.plugins, config, rootCompiler, sharedCompiler);
        }

        await _runConstructedPlugin(itemModel, config, rootCompiler, sharedCompiler);
    }
}

function instance() {
    const plugins = {};

    function addPlugin(plugin) {
        Validator.validatePlugin(plugin);

        if (hasKey(plugins, plugin.name)) throw new Error(`Plugin definition error. Plugin with name '${plugin.name}' already exists`);

        plugins[plugin.name] = deepCopy(plugin);
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

        return false;
    }

    this.runPlugin = async function(name, config, rootCompiler, sharedCompiler, exposedMediatorsInstance) {
        if (!is('string', name)) throw new Error(`Plugin tree runtime error. Invalid plugin name type. Plugin name must be a string`);
        if (!this.hasPlugin(name)) throw new Error(`Plugin tree runtime error. Plugin with name '${name}' does not exist`);

        if (name) {
            const pluginModel = pluginFactory(plugins[name], config, rootCompiler, sharedCompiler, exposedMediatorsInstance);

            if (pluginModel.hasPlugins()) {
                await _runPluginTree(pluginModel.plugins);
            }

            return await _runConstructedPlugin(pluginModel, config);
        }
    };

    this.addPlugin = addPlugin;
    this.hasPlugin = hasPlugin;
    this.getPlugin = getPlugin;
    this.getPlugins = getPlugins;
    this.removePlugin = removePlugin;
}

function factory(config) {
    return new instance(config);
}

module.exports = factory;