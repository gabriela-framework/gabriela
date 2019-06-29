const ModuleTree = require('../module/moduleTree');
const mediatorFactory = require('../events/mediator');
const resolveDependencies = require('../dependencyInjection/resolveDependencies');

function factory() {
    function create(plugin) {
        const moduleTree = new ModuleTree();

        async function run(config) {
            const mediator = mediatorFactory.create(plugin, config);

            

            if (plugin.modules && plugin.modules.length > 0) {
                for (const mdl of plugin.modules) {
                    await moduleTree.runConstructedModule(mdl, config);
                }
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