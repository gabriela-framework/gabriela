class Base {
    *[Symbol.iterator]() {
        const entries = Object.values(this);

        for (const entry of entries) {
            yield entry;
        }
    };

    toArray() {
        return Object.values(this);
    }
}


const obj = Object.create(new Base());

obj.name = 'name';
obj.lastName = 'lastname';