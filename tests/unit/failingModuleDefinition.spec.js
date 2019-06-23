const mocha = require('mocha');
const chai = require('chai');
const requestPromise = require('request-promise');
const assert = require('assert');

const it = mocha.it;
const describe = mocha.describe;
const expect = chai.expect;

const gabriela = require('../../gabriela/gabriela');

describe('Failing module definition tests', () => {
    it('should throw an error because of invalid dependencies entry type', () => {
        let userModule = {
            name: 'userModule',
            dependencies: null,
        };

        let g = gabriela.asRunner();

        let entersException = false;
        try {
            g.addModule(userModule);
        } catch(err) {
            entersException = true;

            expect(err.message).to.be.equal(`Module definition error in module 'userModule'. 'dependencies' has to be an array of type object`);
        }

        expect(entersException).to.be.equal(true);
    });

    it('should throw error when module definition name does not exist', () => {
        let userModule = {};

        let g = gabriela.asRunner();

        let entersException = false;
        try {
            g.addModule(userModule);
        } catch(err) {
            entersException = true;

            expect(err.message).to.be.equal(`Module definition error. Module has to have a 'name' property as a string that has to be unique to the project`);
        }

        expect(entersException).to.be.equal(true);
    });

    it('should throw an error if module definition name is not a string', () => {
        let userModule = {
            name: 1
        };

        let g = gabriela.asRunner();

        let entersException = false;
        try {
            g.addModule(userModule);
        } catch(err) {
            entersException = true;

            expect(err.message).to.be.equal(`Modules definition error. Module 'name' property must to be a string`);
        }

        expect(entersException).to.be.equal(true);
    });

    it('should throw an error if any of the middleware is not an array', () => {
        const middlewareNames = ['preLogicTransformers', 'postLogicTransformers', 'moduleLogic', 'security'];

        let userModule = {
            name: 'name',
        };

        let g = gabriela.asRunner();

        let entersException = false;
        for (const middlewareName of middlewareNames) {
            userModule = {};
            userModule.name = 'name';
            userModule[middlewareName] = null;

            entersException = false;
            try {
                g.addModule(userModule);
            } catch(err) {
                entersException = true;

                expect(err.message).to.be.equal(`Module definition error. '${middlewareName}' of '${userModule.name}' module has to be an array of functions or an object with a 'name' property and a 'middleware' property that has to be an array`);
            }

            expect(entersException).to.be.equal(true);
        }
    });

    it('should throw an error if module definition middleware values in the middleware array is not a function', () => {
        let userModule = {};
        userModule.name = 'name';
        userModule.preLogicTransformers = [1];

        const runner = gabriela.asRunner();

        let entersException = false;
        try {
            runner.addModule(userModule);
        } catch(err) {
            entersException = true;

            expect(err.message).to.be.equal(`Invalid middleware value. 'preLogicTransformers' middleware of '${userModule.name}' module must receive an array of functions or an array of function expressions`);
        }

        expect(entersException).to.be.equal(true);
    });

    it('should throw an error for invalid middleware name property definition object', () => {
        const middlewareNames = ['preLogicTransformers', 'postLogicTransformers', 'moduleLogic', 'security'];

        let userModule = {
            name: 'name',
        };

        let g = gabriela.asRunner();

        let entersException = false;
        for (const middlewareName of middlewareNames) {
            userModule = {};
            userModule.name = 'name';
            userModule[middlewareName] = [{}];

            entersException = false;
            try {
                g.addModule(userModule);
            } catch(err) {
                entersException = true;

                expect(err.message).to.be.equal(`Invalid middleware definition object. '${middlewareName}' of module '${userModule.name}' has to have a 'name' property that must be a string`);
            }

            expect(entersException).to.be.equal(true);
        }
    });

    it('should throw an error for invalid middleware middleware property definition object', () => {
        const middlewareNames = ['preLogicTransformers', 'postLogicTransformers', 'moduleLogic', 'security'];

        let userModule = {
            name: 'name',
        };

        let g = gabriela.asRunner();

        let entersException = false;
        for (const middlewareName of middlewareNames) {
            userModule = {};
            userModule.name = 'name';
            userModule[middlewareName] = [{
                name: 'name'
            }];

            entersException = false;
            try {
                g.addModule(userModule);
            } catch(err) {
                entersException = true;

                expect(err.message).to.be.equal(`Invalid middleware definition object. '${middlewareName}' of module '${userModule.name}' has to have a 'middleware' property that must be an array of functions`);
            }

            expect(entersException).to.be.equal(true);
        }
    });

    it('should throw an error for invalid middleware name property property value for definition object', () => {
        const middlewareNames = ['preLogicTransformers', 'postLogicTransformers', 'moduleLogic', 'security'];

        let userModule = {
            name: 'name',
        };

        let g = gabriela.asRunner();

        let entersException = false;
        for (const middlewareName of middlewareNames) {
            userModule = {};
            userModule.name = 'name';
            userModule[middlewareName] = [{
                name: 1,
                middleware: []
            }];

            entersException = false;
            try {
                g.addModule(userModule);
            } catch(err) {
                entersException = true;

                expect(err.message).to.be.equal(`Invalid middleware definition object. '${middlewareName}' of module '${userModule.name}' has to have a 'name' property that must be a string`);
            }

            expect(entersException).to.be.equal(true);
        }
    });

    it('should throw an error for invalid middleware name property property value for definition object', () => {
        const middlewareNames = ['preLogicTransformers', 'postLogicTransformers', 'moduleLogic', 'security'];

        let userModule = {
            name: 'name',
        };

        let g = gabriela.asRunner();

        let entersException = false;
        for (const middlewareName of middlewareNames) {
            userModule = {};
            userModule.name = 'name';
            userModule[middlewareName] = [{
                name: 'name',
                middleware: null
            }];

            entersException = false;
            try {
                g.addModule(userModule);
            } catch(err) {
                entersException = true;

                expect(err.message).to.be.equal(`Invalid middleware definition object. '${middlewareName}' of module '${userModule.name}' has to have a 'middleware' property that must be a function`);
            }

            expect(entersException).to.be.equal(true);
        }
    });

    it('should throw error if module to override does not exist', () => {
        let userModule = {
            name: 'name',
        };

        let g = gabriela.asRunner();

        g.addModule(userModule);

        let entersException = false;
        try {
            g.overrideModule({
                name: 'nonExistent'
            });
        } catch (e) {
            entersException = true;

            expect(e.message).to.be.equal(`Module overriding error. Module with name 'nonExistent' does not exist`);
        }

        expect(entersException).to.be.equal(true);
    });

    it('should throw an error if disable property is not a boolean', () => {
        const middlewareNames = ['preLogicTransformers', 'postLogicTransformers', 'moduleLogic', 'security'];

        let userModule = {
            name: 'name',
        };

        let g = gabriela.asRunner();

        let entersException = false;
        for (const middlewareName of middlewareNames) {
            userModule = {};
            userModule.name = 'name';
            userModule[middlewareName] = [{
                name: 'name',
                disabled: 1,
                middleware: function() {},
            }];

            entersException = false;
            try {
                g.addModule(userModule);
            } catch(err) {
                entersException = true;

                expect(err.message).to.be.equal(`Invalid middleware definition object. '${middlewareName}' of module '${userModule.name}' 'disabled' property has to be a type boolean`);
            }

            expect(entersException).to.be.equal(true);
        }
    });

    it('should throw an error when executing an invalid module name', () => {
        const userModule = {
            name: 'name',
        };

        const m = gabriela.asRunner();

        m.addModule(userModule);

        m.runModule([]).then(() => {
            assert.fail('This test should not be executed successfully');
        }).catch((err) => {
            expect(err.message).to.be.equal(`Module runtime tree error. Invalid module name type. Module name must be a string`);
        });
    });

    it('should throw an error when executing a non existent module', () => {
        const userModule = {
            name: 'name',
        };

        const m = gabriela.asRunner();

        m.addModule(userModule);

        m.runModule('nonExistent').then(() => {
            assert.fail('This test should not be executed successfully');
        }).catch((err) => {
            expect(err.message).to.be.equal(`Module runtime tree error. Module with name 'nonExistent' does not exist`);
        });
    });
});