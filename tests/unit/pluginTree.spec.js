const mocha = require('mocha');
const chai = require('chai');
const assert = require('assert');

const it = mocha.it;
const xit = mocha.xit;
const describe = mocha.describe;
const expect = chai.expect;

const gabriela = require('../../gabriela/gabriela');

describe('Plugin tree execution tests', function() {
    xit('should execute a tree of plugins', () => {
        let dataSourceModuleExecuted = false;
        let logicModuleExecuted = false;
        let presentationModuleExecuted = false;
    
        const dataSourceModule = {
            name: 'dataSourceModule',
            moduleLogic: [function() {
                dataSourceModuleExecuted = true;
            }],
        };
    
        const logicModule = {
            name: 'logicModule',
            moduleLogic: [function() {
                logicModuleExecuted = true;
            }],
        };
    
        const presentationModule = {
            name: 'presentationModule',
            moduleLogic: [function() {
                presentationModuleExecuted = true;
            }],
        };
    
        const dataSourcePlugin = {
            name: 'dataSourcePlugin',
            modules: [dataSourceModule],
        };

        const logicPlugin = {
            name: 'logicPlugin',
            modules: [logicModule],
            plugins: [dataSourcePlugin],
        };

        const presentationPlugin = {
            name: 'presentationPlugin',
            modules: [presentationModule],
            plugins: [logicPlugin],
        };

        const g = gabriela.asProcess();

        g.addPlugin(presentationPlugin);

        return g.runPlugin().then(() => {
            expect(logicModuleExecuted).to.be.equal(true);
            expect(presentationModuleExecuted).to.be.equal(true);
            expect(dataSourceModuleExecuted).to.be.equal(true);
        });
    });
});

