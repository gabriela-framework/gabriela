const is = require('./is');

/**
 * Creates a range from start to end. Can be used with negative numbers. 
 */
module.exports = function (start, end, step) {
  if (!is("number", start)) throw new Error("range() invalid argument. First argument must be a number");
  if (!is("number", end)) throw new Error("range() invalid argument. Second argument must be a number");

  if (end < start)throw new Error(`range() invalid argument. 'end' cannot be lower than 'start'`);
  if (start === end) return [];

  let iterations = end - start;
  let isNegative = Math.sign(start);

  if (!step) return [...Array(iterations + 1).keys()].map(i => i + start);

  const result = [];

  while (iterations-- >= 0) {
    if (step) {
      if (isNegative === -1) {
        if (start % step === 0) {
          result.push(start);
        }
      } else if (start !== 0 && start % step === 0) {
        result.push(start);
      }
    } else {
      result.push(start);
    }

    ++start;
  }

  return result;
};