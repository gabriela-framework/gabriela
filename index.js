class Base {
    *[Symbol.iterator]() {
        const entries = Object.values(this);

        for (const entry of entries) {
            yield entry;
        }
    };

    toArray() {
        return Object.values(this);
    }
}

class MiddlewareTypes extends Base{
    SECURITY = 'security';
    PRE_LOGIC_TRANSFORMERS = 'preLogicTransformers';
    VALIDATORS = 'validators';
    MODULE_LOGIC = 'moduleLogic';
    POST_LOGIC_TRANSFORMERS = 'postLogicTransformers';
}