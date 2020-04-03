const mocha = require('mocha');
const chai = require('chai');
const requestPromise = require('request-promise');

const it = mocha.it;
const xit = mocha.xit;
const describe = mocha.describe;
const expect = chai.expect;

const gabriela = require('../../src/gabriela/gabriela');

describe('Tests for all server http methods', () => {
    it ('should create a process a GET request', (done) => {
        let middlewareEntered = false;

        const routes = [
            {
                name: 'route',
                path: '/path',
                method: 'get',
            }
        ];

        const config = {
            routes: routes,
            events: {
                onAppStarted() {
                    requestPromise.get('http://127.0.0.1:3000/path').then(() => {
                        expect(middlewareEntered).to.be.equal(true);

                        this.gabriela.close();

                        done();
                    });
                }
            }
        };

        const app = gabriela.asServer(config);

        const mdl = {
            name: 'mdl',
            route: 'route',
            moduleLogic: [function() {
                middlewareEntered = true;
            }]
        };

        app.addModule(mdl);

        app.startApp();
    });

    it ('should create a process a POST request', (done) => {
        let middlewareEntered = false;

        const routes = [
            {
                name: 'route',
                path: '/path',
                method: 'post',
            }
        ];

        const config = {
            routes: routes,
            events: {
                onAppStarted() {
                    requestPromise.post('http://127.0.0.1:3000/path').then(() => {
                        expect(middlewareEntered).to.be.equal(true);

                        this.gabriela.close();

                        done();
                    });

                }
            }
        };

        const app = gabriela.asServer(config);

        const mdl = {
            name: 'mdl',
            route: 'route',
            moduleLogic: [function() {
                middlewareEntered = true;
            }]
        };

        app.addModule(mdl);

        app.startApp();
    });

    it ('should create a process a PUT request', (done) => {
        let middlewareEntered = false;

        const routes = [
            {
                name: 'route',
                path: '/path',
                method: 'put',
            }
        ];

        const config = {
            routes: routes,
            events: {
                onAppStarted() {
                    requestPromise.put('http://127.0.0.1:3000/path').then(() => {
                        expect(middlewareEntered).to.be.equal(true);

                        this.gabriela.close();

                        done();
                    });

                }
            }
        };

        const app = gabriela.asServer(config);

        const mdl = {
            name: 'mdl',
            route: 'route',
            moduleLogic: [function() {
                middlewareEntered = true;
            }]
        };

        app.addModule(mdl);

        app.startApp();
    });

    it ('should create a process a OPTIONS request', (done) => {
        let middlewareEntered = false;

        const routes = [
            {
                name: 'route',
                path: '/path',
                method: 'options',
            }
        ];

        const config = {
            routes: routes,
            events: {
                onAppStarted() {
                    requestPromise.options('http://127.0.0.1:3000/path').then(() => {
                        expect(middlewareEntered).to.be.equal(true);

                        this.gabriela.close();

                        done();
                    });

                }
            }
        };

        const app = gabriela.asServer(config);

        const mdl = {
            name: 'mdl',
            route: 'route',
            moduleLogic: [function() {
                middlewareEntered = true;
            }]
        };

        app.addModule(mdl);

        app.startApp();
    });

    it ('should create a process a PATCH request', (done) => {
        let middlewareEntered = false;

        const routes = [
            {
                name: 'route',
                path: '/path',
                method: 'patch',
            }
        ];

        const config = {
            routes: routes,
            events: {
                onAppStarted() {
                    requestPromise.patch('http://127.0.0.1:3000/path').then(() => {
                        expect(middlewareEntered).to.be.equal(true);

                        this.gabriela.close();

                        done();
                    });

                }
            }
        };

        const app = gabriela.asServer(config);

        const mdl = {
            name: 'mdl',
            route: 'route',
            moduleLogic: [function() {
                middlewareEntered = true;
            }]
        };

        app.addModule(mdl);

        app.startApp();
    });

    it ('should create a process a HEAD request', (done) => {
        let middlewareEntered = false;

        const routes = [
            {
                name: 'route',
                path: '/path',
                method: 'head',
            }
        ];

        const config = {
            routes: routes,
            events: {
                onAppStarted() {
                    requestPromise.head('http://127.0.0.1:3000/path').then(() => {
                        expect(middlewareEntered).to.be.equal(true);

                        this.gabriela.close();

                        done();
                    });

                }
            }
        };

        const app = gabriela.asServer(config);

        const mdl = {
            name: 'mdl',
            route: 'route',
            moduleLogic: [function() {
                middlewareEntered = true;
            }]
        };

        app.addModule(mdl);

        app.startApp();
    });

    it ('should create a process a DELETE request', (done) => {
        let middlewareEntered = false;

        const routes = [
            {
                name: 'route',
                path: '/path',
                method: 'delete',
            }
        ];

        const config = {
            routes: routes,
            events: {
                onAppStarted() {
                    requestPromise.delete('http://127.0.0.1:3000/path').then(() => {
                        expect(middlewareEntered).to.be.equal(true);

                        this.gabriela.close();

                        done();
                    });

                }
            }
        };

        const app = gabriela.asServer(config);

        const mdl = {
            name: 'mdl',
            route: 'route',
            moduleLogic: [function() {
                middlewareEntered = true;
            }]
        };

        app.addModule(mdl);

        app.startApp();
    });
});
