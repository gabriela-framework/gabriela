const {ENV} = require('../misc/types');

function factory() {
    let logger = null;
    let env = null;

    function injectLogger(instance, e) {
        logger = instance;
        env = e;
    }

    function log(type, message) {
        if (env === ENV.DEVELOPMENT) {
            logger.log(type, message);
        }
    }

    this.injectLogger = injectLogger;
    this.log = log;
}

module.exports = new factory();