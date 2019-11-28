const ucFirst = require('./ucFirst');

/**
 * Check if a 'val' is of certain type
 * 
 * Can check array, object, integer, float and generator.
 * 
 * For array, Array.isArray() is advised to be used. For integers, Number.isInteger() is advised to be used
 * 
 * [type] : string : required
 * [val] : any : required
 */
module.exports = function (type, val) {
  const res = `[object ${ucFirst(type)}]`;

  if (type === "float") {
    return val === +val && val !== (val | 0);
  }

  if (type === 'generator') {
      return /\[object Generator|GeneratorFunction\]/.test(Object.prototype.toString.call(val));
  }

  if (type.toLowerCase() === "nan") {
    return val !== val;
  }

  return Object.prototype.toString.call(val) === res;
};