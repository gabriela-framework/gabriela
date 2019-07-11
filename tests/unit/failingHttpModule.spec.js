const mocha = require('mocha');
const chai = require('chai');
const assert = require('assert');

const it = mocha.it;
const describe = mocha.describe;
const expect = chai.expect;

const gabriela = require('../../gabriela/gabriela');
const {mandatoryRouteProps} = require('../../gabriela/misc/types');

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

    it('should fail if http.route does not have mandatory properties', () => {
        const mdl = {
            name: 'httpModule',
            http: {
                route: {
                    name: 'name',
                    path: 'path',
                },
            },
        };

        const app = gabriela.asProcess();

        let entersException = false;
        try {
            app.addModule(mdl);
        } catch (e) {
            entersException = true;

            expect(e.message).to.be.equal(`Invalid module definition in module '${mdl.name}'. 'http.route' must contain properties '${mandatoryRouteProps.join(', ')}'`)
        }

        expect(entersException).to.be.equal(true);
    });

    it('should fail if http.route does not have mandatory properties', () => {
        const mdl = {
            name: 'httpModule',
            http: {
                route: {
                    name: 'name',
                    path: 'path',
                    method: 'get',
                },
            },
        };

        let app;

        let previous = null;
        for (const entry of mandatoryRouteProps) {
            let entersException = false;
            try {
                app = gabriela.asProcess();

                if (previous) previous = mdl.http.route[previous] = 'string';

                mdl.http.route[entry] = null;

                previous = entry;

                app.addModule(mdl);
            } catch (e) {
                entersException = true;

                expect(e.message).to.be.equal(`Invalid module definition in module '${mdl.name}'. 'http.route.${entry}' must be a string`)
            }

            expect(entersException).to.be.equal(true);
        }
    });

    it('should fail if http.route.method is not a supported HTTP method', () => {
        const mdl = {
            name: 'httpModule',
            http: {
                route: {
                    name: 'name',
                    path: 'path',
                    method: 'unsupported',
                },
            },
        };

        const app = gabriela.asProcess();

        let entersException = false;
        try {
            app.addModule(mdl);
        } catch (e) {
            entersException = true;

            expect(e.message).to.be.equal(`Invalid module definition in module '${mdl.name}'. ${mdl.http.route.method} is not a supported HTTP method. Go to http://restify.com/docs/server-api/ for a list of supported HTTP methods`)
        }

        expect(entersException).to.be.equal(true);
    });
});