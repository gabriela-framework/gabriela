const httpMocks = require('node-mocks-http');

function fn(path, method) {
    return httpMocks.createRequest({
        method: method,
        url: path,
    });
}

module.exports = fn;