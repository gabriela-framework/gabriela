module.exports = function _waitCheck(taskRunner) {
    var task = taskRunner.getTask();
    if (task) {
        return {
            success: true,
            value: task
        };
    }
    return { success: false };
};
//# sourceMappingURL=_waitCheck.js.map