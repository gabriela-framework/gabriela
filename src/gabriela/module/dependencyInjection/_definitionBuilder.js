function instance() {
    const definition = {};

    function addName(name) {
        definition.name = name;

        return this;
    }

    function addScope(scope) {
        definition.scope = scope;

        return this;
    }

    function addShared(shared) {
        definition.shared = shared;

        return this;
    }

    function addCompilerPass(compilerPass) {
        definition.compilerPass = compilerPass;

        return this;
    }

    function addInit(init) {
        definition.init = init;
        return this;
    }

    function build() {
        return definition;
    }

    this.addName = addName;
    this.addScope = addScope;
    this.addShared = addShared;
    this.addCompilerPass = addCompilerPass;
    this.addInit = addInit;
    this.build = build;
}

function factory() {
    this.create = function() {
        return new instance();
    }
}

module.exports = new factory();