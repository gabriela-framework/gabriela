var Logging = (function () {
    function Logging() {
    }
    Logging.prototype.outputMemory = function (str) {
        var heamUsed = (process.memoryUsage().heapUsed / 1024 / 1024).toFixed(2);
        var totalHeap = (process.memoryUsage().heapTotal / 1024 / 1024).toFixed(2);
        console.log(str + "| Heap used: " + heamUsed + "MB; Total heap used: " + totalHeap + "MB");
    };
    return Logging;
}());
module.exports = new Logging();
//# sourceMappingURL=Logging.js.map