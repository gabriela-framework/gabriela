const {
    _hasCompletePermission,
    _hasModulePermission,
    _hasPluginPermission,
    _isInPlugin
} = require('./_permissions');

module.exports = function _resolveSharedDependency(
    name,
    originCompiler,
    sharedInfo,
    config,
) {
    const definition = originCompiler.shared.getOwnDefinition(name);

    if (_isInPlugin(sharedInfo) && _hasCompletePermission(name, definition, sharedInfo)) {
        return originCompiler.compile(name, originCompiler, config, sharedInfo);
    }

    // if it is shared with a module that is in a plugin with name mdl.plugin.name
    if (_isInPlugin(sharedInfo) && _hasPluginPermission(name, definition, sharedInfo)) {
        return originCompiler.shared.compile(name, originCompiler, config, sharedInfo);
    }

    // if it is shared with a module name
    if (_hasModulePermission(name, definition, sharedInfo)) {
        return originCompiler.shared.compile(name, originCompiler, config, sharedInfo);
    }
};
