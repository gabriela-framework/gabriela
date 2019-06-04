var rp = require('request-promise');

rp('http://www.google.com')
    .then(function (htmlString) {
        console.log(htmlString);
    })
    .catch(function (err) {
        console.log(err.message);
    });