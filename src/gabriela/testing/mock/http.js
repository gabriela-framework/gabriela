const _asServer = require('../_asServer');
const {hasKey} = require('../../util/util');

function factory(config, options) {
    const modules = {};
    const plugins = {};

    function addModule(mdl) {
        if (hasKey(modules, mdl.name)) throw new Error(`Invalid testing setup. Module with name '${mdl.name}' has already been added`);

        modules[mdl.name] = mdl;
    }

    function addPlugin(plugin) {
        if (hasKey(plugins, plugin.name)) throw new Error(`Invalid testing setup. Plugin with name '${plugin.name}' has already been added`);

        plugins[plugin.name] = plugin;
    }

    async function get(mdlOrPluginName) {
        const component = _getComponent.call(this, mdlOrPluginName);

        const method = component.http.route.method;

        if (method.toLowerCase() !== 'get') throw new Error(`Invalid testing setup. You are trying to 'get' a module but module has a '${method.toUpperCase()}' method`);

        return await _runApp(component.name);
    }

    async function post(mdlOrPluginName) {
        const component = _getComponent.call(this, mdlOrPluginName);

        const method = component.http.route.method;

        if (method.toLowerCase() !== 'post') throw new Error(`Invalid testing setup. You are trying to 'post' a module but module has a '${method.toUpperCase()}' method`);

        return await _runApp(component.name);
    }

    async function _runApp(mdlOrPluginName) {
        const app = _asServer(config, options);

        _addComponents(app);

        const response = await app.run(mdlOrPluginName);

        return response;
    }

    function _getComponent(mdlOrPluginName) {
        const split = mdlOrPluginName.split('#');
        if (split.length === 2) {
            const pluginName = split[0];
            const moduleName = split[1];

            if (!hasKey(plugins, pluginName)) throw new Error(`Invalid testing setup. Invalid pluginName#moduleName name '${mdlOrPluginName}'. Plugin with name '${pluginName}' does not exist`);

            const plugin = plugins[pluginName];
            const pluginModules = plugin.modules;

            for (const mdl of pluginModules) {
                if (mdl.name === moduleName) {
                    this.addModule(mdl);

                    return mdl;
                }
            }
        } else if(hasKey(modules, mdlOrPluginName)) {
            return modules[mdlOrPluginName];
        }
    }

    function _addComponents(app) {
        let keys = Object.keys(modules);
        for (const key of keys) {
            app.addModule(modules[key]);
        }

        keys = Object.keys(plugins);
        for (const key of keys) {
            app.addPlugin(plugins[key]);
        }
    }

    this.get = get;
    this.addModule = addModule;
    this.addPlugin = addPlugin;
    this.post = post;
}

module.exports = factory;