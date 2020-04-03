const mocha = require('mocha');
const chai = require('chai');

const it = mocha.it;
const describe = mocha.describe;
const expect = chai.expect;

const httpConfigFactory = require('../../src/gabriela/config/httpConfigFactory');

describe('Failing http config tests', () => {
    it('should fail if incorrect env type', () => {
        let entersException = false;
        try {
            httpConfigFactory.create({
                framework: {
                    env: 'mile',
                }
            });
        } catch (e) {
            entersException = true;

            expect(e.message).to.be.equal(`Invalid config. 'env' can only be 'dev' or 'prod'.`);
        }

        expect(entersException).to.be.equal(true);
    });

    it('should fail if performance is there but is not an object', () => {
        let entersException = false;
        try {
            httpConfigFactory.create({
                framework: {
                    performance: 'mile',
                }
            });
        } catch (e) {
            entersException = true;

            expect(e.message).to.be.equal(`Invalid config. 'framework.performance' must be an object.`);
        }

        expect(entersException).to.be.equal(true);
    });

    it('should fail if framework.performance.memoryWarningLimit is not an integer', () => {
        let entersException = false;
        try {
            httpConfigFactory.create({
                framework: {
                    performance: {
                        memoryWarningLimit: null,
                    },
                }
            });
        } catch (e) {
            entersException = true;

            expect(e.message).to.be.equal(`Invalid config. 'framework.performance.memoryWarningLimit' must be an integer.`);
        }

        expect(entersException).to.be.equal(true);
    });
});
