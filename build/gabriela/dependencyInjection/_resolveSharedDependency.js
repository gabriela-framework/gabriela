var _a = require('./_permissions'), _hasCompletePermission = _a._hasCompletePermission, _hasModulePermission = _a._hasModulePermission, _hasPluginPermission = _a._hasPluginPermission, _isInPlugin = _a._isInPlugin;
module.exports = function _resolveSharedDependency(name, originCompiler, sharedInfo, config) {
    var definition = originCompiler.shared.getOwnDefinition(name);
    if (_isInPlugin(sharedInfo) && _hasCompletePermission(name, definition, sharedInfo)) {
        return originCompiler.shared.compile(name, originCompiler, config, sharedInfo);
    }
    if (_isInPlugin(sharedInfo) && _hasPluginPermission(name, definition, sharedInfo)) {
        return originCompiler.shared.compile(name, originCompiler, config, sharedInfo);
    }
    if (_hasModulePermission(name, definition, sharedInfo)) {
        return originCompiler.shared.compile(name, originCompiler, config, sharedInfo);
    }
};
//# sourceMappingURL=_resolveSharedDependency.js.map