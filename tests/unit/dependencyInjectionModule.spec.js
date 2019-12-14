const mocha = require('mocha');
const chai = require('chai');
const requestPromise = require('request-promise');

const it = mocha.it;
const describe = mocha.describe;
const expect = chai.expect;

const gabriela = require('../../src/gabriela/gabriela');
const config = require('../config/config');

describe('Module dependency injection tests', function() {
    this.timeout(10000);
    
    it('should resolve module dependency tree', () => {
        const userFriendsRepositoryServiceInit = {
            name: 'userFriendsRepository',
            init: function() {
                function FriendsRepository() {
                    this.addFriend = null;
                }

                return new FriendsRepository();
            }
        };

        const userRepositoryServiceInit = {
            name: 'userRepository',
            init: function(userFriendsRepository) {
                function UserRepository() {
                    this.addUser = null;

                    this.userFriendsRepository = userFriendsRepository;
                }

                return new UserRepository();
            }
        };

        const userServiceInit = {
            name: 'userService',
            init: function(userRepository) {
                function UserRepository() {
                    this.createUser = null;

                    this.userRepository = userRepository;
                }

                return new UserRepository();
            }
        };

        const contextDependency = {
            name: 'contextDependency',
            init: function() {
                return {};
            }
        };

        let entersMiddleware = false;
        const mdl = {
            name: 'name',
            dependencies: [userServiceInit, userRepositoryServiceInit, userFriendsRepositoryServiceInit, contextDependency],
            preLogicTransformers: [function(userService, done) {
                entersMiddleware = true;

                expect(userService).to.have.property('createUser');
                expect(userService).to.have.property('userRepository');

                expect(userService.userRepository).to.have.property('addUser');
                expect(userService.userRepository).to.have.property('userFriendsRepository');

                expect(userService.userRepository.userFriendsRepository).to.have.property('addFriend');

                const contextDependency = this.compiler.get('contextDependency');

                expect(contextDependency).to.be.a('object');
                expect(contextDependency._$metadata).to.be.a('object');

                done();
            }],
        };

        const g = gabriela.asProcess(config);;

        g.addModule(mdl);

        g.runModule('name').then(() => {
            expect(entersMiddleware).to.be.equal(true);
        });
    });

    it('should resolve a single module dependency with async function inside, synchronously', () => {
        const userServiceInit = {
            name: 'userService',
            scope: 'module',
            isAsync: true,
            init: function(next) {
                function UserService() {
                    this.addUser = null;
                    this.removeUser = null;
                }

                setTimeout(() => {
                    next(() => {
                        return new UserService();
                    });
                }, 50);
            },
        };

        const asyncContextDep = {
            name: 'asyncContextDep',
            scope: 'module',
            isAsync: true,
            init: function(next) {
                function UserService() {
                    this.addUser = null;
                    this.removeUser = null;
                }

                setTimeout(() => {
                    next(() => {
                        return new UserService();
                    });
                }, 50);
            },
        };

        let entersMiddleware = false;
        const mdl = {
            name: 'asyncModuleName',
            dependencies: [userServiceInit, asyncContextDep],
            preLogicTransformers: [function(userService, done) {
                entersMiddleware = true;

                expect(userService).to.be.a('object');
                expect(userService).to.have.property('addUser');
                expect(userService).to.have.property('removeUser');

                const asyncContextDep = this.compiler.get('asyncContextDep');

                expect(asyncContextDep).to.be.a('object');
                expect(asyncContextDep).to.have.property('addUser');
                expect(asyncContextDep).to.have.property('removeUser');

                done();
            }],
        };

        const g = gabriela.asProcess(config);

        g.addModule(mdl);

        return g.runModule('asyncModuleName').then(() => {
            expect(entersMiddleware).to.be.equal(true);
        });
    });

    it('should resolve a dependency tree with async function inside, synchronously', () => {
        const userFriendsRepositoryServiceInit = {
            name: 'userFriendsRepository',
            isAsync: true,
            init: function(next) {
                function FriendsRepository() {
                    this.addFriend = null;
                }

                setTimeout(() => {
                    next(() => {
                        return new FriendsRepository();
                    });
                }, 50);
            }
        };

        const userRepositoryServiceInit = {
            name: 'userRepository',
            isAsync: true,
            init: function(userFriendsRepository, next) {
                function UserRepository() {
                    this.addUser = null;

                    this.userFriendsRepository = userFriendsRepository;
                }

                setTimeout(() => {
                    next(() => {
                        return new UserRepository();
                    });
                }, 50);
            }
        };

        const userServiceInit = {
            name: 'userService',
            scope: 'module',
            isAsync: true,
            init: function(userRepository, next) {
                function UserService() {
                    this.createUser = null;
                    this.removeUser = null;

                    this.userRepository = userRepository;
                }

                setTimeout(() => {
                    next(() => {
                        return new UserService();
                    });
                }, 50);
            }
        };

        const contextDep = {
            name: 'contextDep',
            isAsync: true,
            init: function(userService, next) {
                expect(userService).to.be.a('object');

                function ContextDep() {

                }

                setTimeout(() => {
                    next(() => {
                        return new ContextDep();
                    });
                }, 50);
            }
        };

        let entersMiddleware = false;
        const mdl = {
            name: 'treeAsyncServiceDefinition',
            dependencies: [userServiceInit, userRepositoryServiceInit, userFriendsRepositoryServiceInit, contextDep],
            preLogicTransformers: [function(userService, done) {
                entersMiddleware = true;

                expect(userService).to.have.property('createUser');
                expect(userService).to.have.property('userRepository');

                expect(userService.userRepository).to.have.property('addUser');
                expect(userService.userRepository).to.have.property('userFriendsRepository');

                expect(userService.userRepository.userFriendsRepository).to.have.property('addFriend');

                const contextDep = this.compiler.get('contextDep');

                expect(contextDep).to.be.a('object');
                expect(contextDep._$metadata).to.be.a('object');

                done();
            }],
        };

        const g = gabriela.asProcess(config);;

        g.addModule(mdl);

        return g.runModule('treeAsyncServiceDefinition').then(() => {
            expect(entersMiddleware).to.be.equal(true);
        });
    });

    it('should run all synchronous modules added to gabriela', (done) => {
        let userModuleExecuted = false;
        let appSearchModuleExecuted = false;
        let pdfConvertModuleExecuted = false;

        const userModuleName = 'userModule';
        const appSearchModuleName = 'appSearchModule';
        const pdfConvertModuleName = 'pdfConvertModuleName';

        const userModule = {
            name: userModuleName,
            moduleLogic: [function(state, next) {
                userModuleExecuted = true;

                state.name = userModuleName;

                next();
            }],
        };

        const appSearchModule = {
            name: appSearchModuleName,
            moduleLogic: [function(state, next) {
                appSearchModuleExecuted = true;

                state.name = appSearchModuleName;

                next();
            }],
        };

        const pdfConvertModule = {
            name: pdfConvertModuleName,
            moduleLogic: [function(state, next) {
                pdfConvertModuleExecuted = true;

                state.name = pdfConvertModuleName;

                next();
            }],
        };

        const app = gabriela.asProcess(config);;

        app.addModule(userModule);
        app.addModule(appSearchModule);
        app.addModule(pdfConvertModule);

        try {
            app.runModule().then((state) => {
                expect(userModuleExecuted).to.be.equal(true);
                expect(appSearchModuleExecuted).to.be.equal(true);
                expect(pdfConvertModuleExecuted).to.be.equal(true);

                expect(state).to.have.property(userModuleName);
                expect(state).to.have.property(appSearchModuleName);
                expect(state).to.have.property(pdfConvertModuleName);

                const userModuleState = state[userModuleName];
                const appSearchState = state[appSearchModuleName];
                const pdfConvertState = state[pdfConvertModuleName];

                expect(userModuleState).to.have.property('name');
                expect(appSearchState).to.have.property('name');
                expect(pdfConvertState).to.have.property('name');

                expect(userModuleState.name).to.be.equal(userModuleName);
                expect(appSearchState.name).to.be.equal(appSearchModuleName);
                expect(pdfConvertState.name).to.be.equal(pdfConvertModuleName);

                done();
            });
        } catch(err) {
            assert.fail(`Test failed with message: ${err.message}`);
        }
    });

    it('should run all asynchronous modules added to gabriela', (done) => {
        let userModuleExecuted = false;
        let appSearchModuleExecuted = false;
        let pdfConvertModuleExecuted = false;

        const userModuleName = 'userModule';
        const appSearchModuleName = 'appSearchModule';
        const pdfConvertModuleName = 'pdfConvertModuleName';

        const userModule = {
            name: userModuleName,
            moduleLogic: [function(state, next) {
                setTimeout(() => {
                    userModuleExecuted = true;

                    state.name = userModuleName;

                    next();
                }, 50);
            }],
        };

        const appSearchModule = {
            name: appSearchModuleName,
            moduleLogic: [function(state, next) {
                setTimeout(() => {
                    appSearchModuleExecuted = true;

                    state.name = appSearchModuleName;

                    next();
                }, 50);
            }],
        };

        const pdfConvertModule = {
            name: pdfConvertModuleName,
            moduleLogic: [function(state, next) {
                setTimeout(() => {
                    pdfConvertModuleExecuted = true;

                    state.name = pdfConvertModuleName;

                    next();
                }, 50);
            }],
        };

        const app = gabriela.asProcess(config);;

        app.addModule(userModule);
        app.addModule(appSearchModule);
        app.addModule(pdfConvertModule);

        try {
            app.runModule().then((state) => {
                expect(userModuleExecuted).to.be.equal(true);
                expect(appSearchModuleExecuted).to.be.equal(true);
                expect(pdfConvertModuleExecuted).to.be.equal(true);

                expect(state).to.have.property(userModuleName);
                expect(state).to.have.property(appSearchModuleName);
                expect(state).to.have.property(pdfConvertModuleName);

                const userModuleState = state[userModuleName];
                const appSearchState = state[appSearchModuleName];
                const pdfConvertState = state[pdfConvertModuleName];

                expect(userModuleState).to.have.property('name');
                expect(appSearchState).to.have.property('name');
                expect(pdfConvertState).to.have.property('name');

                expect(userModuleState.name).to.be.equal(userModuleName);
                expect(appSearchState.name).to.be.equal(appSearchModuleName);
                expect(pdfConvertState.name).to.be.equal(pdfConvertModuleName);

                done();
            });
        } catch(err) {
            assert.fail(`Test failed with message: ${err.message}`);
        }
    });

    it('should override the modules middleware', () => {
        let entersOriginalLogic1 = false;
        let entersOverridenLogic1 = false;
        let entersLogic2 = false;

        const userModule = {
            name: 'overrideUserModule',
            moduleLogic: [{
                name: 'logic1',
                middleware: function(next) {
                    setTimeout(() => {
                        entersOriginalLogic1 = true;

                        next();
                    }, 50);
                }
            }],
        };

        const g = gabriela.asProcess(config);;

        g.addModule(userModule);

        g.overrideModule({
            name: 'overrideUserModule',
            moduleLogic: [{
                name: 'logic1',
                middleware: function(next) {
                    setTimeout(() => {
                        entersOverridenLogic1 = true;

                        next();
                    }, 50);
                }
            }, {
                name: 'logic2',
                middleware: function(next) {
                    setTimeout(() => {
                        entersLogic2 = true;

                        next();
                    }, 50);
                }
            }]
        });

        return g.runModule().then(() => {
            expect(entersOverridenLogic1).to.be.equal(true);
            expect(entersLogic2).to.be.equal(true);
            expect(entersOriginalLogic1).to.be.equal(false);
        });
    });

    it('should not execute a disabled middleware', (done) => {
        let transformer1Enters = false;
        let transformer2Enters = false;
        let logic1Enters = false;

        const userModule = {
            name: 'name',
            preLogicTransformers: [{
                name: 'transformer1',
                disabled: true,
                middleware: function(next) {
                    transformer1Enters = true;

                    next();
                }
            }, {
                name: 'transformer2',
                middleware: function(next) {
                    transformer2Enters = true;

                    next();
                }
            }],
            moduleLogic: [{
                name: 'logic1',
                middleware: function(next) {
                    logic1Enters = true;

                    next();
                }
            }],
        };

        const g = gabriela.asProcess(config);;

        g.addModule(userModule);

        g.runModule().then(() => {
            expect(transformer1Enters).to.be.equal(false);
            expect(transformer2Enters).to.be.equal(true);
            expect(logic1Enters).to.be.equal(true);

            done();
        });
    });

    it('should execute plain and definition middleware', (done) => {
        let preLogicPlain = false;
        let preLogicDefinition = false;
        let moduleLogicPlain = false;
        let moduleLogicDefinition = false;

        const userModule = {
            name: 'userModule',
            preLogicTransformers: [function(next) {
                preLogicPlain = true;

                next();
            }, {
                name: 'name1',
                disabled: false,
                middleware: function(next) {
                    preLogicDefinition = true;

                    next();
                }
            }],
            moduleLogic: [function(next) {
                moduleLogicPlain = true;

                next();
            }, {
                name: 'modulePlain',
                middleware: function(next) {
                    moduleLogicDefinition = true;

                    next();
                }
            }]
        };

        const g = gabriela.asProcess(config);;

        g.addModule(userModule);

        g.runModule().then(() => {
            expect(preLogicPlain).to.be.equal(true);
            expect(preLogicDefinition).to.be.equal(true);
            expect(moduleLogicPlain).to.be.equal(true);
            expect(moduleLogicDefinition).to.be.equal(true);

            done();
        });
    });

    it('should throw an exception inside a service of another dependency (two levels) inside a compiler pass', (done) => {
        let moduleLogicCalled = false;

        const userService = {
            name: 'UserService',
            init: function(UserRepository) {
                return {};
            }
        };

        const initDefinition = {
            name: 'init',
            compilerPass: {
                init: function(config, compiler) {
                    compiler.add({
                        name: 'UserRepository',
                        scope: 'public',
                        init(throwException) {
                            return throwException(new Error('Error in UserRepository'));

                        }
                    });
                }
            },
            init: function() {
                return {};
            }
        };

        const initModule = {
            name: 'initModule',
            dependencies: [initDefinition],
        };

        const workingModule = {
            name: 'workingModule',
            dependencies: [userService],
            moduleLogic: [function(UserService) {
                moduleLogicCalled = true;

                expect(UserService).to.be.a('object');
            }],
        };

        const app = gabriela.asServer({config: {framework: {}}}, [], {
            events: {
                catchError(e) {
                    this.gabriela.close();

                    expect(e.message).to.be.equal('Error in UserRepository');

                    done();
                }
            }
        });

        app.addModule(initModule);
        app.addModule(workingModule);

        app.startApp();
    });

    it('should throw an exception inside a service of another dependency (two levels) inside a compiler pass when calling compiler.get()', (done) => {
        let moduleLogicCalled = false;

        const contextDep = {
            name: 'ContextDep',
            init: function(UserRepository) {
                return {};
            }
        };

        const initDefinition = {
            name: 'init',
            compilerPass: {
                init: function(config, compiler) {
                    compiler.add({
                        name: 'UserRepository',
                        scope: 'public',
                        init(throwException) {
                            return throwException(new Error('Error in UserRepository'));

                        }
                    });
                }
            },
            init: function() {
                return {};
            }
        };

        const initModule = {
            name: 'initModule',
            dependencies: [initDefinition, contextDep],
        };

        const workingModule = {
            name: 'workingModule',
            dependencies: [contextDep],
            moduleLogic: [function() {
                moduleLogicCalled = true;

                this.compiler.get('ContextDep');
            }],
        };

        const app = gabriela.asServer({config: {framework: {}}}, [], {
            events: {
                catchError(e) {
                    this.gabriela.close();

                    expect(e.message).to.be.equal('Error in UserRepository');

                    done();
                }
            }
        });

        app.addModule(initModule);
        app.addModule(workingModule);

        app.startApp();
    });

    it('should throw an exception inside an async service of another dependency (two levels) inside a compiler pass', (done) => {
        let moduleLogicCalled = false;

        const userService = {
            name: 'UserService',
            init: function(UserRepository) {
                return {};
            }
        };

        const initDefinition = {
            name: 'init',
            compilerPass: {
                init: function(config, compiler) {
                    compiler.add({
                        name: 'UserRepository',
                        isAsync: true,
                        scope: 'public',
                        init(throwException) {
                            return throwException(new Error('Error in UserRepository'));
                        }
                    });
                }
            },
            init: function() {
                return {};
            }
        };

        const initModule = {
            name: 'initModule',
            dependencies: [initDefinition]
        };

        const workingModule = {
            name: 'workingModule',
            dependencies: [userService],
            moduleLogic: [function(UserService) {
                moduleLogicCalled = true;

                expect(UserService).to.be.a('object');
            }],
        };

        const app = gabriela.asServer({config: {framework: {}}}, [],{
            events: {
                catchError(e) {
                    this.gabriela.close();

                    expect(e.message).to.be.equal('Error in UserRepository');

                    done();
                }
            }
        });

        app.addModule(initModule);
        app.addModule(workingModule);

        app.startApp();
    });
});