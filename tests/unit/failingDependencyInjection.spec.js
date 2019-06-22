const mocha = require('mocha');
const chai = require('chai');
const requestPromise = require('request-promise');
const assert = require('assert');

const it = mocha.it;
const describe = mocha.describe;
const expect = chai.expect;

const gabriela = require('../../gabriela/gabriela');
const Compiler = require('../../gabriela/dependencyInjection/compiler');

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

    it('should fail to compile a dependency because of invalid scope value', () => {
        let entersException = false;

        const m = gabriela.asRunner();

        let invalidService = {
            name: 'name',
            scope: 'invalid',
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

            expect(err.message).to.be.equal(`Dependency injection error. 'scope' property needs to be either 'module', 'plugin' or 'public'. If not specified, it is 'module' by default`);
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
            scope: 'module',
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
            scope: 'module',
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

    it('should fail to compile a dependency if there is a shared and scope property present', () => {
        const userServiceInit = {
            name: 'userService',
            scope: 'module',
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