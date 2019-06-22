const mocha = require('mocha');
const chai = require('chai');
const assert = require('assert');

const it = mocha.it;
const xit = mocha.xit;
const describe = mocha.describe;
const expect = chai.expect;

const gabriela = require('../../gabriela/gabriela');

describe('Plugin creation tests', () => {
    it('should have a plugin interface', () => {
        const p = gabriela.asRunner();

        expect(p).to.have.property('addPlugin');
        expect(p).to.have.property('hasPlugin');
        expect(p).to.have.property('getPlugin');
        expect(p).to.have.property('getPlugins');
        expect(p).to.have.property('removePlugin');
    });

    it('should evaluate plugin interface', () => {
        const p = gabriela.asRunner();

        p.addPlugin({
            name: 'plugin1',
        });

        expect(p.hasPlugin('plugin1')).to.be.equal(true);
        expect(p.getPlugin('notDefined')).to.be.equal(undefined);
        expect(p.getPlugin('plugin1')).to.be.a('object');

        const plugin1 = p.getPlugin('plugin1');

        expect(plugin1).to.have.property('name');
        expect(plugin1.name).to.be.equal('plugin1');

        const allPlugins = p.getPlugins();

        expect(allPlugins).to.have.property('plugin1');
        expect(allPlugins.plugin1).to.be.a('object');

        p.removePlugin('plugin1');

        expect(p.hasPlugin('plugin1')).to.be.equal(false);

        const emptyPlugins = p.getPlugins();

        expect(emptyPlugins).to.not.have.property('plugin1');
    });
});
