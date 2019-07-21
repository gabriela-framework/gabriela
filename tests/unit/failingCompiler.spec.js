const mocha = require('mocha');
const chai = require('chai');

const it = mocha.it;
const describe = mocha.describe;
const expect = chai.expect;

const Compiler = require('../../gabriela/dependencyInjection/compiler');

describe('Failing concrete compiler tests', () => {
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

            expect(err.message).to.be.equal(`Dependency injection error. Target service userService cannot return a falsy value`)
        }

        expect(entersException).to.be.equal(true);
    });

    it('should fail to get an own definition object', () => {
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
            compiler.getOwnDefinition('nonExistent');
        } catch (err) {
            entersException = true;

            expect(err.message).to.be.equal(`Dependency injection error. Definition object with name 'nonExistent' not found`);
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

            expect(err.message).to.be.equal(`Dependency injection error. 'nonExistentService' not found in the dependency tree`)
        }

        expect(entersException).to.be.equal(true);
    });

    it('should fail to compile a dependency because of invalid dependency name', () => {
        let entersException = false;

        const compiler = Compiler.create();

        let invalidService = {
            name: 'name',
            scope: 'module',
            init: function() {
                function initService() {}

                return new initService();
            }
        };

        compiler.add(invalidService);

        try {
            compiler.compile(1);
        } catch (err) {
            entersException = true;

            expect(err.message).to.be.equal(`Dependency injection error. 'compile' method expect a string as a name of a dependency that you want to compile`);
        }

        expect(entersException).to.be.equal(true);
    });

    it('should fail the compiler pass if the client code tries to use the compile() method inside a compiler pass init function', () => {
        const userServiceInit = {
            name: 'userService',
            compilerPass: {
                init: function(config, compiler) {
                    compiler.compile('userRepository')
                },
                property: null,
            },
            init: function() {
                return () => {};
            }
        };

        const compiler = Compiler.create();

        compiler.add(userServiceInit);

        let entersException = false;
        try {
            compiler.compile('userService');
        } catch(e) {
            entersException = true;

            expect(e.message).to.be.equal(`Dependency injection error in service '${userServiceInit.name}'. Compiling inside a compiler pass is forbidden`);
        }

        expect(entersException).to.be.equal(true);
    });

    it('should fail to compile if a property is not found in the config for usage in a compiler pass', () => {
        const userServiceInit = {
            name: 'userService',
            compilerPass: {
                init: function(config, compiler) {
                },
                property: 'nonExistent',
            },
            init: function() {
                return () => {};
            }
        };

        const compiler = Compiler.create();

        compiler.add(userServiceInit);

        let entersException = false;
        try {
            compiler.compile('userService', compiler, {
                validation: {}
            });
        } catch(e) {
            entersException = true;

            expect(e.message).to.be.equal(`Dependency injection error in a compiler pass in service '${userServiceInit.name}'. Property 'nonExistent' does not exist in config`);
        }

        expect(entersException).to.be.equal(true);
    });

    it('should fail to get a non existent definition object from within the getDefinition() method', () => {
        const userServiceDefinition = {
            name: 'userService',
            init: function() {
                return () => {};
            }
        };

        const compiler = Compiler.create();
        compiler.parent = Compiler.create();
        compiler.root = Compiler.create();

        compiler.add(userServiceDefinition);

        let entersException = false;
        try {
            compiler.getDefinition('nonExistent');
        } catch(e) {
            entersException = true;

            expect(e.message).to.be.equal(`Dependency injection error. Definition object with name 'nonExistent' not found`);
        }

        expect(entersException).to.be.equal(true);
    });
});