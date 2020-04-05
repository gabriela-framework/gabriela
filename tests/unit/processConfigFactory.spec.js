const mocha = require('mocha');
const chai = require('chai');

const it = mocha.it;
const describe = mocha.describe;
const expect = chai.expect;

const processConfigFactory = require('../../src/gabriela/config/processConfigFactory');
const {ENV} = require('../../src/gabriela/misc/types');

function _defaultAsserts(config) {
    expect(config.framework).to.be.a('object');
    expect(config.events).to.be.a('object');
    expect(config.plugins).to.be.a('object');
}

function _defaultFrameworkAsserts(framework) {
    expect(framework.env).to.be.equal(ENV.DEVELOPMENT);
    expect(framework.loggingEnabled).to.be.equal(true);
    expect(framework.performance).to.be.a('object');
    expect(framework.performance.memoryWarningLimit).to.be.equal(50);
}

describe('http config factory tests', () => {
    it('should create the default config if none is provided', () => {
        const config = processConfigFactory.create();

        _defaultAsserts(config);
        _defaultFrameworkAsserts(config.framework);
    });

    it('should replace env() variables with real values', () => {
        process.env.ENV = 'prod';

        const config = processConfigFactory.create({
            framework: {
                env: "env('ENV')",
            }
        });

        _defaultAsserts(config);

        const framework = config.framework;

        expect(framework.env).to.be.equal(ENV.PRODUCTION);
        expect(framework.performance).to.be.a('object');
        expect(framework.performance.memoryWarningLimit).to.be.equal(50);
    });

    it('should add the default framework and process config if they are not present', () => {
        const config = processConfigFactory.create({
            events: {},
            plugins: {},
        });

        _defaultAsserts(config);
        _defaultFrameworkAsserts(config.framework);
    });

    it('should successfully resolve config with a range of invalid values', () => {
        const values = [
            '',
            null,
            undefined,
            0,
            56,
            {},
            {framework: {}},
            {framework: {
                    env: 'dev',
                }},
            {framework: {
                    performance: {},
                    loggingEnabled: 'some string'
                }},
            {server: 98},
            {framework: null},
            {framework: 67},
            {
                framework: null,
                plugins: null,
                events: null,
            },
        ];

        for (const val of values) {
            const config = processConfigFactory.create(val);

            _defaultAsserts(config);
            _defaultFrameworkAsserts(config.framework);
        }
    });

    it('should change config values and return defaults if unchanged', () => {
        const enters = [];
        const values = [
            {
                type: 'framework',
                config: {
                    framework: {
                        performance: {
                            memoryWarningLimit: 70,
                        },
                        loggingEnabled: false,
                    }
                },
            },
        ];

        for (const val of values) {
            const config = processConfigFactory.create(val.config);

            if (val.type === 'framework') {
                enters.push(true);
                expect(config.framework.performance.memoryWarningLimit).to.be.equal(70);
                expect(config.framework.loggingEnabled).to.be.equal(false);
            }

            _defaultAsserts(config);
        }

        expect(enters.length).to.be.equal(1);
    });
});
