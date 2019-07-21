const mocha = require('mocha');
const chai = require('chai');
const assert = require('assert');
const requestPromise = require('request-promise');

const it = mocha.it;
const xit = mocha.xit;
const describe = mocha.describe;
const expect = chai.expect;

const gabriela = require('../../src/gabriela/gabriela');
const config = require('../config/config');
const {is} = require('../../src/gabriela/util/util');
const _responseProxy = require('../../src/gabriela/module/_responseProxy');

describe('Concrete and functional http response tests', function() {
    this.timeout(10000);

    it('should fail if the responseProxy interface changes as a remainder to update the tests', () => {
        const currentProperties = ['cache', 'noCache', 'charSet', 'header', 'json', 'link', 'send', 'sendRaw', 'set', 'status', 'redirect'];

        const responseProxy = _responseProxy();

        expect(currentProperties).to.have.members(Object.keys(responseProxy).filter((prop) => is('function', responseProxy[prop])));
    });

    it('should set the Cache-Control header', (done) => {
        const type = 'public';
        const maxAge = 2000;
        const mdl = {
            name: 'mdl',
            http: {
                route: {
                    name: 'route',
                    method: 'get',
                    path: '/route',
                }
            },
            moduleLogic: [function(http) {
                http.res.cache(type, {maxAge: maxAge});
                http.res.send('Response');
            }],
        };

        const app = gabriela.asServer(config, {
            events: {
                onAppStarted() {
                    requestPromise.get('http://localhost:3000/route', (err, response) => {
                        const cacheControl = response.headers['cache-control'];

                        expect(JSON.parse(response.body)).to.be.equal('Response');
                        expect(cacheControl).to.be.equal(`${type}, max-age=${maxAge}`);

                        this.gabriela.close();

                        done();
                    })
                }
            }
        });

        app.addModule(mdl);

        app.startApp();
    });

    it('should turn off cache', (done) => {
        const mdl = {
            name: 'mdl',
            http: {
                route: {
                    name: 'route',
                    method: 'get',
                    path: '/route',
                }
            },
            moduleLogic: [function(http) {
                http.res.noCache();
                http.res.send('Response');
            }],
        };

        const app = gabriela.asServer(config, {
            events: {
                onAppStarted() {
                    requestPromise.get('http://localhost:3000/route', (err, response) => {
                        const cacheControl = response.headers['cache-control'];
                        const pragma = response.headers['pragma'];
                        const expires = response.headers['expires'];

                        expect(JSON.parse(response.body)).to.be.equal('Response');

                        // if this fails, something has changed on restify side
                        expect(cacheControl).to.be.equal('no-cache, no-store, must-revalidate');
                        expect(pragma).to.be.equal('no-cache');
                        expect(parseInt(expires)).to.be.equal(0);

                        this.gabriela.close();

                        done();
                    })
                }
            }
        });

        app.addModule(mdl);

        app.startApp();
    });

    it('should set the correct charset', (done) => {
        const mdl = {
            name: 'mdl',
            http: {
                route: {
                    name: 'route',
                    method: 'get',
                    path: '/route',
                }
            },
            moduleLogic: [function(http) {
                http.res.charSet('utf-8');
                http.res.send('Response');
            }],
        };

        const app = gabriela.asServer(config, {
            events: {
                onAppStarted() {
                    requestPromise.get('http://localhost:3000/route', (err, response) => {
                        expect(JSON.parse(response.body)).to.be.equal('Response');
                        expect(response.headers['content-type']).to.be.equal('application/json; charset=utf-8');

                        this.gabriela.close();

                        done();
                    })
                }
            }
        });

        app.addModule(mdl);

        app.startApp();
    });

    it('should set a custom header on a response', (done) => {
        const mdl = {
            name: 'mdl',
            http: {
                route: {
                    name: 'route',
                    method: 'get',
                    path: '/route',
                }
            },
            moduleLogic: [function(http) {
                http.res.header('X-CUSTOM-HEADER', 'customheader');
                http.res.send('Response');
            }],
        };

        const app = gabriela.asServer(config, {
            events: {
                onAppStarted() {
                    requestPromise.get('http://localhost:3000/route', (err, response) => {

                        expect(JSON.parse(response.body)).to.be.equal('Response');

                        expect(response.headers).to.have.property('x-custom-header');
                        expect(response.headers['x-custom-header']).to.be.equal('customheader');

                        this.gabriela.close();

                        done();
                    })
                }
            }
        });

        app.addModule(mdl);

        app.startApp();
    });
});