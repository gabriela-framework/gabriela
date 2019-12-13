const mocha = require('mocha');
const chai = require('chai');
const requestPromise = require('request-promise');

const it = mocha.it;
const describe = mocha.describe;
const expect = chai.expect;

const gabriela = require('../../src/gabriela/gabriela');
const config = require('../config/config');

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

        const app = gabriela.asServer(config, [
            {
                name: 'route',
                path: '/path',
                method: 'GET',
            }
        ], {
            events: {
                onAppStarted: function() {
                    requestPromise.get('http://127.0.0.1:3000/path')
                        .then(() => {
                            this.gabriela.close();

                            done();
                        });
                }
            }
        });

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

        const app = gabriela.asServer(config, [
            {
                name: 'route',
                path: '/path',
                method: 'GET',
            }
        ], {
            events: {
                onAppStarted: function() {
                    requestPromise.get('http://127.0.0.1:3000/path')
                        .then(() => {
                            this.gabriela.close();

                            done();
                        });
                }
            }
        });

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

        const app = gabriela.asProcess(config);

        app.addPlugin(plugin);

        app.startApp();
    });
});