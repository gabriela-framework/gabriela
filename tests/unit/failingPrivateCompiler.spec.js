const mocha = require('mocha');
const chai = require('chai');
const assert = require('assert');

const it = mocha.it;
const describe = mocha.describe;
const expect = chai.expect;

const gabriela = require('../../src/gabriela/gabriela');

describe('Failing private compiler dependency injection tests', () => {
    it('should fail because of not found private dependency', (done) => {
        const initObject = {
            name: 'someService',
            dependencies: [],
            init: function(privateDependency) {
                return () => {};
            }
        };

        const g = gabriela.asProcess({
            events: {
                catchError(e) {
                    expect(e.message).to.be.equal(`Dependency injection error. 'privateDependency' definition not found in the dependency tree`);

                    done();
                }
            }
        });

        g.addModule({
            name: 'module',
            dependencies: [initObject],
            moduleLogic: [function(someService, next) {
                next();
            }],
        });

        g.startApp();
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
