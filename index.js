const gabriela = require('./src/index');
const requestPromise = require('request-promise');
const path = require('path');

const routes = [
    {
        name: 'route',
        method: 'get',
        path: '/route',
    },
];

const mdl = {
    name: 'mdl',
    route: 'route',
    moduleLogic: [function(http) {
        http.res.download(path.normalize(__dirname + '/tests/files/index.html'));
    }],
};

const config = {
    routes: routes,
    events: {
        onAppStarted() {
            requestPromise({
                method: 'get',
                uri: 'http://localhost:3000/route',
                resolveWithFullResponse: true,
            }).then((response) => {
                this.gabriela.close();
            });
        }
    }
};

const app = gabriela.asServer(config);

app.addModule(mdl);

app.startApp();
