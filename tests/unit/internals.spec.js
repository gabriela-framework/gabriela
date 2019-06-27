const mocha = require('mocha');
const chai = require('chai');
const assert = require('assert');

const it = mocha.it;
const describe = mocha.describe;
const expect = chai.expect;

const moduleFactory = require('../../gabriela/module/moduleFactory');
const pluginFactory = require('../../gabriela/plugin/pluginFactory');
const Compiler = require('../../gabriela/dependencyInjection/compiler');

describe('Test gabriela internals', () => {
    it('should properly call properties on a module object create by moduleFactory', () => {
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
            'mediator',
            'isInPlugin',
            'hasMediators',
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
        expect(moduleObject.hasMediators()).to.be.equal(true);
        expect(moduleObject.isInPlugin()).to.be.equal(true);
    });

    it('should properly call properties on a plugin object created with pluginFactory', () => {
        const interface = ['modules', 'name', 'compiler', 'sharedCompiler'];

        const plugin = {
            name: 'name',
            modules: [],
        };

        const pluginModel = pluginFactory(plugin, null, Compiler.create(), Compiler.create());

        const pluginModelProps = Object.keys(pluginModel);

        expect(pluginModelProps).to.have.members(interface);

        expect(pluginModel).to.have.property('name', 'name');
        expect(plugin.modules).to.be.a('array');
        expect(plugin.compiler).to.be.a('object');
        expect(plugin.sharedCompiler).to.be.a('object');
    });
});