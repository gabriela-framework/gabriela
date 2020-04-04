module.exports = function _resolveSharedDependency(
    name,
    originCompiler,
    sharedInfo,
    config,
) {
    const definition = originCompiler.shared.getOwnDefinition(name);
    const moduleName = sharedInfo.moduleName;
    const pluginName = sharedInfo.pluginName;

    // if it is shared with a module name
    if (definition.isSharedWith(moduleName)) {
        return originCompiler.shared.compile(name, originCompiler, config, sharedInfo);
    }

    // if it is shared with a module that is in a plugin with name mdl.plugin.name
    if (pluginName && definition.isSharedWith(pluginName)) {
        return originCompiler.shared.compile(name, originCompiler, config, sharedInfo);
    }
};
