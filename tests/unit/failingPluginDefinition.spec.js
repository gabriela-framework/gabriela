const mocha = require('mocha');
const chai = require('chai');
const assert = require('assert');

const it = mocha.it;
const describe = mocha.describe;
const expect = chai.expect;

const gabriela = require('../../gabriela/gabriela');

describe('Plugin errors', () => {
    it('should fail plugin definition because of invalid data type', () => {
        const p = gabriela.asRunner();

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
        const p = gabriela.asRunner();

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
        const p = gabriela.asRunner();

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
        const p = gabriela.asRunner();

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
        const p = gabriela.asRunner();

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
        const p = gabriela.asRunner();

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
        const p = gabriela.asRunner();

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
        const p = gabriela.asRunner();

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

    it('should fail if a inner tree of plugins has invalid definition', () => {
        const innerPlugin1 = {
            name: 'innerPlugin1',
            modules: null,
        };

        const innerPlugin2 = {
            name: 'innerPlugin2',
            plugins: [innerPlugin1],
        };

        const mainPlugin = {
            name: 'mainPlugin',
            plugins: [innerPlugin2],
        };

        const g = gabriela.asRunner();

        let entersException = false;
        try {
            g.addPlugin(mainPlugin);
        } catch(e) {
            entersException = true;

            expect(e.message).to.be.equal(`Plugin definition error. Plugin with name '${innerPlugin1.name}' 'modules' entry must be an array of module objects`);
        }

        expect(entersException).to.be.equal(true);
    });
});