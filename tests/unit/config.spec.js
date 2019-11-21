const mocha = require('mocha');
const chai = require('chai');

const it = mocha.it;
const describe = mocha.describe;
const expect = chai.expect;

const gabriela = require('../../src/gabriela/gabriela');
const configFactory = require('../../src/gabriela/configFactory');
const {ENV} = require('../../src/gabriela/misc/types');

describe('Config tests', () => {
    it('should resolve config and create it as a singleton', () => {
        const Config = configFactory.create({
            config: {
                validator: {},
                framework: {},
            }
        });

        expect(Config).to.have.property('config');
        expect(Config.config).to.be.a('object');
        expect(Config.config.validator).to.be.a('object');

        expect(Config.config.framework.env).to.be.equal(ENV.DEVELOPMENT);
    });

    it('should create config with production and development environments', () => {
        const ConfigProd = configFactory.create({
            config: {
                validator: {},
                framework: {
                    env: 'prod',
                },
            }
        });

        expect(ConfigProd.config.framework.env).to.be.equal(ENV.PRODUCTION);

        const ConfigDev = configFactory.create({
            config: {
                validator: {},
                framework: {
                    env: 'dev',
                },
            }
        });

        expect(ConfigDev.config.framework.env).to.be.equal(ENV.DEVELOPMENT);
    });

    it('should simulate environment variables and replace them in config', () => {
        process.env.DATABASE_HOST = 'localhost';
        process.env.DATABASE_USER = 'root';
        process.env.DATABASE_PASSWORD = 'root';

        const Config = configFactory.create({
            config: {
                validator: {},
                framework: {
                    env: 'prod',
                },
                db: {
                    host: `ENV('DATABASE_HOST')`,
                    user: `ENV('DATABASE_USER')`,
                    password: `ENV('DATABASE_PASSWORD')`,
                }
            }
        });

        expect(Config.config.db.host).to.be.equal(process.env.DATABASE_HOST);
        expect(Config.config.db.user).to.be.equal(process.env.DATABASE_USER);
        expect(Config.config.db.password).to.be.equal(process.env.DATABASE_PASSWORD);
    });

    it('should run gabriela server and process with config', () => {
        const serverApp = gabriela.asServer();
        const processApp = gabriela.asProcess();

        const serverAppWithConfig = gabriela.asServer({config: {framework: {}}});
        const processAppWithConfig = gabriela.asProcess({config: {framework: {}}});
    });
});