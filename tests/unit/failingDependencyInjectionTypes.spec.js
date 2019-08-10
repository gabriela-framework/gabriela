const mocha = require('mocha');
const chai = require('chai');
const requestPromise = require('request-promise');
const assert = require('assert');

const it = mocha.it;
const describe = mocha.describe;
const expect = chai.expect;

const Compiler = require('../../src/gabriela/dependencyInjection/compiler');

describe('Failing dependency injection types', () => {
    it('should fail if the argument is an empty object for property injection', () => {
        const definition = {
            name: 'definition',
            init: function() {
                this.withPropertyInjection({}).bind({});
            }
        };

        const depOne = {
            name: 'depOne',
            init: function() {
                return {};
            }
        };

        const c = Compiler.create();

        c.add(depOne);
        c.add(definition);

        try {
            c.compile('definition');
        } catch (e) {
            expect(e.message).to.be.equal(`Invalid property injection. If you choose to use method injection, you have to provide methods and services to bind with the bind() method`);
        }
    });

    it('should fail if the object to be compiled is not an object for property dependency injection', () => {
        const definition = {
            name: 'definition',
            init: function() {
                this.withPropertyInjection('notObject');
            }
        };

        const depOne = {
            name: 'depOne',
            init: function() {
                return {};
            }
        };

        const c = Compiler.create();

        c.add(depOne);
        c.add(definition);

        try {
            c.compile('definition');
        } catch (e) {
            expect(e.message).to.be.equal(`Invalid property injection. Injecting argument must be an object`);
        }
    });

    it('should fail if the object to be compiled does not have a object bounded properties for property injection', () => {
        const definition = {
            name: 'definition',
            init: function() {
                this.withPropertyInjection({}).bind('non object');
            }
        };

        const depOne = {
            name: 'depOne',
            init: function() {
                return {};
            }
        };

        const c = Compiler.create();

        c.add(depOne);
        c.add(definition);

        try {
            c.compile('definition');
        } catch (e) {
            expect(e.message).to.be.equal(`Invalid property injection. Arguments to be bound must be an object with key -> property name on the service object and value -> service name as string`);
        }
    });

    it('should fail if the object to be compiled does not have a valid argument interface for property injection', () => {
        const definition = {
            name: 'definition',
            init: function() {
                this.withPropertyInjection({}).bind({
                    prop: {}
                });
            }
        };

        const depOne = {
            name: 'depOne',
            init: function() {
                return {};
            }
        };

        const c = Compiler.create();

        c.add(depOne);
        c.add(definition);

        try {
            c.compile('definition');
        } catch (e) {
            expect(e.message).to.be.equal(`Invalid property injection. Arguments to be bound must be an object with key -> property name on the service object and value -> service name as string`);
        }
    });

    it('should fail if the object to be compiled does not have a valid argument interface for method injection', () => {
        const definition = {
            name: 'definition',
            init: function() {
                const obj = {
                    depOne: null,
                    setDepOne(depOne) {
                        this.depOne = depOne;
                    }
                };

                this.withMethodInjection(obj).bind('notObject');
            }
        };

        const depOne = {
            name: 'depOne',
            init: function() {
                return {};
            }
        };

        const c = Compiler.create();

        c.add(depOne);
        c.add(definition);

        try {
            c.compile('definition');
        } catch (e) {
            expect(e.message).to.be.equal(`Invalid method injection. Arguments to be bound must be an object with key -> method name on the service object and value -> service name as string`);
        }
    });

    it('should fail if the object to be compiled does not have a valid argument interface for method injection', () => {
        const definition = {
            name: 'definition',
            init: function() {
                const obj = {
                    depOne: null,
                    setDepOne(depOne) {
                        this.depOne = depOne;
                    }
                };

                this.withMethodInjection(obj).bind({});
            }
        };

        const depOne = {
            name: 'depOne',
            init: function() {
                return {};
            }
        };

        const c = Compiler.create();

        c.add(depOne);
        c.add(definition);

        try {
            c.compile('definition');
        } catch (e) {
            expect(e.message).to.be.equal(`Invalid method injection. If you choose to use method injection, you have to provide methods and services to bind with the bind() method`);
        }
    });

    it('should fail if the argument object does not have a string service value with method injection', () => {
        const definition = {
            name: 'definition',
            init: function() {
                const obj = {
                    depOne: null,
                    setDepOne(depOne) {
                        this.depOne = depOne;
                    }
                };

                this.withMethodInjection(obj).bind({
                    setDepOne: {},
                });
            }
        };

        const depOne = {
            name: 'depOne',
            init: function() {
                return {};
            }
        };

        const c = Compiler.create();

        c.add(depOne);
        c.add(definition);

        try {
            c.compile('definition');
        } catch (e) {
            expect(e.message).to.be.equal(`Invalid method injection. Arguments to be bound must be an object with key -> method name on the service object and value -> service name as string`);
        }
    });

    it('should fail if the argument objects key is not a valid method with method injection', () => {
        const definition = {
            name: 'definition',
            init: function() {
                const obj = {
                    depOne: null,
                    setDepOne(depOne) {
                        this.depOne = depOne;
                    }
                };

                this.withMethodInjection(obj).bind({
                    nonExistentMethod: 'depOne',
                });
            }
        };

        const depOne = {
            name: 'depOne',
            init: function() {
                return {};
            }
        };

        const c = Compiler.create();

        c.add(depOne);
        c.add(definition);

        try {
            c.compile('definition');
        } catch (e) {
            expect(e.message).to.be.equal(`Invalid method injection. Method 'nonExistentMethod' does not exist`);
        }
    });

    it('should fail if the argument objects key is not a valid method with method injection', () => {
        const definition = {
            name: 'definition',
            init: function() {
                const obj = {
                    depOne: null,
                    setDepOne: {},
                };

                this.withMethodInjection(obj).bind({
                    setDepOne: 'depOne',
                });
            }
        };

        const depOne = {
            name: 'depOne',
            init: function() {
                return {};
            }
        };

        const c = Compiler.create();

        c.add(depOne);
        c.add(definition);

        try {
            c.compile('definition');
        } catch (e) {
            expect(e.message).to.be.equal(`Invalid method injection. Method 'setDepOne' must be a function type`);
        }
    });

    it('should fail if the constructing object is not a function or a class', () => {
        const definition = {
            name: 'definition',
            init: function() {
                this.withConstructorInjection({}).bind({});
            }
        };

        const depOne = {
            name: 'depOne',
            init: function() {
                return {};
            }
        };

        const c = Compiler.create();

        c.add(depOne);
        c.add(definition);

        try {
            c.compile('definition');
        } catch (e) {
            expect(e.message).to.be.equal(`Invalid constructor injection. Injecting argument must be a function or a class`);
        }
    });

    it('should fail if the argument to be bound are not string services for constructor injection', () => {
        const definition = {
            name: 'definition',
            init: function() {
                function ConstructorInjection(depOne) {

                }

                this.withConstructorInjection(ConstructorInjection).bind({});
            }
        };

        const depOne = {
            name: 'depOne',
            init: function() {
                return {};
            }
        };

        const c = Compiler.create();

        c.add(depOne);
        c.add(definition);

        try {
            c.compile('definition');
        } catch (e) {
            expect(e.message).to.be.equal(`Invalid constructor injection. Arguments to be bound must a service as a string`);
        }
    });
});