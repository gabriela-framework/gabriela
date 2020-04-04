const mocha = require('mocha');
const chai = require('chai');

const it = mocha.it;
const describe = mocha.describe;
const expect = chai.expect;

const gabriela = require('../../src/gabriela/gabriela');

describe('Middleware execution', function() {
    this.timeout(10000);
    
    it('should assert the first time that next proceedes to next middleware with an async function inside middleware', (done) => {
        let middlewareEntered = false;

        const googleRequest = function(state, next) {
            setTimeout(() => {
                middlewareEntered = true;

                next();
            }, 50);
        };

        const mdl = {
            name: 'module',
            moduleLogic: [googleRequest]
        };

        const g = gabriela.asProcess({
            events: {
                onAppStarted() {
                    expect(middlewareEntered).to.be.equal(true);

                    done();
                }
            }
        });

        g.addModule(mdl);

        g.startApp();
    });

    it(`should assert that skip skips the rest of the middleware`, (done) => {
        let firstEntered = false;
        let secondEntered = false;
        let thirdEntered = false;
        let fourthEntered = false;

        const firstRequest = function(state, next) {
            setTimeout(() => {
                firstEntered = true;

                next();
            }, 50);
        };

        const secondRequest = function(state, next, skip) {
            setTimeout(() => {
                secondEntered = true;

                skip();
            }, 50);
        };

        const thirdRequest = function(state, next) {
            setTimeout(() => {
                thirdEntered = true;

                next();
            }, 50);
        };

        const postLogicTransformer = function(state, next) {
            fourthEntered = true;

            next();
        };

        const mdl = {
            name: 'module',
            moduleLogic: [firstRequest, secondRequest, thirdRequest],
            postLogicTransformers: [postLogicTransformer]
        };

        const g = gabriela.asProcess({
            events: {
                onAppStarted() {
                    expect(firstEntered).to.be.equal(true);
                    expect(secondEntered).to.be.equal(true);
                    expect(thirdEntered).to.be.equal(false);
                    expect(fourthEntered).to.be.equal(true);

                    done();
                }
            }
        });

        g.addModule(mdl);

        g.startApp();
    });

    it(`it should assert that done() exists and does not execute any more middleware`, (mochaDone) => {
        let firstEntered = false;
        let secondEntered = false;
        let thirdEntered = false;
        let fourthEntered = false;

        const firstRequest = function(state, next) {
            setTimeout(() => {
                firstEntered = true;

                next();
            }, 50);
        };

        const secondRequest = function(state, next, skip, done) {
            setTimeout(() => {
                secondEntered = true;

                done();
            }, 50);
        };

        const thirdRequest = function(state, next) {
            setTimeout(() => {
                thirdEntered = true;

                next();
            }, 50);
        };

        const postLogicTransformer = function(state, next) {
            fourthEntered = true;

            next();
        };

        const mdl = {
            name: 'module',
            moduleLogic: [firstRequest, secondRequest, thirdRequest],
            postLogicTransformers: [postLogicTransformer]
        };

        const g = gabriela.asProcess({
            events: {
                onAppStarted() {
                    expect(firstEntered).to.be.equal(true);
                    expect(secondEntered).to.be.equal(true);
                    expect(thirdEntered).to.be.equal(false);
                    expect(fourthEntered).to.be.equal(false);

                    mochaDone();
                }
            }
        });

        g.addModule(mdl);

        g.startApp();
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

    it('should override module by adding more middleware with existing ones', (done) => {
        const g = gabriela.asProcess({
            events: {
                onAppStarted() {
                    expect(firstCalled).to.be.equal(true);
                    expect(secondCalled).to.be.equal(false);
                    expect(overridenCalled).to.be.equal(true);
                    expect(thirdCalled).to.be.equal(true);

                    done();
                }
            }
        });

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

        g.startApp();
    })
});
