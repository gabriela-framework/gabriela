function factory() {
    let options = {
        next: false,
        skip: false,
        done: false,
    }

    function next() {
        options.next = true;
    }

    function skip() {
        options.skip = true;
    }

    function done() {
        options.done = true;
    }

    function reset() {
        for (const option in options) {
            options[option] = false;
        }
    }

    function getOption() {
        for (const option in options) {
            if (options[option]) {
                return option;
            }
        }
    }

    this.next = next;
    this.done = done;
    this.skip = skip;
    this.reset = reset;
    this.getOption = getOption;
}

module.exports = new factory();
