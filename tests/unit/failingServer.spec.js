const mocha = require('mocha');
const chai = require('chai');
const requestPromise = require('request-promise');

const it = mocha.it;
const describe = mocha.describe;
const expect = chai.expect;
const assert = require('assert');

const gabriela = require('../../src/gabriela/gabriela');

describe('Failing server tests', () => {
    it('should validate server options and throw exception', () => {
        // invalid port
        let entersException = false;
        try {
            gabriela.asServer({
                config: {
                    server: {
                        port: 'invalid'
                    },
                    framework: {},
                }
            });
        } catch (err) {
            entersException = true;

            expect(err.message).to.be.equal(`Invalid server configuration. 'port' has to be an integer`);
        }

        expect(entersException).to.be.equal(true);
    });

    it('should fail the server because of invalid server options while having an invalid server events option', () => {
        let entersException = false;
        try {
            gabriela.asServer({
                config: {
                    server: {
                        port: 'invalid'
                    },
                    framework: {}
                }
            }, [], {
                events: {
                    onAppStarted: null,

                }
            });
        } catch(e) {
            entersException = true;

            expect(e.message).to.be.equal(`Invalid server configuration. 'port' has to be an integer`);
        }

        expect(entersException).to.be.equal(true);
    });

    it('should fail the server because of invalid catchError event', () => {
        const g = gabriela.asServer({
            config: {
                framework: {},
            }
        }, [],{
            events: {
                catchError: null,
            }
        });

        let entersException = false;
        try {
            g.startApp();
        } catch(e) {
            entersException = true;

            expect(e.message).to.be.equal(`Invalid event. 'catchError' must be a function. Due to this error, the server cannot start.`);
        }

        expect(entersException).to.be.equal(true);
    });

    it('should fail the server because of invalid onPreResponse event', () => {
        const g = gabriela.asServer({
            config: {
                framework: {}
            }
        }, [], {
            events: {
                onPreResponse: null,
            }
        });

        let entersException = false;
        try {
            g.startApp();
        } catch(e) {
            entersException = true;

            expect(e.message).to.be.equal(`Invalid event. 'onPreResponse' must be a function. Due to this error, the server cannot start.`);
        }

        expect(entersException).to.be.equal(true);
    });

    it('should fail the server because of invalid onPostResponse event', () => {
        const g = gabriela.asServer({
            config: {
                framework: {},
            }
        }, [],{
            events: {
                onPostResponse: null,
            }
        });

        let entersException = false;
        try {
            g.startApp();
        } catch(e) {
            entersException = true;

            expect(e.message).to.be.equal(`Invalid event. 'onPostResponse' must be a function. Due to this error, the server cannot start.`);
        }

        expect(entersException).to.be.equal(true);
    });

    it('catchError gabriela event should catch an error thrown inside onAppStarted gabriela event', (done) => {
        const g = gabriela.asServer({
            config: {
                framework: {},
            }
        }, [],{
            events: {
                onAppStarted() {
                    throw new Error('Something went wrong');
                },
                catchError(err) {
                    expect(err).to.be.instanceof(Error);
                    expect(err.message).to.be.equal(`An error has been thrown in 'onAppStarted' gabriela event with message: 'Something went wrong'. This is regarded as an unrecoverable error and the server has closed`);

                    this.gabriela.close();

                    done();
                }
            }
        });

        g.startApp();
    });

    it('error thrown inside middleware processing should take precendence over an error thrown inside onAppStarted event', (done) => {
        const g = gabriela.asServer({
            config: {
                framework: {},
            }
        }, [],{
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
});