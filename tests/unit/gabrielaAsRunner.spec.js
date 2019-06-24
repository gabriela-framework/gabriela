const mocha = require('mocha');
const chai = require('chai');
const assert = require('assert');
const requestPromise = require('request-promise');

const it = mocha.it;
const xit = mocha.xit;
const describe = mocha.describe;
const expect = chai.expect;

const gabriela = require('../../gabriela/gabriela');

describe('Gabriela runner module tests', () => {
    it('should create a module and treat it as a collection', () => {
        const name = 'moduleName';
        const mdl = {
            name: name,
            preLogicTransformers: [function() {}, function() {}],
            validators: [function() {}],
            moduleLogic: [function() {}, function() {}, function() {}],
        };

        const g = gabriela.asRunner();

        g.addModule(mdl);

        expect(g.hasModule(name)).to.be.equal(true);
        expect(g.getModule(name)).to.be.a('object');

        mdl.name = 'someOtherName';

        const immutableModule = g.getModule(name);

        expect(immutableModule.name).to.be.equal(name);

        expect(immutableModule.preLogicTransformers).to.be.a('array');
        expect(immutableModule.validators).to.be.a('array');
        expect(immutableModule.moduleLogic).to.be.a('array');

        expect(immutableModule.preLogicTransformers.length).to.be.equal(2);
        
        for (const t of immutableModule.preLogicTransformers) {
            expect(t).to.be.a('function');
        }

        expect(immutableModule.validators.length).to.be.equal(1);
        
        for (const t of immutableModule.validators) {
            expect(t).to.be.a('function');
        }

        expect(immutableModule.moduleLogic.length).to.be.equal(3);
        
        for (const t of immutableModule.moduleLogic) {
            expect(t).to.be.a('function');
        }

        expect(g.removeModule(name)).to.be.equal(true);

        expect(g.hasModule(name)).to.be.false;
        expect(g.getModule(name)).to.be.a('undefined');
    });

    it('should assert that there is not need to wait for async flow functions if they are not present as arguments', () => {
        let preLogicTransformerExecuted = false,
            validatorsExecuted = false,
            moduleLogicExecuted = false,
            postLogicTransformersExecuted = false;

        const name = 'allMiddlewareExecution';

        const mdl = {
            name: name,
            preLogicTransformers: [function() {
                preLogicTransformerExecuted = true;
            }],
            validators: [function() {
                validatorsExecuted = true;
            }],
            moduleLogic: [function() {
                moduleLogicExecuted = true;
            }],
            postLogicTransformers: [function() {
                postLogicTransformersExecuted = true;
            }],
        };

        const g = gabriela.asRunner();

        g.addModule(mdl);

        g.runModule(name).then(() => {
            expect(preLogicTransformerExecuted).to.be.equal(true);
            expect(validatorsExecuted).to.be.equal(true);
            expect(moduleLogicExecuted).to.be.equal(true);
            expect(postLogicTransformersExecuted).to.be.equal(true);
        });
    });

    it('should assert that all middleware is executed', () => {
        let preLogicTransformerExecuted = false,
            validatorsExecuted = false,
            moduleLogicExecuted = false,
            postLogicTransformersExecuted = false;

        const name = 'allMiddlewareExecution';

        const mdl = {
            name: name,
            preLogicTransformers: [function(next) {
                preLogicTransformerExecuted = true;

                next();
            }],
            validators: [function(next) {
                validatorsExecuted = true;

                next();
            }],
            moduleLogic: [function(next) {
                moduleLogicExecuted = true;

                next();
            }],
            postLogicTransformers: [function(next) {
                postLogicTransformersExecuted = true;

                next();
            }],
        };

        const g = gabriela.asRunner();

        g.addModule(mdl);

        g.runModule(name).then(() => {
            expect(preLogicTransformerExecuted).to.be.equal(true);
            expect(validatorsExecuted).to.be.equal(true);
            expect(moduleLogicExecuted).to.be.equal(true);
            expect(postLogicTransformersExecuted).to.be.equal(true);
        });
    });

    it('should assert that all middleware created with middleware definition object is executed', () => {
        let preLogicTransformerExecuted = false,
            secondPreLogicExecuted = false,
            validatorsExecuted = false,
            moduleLogicExecuted = false,
            postLogicTransformersExecuted = false;

        const name = 'allMiddlewareExecution';

        const mdl = {
            name: name,
            preLogicTransformers: [{
                name: 'name',
                middleware: function(next) {
                    preLogicTransformerExecuted = true;

                    next();
                }
            }, {
                name: 'other',
                middleware: function(next) {
                    requestPromise.get('https://google.com').then(() => {
                        secondPreLogicExecuted = true;

                        next();
                    });
                }
            }],
            validators: [{
                name: 'name',
                middleware: function(next) {
                    validatorsExecuted = true;

                    next();
                },
            }],
            moduleLogic: [function(next) {
                moduleLogicExecuted = true;

                next();
            }],
            postLogicTransformers: [function(next) {
                postLogicTransformersExecuted = true;

                next();
            }],
        };

        const g = gabriela.asRunner();

        g.addModule(mdl);

        g.runModule(name).then(() => {
            expect(secondPreLogicExecuted).to.be.equal(true);
            expect(preLogicTransformerExecuted).to.be.equal(true);
            expect(validatorsExecuted).to.be.equal(true);
            expect(moduleLogicExecuted).to.be.equal(true);
            expect(postLogicTransformersExecuted).to.be.equal(true);
        });
    });

    it('should assert that skip skips the single middleware and not all', (done) => {
        const name = 'moduleName';
        const model = {
            name: 'name',
            lastName: 'lastName',
            age: 32
        };

        const modelCreationTransformer = function(state, next) {
            state.model = model;

            next();
        };

        const ageTransformer = function(state, next, skip) {
            return skip();
        };

        const addOption1Property = function(state, next) {
            state.model.option1 = true;

            next();
        };

        const addOption2Property = function(state, next) {
            state.model.option2 = true;

            next();
        };

        const moduleLogic = function(state, next) {
            state.model.executed = true;

            next();
        };

        const mdl = {
            name: name,
            preLogicTransformers: [modelCreationTransformer, ageTransformer, addOption1Property, addOption2Property],
            validators: [],
            moduleLogic: [moduleLogic],
        };

        const g = gabriela.asRunner();

        g.addModule(mdl);

        g.runModule(mdl.name)
        .then((moduleResult) => {
            expect(moduleResult.model.name).to.be.equal(model.name);
            expect(moduleResult.model.lastName).to.be.equal(model.lastName);
            expect(moduleResult.model.age).to.be.equal(32);
            expect(moduleResult.model.executed).to.be.equal(true);

            done();
        });
    });

    it('should assert that done skips all middleware and not just the currently executing', (done) => {
        const name = 'moduleName';
        const model = {
            name: 'name',
            lastName: 'lastName',
            age: 32
        };

        const modelCreationTransformer = function(state, next, skip, done) {
            state.model = model;

            done();
        };

        const ageTransformer = function(state, next, skip) {
            return skip();
        };

        const addOption1Property = function(state, next) {
            state.model.option1 = true;

            next();
        };

        const addOption2Property = function(state, next) {
            state.model.option2 = true;

            next();
        };

        const moduleLogic = function(state, next) {
            state.model.executed = true;

            next();
        };

        const mdl = {
            name: name,
            preLogicTransformers: [modelCreationTransformer, ageTransformer, addOption1Property, addOption2Property],
            validators: [],
            moduleLogic: [moduleLogic],
        };

        const g = gabriela.asRunner();

        g.addModule(mdl);

        g.runModule(mdl.name).then((moduleResult) => {
            expect(moduleResult.model.name).to.be.equal(model.name);
            expect(moduleResult.model.lastName).to.be.equal(model.lastName);
            expect(moduleResult.model.age).to.be.equal(32);
            expect(moduleResult.model).to.not.have.property('executed');
            expect(moduleResult.model).to.not.have.property('option1');
            expect(moduleResult.model).to.not.have.property('option2');

            done();
        });
    });

    it('should assert that preLogicTransformers create and modify the model', () => {
        const name = 'moduleName';
        const model = {
            name: 'name',
            lastName: 'lastName',
            age: 32
        };

        const modelCreationTransformer = function(state, next) {
            state.model = model;

            next();
        };

        const ageTransformer = function(state, next) {
            state.model.age = 25;

            next();
        };

        const mdl = {
            name: name,
            preLogicTransformers: [modelCreationTransformer, ageTransformer],
            validators: [],
            moduleLogic: [],
        };

        const g = gabriela.asRunner();

        g.addModule(mdl);

        g.runModule(mdl.name).then((moduleResult) => {
            expect(moduleResult.model.name).to.be.equal(model.name);
            expect(moduleResult.model.lastName).to.be.equal(model.lastName);
            expect(moduleResult.model.age).to.be.equal(25);
        });
    });

    it('should assert that validators validate the model', () => {
        const name = 'moduleName';
        const model = {
            name: 'name',
            lastName: 'lastName',
            age: 32
        };

        const modelCreationTransformer = function(state, next) {
            state.model = model;

            next();
        };

        const ageValidator = function(state, next) {
            if (state.model.age > 25) {
                throw new Error('Invalid models age');
            }

            return next();
        };

        const mdl = {
            name: name,
            preLogicTransformers: [modelCreationTransformer],
            validators: [ageValidator],
            moduleLogic: [],
        };

        const g = gabriela.asRunner();

        g.addModule(mdl);

        g.runModule(mdl.name).then(() => assert.fail('This test should be an error')).catch((err) => {
            expect(err.message).to.be.equal('Invalid models age');
        });
    });

    it('should assert that the main logic execution is executed', function() {
        const name = 'moduleName';
        const model = {
            name: 'name',
            lastName: 'lastName',
            age: 32
        };

        const modelCreationTransformer = function(state, next) {
            state.model = model;

            next();
        };

        const logicExec = function(state, next) {
            state.model.executed = true;

            next();
        };

        const mdl = {
            name: name,
            preLogicTransformers: [modelCreationTransformer],
            validators: [],
            moduleLogic: [logicExec],
        };

        const g = gabriela.asRunner();

        g.addModule(mdl);

        g.runModule(mdl.name).then((moduleResult) => {
            expect(moduleResult.model.name).to.be.equal(model.name);
            expect(moduleResult.model.lastName).to.be.equal(model.lastName);
            expect(moduleResult.model.age).to.be.equal(32);
            expect(moduleResult.model).to.have.property('executed');
            expect(moduleResult.model.executed).to.be.equal(true);
        });
    });

    it('should catch an exception thrown inside the middleware function', (done) => {
        const throwsException = function(state, next, skip, done, throwException) {
            throwException(new Error('my exception'));
        };

        const mdl = {
            name: 'name',
            preLogicTransformers: [throwsException],
        };

        const g = gabriela.asRunner();

        g.addModule(mdl);

        g.runModule(mdl.name).catch((err) => {
            expect(err.message).to.be.equal('my exception');

            done();
        })
    });
});

