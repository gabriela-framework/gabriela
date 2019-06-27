module.exports = {
    "env": {
        "es6": true,
        "node": true
    },
    "extends": "eslint:recommended",
    "globals": {
        "Atomics": "readonly",
        "SharedArrayBuffer": "readonly"
    },
    "parserOptions": {
        "ecmaVersion": 2018,
        "sourceType": "module"
    },
    "rules": {
        "accessor-pairs": ["error"],
        "block-scoped-var": ["error"],
        "require-await": ["warn"],
        "for-direction": ["error"],
        "getter-return": ["warn"],
        "no-compare-neg-zero": ["error"],
        "no-console": ["warn"],
        "no-dupe-args": ["error"],
        "object-shorthand": ["error"],
        "no-prototype-builtins": ["error"],
        "no-array-constructor": ["error"],
        "array-callback-return": ["error"],
        "prefer-destructuring": ["warn"],
        "prefer-template": ["error"],
        "template-curly-spacing": ["warn"],
        "wrap-iife": ["error"],
        "no-loop-func": ["error"],
        "no-new-func": ["error"],
        "no-param-reassign": ["error"],
        "prefer-spread": ["warn"],
        "dot-notation": ["warn"],
        "no-undef": ["error"],
        "prefer-const": ["error"],
        "no-multi-assign": ["error"],
        "no-unused-vars": ["error"],
        "no-mixed-operators": ["error"],
        "nonblock-statement-body-position": ["warn"],
        "no-else-return": ["warn"],
        "space-infix-ops": ["warn"],
        "no-multiple-empty-lines": ["warn"],
        "space-in-parens": ["warn"],
        "array-bracket-spacing": ["warn"],
        "comma-style": ["error"],
        "semi": ["error"],
        "no-new-wrappers": ["error"],
        "camelcase": ["error"],
        "no-restricted-globals": ["error"],
    }
};