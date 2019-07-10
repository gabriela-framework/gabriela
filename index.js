const gabriela = require('./gabriela/gabriela');
const requestPromise = require('request-promise');

const mdl = {
    http: {
        route: {
            name: 'users',
            path: '/users',
            method: 'get',
        }
    },
    name: 'mdl',
    moduleLogic: [function(state) {
        state.model = {
            name: 'name',
            lastname: 'lastname',
            age: 85,
        }
    }],
};

const g = gabriela.asServer();
g.addModule(mdl);

g.startApp({
    onAppStarted() {
        let count = 0;
        setInterval(function() {
            console.log('BATCH RUNNING');

            let requestCount = (count <= 10) ? count * 100 : 10;
            for (let i = 0; i < requestCount; i++) {
                requestPromise.get('http://localhost:3000/users').then(() => {

                });
            }

            count++;
        }, 5000);
    }
});
