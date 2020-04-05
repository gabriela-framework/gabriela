const mocha = require('mocha');
const chai = require('chai');
const faker = require('faker');
const requestPromise = require('request-promise');

const it = mocha.it;
const describe = mocha.describe;
const expect = chai.expect;

const gabriela = require('../../src/gabriela/gabriela');

describe('Gabriela server tests', function() {
    this.timeout(10000);

    it('should start listening to the server and start the app without any plugins or modules', (done) => {
        const config = {
            server: {
                port: 4000,
            },
            events: {
                onAppStarted: function() {
                    this.gabriela.close();

                    done();
                }
            }
        };

        const g = gabriela.asServer(config);

        g.startApp();
    });

    it('should start listening to the server with custom host and port', (done) => {
        const config = {
            server: {
                port: 4000,
                host: '127.0.0.1'
            },
            events: {
                onAppStarted: function() {
                    this.gabriela.close();

                    done();
                }
            }
        };

        const g = gabriela.asServer(config);

        g.startApp();
    });

    it('should start the server app with plugins and modules and run them', (done) => {
        let standaloneModuleExecuted = false;
        let pluginModule1Executed = false;
        let pluginModule2Executed = false;

        const mdl = {
            name: 'standaloneModule',
            moduleLogic: [function() {
                standaloneModuleExecuted = true;
            }],
        };

        const pluginModule1 = {
            name: 'pluginModule1',
            moduleLogic: [function() {
                pluginModule1Executed = true;
            }]
        };

        const pluginModule2 = {
            name: 'pluginModuel2',
            moduleLogic: [function() {
                pluginModule2Executed = true;
            }],
        };

        const plugin = {
            name: 'plugin',
            modules: [pluginModule1, pluginModule2],
        };

        const config = {
            server: {
                port: 4000,
            },
            events: {
                onAppStarted: function() {
                    expect(pluginModule1Executed).to.be.equal(true);
                    expect(pluginModule2Executed).to.be.equal(true);
                    expect(standaloneModuleExecuted).to.be.equal(true);

                    this.gabriela.close();

                    done();
                }
            }
        };

        const g = gabriela.asServer(config);

        g.addModule(mdl);
        g.addPlugin(plugin);

        g.startApp();
    });

    it('should resolve a public dependency only of either a plugin or a module in the onAppStartedEvent', (done) => {
        let standaloneModuleExecuted = false;
        let pluginModule1Executed = false;
        let pluginModule2Executed = false;

        const userServiceDefinition = {
            name: 'userService',
            scope: 'public',
            init: function() {
                function UserService() {}

                return new UserService();
            }
        };

        const mdl = {
            name: 'standaloneModule',
            dependencies: [userServiceDefinition],
            moduleLogic: [function() {
                standaloneModuleExecuted = true;
            }],
        };

        const pluginModule1 = {
            name: 'pluginModule1',
            moduleLogic: [function() {
                pluginModule1Executed = true;
            }]
        };

        const pluginModule2 = {
            name: 'pluginModuel2',
            moduleLogic: [function() {
                pluginModule2Executed = true;
            }],
        };

        const plugin = {
            name: 'plugin',
            modules: [pluginModule1, pluginModule2],
        };

        const config = {
            server: {
                port: 4000,
            },
            events: {
                onAppStarted: function(userService) {
                    expect(userService).to.be.a('object');

                    expect(pluginModule1Executed).to.be.equal(true);
                    expect(pluginModule2Executed).to.be.equal(true);
                    expect(standaloneModuleExecuted).to.be.equal(true);

                    this.gabriela.close();

                    done();
                }
            }
        };

        const g = gabriela.asServer(config);

        g.addModule(mdl);
        g.addPlugin(plugin);

        g.startApp();
    });

    it('should declare two routes within multiple modules within a plugin', (done) => {
        const userRepositoryDefinition = {
            name: 'userRepository',
            scope: 'public',
            init: function() {
                function UserRepository() {
                    this.getUsers = function() {
                        return [
                            {
                                name: faker.name.firstName(),
                                lastName: faker.name.lastName(),
                                email: faker.internet.email(),
                                city: faker.address.city(),
                            },
                            {
                                name: faker.name.firstName(),
                                lastName: faker.name.lastName(),
                                email: faker.internet.email(),
                                city: faker.address.city(),
                            }
                        ]
                    }
                }

                return new UserRepository();
            }
        };

        const routes = [
            {
                name: 'getUsers',
                path: '/users',
                method: 'GET',
            },
            {
                name: 'findUser',
                path: '/user/:id',
                method: 'GET',
            }
        ];

        const getUsersModule = {
            name: 'getUsers',
            dependencies: [userRepositoryDefinition],
            route: 'getUsers',
            moduleLogic: [{
                name: 'getUsers',
                middleware: function(userRepository, state, http) {
                    expect(http).to.be.a('object');
                    expect(http).to.have.property('req');
                    expect(http).to.have.property('res');

                    state.model = userRepository.getUsers();
                }
            }]
        };

        const findUserModule = {
            name: 'findUser',
            dependencies: [userRepositoryDefinition],
            route: 'findUser',
            moduleLogic: [{
                name: 'getUsersLogic',
                middleware: function(userRepository) {
                    state.model = 'findUser';
                }
            }],
        };

        const config = {
            routes: routes,
            events: {
                onAppStarted() {
                    requestPromise.get('http://localhost:3000/users', (err, res) => {
                        const data = JSON.parse(res.body);

                        expect(data).to.have.property('model');
                        expect(data.model).to.be.a('array');

                        expect(data.model.length).to.be.equal(2);

                        expect(data.model[0]).to.be.a('object');
                        expect(data.model[1]).to.be.a('object');

                        this.gabriela.close();

                        done();
                    });
                }
            }
        };

        const app = gabriela.asServer(config);

        app.addPlugin({
            name: 'userManagement',
            modules: [getUsersModule, findUserModule],
        });

        app.startApp();
    });

    it('should inject http (req, res) into the module on runtime', (done) => {
        let entersMiddleware = false;

        const routes = [
            {
                name: 'route',
                path: '/path',
                method: 'get',
            }
        ];

        const mdl = {
            route: 'route',
            name: 'module',
            moduleLogic: [function(http) {
                entersMiddleware = true;

                expect(http).to.be.a('object');
                expect(http).to.have.property('req');
                expect(http).to.have.property('res');
                expect(http.req).to.be.a('object');
                expect(http.res).to.be.a('object');
            }],
        };

        const config = {
            routes: routes,
            events: {
                onAppStarted() {
                    requestPromise.get('http://localhost:3000/path').then(() => {
                        expect(entersMiddleware).to.be.equal(true);

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

    it('should run the onExit event after the server is closed', (done) => {
        const config = {
            events: {
                onAppStarted() {
                    this.gabriela.close();
                },
                onExit() {
                    done();
                }
            }
        };

        const g = gabriela.asServer(config);

        g.startApp();
    });

    it('http middleware parameter should have all the necessary properties', (done) => {
        let middlewareCalled = false;

        const routes = [
            {
                name: 'route',
                path: '/route',
                method: 'get',
            }
        ];

        const httpsMdl = {
            name: 'httpsMdl',
            route: 'route',
            moduleLogic: [function(http) {
                middlewareCalled = true;

                expect(http.route).to.be.a('object');
                expect(http.route.name).to.be.equal('route');
                expect(http.route.path).to.be.equal('/route');
                expect(http.route.method).to.be.equal('get');
            }],
        };

        const config = {
            events: {
                onAppStarted() {
                    let options = {
                        method: 'get',
                        json: true,
                        uri : 'http://localhost:3000/route',
                    };

                    requestPromise(options).then(() => {
                        expect(middlewareCalled).to.be.equal(true);

                        this.gabriela.close();

                        done();
                    });
                },
            },
            routes: routes,
        };

        const g = gabriela.asServer(config);

        g.addModule(httpsMdl);

        g.startApp();
    });

    it('should call the proper route path based on plugin base path with lowercase method name', (done) => {
        let middlewareCalled = false;

        const routes = [
            {
                name: 'baseRoute',
                basePath: '/base-route',
                routes: [
                    {
                        name: 'route',
                        path: '/route',
                        method: 'get',
                    }
                ]
            },
        ];

        const mdl = {
            name: 'httpsMdl',
            route: 'baseRoute.route',
            moduleLogic: [function() {
                middlewareCalled = true;
            }],
        };

        const plugin = {
            name: 'plugin',
            modules: [mdl],
        };

        const config = {
            routes: routes,
            events: {
                onAppStarted() {
                    console.log('THIS APP HAS STARTED');

                    let options = {
                        method: 'get',
                        json: true,
                        uri : 'http://localhost:3000/base-route/route',
                    };

                    requestPromise(options).then(() => {
                        expect(middlewareCalled).to.be.equal(true);

                        this.gabriela.close();

                        done();
                    });
                }
            }
        };

        const g = gabriela.asServer(config);

        g.addPlugin(plugin);

        g.startApp();
    });

    it('should call the proper route path based on plugin base path with uppercase method name', (done) => {
        let middlewareCalled = false;

        const routes = [
            {
                name: 'base',
                basePath: '/base-route',
                routes: [
                    {
                        name: 'route',
                        path: '/route',
                        method: 'get',
                    }
                ]
            }
        ];

        const mdl = {
            name: 'httpsMdl',
            route: 'base.route',
            moduleLogic: [function() {
                middlewareCalled = true;
            }],
        };

        const plugin = {
            name: 'plugin',
            modules: [mdl],
        };

        const config = {
            routes: routes,
            events: {
                onAppStarted() {
                    console.log('THIS APP HAS STARTED');

                    let options = {
                        method: 'get',
                        json: true,
                        uri : 'http://localhost:3000/base-route/route',
                    };

                    requestPromise(options).then(() => {
                        expect(middlewareCalled).to.be.equal(true);

                        this.gabriela.close();

                        done();
                    });
                }
            }
        };

        const g = gabriela.asServer(config);

        g.addPlugin(plugin);

        g.startApp();
    });

    it('should call the proper route path based on plugin base path with uppercase and lowercase method names', (done) => {
        let middlewareCalled = false;

        const routes = [
            {
                name: 'baseName',
                basePath: '/base-route',
                routes: [
                    {
                        name: 'route',
                        path: '/route',
                        method: 'get',
                    }
                ]
            }
        ];

        const mdl = {
            name: 'httpsMdl',
            route: 'baseName.route',
            moduleLogic: [function() {
                middlewareCalled = true;
            }],
        };

        const plugin = {
            name: 'plugin',
            modules: [mdl],
        };

        const config = {
            routes: routes,
            events: {
                onAppStarted() {
                    console.log('THIS APP HAS STARTED');

                    let options = {
                        method: 'get',
                        json: true,
                        uri : 'http://localhost:3000/base-route/route',
                    };

                    requestPromise(options).then(() => {
                        expect(middlewareCalled).to.be.equal(true);

                        this.gabriela.close();

                        done();
                    });
                }
            }
        };

        const g = gabriela.asServer(config);

        g.addPlugin(plugin);

        g.startApp();
    });

    it('should execute multiple request to the server', (done) => {
        const config = {
            routes: [
                {
                    name: 'route',
                    path: '/route',
                    method: 'get',
                }
            ],
            events: {
                onAppStarted() {
                    const promises = [];

                    for (let i = 0; i < 10; i++) {
                        promises.push(requestPromise.get('http://localhost:3000/route'));
                    }

                    Promise.all(promises).then(() => {
                        this.gabriela.close();
                        done();
                    });
                }
            }
        };

        const g = gabriela.asServer(config);

        g.addModule({
            name: 'mdl',
            route: 'route',
        });

        g.startApp();
    });

    it('should not throw an exception if done is called and response has been sent', (done) => {
        const config = {
            routes: [
                {
                    name: 'route',
                    path: '/route',
                    method: 'get',
                }
            ],
            events: {
                onAppStarted() {
                    const promises = [];

                    for (let i = 0; i < 10; i++) {
                        promises.push(requestPromise.get('http://localhost:3000/route'));
                    }

                    Promise.all(promises).then(() => {
                        this.gabriela.close();

                        done();
                    });
                }
            }
        };

        const g = gabriela.asServer(config);

        g.addModule({
            name: 'mdl',
            route: 'route',
            moduleLogic: [async function(http, done) {
                http.res.json(200, {});

                done();
            }, async function() {

            }]
        });

        g.startApp();
    });
});
