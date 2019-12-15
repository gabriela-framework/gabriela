function factory() {
    function log(type, message) {
        const today = new Date();

        let logMessage = `[${type.toUpperCase()}][${today.toUTCString()}]: ${message}.`;

        console.log(logMessage);
    }

    this.log = log;
    this.name = 'DevLogger';
}

module.exports = new factory();