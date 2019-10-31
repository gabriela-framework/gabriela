const mocha = require('mocha');
const chai = require('chai');

const it = mocha.it;
const describe = mocha.describe;
const expect = chai.expect;

const moduleFactory = require('../../src/gabriela/module/moduleFactory');
const pluginFactory = require('../../src/gabriela/plugin/pluginFactory');
const Compiler = require('../../src/gabriela/dependencyInjection/compiler');
const Mediator = require('../../src/gabriela/events/mediator');
const ExposedMediator = require('../../src/gabriela/events/exposedMediator');
const DefinitionBuilder = require('../../src/gabriela/module/dependencyInjection/_definitionBuilder');

describe('Test gabriela internals', () => {
    it('should properly call properties on a module object created by moduleFactory', () => {
        const allowedModuleProps = [
            'name',
            'init',
            'security',
            'preLogicTransformers',
            'postLogicTransformers',
            'validators',
            'moduleLogic',
            'compiler',
            'sharedCompiler',
            'plugin',
            'dependencies',
            'mediatorInstance',
            'emitterInstance',
            'mediator',
            'isInPlugin',
            'hasMediators',
            'hasEmitters',
            'emitter',
            'exposedMediator',
            'isHttp',
            'http',
            'getFullPath',
        ];

        const mdl = {
            name: 'name',
            security: [],
            http: {
                route: {
                    name: 'name',
                    method: 'get',
                    path: '/path',
                }
            },
            init: [],
            preLogicTransformers: [],
            postLogicTransformers: [],
            validators: [],
            moduleLogic: [],
            compiler: null,
            sharedCompiler: null,
            plugin: {
                name: 'plugin',
                http: {
                    route: '/base-route',
                }
            },
            dependencies: [],
            mediator: {
                onModuleStarted: () => {},
                onModuleFinished: () => {},
                onError: () => {},
            },
            emitter: {
                onRunJob: [function() {

                }, function() {

                }],
            }
        };

        const config = {};
        const rootCompiler = Compiler.create();
        const parentCompiler = Compiler.create();
        const sharedCompiler = Compiler.create();
        const exposedMediator = new ExposedMediator();

        const buildStageArgs = {
            mdl: mdl,
            config,
            rootCompiler,
            parentCompiler,
            sharedCompiler,
            exposedMediator,
        };

        const moduleObject = moduleFactory(buildStageArgs);

        const moduleObjectProps = Object.keys(moduleObject);

        // tests that the interface has not changed on test side and code side
        expect(allowedModuleProps).to.have.members(moduleObjectProps);

        expect(moduleObject.name).to.be.a('string');
        expect(moduleObject.security).to.be.a('array');
        expect(moduleObject.init).to.be.a('array');
        expect(moduleObject.preLogicTransformers).to.be.a('array');
        expect(moduleObject.postLogicTransformers).to.be.a('array');
        expect(moduleObject.validators).to.be.a('array');
        expect(moduleObject.moduleLogic).to.be.a('array');
        expect(moduleObject.compiler).to.be.a('object');
        expect(moduleObject.sharedCompiler).to.be.a('object');
        expect(moduleObject.plugin).to.have.property('name');
        expect(moduleObject.dependencies).to.be.a('array');
        expect(moduleObject.mediatorInstance).to.be.a('object');
        expect(moduleObject.emitterInstance).to.be.a('object');
        expect(moduleObject.hasMediators()).to.be.equal(true);
        expect(moduleObject.isInPlugin()).to.be.equal(true);
        expect(moduleObject.hasEmitters()).to.be.equal(true);
        expect(moduleObject.emitter).to.be.a('object');
        expect(moduleObject.exposedMediator).to.be.a('object');
        expect(moduleObject.isHttp).to.be.a('function');
        expect(moduleObject.getFullPath).to.be.a('function');
        expect(moduleObject.getFullPath()).to.be.equal('/base-route/path');
    });

    it('should properly call properties on a plugin object created with pluginFactory', () => {
        const pluginInterface = [
            'modules', 
            'name',
            'compiler', 
            'sharedCompiler',
            'hasModules',
            'hasMediators',
            'mediator',
            'mediatorInstance',
            'exposedMediators',
            'hasExposedMediators',
            'exposedMediator',
            'hasHttp',
            'http',
        ];

        const plugin = {
            name: 'name',
            modules: [],
            http: {}
        };

        const pluginModel = pluginFactory(
            plugin,
            null,
            Compiler.create(),
            Compiler.create(),
            new ExposedMediator(),
        );

        const pluginModelProps = Object.keys(pluginModel);

        expect(pluginModelProps).to.have.members(pluginInterface);

        expect(pluginModel).to.have.property('http');
        expect(pluginModel.http).to.be.a('object');
        expect(pluginModel).to.have.property('name', 'name');
        expect(pluginModel.modules).to.be.a('array');
        expect(pluginModel.compiler).to.be.a('object');
        expect(pluginModel.sharedCompiler).to.be.a('object');
        expect(pluginModel.hasMediators).to.be.a('function');
        expect(pluginModel.hasModules).to.be.a('function');
        expect(pluginModel.hasModules()).to.be.equal(false);
        expect(pluginModel.mediator).to.be.a('undefined');
        expect(pluginModel.exposedMediators).to.be.a('undefined');
        expect(pluginModel.mediatorInstance).to.be.a('object');
        expect(pluginModel.exposedMediators).to.be.a('undefined');
        expect(pluginModel.hasExposedMediators()).to.be.equal(false);
        expect(pluginModel.exposedMediator).to.be.a('object');
    });

    it('should determine that mediator interface has not changed', () => {
        const allowed = ['emit', 'has', 'add', 'once', 'runOnError'];

        // the mediator can me created without module or plugin and config but that will 
        // not happen(?!) in the application
        const mediator = Mediator.create(null, null);

        const props = Object.keys(mediator);

        expect(allowed).to.have.members(props);

        expect(mediator.emit).to.be.a('function');
        expect(mediator.add).to.be.a('function');
        expect(mediator.has).to.be.a('function');
        expect(mediator.once).to.be.a('function');
        expect(mediator.runOnError).to.be.a('function');
    });

    it('should assert that the definition builder is building the appropriate DI definition', () => {
        const definitionBuilder = DefinitionBuilder.create();

        const name = 'name';
        const scope = 'public';

        const definition = definitionBuilder
            .addName(name)
            .addScope(scope)
            .isAsync(true)
            .addShared({})
            .addCompilerPass({})
            .addInit(function() {})
            .build();

        expect(definition.isAsync).to.be.equal(true);
        expect(definition.name).to.be.equal(name);
        expect(definition.scope).to.be.equal(scope);
        expect(definition.shared).to.be.a('object');
        expect(definition.compilerPass).to.be.a('object');
        expect(definition.init).to.be.a('function');

        const definition2 = definitionBuilder
            .addName(name)
            .addScope(scope)
            .isAsync(null)
            .addShared({})
            .addCompilerPass({})
            .addInit(function() {})
            .build();

        expect(definition2.isAsync).to.be.equal(false);
        expect(definition2.name).to.be.equal(name);
        expect(definition2.scope).to.be.equal(scope);
        expect(definition2.shared).to.be.a('object');
        expect(definition2.compilerPass).to.be.a('object');
        expect(definition2.init).to.be.a('function');
    });
});