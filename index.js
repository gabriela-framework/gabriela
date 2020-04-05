const gabriela = require('./src/index');
const requestPromise = require('request-promise');
const path = require('path');

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
