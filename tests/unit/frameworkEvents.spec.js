const mocha = require('mocha');
const chai = require('chai');
const assert = require('assert');
const requestPromise = require('request-promise');
const deasync = require('deasync');

const it = mocha.it;
const describe = mocha.describe;
const expect = chai.expect;

const gabriela = require('../../gabriela/gabriela');
const Mediator = require('../../gabriela/events/mediator');
const ServerMediator = require('../../gabriela/events/genericMediator');
const Compiler = require('../../gabriela/dependencyInjection/compiler');

describe('Framework events', function() {
    this.timeout(10000);

    it('a server mediator event should execute an fn', () => {
        const userServiceDefinition = {
            name: 'userService',
            init: function() {
                function UserService() {}

                return new UserService();
            },
        };
        const rootCompiler = Compiler.create();
        rootCompiler.add(userServiceDefinition);

        const serverMediator = ServerMediator.create(rootCompiler);

        const context = {name: 'thisContext'};

        let called = false;
        serverMediator.callEvent(function(userService) {
            called = true;

            expect(userService).to.be.a('object');
            expect(this).to.have.property('name');
            expect(this.name).to.be.equal('thisContext');
        }, context);

        expect(called).to.be.equal(true);
    });

    it('should validate that the mediator interface is working as expected', () => {
        const mediator = Mediator.create(null, null);

        // only the has() method is tested because the mediator has to have a 
        // module or plugin that has all the neccessary compilers with them
        mediator.add('event1', function() {});
        mediator.add('event2', function() {});

        expect(mediator.has('event1')).to.be.equal(true);
        expect(mediator.has('event2')).to.be.equal(true);
    });
    
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

                expect(this).to.have.property('emitter');
                expect(this.emitter).to.be.a('object');
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
                this.mediator.emit('customMediator');
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
                this.mediator.emit('customMediator');
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
                },
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

    it('should run the onError mediator event if the exception is thrown inside middleware fn', () => {
        let onErrorCalled = false;

        const userServiceDefinition = {
            name: 'userService',
            init: function() {
                function UserService() {}

                return new UserService();
            }
        };

        const mdl = {
            name: 'errorModule',
            dependencies: [userServiceDefinition],
            mediator: {
                onError(e, userService) {
                    onErrorCalled = true;

                    expect(e).to.be.instanceof(Error);
                    expect(userService).to.be.a('object');
                }
            },
            moduleLogic: [function(throwException) {
                throwException(new Error('Something went wrong'));
            }],
        };

        const g = gabriela.asProcess();

        g.addModule(mdl);

        return g.runModule().then(() => {
            expect(onErrorCalled).to.be.equal(true);
        });
    });

    it('should run the plugins onError if the module does not have an onError mediator event', (done) => {
        let onErrorCalled = false;

        const userServiceDefinition = {
            name: 'userService',
            scope: 'plugin',
            init: function() {
                function UserService() {}

                return new UserService();
            }
        };

        const mdl = {
            name: 'errorModule',
            dependencies: [userServiceDefinition],
            moduleLogic: [function(throwException) {
                throwException(new Error('Something went wrong'));
            }],
        };

        const g = gabriela.asProcess();

        g.addPlugin({
            name: 'errorPlugin',
            mediator: {
                onError(e, userService) {
                    onErrorCalled = true;

                    expect(userService).to.be.a('object');
                    expect(e).to.be.instanceof(Error);
                    expect(e.message).to.be.equal('Something went wrong');
                }
            },
            modules: [mdl],
        });

        g.runPlugin().then(() => {
            expect(onErrorCalled).to.be.equal(true);

            done();
        });
    });

    it('should propagate the mediator event from module to plugin if not exist in module', () => {
        let pluginEventCalled = false;

        const userServiceDefinition = {
            name: 'userService',
            scope: 'plugin',
            init: function() {
                function UserService() {}

                return new UserService();
            }
        };

        const mdl = {
            name: 'errorModule',
            dependencies: [userServiceDefinition],
            moduleLogic: [function() {
                this.mediator.emit('onPluginEvent');
            }],
        };

        const g = gabriela.asProcess();

        g.addPlugin({
            name: 'plugin',
            mediator: {
                onPluginEvent: function(userService) {
                    pluginEventCalled = true;

                    expect(userService).to.be.a('object');
                }
            },
            modules: [mdl],
        });

        g.runPlugin().then(() => {
            expect(pluginEventCalled).to.be.equal(true);
        });
    });

    it('should pass custom arguments along with dependency injected arguments to mediator event', () => {
        let mediatorCalled = false;

        const userServiceDefinition = {
            name: 'userService',
            init: function() {
                function UserService() {}

                return new UserService();
            },
        };

        const mdl = {
            name: 'errorModule',
            dependencies: [userServiceDefinition],
            mediator: {
                onMediatorEvent(userService, customArg, aString, someObject) {
                    mediatorCalled = true;

                    expect(userService).to.be.a('object');
                    expect(customArg).to.be.equal(5);
                    expect(aString).to.be.equal('string');
                    expect(someObject).to.be.a('object');
                }
            },
            moduleLogic: [function() {
                this.mediator.emit('onMediatorEvent', {
                    customArg: 5,
                    aString: 'string',
                    someObject: {},
                })
            }],
        };

        const g = gabriela.asProcess();

        g.addModule(mdl);

        g.runModule().then(() => {
            expect(mediatorCalled).to.be.equal(true);
        })
    });

    it('should run a batch of async events of a single event in a module context', (done) => {
        // create a changeDetector (watcher) with onChange to watch for prop changes on batchesCalled
        const changeDetector = (object, onChange) => {
            const handler = {
                get(target, property, receiver) {
                    return target[property];
                },
                set(obj, prop, value) {
                    obj[prop] = value;

                    onChange.call(null, obj);
                }
            };

            return new Proxy(object, handler);
        };

        const batchesCalled = changeDetector({num: 0}, function(obj) {
            if (obj.num === 3) {
                done();
            }
        });

        const mdl = {
            name: 'eventEmitterModule',
            emitter: {
                onRunJob: [
                    function() {
                        batchesCalled.num = batchesCalled.num + 1;
                    },
                    function() {
                        batchesCalled.num = batchesCalled.num + 1;
                    },
                    function() {
                        batchesCalled.num = batchesCalled.num + 1;
                    },
                ],
            },
            moduleLogic: [function() {
                this.emitter.emit('onRunJob');
            }],
        };

        const g = gabriela.asProcess();

        g.addModule(mdl);

        g.runModule();
    });

    it('should run a batch of async event of multiple emitters in a module context', (done) => {
        const changeDetector = (object, onChange) => {
            const handler = {
                get(target, property, receiver) {
                    return target[property];
                },
                set(obj, prop, value) {
                    obj[prop] = value;

                    onChange.call(null, obj);
                }
            };

            return new Proxy(object, handler);
        };

        let oneFinished = false;

        const onRun1 = changeDetector({num: 0}, function(obj) {
            if (obj.num === 3 && oneFinished) {
                done();
            }

            if (obj.num === 3 && !oneFinished) {
                oneFinished = true;
            }
        });

        const onRun2 = changeDetector({num: 0}, function(obj) {
            if (obj.num === 3 && oneFinished) {
                done();
            }

            if (obj.num === 3 && !oneFinished) {
                oneFinished = true;
            }
        });

        const mdl = {
            name: 'eventEmitterModule',
            emitter: {
                onRun1: [
                    function() {
                        onRun1.num = onRun1.num + 1;
                    },
                    function() {
                        onRun1.num = onRun1.num + 1;
                    },
                    function() {
                        onRun1.num = onRun1.num + 1;
                    },
                ],
                onRun2: [
                    function() {
                        onRun2.num = onRun2.num + 1;
                    },
                    function() {
                        onRun2.num = onRun2.num + 1;
                    },
                    function() {
                        onRun2.num = onRun2.num + 1;
                    },
                ],
            },
            moduleLogic: [function() {
                this.emitter.emit('onRun1');
                this.emitter.emit('onRun2');
            }],
        };

        const g = gabriela.asProcess();

        g.addModule(mdl);

        g.runModule();
    });

    it('should run a batch of async event of multiple emitters in a module context and with custom arguments', (done) => {
        const userServiceDefinition = {
            name: 'userService',
            init: function() {
                function UserService() {}

                return new UserService();
            }
        };

        const changeDetector = (object, onChange) => {
            const handler = {
                get(target, property, receiver) {
                    return target[property];
                },
                set(obj, prop, value) {
                    obj[prop] = value;

                    onChange.call(null, obj);
                }
            };

            return new Proxy(object, handler);
        };

        let oneFinished = false;

        const onRun1 = changeDetector({num: 0}, function(obj) {
            if (obj.num === 3 && oneFinished) {
                done();
            }

            if (obj.num === 3 && !oneFinished) {
                oneFinished = true;
            }
        });

        const onRun2 = changeDetector({num: 0}, function(obj) {
            if (obj.num === 3 && oneFinished) {
                done();
            }

            if (obj.num === 3 && !oneFinished) {
                oneFinished = true;
            }
        });

        const mdl = {
            name: 'eventEmitterModule',
            dependencies: [userServiceDefinition],
            emitter: {
                onRun1: [
                    function(num, aString) {
                        onRun1.num = onRun1.num + 1;

                        expect(num).to.be.equal(5);
                        expect(aString).to.be.equal('string');
                    },
                    function(num, aString, userService) {
                        onRun1.num = onRun1.num + 1;

                        expect(userService).to.be.a('object');

                        expect(num).to.be.equal(5);
                        expect(aString).to.be.equal('string');
                    },
                    function(num, aString, userService) {
                        onRun1.num = onRun1.num + 1;

                        expect(userService).to.be.a('object');

                        expect(num).to.be.equal(5);
                        expect(aString).to.be.equal('string');
                    },
                ],
                onRun2: [
                    function(num, aString) {
                        onRun2.num = onRun2.num + 1;

                        expect(num).to.be.equal(7);
                        expect(aString).to.be.equal('aString');
                    },
                    function(num, aString, userService) {
                        onRun2.num = onRun2.num + 1;

                        expect(userService).to.be.a('object');

                        expect(num).to.be.equal(7);
                        expect(aString).to.be.equal('aString');
                    },
                    function(num, aString, userService) {
                        onRun2.num = onRun2.num + 1;

                        expect(userService).to.be.a('object');

                        expect(num).to.be.equal(7);
                        expect(aString).to.be.equal('aString');
                    },
                ],
            },
            moduleLogic: [function() {
                this.emitter.emit('onRun1', {num: 5, aString: 'string'});
                this.emitter.emit('onRun2', {num: 7, aString: 'aString'});
            }],
        };

        const g = gabriela.asProcess();

        g.addModule(mdl);

        g.runModule();
    });

    it('should propagate a mediator event from module to plugin', (done) => {
        let mdlEventCalled = false;
        let pluginEventCalled = false;

        const mdl = {
            name: 'module',
            mediator: {
                onEvent: function() {
                    mdlEventCalled = true;
                }
            },
            moduleLogic: [function() {
                this.mediator.emit('onEvent', null, true);
            }]
        };

        const plugin = {
            name: 'plugin',
            mediator: {
                onEvent: function() {
                    pluginEventCalled = true;
                }
            },
            modules: [mdl],
        };

        const g = gabriela.asProcess();

        g.addPlugin(plugin);

        g.runPlugin().then(() => {
            expect(mdlEventCalled).to.be.equal(true);
            expect(pluginEventCalled).to.be.equal(true);
            
            done();
        });
    });


});