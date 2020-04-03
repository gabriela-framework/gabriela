const mocha = require('mocha');
const chai = require('chai');
const requestPromise = require('request-promise');

const it = mocha.it;
const xit = mocha.xit;
const describe = mocha.describe;
const expect = chai.expect;

const gabriela = require('../../src/gabriela/gabriela');
const {is} = require('../../src/gabriela/util/util');
const _responseProxy = require('../../src/gabriela/module/_responseProxy');

describe('Concrete and functional http response tests', function() {
    this.timeout(10000);

    xit('should fail if the responseProxy interface changes as a remainder to update the tests', () => {
        const currentProperties = ['json', 'send'];

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
                http.res.send(200, 'Response', {
                    'Cache-Control': `max-age=${maxAge}`,
                });
            }],
        };

        const config = {
            routes: routes,
            events: {
                onAppStarted() {
                    requestPromise.get('http://localhost:3000/route', (err, response) => {
                        const cacheControl = response.headers['cache-control'];

                        expect(response.body).to.be.equal('Response');
                        expect(cacheControl).to.be.equal(`max-age=${maxAge}`);

                        this.gabriela.close();

                        done();
                    })
                }
            }
        };

        const app = gabriela.asServer(config);

        app.addModule(mdl);

        app.startApp();
    });

    it('should append the header with append() response function', (done) => {
        const routes = [
            {
                name: 'route',
                method: 'get',
                path: '/route',
            }
        ];

        const maxAge = 2000;
        const mdl = {
            name: 'mdl',
            route: 'route',
            moduleLogic: [function(http) {
                http.res.append('Cache-Control', `max-age=${maxAge}`);

                http.res.send(200, 'Response');
            }],
        };

        const config = {
            routes: routes,
            events: {
                onAppStarted() {
                    requestPromise.get('http://localhost:3000/route', (err, response) => {
                        const cacheControl = response.headers['cache-control'];

                        expect(response.body).to.be.equal('Response');
                        expect(cacheControl).to.be.equal(`max-age=${maxAge}`);

                        this.gabriela.close();

                        done();
                    })
                }
            }
        };

        const app = gabriela.asServer(config);

        app.addModule(mdl);

        app.startApp();
    });

    it('should add Content-Disposition with the attachment() function with no parameters', (done) => {
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
                http.res.attachment();

                http.res.send(200, 'Response');
            }],
        };

        const config = {
            routes: routes,
            events: {
                onAppStarted() {
                    requestPromise.get('http://localhost:3000/route', (err, response) => {
                        const contentDisposition = response.headers['content-disposition'];

                        expect(response.body).to.be.equal('Response');
                        expect(contentDisposition).to.be.equal('attachment');

                        this.gabriela.close();

                        done();
                    })
                }
            }
        };

        const app = gabriela.asServer(config);

        app.addModule(mdl);

        app.startApp();
    });

    it('should add Content-Disposition with the attachment() function with path parameter', (done) => {
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
                http.res.attachment('/path/to/attachment.jpg');

                http.res.send(200, 'Response');
            }],
        };

        const config = {
            routes: routes,
            events: {
                onAppStarted() {
                    requestPromise.get('http://localhost:3000/route', (err, response) => {
                        const contentDisposition = response.headers['content-disposition'];
                        const contentType = response.headers['content-type'];

                        expect(response.body).to.be.equal('Response');
                        expect(contentDisposition).to.be.equal('attachment; filename="attachment.jpg"');
                        expect(contentType).to.be.equal('image/jpeg; charset=utf-8');

                        this.gabriela.close();

                        done();
                    })
                }
            }
        };

        const app = gabriela.asServer(config);

        app.addModule(mdl);

        app.startApp();
    });

    it('should get already set header with get method', (done) => {
        let middlewareCalled = false;
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
                middlewareCalled = true;

                http.res.set('X-SOME-HEADER', 'header');
                http.res.set({'X-OTHER-HEADER': 'header'});

                expect(http.res.get('X-SOME-HEADER')).to.be.equal('header');
                expect(http.res.get('X-OTHER-HEADER')).to.be.equal('header');
            }],
        };

        const config = {
            routes: routes,
            events: {
                onAppStarted() {
                    requestPromise.get('http://localhost:3000/route', (err, response) => {
                        expect(middlewareCalled).to.be.equal(true);

                        this.gabriela.close();

                        done();
                    })
                }
            }
        };

        const app = gabriela.asServer(config);

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
                http.res.set('X-CUSTOM-HEADER', 'customheader');
                http.res.send(200, 'Response');
            }],
        };

        const config = {
            routes: routes,
            events: {
                onAppStarted() {
                    requestPromise.get('http://localhost:3000/route', (err, response) => {

                        expect(response.body).to.be.equal('Response');

                        expect(response.headers).to.have.property('x-custom-header');
                        expect(response.headers['x-custom-header']).to.be.equal('customheader');

                        this.gabriela.close();

                        done();
                    })
                }
            }
        };

        const app = gabriela.asServer(config);

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

        const config = {
            routes: routes,
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
        };

        const app = gabriela.asServer(config);

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
                http.res.links({
                    'key': 'value',
                });
                http.res.json(200, 'Response');
            }],
        };

        const config = {
            routes: routes,
            events: {
                onAppStarted() {
                    requestPromise.get('http://localhost:3000/route', (err, response) => {

                        expect(JSON.parse(response.body)).to.be.equal('Response');
                        expect(response.headers.link).to.be.equal(`<value>; rel="key"`);

                        this.gabriela.close();

                        done();
                    })
                }
            }
        };

        const app = gabriela.asServer(config);

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

                http.res.send(200, 'Response');
            }],
        };

        const config = {
            routes: routes,
            events: {
                onAppStarted() {
                    requestPromise.get('http://localhost:3000/route', (err, response) => {

                        expect(response.body).to.be.equal('Response');
                        expect(response.headers['x-custom-header-one']).to.be.equal(`customheaderone`);
                        expect(response.headers['x-custom-header-two']).to.be.equal(`customheadertwo`);

                        this.gabriela.close();

                        done();
                    })
                }
            }
        };

        const app = gabriela.asServer(config);

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
                http.res.send(200, 'Redirect');
            }],
        };

        const config = {
            routes: routes,
            events: {
                onAppStarted() {
                    requestPromise({
                        method: 'get',
                        uri: 'http://localhost:3000/route',
                        resolveWithFullResponse: true,
                    }).then((response) => {
                        expect(response.body).to.be.equal('Redirect');

                        this.gabriela.close();

                        done();
                    });
                }
            }
        };

        const app = gabriela.asServer(config);

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
                http.res.send(200, 'Redirect');
            }],
        };

        const config = {
            routes: routes,
            events: {
                onAppStarted() {
                    requestPromise({
                        method: 'get',
                        uri: 'http://localhost:3000/route',
                        resolveWithFullResponse: true,
                    }).then((response) => {
                        expect(response.body).to.be.equal('Redirect');

                        this.gabriela.close();

                        done();
                    });
                }
            }
        };

        const app = gabriela.asServer(config);

        app.addModule(mdl);
        app.addModule(redirectModule);

        app.startApp();
    });
});
