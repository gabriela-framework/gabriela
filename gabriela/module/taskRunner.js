function TaskRunner() {
    let executingTask = null;

    function next() {
        executingTask = 'next';
    }

    function skip() {
        executingTask = 'skip';
    }

    function done() {
        executingTask = 'done'
    }

    function resolve() {
        executingTask = null;
    }

    this.next = next;
    this.done = done;
    this.skip = skip;
    this.resolve = resolve;
    this.getTask = () => executingTask;
}

function factory() {
    this.create = function() {
        return new TaskRunner();
    }
}

module.exports = new factory();
