const httpMocks = require('node-mocks-http');

function fn() {
    const res = httpMocks.createResponse();

    const proxy = {};
    proxy._res = res;

    proxy.cache = function(type, options) {
        let part1 = `${type}`;
        let part2 = '';
        if (options) {
            part1 += ', ';
            const keys = Object.keys(options);

            for (const key of keys) {
                part2 += `${key}=${options[key]}, `;
            }
        }

        part2 = part2.trimRight().slice(0, -1);

        const header = part1 + part2;

        this._res.set('Cache-Control', header);
    };

    proxy.noCache = function() {
        this._res.set('cache-control', '');
        this._res.set('cache-control', 'no-store');
    };

    proxy.charSet = function(value) {
        let contentType = this._res.get('content-type');

        if (!contentType) {
            contentType = `charset=${value}`;
        }

        contentType += `; charset=${value}`;

        return contentType;
    };

    proxy.send = function(statusCode, body, headers) {
        this._res.status(statusCode);

        if (headers) this._res.set(headers);

        this._res.send(body);

        this._res.end();
    };

    proxy.header = function(type, value) {
        if (!value) {
            return this._res.get(type);
        }

        this._res.set(type, value);
    };

    proxy.json = function(code, body, headers) {
        this.send(
            code,
            JSON.stringify(body),
            headers
        );
    };

    proxy.body = function() {
        return this._res._getData();
    };

    proxy.statusCode = function() {
        return this._res.statusCode;
    };

    return proxy;
}

module.exports = fn;