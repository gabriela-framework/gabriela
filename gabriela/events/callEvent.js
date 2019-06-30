module.exports = function callEvent(moduleOrPlugin, event) {
    if (moduleOrPlugin.hasMediators() && moduleOrPlugin.mediator[event]) {
        try {
            this.once(moduleOrPlugin.mediator[event]);
        } catch (e) {
            if (moduleOrPlugin.mediator.onError) {
                this.runOnError(moduleOrPlugin.mediator.onError, e);
            } else {
                throw e;
            }
        }
    }
};