const mocha = require('mocha');
const chai = require('chai');
const requestPromise = require('request-promise');
const assert = require('assert');

const it = mocha.it;
const describe = mocha.describe;
const expect = chai.expect;

const gabriela = require('../../gabriela/gabriela');
const Compiler = require('../../gabriela/dependencyInjection/compiler');
const Validator = require('../../gabriela/misc/validator');

describe('Failing validators static functions package', () => {
    let entersException = false;
    try {
        new Validator();
    } catch (e) {
        entersException = true;

        expect(e.message).to.be.equal(`Invalid usage of Validator. Validator cannot be used as an instance but only as a static method repository`);
    }

    expect(entersException).to.be.equal(true);
});

describe('Failing server tests', () => {
    it('should validate server options and throw exception', () => {

        // invalid port
        let entersException = false;
        try {
            gabriela.asServer({
                port: 'invalid',
            });
        } catch (err) {
            entersException = true;

            expect(err.message).to.be.equal(`Invalid server configuration. 'port' has to be an integer`);
        }

        expect(entersException).to.be.equal(true);

        entersException = false;
        try {
            gabriela.asServer({
                port: 3000,
                runCallback: null,
            });
        } catch (err) {
            entersException = true;

            expect(err.message).to.be.equal(`Invalid server configuration. 'runCallback' must be a function`);
        }

        expect(entersException).to.be.equal(true);
    });
});

