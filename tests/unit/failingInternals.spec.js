const mocha = require('mocha');
const chai = require('chai');

const it = mocha.it;
const describe = mocha.describe;
const expect = chai.expect;

const moduleFactory = require('../../gabriela/module/moduleFactory');
const pluginFactory = require('../../gabriela/plugin/pluginFactory');

describe('Failing internal components tests', () => {
    it('should fail to get non existent properties from a created module with a thrown exception', () => {
        const moduleSpec = {
            name: 'name',
        };

        const buildStageArgs = {
            mdl: moduleSpec,
        };

        const mdl = moduleFactory(buildStageArgs);

        try {
            const nonExistent = mdl.nonExistent;
        } catch (e) {
            expect(e.message).to.be.equal(`Module access error. Trying to access a protected or a non existent property 'nonExistent' of a '${mdl.name}' module`);
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