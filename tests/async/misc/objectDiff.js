const is = require('./is');
const loopGenerator = require('./loopGenerator');

/**
 * Returns an array of properties that are different for every object
 */
module.exports = function(...rest) {
    const objectMap = {};

    const restGen = loopGenerator(rest);

    let item;
    while(!(item = restGen.next()).done) {
        if (!is('object', item)) throw new Error('objectDiff() invalid argument. Every entry bust be an enumerable object');
        for (let key in item.value) {
            if (!objectMap.hasOwnProperty(key)) {
                objectMap[key] = {count: 1};
            } else {
                objectMap[key].count++;
            }
        }
    }

    return Array.from(
        new Set(
            Object.entries(objectMap)
                .filter((val) => val[1].count !== 1)
                .map((val) => val[0])
        )
    );
}