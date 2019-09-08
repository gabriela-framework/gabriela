const mocha = require('mocha');
const chai = require('chai');

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
});