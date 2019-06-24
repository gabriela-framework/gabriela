module.exports = function(array1, array2) {
    for (const entry of array1) {
        if (array2.includes(entry)) return true;
    }

    return false;
};