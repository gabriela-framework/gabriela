const mocha = require('mocha');
const chai = require('chai');
const requestPromise = require('request-promise');

const it = mocha.it;
const describe = mocha.describe;
const expect = chai.expect;

const gabriela = require('../../gabriela/gabriela');

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

        let entersMiddleware = false;
        const mdl = {
            name: 'name',
            dependencies: [userServiceInit, userRepositoryServiceInit, userFriendsRepositoryServiceInit],
            preLogicTransformers: [function(userService, done) {
                entersMiddleware = true;

                expect(userService).to.have.property('createUser');
                expect(userService).to.have.property('userRepository');

                expect(userService.userRepository).to.have.property('addUser');
                expect(userService.userRepository).to.have.property('userFriendsRepository');

                expect(userService.userRepository.userFriendsRepository).to.have.property('addFriend');

                done();
            }],
        };

        const g = gabriela.asRunner();

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

                requestPromise.get('https://www.google.com').then(() => {
                    next(() => {
                        return new UserService();
                    });
                });
            },
        };

        let entersMiddleware = false;
        const mdl = {
            name: 'asyncModuleName',
            dependencies: [userServiceInit],
            preLogicTransformers: [function(userService, done) {
                entersMiddleware = true;

                expect(userService).to.be.a('object');
                expect(userService).to.have.property('addUser');
                expect(userService).to.have.property('removeUser');

                done();
            }],
        };

        const g = gabriela.asRunner();

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

                requestPromise.get('https://www.google.com').then(() => {

                next(() => {
                        return new FriendsRepository();
                    });
                });
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

                requestPromise.get('https://www.google.com').then(() => {
                    next(() => {
                        return new UserRepository();
                    });
                });
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

                requestPromise.get('https://www.google.com').then(() => {
                    next(() => {
                        return new UserService();
                    });
                });
            }
        };

        let entersMiddleware = false;
        const mdl = {
            name: 'treeAsyncServiceDefinition',
            dependencies: [userServiceInit, userRepositoryServiceInit, userFriendsRepositoryServiceInit],
            preLogicTransformers: [function(userService, done) {
                entersMiddleware = true;

                expect(userService).to.have.property('createUser');
                expect(userService).to.have.property('userRepository');

                expect(userService.userRepository).to.have.property('addUser');
                expect(userService.userRepository).to.have.property('userFriendsRepository');

                expect(userService.userRepository.userFriendsRepository).to.have.property('addFriend');

                done();
            }],
        };

        const g = gabriela.asRunner();

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

        const app = gabriela.asRunner();

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
                requestPromise.get('https://google.com').then(() => {
                    userModuleExecuted = true;

                    state.name = userModuleName;

                    next();
                });
            }],
        };

        const appSearchModule = {
            name: appSearchModuleName,
            moduleLogic: [function(state, next) {
                requestPromise.get('https://google.com').then(() => {
                    appSearchModuleExecuted = true;

                    state.name = appSearchModuleName;

                    next();
                });
            }],
        };

        const pdfConvertModule = {
            name: pdfConvertModuleName,
            moduleLogic: [function(state, next) {
                requestPromise.get('https://google.com').then(() => {

                    pdfConvertModuleExecuted = true;

                    state.name = pdfConvertModuleName;

                    next();
                });
            }],
        };

        const app = gabriela.asRunner();

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
            name: 'userModule',
            moduleLogic: [{
                name: 'logic1',
                middleware: function(next) {
                    requestPromise.get('https://google.com').then(() => {
                        entersOriginalLogic1 = true;

                        next();
                    });
                }
            }],
        };

        const g = gabriela.asRunner();

        g.addModule(userModule);

        g.overrideModule({
            name: 'userModule',
            moduleLogic: [{
                name: 'logic1',
                middleware: function(next) {
                    requestPromise.get('https://google.com').then(() => {
                        entersOverridenLogic1 = true;

                        next();
                    });
                }
            }, {
                name: 'logic2',
                middleware: function(next) {
                    requestPromise.get('https://google.com').then(() => {
                        entersLogic2 = true;

                        next();
                    });
                }
            }]
        });

        g.runModule().then(() => {
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

        const g = gabriela.asRunner();

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

        const g = gabriela.asRunner();

        g.addModule(userModule);

        g.runModule().then(() => {
            expect(preLogicPlain).to.be.equal(true);
            expect(preLogicDefinition).to.be.equal(true);
            expect(moduleLogicPlain).to.be.equal(true);
            expect(moduleLogicDefinition).to.be.equal(true);

            done();
        });
    });
});