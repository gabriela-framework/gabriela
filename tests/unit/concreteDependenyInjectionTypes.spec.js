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
                return {};
            }
        };

        const c = Compiler.create();

        c.add(depOne);
        c.add(depTwo);
        c.add(definition);

        c.compile('definition');
    });
});