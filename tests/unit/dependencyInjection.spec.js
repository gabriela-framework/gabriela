const mocha = require('mocha');
const chai = require('chai');

const it = mocha.it;
const describe = mocha.describe;
const expect = chai.expect;

const Compiler = require('./../../gabriela/dependencyInjection/compiler');

describe('Dependency injection tests | ', () => {
    it('should fail compiling a dependency', () => {
        const s1 = Symbol.for('key');
        const s2 = Symbol.for('key');

        console.log(s1 === s2);
        const userServiceInit = {
            name: 'userService',
            init: function() {
                // returns nothing
            }
        };

        const compiler = Compiler.create();

        compiler.add(userServiceInit);

        let entersException = false;
        try {
            compiler.compile('userService');
        } catch (err) {
            entersException = true;

            expect(err.message).to.be.equal(`Dependency injection error. Target service userService cannot be a falsy value`)
        }

        expect(entersException).to.be.true;

        entersException = false;
        try {
            compiler.compile('nonExistentService');
        } catch (err) {
            entersException = true;

            expect(err.message).to.be.equal(`Dependency injection error. nonExistentService not found in the dependency tree`)
        }

        expect(entersException).to.be.equal(true);


        entersException = false;
        try {
            compiler.add(1);
        } catch (err) {
            entersException = true;

            expect(err.message).to.be.equal(`Dependency injection error. 'init' dependency value must be an object`);
        }

        entersException = false;
        try {
            compiler.add({
                name: 1
            });
        } catch (err) {
            entersException = true;

            expect(err.message).to.be.equal(`Dependency injection error. Init object 'name' property must be a string`);
        }

        entersException = false;
        try {
            compiler.add({
                name: 'name',
                init: 1,
            });
        } catch (err) {
            entersException = true;

            expect(err.message).to.be.equal(`Dependency injection error. Init object 'init' property must be a function`);
        }

        const visibilities = ['module', 'plugin', 'public'];

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

        entersException = false;
        try {
            compiler.add({
                name: 'name',
                visibility: 'notValid',
                init: function() {
                    return () => {};
                },
            });
        } catch (err) {
            entersException = true;

            expect(err.message).to.be.equal(`Dependency injection error. 'visibility' property needs to be either 'module', 'plugin' or 'public'. If not specified, it is 'module' by default`);
        }

        expect(entersException).to.be.equal(true);

        entersException = false;
        try {
            compiler.compile(1);
        } catch (err) {
            entersException = true;


        }

        expect(entersException).to.be.true;

        let invalidService = {
            name: 1,
        };

        entersException = false;
        try {
            compiler.add(invalidService);
        } catch (err) {
            entersException = true;
        }

        expect(entersException).to.be.equal(true);
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
        expect(us1 == userService).to.be.true;
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

        expect(cs1 == commentService).to.be.true;
    });

    it('should resolve dependencies private to a module', () => {
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
    });
});