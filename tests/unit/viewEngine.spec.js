const mocha = require('mocha');
const chai = require('chai');
const requestPromise = require('request-promise');

const it = mocha.it;
const xit = mocha.xit;
const describe = mocha.describe;
const expect = chai.expect;

const gabriela = require('../../src/gabriela/gabriela');

describe('View engine tests', function() {
    this.timeout(15000);

    it('should render a html page with react', (done) => {
        const app = gabriela.asServer({
            routes: [
                {
                    name: 'path',
                    path: '/path',
                    method: 'get',
                }
            ],
            server: {
                viewEngine: {
                    views: './tests/files',
                    'view engine': 'jsx',
                    engine: require('express-react-views').createEngine(),
                },
            },
            events: {
                onAppStarted() {
                    requestPromise.get('http://127.0.0.1:3000/path', (err, res) => {
                        expect(res.statusCode).to.be.equal(200);
                        expect(res.body.length).to.be.equal(253);

                        this.gabriela.close();

                        done();
                    });
                }
            }
        });

        app.addModule({
            name: 'mdl',
            route: 'path',
            moduleLogic: [function(http) {
                http.res.render('index');
            }],
        });

        app.startApp();
    })
});
