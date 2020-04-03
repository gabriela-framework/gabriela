const gabriela = require('./src/index');
const requestPromise = require('request-promise');
const path = require('path');

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
                this.gabriela.close();
            });
        },
        catchError(e) {
            this.gabriela.close();
        }
    }
};

const g = gabriela.asServer(config);

g.addModule({
    name: 'fileModule',
    route: 'route',
    moduleLogic: [function(http, done) {
        const staticPath = require('path').normalize(__dirname + '/tests/files/index.html');

        console.log(staticPath);
        http.res.sendFile(staticPath);

        done();
    }]
});

g.startApp();
