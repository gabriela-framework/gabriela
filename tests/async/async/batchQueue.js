const is = require('../misc/is');
const loopGenerator = require('../misc/loopGenerator');

function spawn(metadata) {
    let {
      tasks, 
      onTaskDone,
      onQueueDepleted,
      onQueueFinished,
      onError,
      completed,
      spawned,
    } = metadata;

    const gen = loopGenerator(tasks);

    let task;
    while(!(task = gen.next()).done) {
        const promise = task.value();

        promise.then((...rest) => {
            ++completed;
  
            if (onTaskDone) onTaskDone(...[rest, {completed: completed}]);

            // if all processes are completed, execute onQueueFinished(). This code
            // executes when all tasks are sent and completed
            if (completed === tasks.length && onQueueFinished) return onQueueFinished();
        });

        if (onError) promise.catch(onError);

        // spawned variable has the number of spawned (NOT completed) processes.
        ++spawned;

        // all tasks are spawned so we notifiy it. Mind you that there are still
        // operations in progress so this function always has be run before all
        // operations are finished.
        if (spawned === tasks.length && onQueueDepleted) return onQueueDepleted({
          completed: completed,
          remaining: tasks.length - completed,
        });
    }
}

function validate(metadata) {
    const {tasks, onTaskDone, onQueueDepleted, onQueueFinished, onError} = metadata;

    if (!Array.isArray(tasks)) throw new Error(`batchQueue() invalid argument. tasks should be an array`);

    if (onTaskDone) {
      if (!is('function', onTaskDone)) throw new Error(`batchQueue() invalid argument. onTaskDone should be a function`);
    } else metadata.taskDone = null;

    if (onQueueDepleted) {
      if (!is('function', onQueueDepleted)) throw new Error(`batchQueue() invalid argument. onQueueDepleted should be a function`);
    } else metadata.onQueueDepleted = null;

    if (onQueueFinished) {
      if (!is('function', onQueueFinished)) throw new Error(`batchQueue() invalid argument. onQueueFinished should be a function`);
    } else metadata.onQueueFinished = null;
    
    if (onError) {
      if (!is('function', onError)) throw new Error(`batchQueue() invalid argument. onError should be a function`);
    } else metadata.onError = null;
}

/**
 * Spawns async promise objects as much as it is given. Only 'tasks' argument is required, everything else is optional.
 * 
 * onTaskDone() is called after every task is done. Receives all the promise arguments and a 'completed' prop with the 
 * number of completed tasks so far.
 * 
 * onQueueDepleted() is called when all async tasks are initialized. This does not mean that they are completed. 
 * 
 * onQueueFinished() is called when all async tasks are finished
 * 
 * metadata: {
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
      completed: 0,
      spawned: 0,
    }});
}