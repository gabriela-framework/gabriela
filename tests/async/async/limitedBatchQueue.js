const is = require('../misc/is');

function spawn(metadata) {
    let {
      limit, 
      tasks, 
      onTaskDone,
      onQueueDepleted,
      onQueueFinished,
      onError,
      spawned,
      index,
      completed,
    } = metadata;

    while (spawned < limit && index < tasks.length) {
      const task = tasks[index];

      ++spawned;
      
      ++index;

      const promise = task().then((...rest) => {
          ++completed;

          if (onTaskDone) onTaskDone(...[rest, {completed: completed}]);
          // if all operations are completed, no need to go further since while() loop
          // was not executed because of index < tasks.length condition. Actually, no
          // need for return but it is better to put it here for additional safety
          if (completed === tasks.length && onQueueFinished) return onQueueFinished();
              // 'completed' and 'index' are in sync. 'spawned' is reset
              // in order for the loop to know how many operations has it currently spawned.
          if (completed === index) {
              spawned = 0;

              return spawn({...metadata, ...{
                spawned: spawned,
                index: index,
                completed: completed,
              }});
          }
      });

      if (onError) promise.catch(onError);

      // all tasks are spawned so we notifiy it. Mind you that there are still
      // operations in progress so this function always has be run before all
      // operations are finished.
      if (index === tasks.length && onQueueDepleted) return onQueueDepleted({
        completed: completed,
        remaining: tasks.length - completed,
      });
    }
}

function validate(metadata) {
    const {limit, tasks, onTaskDone, onQueueDepleted, onQueueFinished, onError} = metadata;

    if (!Number.isInteger(limit)) throw new Error(`limitedBatchQueue() invalid argument. limit should be an integer`);
    if (!Array.isArray(tasks)) throw new Error(`limitedBatchQueue() invalid argument. tasks should be an array`);

    if (onTaskDone) {
      if (!is('function', onTaskDone)) throw new Error(`limitedBatchQueue() invalid argument. onTaskDone should be a function`);
    } else metadata.taskDone = null;

    if (onQueueDepleted) {
      if (!is('function', onQueueDepleted)) throw new Error(`limitedBatchlQueue() invalid argument. onQueueDepleted should be a function`);
    } else metadata.onQueueDepleted = null;

    if (onQueueFinished) {
      if (!is('function', onQueueFinished)) throw new Error(`limitedBatchQueue() invalid argument. onQueueFinished should be a function`);
    } else metadata.onQueueFinished = null;
    
    if (onError) {
      if (!is('function', onError)) throw new Error(`limitedBatchQueue() invalid argument. onError should be a function`);
    } else metadata.onError = null;
}

/**
 * Spawns async promise objects with a limit in a batch. Only 'tasks' argument is required, everything else is optional.
 * For example, if given 20 processes to spawn, it will spawn 'limit' number of processes, wait until they complete and then
 * spawn the next 'limit' number. When all processes are finished, it calls onQueueFinished. In every other regard, it is
 * the same as batchQueue().
 * 
 * onTaskDone() is called after every task is done. Receives all the promise arguments and a 'completed' prop with the 
 * number of completed tasks so far.
 * 
 * onQueueDepleted() is called when all async tasks are initialized. This does not mean that they are completed. 
 * 
 * onQueueFinished() is called when all async tasks are finished
 * 
 * metadata: {
 *    [limit]: int : required
 *    [tasks]: array : required
 *    [onTaskDone] : function : optional
 *    [onQueueDepleted]: function : optional
 *    [onQueueFinished]: function : optional
 *    [onError]: function : optional
 * }
 */
module.exports = function (metadata) {
    validate(metadata);

    spawn({...metadata, ...{
      spawned: 0,
      index: 0,
      completed: 0,
    }});
}