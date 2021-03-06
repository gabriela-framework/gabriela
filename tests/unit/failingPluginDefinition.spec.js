const mocha = require('mocha');
const chai = require('chai');
const assert = require('assert');

const it = mocha.it;
const xit = mocha.xit;
const describe = mocha.describe;
const expect = chai.expect;

const gabriela = require('../../src/gabriela/gabriela');

describe('Plugin errors', () => {
    it('should fail plugin definition because of invalid data type', () => {
        const p = gabriela.asProcess();

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
        const p = gabriela.asProcess();

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
        const p = gabriela.asProcess();

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

    it('should fail because of existing plugin mounted as server', () => {
        const p = gabriela.asServer();

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

    it('should fail because of existing module in plugin mounted as server', () => {
        let entersException = false;
        const p = gabriela.asServer();

        const mdl1 = {
            name: 'mdl',
        };

        const mdl2 = {
            name: 'mdl',
        };

        const plugin = {
            name: 'plugin',
            modules: [mdl1, mdl2],
        };

        try {
            p.addPlugin(plugin);
        } catch (e) {
            expect(e.message).to.be.equal(`Plugin definition error. Plugin module with name 'plugin.mdl' already exists`);
            entersException = true;
        }

        expect(entersException).to.be.equal(true);
    });

    it('should fail because of existing plugin mounted as process', () => {
        const p = gabriela.asProcess();

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

    it('should fail because of existing module in plugin mounted as process', () => {
        let entersException = false;
        const p = gabriela.asProcess();

        const mdl1 = {
            name: 'mdl',
        };

        const mdl2 = {
            name: 'mdl',
        };

        const plugin = {
            name: 'plugin',
            modules: [mdl1, mdl2],
        };

        try {
            p.addPlugin(plugin);
        } catch (e) {
            expect(e.message).to.be.equal(`Plugin definition error. Plugin module with name 'plugin.mdl' already exists`);
            entersException = true;
        }

        expect(entersException).to.be.equal(true);
    });

    it('should throw an error if plugin modules is not an array', () => {
        const p = gabriela.asProcess();

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
        const p = gabriela.asProcess();

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
});
