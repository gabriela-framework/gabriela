const is = require('./is');

/**
 * Check if the HTTP status code is within a certain range
 * 
 * [val] : integer
 * [first] : integer
 * [second] : integer
 * 
 * For example, it can check if 205 is in range of 200 and 299 | inHttpRange(205, 200, 299);
 */
module.exports = function (val, first, second) {
  if (!Number.isInteger(val)) throw new Error(`inHttpRange() invalid argument. 'val' must be an integer`);
  if (!Number.isInteger(first)) throw new Error(`inHttpRange() invalid argument. 'first' must be an integer`);
  if (!Number.isInteger(second)) throw new Error(`inHttpRange() invalid argument. 'second' must be an integer`);

  return val >= first && val <= second;
};