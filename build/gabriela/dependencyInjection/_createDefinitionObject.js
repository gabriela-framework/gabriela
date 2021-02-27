module.exports = function _createDefinitionModel(init) {
    return {
        name: init.name,
        init: init.init,
        isAsync: init.isAsync,
        scope: init.scope,
        cache: (init.cache !== false),
        compilerPass: init.compilerPass,
        shared: init.shared,
        hasCompilerPass: function () {
            return !!(this.compilerPass);
        },
        hasScope: function () {
            return !!(this.scope);
        },
        isShared: function () {
            return !!(this.shared);
        },
        sharedPlugins: function () {
            if (!this.isShared())
                return [];
            if (this.shared.plugins)
                return this.shared.plugins;
        },
        sharedModules: function () {
            if (!this.isShared())
                return [];
            if (this.shared.modules)
                return this.shared.modules;
        }
    };
};
//# sourceMappingURL=_createDefinitionObject.js.map