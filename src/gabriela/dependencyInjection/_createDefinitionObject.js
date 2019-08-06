const Validator = require('../misc/validator');
const {hasKey} = require('../util/util');

/**
 * The definition object model with which gabriela is working internally.
 *
 * It is derived from the user supplied DI definition
 * @param init
 * @returns {{init: *, shared: (*|userServiceInit.shared|{plugins, modules}|userServiceInit.shared|userServiceInit.shared|{plugins}), hasCompilerPass(): *, compilerPass: *, isAsync: (*|boolean|number), isSharedWith(*=): (boolean|*|*), sharedPlugins(): (*|undefined), addPrivateDependency(*=): void, hasScope(): boolean, dependencies: Array, scope: *, name: *, sharedModules(): (*|undefined), hasDependencies(): *, isShared(): boolean}|*|boolean|boolean|*}
 */
module.exports = function _createInitObject(init) {
    return {
        name: init.name,
        init: init.init,
        isAsync: init.isAsync,
        scope: init.scope,
        dependencies: (!hasKey(init, 'dependencies')) ? [] : init.dependencies,
        addPrivateDependency(definition) {
            Validator.validateDefinitionObject(definition);

            this.dependencies.push(definition);
        },
        hasCompilerPass() {
            return hasKey(init, 'compilerPass');
        },
        compilerPass: init.compilerPass,
        hasDependencies() {
            return !!(this.dependencies && this.dependencies.length > 0);
        },
        hasScope() {
            return (this.scope) ? true : false;
        },
        isShared() {
            return (this.shared) ? true : false;
        },
        shared: init.shared,
        sharedPlugins() {
            if (this.shared.plugins) return this.shared.plugins;
        },
        sharedModules() {
            if (this.shared.modules) return this.shared.modules;
        },
        isSharedWith(moduleOrPluginName) {
            if (!this.isShared()) return false;

            const sharedModules = (Array.isArray(this.sharedModules())) ? this.sharedModules() : [];
            const sharedPlugins = (Array.isArray(this.sharedPlugins())) ? this.sharedPlugins() : [];

            let isShared = false;

            isShared = sharedModules.includes(moduleOrPluginName);

            if (isShared) return isShared;

            return sharedPlugins.includes(moduleOrPluginName);
        }
    };
};