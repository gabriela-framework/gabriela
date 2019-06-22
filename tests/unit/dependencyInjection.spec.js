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

        const g = gabriela.asRunner();

        g.addModule(module1);
        g.addModule(module2);

        g.runModule().then(() => {
            expect(userService1).to.be.a('object');
            expect(userService2).to.be.a('object');

            expect(userService1 != userService2).to.be.equal(true);

            done();
        });
    });
});