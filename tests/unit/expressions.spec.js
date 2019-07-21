const mocha = require('mocha');
const chai = require('chai');

const it = mocha.it;
const describe = mocha.describe;
const expect = chai.expect;

const parseExpression = require('../../src/gabriela/expression/parse');

describe('Expressions tests', () => {
    it('should return function name and function arguments', () => {
        const expression = 'fn(arg1, arg2, arg3)';

        const result = parseExpression(expression);

        expect(result).to.have.property('fnName');
        expect(result).to.have.property('dependencies');

        expect(result.fnName).to.be.a('string');
        expect(result.dependencies).to.be.a('array');

        expect(result.dependencies.length).to.be.equal(3);
    });

    it('should return function name and an empty array of function arguments', () => {
        const expression = 'fn()';

        const result = parseExpression(expression);

        expect(result).to.have.property('fnName');
        expect(result).to.have.property('dependencies');

        expect(result.fnName).to.be.a('string');
        expect(result.dependencies).to.be.a('array');

        expect(result.dependencies.length).to.be.equal(0);
    });
});