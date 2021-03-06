const mocha = require('mocha');
const chai = require('chai');
const assert = require('assert');
const requestPromise = require('request-promise');

const it = mocha.it;
const describe = mocha.describe;
const expect = chai.expect;

const gabriela = require('../../src/gabriela/gabriela');
const Mediator = require('../../src/gabriela/events/mediator');
const Emitter = require('../../src/gabriela/events/emitter');
const Compiler = require('../../src/gabriela/dependencyInjection/compiler');
const GenericMediator = require('../../src/gabriela/events/genericMediator');
const ExposedMediator = require('../../src/gabriela/events/exposedMediator');

describe('Failing framework events', () => {
    it('a concrete server mediator should fail to compile a dependency if it does not exist', () => {
        const rootCompiler = Compiler.create();

        const genericMediator = GenericMediator.create(rootCompiler);

        const context = {name: 'thisContext'};

        let enteredException = false;
        try {
            genericMediator.callEvent(function(userService) {}, context);
        } catch (e) {
            enteredException = true;
        }

        expect(enteredException).to.be.equal(true);
    });

    it('a concrete mediator should fail if an event that already exists is added', () => {
        const mediator = Mediator.create(null, null);

        mediator.add('event1', () => {});

        let entersException = false;
        try {
            mediator.add('event1', () => {});
        } catch(e) {
            entersException = true;

            expect(e.message).to.be.equal(`Invalid mediator event. Mediator with name 'event1' already exist`)
        }

        expect(entersException).to.be.equal(true);
    });

    it('a concrete mediator should fail if an event that already exists is added', () => {
        const emitter = Emitter.create(null, null);

        emitter.add('event1', () => {});

        let entersException = false;
        try {
            emitter.add('event1', () => {});
        } catch(e) {
            entersException = true;

            expect(e.message).to.be.equal(`Invalid emitter event. Emitter with name 'event1' already exist`)
        }

        expect(entersException).to.be.equal(true);
    });

    it('should fail if mediator is not a valid data type', () => {
        const mdl = {
            name: 'name',
            mediator: null,
        };

        const g = gabriela.asProcess();

        let entersException = false;
        try {
            g.addModule(mdl);
        } catch (e) {
            entersException = true;

            expect(e.message).to.be.equal(`Invalid module definition in module 'name'. 'mediator' property must be an object`);
        }

        expect(entersException).to.be.equal(true);
    });

    it('should fail if mediator has invalid onModuleStarted event data type', () => {
        const mdl = {
            name: 'name',
            mediator: {
                onModuleStarted: null
            },
        };

        const g = gabriela.asProcess();

        let entersException = false;
        try {
            g.addModule(mdl);
        } catch (e) {
            entersException = true;

            expect(e.message).to.be.equal(`Invalid module definition in module '${mdl.name}'. 'mediator.onModuleStarted' must be a function`);
        }

        expect(entersException).to.be.equal(true);
    });

    it('should fail if mediator has invalid onModuleFinished event data type', () => {
        const mdl = {
            name: 'name',
            mediator: {
                onModuleFinished: null
            },
        };

        const g = gabriela.asProcess();

        let entersException = false;
        try {
            g.addModule(mdl);
        } catch (e) {
            entersException = true;

            expect(e.message).to.be.equal(`Invalid module definition in module '${mdl.name}'. 'mediator.onModuleFinished' must be a function`);
        }

        expect(entersException).to.be.equal(true);
    });

    it('should fail if mediator has invalid onError event data type', () => {
        const mdl = {
            name: 'name',
            mediator: {
                onError: null
            },
        };

        const g = gabriela.asProcess();

        let entersException = false;
        try {
            g.addModule(mdl);
        } catch (e) {
            entersException = true;

            expect(e.message).to.be.equal(`Invalid module definition in module '${mdl.name}'. 'mediator.onError' must be a function`);
        }

        expect(entersException).to.be.equal(true);
    });

    it('should fail if mediator has invalid onPreResponse event data type', () => {
        const mdl = {
            name: 'name',
            mediator: {
                onPreResponse: null,
            },
        };

        const g = gabriela.asProcess();

        let entersException = false;
        try {
            g.addModule(mdl);
        } catch (e) {
            entersException = true;

            expect(e.message).to.be.equal(`Invalid module definition in module '${mdl.name}'. 'mediator.onPreResponse' must be a function`);
        }

        expect(entersException).to.be.equal(true);
    });

    it('should fail if mediator has invalid onPostResponse event data type', () => {
        const mdl = {
            name: 'name',
            mediator: {
                onPostResponse: null,
            },
        };

        const g = gabriela.asProcess();

        let entersException = false;
        try {
            g.addModule(mdl);
        } catch (e) {
            entersException = true;

            expect(e.message).to.be.equal(`Invalid module definition in module '${mdl.name}'. 'mediator.onPostResponse' must be a function`);
        }

        expect(entersException).to.be.equal(true);
    });

    it('should fail if mediator in plugin is not a valid data type', () => {
        const mdl = {
            name: 'name',
        };

        const g = gabriela.asProcess();

        let entersException = false;
        try {
            g.addPlugin({
                name: 'plugin',
                modules: [mdl],
                mediator: null,
            });
        } catch (e) {
            entersException = true;

            expect(e.message).to.be.equal(`Invalid plugin definition. 'mediator' property must be an object`);
        }

        expect(entersException).to.be.equal(true);
    });

    it('should fail to emit an propagated event if the third argument to emit() is not a boolean', (done) => {
        const mdl = {
            name: 'module',
            mediator: {
                onEvent: function() {

                }
            },
            moduleLogic: [function() {
                this.mediator.emit('onEvent', null, 'nonBoolean');
            }],
        };

        const g = gabriela.asProcess({
            events: {
                catchError() {
                    done();
                }

            }
        });

        g.addModule(mdl);

        g.startApp();
    });

    it('should fail if mediator in plugin has invalid onPluginStarted event data type', () => {
        const mdl = {
            name: 'name',
        };

        const g = gabriela.asProcess();

        let entersException = false;
        try {
            g.addPlugin({
                name: 'name',
                modules: [mdl],
                mediator: {
                    onPluginStarted: null,
                }
            });
        } catch (e) {
            entersException = true;

            expect(e.message).to.be.equal(`Invalid plugin definition. 'mediator.onPluginStarted' must be a function`);
        }

        expect(entersException).to.be.equal(true);
    });

    it('should fail if mediator in plugin has invalid onPluginFinished event data type', () => {
        const mdl = {
            name: 'name',
        };

        const g = gabriela.asProcess();

        let entersException = false;

        try {
            g.addPlugin({
                name: 'name',
                modules: [mdl],
                mediator: {
                    onPluginFinished: null,
                }
            });
        } catch (e) {
            entersException = true;

            expect(e.message).to.be.equal(`Invalid plugin definition. 'mediator.onPluginFinished' must be a function`);
        }

        expect(entersException).to.be.equal(true);
    });

    it('should fail if the mediator event value is not a function', () => {
        const mdl = {
            name: 'name',
            mediator: {
                onEvent: null,
            },
        };

        const g = gabriela.asProcess();

        let entersException = false;
        try {
            g.addModule(mdl);
        } catch (e) {
            entersException = true;

            expect(e.message).to.be.equal(`Invalid module definition in module '${mdl.name}'. 'mediator.onEvent' must be a function`);
        }

        expect(entersException).to.be.equal(true);
    });

    it('should fail if mediator event in plugin is not a function', () => {
        const mdl = {
            name: 'name',
        };

        const g = gabriela.asProcess();

        let entersException = false;

        try {
            g.addPlugin({
                name: 'plugin',
                modules: [mdl],
                mediator: {
                    onEvent: null,
                }
            });
        } catch (e) {
            entersException = true;

            expect(e.message).to.be.equal(`Invalid plugin definition. 'mediator.onEvent' must be a function`);
        }

        expect(entersException).to.be.equal(true);
    });

    it('exposed event should throw an exception if it already exists', () => {
        const exposedMediator = new ExposedMediator();

        exposedMediator.add('event1');
        exposedMediator.add('event2');

        let entersException = false;
        try {
            exposedMediator.add('event1');
        } catch (e) {
            entersException = true;

            expect(e.message).to.be.equal(`Invalid exposed event. Exposed event with name 'event1' already exists`)
        }

        expect(entersException).to.be.equal(true);
    });

    it('should throw an error if an emitted exposed event does not exist', () => {
        const exposedMediator = new ExposedMediator();

        let entersException = false;
        try {
            exposedMediator.emit('nonExistent');
        } catch (e) {
            entersException = true;

            expect(e.message).to.be.equal(`Invalid exposed event. Exposed event with name 'nonExistent' does not exist`);
        }

        expect(entersException).to.be.equal(true);
    });

    it('should fail to send a response inside onPostResponse event when the response is already sent', (done) => {
        let onPostResponseCalled = false;

        const routes = [
            {
                name: 'route',
                path: '/path',
                method: 'get',
            },
        ];

        const config = {
            routes: routes,
            events: {
                onAppStarted() {
                    requestPromise.get('http://localhost:3000/path').then(() => {
                        setTimeout(() => {
                            expect(onPostResponseCalled).to.be.equal(true);

                            this.gabriela.close();

                            done();

                        }, 500);
                    });
                },
            }
        };

        const g = gabriela.asServer(config);

        g.addModule({
            name: 'module',
            mediator: {
                onError(e) {
                    expect(e).to.be.instanceof(Error);
                },
                onPostResponse(http) {
                    onPostResponseCalled = true;

                    http.res.send(200, 'Will not be sent');
                }
            },
            route: 'route',
            moduleLogic: [function(http) {
                http.res.send(200, 'Response');
            }],
        });

        g.startApp();
    });

    it('should fail if the exposed events concrete instance is not used as it should be', () => {
        const rootCompiler = Compiler.create();

        rootCompiler.add({
            name: 'userService',
            init: function() {
                function UserService() {}

                return new UserService();
            }
        });

        const exposedMediator = new ExposedMediator();

        exposedMediator.add('onExposedEvent');
        exposedMediator.emit('onExposedEvent', rootCompiler);

        try {
            exposedMediator.preBind('onExposedEvent', function() {});
        } catch (e) {
            expect(e.message).to.be.equal(`Internal Gabriela error. Invalid usage of exposed mediator instance. Exposed events must be first pre bound then emitted. It seems that event 'onExposedEvent' has been emitted first and then bound. This should not happen`);
        }
    });

    it('should fail if preBound() event is not a function', () => {
        const rootCompiler = Compiler.create();

        rootCompiler.add({
            name: 'userService',
            init: function() {
                function UserService() {}

                return new UserService();
            }
        });

        const exposedMediator = new ExposedMediator();

        exposedMediator.add('onExposedEvent');

        try {
            exposedMediator.preBind('onExposedEvent', {});
        } catch (e) {
            expect(e.message).to.be.equal(`Invalid exposed event. 'onExposedEvent' event has tried to pre bind something that is not a function`);
        }
    });

    it('should fail if onModuleStarted do not have an onError event attached', (done) => {
        const g = gabriela.asProcess({
            events: {
                catchError(e) {
                    expect(e.message).to.be.equal('Something went wrong');

                    done();
                }
            }
        });

        g.addModule({
            name: 'name',
            mediator: {
                onModuleStarted() {
                    throw new Error('Something went wrong');
                }
            }
        });

        g.startApp();
    });

    it('should fail if onModuleFinished do not have an onError event attached', (done) => {
        const g = gabriela.asProcess({
            events: {
                catchError(e) {
                    expect(e.message).to.be.equal('Something went wrong');

                    done();
                }
            }
        });

        g.addModule({
            name: 'name',
            mediator: {
                onModuleFinished() {
                    throw new Error('Something went wrong');
                }
            }
        });

        g.startApp();
    });

    it('should throw an error if an event does not exist if propagate is set to true', (done) => {
        const g = gabriela.asProcess({
            events: {
                catchError(e) {
                    expect(e.message).to.be.equal(`Invalid mediator event. Mediator with name 'onEvent' does not exist in module 'module'`);

                    done();
                }
            }
        });

        const mdl = {
            name: 'module',
            moduleLogic: [function() {
                this.mediator.emit('onEvent', null, true);
            }],
        };

        g.addModule(mdl);

        g.startApp();
    });

    it('should throw an error if a service does not exist when using it in an event', (done) => {
        const g = gabriela.asProcess({
            events: {
                catchError(e) {
                    expect(e.message).to.be.equal(`Argument resolving error. Cannot resolve argument with name 'nonExistentService'`);

                    done();
                }
            }
        });

        const mdl = {
            name: 'module',
            mediator: {
                onFailingEvent(nonExistentService) {

                },
            },
            moduleLogic: [function() {
                this.mediator.emit('onFailingEvent');
            }],
        };

        g.addModule(mdl);

        g.startApp();
    });

    it('should throw an error if a mediator event does not exist', (done) => {
        const g = gabriela.asProcess({
            events: {
                catchError(e) {
                    expect(e.message).to.be.equal(`Invalid mediator event. Mediator with name 'onFailingEvent' does not exist in module 'module'`);

                    done();
                }
            }
        });

        const mdl = {
            name: 'module',
            mediator: {
            },
            moduleLogic: [function() {
                this.mediator.emit('onFailingEvent');
            }],
        };

        g.addModule(mdl);

        g.startApp();
    });
});
