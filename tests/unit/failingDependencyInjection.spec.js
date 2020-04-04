const mocha = require('mocha');
const chai = require('chai');
const assert = require('assert');

const it = mocha.it;
const describe = mocha.describe;
const expect = chai.expect;

const gabriela = require('../../src/gabriela/gabriela');

describe('Failing dependency injection tests', () => {
    it('should fail to compile because init dependency value not being an object', () => {
        let entersException = false;

        const m = gabriela.asProcess();

        try {
            m.addModule({
                name: 'name',
                dependencies: [1],
            });
        } catch (err) {
            entersException = true;

            expect(err.message).to.be.equal(`Module definition error in module 'name'. 'dependencies' has to be an array of type object`);
        }

        expect(entersException).to.be.equal(true);
    });

    it('should fail to compile a dependency because name property must be a string', () => {
        let entersException = false;

        const m = gabriela.asProcess();

        try {
            m.addModule({
                name: 'name',
                dependencies: [{
                    name: 1,
                }],
            });
        } catch (err) {
            entersException = true;

            expect(err.message).to.be.equal(`Dependency injection error in module 'name'. Init object 'name' property must be a string`);
        }

        expect(entersException).to.be.equal(true);
    });

    it('should fail to compile a dependency because init.init must be a function', () => {
        let entersException = false;

        const m = gabriela.asProcess();

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

            expect(err.message).to.be.equal(`Dependency injection error in module 'name'. Init object 'init' property must be a function`);
        }

        expect(entersException).to.be.equal(true);
    });

    it('should fail to compile a dependency because of invalid scope value', () => {
        let entersException = false;

        const m = gabriela.asProcess();

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

            expect(err.message).to.be.equal(`Dependency injection error in module 'name'. '${invalidService.name}' 'scope' property needs to be either 'module', 'plugin' or 'public'. If not specified, it is 'module' by default`);
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

        const m = gabriela.asProcess();

        let entersException = false;
        try {
            m.addModule({
                name: 'name',
                dependencies: [userServiceInit],
            });
        } catch (err) {
            entersException = true;

            expect(err.message).to.be.equal(`Dependency injection error in module 'name'. '${userServiceInit.name}' 'isAsync' option must be a boolean`);
        }

        expect(entersException).to.be.equal(true);
    });

    it('should fail to compile a dependency if next is not included in the argument list of an async resolvable service', (done) => {
        const userServiceInit = {
            name: 'userService',
            scope: 'module',
            isAsync: true,
            init: function() {
                function constructor() {
                    this.addUser = null;
                    this.removeUser = null;
                }

                setTimeout(() => {
                    return new constructor();

                }, 50);
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

        const g = gabriela.asProcess({
            events: {
                catchError(err) {
                    expect(entersMiddleware).to.be.equal(false);

                    expect(err.message).to.be.equal(`Dependency injection error. Invalid service init for dependency with name 'userService'. If a dependency is marked as asynchronous with 'isAsync' option, it has to include 'next' function in the argument list and call it when service construction is ready`);

                    done();
                }
            }
        });

        g.addModule(mdl);

        g.startApp();
    });

    it('should fail to compile a dependency if the dependency data type is not an object', () => {
        const m = gabriela.asProcess();

        let entersException = false;
        try {
            m.addModule({
                name: 'userModule',
                dependencies: [null],
            });
        } catch (e) {
            entersException = true;
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

        const m = gabriela.asProcess();

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

        const m = gabriela.asProcess();

        let entersException = false;
        try {
            m.addModule({
                name: 'userModule',
                dependencies: [userServiceInit],
            });
        } catch (e) {
            entersException = true;

            expect(e.message).to.be.equal(`Dependency injection error in module 'userModule'. '${userServiceInit.name}' 'shared' property must be an object`);
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

        const m = gabriela.asProcess();

        let entersException = false;
        try {
            m.addModule({
                name: 'userModule',
                dependencies: [userServiceInit],
            });
        } catch (e) {
            entersException = true;

            expect(e.message).to.be.equal(`Dependency injection error in module 'userModule'. '${userServiceInit.name}' 'shared' property does not have neither 'modules' or a 'plugins' property`);
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

        const m = gabriela.asProcess();

        let entersException = false;
        try {
            m.addModule({
                name: 'userModule',
                dependencies: [userServiceInit],
            });
        } catch (e) {
            entersException = true;

            expect(e.message).to.be.equal(`Dependency injection error in module 'userModule'. '${userServiceInit.name}' 'plugins' property of 'shared' property must be an array`);
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

        const m = gabriela.asProcess();

        let entersException = false;
        try {
            m.addModule({
                name: 'userModule',
                dependencies: [userServiceInit],
            });
        } catch (e) {
            entersException = true;

            expect(e.message).to.be.equal(`Dependency injection error in module 'userModule'. '${userServiceInit.name}' 'modules' property of 'shared' property must be an array`);
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

        const m = gabriela.asProcess({
            events: {
                catchError(err) {
                    expect(err.message).to.be.equal(`Dependency injection error. 'userRepository' service cannot be shared with module 'anotherModule'`);

                    done();
                }
            }
        });

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

        m.startApp();
    });

    it('should not resolve an argument if the argument is a falsy value', (done) => {
        const m = gabriela.asProcess({
            events: {
                catchError(err) {
                    expect(err.message).to.be.equal(`Argument resolving error. Cannot resolve argument with name 'sortService'`);

                    done();
                }
            }
        });

        m.addModule({
            name: 'module',
            moduleLogic: [function(sortService, next) {
                next();
            }],
        });

        m.startApp();
    });

    it('should fail to create a dependency of dependency if the inner dependency is not shared with the right module', (done) => {
        const m = gabriela.asProcess({
            events: {
                catchError(err) {
                    expect(err.message).to.be.equal(`Dependency injection error. 'userRepository' service cannot be shared with module 'module2'`);

                    done();
                }
            }
        });

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

        m.startApp();
    });

    it('should fail to compile a dependency because \'dependencies\' property is not an array', () => {
        const userServiceInit = {
            name: 'userService',
            dependencies: null,
            init: function() {
                return () => {};
            }
        };

        const g = gabriela.asProcess();

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

            expect(e.message).to.be.equal(`Dependency injection error for '${userServiceInit.name}' in module 'name'. '${userServiceInit.name}' 'dependencies' option must be an array of dependency 'init' objects`);
        }

        expect(entersException).to.be.equal(true);
    });

    it('should fail to compile a dependency because of invalid compilerPass option data type', () => {
        const userServiceInit = {
            name: 'userService',
            compilerPass: null,
            init: function() {
                return () => {};
            }
        };

        const g = gabriela.asProcess();

        let entersException = false;
        try {
            g.addModule({
                name: 'module',
                dependencies: [userServiceInit]
            })
        } catch (e) {
            expect(e.message).to.be.equal(`Dependency injection error for '${userServiceInit.name}' in module 'module'. 'compilerPass' option must be an object with property 'init' that is required and must be a function and 'property' that is optional and must be a string`);

            entersException = true;
        }

        expect(entersException).to.be.equal(true);
    });

    it('should fail to compile a dependency because of invalid compilerPass.init option data type', () => {
        const userServiceInit = {
            name: 'userService',
            compilerPass: {
                init: null,
            },
            init: function() {
                return () => {};
            }
        };

        const g = gabriela.asProcess();

        let entersException = false;
        try {
            g.addModule({
                name: 'module',
                dependencies: [userServiceInit]
            })
        } catch (e) {
            expect(e.message).to.be.equal(`Dependency injection error for '${userServiceInit.name}' in module 'module'. 'compilerPass' option must be an object with property 'init' that is required and must be a function and 'property' that is optional and must be a string`);

            entersException = true;
        }

        expect(entersException).to.be.equal(true);
    });

    it('should fail to compile a dependency because of invalid compilerPass.property option data type', () => {
        const userServiceInit = {
            name: 'userService',
            compilerPass: {
                init: function() {

                },
                property: null,
            },
            init: function() {
                return () => {};
            }
        };

        const g = gabriela.asProcess();

        let entersException = false;
        try {
            g.addModule({
                name: 'module',
                dependencies: [userServiceInit]
            })
        } catch (e) {
            expect(e.message).to.be.equal(`Dependency injection error for '${userServiceInit.name}' in module 'module'. 'compilerPass' option must be an object with property 'init' that is required and must be a function and 'property' that is optional and must be a string`);

            entersException = true;
        }

        expect(entersException).to.be.equal(true);
    });

    it('should fail to create a dependency because of invalid usage of compiler passes but within gabriela', () => {
        const userServiceInit = {
            name: 'userService',
            compilerPass: {
                init: function(config, compiler) {
                    compiler.compile('something');
                },
            },
            init: function() {
                return () => {};
            }
        };

        const g = gabriela.asProcess();

        let entersException = false;
        try {
            g.addModule({
                name: 'module',
                dependencies: [userServiceInit],
                moduleLogic: [function(userService) {

                }],
            });
        } catch (e) {
            entersException = true;
            expect(e.message).to.be.equal(`Dependency injection error in service 'userService'. Compiling inside a compiler pass is forbidden`);
        }

        expect(entersException).to.be.equals(true);
    });

    it('should fail to create a module with a invalid cache option data type', () => {
        const userServiceInit = {
            name: 'userService',
            cache: 'not boolean',
            init: function() {
                return () => {};
            }
        };

        const g = gabriela.asProcess();

        let entersException = false;
        try {
            g.addModule({
                name: 'module',
                dependencies: [userServiceInit],
                moduleLogic: [function(userService) {

                }],
            });
        } catch (e) {
            entersException = true;
            expect(e.message).to.be.equal(`Dependency injection error for entry 'init.cache' in module 'module'. 'init.cache' option must be a boolean`);
        }

        expect(entersException).to.be.equal(true);
    });

    it('should fail to resolve a shared dependency within a unspecified plugin', (done) => {
        let entersMdl1 = false;
        let entersMdl2 = false;

        const shared1 = {
            name: 'shared1',
            shared: {
                plugins: ['plugin1']
            },
            init: function() {
                return {name: 'shared1'}
            }
        };

        const shared2 = {
            name: 'shared2',
            shared: {
                plugins: ['plugin2']
            },
            init: function() {
                return {name: 'shared2'};
            },
        };

        const initModule = {
            name: 'initModule',
            dependencies: [shared1, shared2],
        };

        const g = gabriela.asProcess({
            events: {
                onAppStarted() {
                    expect(entersMdl1).to.be.equal(false);
                    expect(entersMdl2).to.be.equal(false);

                    done();
                },
                catchError(e) {
                    expect(entersMdl1).to.be.equal(false);
                    expect(entersMdl2).to.be.equal(false);

                    expect(e.message).to.be.equal("Dependency injection error. 'shared2' service cannot be shared with module 'mdl1' that is a member of 'plugin1' plugin");

                    done();
                }
            }
        });

        const mdl1 = {
            name: 'mdl1',
            moduleLogic: [function(shared2) {
                entersMdl1 = true;
            }]
        };

        const mdl2 = {
            name: 'mdl2',
            moduleLogic: [function(shared2) {
                entersMdl2 = true;

                expect(shared2.name).to.be.equal('shared2');
            }]
        };

        g.addPlugin({
            name: 'plugin1',
            modules: [initModule, mdl1],
        });

        g.addPlugin({
            name: 'plugin2',
            modules: [initModule, mdl2],
        });

        g.startApp();
    });

    it('should fail if a public dependency has dependencies that cannot be shared with with each other', (done) => {
        let entersMdl1 = false;
        let entersMdl2 = false;

        const shared1 = {
            name: 'shared1',
            shared: {
                plugins: ['plugin1']
            },
            init: function() {
                return {name: 'shared1'}
            }
        };

        const shared2 = {
            name: 'shared2',
            shared: {
                plugins: ['plugin2']
            },
            init: function() {
                return {name: 'shared2'};
            },
        };

        const publicDep = {
            name: 'publicDep',
            scope: 'public',
            init() {
                class PublicDep {
                    constructor(shared1, shared2) {
                        this.shared1 = shared1;
                        this.shared2 = shared2;
                    }
                }

                return this.withConstructorInjection(PublicDep).bind('shared1', 'shared2');
            }
        };

        const initModule = {
            name: 'initModule',
            dependencies: [shared1, shared2, publicDep],
        };

        const g = gabriela.asProcess({
            events: {
                catchError(e) {
                    expect(entersMdl1).to.be.equal(false);
                    expect(entersMdl2).to.be.equal(false);
                    expect(e.message).to.be.equal("Dependency injection error. 'shared2' service cannot be shared with module 'mdl1' that is a member of 'plugin1' plugin");

                    done();
                }
            }
        });

        const mdl1 = {
            name: 'mdl1',
            moduleLogic: [function(publicDep) {
                entersMdl1 = true;

                expect(publicDep.shared1.name).to.be.equal('shared1');
                expect(publicDep.shared2.name).to.be.equal('shared2');
            }],
        };

        const mdl2 = {
            name: 'mdl2',
            moduleLogic: [function(publicDep) {
                entersMdl2 = true;

                expect(publicDep.shared1.name).to.be.equal('shared1');
                expect(publicDep.shared2.name).to.be.equal('shared2');
            }]
        };

        g.addPlugin({
            name: 'plugin1',
            modules: [initModule, mdl1],
        });

        g.addPlugin({
            name: 'plugin2',
            modules: [initModule, mdl2],
        });

        g.startApp();
    });

    it('should fail if a plugin dependency has dependencies that cannot be shared with with each other', (done) => {
        let entersMdl1 = false;
        let entersMdl2 = false;

        const shared1 = {
            name: 'shared1',
            shared: {
                plugins: ['plugin1']
            },
            init: function() {
                return {name: 'shared1'}
            }
        };

        const shared2 = {
            name: 'shared2',
            shared: {
                plugins: ['plugin2']
            },
            init: function() {
                return {name: 'shared2'};
            },
        };

        const publicDep = {
            name: 'publicDep',
            scope: 'plugin',
            init() {
                class PublicDep {
                    constructor(shared1, shared2) {
                        this.shared1 = shared1;
                        this.shared2 = shared2;
                    }
                }

                return this.withConstructorInjection(PublicDep).bind('shared1', 'shared2');
            }
        };

        const initModule = {
            name: 'initModule',
            dependencies: [shared1, shared2, publicDep],
        };

        const g = gabriela.asProcess({
            events: {
                catchError(e) {
                    expect(entersMdl1).to.be.equal(false);
                    expect(entersMdl2).to.be.equal(false);
                    expect(e.message).to.be.equal("Dependency injection error. 'shared2' service cannot be shared with module 'mdl1' that is a member of 'plugin1' plugin");

                    done();
                }
            }
        });

        const mdl1 = {
            name: 'mdl1',
            moduleLogic: [function(publicDep) {
                entersMdl1 = true;

                expect(publicDep.shared1.name).to.be.equal('shared1');
                expect(publicDep.shared2.name).to.be.equal('shared2');
            }],
        };

        const mdl2 = {
            name: 'mdl2',
            moduleLogic: [function(publicDep) {
                entersMdl2 = true;

                expect(publicDep.shared1.name).to.be.equal('shared1');
                expect(publicDep.shared2.name).to.be.equal('shared2');
            }]
        };

        g.addPlugin({
            name: 'plugin1',
            modules: [initModule, mdl1],
        });

        g.addPlugin({
            name: 'plugin2',
            modules: [initModule, mdl2],
        });

        g.startApp();
    });
});
