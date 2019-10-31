const gabriela = require('./src/index');
const requestPromise = require('request-promise');

const mdl = {
    name: 'httpsMdl',
    http: {
        route: {
            name: 'route',
            path: '/route',
            method: 'get',
        }
    },
    moduleLogic: [function() {
    }],
};

const plugin = {
    name: 'plugin',
    modules: [mdl],
    http: {
        route: '/base-route',
        allowedMethods: ['get'],
    }
};

const g = gabriela.asServer({config: {framework: {}}}, {
    events: {
        onAppStarted() {
            console.log('THIS APP HAS STARTED');

            let options = {
                method: 'get',
                json: true,
                uri : 'http://localhost:3000/base-route/route',
            };

            requestPromise(options).then(() => {
                console.log('HTTP ROUTE SUCCESS');
                this.gabriela.close();
            });
        },
        catchError(e) {
            console.log(e);
        }
    }
});

g.addPlugin(plugin);

g.startApp();