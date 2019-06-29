module.exports = function callEvent(moduleOrPlugin, event) {
    if (moduleOrPlugin.hasMediators() && moduleOrPlugin.mediator[event]) {
        try {
            this.once(moduleOrPlugin.mediator[event]);
        } catch (e) {
            if (moduleOrPlugin.mediator.onError) {
                /**
                 * This is clumsy and should be reexamined in the future. once() function receives the customArgs
                 * argument which is not actually custom args but an array with a single error in it. 
                 * 
                 * there is acutally no point in explaining. 
                 * 
                 */

                // TODO: REEXAMINE AND REFACTOR HANDLING OF ERRORS AND DEPENDENCY INJECTION
                this.once(moduleOrPlugin.mediator.onError, [e]);
            } else {
                throw e;
            }
        }
    }
}