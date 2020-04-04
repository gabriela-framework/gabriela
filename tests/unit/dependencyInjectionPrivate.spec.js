const mocha = require('mocha');
const chai = require('chai');

const it = mocha.it;
const describe = mocha.describe;
const expect = chai.expect;

const gabriela = require('../../src/gabriela/gabriela');

describe('Private dependencies', () => {
    it('should resolve all private dependencies in a single tree of a single module', (done) => {
        const userRepositoryInit = {
            name: 'userRepository',
            init: function() {
                function UserRepository() {}

                return new UserRepository();
            }
        };

        const friendsRepositoryInit = {
            name: 'friendsRepository',
            init: function() {
                function FriendsRepository() {}

                return new FriendsRepository();
            }
        };

        const contextDep = {
            name: 'contextDep',
            init: function() {
                return {};
            }
        };

        const userServiceInit = {
            name: 'userService',
            dependencies: [userRepositoryInit, friendsRepositoryInit, contextDep],
            init: function(userRepository, friendsRepository) {
                function UserService() {
                    this.userRepository = userRepository;
                    this.friendsRepository = friendsRepository;
                }

                return new UserService();
            }
        };

        let service;
        const userModule = {
            name: 'userModule',
            dependencies: [userServiceInit],
            moduleLogic: [function(userService, next) {
                service = userService;

                next();
            }]
        };

        const g = gabriela.asProcess({
            events: {
                onAppStarted() {
                    expect(service).to.be.a('object');
                    expect(service).to.have.property('userRepository');
                    expect(service).to.have.property('friendsRepository');

                    expect(service.userRepository).to.be.a('object');
                    expect(service.friendsRepository).to.be.a('object');

                    done();
                }
            }
        });

        g.addModule(userModule);

        g.startApp();
    });

    it('should resolve all private dependencies in multiple modules of a plugin', (done) => {
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
                    expect(serviceUser).to.be.a('object');
                    expect(friendsRepo).to.be.a('object');

                    expect(serviceUser).to.have.property('userRepository');
                    expect(serviceUser).to.have.property('friendsRepository');

                    expect(serviceUser.userRepository).to.be.a('object');
                    expect(serviceUser.friendsRepository).to.be.a('object');

                    expect(serviceUser.friendsRepository != friendsRepo).to.be.equal(true);

                    done();
                }
            }
        });

        g.addPlugin({
            name: 'plugin',
            modules: [userModule, friendsModule],
        });

        g.addModule(friendsModule);

        g.startApp();
    });

    it('should resolve private dependencies with different references', (done) => {
        let userRepositoryPrivate = null;
        let friendsRepositoryPrivate = null;
        let userRepositoryPublic = null;
        let friendsRepositoryPublic = null;

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
            name: 'privateUserService',
            dependencies: [userRepositoryInit, friendsRepositoryInit],
            scope: 'public',
            init: function(userRepository, friendsRepository) {
                userRepositoryPrivate = userRepository;
                friendsRepositoryPrivate = friendsRepository;

                function UserService() {}

                return new UserService();
            }
        };

        const userModule = {
            name: 'userModule',
            dependencies: [userRepositoryInit, friendsRepositoryInit, userServiceInit],
            moduleLogic: [function(userRepository, friendsRepository) {
                userRepositoryPublic = userRepository;
                friendsRepositoryPublic = friendsRepository;
            }],
        };

        const g = gabriela.asProcess({
            events: {
                onAppStarted() {
                    expect(userRepositoryPublic != userRepositoryPrivate).to.be.equal(true);
                    expect(friendsRepositoryPublic != friendsRepositoryPrivate).to.be.equal(true);

                    done();
                }
            }
        });

        g.addPlugin({
            name: 'twoModulesPlugin',
            modules: [userModule],
        });

        g.startApp();
    });

    it('should not execute a compiler pass of a private dependency but it should execute a compiler pass of a parent dependency', (done) => {
        let entersPrivateDepCompilerPass = false;
        let entersParentDepCompilerPass = false;
        let entersMiddleware = false;

        const privateDependencyInit = {
            name: 'privateDependency',
            init: function() {
                return () => {};
            },
            compilerPass: {
                init: function() {
                    entersPrivateDepCompilerPass = true;
                }
            }
        };

        const parentDependencyInit = {
            name: 'parentDependency',
            dependencies: [privateDependencyInit],
            compilerPass: {
                init: function() {
                    entersParentDepCompilerPass = true;
                }
            },
            init: function(privateDependency) {
                return () => {};
            }
        };

        const g = gabriela.asProcess({
            events: {
                onAppStarted() {
                    expect(entersParentDepCompilerPass).to.be.equal(true);
                    expect(entersMiddleware).to.be.equal(true);
                    expect(entersPrivateDepCompilerPass).to.be.equal(false);

                    done();
                }
            }
        });

        g.addModule({
            name: 'mdl',
            dependencies: [parentDependencyInit],
            moduleLogic: [function(parentDependency) {
                entersMiddleware = true;
            }]
        });

        g.startApp();
    });
});
