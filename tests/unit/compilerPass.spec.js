const mocha = require('mocha');
const chai = require('chai');

const it = mocha.it;
const describe = mocha.describe;
const expect = chai.expect;

const gabriela = require('../../src/gabriela/gabriela');

describe('Compiler pass tests', () => {
    it('should assert that compiler argument passed to compiler pass cannot set any properties on that compiler', (done) => {
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

        const g = gabriela.asProcess({
            events: {
                onAppStarted() {
                    expect(entersMiddleware).to.be.equal(true);
                    expect(entersCompilerPass).to.be.equal(true);

                    done();
                }
            }
        });

        g.addModule({
            name: 'module',
            dependencies: [userService],
            moduleLogic: [function(userService) {
                entersMiddleware = true;

                expect(userService).to.be.a('object');

            }]
        });

        g.startApp();
    });

    it('should create a module dependency within a compiler pass', (done) => {
        let entersCompilerPass = false;
        let entersMiddleware = false;

        const userService = {
            name: 'userService',
            compilerPass: {
                init: function(config, compiler) {
                    entersCompilerPass = true;

                    compiler.add({
                        name: 'userRepository',
                        scope: 'module',
                        init: function() {
                            function UserRepository() {
                                this.name = 'userRepository';
                            }

                            return new UserRepository();
                        }
                    })
                },
            },
            init: function() {
                function UserService() {}

                return new UserService();
            }
        };

        const g = gabriela.asProcess({
            events: {
                onAppStarted() {
                    expect(entersMiddleware).to.be.equal(true);
                    expect(entersCompilerPass).to.be.equal(true);

                    done();
                }
            }
        });

        g.addModule({
            name: 'module',
            dependencies:[userService],
            moduleLogic: [function(userRepository) {
                entersMiddleware = true;

                expect(userRepository).to.be.a('object');
                expect(userRepository.name).to.be.equal('userRepository');
            }],
        });

        g.startApp();
    });

    it('should create a plugin dependency within a compiler pass', (done) => {
        let entersCompilerPass = false;
        let entersMdl1 = false;
        let entersMdl2 = false;

        const userService = {
            name: 'userService',
            compilerPass: {
                init: function(config, compiler) {
                    entersCompilerPass = true;

                    compiler.add({
                        name: 'userRepository',
                        scope: 'plugin',
                        init: function() {
                            function UserRepository() {
                                this.name = 'userRepository';
                            }

                            return new UserRepository();
                        }
                    })
                },
            },
            init: function() {
                function UserService() {}

                return new UserService();
            }
        };

        const g = gabriela.asProcess({
            events: {
                onAppStarted() {
                    expect(entersMdl1).to.be.equal(true);
                    expect(entersMdl2).to.be.equal(true);
                    expect(entersCompilerPass).to.be.equal(true);

                    done();
                }
            }
        });

        const mdl1 = {
            name: 'mdl1',
            dependencies:[userService],
            moduleLogic: [function(userRepository) {
                entersMdl1 = true;

                expect(userRepository).to.be.a('object');
                expect(userRepository.name).to.be.equal('userRepository');
            }],
        };

        const mdl2 = {
            name: 'mdl2',
            dependencies:[userService],
            moduleLogic: [function(userRepository) {
                entersMdl2 = true;

                expect(userRepository).to.be.a('object');
                expect(userRepository.name).to.be.equal('userRepository');
            }],
        };

        g.addPlugin({
            name: 'plugin',
            modules: [mdl1, mdl2],
        });

        g.startApp();
    });

    it('should create a public dependency within a compiler pass', (done) => {
        let entersCompilerPass = false;
        let entersMdl1 = false;
        let entersMdl2 = false;

        const userService = {
            name: 'userService',
            compilerPass: {
                init: function(config, compiler) {
                    entersCompilerPass = true;

                    compiler.add({
                        name: 'userRepository',
                        scope: 'public',
                        init: function() {
                            function UserRepository() {
                                this.name = 'userRepository';
                            }

                            return new UserRepository();
                        }
                    })
                },
            },
            init: function() {
                function UserService() {}

                return new UserService();
            }
        };

        const g = gabriela.asProcess({
            events: {
                onAppStarted() {
                    expect(entersMdl1).to.be.equal(true);
                    expect(entersMdl2).to.be.equal(true);
                    expect(entersCompilerPass).to.be.equal(true);

                    done();
                }
            }
        });

        const mdl1 = {
            name: 'mdl1',
            dependencies:[userService],
            moduleLogic: [function(userRepository) {
                entersMdl1 = true;

                expect(userRepository).to.be.a('object');
                expect(userRepository.name).to.be.equal('userRepository');
            }],
        };

        const mdl2 = {
            name: 'mdl2',
            dependencies:[userService],
            moduleLogic: [function(userRepository) {
                entersMdl2 = true;

                expect(userRepository).to.be.a('object');
                expect(userRepository.name).to.be.equal('userRepository');
            }],
        };

        g.addModule(mdl1);
        g.addModule(mdl2);

        g.startApp();
    });

    it('should create a shared dependency within a compiler pass', (done) => {
        let entersCompilerPass = false;
        let entersMdl1 = false;
        let entersMdl2 = false;

        const userService = {
            name: 'userService',
            compilerPass: {
                init: function(config, compiler) {
                    entersCompilerPass = true;

                    compiler.add({
                        name: 'userRepository',
                        shared: {
                            modules: ['plugin1.mdl1', 'plugin2.mdl2'],
                        },
                        init: function() {
                            function UserRepository() {
                                this.name = 'userRepository';
                            }

                            return new UserRepository();
                        }
                    })
                },
            },
            init: function() {
                function UserService() {}

                return new UserService();
            }
        };

        const g = gabriela.asProcess({
            events: {
                onAppStarted() {
                    expect(entersMdl1).to.be.equal(true);
                    expect(entersMdl2).to.be.equal(true);
                    expect(entersCompilerPass).to.be.equal(true);

                    done();
                }
            }
        });

        const mdl1 = {
            name: 'mdl1',
            dependencies:[userService],
            moduleLogic: [function(userRepository) {
                entersMdl1 = true;

                expect(userRepository).to.be.a('object');
                expect(userRepository.name).to.be.equal('userRepository');
            }],
        };

        const mdl2 = {
            name: 'mdl2',
            dependencies:[userService],
            moduleLogic: [function(userRepository) {
                entersMdl2 = true;

                expect(userRepository).to.be.a('object');
                expect(userRepository.name).to.be.equal('userRepository');
            }],
        };

        g.addPlugin({
            name: 'plugin1',
            modules: [mdl1],
        });

        g.addPlugin({
            name: 'plugin2',
            modules: [mdl2],
        });

        g.startApp();
    });
});
