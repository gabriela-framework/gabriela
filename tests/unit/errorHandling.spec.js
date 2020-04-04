const mocha = require('mocha');
const chai = require('chai');
const requestPromise = require('request-promise');

const it = mocha.it;
const describe = mocha.describe;
const expect = chai.expect;

const gabriela = require('../../src/gabriela/gabriela');

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

        const app = gabriela.asProcess();

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

        const app = gabriela.asProcess();

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

        const app = gabriela.asProcess();

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

        const app = gabriela.asProcess();

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

        const app = gabriela.asProcess({
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

        const app = gabriela.asProcess({
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

    it('should call onExit() event (terminate the process)', (done) => {
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

        const app = gabriela.asProcess({
            events: {
                onExit() {
                    done();
                }
            }
        });

        app.addModule(mdl);

        app.startApp();
    });

    it('should run plugin onError', (done) => {
        let onErrorCalled = false;

        const mdl = {
            name: 'catchErrorModule',
            route: 'route',
            mediator: {
                onSomeEvent: function() {
                    throw new Error('Something went wrong');
                }
            },
            moduleLogic: [function() {
                this.mediator.emit('onSomeEvent');
            }],
        };

        const app = gabriela.asServer({
            routes: [
                {
                    name: 'route',
                    path: '/route',
                    method: 'get',
                }
            ],
            events: {
                onAppStarted() {
                    requestPromise.get('http://127.0.0.1:3000/route').then(() => {
                        expect(onErrorCalled).to.be.equal(true);

                        this.gabriela.close();

                        done();
                    });
                }
            }
        });

        app.addPlugin({
            name: 'plugin',
            mediator: {
                onError() {
                    onErrorCalled = true;
                }
            },
            modules: [mdl],
        });

        app.startApp();
    });
});
