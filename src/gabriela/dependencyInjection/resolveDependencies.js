module.exports = function resolveDependencies(
    compiler,
    sharedCompiler,
    name,
    config,
    moduleName,
    plugin
    ) {
    if (compiler.has(name)) {
        return compiler.compile(name, compiler, config);
    } else if (sharedCompiler.has(name)) {
        const definition = sharedCompiler.getOwnDefinition(name);

        // if it is shared with a module name
        if (definition.isSharedWith(moduleName)) {
            return sharedCompiler.compile(name, sharedCompiler, config);
        }

        // if it is shared with a module that is in a plugin with name mdl.plugin.name
        if (plugin && definition.isSharedWith(plugin.name)) {
            return sharedCompiler.compile(name, sharedCompiler, config);
        }
    }
};