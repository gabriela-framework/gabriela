const gabriela = require('./src/index');
const requestPromise = require('request-promise');
const path = require('path');

const config = {
    routes: [
        {
            name: 'route',
            path: '/route',
            method: 'get',
        }
    ],
    events: {
        onAppStarted() {
            const promises = [];

            for (let i = 0; i < 100; i++) {
                promises.push(requestPromise.get('http://localhost:3000/route'));
            }

            Promise.all(promises).then(() => {
                this.gabriela.close();
            });
        }
    }
};

const g = gabriela.asServer(config);

g.addModule({
    name: 'mdl',
    route: 'route',
    moduleLogic: [async function(http, done) {
        http.res.json(200, {});

        done();
    }, async function() {

    }]
});

g.startApp();
