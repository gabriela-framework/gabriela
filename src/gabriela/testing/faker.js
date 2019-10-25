const DependencyResolver = require('./resolver/dependencyResolver');
const ModuleResolver = require('./resolver/moduleResolver');
const HttpMock = require('./http');

function Faker(config) {
    function fakeHttp(module) {
        return new HttpMock();
    }

    function fakeProcess(module) {

    }

    this.fakeHttp = fakeHttp;
    this.fakeProcess = fakeProcess;
}

module.exports = Faker;