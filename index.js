const gabriela = require('./gabriela/gabriela');

const userServiceDefinition = {
    name: 'userService',
    scope: 'public',
    init: function() {
        function UserService() {}

        return new UserService();
    }
};

const mdl = {
    name: 'module',
    dependencies: [userServiceDefinition],
    moduleLogic: [function(userService) {
        console.log('ulazak');
    }],
};

const g = gabriela.asProcess();

g.addPlugin({
    name: 'plugin',
    modules: [mdl],
});

g.startApp({
    onAppStarted: function(userService) {
        console.log('Koji kurac');
    }
});