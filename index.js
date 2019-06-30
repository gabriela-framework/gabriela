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
}

const g = gabriela.asServer({
    server: {
        port: 4000,
    },
});

g.addModule(mdl);

g.startApp({
    onAppStarted: function(userService) {
        console.log(userService);
        this.server.close();
    }
});