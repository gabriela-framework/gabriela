const mocha = require('mocha');
const chai = require('chai');
const assert = require('assert');

const it = mocha.it;
const xit = mocha.xit;
const describe = mocha.describe;
const expect = chai.expect;
const moduleExecuteFactory = require('../../src/gabriela/module/executeFactory');
const pluginExecuteFactory = require('../../src/gabriela/plugin/executeFactory');

const gabriela = require('../../src/gabriela/gabriela');

describe('Gabriela as process tests', () => {
    it('should create a gabriela process instance and run it', (done) => {
        const g = gabriela.asProcess();

        g.startApp().then(() => {
            done();
        });
    });

    it('should run the onAppStarted event when using gabriela as process', (done) => {
        const g = gabriela.asProcess({
            events: {
                onAppStarted() {
                    eventCalled = true;
                }
            }
        });
        let eventCalled = false;

        g.startApp().then(() => {
            expect(eventCalled).to.be.equal(true);

            done();
        });
    });

    it('should execute all the middleware in specific order', (done) => {
        let preLogicTransformerExecuted = false,
            secondPreLogicExecuted = false,
            validatorsExecuted = false,
            moduleLogicExecuted = false,
            init1Executed = false,
            init2Executed = false,
            init3Executed = false,
            postLogicTransformersExecuted = false;

        const name = 'allMiddlewareExecution';

        const mdl = {
            name: name,
            init: [
                {
                    name: 'init1',
                    middleware: function(next) {
                        init1Executed = true;

                        expect(init2Executed).to.be.equal(false);
                        expect(init3Executed).to.be.equal(false);
                        expect(secondPreLogicExecuted).to.be.equal(false);
                        expect(preLogicTransformerExecuted).to.be.equal(false);
                        expect(validatorsExecuted).to.be.equal(false);
                        expect(moduleLogicExecuted).to.be.equal(false);
                        expect(postLogicTransformersExecuted).to.be.equal(false);

                        next();
                    }
                },
                {
                    name: 'init2',
                    middleware: function(next) {
                        init2Executed = true;

                        expect(init1Executed).to.be.equal(true);
                        expect(init3Executed).to.be.equal(false);
                        expect(secondPreLogicExecuted).to.be.equal(false);
                        expect(preLogicTransformerExecuted).to.be.equal(false);
                        expect(validatorsExecuted).to.be.equal(false);
                        expect(moduleLogicExecuted).to.be.equal(false);
                        expect(postLogicTransformersExecuted).to.be.equal(false);

                        next();
                    }
                },
                function(next) {
                    init3Executed = true;

                    expect(init1Executed).to.be.equal(true);
                    expect(init2Executed).to.be.equal(true);
                    expect(secondPreLogicExecuted).to.be.equal(false);
                    expect(preLogicTransformerExecuted).to.be.equal(false);
                    expect(validatorsExecuted).to.be.equal(false);
                    expect(moduleLogicExecuted).to.be.equal(false);
                    expect(postLogicTransformersExecuted).to.be.equal(false);

                    next();
                }],
            preLogicTransformers: [{
                name: 'name',
                middleware: function(next) {
                    preLogicTransformerExecuted = true;

                    next();
                }
            }, {
                name: 'other',
                middleware: function(next) {
                    setTimeout(() => {
                        secondPreLogicExecuted = true;

                        next();
                    }, 50);
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

        const g = gabriela.asProcess({
            events: {
                onAppStarted() {
                    expect(init1Executed).to.be.equal(true);
                    expect(init2Executed).to.be.equal(true);
                    expect(init3Executed).to.be.equal(true);
                    expect(secondPreLogicExecuted).to.be.equal(true);
                    expect(preLogicTransformerExecuted).to.be.equal(true);
                    expect(validatorsExecuted).to.be.equal(true);
                    expect(moduleLogicExecuted).to.be.equal(true);
                    expect(postLogicTransformersExecuted).to.be.equal(true);

                    done();
                }
            }
        });

        g.addModule(mdl);

        g.startApp();
    });

    it('should run all middleware withing a standalone module and plugin(s) plus an onAppStarted event', (done) => {
        let eventCalled = false;
        let mdl1Called = false;
        let mdl2Called = false;
        let standaloneModuleCalled = false;

        const mdl1 = {
            name: 'mdl1',
            moduleLogic: [function() {
                mdl1Called = true;
            }],
        };

        const mdl2 = {
            name: 'mdl2',
            moduleLogic: [function() {
                mdl2Called = true;
            }],
        };

        const standaloneModule = {
            name: 'standaloneModule',
            moduleLogic: [function() {
                standaloneModuleCalled = true;
            }],
        };

        const plugin = {
            name: 'plugin1',
            modules: [mdl1, mdl2],
        };

        const g = gabriela.asProcess({
            events: {
                onAppStarted() {
                    eventCalled = true;
                }
            }
        });

        g.addPlugin(plugin);
        g.addModule(standaloneModule);

        g.startApp().then(() => {
            expect(eventCalled).to.be.equal(true);
            expect(mdl1Called).to.be.equal(true);
            expect(mdl2Called).to.be.equal(true);
            expect(standaloneModuleCalled).to.be.equal(true);

            done();
        });
    });

    it('should create a module and treat it as a collection', () => {
        const name = 'moduleName';
        const mdl = {
            name: name,
            preLogicTransformers: [function() {}, function() {}],
            validators: [function() {}],
            moduleLogic: [function() {}, function() {}, function() {}],
        };

        const g = gabriela.asProcess();

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

    it('should shuffle removing and adding new modules without problems', (done) => {
        let firstEntered = false;
        let secondEntered = false;

        const mdl = {
            name: 'name',
            moduleLogic: [function() {
                firstEntered = true;
            }],
        };

        const mdl2 = {
            name: 'mdl2',
            moduleLogic: [function() {
                secondEntered = true;
            }]
        };

        const g = gabriela.asProcess({
            events: {
                onAppStarted() {
                    expect(firstEntered).to.be.equal(false);
                    expect(secondEntered).to.be.equal(true);

                    done();
                }
            }
        });

        g.addModule(mdl);
        g.addModule(mdl2);

        g.removeModule('name');

        g.startApp();
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

        const g = gabriela.asProcess({
            events: {
                onAppStarted() {
                    expect(preLogicTransformerExecuted).to.be.equal(true);
                    expect(validatorsExecuted).to.be.equal(true);
                    expect(moduleLogicExecuted).to.be.equal(true);
                    expect(postLogicTransformersExecuted).to.be.equal(true);
                }
            }
        });

        g.addModule(mdl);

        g.startApp();
    });

    it('should assert that all middleware is executed', (done) => {
        let preLogicTransformerExecuted = false,
            validatorsExecuted = false,
            initLogicExecuted = false,
            moduleLogicExecuted = false,
            securityLogicExecuted = false,
            postLogicTransformersExecuted = false;

        const name = 'allMiddlewareExecution';

        const mdl = {
            name: name,
            init: [function(next) {
                initLogicExecuted = true;

                next();
            }],
            security: [function(next) {
                securityLogicExecuted = true;

                next();
            }],
            validators: [function(next) {
                validatorsExecuted = true;

                next();
            }],
            preLogicTransformers: [function(next) {
                preLogicTransformerExecuted = true;

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

        const g = gabriela.asProcess({
            events: {
                onAppStarted() {
                    expect(securityLogicExecuted).to.be.equal(true);
                    expect(initLogicExecuted).to.be.equal(true);
                    expect(preLogicTransformerExecuted).to.be.equal(true);
                    expect(validatorsExecuted).to.be.equal(true);
                    expect(moduleLogicExecuted).to.be.equal(true);
                    expect(postLogicTransformersExecuted).to.be.equal(true);

                    done();
                }
            }
        });

        g.addModule(mdl);

        g.startApp();
    });

    it('should assert that all middleware created with middleware definition object is executed', (done) => {
        let preLogicTransformerExecuted = false,
            secondPreLogicExecuted = false,
            validatorsExecuted = false,
            moduleLogicExecuted = false,
            init1Executed = false,
            init2Executed = false,
            init3Executed = false,
            postLogicTransformersExecuted = false;

        const name = 'allMiddlewareExecution';

        const mdl = {
            name: name,
            init: [
                {
                    name: 'init1',
                    middleware: function(next) {
                        init1Executed = true;

                        next();
                    }
                },
                {
                    name: 'init2',
                    middleware: function(next) {
                        init2Executed = true;

                        next();
                    }
                },
            function(next) {
                init3Executed = true;

                next();
            }],
            preLogicTransformers: [{
                name: 'name',
                middleware: function(next) {
                    preLogicTransformerExecuted = true;

                    next();
                }
            }, {
                name: 'other',
                middleware: function(next) {
                    setTimeout(() => {
                        secondPreLogicExecuted = true;

                        next();
                    }, 50);
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

        const g = gabriela.asProcess({
            events: {
                onAppStarted() {
                    expect(init1Executed).to.be.equal(true);
                    expect(init2Executed).to.be.equal(true);
                    expect(init3Executed).to.be.equal(true);
                    expect(secondPreLogicExecuted).to.be.equal(true);
                    expect(preLogicTransformerExecuted).to.be.equal(true);
                    expect(validatorsExecuted).to.be.equal(true);
                    expect(moduleLogicExecuted).to.be.equal(true);
                    expect(postLogicTransformersExecuted).to.be.equal(true);

                    done();
                }
            }
        });

        g.addModule(mdl);

        g.startApp();
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

        const g = gabriela.asProcess({
            events: {
                onAppStarted() {
                    done();
                }
            }
        });

        g.addModule(mdl);

        g.startApp();
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

        const g = gabriela.asProcess({
            events: {
                onAppStarted() {
                    done();
                }
            }
        });

        g.addModule(mdl);

        g.startApp();
    });

    it('should assert that preLogicTransformers create and modify the model', (done) => {
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

        const g = gabriela.asProcess({
            events: {
                onAppStarted() {
                    done();
                }
            }
        });

        g.addModule(mdl);

        g.startApp();
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
            init: [modelCreationTransformer],
            validators: [ageValidator],
            moduleLogic: [],
        };

        const g = gabriela.asProcess({
            events: {
                catchError(err) {
                    expect(err.message).to.be.equal('Invalid models age');

                }
            }
        });

        g.addModule(mdl);

        g.startApp();
    });

    it('should assert that the main logic execution is executed', function(done) {
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

        const g = gabriela.asProcess({
            events: {
                onAppStarted() {
                    done();
                }
            }
        });

        g.addModule(mdl);

        g.startApp();
    });

    it('should catch an exception thrown inside the middleware function', (done) => {
        const throwsException = function(state, next, skip, done, throwException) {
            throwException(new Error('my exception'));
        };

        const mdl = {
            name: 'name',
            preLogicTransformers: [throwsException],
        };

        const g = gabriela.asProcess({
            events: {
                catchError(err) {
                    expect(err.message).to.be.equal('my exception');

                    done();
                }
            }
        });

        g.addModule(mdl);

        g.startApp();
    });

    it('should catch an error when error is thrown inside onAppStarted event', (done) => {
        const g = gabriela.asProcess({
            events: {
                onAppStarted() {
                    throw new Error('Something went wrong in onAppStarted');
                },
                catchError(e) {
                    expect(e.message).to.be.equal("An error has been thrown in 'onAppStarted' gabriela event with message: 'Something went wrong in onAppStarted'. This is regarded as an unrecoverable error and the server has closed");

                    done();
                }
            }
        });

        let moduleCalled = false;

        const mdl = {
            name: 'mdl',
            moduleLogic: [function() {
                moduleCalled = true;
            }],
        };

        g.addPlugin({
            name: 'plugin',
            modules: [mdl],
        });

        g.startApp();
    });

    it('should explore the possibility of a true and proper layered architecture (or onion architecture)', (done) => {
        const presentationLayerDefinition = {
            name: 'presentationLayerService',
            shared: {
                plugins: ['presentationLayer', 'logicLayer']
            },
            init: function() {
                function PresentationLayer() {}

                return new PresentationLayer();
            }
        };

        const logicLayerDefinition = {
            name: 'logicLayerService',
            shared: {
                plugins: ['logicLayer']
            },
            init: function() {
                function LogicLayer() {}

                return new LogicLayer();
            }
        };

        const dataSourceLayer = {
            name: 'dataSourceLayerService',
            shared: {
                plugins: ['dataSourceLayer', 'logicLayer'],
            },
            init: function() {
                function DataSourceLayer() {}

                return new DataSourceLayer();
            }
        };

        const dependencyInitModule = {
            name: 'dependencyInitModule',
            dependencies: [presentationLayerDefinition, logicLayerDefinition, dataSourceLayer],
            // only for it to be executed
            moduleLogic: [function() {

            }],
        };

        const presentationModule1 = {
            name: 'presentationModule1',
            moduleLogic: [function(presentationLayerService /** logicLayerService and dataSourceLayerService will not resolve */) {

            }],
        };

        const logicModule1 = {
            name: 'logicModule1',
            moduleLogic: [function(logicLayerService, dataSourceLayerService, presentationLayerService) {

            }],
        };

        const dataSourceModule1 = {
            name: 'dataSourceModule1',
            moduleLogic: [function(dataSourceLayerService /** logicLayerService and presentationLayerService will not resolve */) {

            }],
        };

        const app = gabriela.asProcess({
            events: {
                onAppStarted() {
                    done();
                }
            }
        });

        const presentationLayerPlugin = {
            name: 'presentationLayer',
            modules: [presentationModule1],
        };

        const logicLayerPlugin = {
            name: 'logicLayer',
            modules: [logicModule1],
        };

        const dataSourcePlugin = {
            name: 'dataSourceLayer',
            modules: [dataSourceModule1],
        };

        app.addPlugin(presentationLayerPlugin);
        app.addPlugin(logicLayerPlugin);
        app.addPlugin(dataSourcePlugin);

        app.addModule(dependencyInitModule);

        app.startApp();
    });
});
