module.exports = function callEvent(moduleOrPlugin, event, args) {
    if (moduleOrPlugin.hasMediators() && moduleOrPlugin.mediator[event]) {
        try {
            this.once(moduleOrPlugin.mediator[event], args);
        }
        catch (e) {
            if (moduleOrPlugin.mediator.onError) {
                this.runOnError(moduleOrPlugin.mediator.onError, e);
            }
            else {
                throw e;
            }
        }
    }
};
//# sourceMappingURL=callEvent.js.map