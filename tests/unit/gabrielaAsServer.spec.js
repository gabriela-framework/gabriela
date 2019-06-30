const mocha = require('mocha');
const chai = require('chai');

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

    it('should resolve a public depenendecy only of either a plugin or a module in the onAppStartedEvent', (done) => {
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
});