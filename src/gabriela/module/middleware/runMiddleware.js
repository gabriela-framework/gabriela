const taskRunnerFactory = require('../../misc/taskRunner');
const {ASYNC_FLOW_TYPES} = require('../../misc/types');
const _waitCheck = require('../../util/_waitCheck');
const resolveDependencies = require('../../dependencyInjection/resolveDependencies');

const {createGenerator, getArgs, wait, inArray} = require('../../util/util');

async function recursiveMiddlewareExec(exec, taskRunner, mdl, state, config, http, generator) {
    const args = getArgs(exec, {
        next: taskRunner.next,
        done: taskRunner.done,
        skip: taskRunner.skip,
        throwException: taskRunner.throwException,
    });

    exec.call(this, ...args.map((val) => {
        const dep = resolveDependencies(
            mdl.compiler,
            mdl.sharedCompiler,
            val.name,
            config,
            mdl.name,
            mdl.plugin,
        );

        if (dep) return dep;

        if (val.name === 'state') return state;

        if (val.name === 'http') return http;

        if (!val.value) throw new Error(`Argument resolving error. Cannot resolve argument with name '${val.name}'`);

        return val.value;
    }));

    let task;
    if (!inArray(ASYNC_FLOW_TYPES.toArray(), args.map((arg) => arg.name))) {
        task = taskRunner.getTask();
    } else {
        task = await wait(_waitCheck.bind(null, taskRunner));
    }

    switch (task) {
        case 'skip': {
            taskRunner.resolve();

            return;
        }

        case 'done': {
            taskRunner.resolve();

            const error = new Error('done');
            error.internal = true;

            throw error;
        }

        case 'error': {
            const error = taskRunner.getValue();
            taskRunner.resolve();

            throw error;
        }
    }

    taskRunner.resolve();

    const next = generator.next();

    if (next.done) return;

    return await recursiveMiddlewareExec(next.value, taskRunnerFactory.create(), mdl, state, config, http, generator);
}

async function runMiddleware(mdl, functions, config, state, http) {
    if (functions && functions.length > 0) {
        const generator = createGenerator(functions);

        const next = generator.next();

        await recursiveMiddlewareExec.call(this, 
            (!next.done) ? next.value : false,
            taskRunnerFactory.create(),
            mdl,
            state,
            config,
            http,
            generator
        );
    }
}

module.exports = runMiddleware;