const gabriela = require('./src/index');
const requestPromise = require('request-promise');


const mdl = {
    name: 'mdl',
    moduleLogic: [
        async function() {
            throw new Error('Async error');
        }
    ]
};

const plugin = {
    name: 'plugin',
    modules: [mdl],
    mediator: {
        onError() {
            throw new Error('Plugin Async error');
        }
    }
};

const app = gabriela.asProcess({config: {framework: {}}}, {
    events: {
        onAppStarted() {
        }
    }
});

app.addPlugin(plugin);

app.startApp();
