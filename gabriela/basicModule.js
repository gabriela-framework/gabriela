const ModuleCollection = require('./module/moduleCollection');
const ModuleRunner = require('./module/moduleRunner');

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

function instance() {
    const jc = ModuleCollection.create();

    const tree = [];

    this.parent = null;
    this.child = null;

    this.addModule = (mdl) => {
        if (mdl.modules) {
            const g = new factory();

            this.child = g;
            g.parent = this;

            tree.push(g);

            for (const m of mdl.modules) {
                if (m.modules) this.addModule(m);

                g.addModule(m);
            }
        }

        jc.addModule(mdl);
    }

    this.hasModule = jc.hasModule;
    this.getModule = jc.getModule;
    this.getModules = jc.getModules;
    this.removeModule = jc.removeModule;

    this.runModule = runModule;

    async function runModule(module) {
        const runner = ModuleRunner.create(module);

        await runner.run(await runTree(tree));

        return runner.getResult();
    }
}

function factory() {
    const inst = new instance();
    inst.constructor.name = 'basicJob';

    return inst;
}

module.exports = factory;