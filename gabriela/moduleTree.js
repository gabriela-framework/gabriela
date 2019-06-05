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
    this.addModule = (mdl) => {
        if (mdl.modules) {
            const g = new factory();

            this.child = g;
            g.parent = this;

            this.tree.push(g);

            for (const m of mdl.modules) {
                if (m.modules) this.addModule(m);

                g.addModule(m);
            }
        }

        this.jc.addModule(mdl);
    }

    async function runModule(mdl, http) {
        const runner = ModuleRunner.create(mdl, http);

        await runner.run(await runTree(this.tree));

        return runner.getResult();
    }

    this.jc = ModuleCollection.create();

    this.tree = [];

    this.parent = null;
    this.child = null;

    this.hasModule = this.jc.hasModule;
    this.getModule = this.jc.getModule;
    this.getModules = this.jc.getModules;
    this.removeModule = this.jc.removeModule;

    this.runModule = runModule;
}

function factory() {
    const inst = new instance();
    inst.constructor.name = 'ModuleTree';

    return inst;
}

module.exports = factory;