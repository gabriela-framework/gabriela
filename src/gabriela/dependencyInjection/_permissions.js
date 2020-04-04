function _hasCompletePermission(name, definition, sharedInfo) {
    const moduleName = sharedInfo.moduleName;
    const pluginName = sharedInfo.pluginName;

    const sharedModules = definition.sharedModules();
    const sharedPlugins = definition.sharedPlugins();

    return pluginName &&
        sharedModules &&
        sharedPlugins &&
        sharedPlugins.includes(pluginName) &&
        sharedModules.includes(moduleName);
}

function _hasPluginPermission(name, definition, sharedInfo) {
    const pluginName = sharedInfo.pluginName;
    const sharedPlugins = definition.sharedPlugins();

    return pluginName && sharedPlugins && sharedPlugins.includes(pluginName)
}

function _hasModulePermission(name, definition, sharedInfo) {
    const moduleName = sharedInfo.moduleName;
    const sharedModules = definition.sharedModules();

    return sharedModules && sharedModules.includes(moduleName);
}

function _isInPlugin(sharedInfo) {
    return !!(sharedInfo.pluginName);
}

module.exports = {
    _hasCompletePermission,
    _hasModulePermission,
    _hasPluginPermission,
    _isInPlugin,
};
