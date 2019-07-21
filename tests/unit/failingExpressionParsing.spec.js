const mocha = require('mocha');
const chai = require('chai');

const it = mocha.it;
const describe = mocha.describe;
const expect = chai.expect;

const parseExpression = require('../../src/gabriela/expression/parse');

describe('Failing expression parsing tests', () => {
    it('should fail to parse an invalid function expression', () => {
        const fn = 'arg = 0';

        let exceptionEntered = false;
        try {
            parseExpression(fn);
        } catch (e) {
            expect(e.message).to.be.equal(`Invalid expression parsing. Cannot recognize function name in expression '${fn}'`);

            exceptionEntered = true;
        }

        expect(exceptionEntered).to.be.equal(true);
    });
});