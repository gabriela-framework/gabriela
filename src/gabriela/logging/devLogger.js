function factory() {
    function log(type, message) {
        let logMessage = `[${type.toUpperCase()}][${new Date()}]: ${message}. This message will not be shown in production`;

        console.log(logMessage);
    }

    this.log = log;
    this.name = 'DevLogger';
}

module.exports = new factory();