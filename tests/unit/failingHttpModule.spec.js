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

    it('should fail if the route property does not exist if http property exists', () => {
        const mdl = {
            name: 'httpModule',
            http: {},
        };

        const app = gabriela.asProcess();

        let entersException = false;
        try {
            app.addModule(mdl);
        } catch (e) {
            entersException = true;

            expect(e.message).to.be.equal(`Invalid module definition in module '${mdl.name}'. 'http.route' property must exist and be an object if the 'http' property exists`)
        }

        expect(entersException).to.be.equal(true);
    });

    it('should fail if http.route is not an object type', () => {
        const mdl = {
            name: 'httpModule',
            http: {
                route: null,
            },
        };

        const app = gabriela.asProcess();

        let entersException = false;
        try {
            app.addModule(mdl);
        } catch (e) {
            entersException = true;

            expect(e.message).to.be.equal(`Invalid module definition in module '${mdl.name}'. 'http.route' must be an object`)
        }

        expect(entersException).to.be.equal(true);
    });
});