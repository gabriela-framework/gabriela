const gabriela = require('./src/index');
const requestPromise = require('request-promise');
const path = require('path');

const processConfigFactory = require('./src/gabriela/config/processConfigFactory');

process.env.ENV = 'prod';

const config = processConfigFactory.create({
    framework: {
        env: "env('ENV')",
    }
});

console.log(config);
