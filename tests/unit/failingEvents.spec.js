const mocha = require('mocha');
const chai = require('chai');

const it = mocha.it;
const describe = mocha.describe;
const expect = chai.expect;

const gabriela = require('../../gabriela/gabriela');
const Mediator = require('../../gabriela/events/mediator');
const Emitter = require('../../gabriela/events/emitter');
const Compiler = require('../../gabriela/dependencyInjection/compiler');
const ServerMediator = require('../../gabriela/events/serverMediator');
const ExposedEvents = require('../../gabriela/events/exposedEvents');

describe('Failing framework events', () => {
    it('a concrete server mediator should fail to compile a dependency if it does not exist', () => {
        const rootCompiler = Compiler.create();

        const serverMediator = ServerMediator.create(rootCompiler);

        const context = {name: 'thisContext'};

        let enteredException = false;
        try {
            serverMediator.callEvent(function(userService) {}, context);
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

            expect(e.message).to.be.equal(`Invalid module definition. 'mediator' property must be an object`);
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

            expect(e.message).to.be.equal(`Invalid module definition. 'mediator.onModuleStarted' must be a function`);
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

            expect(e.message).to.be.equal(`Invalid module definition. 'mediator.onModuleFinished' must be a function`);
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

            expect(e.message).to.be.equal(`Invalid module definition. 'mediator.onError' must be a function`);
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

        entersException = false;
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

            expect(e.message).to.be.equal(`Invalid module definition. 'mediator.onEvent' must be a function`);
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
        const exposedEvents = new ExposedEvents();

        const event1 = {
            name: 'event1',
            init: function() {}
        };

        const event2 = {
            name: 'event2',
            init: function() {},
        };

        exposedEvents.add(event1);
        exposedEvents.add(event2);

        let entersException = false;
        try {
            exposedEvents.add({
                name: 'event1',
                init: function() {},
            });
        } catch (e) {
            entersException = true;

            expect(e.message).to.be.equal(`Invalid exposed event. Exposed event with name '${event1.name} already exists'`)
        }

        expect(entersException).to.be.equal(true);
    });

    it('should throw an error if an emitted exposed event does not exist', () => {
        const exposedEvents = new ExposedEvents();

        let entersException = false;
        try {
            exposedEvents.emit('nonExistent');
        } catch (e) {
            entersException = true;

            expect(e.message).to.be.equal(`Invalid exposed event. Exposed event with name 'nonExistent' does not exist`);
        }

        expect(entersException).to.be.equal(true);
    });

    it('should throw an error if a service in emitted exposed event does not exist', () => {
        const exposedEvents = new ExposedEvents();
        const compiler = Compiler.create();

        let eventCalled = false;
        const eventDefinition = {
            name: 'event',
            init: function(userService) {
                eventCalled = true;
            }
        };

        exposedEvents.add(eventDefinition);

        let entersException = false;
        try {
            exposedEvents.emit('event', compiler, {
                num: 5,
                aString: 'string',
            });
        } catch (e) {
            entersException = true;

            expect(e.message).to.be.equal(`Argument resolving error. Cannot resolve argument with name 'userService'`);
        }

        expect(entersException).to.be.equal(true);
    });

    it('should throw an error if a custom argument cannot be resolved in a emitted exposed event', () => {
        const exposedEvents = new ExposedEvents();

        let eventCalled = false;
        const eventDefinition = {
            name: 'event',
            init: function(num, aString) {
                eventCalled = true;
            }
        };

        exposedEvents.add(eventDefinition);

        let entersException = false;
        try {
            exposedEvents.emit('event', Compiler.create(), {
                num: 5,
            });
        } catch (e) {
            entersException = true;

            expect(e.message).to.be.equal(`Argument resolving error. Cannot resolve argument with name 'aString'`);
        }

        expect(entersException).to.be.equal(true);
    });
});