module.exports = function resolveDependencies(compiler, name, config, moduleName, plugin) {
    var sharedInfo = {
        moduleName: moduleName,
        pluginName: null
    };
    if (plugin) {
        sharedInfo.pluginName = plugin.name;
    }
    if (compiler.has(name)) {
        return compiler.compile(name, compiler, config, sharedInfo);
    }
};
//# sourceMappingURL=resolveDependencies.js.map