describe('Failing dependency injection tests', () => {
    it('should fail to compile a dependency because init.init does not return a function', () => {
        const userServiceInit = {
            name: 'userService',
            init: function() {
                // returns nothing
            }
        };

        const compiler = Compiler.create();

        compiler.add(userServiceInit);

        let entersException = false;
        try {
            compiler.compile('userService');
        } catch (err) {
            entersException = true;

            expect(err.message).to.be.equal(`Dependency injection error. Target service userService cannot return a falsy value`)
        }

        expect(entersException).to.be.equal(true);
    });

    it('should fail to compile a dependency because of non existent service', () => {
        let entersException = false;

        const compiler = Compiler.create();

        try {
            compiler.compile('nonExistentService');
        } catch (err) {
            entersException = true;

            expect(err.message).to.be.equal(`Dependency injection error. 'nonExistentService' not found in the dependency tree`)
        }

        expect(entersException).to.be.equal(true);
    });

    it('should fail to compile because init dependency value not being an object', () => {
        let entersException = false;

        const m = gabriela.asRunner();

        try {
            m.addModule({
                name: 'name',
                dependencies: [1],
            });
        } catch (err) {
            entersException = true;

            expect(err.message).to.be.equal(`Module definition error. 'dependencies' has to be an array of type object`);
        }

        expect(entersException).to.be.equal(true);
    });

    it('should fail to compile a dependency because name property must be a string', () => {
        let entersException = false;

        const m = gabriela.asRunner();

        try {
            m.addModule({
                name: 'name',
                dependencies: [{
                    name: 1,
                }],
            });
        } catch (err) {
            entersException = true;

            expect(err.message).to.be.equal(`Dependency injection error. Init object 'name' property must be a string`);
        }

        expect(entersException).to.be.equal(true);
    });

    it('should fail to compile a dependency because init.init must be a function', () => {
        let entersException = false;

        const m = gabriela.asRunner();

        try {
            m.addModule({
                name: 'name',
                dependencies: [{
                    name: 'name',
                    init: 1,
                }],
            });
        } catch (err) {
            entersException = true;

            expect(err.message).to.be.equal(`Dependency injection error. Init object 'init' property must be a function`);
        }

        expect(entersException).to.be.equal(true);
    });

    it('should fail to compile because of invalid service name data type', () => {
        let entersException = false;

        const m = gabriela.asRunner();

        try {
            m.addModule({
                name: 'name',
                dependencies: [{
                    name: 1,
                }],
            });
        } catch (err) {
            entersException = true;

            expect(err.message).to.be.equal(`Dependency injection error. Init object 'name' property must be a string`);
        }

        expect(entersException).to.be.equal(true);
    });

    it('should fail to compile a dependency because of invalid visibility value', () => {
        let entersException = false;

        const m = gabriela.asRunner();

        let invalidService = {
            name: 'name',
            visibility: 'invalid',
            init: function() {
                function initService() {}

                return new initService();
            }
        };

        try {
            m.addModule({
                name: 'name',
                dependencies: [invalidService],
            });
        } catch (err) {
            entersException = true;

            expect(err.message).to.be.equal(`Dependency injection error. 'visibility' property needs to be either 'module', 'plugin' or 'public'. If not specified, it is 'module' by default`);
        }

        expect(entersException).to.be.equal(true);
    });

    it('should fail to compile a dependency because invalid isAsync option type', () => {
        const userServiceInit = {
            name: 'userService',
            isAsync: 1,
            init: function() {
                return () => {};
            }
        };

        const m = gabriela.asRunner();

        let entersException = false;
        try {
            m.addModule({
                name: 'name',
                dependencies: [userServiceInit],
            });
        } catch (err) {
            entersException = true;

            expect(err.message).to.be.equal(`Dependency injection error. 'isAsync' option must be a boolean`);
        }

        expect(entersException).to.be.equal(true);
    });

    it('should fail to compile a dependency if next is not included in the argument list of an async resolvable service', () => {
        const userServiceInit = {
            name: 'userService',
            visibility: 'module',
            isAsync: true,
            init: function() {
                function constructor() {
                    this.addUser = null;
                    this.removeUser = null;
                }

                requestPromise.get('https://www.google.com').then(() => {
                    return new constructor();
                });
            }
        };

        let entersMiddleware = false;
        const mdl = {
            name: 'name',
            dependencies: [userServiceInit],
            preLogicTransformers: [function(userService, done) {
                entersMiddleware = true;

                done();
            }],
        };

        const g = gabriela.asRunner();

        g.addModule(mdl);

        g.runModule('name').then(() => {
            assert.fail('Success callback called. This test should not be successful. catch() function should be called');
        }).catch((err) => {
            expect(entersMiddleware).to.be.equal(false);

            expect(err.message).to.be.equal(`Dependency injection error. Invalid service init for dependency with name 'userService'. If a dependency is marked as asynchronous with 'isAsync' option, it has to include 'next' function in the argument list and call it when service construction is ready`);
        });
    });

    it('should fail to compile a dependency because of invalid dependency name', () => {
        let entersException = false;

        const compiler = Compiler.create();

        let invalidService = {
            name: 'name',
            visibility: 'module',
            init: function() {
                function initService() {}

                return new initService();
            }
        };

        compiler.add(invalidService);

        try {
            compiler.compile(1);
        } catch (err) {
            entersException = true;

            expect(err.message).to.be.equal(`Dependency injection error. 'compile' method expect a string as a name of a dependency that you want to compile`);
        }

        expect(entersException).to.be.equal(true);
    });

    it('should fail to compile a dependency if there is a shared and visibility property present', () => {
        const userServiceInit = {
            name: 'userService',
            visibility: 'module',
            shared: {
                plugins: []
            },
            init: function() {
                function UserService() {}

                return new UserService();
            }
        };

        const m = gabriela.asRunner();

        let entersException = false;
        try {
            m.addModule({
                name: 'userModule',
                dependencies: [userServiceInit],
            });
        } catch (e) {
            entersException = true;
        }

        expect(entersException).to.be.equal(true);
    });

    it('should fail to compile a dependency because of invalid shared property', () => {
        const userServiceInit = {
            name: 'userService',
            shared: null,
            init: function() {
                function UserService() {}

                return new UserService();
            }
        };

        const m = gabriela.asRunner();

        let entersException = false;
        try {
            m.addModule({
                name: 'userModule',
                dependencies: [userServiceInit],
            });
        } catch (e) {
            entersException = true;

            expect(e.message).to.be.equal(`Dependency injection error. 'shared' property must be an object`);
        }

        expect(entersException).to.be.equal(true);
    });

    it('should fail to compile a dependency because of invalid shared property not having modules of plugins properties', () => {
        const userServiceInit = {
            name: 'userService',
            shared: {},
            init: function() {
                function UserService() {}

                return new UserService();
            }
        };

        const m = gabriela.asRunner();

        let entersException = false;
        try {
            m.addModule({
                name: 'userModule',
                dependencies: [userServiceInit],
            });
        } catch (e) {
            entersException = true;

            expect(e.message).to.be.equal(`Dependency injection error. 'shared' property does not have neither 'modules' or a 'plugins' property`);
        }

        expect(entersException).to.be.equal(true);
    });

    it('should fail to compile a dependency because of invalid shared.plugins property data type', () => {
        const userServiceInit = {
            name: 'userService',
            shared: {
                plugins: {}
            },
            init: function() {
                function UserService() {}

                return new UserService();
            }
        };

        const m = gabriela.asRunner();

        let entersException = false;
        try {
            m.addModule({
                name: 'userModule',
                dependencies: [userServiceInit],
            });
        } catch (e) {
            entersException = true;

            expect(e.message).to.be.equal(`Dependency injection error. 'plugins' property of 'shared' property must be an array`);
        }

        expect(entersException).to.be.equal(true);
    });

    it('should fail to compile a dependency because of invalid shared.modules property data type', () => {
        const userServiceInit = {
            name: 'userService',
            shared: {
                modules: {}
            },
            init: function() {
                function UserService() {}

                return new UserService();
            }
        };

        const m = gabriela.asRunner();

        let entersException = false;
        try {
            m.addModule({
                name: 'userModule',
                dependencies: [userServiceInit],
            });
        } catch (e) {
            entersException = true;

            expect(e.message).to.be.equal(`Dependency injection error. 'modules' property of 'shared' property must be an array`);
        }

        expect(entersException).to.be.equal(true);
    });

    it('should fail to compile a dependency because of not found shared dependency', (done) => {
        const searchServiceInit = {
            name: 'searchService',
            init: function(userRepository) {
                return () => {};
            }
        };

        const sortServiceInit = {
            name: 'sortService',
            init: function(userRepository) {
                return () => {};
            }
        };

        const landingPageServiceInit = {
            name: 'landingPage',
            init: function(userRepository) {
                return () => {};
            }
        };

        const userRepositoryInit = {
            name: 'userRepository',
            init: function() {
                return () => {};
            },
            shared: {
                modules: ['module']
            }
        };

        const m = gabriela.asRunner();

        m.addModule({
            name: 'module',
            dependencies: [searchServiceInit, sortServiceInit, userRepositoryInit, landingPageServiceInit],
            moduleLogic: [function(sortService, next) {
                next();
            }],
        });

        m.addModule({
            name: 'anotherModule',
            dependencies: [searchServiceInit, sortServiceInit, userRepositoryInit, landingPageServiceInit],
            moduleLogic: [function(sortService, next) {
                next();
            }],
        });

        m.runModule('anotherModule').then(() => {
            assert.fail('This test should not be successful');
        }).catch((err) => {
            expect(err.message).to.be.equal(`Dependency injection error. '${userRepositoryInit.name}' not found in the dependency tree`);

            done();
        });
    });

    it('should not resolve an argument if the argument is a falsy value', (done) => {
        const m = gabriela.asRunner();
        m.addModule({
            name: 'module',
            moduleLogic: [function(sortService, next) {
                next();
            }],
        });

        m.runModule('module').then(() => {
            assert.fail('This test should fail');
            done();
        }).catch((err) => {
            expect(err.message).to.be.equal(`Argument resolving error. Cannot resolve argument with name 'sortService'`);

            done();
        });
    });

    it('should fail to create a dependency of dependency if the inner dependency is not shared with the right module', (done) => {
        const m = gabriela.asRunner();

        const sortServiceInit = {
            name: 'sortService',
            init: function(userRepository) {
                return () => {};
            },
            shared: {
                modules: ['module2'],
            },
        };

        const userRepositoryInit = {
            name: 'userRepository',
            init: function() {
                return () => {};
            },
            shared: {
                modules: ['module1'],
            },
        };

        const module1 = {
            name: 'module1',
        };

        const module2 = {
            name: 'module2',
            moduleLogic: [function(sortService, next) {
                next();
            }],
            dependencies: [sortServiceInit, userRepositoryInit],
        };

        m.addModule(module1);
        m.addModule(module2);

        m.runModule('module2').then(() => {
            assert.fail('This test should fail');

            done();
        }).catch((err) => {
            expect(err.message).to.be.equal(`Dependency injection error. 'userRepository' not found in the dependency tree`);

            done();
        });
    });

    it('should fail to compile a dependency because \'dependencies\' property is not an array', () => {
        const userServiceInit = {
            name: 'userService',
            dependencies: null,
            init: function() {
                return () => {};
            }
        };

        const g = gabriela.asRunner();

        let entersException = false;
        try {
            g.addModule({
                name: 'name',
                moduleLogic: [function(userService, next) {
                    next();
                }],
                dependencies: [userServiceInit]
            });
        } catch (e) {
            entersException = true;
            expect(e.message).to.be.equal(`Dependency injection error for '${userServiceInit.name}'. 'dependencies' option must be an array of dependency 'init' objects`);
        }

        expect(entersException).to.be.equal(true);
    });
});

