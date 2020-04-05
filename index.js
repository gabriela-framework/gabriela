const gabriela = require('./src/index');
const requestPromise = require('request-promise');
const path = require('path');

let firstCalled = false;
let secondCalled = false;

const app = gabriela.asProcess({
    events: {
        onAppStarted() {
        }
    }
});

app.addModule({
    name: 'mdl',
    moduleLogic: [async function() {
        const val = this.compiler.has = null;
    }, function() {
        const val = this.compiler.has = null;
    }]
});

app.startApp();
