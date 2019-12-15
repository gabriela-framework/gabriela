const mocha = require('mocha');
const chai = require('chai');
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
        const proxyFunctionsOnly = Object.keys(responseProxy).filter((prop) => is('function', responseProxy[prop]));

        expect(currentProperties).to.have.members(proxyFunctionsOnly);
    });

    it('should set the Cache-Control header', (done) => {
        const routes = [
            {
                name: 'route',
                method: 'get',
                path: '/route',
            }
        ];

        const type = 'public';
        const maxAge = 2000;
        const mdl = {
            name: 'mdl',
            route: 'route',
            moduleLogic: [function(http) {
                http.res.cache(type, {maxAge: maxAge});
                http.res.send('Response');
            }],
        };

        const app = gabriela.asServer(config, routes,{
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
        const routes = [
            {
                name: 'route',
                method: 'get',
                path: '/route',
            }
        ];

        const mdl = {
            name: 'mdl',
            route: 'route',
            moduleLogic: [function(http) {
                http.res.noCache();
                http.res.send('Response');
            }],
        };

        const app = gabriela.asServer(config, routes,{
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
        const routes = [
            {
                name: 'route',
                method: 'get',
                path: '/route',
            }
        ];

        const mdl = {
            name: 'mdl',
            route: 'route',
            moduleLogic: [function(http) {
                http.res.charSet('utf-8');
                http.res.send('Response');
            }],
        };

        const app = gabriela.asServer(config, routes,{
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
        const routes = [
            {
                name: 'route',
                method: 'get',
                path: '/route',
            }
        ];

        const mdl = {
            name: 'mdl',
            route: 'route',
            moduleLogic: [function(http) {
                http.res.header('X-CUSTOM-HEADER', 'customheader');
                http.res.send('Response');
            }],
        };

        const app = gabriela.asServer(config, routes,{
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

    it('should set the response via json() method', (done) => {
        const routes = [
            {
                name: 'route',
                method: 'get',
                path: '/route',
            }
        ];

        const mdl = {
            name: 'mdl',
            route: 'route',
            moduleLogic: [function(http) {
                http.res.json(200, 'Response', {'X-CUSTOM-HEADER': 'customheader'});
            }],
        };

        const app = gabriela.asServer(config, routes,{
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

    it('should set the response via json() method', (done) => {
        const routes = [
            {
                name: 'route',
                method: 'get',
                path: '/route',
            }
        ];

        const mdl = {
            name: 'mdl',
            route: 'route',
            moduleLogic: [function(http) {
                http.res.link('key', 'value');
                http.res.send('Response');
            }],
        };

        const app = gabriela.asServer(config, routes,{
            events: {
                onAppStarted() {
                    requestPromise.get('http://localhost:3000/route', (err, response) => {

                        expect(JSON.parse(response.body)).to.be.equal('Response');
                        expect(response.headers.link).to.be.equal(`<key>; rel="value"`);

                        this.gabriela.close();

                        done();
                    })
                }
            }
        });

        app.addModule(mdl);

        app.startApp();
    });

    it('should set multiple headers with the set() method', (done) => {
        const routes = [
            {
                name: 'route',
                method: 'get',
                path: '/route',
            }
        ];

        const mdl = {
            name: 'mdl',
            route: 'route',
            moduleLogic: [function(http) {
                http.res.set({
                    'X-CUSTOM-HEADER-ONE': 'customheaderone',
                    'X-CUSTOM-HEADER-TWO': 'customheadertwo',
                });

                http.res.send('Response');
            }],
        };

        const app = gabriela.asServer(config, routes,{
            events: {
                onAppStarted() {
                    requestPromise.get('http://localhost:3000/route', (err, response) => {

                        expect(JSON.parse(response.body)).to.be.equal('Response');
                        expect(response.headers['x-custom-header-one']).to.be.equal(`customheaderone`);
                        expect(response.headers['x-custom-header-two']).to.be.equal(`customheadertwo`);

                        this.gabriela.close();

                        done();
                    })
                }
            }
        });

        app.addModule(mdl);

        app.startApp();
    });

    it('should set the correct status code with the status() method', (done) => {
        const routes = [
            {
                name: 'route',
                method: 'get',
                path: '/route',
            }
        ];

        const mdl = {
            name: 'mdl',
            route: 'route',
            moduleLogic: [function(http) {
                http.res.status(203);

                http.res.send('Response');
            }],
        };

        const app = gabriela.asServer(config, routes,{
            events: {
                onAppStarted() {
                    requestPromise({
                        method: 'get',
                        uri: 'http://localhost:3000/route',
                        resolveWithFullResponse: true,
                    }).then((response) => {
                        expect(response.statusCode).to.be.equal(203);
                        expect(JSON.parse(response.body)).to.be.equal('Response');

                        this.gabriela.close();

                        done();
                    });
                }
            }
        });

        app.addModule(mdl);

        app.startApp();
    });

    it('should redirect to another route using the response proxy if supplied two params', (done) => {
        const routes = [
            {
                name: 'redirectRoute',
                method: 'get',
                path: '/redirect',
            },
            {
                name: 'route',
                method: 'get',
                path: '/route',
            }
        ];

        const mdl = {
            name: 'mdl',
            route: 'route',
            moduleLogic: [function(http) {
                http.res.redirect(302, 'http://localhost:3000/redirect');
            }],
        };

        const redirectModule = {
            name: 'redirectModule',
            route: 'redirectRoute',
            moduleLogic: [function(http) {
                http.res.send('Redirect');
            }],
        };

        const app = gabriela.asServer(config, routes,{
            events: {
                onAppStarted() {
                    requestPromise({
                        method: 'get',
                        uri: 'http://localhost:3000/route',
                        resolveWithFullResponse: true,
                    }).then((response) => {
                        expect(JSON.parse(response.body)).to.be.equal('Redirect');

                        this.gabriela.close();

                        done();
                    });
                }
            }
        });

        app.addModule(mdl);
        app.addModule(redirectModule);

        app.startApp();
    });

    it('should redirect to another route using the response proxy if supplied one param', (done) => {
        const routes = [
            {
                name: 'route',
                method: 'get',
                path: '/route',
            },
            {
                name: 'redirectRoute',
                method: 'get',
                path: '/redirect',
            }
        ];

        const mdl = {
            name: 'mdl',
            route: 'route',
            moduleLogic: [function(http) {
                http.res.redirect('http://localhost:3000/redirect');
            }],
        };

        const redirectModule = {
            name: 'redirectModule',
            route: 'redirectRoute',
            moduleLogic: [function(http) {
                http.res.send('Redirect');
            }],
        };

        const app = gabriela.asServer(config, routes,{
            events: {
                onAppStarted() {
                    requestPromise({
                        method: 'get',
                        uri: 'http://localhost:3000/route',
                        resolveWithFullResponse: true,
                    }).then((response) => {
                        expect(JSON.parse(response.body)).to.be.equal('Redirect');

                        this.gabriela.close();

                        done();
                    });
                }
            }
        });

        app.addModule(mdl);
        app.addModule(redirectModule);

        app.startApp();
    });
});