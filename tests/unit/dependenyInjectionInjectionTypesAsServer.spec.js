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

                expect(propertyObjectDefinition).to.be.a('object');
                expect(propertyObjectDefinition.depOne.name).to.be.equal('depOne');
                expect(propertyObjectDefinition.depTwo.name).to.be.equal('depTwo');
                expect(propertyObjectDefinition.shared.name).to.be.equal('shared');
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

    it('should resolve shared dependencies with independent modules with property injection', (done) => {
        let enters1 = false;
        let enters2 = false;

        const sharedDep = {
            name: 'sharedDep',
            shared: {
                modules: ['mdl1', 'mdl2']
            },
            init() {
                return {mdl1: 'mdl1', mdl2: 'mdl2'}
            }
        };

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
            name: 'init',
            dependencies: [sharedDep, definition],
        };

        const mdl1 = {
            name: 'mdl1',
            route: 'route1',
            dependencies: [depOne, depTwo],
            moduleLogic: [function(definition) {
                enters1 = true;

                expect(definition.depOne).to.be.a('object');
                expect(definition.depTwo).to.be.a('object');
                expect(definition.shared).to.be.a('object');

                const sharedDep = definition.shared;

                expect(sharedDep.mdl1).to.be.equal('mdl1');
                expect(sharedDep.mdl2).to.be.equal('mdl2');
            }]
        };

        const mdl2 = {
            name: 'mdl2',
            route: 'route2',
            dependencies: [depOne, depTwo],
            moduleLogic: [function(definition) {
                enters2 = true;

                expect(definition.depOne).to.be.a('object');
                expect(definition.depTwo).to.be.a('object');
                expect(definition.shared).to.be.a('object');

                const sharedDep = definition.shared;

                expect(sharedDep.mdl1).to.be.equal('mdl1');
                expect(sharedDep.mdl2).to.be.equal('mdl2');
            }]
        };

        const app = gabriela.asServer({
            routes: [
                {
                    name: 'route1',
                    path: '/route1',
                    method: 'GET',
                },
                {
                    name: 'route2',
                    path: '/route2',
                    method: 'GET',
                },
            ],
            events: {
                onAppStarted() {
                    requestPromise.get('http://127.0.0.1:3000/route1').then(() => {
                        expect(enters1).to.be.equal(true);

                        requestPromise.get('http://127.0.0.1:3000/route2').then(() => {
                            expect(enters2).to.be.equal(true);

                            this.gabriela.close();

                            done();
                        })
                    });
                }
            }
        });

        app.addModule(initModule);
        app.addModule(mdl1);
        app.addModule(mdl2);

        app.startApp();
    });

    it('should resolve shared dependencies with independent modules with class constructor injection', (done) => {
        let enters1 = false;
        let enters2 = false;

        const sharedDep = {
            name: 'sharedDep',
            shared: {
                modules: ['mdl1', 'mdl2']
            },
            init() {
                return {mdl1: 'mdl1', mdl2: 'mdl2'}
            }
        };

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
            scope: 'public',
            init: function() {
                class Definition {
                    constructor(depOne, depTwo, sharedDep) {
                        this.depOne = depOne;
                        this.depTwo = depTwo;
                        this.shared = sharedDep;
                    }
                }

                return this.withConstructorInjection(Definition).bind('depOne', 'depTwo', 'sharedDep');
            }
        };

        const initModule = {
            name: 'init',
            dependencies: [sharedDep, definition],
        };

        const mdl1 = {
            name: 'mdl1',
            route: 'route1',
            dependencies: [depOne, depTwo],
            moduleLogic: [function(definition) {
                enters1 = true;

                expect(definition.depOne).to.be.a('object');
                expect(definition.depTwo).to.be.a('object');
                expect(definition.shared).to.be.a('object');

                const sharedDep = definition.shared;

                expect(sharedDep.mdl1).to.be.equal('mdl1');
                expect(sharedDep.mdl2).to.be.equal('mdl2');
            }]
        };

        const mdl2 = {
            name: 'mdl2',
            route: 'route2',
            dependencies: [depOne, depTwo],
            moduleLogic: [function(definition) {
                enters2 = true;

                expect(definition.depOne).to.be.a('object');
                expect(definition.depTwo).to.be.a('object');
                expect(definition.shared).to.be.a('object');

                const sharedDep = definition.shared;

                expect(sharedDep.mdl1).to.be.equal('mdl1');
                expect(sharedDep.mdl2).to.be.equal('mdl2');
            }]
        };

        const app = gabriela.asServer({
            routes: [
                {
                    name: 'route1',
                    path: '/route1',
                    method: 'GET',
                },
                {
                    name: 'route2',
                    path: '/route2',
                    method: 'GET',
                },
            ],
            events: {
                onAppStarted() {
                    requestPromise.get('http://127.0.0.1:3000/route1').then(() => {
                        expect(enters1).to.be.equal(true);

                        requestPromise.get('http://127.0.0.1:3000/route2').then(() => {
                            expect(enters2).to.be.equal(true);

                            this.gabriela.close();

                            done();
                        })
                    });
                },
            }
        });

        app.addModule(initModule);
        app.addModule(mdl1);
        app.addModule(mdl2);

        app.startApp();
    });

    it('should resolve shared dependencies with independent modules with method injection', (done) => {
        let enters1 = false;
        let enters2 = false;

        const sharedDep = {
            name: 'sharedDep',
            shared: {
                modules: ['mdl1', 'mdl2']
            },
            init() {
                return {mdl1: 'mdl1', mdl2: 'mdl2'}
            }
        };

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
            scope: 'public',
            init: function() {
                const obj = {
                    setDepOne(depOne) {
                        this.depOne = depOne;
                    },

                    setDepTwo(depTwo) {
                        this.depTwo = depTwo;
                    },

                    setShared(shared) {
                        this.shared = shared;
                    }
                };

                return this.withMethodInjection(obj).bind({
                    setDepOne: 'depOne',
                    setDepTwo: 'depTwo',
                    setShared: 'sharedDep',
                });
            }
        };

        const initModule = {
            name: 'init',
            dependencies: [sharedDep, definition],
        };

        const mdl1 = {
            name: 'mdl1',
            route: 'route1',
            dependencies: [depOne, depTwo],
            moduleLogic: [function(definition) {
                enters1 = true;

                expect(definition.depOne).to.be.a('object');
                expect(definition.depTwo).to.be.a('object');
                expect(definition.shared).to.be.a('object');

                const sharedDep = definition.shared;

                expect(sharedDep.mdl1).to.be.equal('mdl1');
                expect(sharedDep.mdl2).to.be.equal('mdl2');
            }]
        };

        const mdl2 = {
            name: 'mdl2',
            route: 'route2',
            dependencies: [depOne, depTwo],
            moduleLogic: [function(definition) {
                enters2 = true;

                expect(definition.depOne).to.be.a('object');
                expect(definition.depTwo).to.be.a('object');
                expect(definition.shared).to.be.a('object');

                const sharedDep = definition.shared;

                expect(sharedDep.mdl1).to.be.equal('mdl1');
                expect(sharedDep.mdl2).to.be.equal('mdl2');
            }]
        };

        const app = gabriela.asServer({
            routes: [
                {
                    name: 'route1',
                    path: '/route1',
                    method: 'GET',
                },
                {
                    name: 'route2',
                    path: '/route2',
                    method: 'GET',
                },
            ],
            events: {
                onAppStarted() {
                    requestPromise.get('http://127.0.0.1:3000/route1').then(() => {
                        expect(enters1).to.be.equal(true);

                        requestPromise.get('http://127.0.0.1:3000/route2').then(() => {
                            expect(enters2).to.be.equal(true);

                            this.gabriela.close();

                            done();
                        })
                    });
                },
            }
        });

        app.addModule(initModule);
        app.addModule(mdl1);
        app.addModule(mdl2);

        app.startApp();
    });

    it('should resolve shared dependencies within a plugin with property injection', (done) => {
        let enters1 = false;
        let enters2 = false;

        const sharedDep = {
            name: 'sharedDep',
            shared: {
                modules: ['plugin.mdl1', 'plugin.mdl2']
            },
            init() {
                return {mdl1: 'mdl1', mdl2: 'mdl2'}
            }
        };

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
            name: 'init',
            dependencies: [sharedDep, definition],
        };

        const mdl1 = {
            name: 'mdl1',
            route: 'route1',
            dependencies: [depOne, depTwo],
            moduleLogic: [function(definition) {
                enters1 = true;

                expect(definition.depOne).to.be.a('object');
                expect(definition.depTwo).to.be.a('object');
                expect(definition.shared).to.be.a('object');

                const sharedDep = definition.shared;

                expect(sharedDep.mdl1).to.be.equal('mdl1');
                expect(sharedDep.mdl2).to.be.equal('mdl2');
            }]
        };

        const mdl2 = {
            name: 'mdl2',
            route: 'route2',
            dependencies: [depOne, depTwo],
            moduleLogic: [function(definition) {
                enters2 = true;

                expect(definition.depOne).to.be.a('object');
                expect(definition.depTwo).to.be.a('object');
                expect(definition.shared).to.be.a('object');

                const sharedDep = definition.shared;

                expect(sharedDep.mdl1).to.be.equal('mdl1');
                expect(sharedDep.mdl2).to.be.equal('mdl2');
            }]
        };

        const app = gabriela.asServer({
            routes: [
                {
                    name: 'route1',
                    path: '/route1',
                    method: 'GET',
                },
                {
                    name: 'route2',
                    path: '/route2',
                    method: 'GET',
                },
            ],
            events: {
                onAppStarted() {
                    requestPromise.get('http://127.0.0.1:3000/route1').then(() => {
                        expect(enters1).to.be.equal(true);

                        requestPromise.get('http://127.0.0.1:3000/route2').then(() => {
                            expect(enters2).to.be.equal(true);

                            this.gabriela.close();

                            done();
                        })
                    });
                }
            }
        });

        app.addPlugin({
            name: 'plugin',
            modules: [initModule, mdl1, mdl2],
        });

        app.startApp();
    });

    it('should resolve shared dependencies within a plugin with class constructor injection', (done) => {
        let enters1 = false;
        let enters2 = false;

        const sharedDep = {
            name: 'sharedDep',
            shared: {
                modules: ['plugin.mdl1', 'plugin.mdl2']
            },
            init() {
                return {mdl1: 'mdl1', mdl2: 'mdl2'}
            }
        };

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
            scope: 'public',
            init: function() {
                class Definition {
                    constructor(depOne, depTwo, sharedDep) {
                        this.depOne = depOne;
                        this.depTwo = depTwo;
                        this.shared = sharedDep;
                    }
                }

                return this.withConstructorInjection(Definition).bind('depOne', 'depTwo', 'sharedDep');
            }
        };

        const initModule = {
            name: 'init',
            dependencies: [sharedDep, definition],
        };

        const mdl1 = {
            name: 'mdl1',
            route: 'route1',
            dependencies: [depOne, depTwo],
            moduleLogic: [function(definition) {
                enters1 = true;

                expect(definition.depOne).to.be.a('object');
                expect(definition.depTwo).to.be.a('object');
                expect(definition.shared).to.be.a('object');

                const sharedDep = definition.shared;

                expect(sharedDep.mdl1).to.be.equal('mdl1');
                expect(sharedDep.mdl2).to.be.equal('mdl2');
            }]
        };

        const mdl2 = {
            name: 'mdl2',
            route: 'route2',
            dependencies: [depOne, depTwo],
            moduleLogic: [function(definition) {
                enters2 = true;

                expect(definition.depOne).to.be.a('object');
                expect(definition.depTwo).to.be.a('object');
                expect(definition.shared).to.be.a('object');

                const sharedDep = definition.shared;

                expect(sharedDep.mdl1).to.be.equal('mdl1');
                expect(sharedDep.mdl2).to.be.equal('mdl2');
            }]
        };

        const app = gabriela.asServer({
            routes: [
                {
                    name: 'route1',
                    path: '/route1',
                    method: 'GET',
                },
                {
                    name: 'route2',
                    path: '/route2',
                    method: 'GET',
                },
            ],
            events: {
                onAppStarted() {
                    requestPromise.get('http://127.0.0.1:3000/route1').then(() => {
                        expect(enters1).to.be.equal(true);

                        requestPromise.get('http://127.0.0.1:3000/route2').then(() => {
                            expect(enters2).to.be.equal(true);

                            this.gabriela.close();

                            done();
                        })
                    });
                },
            }
        });

        app.addPlugin({
            name: 'plugin',
            modules: [initModule, mdl1, mdl2],
        });

        app.startApp();
    });

    it('should resolve shared dependencies within a plugin with method injection', (done) => {
        let enters1 = false;
        let enters2 = false;

        const sharedDep = {
            name: 'sharedDep',
            shared: {
                modules: ['plugin.mdl1', 'plugin.mdl2']
            },
            init() {
                return {mdl1: 'mdl1', mdl2: 'mdl2'}
            }
        };

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
            scope: 'public',
            init: function() {
                const obj = {
                    setDepOne(depOne) {
                        this.depOne = depOne;
                    },

                    setDepTwo(depTwo) {
                        this.depTwo = depTwo;
                    },

                    setShared(shared) {
                        this.shared = shared;
                    }
                };

                return this.withMethodInjection(obj).bind({
                    setDepOne: 'depOne',
                    setDepTwo: 'depTwo',
                    setShared: 'sharedDep',
                });
            }
        };

        const initModule = {
            name: 'init',
            dependencies: [sharedDep, definition],
        };

        const mdl1 = {
            name: 'mdl1',
            route: 'route1',
            dependencies: [depOne, depTwo],
            moduleLogic: [function(definition) {
                enters1 = true;

                expect(definition.depOne).to.be.a('object');
                expect(definition.depTwo).to.be.a('object');
                expect(definition.shared).to.be.a('object');

                const sharedDep = definition.shared;

                expect(sharedDep.mdl1).to.be.equal('mdl1');
                expect(sharedDep.mdl2).to.be.equal('mdl2');
            }]
        };

        const mdl2 = {
            name: 'mdl2',
            route: 'route2',
            dependencies: [depOne, depTwo],
            moduleLogic: [function(definition) {
                enters2 = true;

                expect(definition.depOne).to.be.a('object');
                expect(definition.depTwo).to.be.a('object');
                expect(definition.shared).to.be.a('object');

                const sharedDep = definition.shared;

                expect(sharedDep.mdl1).to.be.equal('mdl1');
                expect(sharedDep.mdl2).to.be.equal('mdl2');
            }]
        };

        const app = gabriela.asServer({
            routes: [
                {
                    name: 'route1',
                    path: '/route1',
                    method: 'GET',
                },
                {
                    name: 'route2',
                    path: '/route2',
                    method: 'GET',
                },
            ],
            events: {
                onAppStarted() {
                    requestPromise.get('http://127.0.0.1:3000/route1').then(() => {
                        expect(enters1).to.be.equal(true);

                        requestPromise.get('http://127.0.0.1:3000/route2').then(() => {
                            expect(enters2).to.be.equal(true);

                            this.gabriela.close();

                            done();
                        })
                    });
                },
            }
        });

        app.addPlugin({
            name: 'plugin',
            modules: [initModule, mdl1, mdl2],
        });

        app.startApp();
    });

    it('should resolve a public dependency based on shared plugins', (done) => {
        let entersMdl1 = false;
        let entersMdl2 = false;

        const shared1 = {
            name: 'shared1',
            shared: {
                plugins: ['plugin1']
            },
            init: function() {
                return {name: 'shared1'}
            }
        };

        const publicDep = {
            name: 'publicDep',
            scope: 'public',
            init() {
                class PublicDep {
                    constructor(shared1) {
                        this.shared1 = shared1;
                    }
                }

                return this.withConstructorInjection(PublicDep).bind('shared1');
            }
        };

        const initModule = {
            name: 'initModule',
            dependencies: [shared1, publicDep],
        };

        const g = gabriela.asProcess({
            events: {
                onAppStarted() {
                    expect(entersMdl1).to.be.equal(true);

                    done();
                }
            }
        });

        const mdl1 = {
            name: 'mdl1',
            moduleLogic: [function(publicDep) {
                entersMdl1 = true;

                expect(publicDep.shared1.name).to.be.equal('shared1');
            }],
        };

        g.addPlugin({
            name: 'plugin1',
            modules: [initModule, mdl1],
        });

        g.startApp();
    })
});
