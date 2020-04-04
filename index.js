const gabriela = require('./src/index');
const requestPromise = require('request-promise');
const path = require('path');

const userRepositoryInit = {
    name: 'userRepository',
    init: function() {
        function UserRepository() {}

        return new UserRepository();
    }
};

const friendsRepositoryInit = {
    name: 'friendsRepository',
    scope: 'public',
    init: function() {
        function FriendsRepository() {}

        return new FriendsRepository();
    }
};

const userServiceInit = {
    name: 'userService',
    dependencies: [userRepositoryInit, friendsRepositoryInit],
    shared: {
        modules: ['friendsModule'],
        plugins: ['plugin'],
    },
    init: function(userRepository, friendsRepository) {
        function UserService() {
            this.userRepository = userRepository;
            this.friendsRepository = friendsRepository;
        }

        return new UserService();
    }
};

let serviceUser;
let friendsRepo;
const friendsModule = {
    name: 'friendsModule',
    dependencies: [userServiceInit, friendsRepositoryInit],
    moduleLogic: [function(next, userService, friendsRepository) {
        serviceUser = userService;
        friendsRepo = friendsRepository;

        next();
    }],
};

const userModule = {
    name: 'userModule',
    dependencies: [userServiceInit],
    moduleLogic: [function(userService, next) {
        serviceUser = userService;

        next();
    }],
};

const g = gabriela.asProcess({
    events: {
        onAppStarted() {
        },
        catchError(e) {
            console.error(e);
        }
    }
});

g.addPlugin({
    name: 'plugin',
    modules: [userModule, friendsModule],
});

g.addModule(friendsModule);

g.startApp();
