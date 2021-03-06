const mocha = require('mocha');
const chai = require('chai');
const requestPromise = require('request-promise');

const it = mocha.it;
const describe = mocha.describe;
const expect = chai.expect;

const gabriela = require('../../src/index');

describe('Immediately executing middleware with dependency injection and expressions', () => {
    it('should inject and execute the middleware as an expression', (done) => {
        let middlewareCalled = false;

        const middlewareService = {
            name: 'validateEmail',
            init: function() {
                function validate(state, next) {
                    middlewareCalled = true;

                    expect(state).to.be.a('object');

                    next();
                }

                return validate;
            }
        };

        const middlewareModule = {
            name: 'middlewareModule',
            dependencies: [middlewareService],
            moduleLogic: ['validateEmail(state, next)']
        };

        const g = gabriela.asProcess({
            events: {
                onAppStarted() {
                    expect(middlewareCalled).to.be.equal(true);

                    done();
                }
            }
        });

        g.addModule(middlewareModule);

        g.startApp();
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

                    expect(state).to.be.a('object');

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

                    expect(state).to.be.a('object');

                    nameMiddlewareCalled = true;

                    next();
                }

                return validate;
            }
        };

        const middlewareModule = {
            name: 'middlewareModule',
            dependencies: [validateEmailInit, validateNameInit],
            moduleLogic: ['validateEmail(state, next)', 'validateName(state, next)']
        };

        const g = gabriela.asProcess({
            events: {
                onAppStarted() {
                    expect(emailMiddlewareCalled).to.be.equal(true);
                    expect(nameMiddlewareCalled).to.be.equal(true);

                    done();
                }
            }
        });

        g.addModule(middlewareModule);

        g.startApp();
    });

    it('should execute all middleware executed within a plugin', (done) => {
        let emailMiddlewareCalled = 0;
        let nameMiddlewareCalled = 0;

        const validateEmailInit = {
            name: 'validateEmail',
            init: function() {
                function validate(state, next) {
                    ++emailMiddlewareCalled;

                    expect(state).to.be.a('object');

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

                    expect(state).to.be.a('object');

                    next();
                }

                return validate;
            }
        };

        const module1 = {
            name: 'middlewareModule1',
            dependencies: [validateEmailInit, validateNameInit],
            moduleLogic: ['validateEmail(state, next)']
        };

        const module2 = {
            name: 'middlewareModule2',
            dependencies: [validateEmailInit, validateNameInit],
            moduleLogic: ['validateName(state, next)'],
        };

        const module3 = {
            name: 'middlewareModule3',
            dependencies: [validateEmailInit, validateNameInit],
            moduleLogic: ['validateEmail(state, next)', 'validateName(state, next)'],
        };

        const g = gabriela.asProcess({
            events: {
                onAppStarted() {
                    expect(emailMiddlewareCalled).to.be.equal(2);
                    expect(nameMiddlewareCalled).to.be.equal(2);

                    done();
                }
            }
        });

        g.addPlugin({
            name: 'plugin',
            modules: [module1, module2, module3],
        });

        g.startApp();
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

                    expect(state).to.be.a('object');

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

                    expect(state).to.be.a('object');

                    expect(userRepository).to.be.a('object');

                    next();
                }

                return validate;
            }
        };

        const module1 = {
            name: 'module1',
            dependencies: [validateEmailInit, validateNameInit],
            moduleLogic: ['validateEmail(state, next)'],
        };

        const module2 = {
            name: 'module2',
            dependencies: [validateNameInit, userRepositoryInit],
            moduleLogic: ['validateName(state, next)'],
        };

        const module3 = {
            name: 'module3',
            dependencies: [validateEmailInit, validateNameInit],
            moduleLogic: ['validateEmail(state, next)', 'validateName(state, next)'],
        };

        const g = gabriela.asProcess({
            events: {
                onAppStarted() {
                    expect(emailMiddlewareCalled).to.be.equal(2);
                    expect(nameMiddlewareCalled).to.be.equal(2);

                    done();
                }
            }
        });

        g.addPlugin({
            name: 'plugin',
            modules: [module1, module2, module3],
        });

        g.startApp();
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
                    expect(config.plugins).to.have.property('validation');

                    const validation = config.plugins.validation;

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

                    expect(state).to.be.a('object');

                    expect(userRepository).to.be.a('object');

                    next();
                }

                return validate;
            }
        };

        const validateNameInit = {
            name: 'validateName',
            compilerPass: {
                init: function(validation, compiler) {
                    validateNameCompilerPassCalled = true;

                    expect(compiler).to.be.a('object');
                    expect(validation).to.be.a('object');

                    expect(validation).to.have.property('minMessage');
                    expect(validation).to.have.property('maxMessage');
                    expect(validation).to.have.property('invalidEmailMessage');

                    expect(validation.minMessage).to.be.a('string');
                    expect(validation.maxMessage).to.be.a('string');
                    expect(validation.invalidEmailMessage).to.be.a('string');
                },
                property: 'validation',
            },
            init: function(userRepository) {
                function validate(state, next) {
                    ++nameMiddlewareCalled;

                    expect(state).to.be.a('object');

                    expect(userRepository).to.be.a('object');

                    next();
                }

                return validate;
            }
        };

        const module1 = {
            name: 'module1',
            dependencies: [validateEmailInit, validateNameInit, userRepositoryInit],
            moduleLogic: ['validateEmail(state, next)', 'validateName(state, next)'],
        };

        const g = gabriela.asProcess({
            plugins: {
                validation: {
                    minMessage: 'Minimum message',
                    maxMessage: 'Max message',
                    invalidEmailMessage: 'Invalid email',
                },
            },
            events: {
                onAppStarted() {
                    expect(validateEmailCompilerPassCalled).to.be.equal(true);
                    expect(validateNameCompilerPassCalled).to.be.equal(true);

                    done();
                }
            }
        });

        g.addModule(module1);

        g.startApp();
    });

    it('should resolve function expression with string dependencies',(done) => {
        let validateEmailCalled = false;
        const userRepositoryInit = {
            name: 'userRepository',
            scope: 'public',
            init: function() {
                function UserRepository() {}

                return new UserRepository();
            }
        };

        const validateEmailDefinition = {
            name: 'validateEmailWithDependency',
            init: function() {
                return function(userRepository, next, state) {
                    setTimeout(() => {
                        validateEmailCalled = true;

                        expect(userRepository).to.be.a('object');

                        expect(state).to.be.a('object');

                        next();
                    }, 50);
                }
            }
        };

        const mdl = {
            name: 'mdl',
            dependencies: [validateEmailDefinition, userRepositoryInit],
            moduleLogic: ['validateEmailWithDependency(userRepository, next, state)'],
        };

        const g = gabriela.asProcess({
            events: {
                onAppStarted() {
                    expect(validateEmailCalled).to.be.equal(true);

                    done();
                }
            }
        });

        g.addModule(mdl);

        g.startApp();
    });

    it('should inject the http arg when executed asServer along with all the others', (done) => {
        let validateEmailCalled = false;

        const userRepositoryInit = {
            name: 'userRepository',
            scope: 'public',
            init: function() {
                function UserRepository() {}

                return new UserRepository();
            }
        };

        const validateEmailDefinition = {
            name: 'validateEmailWithDependency',
            init: function() {
                return function(userRepository, next, state, http) {
                    setTimeout(() => {
                        validateEmailCalled = true;

                        expect(userRepository).to.be.a('object');

                        expect(state).to.be.a('object');
                        expect(http).to.be.a('object');
                        expect(http.req).to.be.a('object');
                        expect(http.res).to.be.a('object');

                        next();
                    }, 50);
                }
            }
        };

        const routes = [
            {
                name: 'route',
                path: '/route',
                method: 'get',
            }
        ];

        const mdl = {
            name: 'mdl',
            route: 'route',
            dependencies: [validateEmailDefinition, userRepositoryInit],
            moduleLogic: ['validateEmailWithDependency(userRepository, next, state, http)'],
        };

        const config = {
            routes: routes,
            events: {
                onAppStarted() {
                    requestPromise.get('http://localhost:3000/route').then(() => {
                        expect(validateEmailCalled).to.be.equal(true);

                        this.gabriela.close();

                        done();
                    });
                }
            }
        };

        const g = gabriela.asServer(config);

        g.addModule(mdl);

        g.startApp();
    });
});
