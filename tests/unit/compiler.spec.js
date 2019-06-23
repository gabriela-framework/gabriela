const mocha = require('mocha');
const chai = require('chai');

const it = mocha.it;
const describe = mocha.describe;
const expect = chai.expect;

const Compiler = require('./../../gabriela/dependencyInjection/compiler');

describe('Compiler instance tests', () => {
    it('create() should create two different instances of the compiler', () => {
        const compiler1 = Compiler.create();
        const compiler2 = Compiler.create();

        expect(compiler1).to.not.be.equal(compiler2);
        expect(compiler1 != compiler2).to.be.equal(true);
    });

    it('should create a init object and inspect it', () => {
        const userServiceInit = {
            name: 'userService',
            isAsync: true,
            scope: 'module',
            shared: {
                plugins: ['pluginName', 'otherPlugin'],
                modules: ['moduleName', 'otherModule'],
            },
            init: function() {
                function userService() {
                    this.addUser = function() {};
                    this.removeUser = function() {};
                }

                return new userService();
            }
        };

        const c = Compiler.create();

        c.add(userServiceInit);

        const initObject = c.getInit('userService');

        expect(initObject).to.be.a('object');
        expect(initObject).to.have.property('name');
        expect(initObject.name).to.be.a('string');

        expect(initObject).to.have.property('isAsync');
        expect(initObject.isAsync).to.be.a('boolean');

        expect(initObject).to.have.property('init');
        expect(initObject.init).to.be.a('function');

        expect(initObject).to.have.property('scope');
        expect(initObject.scope).to.be.a('string');

        expect(initObject).to.have.property('hasScope');
        expect(initObject.hasScope).to.be.a('function');

        expect(initObject).to.have.property('isShared');
        expect(initObject.isShared).to.be.a('function');

        expect(initObject.hasScope()).to.be.equal(true);
        expect(initObject.isShared()).to.be.equal(true);

        expect(initObject).to.have.property('shared');
        expect(initObject).to.be.a('object');

        expect(initObject).to.have.property('sharedPlugins');
        expect(initObject.sharedPlugins).to.be.a('function');

        expect(userServiceInit.shared.plugins).to.deep.equal(initObject.sharedPlugins());

        expect(initObject).to.have.property('sharedModules');
        expect(initObject.sharedModules).to.be.a('function');

        expect(userServiceInit.shared.modules).to.deep.equal(initObject.sharedModules());

        expect(initObject.isSharedWith('moduleName')).to.be.equal(true);
        expect(initObject.isSharedWith('otherPlugin')).to.be.equal(true);
        expect(initObject.isSharedWith('nonExistent')).to.be.equal(false);

        expect(initObject.dependencies).to.be.equal(undefined);
        expect(initObject.hasDependencies()).to.be.equal(false);
    });

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
        compiler.name = 'module';

        compiler.add(userServiceInit);
        compiler.add(commentServiceInit);

        const userService = compiler.compile('userService', compiler);

        expect(userService).to.have.property('addUser');
        expect(userService).to.have.property('removeUser');
        expect(userService).to.have.property('commentService');

        const commentService = userService.commentService;

        expect(commentService).to.have.property('addComment');
        expect(commentService).to.have.property('removeComment');

        expect(compiler.isResolved('commentService')).to.be.equal(true);

        let cs1 = compiler.compile('commentService', compiler);

        //expect(cs1 == commentService).to.be.equal(true);

        expect(userService == compiler.compile('userService')).to.be.equal(true);
    });

    it('should resolve a service in a compiler tree data structure with depth 3', () => {
        const root = Compiler.create();
        const parent = Compiler.create();
        const child1 = Compiler.create();
        const child2 = Compiler.create();

        parent.root = root;

        child1.root = root;
        child2.root = root;
        child2.parent = parent;
        child1.parent = parent;

        const userServiceInit = {
            name: 'userService',
            init: function() {
                function UserService() {}

                return new UserService();
            }
        };

        child1.root.add(userServiceInit);

        const compiled = child2.compile('userService');

        expect(compiled).to.be.a('object');
        expect(child2.isResolved('userService')).to.be.equal(true);

        const resolved = child2.parent.compile('userService');

        expect(resolved).to.be.equal(compiled);
    });

    it('should not count a dependency as resolved if the third argument is added to the compile method', () => {
        const userServiceInit = {
            name: 'userService',
            init: function() {
                return () => {};
            }
        };

        const compiler = Compiler.create();

        compiler.add(userServiceInit);

        const compiled = compiler.compile('userService', compiler, false);

        expect(compiled).to.be.a('function');
        expect(compiler.isResolved('userService')).to.be.equal(false);
    });

    it('should return a single already resolved dependency', () => {
        const c = Compiler.create();

        const userServiceInit = {
            name: 'userService',
            init: function() {
                function UserService() {}

                return new UserService();
            }
        };

        c.add(userServiceInit);

        const compiled = c.compile('userService');

        expect(compiled).to.be.a('object');
        expect(c.isResolved('userService')).to.be.equal(true);

        const resolved = c.compile('userService');

        expect(resolved).to.be.equal(compiled);
        expect(resolved === compiled).to.be.equal(true);
        expect(resolved == compiled).to.be.equal(true);
    });

    it('should return a single already resolved service from a linked list compiler structure', () => {
        const child = Compiler.create();
        const parent = Compiler.create();

        child.parent = parent;

        const userServiceInit = {
            name: 'userService',
            init: function() {
                function UserService() {}

                return new UserService();
            }
        };

        parent.add(userServiceInit);

        expect(child.isResolved('userService')).to.be.equal(false);

        const compiled = child.compile('userService');

        expect(child.isResolved('userService')).to.be.equal(true);

        const resolved = child.compile('userService');

        expect(compiled === resolved).to.be.equal(true);
    });

    it('should resolve a service in a compiler tree data structure with depth 2', () => {
        const root = Compiler.create();
        const child1 = Compiler.create();
        const child2 = Compiler.create();

        child1.root = root;
        child2.root = root;

        const userServiceInit = {
            name: 'userService',
            init: function() {
                function UserService() {}

                return new UserService();
            }
        };

        child1.root.add(userServiceInit);

        expect(child2.has('userService')).to.be.equal(true);

        const compiled = child2.compile('userService');

        expect(compiled).to.be.a('object');
        expect(child2.isResolved('userService')).to.be.equal(true);
        expect(child1.isResolved('userService')).to.be.equal(true);

        const resolved = child1.compile('userService');

        expect(resolved).to.be.a('object');
        expect(resolved === compiled).to.be.equal(true);
        expect(resolved).to.be.equal(compiled);
    });

    it('should resolve a single instance of a private dependency', () => {
        const compiler = Compiler.create();

        const userRepositoryInit = {
            name: 'userRepository',
            init: function() {
                function UserRepository() {}

                return new UserRepository();
            }
        };

        const friendsRepositoryInit = {
            name: 'friendsRepository',
            scope: 'public',
            init: function() {
                function FriendsRepository() {}

                return new FriendsRepository();
            }
        };

        const userServiceInit = {
            name: 'compilerPrivateService',
            dependencies: [userRepositoryInit, friendsRepositoryInit],
            scope: 'public',
            init: function(userRepository, friendsRepository) {
                function UserService() {
                    this.userRepository = userRepository;
                    this.friendsRepository = friendsRepository;
                }

                return new UserService();
            }
        };

        compiler.add(userServiceInit);

        expect(compiler.has('friendsRepository')).to.be.equal(false);
        expect(compiler.has('userRepository')).to.be.equal(false);

        const userService1 = compiler.compile('compilerPrivateService');
        const userService2 = compiler.compile('compilerPrivateService');

        expect(userService1 == userService2).to.be.equal(true);

        const userService3 = compiler.compile('compilerPrivateService');
        const userService4 = compiler.compile('compilerPrivateService');

        expect(userService3 == userService4).to.be.equal(true);

        expect(compiler.has('friendsRepository')).to.be.equal(false);
        expect(compiler.has('userRepository')).to.be.equal(false);
    });
});