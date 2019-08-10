const mocha = require('mocha');
const chai = require('chai');

const it = mocha.it;
const describe = mocha.describe;
const expect = chai.expect;

const {is, inArray, isEnvExpression} = require('../../src/gabriela/util/util');

describe('Utility functions and services tests', () => {
    it('should assert that is() evaluates all data types correctly', () => {
        const boolTrue = true;
        const boolFalse = false;
        const string = 'string';
        const float = 1.1;
        const stringObj = new String('mile');
        const boolObject = new Boolean(true);
        const obj = {};
        const objectInst = new Object();
        const func = new Function();
        const nan = NaN;
        const gen = function*() {};

        expect(is('boolean', boolTrue)).to.be.equal(true);
        expect(is('boolean', boolFalse)).to.be.equal(true);
        expect(is('string', string)).to.be.equal(true);
        expect(is('float', float)).to.be.equal(true);
        expect(is('string', stringObj)).to.be.equal(true);
        expect(is('boolean', boolObject)).to.be.equal(true);
        expect(is('object', obj)).to.be.equal(true);
        expect(is('object', objectInst)).to.be.equal(true);
        expect(is('function', func)).to.be.equal(true);
        expect(is('nan', nan)).to.be.equal(true);
        expect(is('generator', gen)).to.be.equal(true);
    });

    it('should return true or false if an one entry in an array is in another array', () => {
        let arg1 = ['next', 'skip'];
        let arg2 = ['done', 'skip', 'next'];

        expect(inArray(arg1, arg2)).to.be.equal(true);

        arg1 = ['next', 'skip'];
        arg2 = ['1', '2', '3'];

        expect(inArray(arg1, arg2)).to.be.equal(false);
    });

    it('should assert that isEnvExpression() correctly recognizes an environment variable', () => {
        expect(isEnvExpression(`ENV('CONFIG_VALUE')`)).to.be.equal(true);
        expect(isEnvExpression(`env('CONFIG_VALUE')`)).to.be.equal(true);
        expect(isEnvExpression(`ENV('config_value')`)).to.be.equal(true);
        expect(isEnvExpression(`EnV('ConFiG_value')`)).to.be.equal(true);
        expect(isEnvExpression(`En('ConFiG_value')`)).to.be.equal(false);
        expect(isEnvExpression(`EnV('ConFiG_value)`)).to.be.equal(false);
        expect(isEnvExpression(`EnV('ConFiG_value'`)).to.be.equal(false);
    });
});