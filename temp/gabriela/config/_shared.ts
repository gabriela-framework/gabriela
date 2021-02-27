const {isEnvExpression, extractEnvExpression, iterate} = require('./../util/util');

export function _replaceEnvironmentVariables(config: FrameworkConfig) {
    iterate(config, {
        reactTo: ['string'],
        reactor(value: any) {
            if (isEnvExpression(value)) {
                const env = extractEnvExpression(value);

                if (!process.env[env]) throw new Error(`Invalid config. Environment variable '${env}' does not exist`);

                return process.env[env];
            }

            return value;
        }
    });
}
