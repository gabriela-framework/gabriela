const mocha = require('mocha');
const chai = require('chai');
const requestPromise = require('request-promise');

const it = mocha.it;
const describe = mocha.describe;
const expect = chai.expect;

const gabriela = require('../../gabriela/gabriela');

describe('Async modules test | ', () => {
    it('should assert the first time that next proceedes to next middleware with an async function inside middleware', (done) => {
        const name = 'googleCall';

        const googleRequest = function(state, next) {
            requestPromise.get('https://www.google.com/').then((body) => {
                state.googleBody = body;

                next();
            });
        }

        const mdl = {
            name: name,
            moduleLogic: [googleRequest]
        };

        const g = gabriela.createModule();

        g.addModule(mdl);

        g.runModule(g.getModule(name)).then((moduleResult) => {
            expect(moduleResult).to.have.property('googleBody');

            done();
        });
    });

    it('should assert the second time that next proceedes to next middleware with an async function inside middleware', (done) => {
        const name = 'googleCall';

        const googleRequest = function(state, next) {
            requestPromise.get('https://www.google.com/').then((body) => {
                state.googleBody = body;

                next();
            });
        }

        const mdl = {
            name: name,
            moduleLogic: [googleRequest]
        };

        const g = gabriela.createModule();

        g.addModule(mdl);

        g.runModule(g.getModule(name)).then((moduleResult) => {
            expect(moduleResult).to.have.property('googleBody');

            done();
        });
    });

})