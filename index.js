const {iterate} = require('./src/gabriela/util/util');

const config = {
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

iterate(config, {
    reactTo: ['string'],
    reactor(value) {
        return 'changed'
    }
});

console.log(config);