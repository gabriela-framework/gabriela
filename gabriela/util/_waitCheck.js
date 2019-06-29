module.exports = function _waitCheck(taskRunner) {
    const task = taskRunner.getTask();

    if (task) {
        return {
            success: true,
            value: task,
        };
    }

    return {success: false};
};