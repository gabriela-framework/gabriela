const _asServer = require('./_asServer');
const HttpApp = require('./mock/http');

function Faker(config, options) {
    function fakeHttp(mdl) {
        const app = _asServer(config, options);

        return new HttpApp(app, mdl);
    }

    this.fakeHttp = fakeHttp;
}

module.exports = Faker;