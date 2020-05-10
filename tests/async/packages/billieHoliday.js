const sequenceQueue = require('../async/sequenceQueue');
const limitedSequenceQueue = require('../async/limitedSequenceQueue');
const limitedBatchQueue = require('../async/limitedBatchQueue');
const batchQueue = require('../async/batchQueue');

function BillieHoliday() {
    this.sequenceQueue = sequenceQueue.bind(this);
    this.limitedSequenceQueue = limitedSequenceQueue.bind(this);
    this.limitedBatchQueue = limitedBatchQueue.bind(this);
    this.batchQueue = batchQueue.bind(this);
}

module.exports = new BillieHoliday();