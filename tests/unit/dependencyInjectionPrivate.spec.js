const mocha = require('mocha');
const chai = require('chai');

const it = mocha.it;
const describe = mocha.describe;
const expect = chai.expect;

const gabriela = require('../../gabriela/gabriela');

describe('Private dependencies', () => {
    it('should resolve all private dependencies in a single tree of a single module', () => {
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

        const userServiceInit = {
            name: 'userService',
            dependencies: [userRepositoryInit, friendsRepositoryInit],
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

        const g = gabriela.asRunner();

        g.addModule(userModule);

        g.runModule().then(() => {
            expect(service).to.be.a('object');
            expect(service).to.have.property('userRepository');
            expect(service).to.have.property('friendsRepository');

            expect(service.userRepository).to.be.a('object');
            expect(service.friendsRepository).to.be.a('object');
        });
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

        const g = gabriela.asRunner();

        g.addPlugin({
            name: 'plugin',
            modules: [userModule, friendsModule],
        });

        g.runPlugin('plugin').then(() => {
            expect(serviceUser).to.be.a('object');
            expect(friendsRepo).to.be.a('object');

            expect(serviceUser).to.have.property('userRepository');
            expect(serviceUser).to.have.property('friendsRepository');

            expect(serviceUser.userRepository).to.be.a('object');
            expect(serviceUser.friendsRepository).to.be.a('object');

            expect(serviceUser.friendsRepository != friendsRepo).to.be.equal(true);

            g.runPlugin('plugin').then(() => {
                expect(serviceUser).to.be.a('object');
                expect(friendsRepo).to.be.a('object');

                expect(serviceUser).to.have.property('userRepository');
                expect(serviceUser).to.have.property('friendsRepository');

                expect(serviceUser.userRepository).to.be.a('object');
                expect(serviceUser.friendsRepository).to.be.a('object');

                expect(serviceUser.friendsRepository != friendsRepo).to.be.equal(true);

                done();
            });
        });

        g.runPlugin('plugin').then(() => {
            expect(serviceUser).to.be.a('object');
            expect(friendsRepo).to.be.a('object');

            expect(serviceUser).to.have.property('userRepository');
            expect(serviceUser).to.have.property('friendsRepository');

            expect(serviceUser.userRepository).to.be.a('object');
            expect(serviceUser.friendsRepository).to.be.a('object');

            expect(serviceUser.friendsRepository != friendsRepo).to.be.equal(true);
        });

        g.addModule(friendsModule);
    });
});