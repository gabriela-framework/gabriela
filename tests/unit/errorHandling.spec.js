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

    it('should propagate the onError event to plugin onError in module onError is not declared', (done) => {
        const mdl = {
            name: 'errorModule',
            mediator: {
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
                onError(e) {
                    expect(e).to.be.instanceof(Error);
                    expect(e.message).to.be.equal('Something went wrong');

                    done();
                }
            }
        });

        app.startApp();
    });

    it('catchError should catch the native javascript error from within a module', (done) => {
        const mdl = {
            name: 'catchErrorModule',
            moduleLogic: [function() {
                throw new Error('Something went wrong');
            }],
        };

        const app = gabriela.asProcess(config, {
            events: {
                catchError(e) {
                    expect(e).to.be.instanceof(Error);
                    expect(e.message).to.be.equal('Something went wrong');

                    done();
                }
            }
        });

        app.addModule(mdl);

        app.startApp();
    });

    it('should catchError event when its thrown inside a mediator event', (done) => {
        const mdl = {
            name: 'catchErrorModule',
            mediator: {
                onSomeEvent: function() {
                    throw new Error('Something went wrong');
                }
            },
            moduleLogic: [function() {
                this.mediator.emit('onSomeEvent');
            }],
        };

        const app = gabriela.asProcess(config, {
            events: {
                catchError(e) {
                    expect(e).to.be.instanceof(Error);
                    expect(e.message).to.be.equal('Something went wrong');

                    done();
                }
            }
        });

        app.addModule(mdl);

        app.startApp();
    });
});