function factory() {
    let logger = null;
    let limit = null;

    function injectLogger(instance, l) {
        logger = instance;
        limit = l;
    }

    function log(memory, message) {

        if (memory > limit) {
            logger.warn(message);
        } else {
            logger.log(message);
        }
    }

    this.injectLogger = injectLogger;
    this.log = log;
}

module.exports = new factory();