const sharedPrototype = require('../inheritance/sharedPrototype');
const classical = require('../inheritance/classical');

function RollingStones() {
    this.sharedPrototype = sharedPrototype.bind(this);
    this.classical = classical.bind(this);
}

module.exports = new RollingStones();