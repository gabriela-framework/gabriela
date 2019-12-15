const mocha = require('mocha');
const chai = require('chai');

const Router = require('../../src/gabriela/router/router');
const {
    HTTP_METHODS,
} = require('../../src/gabriela/misc/types');

const it = mocha.it;
const xit = mocha.xit;
const describe = mocha.describe;
const expect = chai.expect;

describe('Router tests', () => {
    it('should fail if the base path name property is not a string', () => {
        const routes = [
            {
                name: null,
                basePath: '/path',
                routes: [],
            }
        ];

        let entersException = false;
        try {
            Router.injectRoutes(routes);
        } catch (e) {
            entersException = true;

            expect(e.message).to.be.equal(`Invalid base route. 'name' must be a string.`);
        }

        expect(entersException).to.be.equal(entersException);
    });

    it('should fail if the base path basePath property is not a string', () => {
        const routes = [
            {
                name: 'route',
                basePath: null,
                routes: [],
            }
        ];

        let entersException = false;
        try {
            Router.injectRoutes(routes);
        } catch (e) {
            entersException = true;

            expect(e.message).to.be.equal(`Invalid base route 'route'. 'basePath' must be a string.`);
        }

        expect(entersException).to.be.equal(entersException);
    });

    it('should fail if the base path routes property is not an array', () => {
        const routes = [
            {
                name: 'route',
                basePath: '/base-path',
                routes: null,
            }
        ];

        let entersException = false;
        try {
            Router.injectRoutes(routes);
        } catch (e) {
            entersException = true;

            expect(e.message).to.be.equal(`Invalid base route 'route'. 'routes' must be an array.`);
        }

        expect(entersException).to.be.equal(entersException);
    });

    it('should fail if a regular route name property is not a string', () => {
        const routes = [
            {
                name: 'route',
                basePath: '/base-path',
                routes: [
                    {
                        name: null,
                        path: '/path',
                        method: 'get',
                    }
                ],
            }
        ];

        let entersException = false;
        try {
            Router.injectRoutes(routes);
        } catch (e) {
            entersException = true;

            expect(e.message).to.be.equal(`Invalid route. 'name' must be a string.`);
        }

        expect(entersException).to.be.equal(entersException);
    });

    it('should fail if a regular route path property is not a string', () => {
        const routes = [
            {
                name: 'route',
                basePath: '/base-path',
                routes: [
                    {
                        name: 'route',
                        path: null,
                        method: 'get',
                    }
                ],
            }
        ];

        let entersException = false;
        try {
            Router.injectRoutes(routes);
        } catch (e) {
            entersException = true;

            expect(e.message).to.be.equal(`Invalid route 'route'. 'path' must be a string.`);
        }

        expect(entersException).to.be.equal(entersException);
    });

    it('should fail if a regular route method property is not a string', () => {
        const routes = [
            {
                name: 'route',
                basePath: '/base-path',
                routes: [
                    {
                        name: 'route',
                        path: '/path',
                        method: null,
                    }
                ],
            }
        ];

        let entersException = false;
        try {
            Router.injectRoutes(routes);
        } catch (e) {
            entersException = true;

            expect(e.message).to.be.equal(`Invalid route 'route'. 'method' must be a string.`);
        }

        expect(entersException).to.be.equal(entersException);
    });

    it('should fail if a regular route method property is not a valid http method', () => {
        const routes = [
            {
                name: 'route',
                basePath: '/base-path',
                routes: [
                    {
                        name: 'route',
                        path: '/path',
                        method: 'invalid',
                    }
                ],
            }
        ];

        let entersException = false;
        try {
            Router.injectRoutes(routes);
        } catch (e) {
            entersException = true;

            expect(e.message).to.be.equal(`Invalid route 'route'. Invalid method 'invalid'. Valid method are: '${HTTP_METHODS.toArray().join(', ')}'`);
        }

        expect(entersException).to.be.equal(entersException);
    });
});