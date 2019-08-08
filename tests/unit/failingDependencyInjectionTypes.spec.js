const mocha = require('mocha');
const chai = require('chai');
const requestPromise = require('request-promise');
const assert = require('assert');

const it = mocha.it;
const describe = mocha.describe;
const expect = chai.expect;

const Compiler = require('../../src/gabriela/dependencyInjection/compiler');

describe('Failing dependency injection types', () => {
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

    it('should fail if the object to be compiled does not have a valid argument interface', () => {
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
});