const {is, isEnvExpression, extractEnvExpression, iterate} = require('./../util/util');
const {ENV} = require('./../misc/types');

function _replaceEnvironmentVariables(config) {
    iterate(config, {
        reactTo: ['string'],
        reactor(value) {
            if (isEnvExpression(value)) {
                const env = extractEnvExpression(value);

                if (!process.env[env]) throw new Error(`Invalid config. Environment variable '${env}' does not exist`);

                return process.env[env];
            }

            return value;
        }
    });
}

function _validateFramework(framework) {
    if (!framework) throw new Error(`Invalid config. 'framework' property must exist in configuration.`);

    if (!is('object', framework)) throw new Error(`Invalid config. 'framework' property must be an object.`);

    // validating environment here
    const env = framework.env;
    const performance = framework.performance;

    if (!env) framework.env = ENV.DEVELOPMENT;

    if (env && !ENV.toArray().includes(env)) throw new Error(`Invalid config. Invalid environment. Valid environments are ${ENV.toArray().join(',')}`);

    if (!performance) {
        framework.performance = {
            memoryWarningLimit: 50,
        };
    }

    if (!Number.isInteger(framework.performance.memoryWarningLimit)) throw new Error(`Invalid config. 'framework.performance.memoryWarningLimit' must be an integer`);
}

module.exports = {
    _validateFramework,
    _replaceEnvironmentVariables,
};
