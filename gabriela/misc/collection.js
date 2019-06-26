const deepCopy = require('deepcopy');
const hasKey = require('../util/hasKey');

function factory() {
    this.create = function() {
        return new instance();
    };

    function instance() {
        const modules = {};

        function add(mdl) {
            if (has(mdl.name)) {
                throw new Error(`Invalid module. Module with name '${mdl.name}' already exists`);
            }

            modules[mdl.name] = deepCopy(mdl);
        }
    
        function has(name) {
            return hasKey(modules, name);
        }
    
        function get(name) {
            if (!has(name)) {
                return undefined;
            }

            return deepCopy(modules[name]);
        }

        function getAll() {
            // todo: replace this with reference safe handling because the collection cannot return
            // the not-copied references
            return modules;
        }
        
        function remove(name) {
            if (!has(name)) return false;
    
            // add code for non configurable properties or a try/catch if in strict mode
            delete modules[name];
    
            return true;
        }

        function replace(mdl) {
            if (!has(mdl.name)) return;

            modules[mdl.name] = mdl;
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