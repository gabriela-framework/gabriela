const {iterate, hasKey} = require('./src/gabriela/util/util');

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
            console.log(value);
            value.deep21 = 'changed';
            value.deep22 = 'changed';

            value.array[0] = 'changed';
        }
    }
});

