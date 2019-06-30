const mocha = require('mocha');
const chai = require('chai');
const assert = require('assert');
const requestPromise = require('request-promise');

const it = mocha.it;
const describe = mocha.describe;
const expect = chai.expect;

const gabriela = require('../../gabriela/gabriela');

describe('Framework events', function() {
    this.timeout(10000);
    
    it('should execute a named module start and finished event', () => {
        let onModuleStarted = false;
        let onModuleFinished = false;

        const userServiceInit = {
            name: 'userService',
            init: function() {
                function UserService() {}

                return new UserService();
            }
        };

        const module = {
            name: 'eventsModule',
            mediator: {
                onModuleStarted: function(userService) {
                    onModuleStarted = true;

                    expect(userService).to.be.a('object');
                },
                onModuleFinished: function(userService) {
                    onModuleFinished = true;

                    expect(userService).to.be.a('object');
                },
            },
            dependencies: [userServiceInit],
        };

        const g = gabriela.asProcess();

        g.addModule(module);

        return g.runModule().then(() => {
            expect(onModuleStarted).to.be.equal(true);
            expect(onModuleFinished).to.be.equal(true);
        });
    });

    it('should properly execute start and finished events when they contain async code', () => {
        let onModuleStarted = false;
        let onModuleFinished = false;

        const userServiceInit = {
            name: 'userService',
            init: function() {
                function UserService() {}

                return new UserService();
            }
        };

        const module = {
            name: 'eventsModule',
            mediator: {
                onModuleStarted: function(next, userService) {
                    requestPromise.get('https://www.google.com').then(() => {
                        onModuleStarted = true;

                        expect(userService).to.be.a('object');

                        next();
                    });
                },
                onModuleFinished: function(next, userService) {
                    requestPromise.get('https://www.google.com').then(() => {
                        onModuleFinished = true;

                        expect(userService).to.be.a('object');

                        next();
                    });
                }
            },
            dependencies: [userServiceInit],
        };

        const g = gabriela.asProcess();

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

        const userServiceInit = {
            name: 'userService',
            init: function() {
                function UserService() {}

                return new UserService();
            }
        };

        const mdl = {
            name: 'eventsModule',
            dependencies: [userServiceInit],
            mediator: {
                onModuleStarted: function(next, userService) {
                    requestPromise.get('https://www.google.com').then(() => {
                        onModuleStarted = true;

                        expect(execution).to.be.equal(0);
                        expect(userService).to.be.a('object');

                        next();
                    });
                },
                onModuleFinished: function(next, userService) {
                    requestPromise.get('https://www.google.com').then(() => {
                        onModuleFinished = true;

                        expect(execution).to.be.equal(5);
                        expect(userService).to.be.a('object');

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
            validators: [function(next, userService) {
                requestPromise.get('https://www.google.com').then(() => {
                    ++execution;

                    expect(userService).to.be.a('object');

                    next();
                });
            }],
            moduleLogic: [function(next) {
                requestPromise.get('https://www.google.com').then(() => {
                    ++execution;

                    next();
                });
            }],
            postLogicTransformers: [function(next, userService) {
                requestPromise.get('https://www.google.com').then(() => {
                    ++execution;

                    expect(userService).to.be.a('object');

                    next();
                });
            }],
        };

        const g = gabriela.asProcess();

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

        const userServiceInit = {
            name: 'userService',
            init: function() {
                function UserService() {}

                return new UserService();
            }
        };

        const module = {
            name: 'eventsModule',
            dependencies: [userServiceInit],
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
                onError(e, userService) {
                    entersOnError = true;

                    expect(userService).to.be.a('object');

                    expect(e).to.be.instanceof(Error);
                    expect(e.message).to.be.equal('Something went wrong');
                }
            }
        };

        const g = gabriela.asProcess();

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

        const userServiceInit = {
            name: 'userService',
            init: function() {
                function UserService() {}

                return new UserService();
            }
        };

        const module = {
            name: 'eventsModule',
            dependencies: [userServiceInit],
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

                    expect(e).to.be.instanceof(Error);
                    expect(e.message).to.be.equal('Something went wrong');
                }
            }
        };

        const g = gabriela.asProcess();

        g.addModule(module);

        return g.runModule().then(() => {
            assert.fail('This test should fail');
        }).catch(() => {
            expect(entersOnError).to.be.equal(true);
            expect(onModuleStarted).to.be.equal(true);
            expect(onModuleFinished).to.be.equal(true);
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
            }],
        };

        const g = gabriela.asProcess();

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
            },
            moduleLogic: [function() {
                this.mediator.mediate('customMediator');
            }],
        };

        const g = gabriela.asProcess();

        g.addModule(module);

        return g.runModule().then(() => {
            expect(customEventExecuted).to.be.equal(true);
        });
    });

    it('should resolve a dependency within a custom mediator event', () => {
        let customEventExecuted = false;

        const userServiceInit = {
            name: 'userService',
            init: function() {
                function UserService() {}

                return new UserService();
            }
        }

        const module = {
            name: 'eventsModule',
            mediator: {
                customMediator: function(userService) {
                    customEventExecuted = true;

                    expect(userService).to.be.a('object');
                }
            },
            moduleLogic: [function() {
                this.mediator.mediate('customMediator');
            }],
            dependencies: [userServiceInit],
        };

        const g = gabriela.asProcess();

        g.addModule(module);

        return g.runModule().then(() => {
            expect(customEventExecuted).to.be.equal(true);
        });
    });

    it('should execute a plugins module start and finished event', () => {
        let onPluginFinished = false;
        let onPluginStarted = false;

        const userServiceInit = {
            name: 'userService',
            init: function() {
                function UserService() {}

                return new UserService();
            }
        };

        const module = {
            name: 'eventsModule',
            dependencies: [userServiceInit],
        };

        const plugin = {
            name: 'plugin',
            modules: [module],
            mediator: {
                onPluginStarted() {
                    onPluginStarted = true;
                },
                onPluginFinished() {
                    onPluginFinished = true;
                }
            }
        }

        const g = gabriela.asProcess();

        g.addPlugin(plugin);

        return g.runPlugin().then(() => {
            expect(onPluginStarted).to.be.equal(true);
            expect(onPluginFinished).to.be.equal(true);
        });
    });

    it('should properly execute start and finished events when they contain async code', () => {
        let onModuleStarted = false;
        let onModuleFinished = false;

        const userServiceInit = {
            name: 'userService',
            scope: 'plugin',
            init: function() {
                function UserService() {}

                return new UserService();
            }
        };

        const module = {
            name: 'eventsModule',
            dependencies: [userServiceInit],
        };

        const g = gabriela.asProcess();

        g.addPlugin({
            name: 'plugin',
            modules: [module],
            mediator: {
                onPluginStarted: function(next, userService) {
                    requestPromise.get('https://www.google.com').then(() => {
                        onModuleStarted = true;

                        expect(userService).to.be.a('object');

                        next();
                    });
                },
                onPluginFinished: function(next, userService) {
                    requestPromise.get('https://www.google.com').then(() => {
                        onModuleFinished = true;

                        expect(userService).to.be.a('object');

                        next();
                    });
                }
            }
        });

        return g.runPlugin().then(() => {
            expect(onModuleStarted).to.be.equal(true);
            expect(onModuleFinished).to.be.equal(true);
        });
    });

    it('should properly execute start and finished events before and after all middleware executes when within a plugin', () => {
        let onModuleStarted = false;
        let onModuleFinished = false;
        let onPluginStarted = false;
        let onPluginFinished = false;

        let execution = 0;

        const userServiceInit = {
            name: 'userService',
            init: function() {
                function UserService() {}

                return new UserService();
            }
        };

        const mdl = {
            name: 'eventsModule',
            dependencies: [userServiceInit],
            mediator: {
                onModuleStarted: function(next, userService) {
                    requestPromise.get('https://www.google.com').then(() => {
                        onModuleStarted = true;

                        expect(execution).to.be.equal(0);
                        expect(userService).to.be.a('object');

                        next();
                    });
                },
                onModuleFinished: function(next, userService) {
                    requestPromise.get('https://www.google.com').then(() => {
                        onModuleFinished = true;

                        expect(execution).to.be.equal(5);
                        expect(userService).to.be.a('object');

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
            validators: [function(next, userService) {
                requestPromise.get('https://www.google.com').then(() => {
                    ++execution;

                    expect(userService).to.be.a('object');

                    next();
                });
            }],
            moduleLogic: [function(next) {
                requestPromise.get('https://www.google.com').then(() => {
                    ++execution;

                    next();
                });
            }],
            postLogicTransformers: [function(next, userService) {
                requestPromise.get('https://www.google.com').then(() => {
                    ++execution;

                    expect(userService).to.be.a('object');

                    next();
                });
            }],
        };

        const g = gabriela.asProcess();

        g.addPlugin({
            name: 'name',
            modules: [mdl],
            mediator: {
                onPluginStarted: function() {
                    onPluginStarted = true;
                },
                onPluginFinished: function() {
                    onPluginFinished = true;
                }
            }
        });

        return g.runPlugin().then(() => {
            expect(onModuleStarted).to.be.equal(true);
            expect(onModuleFinished).to.be.equal(true);
            expect(onPluginStarted).to.be.equal(true);
            expect(onPluginFinished).to.be.equal(true);
        });
    });

    it('should not resolve onPluginFinished if onPluginStarted threw an error', () => {
        let onPluginStarted = false;
        let onPluginFinished = false;
        let entersOnError = false;

        const userServiceInit = {
            name: 'userService',
            scope: 'plugin',
            init: function() {
                function UserService() {}

                return new UserService();
            }
        };

        const module = {
            name: 'eventsModule',
            dependencies: [userServiceInit],
        };

        const g = gabriela.asProcess();

        g.addPlugin({
            name: 'plugin',
            modules: [module],
            mediator: {
                onPluginStarted(throwException) {
                    onPluginStarted = true;

                    throwException(new Error('Something went wrong'));
                },
                onPluginFinished() {
                    onPluginFinished = true;
                },
                onError(e) {
                    expect(e.message).to.be.equal('Something went wrong');
                    entersOnError = true;
                }
            }
        });

        return g.runPlugin().then(() => {
            assert.fail('This test should fail');
        }).catch(() => {
            expect(entersOnError).to.be.equal(true);
            expect(onPluginStarted).to.be.equal(true);
            expect(onPluginFinished).to.be.equal(true);
        });
    });
});