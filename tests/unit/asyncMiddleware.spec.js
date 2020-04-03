const mocha = require('mocha');
const chai = require('chai');

const it = mocha.it;
const describe = mocha.describe;
const expect = chai.expect;

const gabriela = require('../../src/gabriela/gabriela');
const config = require('../config/config');

describe('Async middleware functions', function() {
    this.timeout(10000);

    it('should catch the error in onError() module event', (done) => {
        let firstExecuted = false;

        const mdl = {
            name: 'mdl',
            mediator: {
                onError(err) {
                    expect(err.message).to.be.equal('Async error');
                }
            },
            moduleLogic: [
                async function() {
                    firstExecuted = true;

                    throw new Error('Async error');
                }
            ]
        };

        const app = gabriela.asProcess(config, {
            events: {
                onAppStarted() {
                    expect(firstExecuted).to.be.equal(true);

                    done();
                }
            }
        });

        app.addModule(mdl);

        app.startApp();
    });

    it('should catch the error in onError() plugin event', (done) => {
        let firstExecuted = false;

        const mdl = {
            name: 'mdl',
            moduleLogic: [
                async function() {
                    firstExecuted = true;

                    throw new Error('Async error');
                }
            ]
        };

        const plugin = {
            name: 'plugin',
            modules: [mdl],
            mediator: {
                onError(e) {
                    firstExecuted = true;

                    expect(e.message).to.be.equal('Async error');

                    throw new Error('Plugin error');
                }
            }
        };

        const app = gabriela.asProcess(config, {
            events: {
                onAppStarted() {
                    expect(firstExecuted).to.be.equal(true);
                },
                catchError(e) {
                    expect(e.message).to.be.equal('Plugin error');

                    done();
                }
            }
        });

        app.addPlugin(plugin);

        app.startApp();
    });

    it('should catch the error in catchError event', (done) => {
        let firstExecuted = false;

        const mdl = {
            name: 'mdl',
            moduleLogic: [
                async function() {
                    firstExecuted = true;

                    throw new Error('Async error');
                }
            ]
        };

        const plugin = {
            name: 'plugin',
            modules: [mdl],
            mediator: {
                onError() {
                    firstExecuted = true;

                    throw new Error('Async error');
                }
            }
        };

        const app = gabriela.asProcess(config, {
            events: {
                catchError(err) {
                    expect(firstExecuted).to.be.equal(true);
                    expect(err.message).to.be.equal('Async error');

                    done();
                }
            }
        });

        app.addPlugin(plugin);

        app.startApp();
    });

    it('should fail if the next() function is used with async middleware', (done) => {
        let firstExecuted = false;

        const mdl = {
            name: 'mdl',
            moduleLogic: [
                async function(next) {
                    firstExecuted = true;
                },
            ]
        };

        const app = gabriela.asProcess(config, {
            events: {
                catchError(err) {
                    expect(firstExecuted).to.be.equal(false);
                    expect(err.message).to.be.equal(`Invalid next() function in module '${mdl.name}'. When executing middleware with async keyword, next() is not necessary. Use await to get the same result.`)

                    done();
                }
            }
        });

        app.addModule(mdl);

        app.startApp();
    });

    it('should fail if the throwException() function is used with async middleware', (done) => {
        let firstExecuted = false;

        const mdl = {
            name: 'mdl',
            moduleLogic: [
                async function(throwException) {
                    firstExecuted = true;
                },
            ]
        };

        const app = gabriela.asProcess(config, {
            events: {
                catchError(err) {
                    expect(firstExecuted).to.be.equal(false);
                    expect(err.message).to.be.equal(`Invalid throwException() function in '${mdl.name}'. When executing middleware with async keyword, throwException() is not necessary. Use regular try/catch javascript mechanism.`)

                    done();
                }
            }
        });

        app.addModule(mdl);

        app.startApp();
    });

    it('should execute a mix of plain and async middleware functions', (done) => {
        let firstExecuted = false;
        let secondExecuted = false;

        const mdl = {
            name: 'mdl',
            moduleLogic: [
                async function() {
                    firstExecuted = true;
                },
                function() {
                    secondExecuted = true;
                }
            ]
        };

        const app = gabriela.asProcess(config, {
            events: {
                onAppStarted() {
                    expect(firstExecuted).to.be.equal(true);
                    expect(secondExecuted).to.be.equal(true);

                    done();
                }
            }
        });

        app.addModule(mdl);

        app.startApp();
    });
});
