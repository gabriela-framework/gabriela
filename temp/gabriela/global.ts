type fn<T> = (key: string, v: T) => boolean;

/**
 * Filters an object and returns a new object. The supplied object is left untouched.
 * If predicate returns true, that entry is saved into the new object that is returned
 * to the calling code.
 *
 * References are not broken. If you filter out inner object, references to the supplied object are
 * held intact.
 * @param obj
 * @param predicate
 */
function filterObject<T>(obj: Record<string, T>, predicate: fn<T>): Record<string, T> {
    const keys = Object.keys(obj);
    const newObj: Record<string, T> = {};

    keys.filter((key) => {
        const ok = predicate(key, obj[key]);

        if (ok) newObj[key] = obj[key];
    });

    return newObj;
};

export default filterObject;