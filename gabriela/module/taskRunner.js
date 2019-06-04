function factory() {
    let executingTask = null;

    function next() {
        executingTask = new Promise((resolve, reject) => {
            resolve('next');
        });
    }

    function skip() {
        executingTask =  new Promise((resolve, reject) => {
            resolve('skip');
        });
    }

    function done() {
        executingTask = new Promise((resolve, reject) => {
            resolve('done');
        });
    }

    function reset() {
        executingTask = null;
    }

    function getTask() {
        return executingTask;
    }

    this.next = next;
    this.done = done;
    this.skip = skip;
    this.reset = reset;
    this.getTask = getTask;
}

module.exports = new factory();
