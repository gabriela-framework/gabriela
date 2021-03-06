const ModuleTree = require('../module/moduleTree');
const callEvent = require('../events/util/callEvent');
const {BUILT_IN_MEDIATORS} = require('../misc/types');

function factory(moduleExecuteFactory, server) {
    return async function(plugin, config) {
        const moduleTree = new ModuleTree(
            config,
            plugin.compiler.root,
            plugin.sharedCompiler,
            plugin.exposedMediator
        );

        try {
            for (const mdl of plugin.modules) {
                moduleTree.addModule(mdl, plugin.compiler);
            }

            callEvent.call(plugin.mediatorInstance, plugin, BUILT_IN_MEDIATORS.ON_PLUGIN_STARTED);

            await moduleTree.runTree(moduleExecuteFactory.bind(null, server));

            callEvent.call(plugin.mediatorInstance, plugin, BUILT_IN_MEDIATORS.ON_PLUGIN_FINISHED);
        } catch (err) {
            // throw error if it doesnt have any mediators
            if (!plugin.hasMediators()) throw err;

            // throw error if it has mediators but it does not have onError
            if (plugin.hasMediators() && !plugin.mediator.onError) throw err;

            plugin.mediatorInstance.runOnError(plugin.mediator.onError, err);
        }
    };
}

module.exports = factory;