function TaskRunner() {
    var executingTask = null;
    var value = null;
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
    this.getTask = function () { return executingTask; };
}
function factory() {
    this.create = function () {
        return new TaskRunner();
    };
}
module.exports = (function () {
    var inst = new factory();
    return inst;
}());
//# sourceMappingURL=taskRunner.js.map