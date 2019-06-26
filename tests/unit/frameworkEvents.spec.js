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
            events: {
                onModuleStarted: function() {
                    onModuleStarted = true;
                },
                onModuleFinished: function() {
                    onModuleFinished = true;
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

    it('should properly execute start and finished events when they contain async code', () => {
        let onModuleStarted = false;
        let onModuleFinished = false;

        const module = {
            name: 'eventsModule',
            events: {
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

        const module = {
            name: 'eventsModule',
            events: {
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

                        expect(execution).to.be.equal(4);

                        next();
                    });
                }
            },
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

        g.addModule(module);

        return g.runModule().then(() => {
            expect(onModuleStarted).to.be.equal(true);
            expect(onModuleFinished).to.be.equal(true);
        });
    });
});