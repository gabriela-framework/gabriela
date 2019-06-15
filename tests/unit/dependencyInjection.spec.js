const mocha = require('mocha');
const chai = require('chai');

const it = mocha.it;
const describe = mocha.describe;
const expect = chai.expect;

const Compiler = require('./../../gabriela/dependencyInjection/compiler');
const gabriela = require('./../../gabriela/gabriela');

describe('Dependency injection tests', () => {
    it('should create a single dependency', () => {
        const userServiceInit = {
            name: 'userService',
            init: function() {
                function userService() {
                    this.addUser = function() {};
                    this.removeUser = function() {};
                }

                return new userService();
            }
        };

        const compiler = Compiler.create();

        compiler.add(userServiceInit);

        const userService = compiler.compile('userService');

        expect(userService).to.have.property('addUser');
        expect(userService).to.have.property('removeUser');

        let us1 = compiler.compile('userService');

        expect(userService).to.be.equal(us1);
        expect(us1 == userService).to.be.equal(true);
    });

    it('should create a tree of dependencies', () => {
        const commentServiceInit = {
            name: 'commentService',
            init: function() {
                function commentService() {
                    this.addComment = function() {};
                    this.removeComment = function() {};
                }

                return new commentService();
            }
        };

        const userServiceInit = {
            name: 'userService',
            init: function(commentService) {
                function userService() {
                    this.addUser = function() {};
                    this.removeUser = function() {};

                    this.commentService = commentService;
                }

                return new userService();
            }
        };

        const compiler = Compiler.create();

        compiler.add(userServiceInit);
        compiler.add(commentServiceInit);

        const userService = compiler.compile('userService');

        expect(userService).to.have.property('addUser');
        expect(userService).to.have.property('removeUser');
        expect(userService).to.have.property('commentService');

        const commentService = userService.commentService;

        expect(commentService).to.have.property('addComment');
        expect(commentService).to.have.property('removeComment');

        let cs1 = compiler.compile('commentService');

        expect(cs1 == commentService).to.be.equal(true);
    });

    it('should add all dependencies with visibility property', () => {
        const visibilities = ['module', 'plugin', 'public'];
        let entersException = false;

        const compiler = Compiler.create();

        for (const v of visibilities) {
            entersException = false;
            try {
                compiler.add({
                    name: 'name',
                    visibility: v,
                    init: function() {
                        return () => {};
                    },
                });
            } catch (err) {
                entersException = true;
            }

            expect(entersException).to.be.equal(false);
        }
    });

    it('should resolve a single dependency with module visibility property', () => {
        const userServiceInit = {
            name: 'userService',
            visibility: 'module',
            init: function() {
                function userService() {
                    this.addUser = function() {};
                    this.removeUser = function() {};
                }

                return new userService();
            }
        };

        let userServiceInstantiated = false;

        const runner = gabriela.asRunner().module;

        runner.addModule({
            name: 'dependencyInjectionVisibility',
            dependencies: [userServiceInit],
            preLogicTransformers: [function(userService, next) {
                userServiceInstantiated = true;

                expect(userService).to.be.a('object');
                expect(userService).to.have.property('addUser');
                expect(userService).to.have.property('removeUser');

                next();
            }],
        });

        runner.run('dependencyInjectionVisibility');
    });
});

describe('Dependency injection scope - framework wide', () => {
    it('should create a \'module\' scope and find the dependency', () => {
        const userService = {
            name: 'userService',
            visibility: 'module',
            init: function() {
                function UserService() {
                    this.addUser = null;
                }

                return new UserService();
            }
        };

        const rootCompiler = Compiler.create();
        const pluginCompiler = Compiler.create();
        const moduleCompiler = Compiler.create();

        moduleCompiler.parent = pluginCompiler;
        moduleCompiler.root = rootCompiler;
        pluginCompiler.root = rootCompiler;

        moduleCompiler.add(userService);

        expect(moduleCompiler.has('userService')).to.be.equal(true);
        expect(moduleCompiler.parent.has('userService')).to.be.equal(false);
        expect(moduleCompiler.root.has('userService')).to.be.equal(false);

        const dep = moduleCompiler.compile('userService');

        expect(dep).to.be.a('object');
        expect(dep).to.have.property('addUser');
    });

    it('should create a \'plugin\' scope and find the dependency', () => {
        const userService = {
            name: 'userService',
            visibility: 'plugin',
            init: function() {
                function UserService() {
                    this.addUser = null;
                }

                return new UserService();
            }
        };

        const rootCompiler = Compiler.create();
        const pluginCompiler = Compiler.create();
        const moduleCompiler = Compiler.create();

        moduleCompiler.parent = pluginCompiler;
        moduleCompiler.root = rootCompiler;
        pluginCompiler.root = rootCompiler;

        moduleCompiler.parent.add(userService);

        expect(moduleCompiler.has('userService')).to.be.equal(true);
        expect(moduleCompiler.parent.has('userService')).to.be.equal(true);
        expect(moduleCompiler.root.has('userService')).to.be.equal(false);

        const dep = moduleCompiler.compile('userService');

        expect(dep).to.be.a('object');
        expect(dep).to.have.property('addUser');
    });

    it('should create a \'public\' scope and find the dependency', () => {
        const userService = {
            name: 'userService',
            visibility: 'public',
            init: function() {
                function UserService() {
                    this.addUser = null;
                }

                return new UserService();
            }
        };

        const rootCompiler = Compiler.create();
        const pluginCompiler = Compiler.create();
        const moduleCompiler = Compiler.create();

        moduleCompiler.parent = pluginCompiler;
        moduleCompiler.root = rootCompiler;
        pluginCompiler.root = rootCompiler;

        moduleCompiler.root.add(userService);

        expect(moduleCompiler.has('userService')).to.be.equal(true);
        expect(moduleCompiler.parent.has('userService')).to.be.equal(true);
        expect(moduleCompiler.root.has('userService')).to.be.equal(true);

        const dep = moduleCompiler.compile('userService');

        expect(dep).to.be.a('object');
        expect(dep).to.have.property('addUser');
    });
});