const gabriela = require('./src/index');

/**
 * This is the UserService definition. The actual UserService is the return value
 * of the definitions 'init' function. We inject the UserRepository into our
 * UserService and instantiate the UserService with UserRepository as its dependency.
 *
 * The name property is what we use to inject as an argument into another service
 * or a middleware block. In the case of UserService, a userRepository variable is injected
 * since this is the 'name' property in our UserRepository definition. In the same way, we inject
 * userService as an argument whereever we need it.
 */
const userServiceDefinition = {
    name: 'userService',
    init: function(userRepository) {
        function UserService(userRepository) {
            this.registerUser = function(userModel) {
                userRepository.saveUser(userModel);
            }
        }

        return new UserService(userRepository);
    }
};

const userRepositoryDefinition = {
    name: 'userRepository',
    init: function() {
        function UserRepository() {
            this.saveUser = function(userModel) {
                console.log(`Model ${JSON.stringify(userModel)} saved`);
            }
        }

        return new UserRepository();
    }
}

const registrationModule = {
    name: 'registrationModule',

    // this is where we bind these dependencies to our module. Both definitions are required
    // for this to work. The UserService will be injected in the moduleLogic middleware block
    // with UserRepository as its dependency.
    dependencies: [userServiceDefinition, userRepositoryDefinition],
    http: {
        route: {
            name: 'registration',
            path: '/register',
            method: 'POST',
        },
    },
    // we use the 'name' property of the UserService definition to
    // inject the actual UserService into this middleware block
    moduleLogic: [function(userService) {
        userService.saveUser({
            name: 'Rolling',
            lastName: 'Stone',
        })
    }],
};

const app = gabriela.asServer({
    config: {
        framework: {},
    }
});

app.addModule(registrationModule);

app.startApp();