const gabriela = require('./src/index');
const requestPromise = require('request-promise');
const path = require('path');

const app = gabriela.asProcess({
    framework: {
        loggingEnabled: false,
    }
});

app.startApp();
