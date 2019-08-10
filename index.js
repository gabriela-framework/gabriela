const {extractEnvExpression} = require('./src/gabriela/util/util');

console.log(extractEnvExpression(`env('CONFIG_VALUE')`));