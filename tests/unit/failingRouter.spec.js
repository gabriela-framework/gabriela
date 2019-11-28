const mocha = require('mocha');
const chai = require('chai');
const assert = require('assert');

const it = mocha.it;
const describe = mocha.describe;
const expect = chai.expect;

const Router = require('../../src/gabriela/router/router');
const {MANDATORY_ROUTE_PROPS} = require('../../src/gabriela/misc/types');

describe('Failing router tests', () => {
    it('should fail if the routes is not an array', () => {
        try {
            Router.injectRoutes(null);
        } catch (e) {
            expect(e.message).to.be.equal(`Invalid routes type. Routes must be an array`);
        }
    });

    it('should fail if a single route is not an object', () => {
        try {
            Router.injectRoutes([
                {
                    name: 'name',
                    path: '/path',
                    method: 'get',
                },
                null,
            ]);
        } catch (e) {
            expect(e.message).to.be.equal(`Invalid routes type. Routes must be an object`);
        }
    });

    it('should fail if a route does not have all mandatory properties', () => {
        try {
            Router.injectRoutes([
                {
                    name: 'name',
                    path: '/path',
                },
                null,
            ]);
        } catch (e) {
            expect(e.message).to.be.equal(`Invalid route. Every route must contain properties '${MANDATORY_ROUTE_PROPS.toArray().join(', ')}'`);
        }
    });

    it('should fail if route.name is not a string', () => {
        try {
            Router.injectRoutes([
                {
                    name: null,
                    path: '/path',
                    method: 'get',
                },
                null,
            ]);
        } catch (e) {
            expect(e.message).to.be.equal(`Invalid route. 'route.name' must be a string`);
        }
    });

    it('should fail if route.path is not a string', () => {
        try {
            Router.injectRoutes([
                {
                    name: 'name',
                    path: null,
                    method: 'get',
                },
                null,
            ]);
        } catch (e) {
            expect(e.message).to.be.equal(`Invalid route with name 'name' 'path' property must be a string`);
        }
    });

    it('should fail if route.method is not a string', () => {
        try {
            Router.injectRoutes([
                {
                    name: 'name',
                    path: '/path',
                    method: null,
                },
                null,
            ]);
        } catch (e) {
            expect(e.message).to.be.equal(`Invalid route with name 'name'. 'method' property must be a string`);
        }
    });

    it('should fail if route.method is not a valid http resitfy method', () => {
        try {
            Router.injectRoutes([
                {
                    name: 'name',
                    path: '/path',
                    method: 'del',
                },
                null,
            ]);
        } catch (e) {
            expect(e.message).to.be.equal(`Invalid route with name 'name'. 'del' is not a supported HTTP method. Go to https://developer.mozilla.org/en-US/docs/Web/HTTP/Methods for a list of supported HTTP methods`);
        }
    });
});