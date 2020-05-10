const is = require('../misc/is');

/**
 * This inheritance pattern does not share the prototype. A new instance with a new prototype is created 
 * every time, hence the name classical inheritance.
 */

module.exports = function(parent, child) {
    if (!is('function', parent)) throw new Error(`classical() invalid argument. Both 'parent' and 'child' argument must be functions`);
    if (!is('function', child)) throw new Error(`classical() invalid argument. Both 'parent' and 'child' argument must be functions`);

    const tmp = function () {}
    tmp.prototype = parent.prototype;
    child.prototype = new tmp();
    child.prototype.constructor = child;
}