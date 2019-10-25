const gabriela = require('./src/index');

const app = gabriela.asServer({
    config: {
        framework: {}
    }
});

app.addModule({
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
});

app.startApp();