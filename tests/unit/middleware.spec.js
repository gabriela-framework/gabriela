const mocha = require('mocha');
const chai = require('chai');
const requestPromise = require('request-promise');

const it = mocha.it;
const describe = mocha.describe;
const expect = chai.expect;

const gabriela = require('../../src/gabriela/gabriela');

describe('Middleware execution', function() {
    this.timeout(10000);
    
    it('should assert the first time that next proceedes to next middleware with an async function inside middleware', (done) => {
        const name = 'googleCall';

        const googleRequest = function(state, next) {
            setTimeout(() => {
                state.googleBody = 'value';

                next();
            }, 50);
        };

        const mdl = {
            name: name,
            moduleLogic: [googleRequest]
        };

        const g = gabriela.asProcess();

        g.addModule(mdl);

        g.runModule(mdl.name).then((moduleResult) => {
            expect(moduleResult).to.have.property('googleBody');

            done();
        });
    });

    it('should assert the second time that next proceeds to next middleware with an async function inside middleware', (done) => {
        const name = 'googleCall';

        const googleRequest = function(state, next) {
            setTimeout(() => {
                state.googleBody = 'value';

                next();
            }, 50);
        };

        const mdl = {
            name: name,
            moduleLogic: [googleRequest]
        };

        const g = gabriela.asProcess();

        g.addModule(mdl);

        g.runModule(mdl.name).then((moduleResult) => {
            expect(moduleResult).to.have.property('googleBody');

            done();
        });
    });

    it(`should assert that skip skips the rest of the middleware`, (done) => {
        const name = 'googleCall';

        const firstRequest = function(state, next) {
            setTimeout(() => {
                state.firstRequest = 'value';

                next();
            }, 50);
        };

        const secondRequest = function(state, next, skip) {
            setTimeout(() => {
                state.secondRequest = 'value';

                skip();
            }, 50);
        };

        const thirdRequest = function(state, next) {
            setTimeout(() => {
                state.thirdRequest = 'value';

                next();
            }, 50);
        };

        const postLogicTransformer = function(state, next) {
            state.postLogic = true;

            next();
        };

        const mdl = {
            name: name,
            moduleLogic: [firstRequest, secondRequest, thirdRequest],
            postLogicTransformers: [postLogicTransformer]
        };

        const g = gabriela.asProcess();

        g.addModule(mdl);

        g.runModule(mdl.name).then((moduleResult) => {
            expect(moduleResult).to.have.property('firstRequest');
            expect(moduleResult).to.have.property('secondRequest');
            expect(moduleResult).to.not.have.property('thirdRequest');
            expect(moduleResult).to.have.property('postLogic');

            done();
        });
    });

    it(`it should assert that done() exists and does not execute any more middleware`, (done) => {
        const name = 'googleCall';

        const firstRequest = function(state, next) {
            setTimeout(() => {
                state.firstRequest = 'value';

                next();
            }, 50);
        };

        const secondRequest = function(state, next, skip, done) {
            setTimeout(() => {
                state.secondRequest = 'value';

                done();
            }, 50);
        };

        const thirdRequest = function(state, next) {
            setTimeout(() => {
                state.thirdRequest = 'value';

                next();
            }, 50);
        };

        const postLogicTransformer = function(state, next) {
            state.postLogic = true;

            next();
        };

        const mdl = {
            name: name,
            moduleLogic: [firstRequest, secondRequest, thirdRequest],
            postLogicTransformers: [postLogicTransformer]
        };

        const g = gabriela.asProcess();

        g.addModule(mdl);

        g.runModule(mdl.name).then((moduleResult) => {
            expect(moduleResult).to.have.property('firstRequest');
            expect(moduleResult).to.have.property('secondRequest');
            expect(moduleResult).to.not.have.property('thirdRequest');
            expect(moduleResult).to.not.have.property('postLogic');

            done();
        });
    });

    it('should assert that exception throw inside middleware async process is caught and processed', (done) => {
        const name = 'googleCall';

        const firstRequest = function(state, next, skip, done, throwException) {
            setTimeout(() => {
                state.firstRequest = 'value';

                throwException(new Error('my exception'));
            }, 50)
        };

        const secondRequest = function(state, next, skip, done) {
            setTimeout(() => {
                state.secondRequest = 'value';

                done();
            }, 50);
        };

        const mdl = {
            name: name,
            moduleLogic: [firstRequest, secondRequest],
            postLogicTransformers: []
        };

        const g = gabriela.asProcess();

        g.addModule(mdl);

        g.runModule(mdl.name).then(() => {
        }).catch((err) => {
            expect(err.message).to.be.equal('my exception');

            done();
        });
    });

    it('should override module by adding more middleware with existing ones', (done) => {
        const g = gabriela.asProcess();

        let firstCalled = false;
        let secondCalled = false;
        let thirdCalled = false;
        let overridenCalled = false;

        const firstMiddleware = {
            name: 'first',
            middleware: function() {
                firstCalled = true;
            }
        };

        const secondMiddleware = {
            name: 'second',
            middleware: function() {
                secondCalled = true;
            }
        };

        const mdl = {
            name: 'overridingModule',
            moduleLogic: [firstMiddleware, secondMiddleware],
        };

        g.addModule(mdl);

        g.overrideModule({
            name: 'overridingModule',
            moduleLogic: [{
                name: 'second',
                middleware: function() {
                    overridenCalled = true;
                }
            }],
            postLogicTransformers: [function() {
                thirdCalled = true;
            }]
        });

        g.runModule('overridingModule').then(() => {
            expect(firstCalled).to.be.equal(true);
            expect(secondCalled).to.be.equal(false);
            expect(overridenCalled).to.be.equal(true);
            expect(thirdCalled).to.be.equal(true);

            done();
        });
    })
});
