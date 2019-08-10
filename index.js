const REGEX = /env\(\'\w+\'\)/i;

const assertion = REGEX.test(`env('CONFIG_VALUE')`);

console.log(assertion);
console.log(`env('CONFIG_VALUE')`.match(REGEX));