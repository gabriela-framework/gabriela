const mocha = require('mocha');
const chai = require('chai');
const assert = require('assert');

const it = mocha.it;
const describe = mocha.describe;
const expect = chai.expect;

const gabriela = require('../../gabriela/gabriela');

describe('Gabriela interface tests', () => {
    it('should have only the public interface methods and object as runner', () => {
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
            'startApp',
        ];

        const g = gabriela.asProcess();

        for (const prop of allowed) {
            expect(g.hasOwnProperty(prop)).to.be.equal(true);
        }

        const publicProps = Object.keys(g);

        for (const prop of publicProps) {
            expect(allowed.includes(prop)).to.be.equal(true);
        }
    });

    it('should have a public interface with all the public methods of a plugin and module as runner', () => {
        const g = gabriela.asProcess();

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

        expect(g).to.have.property('startApp');
        expect(g.startApp).to.be.a('function');
    });

    it('should have only the public interface methods and object as server', () => {
        const allowed = [
            'addModule',
            'overrideModule',
            'getModule',
            'removeModule',
            'hasModule',
            'getModules',
            'addPlugin',
            'getPlugin',
            'removePlugin',
            'hasPlugin',
            'getPlugins',
            'startApp',
        ];

        const g = gabriela.asServer();

        for (const prop of allowed) {
            expect(g.hasOwnProperty(prop)).to.be.equal(true);
        }

        const publicProps = Object.keys(g);

        for (const prop of publicProps) {
            expect(allowed.includes(prop)).to.be.equal(true);
        }
    });

    it('should have a public interface with all the public methods of a plugin and module as server', () => {
        const g = gabriela.asServer();

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

        expect(g).to.have.property('startApp');
        expect(g.startApp).to.be.a('function');
    });
});