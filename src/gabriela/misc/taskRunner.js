/**
 * A task runner for asynchronous usage. These functions are used as arguments to the client code:
 * - next()
 *     Used to signal that async task has finished
 * - skip()
 *     Same as next()
 * - done()
 *     Same as next()
 * - throwException()
 *     Marks the task as an error task and saves the error as this tasks value
 *
 * The client code determines how it will handle the results from this functions.
 * @constructor
 */
function TaskRunner() {
    let executingTask = null;
    let value = null;

    function next(fn) {
        executingTask = 'next';
        value = fn;
    }

    function skip() {
        executingTask = 'skip';
    }

    function done() {
        executingTask = 'done';
    }

    function throwException(err) {
        executingTask = 'error';
        value = err;
    }

    function getValue() {
        return value;
    }

    function resolve() {
        executingTask = null;
        value = null;
    }

    this.next = next;
    this.done = done;
    this.skip = skip;
    this.throwException = throwException;
    this.getValue = getValue;
    this.resolve = resolve;
    this.getTask = () => executingTask;
}

function factory() {
    this.create = function() {
        return new TaskRunner();
    };
}

module.exports = (function() {
    const inst = new factory();

    return inst;
}());
