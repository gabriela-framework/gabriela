const mocha = require('mocha');
const chai = require('chai');
const requestPromise = require('request-promise');

const it = mocha.it;
const xit = mocha.xit;
const describe = mocha.describe;
const expect = chai.expect;

const gabriela = require('../../src/gabriela/gabriela');

describe('Dependency injection types process and server tests', () => {
    it('should resolve a service with constructor injection with empty arguments when created as server', (done) => {
        let entersMiddleware = false;

        const definition = {
            name: 'definition',
            init: function() {
                function Service() {

                }

                return this.withConstructorInjection(Service).bind();
            }
        };

        const app = gabriela.asServer({
            routes: [
                {
                    name: 'route',
                    path: '/route',
                    method: 'GET',
                }
            ],
            events: {
                onAppStarted() {
                    requestPromise.get('http://127.0.0.1:3000/route').then(() => {
                        expect(entersMiddleware).to.be.equal(true);

                        this.gabriela.close();

                        done();
                    });
                }
            }
        });

        app.addModule({
            name: 'module',
            dependencies: [definition],
            route: 'route',
            moduleLogic: [function(definition) {
                entersMiddleware = true;

                expect(definition).to.be.a('object');
                expect(Object.keys(definition).length).to.be.equal(0);
            }],
        });

        app.startApp();
    });

    it('should resolve a service as property injection when created in server', (done) => {
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

        const app = gabriela.asServer({
            routes: [
                {
                    name: 'route',
                    path: '/route',
                    method: 'GET',
                }
            ],
            events: {
                onAppStarted() {
                    requestPromise.get('http://127.0.0.1:3000/route').then(() => {
                        expect(entersMiddleware).to.be.equal(true);

                        this.gabriela.close();
                        done();
                    });
                }
            }
        });

        app.addModule({
            name: 'module',
            dependencies: [depOne, depTwo, definition],
            route: 'route',
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

    it('should resolve a dependency with method injection when created as server', (done) => {
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

        const app = gabriela.asServer({
            routes: [
                {
                    name: 'route',
                    path: '/route',
                    method: 'GET',
                }
            ],
            events: {
                onAppStarted() {
                    requestPromise.get('http://127.0.0.1:3000/route').then(() => {
                        expect(entersMiddleware).to.be.equal(true);

                        this.gabriela.close();
                        done();
                    });
                }
            }
        });

        app.addModule({
            name: 'module',
            dependencies: [depOne, depTwo, definition],
            route: 'route',
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

        const app = gabriela.asServer({
            routes: [
                {
                    name: 'route',
                    path: '/route',
                    method: 'GET',
                }
            ],
            events: {
                onAppStarted() {
                    requestPromise.get('http://127.0.0.1:3000/route').then(() => {
                        expect(entersMiddleware).to.be.equal(true);

                        this.gabriela.close();
                        done();
                    });
                }
            }
        });

        app.addModule({
            name: 'module',
            dependencies: [depOne, depTwo, definition],
            route: 'route',
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

        const app = gabriela.asServer({
            routes: [
                {
                    name: 'route',
                    path: '/route',
                    method: 'GET',
                }
            ],
            events: {
                onAppStarted() {
                    requestPromise.get('http://127.0.0.1:3000/route').then(() => {
                        expect(entersMiddleware).to.be.equal(true);

                        this.gabriela.close();
                        done();
                    });
                }
            }
        });

        app.addModule({
            name: 'module',
            dependencies: [depOne, depTwo, definition],
            route: 'route',
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

    xit('should resolve plugin, module and public scope dependencies with property injection within a plugin only', (done) => {
        let entersMiddleware = false;

        const sharedDep = {
            name: 'sharedDep',
            shared: {
                modules: ['mdl1']
            },
            init() {
                return {name: 'shared', mdl: 'mdl1'}
            }
        };

        const depOne = {
            name: 'depOne',
            shared: {
                plugins: ['plugin'],
            },
            init: function() {
                return {name: 'depOne'};
            }
        };

        const depTwo = {
            name: 'depTwo',
            shared: {
                plugins: ['plugin'],
            },
            init: function() {
                return {name: 'depTwo'};
            }
        };

        const definition = {
            name: 'propertyObjectDefinition',
            scope: 'public',
            init: function() {
                return this.withPropertyInjection({}).bind({
                    depOne: 'depOne',
                    depTwo: 'depTwo',
                    shared: 'sharedDep',
                });
            }
        };

        const initModule = {
            name: 'initModule',
            dependencies: [sharedDep, depOne, depTwo, definition]
        };

        const mdl1 = {
            name: 'mdl1',
            route: 'route',
            moduleLogic: [function(propertyObjectDefinition) {
                entersMiddleware = true;
            }],
        };

        const mdl2 = {
            name: 'mdl2',
        };

        const plugin = {
            name: 'plugin',
            modules: [initModule, mdl1, mdl2]
        };

        const app = gabriela.asServer({
            routes: [
                {
                    name: 'route',
                    path: '/route',
                    method: 'GET',
                },
            ],
            events: {
                onAppStarted() {
                    requestPromise.get('http://127.0.0.1:3000/route').then(() => {
                        expect(entersMiddleware).to.be.equal(true);

                        this.gabriela.close();
                        done();
                    });
                }
            }
        });

        app.addPlugin(plugin);

        app.startApp();
    });
});
