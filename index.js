const gabriela = require('./src/index');

const app = gabriela.asServer();

const someModule = {
    name: 'module',
    http: {
        route: {
            name: 'route',
            path: '/path',
            method: 'get',
        }
    },
    init: [function() {
        console.log('init');
    }],
    moduleLogic: [function() {
        console.log('ulazak');
    }]
};

const plugin = {
    name: 'httpPlugin',
    modules: [someModule],
    http: {
        route: '/base-route',
        allowedMethods: ['post', 'head', 'GET']
    }
};

app.addPlugin(plugin);

app.startApp();