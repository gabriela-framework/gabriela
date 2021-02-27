var callEvent = require('../events/util/callEvent');
var HTTP_EVENTS = require('../misc/types').HTTP_EVENTS;
var is = require('../util/util').is;
function _sendMethod(method, mdl, req, res, state, onPreResponse, onPostResponse, responseArgs) {
    try {
        if (this.__responseSent)
            throw new Error("Cannot send response. Response has already been sent");
        if (this.__insideSend) {
            this.__responseSent = true;
            if (this.__isRedirect) {
                res[method]();
                return;
            }
            var code = responseArgs.code, body = responseArgs.body, headers = responseArgs.headers;
            if (headers)
                res.set(headers);
            res.status(code);
            res[method](body);
            return this;
        }
        this.__insideSend = true;
        if (onPreResponse) {
            callEvent.call(mdl.mediatorInstance, mdl, HTTP_EVENTS.ON_PRE_RESPONSE, {
                http: { req: req, res: this },
                state: state
            });
        }
        this.__insideSend = false;
        if (!this.__responseSent) {
            if (this.__isRedirect) {
                res[method]();
                return;
            }
            var code = responseArgs.code, body = responseArgs.body, headers = responseArgs.headers;
            if (headers)
                res.set(headers);
            res.status(code);
            res[method](body);
        }
        this.__responseSent = true;
        if (onPostResponse) {
            callEvent.call(mdl.mediatorInstance, mdl, HTTP_EVENTS.ON_POST_RESPONSE, {
                http: { req: req, res: this },
                state: state
            });
        }
    }
    catch (e) {
        if (mdl.hasMediators() && mdl.mediator.onError) {
            mdl.mediatorInstance.runOnError(mdl.mediator.onError, e);
        }
        else {
            throw e;
        }
    }
}
function factory(req, res, state, mdl, onPreResponse, onPostResponse) {
    return {
        __responseSent: false,
        __isFileSent: false,
        __insideSend: false,
        __isRedirect: false,
        json: function (code, body, headers) {
            _sendMethod.call(this, 'json', mdl, req, res, state, onPreResponse, onPostResponse, { code: code, body: body, headers: headers });
            return this;
        },
        jsonp: function (code, body, headers, callback) {
            if (callback === void 0) { callback = 'callback'; }
            _sendMethod.call(this, 'jsonp', mdl, req, res, state, onPreResponse, onPostResponse, { code: code, body: body, headers: headers, callback: callback });
            return this;
        },
        send: function (code, body, headers) {
            _sendMethod.call(this, 'send', mdl, req, res, state, onPreResponse, onPostResponse, { code: code, body: body, headers: headers });
            return this;
        },
        set: function (key, value) {
            if (is('object', key)) {
                res.set(key);
            }
            else {
                res.set(key, value);
            }
        },
        links: function (links) {
            if (links === void 0) { links = {}; }
            res.links(links);
        },
        redirect: function (code, link) {
            this.__isRedirect = true;
            if (Number.isInteger(code)) {
                res.redirect(code, link);
            }
            else {
                res.redirect(code);
            }
        },
        append: function (key, value) {
            res.append(key, value);
        },
        attachment: function (path) {
            if (!path) {
                res.attachment();
            }
            else {
                res.attachment(path);
            }
        },
        get: function (type) {
            return res.get(type);
        },
        sendFile: function (path, options, fn) {
            this.__responseSent = true;
            this.__isFileSent = true;
            res.sendFile(path, options, fn);
        },
        render: function (file, props, cb) {
            this.__responseSent = true;
            this.__isFileSent = true;
            res.render(file, props, cb);
        },
        expressResponse: function () {
            return res;
        }
    };
}
module.exports = factory;
//# sourceMappingURL=_responseProxy.js.map