const gabriela = require('./src/index');
const requestPromise = require('request-promise');
const path = require('path');

let entersMdl1 = false;

const shared1 = {
    name: 'shared1',
    shared: {
        plugins: ['plugin1'],
        modules: ['mdl1'],
    },
    init: function() {
        return {name: 'shared1'}
    }
};

const initModule = {
    name: 'initModule',
    dependencies: [shared1],
};

const g = gabriela.asProcess({
    events: {
        onAppStarted() {
        }
    }
});

const mdl1 = {
    name: 'mdl1',
    moduleLogic: [function(shared1) {
        entersMdl1 = true;
    }]
};

g.addPlugin({
    name: 'plugin1',
    modules: [initModule, mdl1],
});

g.startApp();
