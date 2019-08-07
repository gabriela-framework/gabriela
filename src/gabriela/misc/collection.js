const deepCopy = require('deepcopy');
const {hasKey, is} = require('../util/util');

/**
 * A generic collection of objects. Every entry in the collection has to have a 'name' property.
 */
function factory() {
    this.create = function() {
        return new instance();
    };

    function instance() {
        const entries = {};

        function add(entry) {
            if (!entry.name || !is('string', entry.name)) throw new Error(`Invalid collection entry. Every collection entry must have a name property`);

            if (has(entry.name)) {
                throw new Error(`Invalid module. Module with name '${entry.name}' already exists`);
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
            // todo: replace this with reference safe handling because the collection cannot return
            // the not-copied references
            return entries;
        }
        
        function remove(name) {
            if (!has(name)) return false;
    
            // add code for non configurable properties or a try/catch if in strict mode
            delete entries[name];
    
            return true;
        }

        function replace(entry) {
            if (!has(entry.name)) return;

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

module.exports = (function() {
    return new factory();
}());