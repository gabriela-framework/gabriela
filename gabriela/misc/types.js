const obj = {
    middlewareTypes: Object.freeze(['security', 'preLogicTransformers', 'validators', 'moduleLogic', 'postLogicTransformers']),
    asyncFlowTypes: Object.freeze(['next', 'done', 'skip', 'throwException']),
    httpMethods: Object.freeze(['get', 'put', 'post', 'patch', 'del', 'head']),
    mandatoryRouteProps: Object.freeze(['name', 'path', 'method'],)
};

module.exports = Object.freeze(obj);