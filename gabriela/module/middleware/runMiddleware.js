const taskRunnerFactory = require('../../misc/taskRunner');
const {asyncFlowTypes} = require('../../misc/types');
const createGenerator = require('../../util/createGenerator');
const getArgs = require('../../util/getArgs');
const wait = require('../../util/wait');
const inArray = require('../../util/inArray');
const _waitCheck = require('../../util/_waitCheck');

function _resolveDependency(mdl, name, config) {
    if (mdl.compiler.has(name)) {
        return mdl.compiler.compile(name, mdl.compiler, config);
    } else if (mdl.sharedCompiler.has(name)) {
        const definition = mdl.sharedCompiler.getOwnDefinition(name);

        // if it is shared with a module name
        if (definition.isSharedWith(mdl.name)) {
            return mdl.sharedCompiler.compile(name, mdl.sharedCompiler, config);
        }

        // if it is shared with a module that is in a plugin with name mdl.plugin.name
        if (mdl.isInPlugin() && definition.isSharedWith(mdl.plugin.name)) {
            return mdl.sharedCompiler.compile(name, mdl.sharedCompiler, config);
        }
    }
}

async function runMiddleware(mdl, functions, state, config) {
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
                const dep = _resolveDependency(mdl, val.name, config);

                if (dep) return dep;

                if (val.name === 'state') return state;

                if (!val.value) throw new Error(`Argument resolving error. Cannot resolve argument with name '${val.name}'`);

                return val.value;
            }));

            let task;
            if (!inArray(asyncFlowTypes, args.map((arg) => arg.name))) {
                task = taskRunner.resolve();
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

            return await recursiveMiddlewareExec(next.value);
        }

        const next = generator.next();

        await recursiveMiddlewareExec((!next.done) ? next.value : false);
    }
}

module.exports = runMiddleware;