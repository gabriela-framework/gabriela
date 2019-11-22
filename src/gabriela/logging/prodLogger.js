function factory() {
    function log(type, message) {
        const today = new Date();

        let logMessage = `[${type.toUpperCase()}][${today.toUTCString()}]: ${message}.`;

        console.log(logMessage);
    }

    this.log = log;
    this.name = 'ProdLogger';
}

module.exports = new factory();