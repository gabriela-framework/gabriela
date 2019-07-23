const mocha = require('mocha');
const chai = require('chai');

const it = mocha.it;
const describe = mocha.describe;
const expect = chai.expect;

const gabriela = require('../../src/gabriela/gabriela');
const config = require('../config/config');

describe('Complete error handling tests', () => {
    it('should call the onError event when the error is thrown with gabriela error handling from within a module', (done) => {
        const mdl = {
            name: 'errorModule',
            mediator: {
                onError(e) {
                    expect(e).to.be.instanceof(Error);
                    expect(e.message).to.be.equal('Something went wrong');

                    done();
                },
            },
            moduleLogic: [function(throwException) {
                throwException(new Error('Something went wrong'));
            }],
        };

        const app = gabriela.asProcess(config);

        app.addModule(mdl);

        app.startApp();
    });

    it('should call the onError event without the error argument within a module', (done) => {
        const mdl = {
            name: 'errorModule',
            mediator: {
                onError() {
                    done();
                },
            },
            moduleLogic: [function(throwException) {
                throwException(new Error('Something went wrong'));
            }],
        };

        const app = gabriela.asProcess(config);

        app.addModule(mdl);

        app.startApp();
    });

    it('should call the onError on a module only even if a plugin onError is added', (done) => {
        const mdl = {
            name: 'errorModule',
            mediator: {
                onError(e) {
                    expect(e).to.be.instanceof(Error);
                    expect(e.message).to.be.equal('Something went wrong');

                    done();
                },
            },
            moduleLogic: [function(throwException) {
                throwException(new Error('Something went wrong'));
            }],
        };

        const app = gabriela.asProcess(config);

        app.addPlugin({
            name: 'errorPlugin',
            modules: [mdl],
            mediator: {
                onError() {

                }
            }
        });

        app.startApp();
    });
});