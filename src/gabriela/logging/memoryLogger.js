function factory() {
    function log(message) {
        const today = new Date();

        let logMessage = `[NOTICE][${today.toUTCString()}]: ${message}.`;

        console.log(logMessage);
    }

    function warn(message) {
        const today = new Date();

        let logMessage = `[WARNING][${today.toUTCString()}]: ${message}.`;

        console.warn(logMessage);
    }

    this.log = log;
    this.name = 'MemoryLogger';
}

module.exports = new factory();