describe('Failing private compiler dependency injection tests', () => {
    it('should fail because of not found private dependency', () => {
        const initObject = {
            name: 'someService',
            dependencies: [],
            init: function(privateDependency) {
                return () => {};
            }
        };

        const g = gabriela.asRunner();

        g.addModule({
            name: 'module',
            dependencies: [initObject],
            moduleLogic: [function(someService, next) {
                next();
            }],
        });

        g.runModule().then(() => {
            assert.fail('This test should fail');
        }).catch((e) => {
            expect(e.message).to.be.equal(`Dependency injection error. 'privateDependency' not found in the dependency tree`);
        });
    });

    it('should fail because of invalid private dependency init object', () => {
        const privateDep = {
            name: 'privateDep',
            init: null,
        };

        const initObject = {
            name: 'someService',
            dependencies: [privateDep],
            init: function(privateDep) {
                return () => {};
            }
        };

        const g = gabriela.asRunner();

        try {
            g.addModule({
                name: 'module',
                dependencies: [initObject],
                moduleLogic: [function(someService, next) {
                    next();
                }],
            });
        } catch (e) {
            expect(e.message).to.be.equal(`Dependency injection error. Init object 'init' property must be a function`);
        }
    });
});

describe('Failing module definition tests', () => {
    it('should throw an error because of invalid dependencies entry type', () => {
        let userModule = {
            name: 'userModule',
            dependencies: null,
        };

        let g = gabriela.asRunner();

        let entersException = false;
        try {
            g.addModule(userModule);
        } catch(err) {
            entersException = true;

            expect(err.message).to.be.equal(`Module definition error. 'dependencies' has to be an array of type object`);
        }

        expect(entersException).to.be.equal(true);
    });

    it('should throw error when module definition name does not exist', () => {
        let userModule = {};

        let g = gabriela.asRunner();

        let entersException = false;
        try {
            g.addModule(userModule);
        } catch(err) {
            entersException = true;

            expect(err.message).to.be.equal(`Module definition error. Module has to have a 'name' property as a string that has to be unique to the project`);
        }

        expect(entersException).to.be.equal(true);
    });

    it('should throw an error if module definition name is not a string', () => {
        let userModule = {
            name: 1
        };

        let g = gabriela.asRunner();

        let entersException = false;
        try {
            g.addModule(userModule);
        } catch(err) {
            entersException = true;

            expect(err.message).to.be.equal(`Modules definition error. Module 'name' property must to be a string`);
        }

        expect(entersException).to.be.equal(true);
    });

    it('should throw an error if any of the middleware is not an array', () => {
        const middlewareNames = ['preLogicTransformers', 'postLogicTransformers', 'moduleLogic', 'security'];

        let userModule = {
            name: 'name',
        };

        let g = gabriela.asRunner();

        let entersException = false;
        for (const middlewareName of middlewareNames) {
            userModule = {};
            userModule.name = 'name';
            userModule[middlewareName] = null;

            entersException = false;
            try {
                g.addModule(userModule);
            } catch(err) {
                entersException = true;

                expect(err.message).to.be.equal(`Module definition error. '${middlewareName}' of '${userModule.name}' module has to be an array of functions or an object with a 'name' property and a 'middleware' property that has to be an array`);
            }

            expect(entersException).to.be.equal(true);
        }
    });

    it('should throw an error if module definition middleware values in the middleware array is not a function', () => {
        let userModule = {};
        userModule.name = 'name';
        userModule.preLogicTransformers = [1];

        const runner = gabriela.asRunner();

        let entersException = false;
        try {
            runner.addModule(userModule);
        } catch(err) {
            entersException = true;

            expect(err.message).to.be.equal(`Invalid middleware value. 'preLogicTransformers' middleware of '${userModule.name}' module must receive an array of functions`);
        }

        expect(entersException).to.be.equal(true);
    });

    it('should throw an error for invalid middleware name property definition object', () => {
        const middlewareNames = ['preLogicTransformers', 'postLogicTransformers', 'moduleLogic', 'security'];

        let userModule = {
            name: 'name',
        };

        let g = gabriela.asRunner();

        let entersException = false;
        for (const middlewareName of middlewareNames) {
            userModule = {};
            userModule.name = 'name';
            userModule[middlewareName] = [{}];

            entersException = false;
            try {
                g.addModule(userModule);
            } catch(err) {
                entersException = true;

                expect(err.message).to.be.equal(`Invalid middleware definition object. '${middlewareName}' of module '${userModule.name}' has to have a 'name' property that must be a string`);
            }

            expect(entersException).to.be.equal(true);
        }
    });

    it('should throw an error for invalid middleware middleware property definition object', () => {
        const middlewareNames = ['preLogicTransformers', 'postLogicTransformers', 'moduleLogic', 'security'];

        let userModule = {
            name: 'name',
        };

        let g = gabriela.asRunner();

        let entersException = false;
        for (const middlewareName of middlewareNames) {
            userModule = {};
            userModule.name = 'name';
            userModule[middlewareName] = [{
                name: 'name'
            }];

            entersException = false;
            try {
                g.addModule(userModule);
            } catch(err) {
                entersException = true;

                expect(err.message).to.be.equal(`Invalid middleware definition object. '${middlewareName}' of module '${userModule.name}' has to have a 'middleware' property that must be an array of functions`);
            }

            expect(entersException).to.be.equal(true);
        }
    });

    it('should throw an error for invalid middleware name property property value for definition object', () => {
        const middlewareNames = ['preLogicTransformers', 'postLogicTransformers', 'moduleLogic', 'security'];

        let userModule = {
            name: 'name',
        };

        let g = gabriela.asRunner();

        let entersException = false;
        for (const middlewareName of middlewareNames) {
            userModule = {};
            userModule.name = 'name';
            userModule[middlewareName] = [{
                name: 1,
                middleware: []
            }];

            entersException = false;
            try {
                g.addModule(userModule);
            } catch(err) {
                entersException = true;

                expect(err.message).to.be.equal(`Invalid middleware definition object. '${middlewareName}' of module '${userModule.name}' has to have a 'name' property that must be a string`);
            }

            expect(entersException).to.be.equal(true);
        }
    });

    it('should throw an error for invalid middleware name property property value for definition object', () => {
        const middlewareNames = ['preLogicTransformers', 'postLogicTransformers', 'moduleLogic', 'security'];

        let userModule = {
            name: 'name',
        };

        let g = gabriela.asRunner();

        let entersException = false;
        for (const middlewareName of middlewareNames) {
            userModule = {};
            userModule.name = 'name';
            userModule[middlewareName] = [{
                name: 'name',
                middleware: null
            }];

            entersException = false;
            try {
                g.addModule(userModule);
            } catch(err) {
                entersException = true;

                expect(err.message).to.be.equal(`Invalid middleware definition object. '${middlewareName}' of module '${userModule.name}' has to have a 'middleware' property that must be a function`);
            }

            expect(entersException).to.be.equal(true);
        }
    });

    it('should throw error if module to override does not exist', () => {
        let userModule = {
            name: 'name',
        };

        let g = gabriela.asRunner();

        g.addModule(userModule);

        let entersException = false;
        try {
            g.overrideModule({
                name: 'nonExistent'
            });
        } catch (e) {
            entersException = true;

            expect(e.message).to.be.equal(`Module overriding error. Module with name 'nonExistent' does not exist`);
        }

        expect(entersException).to.be.equal(true);
    });

    it('should throw an error if disable property is not a boolean', () => {
        const middlewareNames = ['preLogicTransformers', 'postLogicTransformers', 'moduleLogic', 'security'];

        let userModule = {
            name: 'name',
        };

        let g = gabriela.asRunner();

        let entersException = false;
        for (const middlewareName of middlewareNames) {
            userModule = {};
            userModule.name = 'name';
            userModule[middlewareName] = [{
                name: 'name',
                disabled: 1,
                middleware: function() {},
            }];

            entersException = false;
            try {
                g.addModule(userModule);
            } catch(err) {
                entersException = true;

                expect(err.message).to.be.equal(`Invalid middleware definition object. '${middlewareName}' of module '${userModule.name}' 'disabled' property has to be a type boolean`);
            }

            expect(entersException).to.be.equal(true);
        }
    });

    it('should throw an error when executing an invalid module name', () => {
        const userModule = {
            name: 'name',
        };

        const m = gabriela.asRunner();

        m.addModule(userModule);

        m.runModule([]).then(() => {
            assert.fail('This test should not be executed successfully');
        }).catch((err) => {
            expect(err.message).to.be.equal(`Module runtime tree error. Invalid module name type. Module name must be a string`);
        });
    });

    it('should throw an error when executing a non existent module', () => {
        const userModule = {
            name: 'name',
        };

        const m = gabriela.asRunner();

        m.addModule(userModule);

        m.runModule('nonExistent').then(() => {
            assert.fail('This test should not be executed successfully');
        }).catch((err) => {
            expect(err.message).to.be.equal(`Module runtime tree error. Module with name 'nonExistent' does not exist`);
        });
    });
});

