const mocha = require('mocha');
const chai = require('chai');

const it = mocha.it;
const describe = mocha.describe;
const expect = chai.expect;

const gabriela = require('../../src/gabriela/gabriela');
const config = require('../config/config');

describe('Scope dependency injection tests', () => {
    it(`should resolve the default scope to 'module' and create two different instances`, (done) => {
        let userService1;
        let userService2;
        let userService3;
        let contextDep1;
        let contextDep2;

        const userServiceInit = {
            name: 'userService',
            init: function() {
                function UserService() {}

                return new UserService();
            }
        };

        const contextDep = {
            name: 'contextDep',
            init: function() {
                return {};
            }
        };

        const module1 = {
            name: 'module1',
            dependencies: [userServiceInit, contextDep],
            moduleLogic: [function(userService, next) {
                userService1 = userService;

                contextDep1 = this.compiler.get('contextDep');

                expect(contextDep1).to.be.a('object');
                expect(contextDep1._$metadata).to.be.a('object');

                next();
            }],
        };

        const module2 = {
            name: 'module2',
            dependencies: [userServiceInit, contextDep],
            moduleLogic: [function(userService, next) {
                userService2 = userService;

                contextDep2 = this.compiler.get('contextDep');

                expect(contextDep2).to.be.a('object');
                expect(contextDep2._$metadata).to.be.a('object');

                next();
            }],
        };

        const module3 = {
            name: 'module3',
            dependencies: [userServiceInit],
            moduleLogic: [function(userService, next) {
                userService3 = userService;

                next();
            }],
        };

        const g = gabriela.asProcess(config);;

        g.addModule(module1);
        g.addModule(module2);
        g.addModule(module3);

        g.runModule().then(() => {
            expect(userService1).to.be.a('object');
            expect(userService2).to.be.a('object');
            expect(contextDep1).to.be.a('object');
            expect(contextDep2).to.be.a('object');

            expect(contextDep1 != contextDep2).to.be.equal(true);

            expect(userService1 != userService2).to.be.equal(true);
            expect(userService1 != userService3).to.be.equal(true);
            expect(userService2 != userService3).to.be.equal(true);

            done();
        });
    });

    it(`should resolve a dependency with 'plugin' scope and give a single instance within all modules of a plugin`, (done) => {
        let contextDep1;
        let contextDep2;

        const userServiceInit = {
            name: 'difInstances',
            scope: 'plugin',
            init: function() {
                function UserService() {}

                return new UserService();
            }
        };

        const contextDep = {
            name: 'contextDep',
            scope: 'plugin',
            init: function() {
                return {};
            }
        };

        let services = [];
        const module1 = {
            name: 'module1',
            dependencies: [userServiceInit, contextDep],
            moduleLogic: [function(difInstances, next) {
                services.push(difInstances);

                contextDep1 = this.compiler.get('contextDep');

                next();
            }],
        };

        const module2 = {
            name: 'module2',
            moduleLogic: [function(difInstances, next) {
                services.push(difInstances);

                contextDep2 = this.compiler.get('contextDep');

                next();
            }],
        };

        const plugin1 = {
            name: 'plugin1',
            modules: [module1, module2],
        };

        const plugin2 = {
            name: 'plugin2',
            modules: [module1, module2],
        };

        const g = gabriela.asProcess(config);

        g.addPlugin(plugin1);
        g.addPlugin(plugin2);

        g.runPlugin('plugin1').then(() => {
            expect(services[0]).to.be.a('object');
            expect(services[0]).to.be.a('object');

            expect(contextDep1).to.be.a('object');
            expect(contextDep2).to.be.a('object');

            expect(contextDep1 == contextDep2).to.be.equal(true);

            expect(services[0] == services[1]).to.be.equal(true);
            expect(services[0]).to.be.equal(services[1]);

            g.runPlugin('plugin2').then(() => {
                expect(services[2]).to.be.a('object');
                expect(services[3]).to.be.a('object');

                expect(services[2] == services[3]).to.be.equal(true);
                expect(services[0] != services[2]).to.be.equal(true);
                expect(services[0] != services[3]).to.be.equal(true);

                done();
            });
        });
    });

    it('should resolve a public scope service and give the same instance globally within the framework', (done) => {
        const publicDependencyInit = {
            name: 'publicDep',
            scope: 'public',
            init: function() {
                function PublicDep() {}

                return new PublicDep();
            },
        };

        let services = [];
        const singleModule = {
            name: 'singleModule',
            dependencies: [publicDependencyInit],
            moduleLogic: [function(publicDep, next) {
                services.push(publicDep);

                next();
            }],
        };

        const pluginModule1 = {
            name: 'pluginModule1',
            dependencies: [publicDependencyInit],
            moduleLogic: [function(publicDep, next) {
                services.push(publicDep);

                next();
            }],
        };

        const pluginModule2 = {
            name: 'pluginModule2',
            moduleLogic: [function(publicDep, next) {
                services.push(publicDep);

                next();
            }],
        };

        const plugin1 = {
            name: 'plugin1',
            modules: [pluginModule1, pluginModule2],
        };

        const plugin2 = {
            name: 'plugin2',
            modules: [pluginModule1, pluginModule2],
        };

        const g = gabriela.asProcess(config);;

        g.addModule(singleModule);
        g.addPlugin(plugin1);
        g.addPlugin(plugin2);

        /**
         * Warning: This is convoluted.
         *
         * The reason why these plugins have to execute one after another is that they are the same execution but with different
         * order. That makes better test results.
         *
         * If a module is ran first, the identical dependency is created then and reused in plugin dependencies. If a plugin is
         * ran first, the dependency is created then and reused in all other modules of that plugin and in the single module.
         */
        g.runModule().then(() => {
            g.runPlugin('plugin1').then(() => {
                g.runPlugin('plugin2').then(() => {
                    expect(services.length).to.be.equal(5);

                    for (let i = 0; i < services.length; i++) {
                        for (let a = 0; a < services.length; a++) {
                            expect(services[i] == services[a]);
                        }
                    }

                    services = [];

                    g.runPlugin('plugin1').then(() => {
                        g.runPlugin('plugin2').then(() => {
                            g.runModule().then(() => {
                                expect(services.length).to.be.equal(5);

                                for (let i = 0; i < services.length; i++) {
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
        });
    });

    it('should give precedence to module dependencies above public or plugin dependencies', (done) => {
        let resolvedDependency;

        const userRepositoryInit = {
            name: 'userRepository',
            init: function() {
                function UserRepository() {}

                return new UserRepository();
            }
        };

        const publicUserServiceInit = {
            name: 'userService',
            scope: 'public',
            init: function() {
                function UserService() {
                    this.name = 'public';
                }

                return new UserService();
            }
        };

        const pluginUserServiceInit = {
            name: 'userService',
            scope: 'plugin',
            dependencies: [userRepositoryInit],
            init: function(userRepository) {
                function UserService() {
                    this.name = 'plugin';
                    this.userRepository = userRepository;
                }

                return new UserService();
            }
        };

        const moduleUserServiceInit = {
            name: 'userService',
            scope: 'module',
            dependencies: [userRepositoryInit],
            init: function(userRepository) {
                function UserService() {
                    this.userRepository = userRepository;
                    this.name = 'module';
                }

                return new UserService();
            }
        };

        const module1 = {
            name: 'dependencyOrderModule',
            dependencies: [publicUserServiceInit, pluginUserServiceInit, moduleUserServiceInit],
            moduleLogic: [function(userService, next) {
                resolvedDependency = userService;
                next();
            }],
        };

        const g = gabriela.asProcess(config);;

        g.addPlugin({
            name: 'dependencyOrderPlugin',
            modules: [module1],
        });

        g.runPlugin().then(() => {
            expect(resolvedDependency.name).to.be.equal('module');

            done();
        });
    });
});