const mocha = require('mocha');
const chai = require('chai');

const it = mocha.it;
const describe = mocha.describe;
const expect = chai.expect;

const gabriela = require('../../src/gabriela/gabriela');

describe('Shared scope dependency injection tests', () => {
    it('should create a shared dependency between multiple modules and one plugin', (done) => {
        const userServiceInit = {
            name: 'userService',
            shared: {
                modules: ['module1', 'module2'],
                plugins: ['plugin1']
            },
            init: function() {
                function UserService() {}

                return new UserService();
            }
        };

        const userRepositoryInit = {
            name: 'userRepository',
            scope: 'public',
            init: function() {
                function UserRepository() {}

                return new UserRepository();
            }
        };

        const scopeUserServiceInit = {
            name: 'userService',
            init: function() {
                function UserService() {}

                return new UserService();
            }
        };

        let services = [];
        let singleService;
        let userRepository1;
        let userRepository2;

        const module1 = {
            name: 'module1',
            dependencies: [userServiceInit, userRepositoryInit],
            moduleLogic: [function(userService, next) {
                services.push(userService);

                next();
            }],
        };

        const module2 = {
            name: 'module2',
            moduleLogic: [function(userService, next, userRepository) {
                services.push(userService);
                userRepository2 = userRepository;

                next();
            }],
        };

        const module3 = {
            name: 'module3',
            dependencies: [scopeUserServiceInit],
            moduleLogic: [function(userService, next, userRepository) {
                singleService = userService;
                userRepository1 = userRepository;

                next();
            }],
        };

        const plugin1 = {
            name: 'plugin',
            modules: [module1, module2, module3]
        };

        const g = gabriela.asProcess();

        g.addModule(module1);
        g.addModule(module2);
        g.addModule(module3);
        g.addPlugin(plugin1);

        g.runModule().then(() => {
            g.runPlugin('plugin').then(() => {
                expect(userRepository1 == userRepository2).to.be.equal(true);

                for (let i = 0; i < services.length; i++) {
                    expect(singleService != services[i]);

                    for (let a = 0; a < services.length; a++) {
                        expect(services[i] == services[a]);
                    }
                }

                services = [];
                singleService = null;
                userRepository1 = null;
                userRepository2 = null;

                g.runPlugin('plugin').then(() => {
                    g.runModule().then(() => {
                        expect(userRepository1 == userRepository2).to.be.equal(true);

                        for (let i = 0; i < services.length; i++) {
                            expect(singleService != services[i]);

                            for (let a = 0; a < services.length; a++) {
                                expect(services[i] == services[a]);
                            }
                        }

                        done();
                    });
                });
            });
        });
    });

    it('should create a shared dependency between multiple plugins only', () => {
        let pluginDependency;
        let sharedDependency;
        let sharedDependency2;

        const pluginDependencyInit = {
            name: 'pluginDep',
            scope: 'plugin',
            init: function() {
                function PluginDep() {}

                return new PluginDep();
            }
        };

        const sharedDependencyInit = {
            name: 'sharedDep',
            init: function() {
                function SharedDep() {}

                return new SharedDep();
            },
            shared: {
                plugins: ['plugin1', 'plugin2'],
            },
        };

        const singleModule = {
            name: 'module',
            dependencies: [pluginDependencyInit, sharedDependencyInit],
            moduleLogic: [function(sharedDep, next) {
                sharedDependency2 = sharedDep;

                next();
            }],
        };

        const testingModule = {
            name: 'testingModule',
            moduleLogic: [function(sharedDep, pluginDep, next) {
                pluginDependency = pluginDep;
                sharedDependency = sharedDep;

                next();
            }],
        };

        const plugin1 = {
            name: 'plugin1',
            modules: [singleModule],
        };

        const plugin2 = {
            name: 'plugin2',
            modules: [singleModule, testingModule],
        };

        const g = gabriela.asProcess();

        g.addPlugin(plugin1);
        g.addPlugin(plugin2);

        g.runPlugin('plugin1').then(() => {
            g.runPlugin('plugin2').then(() => {
                expect(pluginDependency).to.be.a('object');
                expect(sharedDependency).to.be.a('object');
                expect(sharedDependency2 == sharedDependency).to.be.equal(true);
            });
        });
    });
});
