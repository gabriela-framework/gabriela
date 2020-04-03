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

    it('should fail to parse environment variable if env var does not exist', () => {
        let entersException = false;
        process.env.ENV = 'prod';
        try {
            httpConfigFactory.create({
                framework: {
                    env: "env('ENV')",
                },
                server: {
                    host: "env('not_exists')",
                }
            });
        } catch (e) {
            entersException = true;

            expect(e.message).to.be.equal(`Invalid config. Environment variable 'not_exists' does not exist`)
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

    it('should fail if server.host is provided but is not a string', () => {
        let entersException = false;
        try {
            httpConfigFactory.create({
                server: {
                    host: null,
                }
            });
        } catch (e) {
            entersException = true;

            expect(e.message).to.be.equal(`Invalid config. 'server.host' must be a string.`);
        }

        expect(entersException).to.be.equal(true);
    });

    it('should fail if server.port is provided but is not a integer', () => {
        let entersException = false;
        try {
            httpConfigFactory.create({
                server: {
                    port: null,
                }
            });
        } catch (e) {
            entersException = true;

            expect(e.message).to.be.equal(`Invalid config. 'server.port' must be an integer.`);
        }

        expect(entersException).to.be.equal(true);
    });
});
