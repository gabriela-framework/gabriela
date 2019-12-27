const taskRunnerFactory = require('../../misc/taskRunner');
const {ASYNC_FLOW_TYPES} = require('../../misc/types');
const _waitCheck = require('../../util/_waitCheck');
const resolveDependencies = require('../../dependencyInjection/resolveDependencies');
const parseExpression = require('../../expression/parse');
const TaskRunner = require('../../misc/taskRunner');

const {createGenerator, getArgs, wait, inArray, is, indexOfFn} = require('../../util/util');

/**
 * Turns a string into a function.
 *
 * This functions is declared in the compiler as a DI service. That service must be of type function (not object) and during
 * declaration (when declared as string), it must contain all the neccessarry arguments as the same as a regular middleware function.
 *
 * How this function operates is described within that function
 * @param fnString
 * @param mdl
 * @param config
 * @param state
 * @param http
 * @returns {*}
 * @private
 */
function _resolveFunctionExpression(fnString, mdl, config, state, http) {
    /**
     * Parses the fn as string into this thing:
     *
     * {
     *     fnName: 'nameOfTheFunction',
     *     dependencies: 'arrayOfStringDependencies'
     * }
     * @type {{fnName, dependencies}}
     */
    const parsed = parseExpression(fnString);

    /**
     * This taskRunner replaces the one used in recursiveExecMiddleware() since async functions require
     * only one taskRunner to be used. Since this is the place where all arguments are resolved,
     * this task runner must be used.
     */
    const taskRunner = TaskRunner.create();

    // if this function expression is not declared in the compiler, throw error
    if (!mdl.compiler.has(parsed.fnName)) throw new Error(`Expression dependency injection error. Dependency with name '${parsed.fnName}' not found in the dependency tree`);

    // this array will be populated with dependencies that will be bound to the function expression
    const deps = [];
    for (const dep of parsed.dependencies) {
        if (dep === 'state') {
            deps.push({
                name: 'state',
                value: state,
            });
        } else if (dep === 'http') {
            deps.push({
                name: 'http',
                value: http,
            });
        } else if (ASYNC_FLOW_TYPES.toArray().includes(dep)) {
            deps.push({
                name: dep,
                value: taskRunner[dep]
            });
        } else {
            // if 'dep' is a DI service, compile it
            deps.push({
                name: dep,
                value: mdl.compiler.compile(dep, mdl.compiler, config),
            });
        }
    }

    // the place where the actual function is resolved from the compiler
    const dep = mdl.compiler.compile(parsed.fnName, mdl.compiler, config);

    return {
        fn: dep,
        args: deps,
        usedTaskRunner: taskRunner,
    };
}

async function syncExecFlow(exec, mdl, args, taskRunner, config) {
    exec.call(this, ...args.map((arg) => {
        /**
         * This line is only called when an argument is resolved. One of the cases is a function expression.
         * If arguments are resolved for a function expression, all of them will be resolved and this map() will always
         * go into this line of code
         */
        if (arg.value) return arg.value;

        const dep = resolveDependencies(
            mdl.compiler,
            mdl.sharedCompiler,
            arg.name,
            config,
            mdl.name,
            mdl.plugin,
        );

        if (dep) return dep;

        if (!arg.value) throw new Error(`Argument resolving error. Cannot resolve argument with name '${arg.name}'`);
    }));

    let task;
    if (!inArray(ASYNC_FLOW_TYPES.toArray(), args.map((arg) => arg.name))) {
        task = taskRunner.getTask();
    } else {
        task = await wait(_waitCheck.bind(null, taskRunner));
    }

    return task;
}

async function asyncFlowExec(exec, mdl, args, taskRunner, config) {
    await exec.call(this, ...args.map((arg) => {
        if (arg.name === 'next') throw new Error(`Invalid next() function in module '${mdl.name}'. When executing middleware with async keyword, next() is not necessary. Use await to get the same result.`);
        if (arg.name === 'throwException') throw new Error(`Invalid throwException() function in '${mdl.name}'. When executing middleware with async keyword, throwException() is not necessary. Use regular try/catch javascript mechanism.`);

        /**
         * This line is only called when an argument is resolved. One of the cases is a function expression.
         * If arguments are resolved for a function expression, all of them will be resolved and this map() will always
         * go into this line of code
         */
        if (arg.value) return arg.value;

        const dep = resolveDependencies(
            mdl.compiler,
            mdl.sharedCompiler,
            arg.name,
            config,
            mdl.name,
            mdl.plugin,
        );

        if (dep) return dep;

        if (!arg.value) throw new Error(`Argument resolving error. Cannot resolve argument with name '${arg.name}'`);
    }));

    return taskRunner.getTask();
}

async function recursiveMiddlewareExec(exec, taskRunner, mdl, state, config, http, generator) {
    let args;
    if (is('string', exec)) {
        /**
         * If 'exec' is a string, it means it is a function expression. That string is then turned into a object that
         * contains the function itself, all arguments resolved and the task runner. Those properties are replacing
         * the one that where to be used by recursiveMiddlewareExec().
         */
        const execObject = _resolveFunctionExpression(exec, mdl, config, state, http);

        exec = execObject.fn;
        args = execObject.args;
        taskRunner = execObject.usedTaskRunner;
    }

    const isAsyncFn = exec.constructor.name === 'AsyncFunction';
    /**
     * If arguments are not resolved (if exec is not a function expression), resolve them the regular way
     */
    if (!args) {
        args = getArgs(exec, {
            next: taskRunner.next,
            done: taskRunner.done,
            skip: taskRunner.skip,
            throwException: taskRunner.throwException,
            state: state,
            http: http,
        });
    }

    let task;

    if (!isAsyncFn) {
        task = await syncExecFlow.call(this, exec, mdl, args, taskRunner, config);
    } else if (isAsyncFn) {
        task = await asyncFlowExec.call(this, exec, mdl, args, taskRunner, config);
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

    return await recursiveMiddlewareExec.call(this, next.value, taskRunnerFactory.create(), mdl, state, config, http, generator);
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