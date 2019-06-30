const mocha = require('mocha');
const chai = require('chai');

const it = mocha.it;
const describe = mocha.describe;
const expect = chai.expect;

const gabriela = require('../../gabriela/gabriela');

describe('Immediately executing middleware with dependency injection and expressions', () => {
    it('should inject and execute the middleware as an expression', (done) => {
        let middlewareCalled = false;

        const middlewareService = {
            name: 'validateEmail',
            init: function() {
                function validate(state, next) {
                    middlewareCalled = true;

                    next();
                }

                return validate;
            }
        };

        const middlewareModule = {
            name: 'middlewareModule',
            dependencies: [middlewareService],
            moduleLogic: ['validateEmail()']
        };

        const g = gabriela.asProcess();

        g.addModule(middlewareModule);

        g.runModule().then(() => {
            expect(middlewareCalled).to.be.equal(true);

            done();
        });
    });

    it('should update the state of every expression middleware called', (done) => {
        let emailMiddlewareCalled = false;
        let nameMiddlewareCalled = false;

        const validateEmailInit = {
            name: 'validateEmail',
            init: function() {
                function validate(state, next) {
                    state.validateEmail = true;

                    emailMiddlewareCalled = true;

                    next();
                }

                return validate;
            }
        };

        const validateNameInit = {
            name: 'validateName',
            init: function() {
                function validate(state, next) {
                    state.validateName = true;

                    nameMiddlewareCalled = true;

                    next();
                }

                return validate;
            }
        };

        const middlewareModule = {
            name: 'middlewareModule',
            dependencies: [validateEmailInit, validateNameInit],
            moduleLogic: ['validateEmail()', 'validateName()']
        };

        const g = gabriela.asProcess();

        g.addModule(middlewareModule);

        g.runModule().then((result) => {
            expect(emailMiddlewareCalled).to.be.equal(true);
            expect(nameMiddlewareCalled).to.be.equal(true);

            expect(result).to.be.a('object');
            expect(result).to.have.property('middlewareModule');

            expect(result.middlewareModule).to.have.property('validateEmail');
            expect(result.middlewareModule).to.have.property('validateName');

            done();
        });
    });

    it('should execute all middleware executed within a plugin', (done) => {
        let emailMiddlewareCalled = 0;
        let nameMiddlewareCalled = 0;

        const validateEmailInit = {
            name: 'validateEmail',
            init: function() {
                function validate(state, next) {
                    ++emailMiddlewareCalled;

                    next();
                }

                return validate;
            }
        };

        const validateNameInit = {
            name: 'validateName',
            init: function() {
                function validate(state, next) {
                    ++nameMiddlewareCalled;

                    next();
                }

                return validate;
            }
        };

        const module1 = {
            name: 'middlewareModule',
            dependencies: [validateEmailInit, validateNameInit],
            moduleLogic: ['validateEmail()']
        };

        const module2 = {
            name: 'middlewareModule',
            dependencies: [validateEmailInit, validateNameInit],
            moduleLogic: ['validateName()']
        };

        const module3 = {
            name: 'middlewareModule',
            dependencies: [validateEmailInit, validateNameInit],
            moduleLogic: ['validateEmail()', 'validateName()']
        };

        const g = gabriela.asProcess();

        g.addPlugin({
            name: 'plugin',
            modules: [module1, module2, module3],
        });

        g.runPlugin().then(() => {
            expect(emailMiddlewareCalled).to.be.equal(2);
            expect(nameMiddlewareCalled).to.be.equal(2);

            done();
        });
    });

    it('should resolve all dependencies of a dependency run as an expression as they were regular dependencies', (done) => {
        let emailMiddlewareCalled = 0;
        let nameMiddlewareCalled = 0;

        const userRepositoryInit = {
            name: 'userRepository',
            scope: 'public',
            init: function() {
                function UserRepository() {}

                return new UserRepository();
            }
        };

        const validateEmailInit = {
            name: 'validateEmail',
            dependencies: [userRepositoryInit],
            init: function(userRepository) {
                function validate(state, next) {
                    ++emailMiddlewareCalled;

                    expect(userRepository).to.be.a('object');

                    next();
                }

                return validate;
            }
        };

        const validateNameInit = {
            name: 'validateName',
            init: function(userRepository) {
                function validate(state, next) {
                    ++nameMiddlewareCalled;

                    expect(userRepository).to.be.a('object');

                    next();
                }

                return validate;
            }
        };

        const module1 = {
            name: 'module1',
            dependencies: [validateEmailInit, validateNameInit],
            moduleLogic: ['validateEmail()'],
        };

        const module2 = {
            name: 'module2',
            dependencies: [validateNameInit, userRepositoryInit],
            moduleLogic: ['validateName()'],
        };

        const module3 = {
            name: 'module3',
            dependencies: [validateEmailInit, validateNameInit],
            moduleLogic: ['validateEmail()', 'validateName()'],
        };

        const g = gabriela.asProcess();

        g.addPlugin({
            name: 'plugin',
            modules: [module1, module2, module3],
        });

        g.runPlugin().then(() => {
            expect(emailMiddlewareCalled).to.be.equal(2);
            expect(nameMiddlewareCalled).to.be.equal(2);

            done();
        });
    });

    it('should run compiler pass function with all the required parameters without the special property option', (done) => {
        let emailMiddlewareCalled = 0;
        let nameMiddlewareCalled = 0;

        let validateEmailCompilerPassCalled = false;
        let validateNameCompilerPassCalled = false;

        const userRepositoryInit = {
            name: 'userRepository',
            scope: 'public',
            init: function() {
                function UserRepository() {}

                return new UserRepository();
            }
        };

        const validateEmailInit = {
            name: 'validateEmail',
            compilerPass: {
                init: function(config, compiler) {
                    validateEmailCompilerPassCalled = true;

                    expect(compiler).to.be.a('object');
                    expect(config).to.be.a('object');
                    expect(config).to.have.property('validation');

                    const validation = config.validation;

                    expect(validation).to.have.property('minMessage');
                    expect(validation).to.have.property('maxMessage');
                    expect(validation).to.have.property('invalidEmailMessage');

                    expect(validation.minMessage).to.be.a('string');
                    expect(validation.maxMessage).to.be.a('string');
                    expect(validation.invalidEmailMessage).to.be.a('string');
                }
            },
            dependencies: [userRepositoryInit],
            init: function(userRepository) {
                function validate(state, next) {
                    ++emailMiddlewareCalled;

                    expect(userRepository).to.be.a('object');

                    next();
                }

                return validate;
            }
        };

        const validateNameInit = {
            name: 'validateName',
            compilerPass: {
                init: function(config, compiler) {
                    validateNameCompilerPassCalled = true;

                    expect(compiler).to.be.a('object');
                    expect(config).to.be.a('object');

                    expect(config).to.have.property('minMessage');
                    expect(config).to.have.property('maxMessage');
                    expect(config).to.have.property('invalidEmailMessage');

                    expect(config.minMessage).to.be.a('string');
                    expect(config.maxMessage).to.be.a('string');
                    expect(config.invalidEmailMessage).to.be.a('string');
                },
                property: 'validation',
            },
            init: function(userRepository) {
                function validate(state, next) {
                    ++nameMiddlewareCalled;

                    expect(userRepository).to.be.a('object');

                    next();
                }

                return validate;
            }
        };

        const module1 = {
            name: 'module1',
            dependencies: [validateEmailInit, validateNameInit, userRepositoryInit],
            moduleLogic: ['validateEmail()', 'validateName()'],
        };

        const g = gabriela.asProcess({
            validation: {
                minMessage: 'Minimum message',
                maxMessage: 'Max message',
                invalidEmailMessage: 'Invalid email',
            },
        });

        g.addModule(module1);

        g.runModule().then(() => {
            expect(validateEmailCompilerPassCalled).to.be.equal(true);
            expect(validateNameCompilerPassCalled).to.be.equal(true);

            done();
        });
    });
});