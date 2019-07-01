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
});