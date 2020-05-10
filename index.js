const gabriela = require('./src/index');

const app = gabriela.asServer({
    framework: {
        env: 'prod',
    },
    server: {
        port: 3001,
    },
    events: {
        onAppStarted() {
        },
        onExit() {
            console.log('ON EXIT');
        }
    }
});

app.startApp();