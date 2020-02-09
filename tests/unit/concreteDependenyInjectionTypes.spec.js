const mocha = require('mocha');
const chai = require('chai');

const it = mocha.it;
const describe = mocha.describe;
const expect = chai.expect;

const Compiler = require('../../src/gabriela/dependencyInjection/compiler');

describe('Dependency injection types', () => {
    it('should resolve a dependency with property injection', () => {
        const depOne = {
            name: 'depOne',
            init: function() {
                return {name: 'depOne'};
            }
        };

        const depTwo = {
            name: 'depTwo',
            init: function() {
                return {name: 'depTwo'};
            }
        };

        const definition = {
            name: 'definition',
            init: function() {
                return this.withPropertyInjection({}).bind({
                    depOne: 'depOne',
                    depTwo: 'depTwo',
                });
            }
        };

        const c = Compiler.create();

        c.add(depOne);
        c.add(depTwo);
        c.add(definition);

        const dep = c.compile('definition', c);

        expect(dep).to.be.a('object');
        expect(dep.depOne).to.be.a('object');
        expect(dep.depTwo).to.be.a('object');
    });

    it('should resolve a dependency with method injection', () => {
        const depOne = {
            name: 'depOne',
            init: function() {
                return {name: 'depOne'};
            }
        };

        const depTwo = {
            name: 'depTwo',
            init: function() {
                return {name: 'depTwo'};
            }
        };

        const definition = {
            name: 'definition',
            init: function() {
                const obj = {
                    _depOne: null,
                    _depTwo: null,
                    setDepOne(depOne) {
                        this._depOne = depOne;
                    },
                    setDepTwo(depTwo) {
                        this._depTwo = depTwo;
                    }
                };

                return this.withMethodInjection(obj).bind({
                    setDepOne: 'depOne',
                    setDepTwo: 'depTwo',
                });
            }
        };

        const c = Compiler.create();

        c.add(depOne);
        c.add(depTwo);
        c.add(definition);

        const dep = c.compile('definition', c);

        expect(dep).to.be.a('object');
        expect(dep._depOne).to.be.a('object');
        expect(dep._depTwo).to.be.a('object');
    });

    it('should resolve a service with constructor injection with empty arguments', () => {
        const definition = {
            name: 'definition',
            init: function() {
                function Service() {

                }

                return this.withConstructorInjection(Service).bind();
            }
        };

        const c = Compiler.create();

        c.add(definition);

        const dep = c.compile('definition', c);

        expect(dep).to.be.a('object');
    });

    it('should resolve a service with constructor injection with inner dependencies', () => {
        const depOne = {
            name: 'depOne',
            init: function() {
                return {name: 'depOne'};
            }
        };

        const depTwo = {
            name: 'depTwo',
            init: function() {
                return {name: 'depTwo'};
            }
        };

        const definition = {
            name: 'definition',
            init: function() {
                function Dependency(depOne, depTwo) {
                    this.depOne = depOne;
                    this.depTwo = depTwo;
                }

                return this.withConstructorInjection(Dependency).bind('depOne', 'depTwo');
            }
        };

        const c = Compiler.create();

        c.add(depOne);
        c.add(depTwo);
        c.add(definition);

        const dep = c.compile('definition', c);

        expect(dep).to.be.a('object');
        expect(dep.depOne).to.be.a('object');
        expect(dep.depTwo).to.be.a('object');
    });

    it('should resolve a service with constructor injection by using a class construct', () => {
        const depOne = {
            name: 'depOne',
            init: function() {
                return {name: 'depOne'};
            }
        };

        const depTwo = {
            name: 'depTwo',
            init: function() {
                return {name: 'depTwo'};
            }
        };

        const definition = {
            name: 'definition',
            init: function() {
                const Dependency = class {
                    constructor(depOne, depTwo) {
                        this.depOne = depOne;
                        this.depTwo = depTwo;
                    }
                };

                return this.withConstructorInjection(Dependency).bind('depOne', 'depTwo');
            }
        };

        const c = Compiler.create();

        c.add(depOne);
        c.add(depTwo);
        c.add(definition);

        const dep = c.compile('definition', c);

        expect(dep).to.be.a('object');
        expect(dep.depOne).to.be.a('object');
        expect(dep.depTwo).to.be.a('object');
    });
});