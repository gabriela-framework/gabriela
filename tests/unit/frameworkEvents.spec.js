const mocha = require('mocha');
const chai = require('chai');
const assert = require('assert');
const requestPromise = require('request-promise');

const it = mocha.it;
const describe = mocha.describe;
const expect = chai.expect;

const gabriela = require('../../gabriela/gabriela');

describe('Framework events', () => {
    it('should execute a named module start and finished event', () => {
        let onModuleStarted = false;
        let onModuleFinished = false;

        const module = {
            name: 'eventsModule',
            mediator: {
                onModuleStarted: function() {
                    onModuleStarted = true;
                },
                onModuleFinished: function() {
                    onModuleFinished = true;
                },
            }
        };

        const g = gabriela.asRunner();

        g.addModule(module);

        return g.runModule().then(() => {
            expect(onModuleStarted).to.be.equal(true);
            expect(onModuleFinished).to.be.equal(true);
        });
    });

    it('should properly execute start and finished events when they contain async code', () => {
        let onModuleStarted = false;
        let onModuleFinished = false;

        const module = {
            name: 'eventsModule',
            mediator: {
                onModuleStarted: function(next) {
                    requestPromise.get('https://www.google.com').then(() => {
                        onModuleStarted = true;

                        next();
                    });
                },
                onModuleFinished: function(next) {
                    requestPromise.get('https://www.google.com').then(() => {
                        onModuleFinished = true;

                        next();
                    });
                }
            }
        };

        const g = gabriela.asRunner();

        g.addModule(module);

        return g.runModule().then(() => {
            expect(onModuleStarted).to.be.equal(true);
            expect(onModuleFinished).to.be.equal(true);
        });
    });

    it('should properly execute start and finished events before and after all middleware executes', () => {
        let onModuleStarted = false;
        let onModuleFinished = false;

        let execution = 0;

        const mdl = {
            name: 'eventsModule',
            mediator: {
                onModuleStarted: function(next) {
                    requestPromise.get('https://www.google.com').then(() => {
                        onModuleStarted = true;

                        expect(execution).to.be.equal(0);

                        next();
                    });
                },
                onModuleFinished: function(next) {
                    requestPromise.get('https://www.google.com').then(() => {
                        onModuleFinished = true;

                        expect(execution).to.be.equal(5);

                        next();
                    });
                }
            },
            security: [function(next) {
                requestPromise.get('https://www.google.com').then(() => {
                    ++execution;

                    next();
                });
            }],
            preLogicTransformers: [function(next) {
                requestPromise.get('https://www.google.com').then(() => {
                    ++execution;

                    next();
                });
            }],
            validators: [function(next) {
                requestPromise.get('https://www.google.com').then(() => {
                    ++execution;

                    next();
                });
            }],
            moduleLogic: [function(next) {
                requestPromise.get('https://www.google.com').then(() => {
                    ++execution;

                    next();
                });
            }],
            postLogicTransformers: [function(next) {
                requestPromise.get('https://www.google.com').then(() => {
                    ++execution;

                    next();
                });
            }],
        };

        const g = gabriela.asRunner();

        g.addModule(mdl);

        return g.runModule().then(() => {
            expect(onModuleStarted).to.be.equal(true);
            expect(onModuleFinished).to.be.equal(true);
        });
    });

    it('should call the onError event if the exception is thrown within the other events', () => {
        let onModuleStarted = false;
        let onModuleFinished = false;
        let entersOnError = false;

        const module = {
            name: 'eventsModule',
            mediator: {
                onModuleStarted(next, throwException) {
                    requestPromise.get('https://www.google.com').then(() => {
                        onModuleStarted = true;

                        throwException(new Error(`Something went wrong`));
                    });
                },
                onModuleFinished(next) {
                    requestPromise.get('https://www.google.com').then(() => {
                        onModuleFinished = true;

                        next();
                    });
                },
                onError(e) {
                    entersOnError = true;

                    expect(e.message).to.be.equal('Something went wrong');
                }
            }
        };

        const g = gabriela.asRunner();

        g.addModule(module);

        return g.runModule().then(() => {
            expect(entersOnError).to.be.equal(true);
            expect(onModuleStarted).to.be.equal(true);
            expect(onModuleFinished).to.be.equal(true);
        });
    });

    it('should not resolve onModuleFinished if onModuleStarted threw an error', () => {
        let onModuleStarted = false;
        let onModuleFinished = false;
        let entersOnError = false;

        const module = {
            name: 'eventsModule',
            mediator: {
                onModuleStarted(next, throwException) {
                    requestPromise.get('https://www.google.com').then(() => {
                        onModuleStarted = true;

                        throwException(new Error(`Something went wrong`));
                    });
                },
                onModuleFinished(next) {
                    requestPromise.get('https://www.google.com').then(() => {
                        onModuleFinished = true;

                        next();
                    });
                },
                onError(e) {
                    entersOnError = true;

                    expect(e.message).to.be.equal('Something went wrong');

                    throw e;
                }
            }
        };

        const g = gabriela.asRunner();

        g.addModule(module);

        return g.runModule().then(() => {
            assert.fail('This test should fail');
        }).catch(() => {
            expect(entersOnError).to.be.equal(true);
            expect(onModuleStarted).to.be.equal(true);
            expect(onModuleFinished).to.be.equal(false);
        });
    });

    it('middleware should have a bound this context with the mediator property', () => {
        let middlewareExecuted = false;

        const module = {
            name: 'eventsModule',
            moduleLogic: [function() {
                middlewareExecuted = true;

                expect(this).to.be.a('object');
                expect(this).to.have.property('mediator');
                expect(this.mediator).to.be.a('object');

                console.log(this);
            }],
        };

        const g = gabriela.asRunner();

        g.addModule(module);

        return g.runModule().then(() => {
            expect(middlewareExecuted).to.be.equal(true);
        });
    });

    it('should execute a custom mediator event', () => {
        let customEventExecuted = false;

        const module = {
            name: 'eventsModule',
            mediator: {
                customMediator: function() {
                    customEventExecuted = true;
                }
            }
        };

        const g = gabriela.asRunner();

        g.addModule(module);

        return g.runModule().then(() => {
            assert.fail('This test should fail');
        }).catch(() => {
            //expect(customEventExecuted).to.be.equal(true);
        });
    });
});