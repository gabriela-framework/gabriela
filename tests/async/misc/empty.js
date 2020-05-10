const is = require('./is');

function assertIterator(value) {
    let item;

    // if an iterator has only one item, it is not empty
    while(!(item = value.next()).done) {
        return false;
    }

    return true;
}

/**
 * Check if an array, iterator or an enumerable is empty or not. Supports arrays, objects, iterators and generators.
 * 
 * [value] : any
 * 
 * Returns true if the 'value' is empty, false otherwise.
 */
module.exports = function(value) {
    // is an iterator
    if(is('generator', value)) {
        return assertIterator(value);
    }

    if (value.hasOwnProperty('next') && is('function', value.next)) {
        return assertIterator(value);
    }

    if (is('object', value)) {
        for (let val in value) {
            if (val) {
                return false;
            }
        }

        return true;
    }

    if (Array.isArray(value)) {
        return value.length === 0;
    }

    throw new Error(`empty() invalid argument. 'value' must be an enumerable (an array, object or a data structure is an iterator)`);
}