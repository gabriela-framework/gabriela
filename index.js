const requestPromise = require('request-promise');
const gabriela = require('./gabriela/gabriela');

const userFriendsRepositoryServiceInit = {
    name: 'userFriendsRepository',
    isAsync: true,
    init: function(next) {
        function FriendsRepository() {
            this.addFriend = null;
        }

        requestPromise.get('https://www.google.com').then(() => {
            next(() => {
                return new FriendsRepository();
            });
        });
    }
};

const userRepositoryServiceInit = {
    name: 'userRepository',
    isAsync: true,
    init: function(userFriendsRepository, next) {
        function UserRepository() {
            this.addUser = null;

            this.userFriendsRepository = userFriendsRepository;
        }

        requestPromise.get('https://www.google.com').then(() => {
            next(() => {
                return new UserRepository();
            });
        });
    }
};

const userServiceInit = {
    name: 'userService',
    scope: 'module',
    isAsync: true,
    init: function(userRepository, next) {
        function constructor() {
            this.createUser = null;
            this.removeUser = null;

            this.userRepository = userRepository;
        }

        requestPromise.get('https://www.google.com').then(() => {
            next(() => {
                return new constructor();
            });
        });
    }
};

let entersMiddleware = false;
const mdl = {
    name: 'name',
    dependencies: [userServiceInit, userRepositoryServiceInit, userFriendsRepositoryServiceInit],
    preLogicTransformers: [function(userService, done) {
        entersMiddleware = true;

        done();
    }],
};

const g = gabriela.asRunner();

g.addModule(mdl);

g.runModule('name');