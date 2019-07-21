const mocha = require('mocha');
const chai = require('chai');
const requestPromise = require('request-promise');

const it = mocha.it;
const describe = mocha.describe;
const expect = chai.expect;

const gabriela = require('../../src/gabriela/gabriela');
const config = require('../config/config');

describe('Middleware execution', () => {
    it('should assert the first time that next proceedes to next middleware with an async function inside middleware', (done) => {
        const name = 'googleCall';

        const googleRequest = function(state, next) {
            requestPromise.get('https://www.facebook.com//').then((body) => {
                state.googleBody = body;

                next();
            });
        };

        const mdl = {
            name: name,
            moduleLogic: [googleRequest]
        };

        const g = gabriela.asProcess(config);;

        g.addModule(mdl);

        g.runModule(mdl.name).then((moduleResult) => {
            expect(moduleResult).to.have.property('googleBody');

            done();
        });
    });

    it('should assert the second time that next proceeds to next middleware with an async function inside middleware', (done) => {
        const name = 'googleCall';

        const googleRequest = function(state, next) {
            requestPromise.get('https://www.facebook.com//').then((body) => {
                state.googleBody = body;

                next();
            });
        };

        const mdl = {
            name: name,
            moduleLogic: [googleRequest]
        };

        const g = gabriela.asProcess(config);;

        g.addModule(mdl);

        g.runModule(mdl.name).then((moduleResult) => {
            expect(moduleResult).to.have.property('googleBody');

            done();
        });
    });

    it(`should assert that skip skips the rest of the middleware`, (done) => {
        const name = 'googleCall';

        const firstRequest = function(state, next) {
            requestPromise.get('https://www.facebook.com//').then((body) => {
                state.firstRequest = body;

                next();
            });
        };

        const secondRequest = function(state, next, skip) {
            requestPromise.get('https://www.facebook.com//').then((body) => {
                state.secondRequest = body;

                skip();
            });
        };

        const thirdRequest = function(state, next) {
            requestPromise.get('https://www.facebook.com//').then((body) => {
                state.thirdRequest = body;

                next();
            });
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

        const g = gabriela.asProcess(config);;

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
            requestPromise.get('https://www.facebook.com//').then((body) => {
                state.firstRequest = body;

                next();
            });
        };

        const secondRequest = function(state, next, skip, done) {
            requestPromise.get('https://www.facebook.com//').then((body) => {
                state.secondRequest = body;

                done();
            });
        };

        const thirdRequest = function(state, next) {
            requestPromise.get('https://www.facebook.com//').then((body) => {
                state.thirdRequest = body;

                next();
            });
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

        const g = gabriela.asProcess(config);;

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
            requestPromise.get('https://www.facebook.com//').then((body) => {
                state.firstRequest = body;

                throwException(new Error('my exception'));
            });
        };

        const secondRequest = function(state, next, skip, done) {
            requestPromise.get('https://www.facebook.com//').then((body) => {
                state.secondRequest = body;

                done();
            });
        };

        const mdl = {
            name: name,
            moduleLogic: [firstRequest, secondRequest],
            postLogicTransformers: []
        };

        const g = gabriela.asProcess(config);;

        g.addModule(mdl);

        g.runModule(mdl.name).then(() => {
        }).catch((err) => {
            expect(err.message).to.be.equal('my exception');

            done();
        });
    })
});