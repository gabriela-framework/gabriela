const {isEnvExpression, extractEnvExpression, iterate} = require('./../util/util');

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

module.exports = {
    _replaceEnvironmentVariables,
};
