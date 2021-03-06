const mocha = require('mocha');
const chai = require('chai');

const it = mocha.it;
const xit = mocha.xit;
const describe = mocha.describe;
const expect = chai.expect;

const gabriela = require('../../src/gabriela/gabriela');

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

            expect(err.message).to.be.equal(`Invalid config. 'server.port' must be an integer.`);
        }

        expect(entersException).to.be.equal(true);
    });

    it('should fail the server because of invalid server options while having an invalid server events option', () => {
        let entersException = false;
        try {
            const config = {
                server: {
                    port: 'invalid'
                },
                events: {
                    onAppStarted: null,
                }
            };

            gabriela.asServer(config);
        } catch(e) {
            entersException = true;

            expect(e.message).to.be.equal(`Invalid config. 'server.port' must be an integer.`);
        }

        expect(entersException).to.be.equal(true);
    });

    it('should fail the server because of invalid catchError event', () => {
        const config = {
            events: {
                catchError: null,
            }
        };


        let entersException = false;
        try {
            gabriela.asServer(config);
        } catch(e) {
            entersException = true;

            expect(e.message).to.be.equal(`Invalid event. 'catchError' must be a function. Due to this error, the app cannot start.`);
        }

        expect(entersException).to.be.equal(true);
    });

    it('should fail the server because of invalid onPreResponse event', () => {
        const config = {
            events: {
                onPreResponse: null,
            }
        };


        let entersException = false;
        try {
            gabriela.asServer(config);
        } catch(e) {
            entersException = true;

            expect(e.message).to.be.equal(`Invalid event. 'onPreResponse' must be a function. Due to this error, the app cannot start.`);
        }

        expect(entersException).to.be.equal(true);
    });

    it('should fail the server because of invalid onPostResponse event', () => {
        let entersException = false;
        try {
            gabriela.asServer({
                events: {
                    onPostResponse: null,
                }
            });
        } catch(e) {
            entersException = true;

            expect(e.message).to.be.equal(`Invalid event. 'onPostResponse' must be a function. Due to this error, the app cannot start.`);
        }

        expect(entersException).to.be.equal(true);
    });

    it('catchError gabriela event should catch an error thrown inside onAppStarted gabriela event', (done) => {
        const g = gabriela.asServer({
            events: {
                onAppStarted() {
                    throw new Error('Something went wrong');
                },
                catchError(err) {
                    expect(err.message).to.be.equal("An error has been thrown in 'onAppStarted' gabriela event with message: 'Something went wrong'. This is regarded as an unrecoverable error and the server has closed");

                    this.gabriela.close();

                    done();
                }
            }
        });

        g.startApp();
    });

    it('error thrown inside middleware processing should take precendence over an error thrown inside onAppStarted event', (done) => {
        const g = gabriela.asServer({
            events: {
                onAppStarted() {
                    throw new Error('Something went wrong in onAppStarted');
                },
                catchError(err) {
                    expect(err).to.be.instanceof(Error);
                    expect(err.message).to.be.equal(`Something went wrong`);

                    this.gabriela.close();

                    done();
                }
            }
        });

        g.addModule({
            name: 'module',
            moduleLogic: [function(throwException) {
                throwException(new Error('Something went wrong'));
            }],
        });

        g.startApp();
    });

    it('should fail if the route does not exist', () => {
        let entersMiddleware = false;

        const routes = [
            {
                name: 'route',
                path: '/path',
                method: 'GET',
            }
        ];
        const g = gabriela.asServer({
            config: {
                framework: {},
            }
        }, routes);

        try {
            g.addModule({
                name: 'module',
                route: 'not exists',
                moduleLogic: [function() {
                    entersMiddleware = true;
                }],
            });
        } catch (e) {
            expect(e.message).to.be.equal(`Invalid module definition with name 'module'. Route 'not exists' does not exist`)
        }
    });

    it('should fail if the plugin modules route does not exist', () => {
        let entersMiddleware = false;

        const routes = [
            {
                name: 'route',
                path: '/path',
                method: 'GET',
            }
        ];

        const config = {
            routes: routes,
        };

        const g = gabriela.asServer(config);

        const mdl = {
            name: 'module',
            route: 'not exists',
            moduleLogic: [function() {
                entersMiddleware = true;
            }],
        };

        const plugin = {
            name: 'plugin',
            modules: [mdl],
        };

        try {
            g.addPlugin(plugin);
        } catch (e) {
            expect(e.message).to.be.equal('Plugin definition error. Plugin with name \'plugin\' has an invalid \'modules\' entry with message: \'Invalid module definition with name \'module\' in plugin \'plugin\'. Route \'not exists\' does not exist\'');
        }
    });
});
