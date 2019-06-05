const ModuleCollection = require('./module/moduleCollection');
const ModuleRunner = require('./module/moduleRunner');

function instance() {
    const jc = ModuleCollection.create();
    const tree = [];

    async function runTree(tree) {
        let childState = null;
        if (tree.length > 0) {
            for (let a = 0; a < tree.length; a++) {
                const gabriela = tree[a];
                const modules = gabriela.getModules();

                for (const moduleName in modules) {
                    if (!childState) childState = {};

                    const mdl = modules[moduleName];

                    childState[mdl.name] = await gabriela.runModule(mdl);
                }
            }
        }

        return childState;
    }

    function addModule(mdl) {
        if (mdl.modules) {
            const moduleTree = new factory();

            this.child = moduleTree;
            moduleTree.parent = this;

            tree.push(moduleTree);

            for (const m of mdl.modules) {
                if (m.modules) this.addModule(m);

                moduleTree.addModule(m);
            }
        }

        jc.addModule(mdl);
    };

    async function runModule(mdl, http) {
        const runner = ModuleRunner.create(mdl, http);

        await runner.run(await runTree(tree));

        return runner.getResult();
    }

    this.parent = null;
    this.child = null;

    this.addModule = addModule;
    this.hasModule = jc.hasModule;
    this.getModule = jc.getModule;
    this.getModules = jc.getModules;
    this.removeModule = jc.removeModule;

    this.runModule = runModule;
}

function factory() {
    const inst = new instance();
    inst.constructor.name = 'ModuleTree';

    return inst;
}

module.exports = factory;