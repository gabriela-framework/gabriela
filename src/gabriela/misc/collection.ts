const deepCopy = require('deepcopy');
const {hasKey, is} = require('../util/util');

/**
 * A generic collection of objects. Every entry in the collection has to have a 'name' property.
 * When retreiving an entry from the collection, a copy is always returned using deepcopy utility.
 * That ensures that the client code does not corrupt the for other parts of the framework using it.
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
            return deepCopy(entries);
        }
        
        function remove(name) {
            if (!has(name)) return false;
    
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