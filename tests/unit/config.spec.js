const mocha = require('mocha');
const chai = require('chai');

const it = mocha.it;
const describe = mocha.describe;
const expect = chai.expect;

const gabriela = require('../../gabriela/gabriela');
const Config = require('../../gabriela/config');

describe('Config tests', () => {
    it('should resolve config and create it as a singleton', () => {
        Config.create(require('../config/config'));

        const validatorEntry = Config.getProp('validator');

        expect(Config.has('validator')).to.be.equal(true);
        expect(validatorEntry).to.be.a('object');
        expect(Config.has('nonExistent')).to.be.equal(false);
        expect(Config.getProp('nonExistent')).to.be.equal(undefined);

        Config.config = null;

        expect(Config.config).to.be.a('object');

        const Config2 = require('../../gabriela/config');

        expect(Config2.has('validator')).to.be.equal(true);
        expect(validatorEntry).to.be.a('object');
        expect(Config2.has('nonExistent')).to.be.equal(false);
        expect(Config2.getProp('nonExistent')).to.be.equal(undefined);
    });
});