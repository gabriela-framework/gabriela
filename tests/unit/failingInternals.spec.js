const mocha = require('mocha');
const chai = require('chai');

const it = mocha.it;
const describe = mocha.describe;
const expect = chai.expect;

const moduleFactory = require('../../gabriela/module/moduleFactory');
const pluginFactory = require('../../gabriela/plugin/pluginFactory');

describe('Failing internal components tests', () => {
    it('should fail to set properties to already created module with module factory', () => {
        const moduleSpec = {
            name: 'name',
        };

        const mdl = moduleFactory(moduleSpec);

        try {
            mdl.invalid = true;
        } catch (e) {
            expect(e.message).to.be.equal(`Internal module factory error. You cannot add properties to an already created 'ModuleFactory'`);
        }
    });

    it('should fail to get non existent properties from a created module with a thrown exception', () => {
        const moduleSpec = {
            name: 'name',
        };

        const mdl = moduleFactory(moduleSpec);

        try {
            const nonExistent = mdl.nonExistent;
        } catch (e) {
            expect(e.message).to.be.equal(`Module access error. Trying to access a protected or a non existent property 'nonExistent' of a '${mdl.name}' module`);
        }
    });

    it('should fail to set properties to already created plugin with plugin factory', () => {
        const pluginSpec = {
            name: 'name',
        };

        const plugin = pluginFactory(pluginSpec);

        try {
            plugin.invalid = true;
        } catch (e) {
            expect(e.message).to.be.equal(`Internal plugin factory error. You cannot add properties to an already created 'PluginFactory'`);
        }
    });

    it('should fail to get non existent properties from a created plugin with a thrown exception', () => {
        const pluginSpec = {
            name: 'name',
        };

        const plugin = pluginFactory(pluginSpec);

        try {
            const nonExistent = plugin.nonExistent;
        } catch (e) {
            expect(e.message).to.be.equal(`Plugin access error. Trying to access a protected or non existent property 'nonExistent' of a '${pluginSpec.name}' plugin`);
        }
    });
});