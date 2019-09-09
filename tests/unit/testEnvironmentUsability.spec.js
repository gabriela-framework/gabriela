const mocha = require('mocha');
const chai = require('chai');
const requestPromise = require('request-promise');

const it = mocha.it;
const describe = mocha.describe;
const expect = chai.expect;

const gabriela = require('../../src/gabriela/gabriela');
const config = require('../config/config');

describe('Test environment usability tests', function() {
    it('should instantiate a basic dependency tree', () => {
        const testApp = gabriela.asTest(config);

        const userRepository = {
            name: 'userRepository',
            init: function() {
                function UserRepository() {

                }

                return new UserRepository();
            }
        };

        const userService = {
            name: 'userService',
            init: function(userRepository) {
                function UserService() {
                    this.userRepository = userRepository;
                    this.createUser = function() {};
                    this.removeUser = function() {};
                }

                return new UserService();
            }
        };

        const resolvedUserService = testApp
            .loadDependency([userService, userRepository])
            .resolve('userService');

        expect(resolvedUserService).to.be.a('object');
        expect(resolvedUserService.createUser).to.be.a('function');
        expect(resolvedUserService.removeUser).to.be.a('function');
        expect(resolvedUserService.userRepository).to.be.a('object');

        const resolvedUserRepository = testApp
            .loadDependency([userService, userRepository])
            .resolve('userRepository');

        expect(resolvedUserRepository).to.be.a('object');
    });

    it('should instantiate dependencies with various plugin and module scopes', () => {
        const testApp = gabriela.asTest(config);

        const userRepository = {
            name: 'userRepository',
            scope: 'module',
            init: function() {
                function UserRepository() {

                }

                return new UserRepository();
            }
        };

        const userService = {
            name: 'userService',
            scope: 'plugin',
            init: function(userRepository) {
                function UserService() {
                    this.userRepository = userRepository;
                    this.createUser = function() {};
                    this.removeUser = function() {};
                }

                return new UserService();
            }
        };

        const resolvedUserService = testApp
            .loadDependency([userService, userRepository])
            .resolve('userService');

        expect(resolvedUserService).to.be.a('object');
        expect(resolvedUserService.createUser).to.be.a('function');
        expect(resolvedUserService.removeUser).to.be.a('function');
        expect(resolvedUserService.userRepository).to.be.a('object');

        const resolvedUserRepository = testApp
            .loadDependency([userService, userRepository])
            .resolve('userRepository');

        expect(resolvedUserRepository).to.be.a('object');
    });

    it('should resolve a service that has async flow methods as dependencies', () => {
        const testApp = gabriela.asTest(config);

        const userService = {
            name: 'userService',
            scope: 'plugin',
            isAsync: true,
            init: function(next) {
                function UserService() {
                    this.createUser = function() {};
                    this.removeUser = function() {};
                }

                requestPromise.get('http://goiwouldlike.com', () => {
                    next(() => new UserService());
                });
            }
        };

        const resolvedUserService = testApp
            .loadDependency([userService])
            .resolve('userService');

        expect(resolvedUserService).to.be.a('object');
        expect(resolvedUserService.createUser).to.be.a('function');
        expect(resolvedUserService.removeUser).to.be.a('function');
    });
});