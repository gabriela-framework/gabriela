const mocha = require('mocha');
const chai = require('chai');

const it = mocha.it;
const describe = mocha.describe;
const expect = chai.expect;

const gabriela = require('../../gabriela/gabriela');

describe('Failing server tests', () => {
    it('should validate server options and throw exception', () => {
        // invalid port
        let entersException = false;
        try {
            gabriela.asServer({
                server: {
                    port: 'invalid'
                },
            });
        } catch (err) {
            entersException = true;

            expect(err.message).to.be.equal(`Invalid server configuration. 'port' has to be an integer`);
        }

        expect(entersException).to.be.equal(true);
    });

    it('should fail the server because of invalid onAppStarted event', () => {
        const g = gabriela.asServer({
            server: {
                port: 4000,
            },
        });

        let entersException = false;
        try {
            g.startApp({
                onAppStarted: null,
            });
        } catch(e) {
            entersException = true;

            expect(e.message).to.be.equal(`Invalid event. 'onAppStarted' must be a function. Due to this error, the server cannot start.`);
        }

        expect(entersException).to.be.equal(true);
    });

    it('should fail the server because of invalid catchError event', () => {
        const g = gabriela.asServer({
            server: {
                port: 4000,
            },
        });

        let entersException = false;
        try {
            g.startApp({
                catchError: null,
            });
        } catch(e) {
            entersException = true;

            expect(e.message).to.be.equal(`Invalid event. 'catchError' must be a function. Due to this error, the server cannot start.`);
        }

        expect(entersException).to.be.equal(true);
    });
});