const gabriela = require('./src/index');

const userServiceInit = {
    name: 'userService',
    shared: {
        modules: ['module1', 'module2'],
        plugins: ['plugin1']
    },
    init: function() {
        function UserService() {}

        return new UserService();
    }
};

const contextDep = {
    name: 'contextDep',
    shared: {
        modules: ['module1'],
    },
    init: function() {
        return {};
    }
};

const userRepositoryInit = {
    name: 'userRepository',
    scope: 'public',
    init: function() {
        function UserRepository() {}

        return new UserRepository();
    }
};

const scopeUserServiceInit = {
    name: 'userService',
    init: function() {
        function UserService() {}

        return new UserService();
    }
};

let services = [];
let singleService;
let userRepository1;
let userRepository2;

const module1 = {
    name: 'module1',
    dependencies: [userServiceInit, userRepositoryInit, contextDep],
    moduleLogic: [function(userService, next) {
        services.push(userService);

        const contextDep = this.compiler.get('contextDep');

        console.log(contextDep);

        next();
    }],
};

const module2 = {
    name: 'module2',
    moduleLogic: [function(userService, next, userRepository) {
        services.push(userService);
        userRepository2 = userRepository;

        next();
    }],
};

const module3 = {
    name: 'module3',
    dependencies: [scopeUserServiceInit],
    moduleLogic: [function(userService, next, userRepository) {
        singleService = userService;
        userRepository1 = userRepository;

        next();
    }],
};

const plugin1 = {
    name: 'plugin',
    modules: [module1, module2, module3]
};

const g = gabriela.asProcess({config: {framework: {}}});

g.addModule(module1);
g.addModule(module2);
g.addModule(module3);
g.addPlugin(plugin1);

g.startApp();