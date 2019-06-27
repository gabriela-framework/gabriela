const mocha = require('mocha');
const chai = require('chai');
const assert = require('assert');

const it = mocha.it;
const describe = mocha.describe;
const expect = chai.expect;

const moduleFactory = require('../../gabriela/module/moduleFactory');
const Compiler = require('../../gabriela/dependencyInjection/compiler');

describe('Test gabriela internals', () => {
    it('should properly call properties on a module object create by moduleFactory', () => {
        const mdl = {
            name: 'name',
            security: [],
            preLogicTransformers: [],
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

        expect(moduleObject.name).to.be.a('string');
        expect(moduleObject.security).to.be.a('array');
        expect(moduleObject.preLogicTransformers).to.be.a('array');
        expect(moduleObject.validators).to.be.a('array');
        expect(moduleObject.moduleLogic).to.be.a('array');
        expect(moduleObject.compiler).to.be.a('object');
        expect(moduleObject.sharedCompiler).to.be.a('object');
        expect(moduleObject.plugin).to.have.property('name');
        expect(moduleObject.dependencies).to.be.a('array');
        expect(moduleObject.hasMediators()).to.be.equal(true);
        expect(moduleObject.isInPlugin()).to.be.equal(true);
    });
});