const gabriela = require('./src/index');
const requestPromise = require('request-promise');
const path = require('path');

const app = gabriela.asServer({
    framework: {
        loggingEnabled: false,
    },
    server: {
        viewEngine: {
            views: 'directory',
            'view engine': null,
        }
    }
});

app.startApp();
