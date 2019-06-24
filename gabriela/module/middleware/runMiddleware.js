const taskRunnerFactory = require('../../misc/taskRunner');
const createGenerator = require('../../util/createGenerator');
const getArgs = require('../../util/getArgs');
const wait = require('../../util/wait');
const is = require('../../util/is');

function waitCheck(taskRunner) {
    const task = taskRunner.getTask();
    if (task) {
        return {
            success: true,
            value: task,
        }
    }

    return {success: false}
}

function resolveDependency(mdl, name) {
    if (mdl.compiler.has(name)) {
        return mdl.compiler.compile(name, mdl.compiler);
    } else if (mdl.sharedCompiler.has(name)) {
        const initObject = mdl.sharedCompiler.getInit(name);

        // if it is shared with a module name
        if (initObject.isSharedWith(mdl.name)) {
            return mdl.sharedCompiler.compile(name, mdl.sharedCompiler);
        }

        // if it is shared with a module that is in a plugin with name mdl.plugin.name
        if (mdl.isInPlugin() && initObject.isSharedWith(mdl.plugin.name)) {
            return mdl.sharedCompiler.compile(name, mdl.sharedCompiler);
        }
    }
}

async function runMiddleware(mdl, functions, state) {
    if (functions && functions.length > 0) {
        const generator = createGenerator(functions);
        const taskRunner = taskRunnerFactory.create();

        async function recursiveMiddlewareExec(exec) {
            let args = getArgs(exec, {
                next: taskRunner.next,
                done: taskRunner.done,
                skip: taskRunner.skip,
                throwException: taskRunner.throwException,
            });

            exec.call(null, ...args.map((val) => {
                const dep = resolveDependency(mdl, val.name);

                if (dep) return dep;

                if (val.name === 'state') return state;

                if (!val.value) throw new Error(`Argument resolving error. Cannot resolve argument with name '${val.name}'`);

                return val.value;
            }));


            const task = await wait(waitCheck.bind(null, taskRunner));

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

            return await recursiveMiddlewareExec(next.value);
        }

        const next = generator.next();

        await recursiveMiddlewareExec((!next.done) ? next.value : false);
    }
}

module.exports = runMiddleware;