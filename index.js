const gabriela = require('./src/index');
const requestPromise = require('request-promise');
const path = require('path');

const p = gabriela.asServer();

const plugin1 = {
    name: 'plugin1',
};

const plugin2 = {
    name: 'plugin2',
};

p.addPlugin(plugin1);
p.addPlugin(plugin2);

let entersException = false;

p.addPlugin({
    name: 'plugin2',
});
