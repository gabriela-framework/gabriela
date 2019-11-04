const mocha = require('mocha');
const chai = require('chai');
const assert = require('assert');
const gabriela = require('./../../src/index');
const mockResponseFn = require('./../../src/gabriela/testing/mock/response');

const it = mocha.it;
const xit = mocha.xit;
const describe = mocha.describe;
const expect = chai.expect;

describe('Testing utilities', () => {
    it('should fail to add already added module', () => {
        const testApp = gabriela.asTest({
            config: {framework: {}}
        });

        const bodyString = "This is the body";

        const mdl = {
            name: 'testingModule',
            http: {
                route: {
                    name: 'route',
                    path: '/path',
                    method: 'GET',
                }
            },
            init: [function(http) {
                http.res.send(200, bodyString);
            }],
        };

        testApp.addModule(mdl);

        let entersException = false;
        try {
            testApp.addModule(mdl);
        } catch (err) {
            entersException = true;

            expect(err.message).to.be.equal(`Invalid testing setup. Module with name '${mdl.name}' has already been added`)
        }

        expect(entersException).to.be.equal(true);
    });

    it('should fail to add already added plugin', () => {
        const testApp = gabriela.asTest({
            config: {framework: {}}
        });

        const plugin = {
            name: 'plugin',
        };

        testApp.addPlugin(plugin);

        let entersException = false;
        try {
            testApp.addPlugin(plugin);
        } catch (err) {
            entersException = true;

            expect(err.message).to.be.equal(`Invalid testing setup. Plugin with name '${plugin.name}' has already been added`)
        }

        expect(entersException).to.be.equal(true);
    });

    it('should fail if trying to execute a module within a non existent plugin', (done) => {
        const testApp = gabriela.asTest({
            config: {framework: {}}
        });

        const bodyString = "This is the body";

        const mdl = {
            name: 'module',
            http: {
                route: {
                    name: 'route',
                    path: '/path',
                    method: 'GET',
                }
            },
            init: [function(http) {
                http.res.send(200, bodyString);
            }],
        };

        const plugin = {
            name: 'plugin',
            modules: [mdl]
        };

        testApp.addPlugin(plugin);

        testApp.get('nonExistentPlugin#module').catch((err) => {
            expect(err.message).to.be.equal(`Invalid testing setup. Invalid pluginName#moduleName name 'nonExistentPlugin#module'. Plugin with name 'nonExistentPlugin' does not exist`);

            done();
        });
    });

    it('should not execute a post method if a get method is mocked', (done) => {
        const testApp = gabriela.asTest({
            config: {framework: {}}
        });

        const bodyString = "This is the body";

        const mdl = {
            name: 'testingModule',
            http: {
                route: {
                    name: 'route',
                    path: '/path',
                    method: 'GET',
                }
            },
            init: [function(http) {
                http.res.send(200, bodyString);
            }],
        };

        testApp.addModule(mdl);

        testApp.post('testingModule').catch(() => {
            done();
        });
    });

    it('should call a \'get\' http method on the http mock utility using a module with a simple body', (done) => {
        const testApp = gabriela.asTest({
            config: {framework: {}}
        });

        const bodyString = "This is the body";

        const mdl = {
            name: 'module',
            http: {
                route: {
                    name: 'route',
                    path: '/path',
                    method: 'GET',
                }
            },
            init: [function(http) {
                http.res.send(200, bodyString);
            }],
        };

        testApp.addModule(mdl);

        testApp.get('module').then((res) => {
            expect(bodyString).to.be.equal(res.body());

            done();
        });
    });

    it('should execute a post method from a module', (done) => {
        const testApp = gabriela.asTest({
            config: {framework: {}}
        });

        const bodyString = "This is the body";

        const mdl = {
            name: 'module',
            http: {
                route: {
                    name: 'route',
                    path: '/path',
                    method: 'POST',
                }
            },
            init: [function(http) {
                http.res.send(200, bodyString);
            }],
        };

        testApp.addModule(mdl);

        testApp.post('module').then((res) => {
            expect(bodyString).to.be.equal(res.body());

            done();
        });
    });

    it('should execute a module from a plugin', (done) => {
        const testApp = gabriela.asTest({
            config: {framework: {}}
        });

        const bodyString = "This is the body";

        const mdl = {
            name: 'module',
            http: {
                route: {
                    name: 'route',
                    path: '/path',
                    method: 'GET',
                }
            },
            init: [function(http) {
                http.res.send(200, bodyString);
            }],
        };

        const plugin = {
            name: 'plugin',
            modules: [mdl]
        };

        testApp.addPlugin(plugin);

        testApp.get('plugin#module').then((res) => {
            expect(res.body()).to.be.equal(bodyString);

            done();
        })
    });


});