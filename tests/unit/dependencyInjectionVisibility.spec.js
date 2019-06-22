const mocha = require('mocha');
const chai = require('chai');

const it = mocha.it;
const describe = mocha.describe;
const expect = chai.expect;

const gabriela = require('../../gabriela/gabriela');

describe('Visibility dependency injection tests', () => {
    it(`should resolve the default visibility to 'module' and create two different instances`, (done) => {
        const userServiceInit = {
            name: 'userService',
            init: function() {
                function UserService() {}

                return new UserService();
            }
        };

        let userService1;
        let userService2;
        let userService3;
        const module1 = {
            name: 'module1',
            dependencies: [userServiceInit],
            moduleLogic: [function(userService, next) {
                userService1 = userService;

                next();
            }],
        };

        const module2 = {
            name: 'module2',
            dependencies: [userServiceInit],
            moduleLogic: [function(userService, next) {
                userService2 = userService;

                next();
            }],
        };

        const module3 = {
            name: 'module3',
            dependencies: [userServiceInit],
            moduleLogic: [function(userService, next) {
                userService3 = userService;

                next();
            }],
        };

        const g = gabriela.asRunner();

        g.addModule(module1);
        g.addModule(module2);
        g.addModule(module3);

        g.runModule().then(() => {
            expect(userService1).to.be.a('object');
            expect(userService2).to.be.a('object');

            expect(userService1 != userService2).to.be.equal(true);
            expect(userService1 != userService3).to.be.equal(true);
            expect(userService2 != userService3).to.be.equal(true);

            done();
        });
    });

    it(`should resolve a dependency with 'plugin' visibility and give a single instance within all modules of a plugin`, (done) => {
        const userServiceInit = {
            name: 'difInstances',
            visibility: 'plugin',
            init: function() {
                function UserService() {}

                return new UserService();
            }
        };

        let services = [];
        const module1 = {
            name: 'module1',
            dependencies: [userServiceInit],
            moduleLogic: [function(difInstances, next) {
                services.push(difInstances);

                next();
            }],
        };

        const module2 = {
            name: 'module2',
            moduleLogic: [function(difInstances, next) {
                services.push(difInstances);

                next();
            }],
        };

        const plugin1 = {
            name: 'plugin1',
            modules: [module1, module2],
        };

        const plugin2 = {
            name: 'plugin2',
            modules: [module1, module2],
        };

        const g = gabriela.asRunner();

        g.addPlugin(plugin1);
        g.addPlugin(plugin2);

        g.runPlugin('plugin1').then(() => {
            expect(services[0]).to.be.a('object');
            expect(services[0]).to.be.a('object');

            expect(services[0] == services[1]).to.be.equal(true);
            expect(services[0]).to.be.equal(services[1]);

            g.runPlugin('plugin2').then(() => {
                expect(services[2]).to.be.a('object');
                expect(services[3]).to.be.a('object');

                expect(services[2] == services[3]).to.be.equal(true);
                expect(services[0] != services[2]).to.be.equal(true);
                expect(services[0] != services[3]).to.be.equal(true);

                done();
            });
        });
    });
});