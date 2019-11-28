const is = require('./misc/is');
const sequenceQueue = require('./sequenceQueue');

function realSpawn(metadata) {
  let {limit, tasks, onTaskDone, onQueueFinished, onError, completed} = metadata;

    if (!onError) {
      onError = null;
    }

    const sequenceOptions = {
      tasks: tasks.slice((completed) ? completed + 1 : completed, limit + completed + 1),
      onComplete: () => {
        completed += limit;

        if (onQueueFinished) {
          if (completed === tasks.length && onQueueFinished) return onQueueFinished();
        }

        return realSpawn({...metadata, ...{completed: completed}});
      },
    };

    if (onTaskDone) {
      sequenceOptions.onTaskDone = (...rest) => {
        onTaskDone(...[rest]);
      };
    }

    sequenceQueue(sequenceOptions);
}

function validate(metadata) {
    const {limit, tasks, onTaskDone, onQueueFinished, onError} = metadata;

    if (!Number.isInteger(limit)) throw new Error(`limitedSequentialQueue() invalid argument. limit should be an integer`);
    if (!Array.isArray(tasks)) throw new Error(`limitedSequentialQueue() invalid argument. tasks should be an integer`);

    if (onTaskDone) {
      if (!is('function', onTaskDone)) throw new Error(`limitedSequentialQueue() invalid argument. onTaskDone should be a function`);
    } else metadata.taskDone = null;

    if (onQueueFinished) {
      if (!is('function', onQueueFinished)) throw new Error(`limitedSequentialQueue() invalid argument. onQueueFinished should be a function`);
    } else metadata.onQueueFinished = null;
    
    if (onError) {
      if (!is('function', onError)) throw new Error(`limitedSequentialQueue() invalid argument. onError should be a function`);
    } else metadata.onError = null;
}

/**
 * Only 'limi' and 'tasks' are required
 * 
 * Executes processes on after the other with a 'limit' of processes to execute in a batch. It is similar to limitedBatchQueue.js in
 * the sense that it executes processes with a limit per batch but this function executes them in a sequence, one after the other.
 * Under the hood, this function uses sequenceQueue() function. This function is useful when you have limited hardware resources and you
 * need to spawn a large number of them. With this function, you can limit the number of spawned resources within one batch of
 * processes.
 * 
 * onTaskDone() is called after a task has been coompleted
 * 
 * onQueueFinished() called when all processes are spawned and completed.
 * 
 * metadata: {
 *    [limit] : integer : required
 *    [tasks] : array : required
 *    [onTaskDone] : function : optional
 *    [onQueueFinished] : function : optional
 *    [onError] : function : optional
 * }
 */
module.exports = function (metadata) {
    validate(metadata);

    realSpawn({...metadata, ...{completed: 0}});
}