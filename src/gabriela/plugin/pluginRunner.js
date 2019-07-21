const {BUILT_IN_MEDIATORS} = require('../misc/types');

function _assignMediatorEvents(plugin, excludes) {
    if (plugin.hasMediators()) {
        const mediators = plugin.mediator;

        const props = Object.keys(mediators);

        for (const name of props) {
            if (!excludes.includes(name)) {
                plugin.mediatorInstance.add(name, mediators[name]);
            }
        }
    }
}

function factory() {
    function create(plugin) {
        _assignMediatorEvents(plugin, [
            BUILT_IN_MEDIATORS.ON_PLUGIN_STARTED,
            BUILT_IN_MEDIATORS.ON_PLUGIN_FINISHED,
            BUILT_IN_MEDIATORS.ON_ERROR,
        ]);

        async function run(config, executeFactory) {
            if (plugin.modules && plugin.modules.length > 0) {
                await executeFactory.call().call(null, plugin, config);
            }
        }

        function instance() {
            this.run = run;
        }

        return new instance();
    }

    this.create = create;
}

module.exports = new factory();