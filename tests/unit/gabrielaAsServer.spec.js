const mocha = require('mocha');
const chai = require('chai');
const faker = require('faker');
const requestPromise = require('request-promise');
const pem = require('pem');
const url = require('url');

const it = mocha.it;
const describe = mocha.describe;
const expect = chai.expect;

const gabriela = require('../../src/gabriela/gabriela');
const config = require('../config/config');

describe('Gabriela server tests', function() {
    this.timeout(10000);

    it('should start listening to the server and start the app without any plugins or modules', (done) => {
        const g = gabriela.asServer({
            config: {
                server: {
                    port: 4000,
                },
                framework: {},
            }
        }, {
            events: {
                onAppStarted: function() {
                    this.gabriela.close();

                    done();
                }
            }
        });

        g.startApp();
    });

    it('should start listening to the server with custom host and port', (done) => {
        const g = gabriela.asServer({
            config: {
                server: {
                    port: 4000,
                    host: '127.0.0.1'
                },
                framework: {},
            }
        }, {
            events: {
                onAppStarted: function() {
                    this.gabriela.close();

                    done();
                }
            }
        });

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

        const g = gabriela.asServer({
            config: {
                server: {
                    port: 4000,
                },
                framework: {},
            },
        }, {
            events: {
                onAppStarted: function() {
                    expect(pluginModule1Executed).to.be.equal(true);
                    expect(pluginModule2Executed).to.be.equal(true);
                    expect(standaloneModuleExecuted).to.be.equal(true);

                    this.gabriela.close();

                    done();
                }
            }
        });

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

        const g = gabriela.asServer({
            config: {
                server: {
                    port: 4000,
                },
                framework: {},
            }
        }, {
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
        });

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

        const getUsersModule = {
            name: 'getUsers',
            dependencies: [userRepositoryDefinition],
            http: {
                route: {
                    name: 'getUsers',
                    path: '/users',
                    method: 'GET',
                }
            },
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
            http: {
                route: {
                    name: 'findUser',
                    path: '/user/:id',
                    method: 'GET',
                }
            },
            moduleLogic: [{
                name: 'getUsersLogic',
                middleware: function(userRepository) {
                    state.model = 'findUser';
                }
            }],
        };

        const app = gabriela.asServer(config, {
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
        });

        app.addPlugin({
            name: 'userManagement',
            modules: [getUsersModule, findUserModule],
        });

        app.startApp();
    });

    it('should inject http (req, res) into the module on runtime', (done) => {
        let entersMiddleware = false;
        const mdl = {
            http: {
                route: {
                    name: 'route',
                    path: '/path',
                    method: 'get',
                }
            },
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

        const g = gabriela.asServer({
            config: {
                framework: {},
            },
        }, {
            events: {
                onAppStarted() {
                    requestPromise.get('http://localhost:3000/path').then(() => {
                        expect(entersMiddleware).to.be.equal(true);

                        this.gabriela.close();

                        done();
                    });
                }
            }
        });

        g.addModule(mdl);

        g.startApp();
    });

    it('should send the response with sendRaw method in the same way as send() in regarding http events', (done) => {
        let onPostResponseCalled = false;
        let onPreResponseCalled = false;
        const g = gabriela.asServer(config, {
            events: {
                onAppStarted() {
                    requestPromise.get('http://localhost:3000/path').then((response) => {
                        expect(response).to.be.equal('Response');

                        expect(onPreResponseCalled).to.be.equal(true);
                        // this is neccessary the onPostResponse is fired after the response has been sent,
                        // so this response handler gets executed before onPostResponse therefor, i have to wait
                        setTimeout(() => {
                            expect(onPostResponseCalled).to.be.equal(true);

                            this.gabriela.close();

                            done();

                        }, 500);
                    });
                }
            }
        });

        g.addModule({
            name: 'module',
            mediator: {
                onPreResponse() {
                    onPreResponseCalled = true;
                },
                onPostResponse() {
                    onPostResponseCalled = true;
                }
            },
            http: {
                route: {
                    name: 'route',
                    path: '/path',
                    method: 'get',
                },
            },
            moduleLogic: [function(http) {
                http.res.sendRaw('Response');
            }],
        });

        g.startApp();
    });

    it('should send the response with json() method in the same way as send() or sendRaw() in regarding http events', (done) => {
        let onPostResponseCalled = false;
        let onPreResponseCalled = false;
        const g = gabriela.asServer(config, {
            events: {
                onAppStarted() {
                    requestPromise.get('http://localhost:3000/path').then((response) => {
                        expect(JSON.parse(response)).to.be.equal('Response');

                        expect(onPreResponseCalled).to.be.equal(true);
                        // this is neccessary the onPostResponse is fired after the response has been sent,
                        // so this response handler gets executed before onPostResponse therefor, i have to wait
                        setTimeout(() => {
                            expect(onPostResponseCalled).to.be.equal(true);

                            this.gabriela.close();

                            done();

                        }, 500);
                    });
                }
            }
        });

        g.addModule({
            name: 'module',
            mediator: {
                onPreResponse() {
                    onPreResponseCalled = true;
                },
                onPostResponse() {
                    onPostResponseCalled = true;
                }
            },
            http: {
                route: {
                    name: 'route',
                    path: '/path',
                    method: 'get',
                },
            },
            moduleLogic: [function(http) {
                http.res.json('Response');
            }],
        });

        g.startApp();
    });

    it('should run the onExit event after the server is closed', (done) => {
        const g = gabriela.asServer({
            config: {
                framework: {},
            }
        }, {
            events: {
                onAppStarted() {
                    this.gabriela.close();
                },
                onExit() {
                    done();
                }
            }
        });

        g.startApp();
    });

    it('should create an https server', (done) => {
        pem.createCertificate({ days: 1, selfSigned: true }, function (err, keys) {
            if (err) {
                throw err
            }

            let middlewareCalled = false;

            const httpsMdl = {
                name: 'httpsMdl',
                http: {
                    route: {
                        name: 'route',
                        path: '/route',
                        method: 'get',
                    }
                },
                moduleLogic: [function(http) {
                    middlewareCalled = true;

                    expect(http.req.isSecure()).to.be.equal(true);
                }],
            };

            const g = gabriela.asServer({
                config: {
                    framework: {},
                    server: {
                        key: keys.serviceKey,
                        certificate: keys.certificate
                    }
                }
            }, {
                events: {
                    onAppStarted() {
                        let options = {
                            method: 'get',
                            json: true,
                            uri : 'https://localhost:3000/route',
                            insecure: true,
                            rejectUnauthorized: false,
                        };

                        requestPromise(options).then(() => {
                            expect(middlewareCalled).to.be.equal(true);

                            this.gabriela.close();

                            done();
                        });
                    },
                }
            });

            g.addModule(httpsMdl);

            g.startApp();
        });
    });

    it('should only accept https protocol when created without cert', (done) => {
        let middlewareCalled = false;

        const httpsMdl = {
            name: 'httpsMdl',
            http: {
                route: {
                    name: 'route',
                    path: '/route',
                    method: 'get',
                    protocols: ['https']
                }
            },
            moduleLogic: [function() {
                middlewareCalled = true;
            }],
        };

        const g = gabriela.asServer({
            config: {
                framework: {},
            }
        }, {
            events: {
                onAppStarted() {
                    let options = {
                        method: 'get',
                        json: true,
                        uri : 'http://localhost:3000/route',
                        resolveWithFullResponse: true,
                    };

                    requestPromise(options).then((response) => {
                        assert.fail('This request should not be successful');
                    }).catch((err) => {
                        expect(middlewareCalled).to.be.equal(false);

                        expect(err.statusCode).to.be.equal(400);
                        expect(err.error).to.be.equal('Invalid protocol');

                        this.gabriela.close();

                        done();
                    });
                },
            }
        });

        g.addModule(httpsMdl);

        g.startApp();
    });
});