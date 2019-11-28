const mocha = require('mocha');
const chai = require('chai');
const assert = require('assert');

const {HTTP_METHODS} = require('../../src/gabriela/misc/types');

const it = mocha.it;
const xit = mocha.xit;
const describe = mocha.describe;
const expect = chai.expect;

const gabriela = require('../../src/gabriela/gabriela');
const config = require('../config/config');

describe('Plugin errors', () => {
    it('should fail plugin definition because of invalid data type', () => {
        const p = gabriela.asProcess(config);

        const plugin = null;

        let entersException = false;
        try {
            p.addPlugin(plugin);
        } catch (e) {
            entersException = true;

            expect(e.message).to.be.equal(`Plugin definition error. Plugin definition has to be an object`);
        }

        expect(entersException).to.be.equal(true);
    });

    it('should fail because of non existent plugin name', () => {
        const p = gabriela.asProcess(config);

        const plugin = {};

        let entersException = false;
        try {
            p.addPlugin(plugin);
        } catch (e) {
            entersException = true;

            expect(e.message).to.be.equal(`Plugin definition error. Plugin definition has to have a 'name' property`);
        }

        expect(entersException).to.be.equal(true);
    });

    it('should fail because of invalid plugin name', () => {
        const p = gabriela.asProcess(config);

        let plugin = {
            name: 1
        };

        let entersException = false;
        try {
            p.addPlugin(plugin);
        } catch (e) {
            entersException = true;

            expect(e.message).to.be.equal(`Plugin definition error. Plugin 'name' must be a string`);
        }

        expect(entersException).to.be.equal(true);
    });

    it('should fail because of existing plugin', () => {
        const p = gabriela.asProcess(config);

        const plugin1 = {
            name: 'plugin1',
        };

        const plugin2 = {
            name: 'plugin2',
        };

        p.addPlugin(plugin1);
        p.addPlugin(plugin2);

        let entersException = false;
        try {
            p.addPlugin({
                name: 'plugin2',
            });
        } catch (e) {
            entersException = true;

            expect(e.message).to.be.equal(`Plugin definition error. Plugin with name '${plugin2.name}' already exists`);
        }

        expect(entersException).to.be.equal(true);
    });

    it('should throw an error if plugin modules is not an array', () => {
        const p = gabriela.asProcess(config);

        const plugin = {
            name: 'plugin',
            modules: null
        };

        let entersException = false;
        try {
            p.addPlugin(plugin);
        } catch (e) {
            entersException = true;

            expect(e.message).to.be.equal(`Plugin definition error. Plugin with name '${plugin.name}' 'modules' entry must be an array of module objects`);
        }

        expect(entersException).to.be.equal(true);
    });

    it('should throw an error if any of the plugin modules are invalid', (done) => {
        const p = gabriela.asProcess(config);

        const plugin = {
            name: 'plugin',
            modules: [{
                name: 'moduleName',
                dependencies: null,
            }]
        };

        let entersException = false;
        try {
            p.addPlugin(plugin);
        } catch (e) {
            entersException = true;

            expect(e.message).to.be.equal(`Plugin definition error. Plugin with name '${plugin.name}' has an invalid 'modules' entry with message: 'Module definition error in module 'moduleName'. 'dependencies' has to be an array of type object'`);

            done();
        }

        expect(entersException).to.be.equal(true);
    });

    it('should throw an error when running a plugin with invalid type', (done) => {
        const p = gabriela.asProcess(config);

        const plugin = {
            name: 'plugin',
        };

        p.addPlugin(plugin);

        p.runPlugin([]).then(() => {
            assert.fail('This test should not be executed successfully');
        }).catch((err) => {
            expect(err.message).to.be.equal(`Plugin tree runtime error. Invalid plugin name type. Plugin name must be a string`);

            done();
        });
    });

    it('should throw an error while executing an non existent plugin', (done) => {
        const p = gabriela.asProcess(config);

        const plugin = {
            name: 'plugin',
        };

        p.addPlugin(plugin);

        p.runPlugin('nonExistent').then(() => {
            assert.fail('This test should not be executed successfully');
        }).catch((err) => {
            expect(err.message).to.be.equal(`Plugin tree runtime error. Plugin with name 'nonExistent' does not exist`);

            done();
        });
    });

    it('should fail if http exists but is not an object', () => {
        const p = gabriela.asServer(config, []);

        const plugin = {
            name: 'plugin',
            http: null
        };

        let entersException = false;
        try {
            p.addPlugin(plugin);
        } catch (e) {
            entersException = true;
            expect(e.message).to.be.equal(`Invalid 'http' definition in plugin 'plugin'. 'http' entry must be an object`)
        }

        expect(entersException).to.be.equal(true);
    });

    it('should fail if http.route is not a string', () => {
        const p = gabriela.asServer(config, []);

        const plugin = {
            name: 'plugin',
            http: {
                route: null
            }
        };

        let entersException = false;
        try {
            p.addPlugin(plugin);
        } catch (e) {
            entersException = true;
            expect(e.message).to.be.equal(`Invalid 'http' definition in plugin 'plugin'. 'http.route' entry must be a string`)
        }

        expect(entersException).to.be.equal(true);
    });

    it('should fail if http.allowedMethods is not an array', () => {
        const p = gabriela.asServer(config, []);

        const plugin = {
            name: 'plugin',
            http: {
                route: '/base-path',
                allowedMethods: null,
            }
        };

        let entersException = false;
        try {
            p.addPlugin(plugin);
        } catch (e) {
            entersException = true;
            expect(e.message).to.be.equal(`Invalid 'http' definition in plugin 'plugin'. 'http.allowedMethods' entry must be an array`)
        }

        expect(entersException).to.be.equal(true);
    });

    it('should fail if http.allowedMethods has a invalid method in list', () => {
        const p = gabriela.asServer(config, []);

        const methods = ['get', 'POST', 'put', 'HEAD', 'INVALID'];

        const plugin = {
            name: 'plugin',
            http: {
                route: '/base-path',
                allowedMethods: methods,
            }
        };

        let entersException = false;
        try {
            p.addPlugin(plugin);
        } catch (e) {
            entersException = true;

            expect(e.message).to.be.equal(`Invalid 'http' definition in plugin 'plugin'. 'http.allowedMethods' has an invalid http method 'invalid'. Valid http methods are ${Object.values(HTTP_METHODS).join(', ')}`);
        }

        expect(entersException).to.be.equal(true);
    });

    it('should fail if the module has a not allowed http method', () => {
        const routes = [
            {
                name: 'route',
                path: '/route',
                method: 'put'
            }
        ];

        const p = gabriela.asServer(config, routes);

        const methods = ['get', 'POST'];

        const mdl = {
            name: 'module',
            route: 'route',
        };

        const plugin = {
            name: 'plugin',
            modules: [mdl],
            http: {
                route: '/base-path',
                allowedMethods: methods,
            }
        };

        let entersException = false;
        try {
            p.addPlugin(plugin);
        } catch (e) {
            entersException = true;
            expect(e.message).to.be.equal(`Invalid module definition for module '${mdl.name}' in plugin '${plugin.name}'. Module '${mdl.name}' is declared to use 'PUT' http method but allowed methods in plugin are '${methods.join(', ').toUpperCase()}'`);
        }

        expect(entersException).to.be.equal(true);
    });

    it('should successfully validate all the allowed http methods', () => {
        const p = gabriela.asServer(config, []);

        const methods = ['get', 'POST', 'put', 'HEAD', 'patch', 'DELete', 'oPtioNs'];

        const plugin = {
            name: 'plugin',
            http: {
                route: '/base-path',
                allowedMethods: methods,
            }
        };

        return p.addPlugin(plugin);
    });
});