describe('Module dependency injection tests', () => {
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

        g.runModule('name');

        expect(entersMiddleware).to.be.equal(true);
    });

    it('should resolve a single module dependency with async function inside, synchronously', () => {
        const userServiceInit = {
            name: 'userService',
            scope: 'module',
            isAsync: true,
            init: function(next) {
                function constructor() {
                    this.addUser = null;
                    this.removeUser = null;
                }

                requestPromise.get('https://www.google.com').then(() => {
                    next(() => {
                        return new constructor();
                    });
                });
            }
        };

        let entersMiddleware = false;
        const mdl = {
            name: 'name',
            dependencies: [userServiceInit],
            preLogicTransformers: [function(userService, done) {
                entersMiddleware = true;

                expect(userService).to.have.property('addUser');
                expect(userService).to.have.property('removeUser');

                done();
            }],
        };

        const g = gabriela.asRunner();

        g.addModule(mdl);

        g.runModule('name');

        expect(entersMiddleware).to.be.equal(true);
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
                function constructor() {
                    this.createUser = null;
                    this.removeUser = null;

                    this.userRepository = userRepository;
                }

                requestPromise.get('https://www.google.com').then(() => {
                    next(() => {
                        return new constructor();
                    });
                });
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

        g.runModule('name');

        expect(entersMiddleware).to.be.equal(true);
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

describe('Plugin tests', () => {

});