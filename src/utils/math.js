export function random(a, b) {
    return Math.random() * (b - a) + a;
}

export function randomInt(a, b) {
    return Math.floor(Math.random() * (b - a) + a);
}

export function inRange(x, min, max) {
    return ((x-min)*(x-max) <= 0); // same as (x >= min && x <= max), but only 1 comparison
}

export function padNumber(num, size) {
    var s = num + "";
    while (s.length < size) s = "0" + s;
    return s;
}

export function limit(num, min, max) {
    return Math.max(min, Math.min(max, num));
}

/**
 * Shuffles array in place. ES6 version
 * @param {Array} a items An array containing the items.
 */
export function shuffle(a) {
    for (let i = a.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
}
