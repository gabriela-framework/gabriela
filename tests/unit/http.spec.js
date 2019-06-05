const mocha = require('mocha');
const chai = require('chai');
const requestPromise = require('request-promise');

const it = mocha.it;
const before = mocha.before;
const after = mocha.after;
const describe = mocha.describe;
const expect = chai.expect;

const gabriela = require('../../gabriela/gabriela');

describe('Http request to gabriela', () => {
    let gabrielaServer = null;

    before((done) => {
        const usersListModule = {
            http: {
                route: {
                    name: 'usersList',
                    path: '/users',
                    method: 'get',
                }
            },
            moduleLogic: [(state, next, skip, done, throwException, http) => {
                http.res.send('OK');
                http.res.end();

                done();
            }]
        };

        gabrielaServer = gabriela.asServer({
            port: 3001,
            runCallback: () => {
                done();
            }
        });

        gabrielaServer.addModule(usersListModule);

        gabrielaServer.runServer();
    });

    after(() => {
        gabrielaServer.closeServer();
    });

    it('should accept a GET request and return a response', (done) => {
        requestPromise('http://11.11.11.12:3001/users').then((body) => {
            expect(body).to.be.equal('OK');
            done();
        });
    });
});