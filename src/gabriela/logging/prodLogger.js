function factory() {
    function log(type, message) {
        let logMessage = `[${type.toUpperCase()}][${new Date()}]: ${message}.`;

        console.log(logMessage);
    }

    this.log = log;
    this.name = 'ProdLogger';
}

module.exports = new factory();