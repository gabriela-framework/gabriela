const gabriela = require('./src/index');
const requestPromise = require('request-promise');

const routes = [
    {
        name: 'route',
        path: '/path',
        method: 'get',
    }
];

const app = gabriela.asServer({
    config: {
        framework: {
            env: 'dev',
        }
    }
}, routes, {
    events: {
        onAppStarted() {
            requestPromise.get('http://localhost:3000/path').then(() => {

            });
        }
    }
});

app.addModule({
    name: 'module',
    route: 'route',
    moduleLogic: [function(state) {
        state.someObject = {};
    }]
});

app.startApp();