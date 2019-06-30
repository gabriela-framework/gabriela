const mocha = require('mocha');
const chai = require('chai');

const it = mocha.it;
const describe = mocha.describe;
const expect = chai.expect;

const gabriela = require('../../gabriela/gabriela');
const Mediator = require('../../gabriela/events/mediator');

describe('Failing framework events', () => {
    it('a concrete mediator should fail if an event that already exist is added', () => {
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

    it('should fail if mediator is not a valid data type', () => {
        const mdl = {
            name: 'name',
            mediator: null,
        };

        const g = gabriela.asProcess();

        try {
            g.addModule(mdl);
        } catch (e) {
            expect(e.message).to.be.equal(`Invalid module definition. 'mediator' property must be an object`);
        }
    });

    it('should fail if mediator has invalid onModuleStarted event data type', () => {
        const mdl = {
            name: 'name',
            mediator: {
                onModuleStarted: null
            },
        };

        const g = gabriela.asProcess();

        try {
            g.addModule(mdl);
        } catch (e) {
            expect(e.message).to.be.equal(`Invalid module definition. 'mediator.onModuleStarted' must be a function`);
        }
    });

    it('should fail if mediator has invalid onModuleFinished event data type', () => {
        const mdl = {
            name: 'name',
            mediator: {
                onModuleFinished: null
            },
        };

        const g = gabriela.asProcess();

        try {
            g.addModule(mdl);
        } catch (e) {
            expect(e.message).to.be.equal(`Invalid module definition. 'mediator.onModuleFinished' must be a function`);
        }
    });

    it('should fail if mediator has invalid onError event data type', () => {
        const mdl = {
            name: 'name',
            mediator: {
                onError: null
            },
        };

        const g = gabriela.asProcess();

        try {
            g.addModule(mdl);
        } catch (e) {
            expect(e.message).to.be.equal(`Invalid module definition. 'mediator.onError' must be a function`);
        }
    });

    it('should fail if mediator in plugin is not a valid data type', () => {
        const mdl = {
            name: 'name',
        };

        const g = gabriela.asProcess();

        try {
            g.addPlugin({
                name: 'plugin',
                modules: [mdl],
                mediator: null,
            });
        } catch (e) {
            expect(e.message).to.be.equal(`Invalid plugin definition. 'mediator' property must be an object`);
        }
    });

    it('should fail if mediator in plugin has invalid onPluginStarted event data type', () => {
        const mdl = {
            name: 'name',
        };

        const g = gabriela.asProcess();

        try {
            g.addPlugin({
                name: 'name',
                modules: [mdl],
                mediator: {
                    onPluginStarted: null,
                }
            });
        } catch (e) {
            expect(e.message).to.be.equal(`Invalid plugin definition. 'mediator.onPluginStarted' must be a function`);
        }
    });

    it('should fail if mediator in plugin has invalid onPluginFinished event data type', () => {
        const mdl = {
            name: 'name',
        };

        const g = gabriela.asProcess();

        try {
            g.addPlugin({
                name: 'name',
                modules: [mdl],
                mediator: {
                    onPluginFinished: null,
                }
            });
        } catch (e) {
            expect(e.message).to.be.equal(`Invalid plugin definition. 'mediator.onPluginFinished' must be a function`);
        }
    });

    it('should fail if mediator in plugin has invalid onError event data type', () => {
        const mdl = {
            name: 'name',
        };

        const g = gabriela.asProcess();

        try {
            g.addPlugin({
                name: 'plugin',
                modules: [mdl],
                mediator: {
                    onError: null,
                }
            });
        } catch (e) {
            expect(e.message).to.be.equal(`Invalid plugin definition. 'mediator.onError' must be a function`);
        }
    });
});