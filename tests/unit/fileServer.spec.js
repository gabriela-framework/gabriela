const mocha = require('mocha');
const chai = require('chai');
const requestPromise = require('request-promise');
const path = require('path');

const it = mocha.it;
const xit = mocha.xit;
const describe = mocha.describe;
const expect = chai.expect;

const gabriela = require('../../src/gabriela/gabriela');

describe('File server tests', () => {
    it('should serve a file from a file path', (done) => {
        const config = {
            routes: [
                {
                    name: 'route',
                    path: '/index',
                    method: 'GET',
                    'static': {
                        path: path.normalize(__dirname + '/../files/index.html'),
                    }
                }
            ],
            events: {
                onAppStarted() {
                    requestPromise.get('http://localhost:3000/index', (err, res) => {
                        expect(res.statusCode).to.be.equal(200);
                        expect(res.body).to.be.a('string');
                        expect(res.body.length).to.be.equal(239);

                        this.gabriela.close();

                        done();
                    });
                },
            }
        };

        const g = gabriela.asServer(config);

        g.addModule({
            name: 'fileModule',
            route: 'route',
            moduleLogic: [function() {}]
        });

        g.startApp();
    });

    it('should serve a file without static route configuration', (done) => {
        const config = {
            routes: [
                {
                    name: 'route',
                    path: '/index',
                    method: 'GET',
                }
            ],
            events: {
                onAppStarted() {
                    requestPromise.get('http://localhost:3000/index', (err, res) => {
                        expect(res.statusCode).to.be.equal(200);
                        expect(res.body).to.be.a('string');
                        expect(res.body.length).to.be.equal(239);
                        this.gabriela.close();

                        done();
                    });
                },
            }
        };

        const g = gabriela.asServer(config);

        g.addModule({
            name: 'fileModule',
            route: 'route',
            moduleLogic: [function(http) {
                const staticPath = require('path').normalize(__dirname + '/../files/index.html');

                http.res.sendFile(staticPath);
            }]
        });

        g.startApp();
    });
});
