const mocha = require('mocha');
const chai = require('chai');

const it = mocha.it;
const describe = mocha.describe;
const expect = chai.expect;

const Validator = require('../../src/gabriela/misc/validator');

describe('Failing validators static functions package', () => {
    it('should fail if the Validator is used as an instance and not static', () => {
        let entersException = false;
        try {
            new Validator();
        } catch (e) {
            entersException = true;

            expect(e.message).to.be.equal(`Invalid usage of Validator. Validator cannot be used as an instance but only as a static method repository`);
        }

        expect(entersException).to.be.equal(true);
    });
});