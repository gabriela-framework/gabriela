const mocha = require('mocha');
const chai = require('chai');

const it = mocha.it;
const describe = mocha.describe;
const expect = chai.expect;

const gabriela = require('../../src/gabriela/gabriela');

describe('Dependency injection types process tests', () => {
    it('should resolve a service with constructor injection with empty arguments when created as process', (done) => {
        let entersMiddleware = false;

        const definition = {
            name: 'definition',
            init: function() {
                function Service() {

                }

                return this.withConstructorInjection(Service).bind();
            }
        };

        const app = gabriela.asProcess({
            events: {
                onAppStarted() {
                    setTimeout(() => {
                        expect(entersMiddleware).to.be.equal(true);

                        this.gabriela.close();

                        done();
                    }, 500);
                }
            }
        });

        app.addModule({
            name: 'module',
            dependencies: [definition],
            moduleLogic: [function(definition) {
                entersMiddleware = true;

                expect(definition).to.be.a('object');
                expect(Object.keys(definition).length).to.be.equal(0);
            }],
        });

        app.startApp();
    });

    it('should resolve a service as property injection when created as process', (done) => {
        let entersMiddleware = false;

        const depOne = {
            name: 'depOne',
            init: function() {
                return {name: 'depOne'};
            }
        };

        const depTwo = {
            name: 'depTwo',
            init: function() {
                return {name: 'depTwo'};
            }
        };

        const definition = {
            name: 'propertyObjectDefinition',
            init: function() {
                return this.withPropertyInjection({}).bind({
                    depOne: 'depOne',
                    depTwo: 'depTwo',
                });
            }
        };

        const app = gabriela.asProcess({
            events: {
                onAppStarted() {
                    setTimeout(() => {
                        expect(entersMiddleware).to.be.equal(true);

                        this.gabriela.close();
                        done();
                    }, 500);
                }
            }
        });

        app.addModule({
            name: 'module',
            dependencies: [depOne, depTwo, definition],
            moduleLogic: [function(propertyObjectDefinition) {
                entersMiddleware = true;

                expect(propertyObjectDefinition).to.be.a('object');

                expect(propertyObjectDefinition).to.have.property('depOne');
                expect(propertyObjectDefinition).to.have.property('depTwo');

                const depOne = propertyObjectDefinition.depOne;
                const depTwo = propertyObjectDefinition.depTwo;

                expect(depOne).to.be.a('object');
                expect(depOne).to.have.property('name');
                expect(depOne.name).to.be.equal('depOne');

                expect(depTwo).to.be.a('object');
                expect(depTwo).to.have.property('name');
                expect(depTwo.name).to.be.equal('depTwo');
            }],
        });

        app.startApp();
    });

    it('should resolve a dependency with method injection when created as process', (done) => {
        let entersMiddleware = false;

        const depOne = {
            name: 'depOne',
            init: function() {
                return {name: 'depOne'};
            }
        };

        const depTwo = {
            name: 'depTwo',
            init: function() {
                return {name: 'depTwo'};
            }
        };

        const definition = {
            name: 'methodObjectDefinition',
            init: function() {
                const obj = {
                    _depOne: null,
                    _depTwo: null,
                    setDepOne(depOne) {
                        this._depOne = depOne;
                    },
                    setDepTwo(depTwo) {
                        this._depTwo = depTwo;
                    }
                };

                return this.withMethodInjection(obj).bind({
                    setDepOne: 'depOne',
                    setDepTwo: 'depTwo',
                });
            }
        };

        const app = gabriela.asProcess({
            events: {
                onAppStarted() {
                    setTimeout(() => {
                        expect(entersMiddleware).to.be.equal(true);

                        done();
                    }, 500);
                }
            }
        });

        app.addModule({
            name: 'module',
            dependencies: [depOne, depTwo, definition],
            moduleLogic: [function(methodObjectDefinition) {
                entersMiddleware = true;

                expect(methodObjectDefinition).to.be.a('object');

                expect(methodObjectDefinition).to.have.property('_depOne');
                expect(methodObjectDefinition).to.have.property('_depTwo');
                expect(methodObjectDefinition).to.have.property('setDepOne');
                expect(methodObjectDefinition).to.have.property('setDepTwo');

                const depOne = methodObjectDefinition._depOne;
                const depTwo = methodObjectDefinition._depTwo;

                expect(depOne).to.be.a('object');
                expect(depOne).to.have.property('name');
                expect(depOne.name).to.be.equal('depOne');

                expect(depTwo).to.be.a('object');
                expect(depTwo).to.have.property('name');
                expect(depTwo.name).to.be.equal('depTwo');
            }],
        });

        app.startApp();
    });

    it('should resolve a service with constructor injection with inner dependencies', (done) => {
        let entersMiddleware = false;

        const depOne = {
            name: 'depOne',
            init: function() {
                return {name: 'depOne'};
            }
        };

        const depTwo = {
            name: 'depTwo',
            init: function() {
                return {name: 'depTwo'};
            }
        };

        const definition = {
            name: 'definition',
            init: function() {
                function Dependency(depOne, depTwo) {
                    this.depOne = depOne;
                    this.depTwo = depTwo;
                }

                return this.withConstructorInjection(Dependency).bind('depOne', 'depTwo');
            }
        };

        const app = gabriela.asProcess({
            events: {
                onAppStarted() {
                    setTimeout(() => {
                        expect(entersMiddleware).to.be.equal(true);

                        this.gabriela.close();

                        done();
                    }, 500);
                }
            }
        });

        app.addModule({
            name: 'module',
            dependencies: [depOne, depTwo, definition],
            moduleLogic: [function(definition) {
                entersMiddleware = true;

                expect(definition).to.be.a('object');

                expect(definition).to.have.property('depOne');
                expect(definition).to.have.property('depTwo');

                const depOne = definition.depOne;
                const depTwo = definition.depTwo;

                expect(depOne).to.be.a('object');
                expect(depOne).to.have.property('name');
                expect(depOne.name).to.be.equal('depOne');

                expect(depTwo).to.be.a('object');
                expect(depTwo).to.have.property('name');
                expect(depTwo.name).to.be.equal('depTwo');
            }],
        });

        app.startApp();
    });

    it('should resolve public scope dependencies with property injection', (done) => {
        let entersMiddleware = false;

        const depOne = {
            name: 'depOne',
            scope: 'public',
            init: function() {
                return {name: 'depOne'};
            }
        };

        const depTwo = {
            name: 'depTwo',
            scope: 'module',
            init: function() {
                return {name: 'depTwo'};
            }
        };

        const definition = {
            name: 'propertyObjectDefinition',
            init: function() {
                return this.withPropertyInjection({}).bind({
                    depOne: 'depOne',
                    depTwo: 'depTwo',
                });
            }
        };

        const app = gabriela.asProcess({
            events: {
                onAppStarted() {
                    setTimeout(() => {
                        expect(entersMiddleware).to.be.equal(true);

                        done();
                    }, 500);
                }
            }
        });

        app.addModule({
            name: 'module',
            dependencies: [depOne, depTwo, definition],
            moduleLogic: [function(propertyObjectDefinition) {
                entersMiddleware = true;

                expect(propertyObjectDefinition).to.be.a('object');

                expect(propertyObjectDefinition).to.have.property('depOne');
                expect(propertyObjectDefinition).to.have.property('depTwo');

                const depOne = propertyObjectDefinition.depOne;
                const depTwo = propertyObjectDefinition.depTwo;

                expect(depOne).to.be.a('object');
                expect(depOne).to.have.property('name');
                expect(depOne.name).to.be.equal('depOne');

                expect(depTwo).to.be.a('object');
                expect(depTwo).to.have.property('name');
                expect(depTwo.name).to.be.equal('depTwo');
            }],
        });

        app.startApp();
    });
});
