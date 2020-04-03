const mocha = require('mocha');
const chai = require('chai');

const it = mocha.it;
const describe = mocha.describe;
const expect = chai.expect;

const httpConfigFactory = require('../../src/gabriela/config/httpConfigFactory');
const {ENV} = require('../../src/gabriela/misc/types');

function _defaultAsserts(config) {
    expect(config.framework).to.be.a('object');
    expect(config.events).to.be.a('object');
    expect(config.plugins).to.be.a('object');
}

function _defaultFrameworkAsserts(framework) {
    expect(framework.env).to.be.equal(ENV.DEVELOPMENT);
    expect(framework.performance).to.be.a('object');
    expect(framework.performance.memoryWarningLimit).to.be.equal(50);
}

describe('http config factory tests', () => {
    it('should create the default config if none is provided', () => {
        const config = httpConfigFactory.create();

        _defaultAsserts(config);
        _defaultFrameworkAsserts(config.framework);
    });

    it('should add the default framework and process config if they are not present', () => {
        const config = httpConfigFactory.create({
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
            const config = httpConfigFactory.create(val);

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
                        }
                    }
                },
            },
        ];

        for (const val of values) {
            const config = httpConfigFactory.create(val.config);

            if (val.type === 'framework') {
                enters.push(true);
                expect(config.framework.performance.memoryWarningLimit).to.be.equal(70);
            }

            _defaultAsserts(config);
        }

        expect(enters.length).to.be.equal(1);
    });
});
