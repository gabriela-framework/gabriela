const is = require('../misc/is');
const loopGenerator = require('../misc/loopGenerator');

function validate(tasks, onTaskDone, onComplete, onError) {

  if (!Array.isArray(tasks)) throw new TypeError(`sequence() invalid argument: tasks argument must be an array of functions`);

  if (onTaskDone) {
    if (!is("function", onTaskDone)) throw new TypeError(`squence() invalid argument: onTaskDone argument must be a function`);
  }

  if (onComplete) {
    if (!is("function", onComplete)) throw new TypeError(`sequence() invalid argument: onComplete argument must be a function`);
  }

  if (onError) {
    if (!is("function", onError)) throw new TypeError(`sequence() invalid argument: onError argument must be a function`);
  }

  for (const task of tasks) {
    if (!is("function", task)) throw new TypeError(`sequence() invalid argument: tasks argument must be an array of functions`);
  }
}

/**
 * Executes processes on after the other. After they all complete, it calls onComplete() function. Only 'tasks' argument
 * is mandatory. This function is recursive so it can receive as much as tasks as your computer can handle it since recursion
 * is executed on the stack memory
 * 
 * metadata: {
 *    [tasks] : array : required
 *    [onTaskDone] : function : optional
 *    [onComplete] : function : optional
 *    [onError] : function : optional
 * }
 */
module.exports = function (metadata) {
  const {tasks, onTaskDone, onComplete, onError} = metadata;

  validate(tasks, onTaskDone, onComplete, onError);

  if (tasks.length === 0) return this;

  // all tasks are now in a generator. Every next() now yields a new promise
  const gen = loopGenerator(tasks);

  function handler(promise) {
    promise.then((...rest) => {
      if (onTaskDone) onTaskDone(...[rest]);

      const yielded = gen.next();

      if (!yielded.done) {
        const promise = yielded.value();

        // when a task is done, the next one is called
        return handler(promise);
      }

      // when all tasks are done, onComplete() is called
      if (yielded.done) {
        if (onComplete) return onComplete();
      }

    });

    if (onError) promise.catch(onError);
  }

  handler(gen.next().value());

  return this;
};