const deepCopy = require('deepcopy');
const Validator = require('../misc/validator');
const ModuleTree = require('../module/moduleTree');

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
        if (!hasPlugin(name)) return undefined;

        delete plugins[name];

        return false;
    }

    this.addPlugin = addPlugin;
    this.hasPlugin = hasPlugin;
    this.getPlugin = getPlugin;
    this.getPlugins = getPlugins;
    this.removePlugin = removePlugin;
    this.runPlugin = function(name) {

    }
}

function factory() {
    return new instance();
}

module.exports = factory;