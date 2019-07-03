const mocha = require('mocha');
const chai = require('chai');

const it = mocha.it;
const describe = mocha.describe;
const expect = chai.expect;

const moduleFactory = require('../../gabriela/module/moduleFactory');
const pluginFactory = require('../../gabriela/plugin/pluginFactory');
const Compiler = require('../../gabriela/dependencyInjection/compiler');
const Mediator = require('../../gabriela/events/mediator');

describe('Test gabriela internals', () => {
    it('should properly call properties on a module object created by moduleFactory', () => {
        const allowedModuleProps = [
            'name',
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
        ];

        const mdl = {
            name: 'name',
            security: [],
            preLogicTransformers: [],
            postLogicTransformers: [],
            validators: [],
            moduleLogic: [],
            compiler: null,
            sharedCompiler: null,
            plugin: {name: 'plugin'},
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

        const moduleObject = moduleFactory(mdl, {}, Compiler.create(), Compiler.create(), Compiler.create());

        const moduleObjectProps = Object.keys(moduleObject);

        // tests that the interface has not changed on test side and code side
        expect(allowedModuleProps).to.have.members(moduleObjectProps);

        expect(moduleObject.name).to.be.a('string');
        expect(moduleObject.security).to.be.a('array');
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
    });

    it('should properly call properties on a plugin object created with pluginFactory', () => {
        const pluginInterface = [
            'modules', 
            'name',
            'compiler', 
            'sharedCompiler',
            'hasModules',
            'hasMediators',
            'hasPlugins',
            'plugins',
            'mediator',
            'mediatorInstance',
            'exposedEvents',
            'exposedEventsInstance',
            'hasExposedEvents',
        ];

        const plugin = {
            name: 'name',
            modules: [],
            plugins: [],
        };

        const pluginModel = pluginFactory(plugin, null, Compiler.create(), Compiler.create());

        const pluginModelProps = Object.keys(pluginModel);

        expect(pluginModelProps).to.have.members(pluginInterface);

        expect(pluginModel).to.have.property('name', 'name');
        expect(pluginModel.modules).to.be.a('array');
        expect(pluginModel.compiler).to.be.a('object');
        expect(pluginModel.sharedCompiler).to.be.a('object');
        expect(pluginModel.hasMediators).to.be.a('function');
        expect(pluginModel.hasModules).to.be.a('function');
        expect(pluginModel.hasPlugins).to.be.a('function');
        expect(pluginModel.mediator).to.be.a('undefined');
        expect(pluginModel.exposedEvents).to.be.a('undefined');
        expect(pluginModel.plugins).to.be.a('array');
        expect(pluginModel.mediatorInstance).to.be.a('object');
        expect(pluginModel.exposedEvents).to.be.a('undefined');
        expect(pluginModel.exposedEventsInstance).to.be.a('object');
        expect(pluginModel.hasExposedEvents()).to.be.equal(false);

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
});