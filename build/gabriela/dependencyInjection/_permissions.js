function _hasCompletePermission(name, definition, sharedInfo) {
    var moduleName = sharedInfo.moduleName;
    var pluginName = sharedInfo.pluginName;
    var sharedModules = definition.sharedModules();
    var sharedPlugins = definition.sharedPlugins();
    return pluginName &&
        sharedModules &&
        sharedPlugins &&
        sharedPlugins.includes(pluginName) &&
        sharedModules.includes(moduleName);
}
function _hasPluginPermission(name, definition, sharedInfo) {
    var pluginName = sharedInfo.pluginName;
    var sharedPlugins = definition.sharedPlugins();
    return pluginName && sharedPlugins && sharedPlugins.includes(pluginName);
}
function _hasModulePermission(name, definition, sharedInfo) {
    var moduleName = sharedInfo.moduleName;
    var sharedModules = definition.sharedModules();
    return sharedModules && sharedModules.includes(moduleName);
}
function _isInPlugin(sharedInfo) {
    return !!(sharedInfo.pluginName);
}
module.exports = {
    _hasCompletePermission: _hasCompletePermission,
    _hasModulePermission: _hasModulePermission,
    _hasPluginPermission: _hasPluginPermission,
    _isInPlugin: _isInPlugin
};
//# sourceMappingURL=_permissions.js.map