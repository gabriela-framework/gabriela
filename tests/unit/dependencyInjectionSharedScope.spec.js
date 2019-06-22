const mocha = require('mocha');
const chai = require('chai');

const it = mocha.it;
const describe = mocha.describe;
const expect = chai.expect;

const gabriela = require('../../gabriela/gabriela');

describe('Shared scope dependency injection tests', () => {
    it('should create a shared dependency between multiple modules', () => {
        const userServiceInit = {
            name: 'userService',
            shared: {
                modules: ['module1', 'module2'],
            },
            init: function() {
                function UserService() {}

                return new UserService();
            }
        };

        const scopeUserServiceInit = {
            name: 'userService',
            init: function() {
                function UserService() {}

                return new UserService();
            }
        };

        const services = [];
        let singleService;

        const module1 = {
            name: 'module1',
            dependencies: [userServiceInit],
            moduleLogic: [function(userService, next) {
                services.push(userService);

                next();
            }],
        };

        const module2 = {
            name: 'module2',
            moduleLogic: [function(userService, next) {
                services.push(userService);
                next();
            }],
        };

        const module3 = {
            name: 'module3',
            dependencies: [scopeUserServiceInit],
            moduleLogic: [function(userService, next) {
                singleService = userService;

                next();
            }],
        };

        const g = gabriela.asRunner();

        g.addModule(module1);
        g.addModule(module2);
        g.addModule(module3);

        g.runModule().then(() => {
            for (let i = 0; i < services.length; i++) {
                expect(singleService != services[i]);

                for (let a = 0; a < services.length; a++) {
                    expect(services[i] == services[a]);
                }
            }
        });
    });
});