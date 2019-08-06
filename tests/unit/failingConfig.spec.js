const mocha = require('mocha');
const chai = require('chai');

const it = mocha.it;
const describe = mocha.describe;
const expect = chai.expect;

const configFactory = require('../../src/gabriela/configFactory');

describe('Failing config factory tests', () => {
    it('should fail if config is not an object', () => {
        let entersException = false;
        try {
            configFactory.create(null);
        } catch (e) {
            entersException = true;

            expect(e.message).to.be.equal(`Invalid config. Gabriela configuration must be a plain javascript object with only the mandatory 'config' property that also must be a plan object (even if empty)`);
        }

        expect(entersException).to.be.equal(true);
    });

    it('should fail if config.config does not exist', () => {
        let entersException = false;
        try {
            configFactory.create({});
        } catch (e) {
            entersException = true;

            expect(e.message).to.be.equal(`Invalid config. Gabriela configuration must be a plain javascript object with only the mandatory 'config' property that also must be a plan object (even if empty)`);
        }

        expect(entersException).to.be.equal(true);
    });

    it('should fail if config.config is not an object', () => {
        let entersException = false;
        try {
            configFactory.create({
                config: null
            });
        } catch (e) {
            entersException = true;

            expect(e.message).to.be.equal(`Invalid config. Gabriela configuration must be a plain javascript object with only the mandatory 'config' property that also must be a plan object (even if empty)`);
        }

        expect(entersException).to.be.equal(true);
    });

    it('should fail if the mandatory framework key does not exist', () => {
        let entersException = false;
        try {
            configFactory.create({
                config: {
                }
            });
        } catch (e) {
            entersException = true;

            expect(e.message).to.be.equal(`Invalid config. 'framework' property must exist in configuration.`);
       }

        expect(entersException).to.be.equal(true);
    });

    it('should fail if the mandatory framework key is not an object', () => {
        let entersException = false;
        try {
            configFactory.create({
                config: {
                    framework: 'somethingTrueButNotObject',
                }
            });
        } catch (e) {
            entersException = true;

            expect(e.message).to.be.equal(`Invalid config. 'framework' property must be an object.`);
        }

        expect(entersException).to.be.equal(true);
    });
});