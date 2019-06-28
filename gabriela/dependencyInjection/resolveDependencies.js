module.exports = function _resolveDependencies(mdl, name, config) {
    if (mdl.compiler.has(name)) {
        return mdl.compiler.compile(name, mdl.compiler, config);
    } else if (mdl.sharedCompiler.has(name)) {
        const definition = mdl.sharedCompiler.getOwnDefinition(name);

        // if it is shared with a module name
        if (definition.isSharedWith(mdl.name)) {
            return mdl.sharedCompiler.compile(name, mdl.sharedCompiler, config);
        }

        // if it is shared with a module that is in a plugin with name mdl.plugin.name
        if (mdl.isInPlugin() && definition.isSharedWith(mdl.plugin.name)) {
            return mdl.sharedCompiler.compile(name, mdl.sharedCompiler, config);
        }
    }
};