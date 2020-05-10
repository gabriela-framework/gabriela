const is = require('../misc/is');

/**
 * This iheritance pattern makes all objects created with the same prototype share the same prototype.
 * That means when one object changes the prototype (some property for example), it will be changed
 * for all instances that inherit from this prototype so keep that in mind. 
 */

module.exports = function(options) {
    const {parent, children} = options;

    if (!is('object', parent)) throw new Error(`delegate() invalid argument. 'parent' must be an object`);
    if (!is('array', children)) throw new Error(`delegate() invalid argument. 'children' must be an array of objects`);

    const objects = [];
    for (child of children) {
        const factory = (parent, child) => Object.assign(Object.create(parent), child);

        objects.push(factory(parent, child));
    }

    return objects;
}