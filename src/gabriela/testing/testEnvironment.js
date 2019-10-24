const DependencyResolver = require('./resolver/dependencyResolver');
const ModuleResolver = require('./resolver/moduleResolver');

function TestEnvironment(config) {
    function fakeHttp(module) {

    }

    function fakeProcess(module) {

    }

    this.fakeHttp = fakeHttp;
    this.fakeProcess = fakeProcess;
}

module.exports = TestEnvironment;