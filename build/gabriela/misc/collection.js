var deepCopy = require('deepcopy');
var _a = require('../util/util'), hasKey = _a.hasKey, is = _a.is;
function factory() {
    this.create = function () {
        return new instance();
    };
    function instance() {
        var entries = {};
        function add(entry) {
            if (!entry.name || !is('string', entry.name))
                throw new Error("Invalid collection entry. Every collection entry must have a name property");
            if (has(entry.name)) {
                throw new Error("Invalid module. Module with name '" + entry.name + "' already exists");
            }
            entries[entry.name] = deepCopy(entry);
        }
        function has(name) {
            return hasKey(entries, name);
        }
        function get(name) {
            if (!has(name)) {
                return undefined;
            }
            return deepCopy(entries[name]);
        }
        function getAll() {
            return deepCopy(entries);
        }
        function remove(name) {
            if (!has(name))
                return false;
            delete entries[name];
            return true;
        }
        function replace(entry) {
            if (!has(entry.name))
                return;
            entries[entry.name] = entry;
        }
        this.add = add;
        this.has = has;
        this.get = get;
        this.replace = replace;
        this.getAll = getAll;
        this.remove = remove;
    }
}
module.exports = (function () {
    return new factory();
}());
//# sourceMappingURL=collection.js.map