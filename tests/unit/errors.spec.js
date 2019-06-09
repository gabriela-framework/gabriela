const mocha = require('mocha');
const chai = require('chai');

const it = mocha.it;
const describe = mocha.describe;
const expect = chai.expect;

const gabriela = require('../../gabriela/gabriela');
const Compiler = require('../../gabriela/dependencyInjection/compiler');

describe('Failing server tests', () => {
    it('should validate server options and throw exception', () => {
        let entersException = false;
        try {
            gabriela.asServer({
                port: 'invalid',
            });
        } catch (err) {
            entersException = true;
        }

        expect(entersException).to.be.equal(true);

        try {
            gabriela.asServer({
                port: 3000,
                runCallback: null,
            });
        } catch (err) {
            entersException = true;
        }

        expect(entersException).to.be.equal(true);
    });
});

describe('Failing DI compiler tests', () => {
    it('should fail to compile a dependency because invalid isAsync option type', () => {
        const userServiceInit = {
            name: 'userService',
            isAsync: 1,
            init: function() {
                return () => {};
            }
        };

        const compiler = Compiler.create();

        let entersException = false;
        try {
            compiler.add(userServiceInit);
        } catch (err) {
            entersException = true;

            expect(err.message).to.be.equal(`Dependency injection error. 'isAsync' option must be a boolean`);
        }

        expect(entersException).to.be.equal(true);
    });

    it('should fail to compile a dependency because init.init does not return a function', () => {
        const userServiceInit = {
            name: 'userService',
            init: function() {
                // returns nothing
            }
        };

        const compiler = Compiler.create();

        compiler.add(userServiceInit);

        let entersException = false;
        try {
            compiler.compile('userService');
        } catch (err) {
            entersException = true;

            expect(err.message).to.be.equal(`Dependency injection error. Target service userService cannot be a falsy value`)
        }

        expect(entersException).to.be.equal(true);
    });

    it('should fail to compile a dependency because of non existent service', () => {
        let entersException = false;

        const compiler = Compiler.create();

        try {
            compiler.compile('nonExistentService');
        } catch (err) {
            entersException = true;

            expect(err.message).to.be.equal(`Dependency injection error. nonExistentService not found in the dependency tree`)
        }

        expect(entersException).to.be.equal(true);
    });

    it('should fail to compile because init dependency value not being an object', () => {
        let entersException = false;

        const compiler = Compiler.create();

        try {
            compiler.add(1);
        } catch (err) {
            entersException = true;

            expect(err.message).to.be.equal(`Dependency injection error. 'init' dependency value must be an object`);
        }

        expect(entersException).to.be.equal(true);
    });

    it('should fail to compile a dependency because name property must be a string', () => {
        let entersException = false;

        const compiler = Compiler.create();

        try {
            compiler.add({
                name: 1
            });
        } catch (err) {
            entersException = true;

            expect(err.message).to.be.equal(`Dependency injection error. Init object 'name' property must be a string`);
        }

        expect(entersException).to.be.equal(true);
    });

    it('should fail to compile a dependency because init.init must be a function', () => {
        let entersException = false;

        const compiler = Compiler.create();

        try {
            compiler.add({
                name: 'name',
                init: 1,
            });
        } catch (err) {
            entersException = true;

            expect(err.message).to.be.equal(`Dependency injection error. Init object 'init' property must be a function`);
        }

        expect(entersException).to.be.equal(true);
    });

    it('should fail to compile because of invalid service name data type', () => {
        let entersException = false;

        const compiler = Compiler.create();

        let invalidService = {
            name: 1,
        };

        try {
            compiler.add(invalidService);
        } catch (err) {
            entersException = true;
        }

        expect(entersException).to.be.equal(true);
    });
});

describe('Failing module definition tests', () => {
    it('should throw error when module definition is invalid', () => {
        let userModule = {};

        let g = gabriela.asRunner();

        let entersException = false;
        try {
            g.addModule(userModule);
        } catch(err) {
            entersException = true;

            expect(err.message).to.be.equal(`Module definition error. Module has to have a 'name' property as a string that has to be unique to the project`);
        }

        expect(entersException).to.be.equal(true);

        userModule = {
            name: 'name',
            postLogicTransformers: null,
        };

        entersException = false;
        try {
            g.addModule(userModule);
        } catch(err) {
            entersException = true;

        }

        expect(entersException).to.be.equal(true);

        const middlewareNames = ['preLogicTransformers', 'postLogicTransformers', 'moduleLogic', 'security'];

        for (const m of middlewareNames) {
            userModule = {
                name: 'name',
            };

            userModule[m] = null;

            entersException = false;
            try {
                g.addModule(userModule);
            } catch (err) {
                entersException = true;
            }

            expect(entersException).to.be.equal(true);

            userModule[m] = [undefined];

            entersException = false;
            try {
                g.addModule(userModule);
            } catch (err) {
                entersException = true;
            }

            expect(entersException).to.be.equal(true);
        }
    });
})