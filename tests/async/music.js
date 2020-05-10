const ladyGaga = require('./packages/ladyGaga');
const billieHoliday = require('./packages/billieHoliday');
const rollingStones = require('./packages/rollingStones');

function Music() {
    this.ladyGaga = ladyGaga;
    this.billieHoliday = billieHoliday;
    this.rollingStones = rollingStones;
}

module.exports = new Music();