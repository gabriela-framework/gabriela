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
    xit('should serve a file from a directory', (done) => {
        const g = gabriela.asServer(config, [
            {
                name: 'route',
                path: '/index',
                method: 'GET',
                'static': {
                    directory: path.normalize(__dirname + '/../files'),
                    file: 'index.html'
                }
            }
        ], {
            events: {
                onAppStarted() {
                    requestPromise.get('http://localhost:3000/index', (err, res) => {
                        expect(res.body).to.be.a('string');
                        expect(res.body.length).to.be.above(20);
                        this.gabriela.close();

                        done();
                    });
                }
            }
        });

        g.addModule({
            name: 'fileModule',
            route: 'route',
            moduleLogic: [function() {}]
        });

        g.startApp();
    });
});
