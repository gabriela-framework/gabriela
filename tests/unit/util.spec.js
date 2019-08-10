const mocha = require('mocha');
const chai = require('chai');

const it = mocha.it;
const describe = mocha.describe;
const expect = chai.expect;

const {
    is,
    inArray,
    isEnvExpression,
    extractEnvExpression,
    isIterable,
    iterate,
    hasKey,
} = require('../../src/gabriela/util/util');

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

    it('should assert that extractEnvExpression() correctly returns a environment variable value', () => {
        const expression = `ENV('CONFIG_VALUE')`;

        expect(extractEnvExpression(expression)).to.be.equal('CONFIG_VALUE');
        expect(extractEnvExpression(`ENV('CONFIG_VALUE)`)).to.be.equal(null);
    });

    it('should assert that something is iterable', () => {
        expect(isIterable([])).to.be.equal(true);
        expect(isIterable({})).to.be.equal(true);
        expect(isIterable('string')).to.be.equal(false);
        expect(isIterable(null)).to.be.equal(false);
        expect(isIterable(false)).to.be.equal(false);
        expect(isIterable(new Boolean('true'))).to.be.equal(false);
        expect(isIterable(new String('string'))).to.be.equal(false);
        expect(isIterable(String('string'))).to.be.equal(false);
        expect(isIterable(Infinity)).to.be.equal(false);
        expect(isIterable(5)).to.be.equal(false);
    });

    it('should fail if iterate() receives invalid values', () => {
        expect(iterate('notIterable')).to.be.equal(false);

        const iterable = {
            config: {
                deep1: 'one',
                deep2: 'two',
                array: ['one', 'two'],
                object: {
                    deep21: 'two',
                    deep22: 'two',
                    array: [{
                        entry: 'array1',
                        entry1: 'array2'
                    }, ['val1', 'val2'], 'val', 3]
                }
            },
        };

        let entersException = false;
        try {
            iterate(iterable, 'notObject');
        } catch (e) {
            entersException = true;
            expect(e.message).to.be.equal(`Invalid options supplied to 'iterate'. 'options' must be an object with property 'reactTo' that must be an array of strings and 'reactor' that must be a function`);
        }

        expect(entersException).to.be.equal(true);

        entersException = false;
        try {
            iterate(iterable, {});
        } catch (e) {
            entersException = true;
            expect(e.message).to.be.equal(`Invalid options supplied to 'iterate'. 'options' must be an object with property 'reactTo' that must be an array of strings and 'reactor' that must be a function`);
        }

        expect(entersException).to.be.equal(true);

        entersException = false;
        try {
            iterate(iterable, {
                reactTo: {},
            });
        } catch (e) {
            entersException = true;
            expect(e.message).to.be.equal(`Invalid options supplied to 'iterate'. 'options' must be an object with property 'reactTo' that must be an array of strings and 'reactor' that must be a function`);
        }

        expect(entersException).to.be.equal(true);

        entersException = false;
        try {
            iterate(iterable, {
                reactTo: 'string',
                reactor: 'notFunction'
            });
        } catch (e) {
            entersException = true;
            expect(e.message).to.be.equal(`Invalid options supplied to 'iterate'. 'options' must be an object with property 'reactTo' that must be an array of strings and 'reactor' that must be a function`);
        }

        expect(entersException).to.be.equal(true);

        entersException = false;
        try {
            iterate(iterable, {
                reactTo: 'string',
                reactor: 'notFunction'
            });
        } catch (e) {
            entersException = true;
            expect(e.message).to.be.equal(`Invalid options supplied to 'iterate'. 'options' must be an object with property 'reactTo' that must be an array of strings and 'reactor' that must be a function`);
        }

        expect(entersException).to.be.equal(true);

        entersException = false;
        try {
            iterate(iterable, {
                reactTo: ['string'],
                reactor: 'notFunction'
            });
        } catch (e) {
            entersException = true;
            expect(e.message).to.be.equal(`Invalid options supplied to 'iterate'. 'options' must be an object with property 'reactTo' that must be an array of strings and 'reactor' that must be a function`);
        }

        expect(entersException).to.be.equal(true);

        const validReactions = ['string', 'array', 'object', 'bool', 'null'];
        entersException = false;
        try {
            iterate(iterable, {
                reactTo: ['invalid'],
                reactor() {

                }
            });
        } catch (e) {
            entersException = true;
            expect(e.message).to.be.equal(`Invalid options type supplied to 'iterate'. options.reactTo must be one of '${validReactions.join(', ')}'`);
        }

        expect(entersException).to.be.equal(true);
    });

    it('should iterate the provided values and change independent strings into some other string', () => {
        const iterable = {
            config: {
                deep1: 'one',
                deep2: 'two',
                array: ['one', 'two'],
                object: {
                    deep21: 'two',
                    deep22: 'two',
                    array: [{
                        entry: 'array1',
                        entry1: 'array2'
                    }, ['val1', 'val2'], 'val', 3]
                }
            },
        };

        iterate(iterable, {
            reactTo: ['string'],
            reactor(value) {
                return 'changed';
            }
        });

        expect(iterable.config.deep1).to.be.equal('changed');
        expect(iterable.config.deep2).to.be.equal('changed');
        expect(iterable.config.object.deep21).to.be.equal('changed');
        expect(iterable.config.object.deep22).to.be.equal('changed');
    });

    it('should iterate the provided iterable and change all independent true booleans to false as well as strings from previous test', () => {
        const iterable = {
            config: {
                deep1: 'one',
                deep2: 'two',
                array: ['one', 'two'],
                boolTrue: true,
                boolFalse: false,
                object: {
                    deep21: 'two',
                    deep22: 'two',
                    boolTrue: true,
                    boolFalse: false,
                    array: [{
                        entry: 'array1',
                        entry1: 'array2'
                    }, ['val1', 'val2'], 'val', 3]
                }
            },
        };

        iterate(iterable, {
            reactTo: ['bool', 'string'],
            reactor(value) {
                if (is('boolean', value)) {
                    if (value) return false;
                }

                if (is('string', value)) return 'changed';
            }
        });

        expect(iterable.config.deep1).to.be.equal('changed');
        expect(iterable.config.deep2).to.be.equal('changed');
        expect(iterable.config.object.deep21).to.be.equal('changed');
        expect(iterable.config.object.deep22).to.be.equal('changed');

        expect(iterable.config.boolTrue).to.be.equal(false);
        expect(iterable.config.object.boolTrue).to.be.equal(false);
    });

    it('should iterate the provided iterable and change all independent null values to false as well as strings and booleans from previous test', () => {
        const iterable = {
            config: {
                deep1: 'one',
                deep2: 'two',
                array: ['one', 'two'],
                someNull: null,
                boolTrue: true,
                boolFalse: false,
                object: {
                    deep21: 'two',
                    deep22: 'two',
                    boolTrue: true,
                    someNull: null,
                    boolFalse: false,
                    array: [{
                        entry: 'array1',
                        entry1: 'array2'
                    }, ['val1', 'val2'], 'val', 3]
                }
            },
        };

        iterate(iterable, {
            reactTo: ['bool', 'string', 'null'],
            reactor(value) {
                if (is('boolean', value)) {
                    if (value) return false;
                }

                if (value === null) return false;

                if (is('string', value)) return 'changed';
            }
        });

        expect(iterable.config.deep1).to.be.equal('changed');
        expect(iterable.config.deep2).to.be.equal('changed');
        expect(iterable.config.object.deep21).to.be.equal('changed');
        expect(iterable.config.object.deep22).to.be.equal('changed');

        expect(iterable.config.boolTrue).to.be.equal(false);
        expect(iterable.config.object.boolTrue).to.be.equal(false);

        expect(iterable.config.someNull).to.be.equal(false);
        expect(iterable.config.object.someNull).to.be.equal(false);
    });

    it('iterate() should change object values by reference', () => {
        const iterable = {
            config: {
                deep1: 'one',
                deep2: 'two',
                array: ['one', 'two'],
                someNull: null,
                boolTrue: true,
                boolFalse: false,
                object: {
                    deep21: 'two',
                    deep22: 'two',
                    boolTrue: true,
                    someNull: null,
                    boolFalse: false,
                    array: [{
                        entry: 'array1',
                        entry1: 'array2'
                    }, ['val1', 'val2'], 'val', 3]
                }
            },
        };

        iterate(iterable, {
            reactTo: ['object'],
            reactor(value) {
                if (hasKey(value, 'deep21')) {
                    value.deep21 = 'changed';
                    value.deep22 = 'changed';

                    value.array[0] = 'changed';
                }
            }
        });

        expect(iterable.config.object.deep21).to.be.equal('changed');
        expect(iterable.config.object.deep22).to.be.equal('changed');
        expect(iterable.config.object.array[0]).to.be.equal('changed');
    });
});