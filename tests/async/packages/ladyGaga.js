const inHttpRange = require('../misc/inHttpRange');
const is = require("../misc/is");
const ucFirst = require('../misc/ucFirst');
const range = require('../misc/range');
const loopGenerator = require('../misc/loopGenerator');
const parseHostname = require('../misc/parseHostname');
const objectDiff = require('../misc/objectDiff');
const empty = require('../misc/empty');

function Misc() {
    this.inHttpStatusRange = inHttpRange.bind(this);
    this.is = is.bind(this);
    this.ucFirst = ucFirst.bind(this);
    this.range = range.bind(this);
    this.loopGenerator = loopGenerator.bind(this);
    this.parseHostname = parseHostname.bind(this);
    this.objectDiff = objectDiff.bind(this);
    this.empty = empty.bind(this);
}

module.exports = new Misc();