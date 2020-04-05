class Logging {
    outputMemory(str) {
        const heamUsed = (process.memoryUsage().heapUsed / 1024 / 1024).toFixed(2);
        const totalHeap = (process.memoryUsage().heapTotal / 1024 / 1024).toFixed(2);

        console.log(`${str}| Heap used: ${heamUsed}MB; Total heap used: ${totalHeap}MB`);
    }
}

module.exports = new Logging();