describe('Plugin errors', () => {
    it('should fail plugin definition because of invalid data type', () => {
        const p = gabriela.asRunner();

        const plugin = null;

        let entersException = false;
        try {
            p.addPlugin(plugin);
        } catch (e) {
            entersException = true;

            expect(e.message).to.be.equal(`Plugin definition error. Plugin definition has to be an object`);
        }

        expect(entersException).to.be.equal(true);
    });

    it('should fail because of non existent plugin name', () => {
        const p = gabriela.asRunner();

        const plugin = {};

        let entersException = false;
        try {
            p.addPlugin(plugin);
        } catch (e) {
            entersException = true;

            expect(e.message).to.be.equal(`Plugin definition error. Plugin definition has to have a 'name' property`);
        }

        expect(entersException).to.be.equal(true);
    });

    it('should fail because of invalid plugin name', () => {
        const p = gabriela.asRunner();

        let plugin = {
            name: 1
        };

        let entersException = false;
        try {
            p.addPlugin(plugin);
        } catch (e) {
            entersException = true;

            expect(e.message).to.be.equal(`Plugin definition error. Plugin 'name' must be a string`);
        }

        expect(entersException).to.be.equal(true);
    });

    it('should fail because of existing plugin', () => {
        const p = gabriela.asRunner();

        const plugin1 = {
            name: 'plugin1',
        };

        const plugin2 = {
            name: 'plugin2',
        };

        p.addPlugin(plugin1);
        p.addPlugin(plugin2);

        let entersException = false;
        try {
            p.addPlugin({
                name: 'plugin2',
            });
        } catch (e) {
            entersException = true;

            expect(e.message).to.be.equal(`Plugin definition error. Plugin with name '${plugin2.name}' already exists`);
        }

        expect(entersException).to.be.equal(true);
    });

    it('should throw an error if plugin modules is not an array', () => {
        const p = gabriela.asRunner();

        const plugin = {
            name: 'plugin',
            modules: null
        };

        let entersException = false;
        try {
            p.addPlugin(plugin);
        } catch (e) {
            entersException = true;

            expect(e.message).to.be.equal(`Plugin definition error. Plugin with name '${plugin.name}' 'modules' entry must be an array of module objects`);
        }

        expect(entersException).to.be.equal(true);
    });

    it('should throw an error if any of the plugin modules are invalid', (done) => {
        const p = gabriela.asRunner();

        const plugin = {
            name: 'plugin',
            modules: [{
                name: 'moduleName',
                dependencies: null,
            }]
        };

        let entersException = false;
        try {
            p.addPlugin(plugin);
        } catch (e) {
            entersException = true;

            expect(e.message).to.be.equal(`Plugin definition error. Plugin with name '${plugin.name}' has an invalid 'modules' entry with message: 'Module definition error. 'dependencies' has to be an array of type object'`);

            done();
        }

        expect(entersException).to.be.equal(true);
    });

    it('should throw an error when running a plugin with invalid type', (done) => {
        const p = gabriela.asRunner();

        const plugin = {
            name: 'plugin',
        };

        p.addPlugin(plugin);

        p.runPlugin([]).then(() => {
            assert.fail('This test should not be executed successfully');
        }).catch((err) => {
            expect(err.message).to.be.equal(`Plugin tree runtime error. Invalid plugin name type. Plugin name must be a string`);

            done();
        });
    });

    it('should throw an error while executing an non existent plugin', (done) => {
        const p = gabriela.asRunner();

        const plugin = {
            name: 'plugin',
        };

        p.addPlugin(plugin);

        p.runPlugin('nonExistent').then(() => {
            assert.fail('This test should not be executed successfully');
        }).catch((err) => {
            expect(err.message).to.be.equal(`Plugin tree runtime error. Plugin with name 'nonExistent' does not exist`);

            done();
        });
    });
});