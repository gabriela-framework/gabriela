const mocha = require('mocha');
const chai = require('chai');

const it = mocha.it;
const xit = mocha.xit;
const describe = mocha.describe;
const expect = chai.expect;

const gabriela = require('../../gabriela/gabriela');

describe('Gabriela interface tests', () => {
    it('should have only the public interface methods and object', () => {
        const allowed = [
            'addModule',
            'overrideModule',
            'getModule',
            'removeModule',
            'hasModule',
            'getModules',
            'runModule',
            'addPlugin',
            'getPlugin',
            'removePlugin',
            'hasPlugin',
            'getPlugins',
            'runPlugin',
            'moduleFactory',
            'pluginFactory',
            'startApp',
        ];

        const g = gabriela.asRunner();

        for (const prop of allowed) {
            expect(g.hasOwnProperty(prop)).to.be.equal(true);
        }

        const publicProps = Object.keys(g);

        for (const prop of publicProps) {
            expect(allowed.includes(prop)).to.be.equal(true);
        }
    });

    it('should have a public interface with all the public methods of a plugin and module', () => {
        const g = gabriela.asRunner();

        expect(g).to.have.property('addModule');
        expect(g.addModule).to.be.a('function');

        expect(g).to.have.property('overrideModule');
        expect(g.overrideModule).to.be.a('function');

        expect(g).to.have.property('getModule');
        expect(g.getModule).to.be.a('function');

        expect(g).to.have.property('removeModule');
        expect(g.removeModule).to.be.a('function');

        expect(g).to.have.property('hasModule');
        expect(g.hasModule).to.be.a('function');

        expect(g).to.have.property('getModules');
        expect(g.getModules).to.be.a('function');

        expect(g).to.have.property('runModule');
        expect(g.runModule).to.be.a('function');

        expect(g).to.have.property('addPlugin');
        expect(g.addPlugin).to.be.a('function');

        expect(g).to.have.property('getPlugin');
        expect(g.getPlugin).to.be.a('function');

        expect(g).to.have.property('removePlugin');
        expect(g.removePlugin).to.be.a('function');

        expect(g).to.have.property('hasPlugin');
        expect(g.hasPlugin).to.be.a('function');

        expect(g).to.have.property('getPlugins');
        expect(g.getPlugins).to.be.a('function');

        expect(g).to.have.property('runPlugin');
        expect(g.runPlugin).to.be.a('function');

        expect(g).to.have.property('moduleFactory');
        expect(g.moduleFactory).to.be.a('object');

        expect(g).to.have.property('pluginFactory');
        expect(g.pluginFactory).to.be.a('object');

        expect(g).to.have.property('startApp');
        expect(g.startApp).to.be.a('function');
    });

    xit('should evaluate that moduleFactory and pluginFactory have the same public interface', () => {
        const g = gabriela.asRunner();

        const moduleFactory = g.moduleFactory;
        const pluginFactory = g.pluginFactory;

        expect(Object.keys(moduleFactory)).to.be.equal(Object.keys(pluginFactory));
    });
});