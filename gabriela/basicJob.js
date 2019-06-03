const JobCollection = require('./job/jobCollection');
const JobRunner = require('./job/jobRunner');

async function runTree(tree) {
    let childState = null;
    if (tree.length > 0) {
        for (let a = 0; a < tree.length; a++) {
            const gabriela = tree[a];
            const jobs = gabriela.getJobs();

            for (const jobName in jobs) {
                if (!childState) childState = {};

                const job = jobs[jobName];

                childState[job.name] = await gabriela.runJob(job);
            }
        }
    }

    return childState;
}

function instance() {
    const jc = JobCollection.create();

    const tree = [];

    this.parent = null;
    this.child = null;

    this.addJob = (job) => {
        if (job.jobs) {
            const g = new factory();

            this.child = g;
            g.parent = this;

            tree.push(g);

            for (const j of job.jobs) {
                if (j.jobs) this.addJob(j);

                g.addJob(j);
            }
        }

        jc.addJob(job);
    }

    this.hasJob = jc.hasJob;
    this.getJob = jc.getJob;
    this.getJobs = jc.getJobs;
    this.removeJob = jc.removeJob;

    this.runJob = runJob;

    async function runJob(job) {
        const runner = JobRunner.create(job);

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