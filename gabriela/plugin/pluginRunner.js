const ModuleTree = require('../module/moduleTree');
const callEvent = require('../events/callEvent');

function factory() {
    function create(plugin) {
        const moduleTree = new ModuleTree();

        async function run(config) {
            callEvent.call(plugin.mediatorInstance, plugin, 'onPluginStarted');

            if (plugin.modules && plugin.modules.length > 0) {
                for (const mdl of plugin.modules) {
                    try {
                        await moduleTree.runConstructedModule(mdl, config);
                    } catch (err) {
                        // throw error if it doesnt have any mediators
                        if (!plugin.hasMediators()) throw err;

                        // throw error if it has mediators but it does not have onError
                        if (plugin.hasMediators() && !plugin.mediator.onError) throw err;

                        plugin.mediatorInstance.runOnError(plugin.mediator.onError, err);
                    }
                }
            }

            callEvent.call(plugin.mediatorInstance, plugin, 'onPluginFinished');
        }

        function instance() {
            this.run = run;
        }

        return new instance();
    }

    this.create = create;
}

module.exports = new factory();