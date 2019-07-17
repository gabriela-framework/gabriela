const mocha = require('mocha');
const chai = require('chai');

const it = mocha.it;
const describe = mocha.describe;
const expect = chai.expect;

const gabriela = require('../../gabriela/gabriela');
const config = require('../config/config');

describe('Compiler pass tests', () => {
    it('should add a private dependency within a compiler pass, execute it and resolve the private dependency within the init function', () => {
        let entersCompilerPass = false;
        let entersMiddleware = false;

        const userService = {
            name: 'userService',
            compilerPass: {
                init: function(config, compiler) {
                    entersCompilerPass = true;

                    compiler.getDefinition('userService').addPrivateDependency({
                        name: 'privateDependency',
                        init: function() {
                            function PrivateDependency() {
                                this.privateDepFunc = null;
                            }

                            return new PrivateDependency();
                        }
                    })
                },
            },
            init: function(privateDependency) {
                function UserService() {
                    this.privateDependency = privateDependency;
                }

                return new UserService();
            }
        };

        const g = gabriela.asProcess(config);

        g.addModule({
            name: 'module',
            dependencies: [userService],
            moduleLogic: [function(userService) {
                entersMiddleware = true;

                expect(userService).to.be.a('object');
                expect(userService).to.have.property('privateDependency');
                expect(userService.privateDependency).to.be.a('object');
                expect(userService.privateDependency).to.have.property('privateDepFunc');

            }]
        });

        return g.runModule().then(() => {
            expect(entersMiddleware).to.be.equal(true);
            expect(entersCompilerPass).to.be.equal(true);
        });
    });

    it('should assert that compiler argument passed to compiler pass cannot set any properties on that compiler', () => {
        let entersCompilerPass = false;
        let entersMiddleware = false;

        const userService = {
            name: 'userService',
            compilerPass: {
                init: function(config, compiler) {
                    entersCompilerPass = true;

                    compiler.hasOwn = null;

                    expect(compiler.hasOwn).to.be.a('function');
                },
            },
            init: function() {
                function UserService() {}

                return new UserService();
            }
        };

        const g = gabriela.asProcess(config);

        g.addModule({
            name: 'module',
            dependencies: [userService],
            moduleLogic: [function(userService) {
                entersMiddleware = true;

                expect(userService).to.be.a('object');

            }]
        });

        return g.runModule().then(() => {
            expect(entersMiddleware).to.be.equal(true);
            expect(entersCompilerPass).to.be.equal(true);
        });
    });
});