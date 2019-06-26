const mocha = require('mocha');
const chai = require('chai');

const it = mocha.it;
const describe = mocha.describe;
const expect = chai.expect;

const gabriela = require('../../gabriela/gabriela');

describe('Framework events', () => {
    it('should execute a named module start event', () => {
        const module = {
            name: 'module',
            events: {
                onModuleStarted: function() {

                },
                onModuleFinished: function() {

                }
            }
        }
    });
});