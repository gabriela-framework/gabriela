var Names = (function () {
    function Names() {
        this.names = [];
    }
    Names.create = function () {
        return new Names();
    };
    Names.prototype.add = function (name) {
        this.names.push(name);
    };
    Names.prototype.has = function (name) {
        return this.names.includes(name);
    };
    Names.prototype.addAndReplacePluginNames = function (plugin) {
        this.add(plugin.name);
        if (!plugin.modules)
            return true;
        var modules = plugin.modules;
        for (var _i = 0, modules_1 = modules; _i < modules_1.length; _i++) {
            var mdl = modules_1[_i];
            var name_1 = plugin.name + "." + mdl.name;
            if (this.has(name_1)) {
                return name_1;
            }
            mdl.name = name_1;
            this.add(name_1);
        }
        return true;
    };
    return Names;
}());
module.exports = Names;
//# sourceMappingURL=nameSingleton.js.map