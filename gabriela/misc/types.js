const obj = Object.defineProperties({}, {
    middlewareTypes: {
        value: ['security', 'preLogicTransformers', 'validators', 'moduleLogic', 'postLogicTransformers'],
        writable: false,
    },
    asyncFlowTypes: {
        value: ['next', 'done', 'skip', 'throwException'],
        writable: false,
    }
});

module.exports = Object.freeze(obj);