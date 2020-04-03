const mocha = require('mocha');
const chai = require('chai');

const it = mocha.it;
const describe = mocha.describe;
const expect = chai.expect;

const gabriela = require('../../src/gabriela/gabriela');

describe('Failing server tests', () => {
    it('should fail the process because of invalid catchError event', () => {
        const config = {
            events: {
                catchError: null,
            }
        };

        let entersException = false;
        try {
            gabriela.asProcess(config);
        } catch(e) {
            entersException = true;

            expect(e.message).to.be.equal(`Invalid event. 'catchError' must be a function. Due to this error, the app cannot start.`);
        }

        expect(entersException).to.be.equal(true);
    });

    it('should fail the process because of invalid onAppStarted event', () => {
        const config = {
            events: {
                onAppStarted: null,
            }
        };

        let entersException = false;
        try {
            gabriela.asProcess(config);
        } catch(e) {
            entersException = true;

            expect(e.message).to.be.equal(`Invalid event. 'onAppStarted' must be a function. Due to this error, the app cannot start.`);
        }

        expect(entersException).to.be.equal(true);
    });
});
