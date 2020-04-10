const gabriela = require('./src/index');

const app = gabriela.asServer({
    framework: {
        env: 'prod',
    },
    server: {
        host: '127.0.0.5',
        port: 6000,
    }
});

app.startApp();