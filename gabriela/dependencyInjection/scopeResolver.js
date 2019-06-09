function factory() {
    function createCompiler() {

    }

}

function instance() {
    this.create = function() {
        const inst = new factory();
        inst.constructor.name = 'ScopeResolver';

        return inst;
    }
}

module.exports = new instance();