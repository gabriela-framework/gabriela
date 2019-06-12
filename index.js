const requestPromise = require('request-promise');
const sync = require('synchronize');

const callback = function() {
    requestPromise.get('https://google.com').then(() => {
        return 'something';
    });
};
