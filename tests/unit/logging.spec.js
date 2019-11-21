const mocha = require('mocha');
const chai = require('chai');
const requestPromise = require('request-promise');

const it = mocha.it;
const describe = mocha.describe;
const expect = chai.expect;

const ConfigFactory = require('../../src/gabriela/configFactory');
const LoggerFactory = require('../../src/gabriela/logging/loggerFactory');

describe('Environment logging tests', () => {
    it ('should create the correct logger based on config', () => {
        const devConfig = ConfigFactory.create({
            config: {framework: {
                env: 'dev'
            }}
        });

        const devLogger = LoggerFactory.create(devConfig);

        expect(devLogger).to.have.property('log');
        expect(devLogger.log).to.be.a('function');
        expect(devLogger.name).to.be.equal('DevLogger');

        const prodConfig = ConfigFactory.create({
            config: {framework: {
                    env: 'prod'
                }}
        });

        const prodLogger = LoggerFactory.create(prodConfig);

        expect(prodLogger).to.have.property('log');
        expect(prodLogger.log).to.be.a('function');
        expect(prodLogger.name).to.be.equal('ProdLogger');
    });
});
