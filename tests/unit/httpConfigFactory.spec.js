const mocha = require('mocha');
const chai = require('chai');

const it = mocha.it;
const describe = mocha.describe;
const expect = chai.expect;

const httpConfigFactory = require('../../src/gabriela/config/httpConfigFactory');
const {ENV} = require('../../src/gabriela/misc/types');

function _defaultAsserts(config) {
    expect(config.framework).to.be.a('object');
    expect(config.server).to.be.a('object');
    expect(config.events).to.be.a('object');
    expect(config.routes).to.be.a('array');
    expect(config.plugins).to.be.a('object');
}

function _defaultServerAsserts(server) {
    expect(server.host).to.be.equal('127.0.0.1');
    expect(server.port).to.be.equal(3000);
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
        _defaultServerAsserts(config.server);
    });

    it('should add the default framework and server config if they are not present', () => {
        const config = httpConfigFactory.create({
            events: {},
            routes: [],
            plugins: {},
        });

        _defaultAsserts(config);
        _defaultFrameworkAsserts(config.framework);
        _defaultServerAsserts(config.server);
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
            {server: null},
            {
                framework: null,
                server: null,
                plugins: null,
                events: null,
                routes: null,
            },
            {
                routes: null,
            }
        ];

        for (const val of values) {
            const config = httpConfigFactory.create(val);

            _defaultAsserts(config);
            _defaultFrameworkAsserts(config.framework);
            _defaultServerAsserts(config.server);
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
            {
                type: 'serverHost',
                config: {
                    server: {
                        host: '127.0.0.4',
                    }
                }
            },
            {
                type: 'serverPort',
                config: {
                    server: {
                        port: 4000,
                    }
                }
            },
            {
                type: 'serverBoth',
                config: {
                    server: {
                        host: '123.333.333',
                        port: 5000,
                    }
                }
            }
        ];

        for (const val of values) {
            const config = httpConfigFactory.create(val.config);

            if (val.type === 'framework') {
                enters.push(true);
                expect(config.framework.performance.memoryWarningLimit).to.be.equal(70);
            }

            if (val.type === 'serverHost') {
                enters.push(true);
                expect(config.server.host).to.be.equal('127.0.0.4');
            }

            if (val.type === 'serverPort') {
                enters.push(true);
                expect(config.server.port).to.be.equal(4000);
            }

            if (val.type === 'serverBoth') {
                enters.push(true);
                expect(config.server.host).to.be.equal('123.333.333');
                expect(config.server.port).to.be.equal(5000);
            }

            _defaultAsserts(config);
        }

        expect(enters.length).to.be.equal(4);
    });
});