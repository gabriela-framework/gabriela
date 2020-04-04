module.exports = function resolveDependencies(
    compiler,
    sharedCompiler,
    name,
    config,
    moduleName,
    plugin
    ) {
    const sharedInfo = {
        moduleName: moduleName,
        pluginName: null,
    };

    if (plugin) {
        sharedInfo.pluginName = plugin.name;
    }

    if (compiler.has(name)) {
        return compiler.compile(name, compiler, config, sharedInfo);
    }
};
