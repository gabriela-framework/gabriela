module.exports = function(expression) {
    const ARGUMENT_NAMES = /([^\s,]+)/g;
    const FN_NAME = /(^\w+\()/;

    let funcName = expression.match(FN_NAME);

    if (!funcName) throw new Error(`Invalid expression parsing. Cannot recognize function name in expression '${expression}'`);

    if (Array.isArray(funcName)) {
        if (!funcName[0]) throw new Error(`Invalid expression parsing. Cannot recognize function name in expression '${expression}'`);
    }

    funcName = funcName[0].substring(0, expression.indexOf('('));

    const deps = expression.slice(expression.indexOf('(')+1, expression.indexOf(')')).match(ARGUMENT_NAMES);

    return {
        fnName: funcName,
        dependencies: (deps) ? deps : [],
    }
};