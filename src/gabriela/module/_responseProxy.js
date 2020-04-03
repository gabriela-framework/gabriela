const callEvent = require('../events/util/callEvent');
const {HTTP_EVENTS} = require('../misc/types');
const {is} = require('../util/util');

function _sendMethod(method, mdl, req, res, state, onPreResponse, onPostResponse, responseArgs) {
    try {
        if (this.__responseSent) throw new Error(`Cannot send response. Response has already been sent`);

        // handling the use case if the response is sent from onPreResponse. if this was not here
        // there would be a recursion in calling onPreResponse inifinitely. This code only handles that use case and
        // this lines of code are called only if the response is sent inside onPreResponse
        if (this.__insideSend) {
            this.__responseSent = true;

            if (this.__isRedirect) {
                res[method]();

                return;
            }

            const {code, body, headers, callback} = responseArgs;

            if (headers) res.set(headers);

            res.status(code);

            res[method](body);

            return this;
        }

        this.__insideSend = true;

        if (onPreResponse) {
            callEvent.call(mdl.mediatorInstance, mdl, HTTP_EVENTS.ON_PRE_RESPONSE, {
                http: {req, res: this},
                state: state,
            });
        }

        this.__insideSend = false;

        if (!this.__responseSent) {
            if (this.__isRedirect) {
                res[method]();

                return;
            }

            const {code, body, headers} = responseArgs;

            if (headers) res.set(headers);

            res.status(code);

            res[method](body);
        }

        this.__responseSent = true;

        if (onPostResponse) {
            callEvent.call(mdl.mediatorInstance, mdl, HTTP_EVENTS.ON_POST_RESPONSE, {
                http: {req, res: this},
                state: state,
            });
        }
    } catch (e) {
        // any error can be caught with onError event
        if (mdl.hasMediators() && mdl.mediator.onError) {
            mdl.mediatorInstance.runOnError(mdl.mediator.onError, e);
        } else {
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
        json(code, body, headers) {
            _sendMethod.call(this,
                'json',
                mdl,
                req,
                res,
                state,
                onPreResponse,
                onPostResponse,
                {code, body, headers}
            );

            return this;
        },
        jsonp(code, body, headers, callback = 'callback') {
            _sendMethod.call(this,
                'jsonp',
                mdl,
                req,
                res,
                state,
                onPreResponse,
                onPostResponse,
                {code, body, headers, callback}
            );

            return this;
        },
        send(code, body, headers) {
            _sendMethod.call(this,
                'send',
                mdl,
                req,
                res,
                state,
                onPreResponse,
                onPostResponse,
                {code, body, headers}
            );

            return this;
        },
        set(key, value) {
            if (is('object', key)) {
                res.set(key);
            } else {
                res.set(key, value);
            }
        },
        links(links = {}) {
            res.links(links);
        },
        redirect(code, link) {
            this.__isRedirect = true;

            if (Number.isInteger(code)) {
                res.redirect(code, link);
            } else {
                res.redirect(code);
            }
        },
        append(key, value) {
            res.append(key, value);
        },
        attachment(path) {
            if (!path) {
                res.attachment();
            } else {
                res.attachment(path);
            }
        },
        download(path, fn) {
            if (is('function', fn)) {
                res.download(path, fn);
            } else {
                res.download(path);
            }
        },
        get(type) {
            return res.get(type);
        },
        sendFile(path, options, fn) {
            this.__responseSent = true;
            this.__isFileSent = true;

            res.sendFile(path, options, fn);
        }
    };
}

module.exports = factory;
