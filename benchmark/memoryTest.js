const gabriela = require('../src');
const requestPromise = require('request-promise');
const sequenceQueue = require('./sequenceQueue');

const routes = [
    {
        name: 'route',
        path: '/path',
        method: 'get',
    }
];

const app = gabriela.asServer({
    config: {
        framework: {
            env: 'prod',
        }
    }
}, routes);

app.addModule({
    name: 'module',
    route: 'route',
    moduleLogic: [function(state) {
        state.someObject = {};
    }]
});

app.startApp();

const tasks = [];

for (let i = 0; i < 1000; i++) {
    tasks.push((() => requestPromise.get('http://localhost:3000/path')));
}

setInterval(() => {
    sequenceQueue({
        tasks: tasks,
        onQueueFinished() {
            console.log('Queue finished');
        }
    })
}, 3000);



