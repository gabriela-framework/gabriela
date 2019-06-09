function factory() {
    this.create = function() {
        return new instance();
    };

    function instance() {
        const modules = {};

        function addModule(mdl) {
            if (modules.hasOwnProperty(mdl.name)) {
                throw new Error(`Invalid module. Module with name '${mdl.name}' already exists`);
            }

            modules[mdl.name] = Object.assign({}, mdl);
        }
    
        function hasModule(name) {
            return modules.hasOwnProperty(name);
        }
    
        function getModule(name) {
            if (!hasModule(name)) {
                return undefined;
            }

            return Object.assign({}, modules[name]);
        }

        function getModules() {
            return modules;
        }
        
        function removeModule(name) {
            if (!hasModule(name)) return false;
    
            // add code for non configurable properties or a try/catch if in strict mode
            delete modules[name];
    
            return true;
        }

        this.addModule = addModule;
        this.hasModule = hasModule;
        this.getModule = getModule;
        this.getModules = getModules;
        this.removeModule = removeModule;
    }
}

module.exports = (function() {
    const inst = new factory();
    inst.constructor.name = 'ModuleCollection';

    return inst;
}());