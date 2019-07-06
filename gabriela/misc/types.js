const obj = {
    middlewareTypes: Object.freeze(['security', 'preLogicTransformers', 'validators', 'moduleLogic', 'postLogicTransformers']),
    asyncFlowTypes: Object.freeze(['next', 'done', 'skip', 'throwException']),
};

module.exports = Object.freeze(obj);