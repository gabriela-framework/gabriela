const gabriela = require('./src/gabriela/gabriela');
const requestPromise = require('request-promise');

let onPreResponseCalled = false;
const g = gabriela.asServer({
    config: {}
}, {
    events: {
        onAppStarted() {

        }
    }
});

g.addModule({
    name: 'module',
    http: {
        route: {
            name: 'route',
            path: 'path',
            method: 'get',
        },
    },
    moduleLogic: [function() {

    }],
});

g.startApp();