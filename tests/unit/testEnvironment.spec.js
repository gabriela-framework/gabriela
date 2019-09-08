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

describe('Testing environment', function() {
    it('should create and return a testing environment from gabriela', () => {
        const testApp = gabriela.asTest(config);
    });
});