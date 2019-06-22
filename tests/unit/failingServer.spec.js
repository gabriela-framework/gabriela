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
                port: 'invalid',
            });
        } catch (err) {
            entersException = true;

            expect(err.message).to.be.equal(`Invalid server configuration. 'port' has to be an integer`);
        }

        expect(entersException).to.be.equal(true);

        entersException = false;
        try {
            gabriela.asServer({
                port: 3000,
                runCallback: null,
            });
        } catch (err) {
            entersException = true;

            expect(err.message).to.be.equal(`Invalid server configuration. 'runCallback' must be a function`);
        }

        expect(entersException).to.be.equal(true);
    });
});