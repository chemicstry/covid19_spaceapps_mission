import * as PIXI from 'pixi.js';

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

PIXI.Graphics.prototype.drawDashLine = function(toX, toY, dash = 16, gap = 8) {
    const lastPosition = this.currentPath.points;

    const currentPosition = {
        x: lastPosition[lastPosition.length - 2] - dash/2 || 0,
        y: lastPosition[lastPosition.length - 1] - dash/2 || 0
    };

    const absValues = {
        toX: Math.abs(toX),
        toY: Math.abs(toY)
    };

    for (
        ;
        Math.abs(currentPosition.x) < absValues.toX ||
        Math.abs(currentPosition.y) < absValues.toY;
        ) {
        currentPosition.x =
            Math.abs(currentPosition.x + dash) < absValues.toX
            ? currentPosition.x + dash
            : toX;
        currentPosition.y =
            Math.abs(currentPosition.y + dash) < absValues.toY
            ? currentPosition.y + dash
            : toY;

        this.lineTo(currentPosition.x, currentPosition.y);

        currentPosition.x =
            Math.abs(currentPosition.x + gap) < absValues.toX
            ? currentPosition.x + gap
            : toX;
        currentPosition.y =
            Math.abs(currentPosition.y + gap) < absValues.toY
            ? currentPosition.y + gap
            : toY;

        this.moveTo(currentPosition.x, currentPosition.y);
    }
};
