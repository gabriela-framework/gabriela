const mocha = require('mocha');
const chai = require('chai');

const it = mocha.it;
const describe = mocha.describe;
const expect = chai.expect;

const gabriela = require('../../gabriela/gabriela');
const configFactory = require('../../gabriela/configFactory');

describe('Config tests', () => {
    it('should resolve config and create it as a singleton', () => {
        const config = require('../config/config');

        const Config = configFactory.create(config);

        expect(Config).to.have.property('validator');
        expect(Config.validator).to.be.a('object');
    });
});