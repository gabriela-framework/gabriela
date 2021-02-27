var _a = require('./../util/util'), isEnvExpression = _a.isEnvExpression, extractEnvExpression = _a.extractEnvExpression, iterate = _a.iterate;
function _replaceEnvironmentVariables(config) {
    iterate(config, {
        reactTo: ['string'],
        reactor: function (value) {
            if (isEnvExpression(value)) {
                var env = extractEnvExpression(value);
                if (!process.env[env])
                    throw new Error("Invalid config. Environment variable '" + env + "' does not exist");
                return process.env[env];
            }
            return value;
        }
    });
}
module.exports = {
    _replaceEnvironmentVariables: _replaceEnvironmentVariables
};
//# sourceMappingURL=_shared.js.map