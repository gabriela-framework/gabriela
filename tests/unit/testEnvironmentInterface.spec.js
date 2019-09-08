const mocha = require('mocha');
const chai = require('chai');
const assert = require('assert');
const requestPromise = require('request-promise');

const it = mocha.it;
const xit = mocha.xit;
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
    });
});