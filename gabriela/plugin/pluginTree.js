const deepCopy = require('deepcopy');
const Validator = require('../misc/validator');
const ModuleTree = require('../module/moduleTree');
const Compiler = require('../dependencyInjection/compiler');
const is = require('../util/is');
const PluginRunner = require('./pluginRunner');
const pluginFactory = require('./pluginFactory');

function instance() {
    const plugins = {};

    function addPlugin(plugin) {
        Validator.validatePlugin(plugin);

        if (plugins.hasOwnProperty(plugin.name)) throw new Error(`Plugin definition error. Plugin with name '${plugin.name}' already exists`);

        plugins[plugin.name] = deepCopy(plugin);
    }

    function hasPlugin(name) {
        return plugins.hasOwnProperty(name);
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

    this.addPlugin = addPlugin;
    this.hasPlugin = hasPlugin;
    this.getPlugin = getPlugin;
    this.getPlugins = getPlugins;
    this.removePlugin = removePlugin;

    this.runPlugin = async function(name, rootCompiler, sharedCompiler) {
        if (!is('string', name)) throw new Error(`Plugin tree runtime error. Invalid plugin name type. Plugin name must be a string`);
        if (!this.hasPlugin(name)) throw new Error(`Plugin tree runtime error. Plugin with name '${name}' does not exist`);

        if (name) {
            const plugin = plugins[name];

            const pluginRunner = PluginRunner.create(pluginFactory(plugin, rootCompiler, sharedCompiler));

            await pluginRunner.run();
        }
    }
}

function factory() {
    return new instance();
}

module.exports = factory;