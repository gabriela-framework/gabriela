module.exports = function _createInitObject(init) {
    return {
        name: init.name,
        init: init.init,
        isAsync: init.isAsync,
        scope: init.scope,
        dependencies: init.dependencies,
        hasDependencies: function() {
            return !!(this.dependencies && this.dependencies.length > 0);
        },
        hasScope: function() {
            return (this.scope) ? true : false;
        },
        isShared: function() {
            return (this.shared) ? true : false;
        },
        shared: init.shared,
        sharedPlugins: function() {
            if (this.shared.plugins) return this.shared.plugins;
        },
        sharedModules: function() {
            if (this.shared.modules) return this.shared.modules;
        },
        isSharedWith(moduleOrPluginName) {
            if (!this.isShared()) return false;

            const sharedModules = this.sharedModules();
            const sharedPlugins = this.sharedPlugins();

            let isShared = false;
            if (sharedModules) {
                isShared = sharedModules.includes(moduleOrPluginName);
            }

            if (sharedModules && !isShared) {
                isShared = sharedPlugins.includes(moduleOrPluginName);
            }

            return isShared;
        }
    }
};