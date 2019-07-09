const mocha = require('mocha');
const chai = require('chai');
const faker = require('faker');
const requestPromise = require('request-promise');

const it = mocha.it;
const describe = mocha.describe;
const expect = chai.expect;

const gabriela = require('../../gabriela/gabriela');

describe('Gabriela server tests', function() {
    this.timeout(10000);

    it('should start listening to the server and start the app without any plugins or modules', (done) => {
        const g = gabriela.asServer({
            server: {
                port: 4000,
            }
        });

        g.startApp({
            onAppStarted: function() {
                this.server.close();

                done();
            }
        });
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
            server: {
                port: 4000,
            }
        });

        g.addModule(mdl);
        g.addPlugin(plugin);

        g.startApp({
            onAppStarted: function() {
                expect(pluginModule1Executed).to.be.equal(true);
                expect(pluginModule2Executed).to.be.equal(true);
                expect(standaloneModuleExecuted).to.be.equal(true);

                this.server.close();

                done();
            }
        });
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
            server: {
                port: 4000,
            }
        });

        g.addModule(mdl);
        g.addPlugin(plugin);

        g.startApp({
            onAppStarted: function(userService) {
                expect(userService).to.be.a('object');

                expect(pluginModule1Executed).to.be.equal(true);
                expect(pluginModule2Executed).to.be.equal(true);
                expect(standaloneModuleExecuted).to.be.equal(true);

                this.server.close();

                done();
            }
        });
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

        const app = gabriela.asServer();

        app.addPlugin({
            name: 'userManagement',
            modules: [getUsersModule, findUserModule],
        });

        app.startApp({
            onAppStarted() {
                requestPromise.get('http://localhost:3000/users', (err, res) => {
                    const data = JSON.parse(res.body);

                    expect(data).to.have.property('model');
                    expect(data.model).to.be.a('array');

                    expect(data.model.length).to.be.equal(2);

                    expect(data.model[0]).to.be.a('object');
                    expect(data.model[1]).to.be.a('object');

                    this.server.close();

                    done();
                });
            }
        });
    });
});