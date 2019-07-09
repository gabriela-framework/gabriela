const mocha = require('mocha');
const chai = require('chai');
const assert = require('assert');

const it = mocha.it;
const describe = mocha.describe;
const expect = chai.expect;

const gabriela = require('../../gabriela/gabriela');

describe('Failing tests using modules as http modules',() => {
    it('should fail if http is not of type object', () => {
        const mdl = {
            name: 'httpModule',
            http: null,
        };

        const app = gabriela.asProcess();

        let entersException = false;
        try {
            app.addModule(mdl);
        } catch (e) {
            entersException = true;

            expect(e.message).to.be.equal(`Invalid module definition in module '${mdl.name}'. 'http' property must be an object`)
        }

        expect(entersException).to.be.equal(true);
    });
});