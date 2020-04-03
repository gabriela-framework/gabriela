const mocha = require('mocha');
const chai = require('chai');
const requestPromise = require('request-promise');

const it = mocha.it;
const describe = mocha.describe;
const expect = chai.expect;

const gabriela = require('../../src/gabriela/gabriela');

describe('Middleware context usage tests', function() {
    it('should ensure presence of moduleInfo property bound to this and the info that it holds', (done) => {
        const mdl = {
            name: 'mdl',
            modelName: 'modelName',
            route: 'route',
            moduleLogic: [function () {
                expect(this.moduleInfo).to.be.a('object');
                expect(this.moduleInfo.moduleName).to.be.equal('mdl');
                expect(this.moduleInfo.route).to.be.a('object');
                expect(this.moduleInfo.route.matchedPath).to.be.a('string');
                expect(this.moduleInfo.modelName).to.be.equal('modelName');
                expect(this.moduleInfo.plugin).to.be.a('undefined');
            }],
        };

        const config = {
            routes: [
                {
                    name: 'route',
                    path: '/path',
                    method: 'GET',
                }
            ],
            events: {
                onAppStarted: function() {
                    requestPromise.get('http://127.0.0.1:3000/path')
                        .then(() => {
                            this.gabriela.close();

                            done();
                        });
                }
            }
        };

        const app = gabriela.asServer(config);

        app.addModule(mdl);

        app.startApp();
    });

    it('should have the correct moduleInfo when executed within a plugin', (done) => {
        const mdl = {
            name: 'mdl',
            modelName: 'modelName',
            route: 'route',
            moduleLogic: [function () {
                expect(this.moduleInfo).to.be.a('object');
                expect(this.moduleInfo.moduleName).to.be.equal('mdl');
                expect(this.moduleInfo.route).to.be.a('object');
                expect(this.moduleInfo.route.matchedPath).to.be.a('string');
                expect(this.moduleInfo.modelName).to.be.equal('modelName');
                expect(this.moduleInfo.plugin.name).to.be.equal('plugin');
            }],
        };

        const plugin = {
            name: 'plugin',
            modules: [mdl],
        };

        const config = {
            routes: [
                {
                    name: 'route',
                    path: '/path',
                    method: 'GET',
                }
            ],
            events: {
                onAppStarted: function() {
                    requestPromise.get('http://127.0.0.1:3000/path')
                        .then(() => {
                            this.gabriela.close();

                            done();
                        });
                }
            }
        };

        const app = gabriela.asServer(config);

        app.addPlugin(plugin);

        app.startApp();
    });

    it('should have the correct moduleInfo when executed as a process', () => {
        const mdl = {
            name: 'mdl',
            moduleLogic: [function () {
                expect(this.moduleInfo).to.be.a('object');
                expect(this.moduleInfo.moduleName).to.be.equal('mdl');
                expect(this.moduleInfo.route).to.be.a('object');
                expect(this.moduleInfo.route.matchedPath).to.be.a('undefined');
                expect(this.moduleInfo.modelName).to.be.a('undefined');
                expect(this.moduleInfo.plugin.name).to.be.equal('plugin');
            }],
        };

        const plugin = {
            name: 'plugin',
            modules: [mdl],
        };

        const app = gabriela.asProcess();

        app.addPlugin(plugin);

        app.startApp();
    });

    it('should ensure the presence of the compiler proxy bound to this context of the middleware function', () => {
        const mdl = {
            name: 'mdl',
            moduleLogic: [function () {
                expect(this.compiler.has).to.be.a('function');
                expect(this.compiler.get).to.be.a('function');
            }],
        };

        const plugin = {
            name: 'plugin',
            modules: [mdl],
        };

        const app = gabriela.asProcess();

        app.addPlugin(plugin);

        app.startApp();
    });
});
