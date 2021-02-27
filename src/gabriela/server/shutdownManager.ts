/**
 * In order to not invent hot water, code is mostly copied and changed to work within
 * functional programming from https://github.com/moebius-mlm/http-graceful-shutdown
 * by Slava Fomin. All credits go to him. You can check him out on Github https://github.com/slavafomin
 * or his personal website http://slava.fomin.io/
 */

module.exports = function ShutdownManager(server) {
    this.connections = {};
    this.nextConnectionId = 1;
    this.terminating = false;

    function shutdown (cb) {
        this.terminating = true;

        server.close(cb);

        for (const connectionId in this.connections) {
            if (this.connections.hasOwnProperty(connectionId)) {
                const socket = this.connections[connectionId];
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
}

function onConnection(connection) {

    const connectionId = this.nextConnectionId++;

    connection._idle = true;

    this.connections[connectionId] = connection;

    connection.on('close', () => delete this.connections[connectionId]);

}

function onRequest (req, res) {
    const connection = req.connection;

    connection._idle = false;

    res.on('finish', () => {
        connection._idle = true;
        if (this.terminating) {
            closeIdleConnection(connection);
        }
    });

}

function closeIdleConnection (connection) {
    if (connection._idle) {
        connection.destroy();
    }
}