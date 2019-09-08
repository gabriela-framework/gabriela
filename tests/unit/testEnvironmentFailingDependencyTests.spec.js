const mocha = require('mocha');
const chai = require('chai');
const assert = require('assert');
const requestPromise = require('request-promise');

const it = mocha.it;
const xit = mocha.xit;
const describe = mocha.describe;
const expect = chai.expect;

const gabriela = require('../../src/gabriela/gabriela');
const config = require('../config/config');

describe('Failing loaded dependency tests', function() {
    it('test environment should fail to compile because init dependency value not being an object', () => {
        let entersException = false;

        const testApp = gabriela.asTest(config);

        const dependencyGraph = [1];

        try {
            testApp.loadDependency(dependencyGraph);
        } catch (err) {
            entersException = true;

            expect(err.message).to.be.equal(`Testing environment invalid argument. Dependency graph must be an array of objects`);
        }

        expect(entersException).to.be.equal(true);
    });

    it('test environment should fail to compile a dependency because name property must be a string', () => {
        let entersException = false;

        const testApp = gabriela.asTest(config);

        const dependencyGraph = [{name: 3}];

        try {
            testApp.loadDependency(dependencyGraph);
        } catch (err) {
            entersException = true;

            expect(err.message).to.be.equal(`Testing environment invalid argument. Init object 'name' property must be a string`);
        }

        expect(entersException).to.be.equal(true);
    });

    it('testing environment should fail to compile a dependency because init.init must be a function', () => {
        let entersException = false;

        const testApp = gabriela.asTest(config);

        const dependencyGraph = [{
            name: 'name',
            init: 4,
        }];

        try {
            testApp.loadDependency(dependencyGraph);
        } catch (err) {
            entersException = true;

            expect(err.message).to.be.equal(`Testing environment invalid argument. Init object 'init' property must be a function`);
        }

        expect(entersException).to.be.equal(true);
    });

    it('testing environment should fail to compile a dependency because of invalid scope value', () => {
        let entersException = false;

        const testApp = gabriela.asTest(config);

        let invalidService = {
            name: 'name',
            scope: 'invalid',
            init: function() {
                function initService() {}

                return new initService();
            }
        };

        try {
            testApp.loadDependency([invalidService]);
        } catch (err) {
            entersException = true;

            expect(err.message).to.be.equal(`Testing environment invalid argument. 'name' 'scope' property needs to be either 'module', 'plugin' or 'public'. If not specified, it is 'module' by default`);
        }

        expect(entersException).to.be.equal(true);
    });

    it('testing environment should fail to compile a dependency because invalid isAsync option type', () => {
        const userServiceInit = {
            name: 'userService',
            isAsync: 1,
            init: function() {
                return () => {};
            }
        };

        const testApp = gabriela.asTest(config);

        let entersException = false;
        try {
            testApp.loadDependency([userServiceInit])
        } catch (err) {
            entersException = true;

            expect(err.message).to.be.equal(`Testing environment invalid argument. 'userService' 'isAsync' option must be a boolean`);
        }

        expect(entersException).to.be.equal(true);
    });

    it('testing environment should fail to compile a dependency if the dependency has an invalid scope property data type', () => {
        const userServiceInit = {
            name: 'userService',
            scope: 1,
            init: function() {
                return () => {};
            }
        };

        const testApp = gabriela.asTest(config);

        let entersException = false;
        try {
            testApp.loadDependency([userServiceInit])
        } catch (err) {
            entersException = true;

            expect(err.message).to.be.equal(`Testing environment invalid argument. 'userService' 'scope' property needs to be either 'module', 'plugin' or 'public'. If not specified, it is 'module' by default`);
        }

        expect(entersException).to.be.equal(true);
    });

    it('testing environment should fail to compile a dependency if the dependency has an invalid scope property', () => {
        const userServiceInit = {
            name: 'userService',
            scope: 'invalid',
            init: function() {
                return () => {};
            }
        };

        const testApp = gabriela.asTest(config);

        let entersException = false;
        try {
            testApp.loadDependency([userServiceInit])
        } catch (err) {
            entersException = true;

            expect(err.message).to.be.equal(`Testing environment invalid argument. 'userService' 'scope' property needs to be either 'module', 'plugin' or 'public'. If not specified, it is 'module' by default`);
        }

        expect(entersException).to.be.equal(true);
    });

    it('testing environment should fail to compile a dependency if the dependency has an invalid shared property data type', () => {
        const userServiceInit = {
            name: 'userService',
            shared: null,
            init: function() {
                return () => {};
            }
        };

        const testApp = gabriela.asTest(config);

        let entersException = false;
        try {
            testApp.loadDependency([userServiceInit])
        } catch (err) {
            entersException = true;

            expect(err.message).to.be.equal(`Testing environment invalid argument. 'userService' 'shared' property must be an object`);
        }

        expect(entersException).to.be.equal(true);
    });

    it('testing environment should fail to compile a dependency if the dependency has an invalid shared property', () => {
        const userServiceInit = {
            name: 'userService',
            shared: {},
            init: function() {
                return () => {};
            }
        };

        const testApp = gabriela.asTest(config);

        let entersException = false;
        try {
            testApp.loadDependency([userServiceInit])
        } catch (err) {
            entersException = true;

            expect(err.message).to.be.equal(`Testing environment invalid argument. 'userService' 'shared' property does not have neither 'modules' or a 'plugins' property`);
        }

        expect(entersException).to.be.equal(true);
    });

    it('testing environment should fail to compile a dependency if the dependency has an invalid shared property data', () => {
        const userServiceInit = {
            name: 'userService',
            shared: {},
            init: function() {
                return () => {};
            }
        };

        const testApp = gabriela.asTest(config);

        let entersException = false;
        try {
            testApp.loadDependency([userServiceInit])
        } catch (err) {
            entersException = true;

            expect(err.message).to.be.equal(`Testing environment invalid argument. 'userService' 'shared' property does not have neither 'modules' or a 'plugins' property`);
        }

        expect(entersException).to.be.equal(true);
    });

    it('testing environment should fail to compile a dependency if the dependency has an invalid shared.plugins property data', () => {
        const userServiceInit = {
            name: 'userService',
            shared: {
                plugins: {},
            },
            init: function() {
                return () => {};
            }
        };

        const testApp = gabriela.asTest(config);

        let entersException = false;
        try {
            testApp.loadDependency([userServiceInit])
        } catch (err) {
            entersException = true;

            expect(err.message).to.be.equal(`Testing environment invalid argument. 'userService' 'plugins' property of 'shared' property must be an array`);
        }

        expect(entersException).to.be.equal(true);
    });

    it('testing environment should fail to compile a dependency if the dependency has an invalid shared.modules property data', () => {
        const userServiceInit = {
            name: 'userService',
            shared: {
                modules: {},
            },
            init: function() {
                return () => {};
            }
        };

        const testApp = gabriela.asTest(config);

        let entersException = false;
        try {
            testApp.loadDependency([userServiceInit])
        } catch (err) {
            entersException = true;

            expect(err.message).to.be.equal(`Testing environment invalid argument. 'userService' 'modules' property of 'shared' property must be an array`);
        }

        expect(entersException).to.be.equal(true);
    });

    it('testing environment should fail to compile a dependency if the dependency has dependencies property is not an array', () => {
        const userServiceInit = {
            name: 'userService',
            dependencies: null,
            init: function() {
                return () => {};
            }
        };

        const testApp = gabriela.asTest(config);

        let entersException = false;
        try {
            testApp.loadDependency([userServiceInit])
        } catch (err) {
            entersException = true;

            expect(err.message).to.be.equal(`Testing environment invalid argument. 'userService' 'dependencies' option must be an array of dependency 'init' objects`);
        }

        expect(entersException).to.be.equal(true);
    });

    it('testing environment should fail to compile a dependency if compilerPass is not an object', () => {
        const userServiceInit = {
            name: 'userService',
            compilerPass: null,
            init: function() {
                return () => {};
            }
        };

        const testApp = gabriela.asTest(config);

        let entersException = false;
        try {
            testApp.loadDependency([userServiceInit])
        } catch (err) {
            entersException = true;

            expect(err.message).to.be.equal(`Testing environment invalid argument for 'userService'. 'compilerPass' option must be an object with property 'init' that is required and must be a function and 'property' that is optional and must be a string`);
        }

        expect(entersException).to.be.equal(true);
    });

    it('testing environment should fail to compile a dependency if compilerPass does not have an init property', () => {
        const userServiceInit = {
            name: 'userService',
            compilerPass: {},
            init: function() {
                return () => {};
            }
        };

        const testApp = gabriela.asTest(config);

        let entersException = false;
        try {
            testApp.loadDependency([userServiceInit])
        } catch (err) {
            entersException = true;

            expect(err.message).to.be.equal(`Testing environment invalid argument for 'userService'. 'compilerPass' option must be an object with property 'init' that is required and must be a function and 'property' that is optional and must be a string`);
        }

        expect(entersException).to.be.equal(true);
    });

    it('testing environment should fail to compile a dependency if compilerPass.init is not a function', () => {
        const userServiceInit = {
            name: 'userService',
            compilerPass: {
                init: null,
            },
            init: function() {
                return () => {};
            }
        };

        const testApp = gabriela.asTest(config);

        let entersException = false;
        try {
            testApp.loadDependency([userServiceInit])
        } catch (err) {
            entersException = true;

            expect(err.message).to.be.equal(`Testing environment invalid argument for 'userService'. 'compilerPass' option must be an object with property 'init' that is required and must be a function and 'property' that is optional and must be a string`);
        }

        expect(entersException).to.be.equal(true);
    });

    it('testing environment should fail to compile a dependency if compilerPass.property is not a string', () => {
        const userServiceInit = {
            name: 'userService',
            compilerPass: {
                init: function() {},
                property: null,
            },
            init: function() {
                return () => {};
            }
        };

        const testApp = gabriela.asTest(config);

        let entersException = false;
        try {
            testApp.loadDependency([userServiceInit])
        } catch (err) {
            entersException = true;

            expect(err.message).to.be.equal(`Testing environment invalid argument for 'userService'. 'compilerPass' option must be an object with property 'init' that is required and must be a function and 'property' that is optional and must be a string`);
        }

        expect(entersException).to.be.equal(true);
    });
});