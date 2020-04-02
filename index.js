const gabriela = require('./src/index');
const request = require('request');

const httpMdl = {
    name: 'http',
    route: 'test',
    moduleLogic: [function(http) {
        console.log('Request success');
    }],
};

const app = gabriela.asServer({
    config: {
        framework: {
            env: 'dev'
        },
        server: {
            port: 3000,
            host: '127.0.0.1',
        }
    }
}, [
    {
        name: 'test',
        path: '/path',
        method: 'GET',
    }
], {
    events: {
        onAppStarted() {
            request.get('http://127.0.0.1:3000/path')
                .then(() => {
                    console.log('request success');
                })
                .catch((err) => {
                    console.error(err);
                })
        }
    }
});

app.addModule(httpMdl);

app.startApp();
