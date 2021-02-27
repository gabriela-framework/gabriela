module.exports = function ShutdownManager(server) {
    this.connections = {};
    this.nextConnectionId = 1;
    this.terminating = false;
    function shutdown(cb) {
        this.terminating = true;
        server.close(cb);
        for (var connectionId in this.connections) {
            if (this.connections.hasOwnProperty(connectionId)) {
                var socket = this.connections[connectionId];
                closeIdleConnection(socket);
            }
        }
    }
    function startWatching() {
        server.on('connection', onConnection.bind(this));
        server.on('request', onRequest.bind(this));
    }
    this.startWatching = startWatching;
    this.shutdown = shutdown;
};
function onConnection(connection) {
    var _this = this;
    var connectionId = this.nextConnectionId++;
    connection._idle = true;
    this.connections[connectionId] = connection;
    connection.on('close', function () { return delete _this.connections[connectionId]; });
}
function onRequest(req, res) {
    var _this = this;
    var connection = req.connection;
    connection._idle = false;
    res.on('finish', function () {
        connection._idle = true;
        if (_this.terminating) {
            closeIdleConnection(connection);
        }
    });
}
function closeIdleConnection(connection) {
    if (connection._idle) {
        connection.destroy();
    }
}
//# sourceMappingURL=shutdownManager.js.map