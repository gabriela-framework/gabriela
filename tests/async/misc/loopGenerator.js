/**
 * Creates a generator from an iterable
 */
module.exports = function* (tasks) {
    for (let i = 0; i < tasks.length; i++) {
        yield tasks[i];
    }
}