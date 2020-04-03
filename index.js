const gabriela = require('./src/index');
const requestPromise = require('request-promise');
const path = require('path');

const isNumber = function isNumber(value) {

    return typeof value === 'number' && isFinite(value) && parseInt(value) !== NaN;
};

console.log(isNumber('4000'));
