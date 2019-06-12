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

            modules[mdl.name] = Object.assign({}, mdl);
        }
    
        function has(name) {
            return modules.hasOwnProperty(name);
        }
    
        function get(name) {
            if (!has(name)) {
                return undefined;
            }

            return Object.assign({}, modules[name]);
        }

        function getAll() {
            return modules;
        }
        
        function remove(name) {
            if (!has(name)) return false;
    
            // add code for non configurable properties or a try/catch if in strict mode
            delete modules[name];
    
            return true;
        }

        this.add = add;
        this.has = has;
        this.get = get;
        this.getAll = getAll;
        this.remove = remove;
    }
}

module.exports = (function() {
    const inst = new factory();
    inst.constructor.name = 'Collection';

    return inst;
}());