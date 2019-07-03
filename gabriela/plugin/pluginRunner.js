const ModuleTree = require('../module/moduleTree');
const callEvent = require('../events/callEvent');

function factory() {
    function create(plugin) {
        const moduleTree = new ModuleTree();

        async function run(config) {
            callEvent.call(plugin.mediatorInstance, plugin, 'onPluginStarted');

            if (plugin.modules && plugin.modules.length > 0) {
                for (const mdl of plugin.modules) {
                    await moduleTree.runConstructedModule(mdl, config);
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