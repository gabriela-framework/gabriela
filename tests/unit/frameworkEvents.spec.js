const mocha = require('mocha');
const chai = require('chai');
const assert = require('assert');

const it = mocha.it;
const describe = mocha.describe;
const expect = chai.expect;

const gabriela = require('../../gabriela/gabriela');

describe('Framework events', () => {
    it('should execute a named module start event', () => {
        let onModuleStarted = false;
        let onModuleFinished = false;

        const module = {
            name: 'module',
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
});