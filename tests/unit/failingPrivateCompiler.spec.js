const mocha = require('mocha');
const chai = require('chai');
const assert = require('assert');

const it = mocha.it;
const describe = mocha.describe;
const expect = chai.expect;

const gabriela = require('../../src/gabriela/gabriela');

describe('Failing private compiler dependency injection tests', () => {
    it('should fail because of not found private dependency', () => {
        const initObject = {
            name: 'someService',
            dependencies: [],
            init: function(privateDependency) {
                return () => {};
            }
        };

        const g = gabriela.asProcess();

        g.addModule({
            name: 'module',
            dependencies: [initObject],
            moduleLogic: [function(someService, next) {
                next();
            }],
        });

        g.runModule().then(() => {
            assert.fail('This test should fail');
        }).catch((e) => {
            expect(e.message).to.be.equal(`Dependency injection error. 'privateDependency' definition not found in the dependency tree`);
        });
    });

    it('should fail because of invalid private dependency init object', () => {
        const privateDep = {
            name: 'privateDep',
            init: null,
        };

        const initObject = {
            name: 'someService',
            dependencies: [privateDep],
            init: function(privateDep) {
                return () => {};
            }
        };

        const g = gabriela.asProcess();

        try {
            g.addModule({
                name: 'module',
                dependencies: [initObject],
                moduleLogic: [function(someService, next) {
                    next();
                }],
            });
        } catch (e) {
            expect(e.message).to.be.equal(`Dependency injection error in module 'module'. Init object 'init' property must be a function`);
        }
    });


});
