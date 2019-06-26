function wait(cb) {
    return new Promise((resolve)=> {
        const check = () => {
            const res = cb();

            if (res.success) {
                return resolve(res.value);
            }

            setTimeout(check, 0);
        };

        setTimeout(check, 0);
    });
}

module.exports = wait;