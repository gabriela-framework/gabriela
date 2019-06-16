const mocha = require('mocha');
const chai = require('chai');
const assert = require('assert');

const it = mocha.it;
const describe = mocha.describe;
const expect = chai.expect;

const gabriela = require('../../gabriela/gabriela');

describe('Plugin creation tests', () => {
    it('should have a plugin interface', () => {
        const p = gabriela.asRunner().plugin;

        expect(p).to.have.property('addPlugin');
        expect(p).to.have.property('hasPlugin');
        expect(p).to.have.property('getPlugin');
        expect(p).to.have.property('getPlugins');
        expect(p).to.have.property('removePlugin');
    });

    it('should evaluate plugin interface', () => {
        const p = gabriela.asRunner().plugin;

        p.addPlugin({
            name: 'plugin1',
        });

        expect(p.hasPlugin('plugin1')).to.be.equal(true);
        expect(p.getPlugin('notDefined')).to.be.equal(undefined);
        expect(p.getPlugin('plugin1')).to.be.a('object');

        const plugin1 = p.getPlugin('plugin1');

        expect(plugin1).to.have.property('name');
        expect(plugin1.name).to.be.equal('plugin1');

        const allPlugins = p.getPlugins();

        expect(allPlugins).to.have.property('plugin1');
        expect(allPlugins.plugin1).to.be.a('object');

        p.removePlugin('plugin1');

        expect(p.hasPlugin('plugin1')).to.be.equal(false);

        const emptyPlugins = p.getPlugins();

        expect(emptyPlugins).to.not.have.property('plugin1');
    });

    it('should run a plugin with a single module', (done) => {
        let preLogicTransformerExecuted = false;
        let validatorExecuted = false;
        let moduleLogicExecuted = false;
        let postLogicTransformerExecuted = false;

        const userModule = {
            name: 'userModule',
            preLogicTransformers: [function(next) {
                preLogicTransformerExecuted = true;

                next();
            }],
            validators: [{
                name: 'validatorName',
                middleware: function(next) {
                    validatorExecuted = true;
                    next();
                }
            }],
            moduleLogic: [{
                name: 'moduleLogic',
                middleware: function(next) {
                    moduleLogicExecuted = true;

                    next();
                }
            }, function(next) {
                moduleLogicExecuted = false;

                next();
            }],
            postLogicTransformers: [function(next) {
                postLogicTransformerExecuted = true;

                next();
            }],
        };

        const p = gabriela.asRunner().plugin;

        p.addPlugin({
            name: 'userManagement',
            modules: [userModule]
        });

        p.run('userManagement').then(() => {
            expect(preLogicTransformerExecuted).to.be.equal(true);
            expect(validatorExecuted).to.be.equal(true);
            expect(moduleLogicExecuted).to.be.equal(false);
            expect(postLogicTransformerExecuted).to.be.equal(true);

            done();
        }).catch((err) => {
            console.error(err.stack);
            assert.fail(`This test failed with message: ${err.message}`);
        });
    });

    it('should create all types of visibility dependencies and resolve them within modules', (done) => {
        const friendsRepositoryInit = {
            name: 'friendsRepository',
            visibility: 'module',
            init: function() {
                function FriendsRepository() {
                    this.addFriend = null;
                }

                return new FriendsRepository();
            }
        };

        const userRepositoryInit = {
            name: 'userRepository',
            visibility: 'module',
            init: function(friendsRepository) {
                function UserRepository() {
                    this.addUser = null;

                    this.friendsRepository = friendsRepository;
                }

                return new UserRepository();
            }
        };

        const userServiceInit = {
            name: 'userService',
            visibility: 'public',
            init: function(userRepository) {
                function UserService() {
                    this.userRepository = userRepository;
                }

                return new UserService();
            }
        };

        const userModule = {
            name: 'userModule',
            moduleLogic: [function(userService, next) {
                next();
            }],
            dependencies: [userServiceInit, userRepositoryInit, friendsRepositoryInit],
        };

        const searchModule = {
            name: 'searchModule',
            moduleLogic: [function(userRepository, next) {
                next();
            }],
            dependencies: [userServiceInit]
        };

        const p = gabriela.asRunner().plugin;

        done();
    });
});
