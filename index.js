const gabriela = require('./src/index');
const requestPromise = require('request-promise');
const path = require('path');

let onErrorCalled = false;

const mdl = {
    name: 'catchErrorModule',
    route: 'route',
    moduleLogic: [function(done) {
        done()
    }, function() {

    }],
};

const app = gabriela.asServer({
    routes: [
        {
            name: 'route',
            path: '/route',
            method: 'get',
        }
    ],
    events: {
        onAppStarted() {
            requestPromise.get('http://127.0.0.1:3000/route').then(() => {
            });
        }
    }
});

app.addPlugin({
    name: 'plugin',
    mediator: {
        onError() {
            console.log('sdfkjasfdjasdf');
            onErrorCalled = true;
        }
    },
    modules: [mdl],
});

app.startApp();
