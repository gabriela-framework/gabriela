const ModuleTree = require('../module/moduleTree');

function factory() {
    function create(plugin) {
        const moduleTree = new ModuleTree();

        async function run() {
            if (plugin.modules && plugin.modules.length > 0) {
                for (const mdl of plugin.modules) {
                    await moduleTree.runConstructedModule(mdl);
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