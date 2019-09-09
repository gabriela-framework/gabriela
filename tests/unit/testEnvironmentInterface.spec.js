const mocha = require('mocha');
const chai = require('chai');

const it = mocha.it;
const describe = mocha.describe;
const expect = chai.expect;

const gabriela = require('../../src/gabriela/gabriela');
const config = require('../config/config');

describe('Testing environment interface', function() {
    it('should create and return a testing environment and validate its interface', () => {
        const testApp = gabriela.asTest(config);

        expect(testApp.loadDependency).to.be.a('function');
        expect(testApp.loadModule).to.be.a('function');
        expect(testApp.loadPlugin).to.be.a('function');

        const graph = [{
            name: 'name',
            init: function() {}
        }];

        const dependencyResolver = testApp.loadDependency(graph);
        const moduleResolver = testApp.loadModule({
            name: 'module',
        });

        expect(moduleResolver).to.be.a('object');
        expect(dependencyResolver).to.be.a('object');

        expect(dependencyResolver.resolve).to.be.a('function');
    });
});