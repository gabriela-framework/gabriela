/**
 * The definition object model with which gabriela is working internally.
 *
 * It is derived from the user supplied DI definition
 * @param init
 * @returns {{init: *, shared: (*|userServiceInit.shared|{plugins, modules}|userServiceInit.shared|userServiceInit.shared|{plugins}), hasCompilerPass(): *, compilerPass: *, isAsync: (*|boolean|number), isSharedWith(*=): (boolean|*|*), sharedPlugins(): (*|undefined), addPrivateDependency(*=): void, hasScope(): boolean, dependencies: Array, scope: *, name: *, sharedModules(): (*|undefined), hasDependencies(): *, isShared(): boolean}|*|boolean|boolean|*}
 */
module.exports = function _createDefinitionModel(init) {
    return {
        name: init.name,
        init: init.init,
        isAsync: init.isAsync,
        scope: init.scope,
        cache: (init.cache !== false),
        compilerPass: init.compilerPass,
        shared: init.shared,
        hasCompilerPass() {
            return !!(this.compilerPass);
        },
        hasScope() {
            return !!(this.scope);
        },
        isShared() {
            return !!(this.shared);
        },
        sharedPlugins() {
            if (!this.isShared()) return [];

            if (this.shared.plugins) return this.shared.plugins;
        },
        sharedModules() {
            if (!this.isShared()) return [];

            if (this.shared.modules) return this.shared.modules;
        },
    };
};
