const gabriela = require('./src/index');

const app = gabriela.asProcess({
    config: {
        framework: {}
    }
});

app.addModule({
    name: 'module',
    init: [function() {
        console.log('init');
    }],
    moduleLogic: [function() {
        console.log('ulazak');
    }]
});

app.startApp();